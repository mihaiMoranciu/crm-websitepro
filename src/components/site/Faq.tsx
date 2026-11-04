import React from 'react'
import { Text } from '@radix-ui/themes'
import { ChevronDown } from 'lucide-react'

import { TYPE } from '@/design/type'

export type FaqItem = { id?: string | null; question: string; answer: string }

/**
 * Questions and answers as native disclosure rows: closed by default, open
 * on click, readable without JavaScript. Pair it with faqSchema() so the same
 * questions reach search engines.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-frame border-y border-frame">
      {items.map((item) => (
        <details key={item.id ?? item.question} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
            <Text size={TYPE.body} weight="medium">
              {item.question}
            </Text>
            <ChevronDown
              size={18}
              strokeWidth={1.5}
              aria-hidden
              className="shrink-0 text-(--gray-9) transition-transform group-open:rotate-180"
            />
          </summary>
          <Text as="p" size={TYPE.body} color="gray" mt="3" className="whitespace-pre-line">
            {item.answer}
          </Text>
        </details>
      ))}
    </div>
  )
}
