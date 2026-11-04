'use client'

import { useCallback } from 'react'
import { useDocumentInfo, useForm, useFormModified, useServerFunctions } from '@payloadcms/ui'

/**
 * Reads the reason out of a failed response, whichever side wrote it: our own
 * endpoints answer with `error`, while a hook that refuses the write surfaces
 * through Payload's own `errors` envelope.
 */
export const errorMessage = (body: any, fallback: string): string =>
  body?.error ?? body?.errors?.[0]?.message ?? body?.message ?? fallback

/**
 * Brings the open form back in line with the document after something changed
 * it on the server behind the form's back: a send, a payment, a generated
 * invoice.
 *
 * The form keeps its own copy of every field and submits all of them on save,
 * so a copy left stale is not only shown wrong, it is written back. This does
 * what the panel itself does after a save: reload the document, recompute the
 * field permissions (which is what locks the lines once an invoice is sent)
 * and rebuild the form state from the two.
 *
 * With unsaved edits in the form a rebuild would throw them away, so only the
 * named server-owned fields are refreshed and the rest is left alone.
 */
export function useReloadDocument() {
  const { id, collectionSlug, docPermissions, getDocPermissions, getDocPreferences, setData } =
    useDocumentInfo()
  const { getFormState } = useServerFunctions()
  const { dispatchFields, setModified } = useForm()
  const modified = useFormModified()

  return useCallback(
    async (paths: string[] = []) => {
      if (!id || !collectionSlug) return

      try {
        const res = await fetch(`/api/${collectionSlug}/${id}?depth=0`, { credentials: 'include' })
        if (!res.ok) return
        const doc = (await res.json()) as Record<string, unknown>

        // Also moves the panel's notion of "last known version" forward, so
        // the next edit is not reported as a conflict with our own action.
        setData(doc)

        if (modified) {
          for (const path of paths) {
            dispatchFields({ type: 'UPDATE', path, value: doc[path] ?? null, valid: true })
          }
          return
        }

        await getDocPermissions(doc)
        const docPreferences = await getDocPreferences()

        const result = await getFormState({
          id,
          collectionSlug,
          data: doc,
          docPermissions,
          docPreferences,
          operation: 'update',
          renderAllFields: true,
          schemaPath: collectionSlug,
          skipValidation: true,
        })

        if (result && 'state' in result && result.state) {
          dispatchFields({
            type: 'REPLACE_STATE',
            optimize: false,
            sanitize: true,
            state: result.state,
          })
          setModified(false)
        }
      } catch {
        // The form stays as it was; a manual reload still shows the truth.
      }
    },
    [
      id,
      collectionSlug,
      docPermissions,
      getDocPermissions,
      getDocPreferences,
      setData,
      getFormState,
      dispatchFields,
      setModified,
      modified,
    ],
  )
}
