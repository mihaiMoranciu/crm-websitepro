import React, { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Heading, Text } from '@radix-ui/themes'
import { ArrowLeft } from 'lucide-react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Section } from '@/components/site/Frame'
import { Faq } from '@/components/site/Faq'
import { JsonLd } from '@/components/site/JsonLd'
import { QuoteButton } from '@/components/site/QuoteButton'
import { TYPE } from '@/design/type'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { formatDate, readingMinutes } from '@/utilities/postText'
import { buildMeta } from '@/utilities/seo'
import { articleSchema, breadcrumbSchema, faqSchema } from '@/utilities/structuredData'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return posts.docs.map(({ slug }) => ({ slug }))
}

type Args = { params: Promise<{ slug?: string }> }

/** One post by its address; drafts too while previewing from the admin. */
const getPost = cache(async (slug: string) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    draft,
    depth: 1,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] ?? null
})

const imageUrl = (image: unknown) =>
  image && typeof image === 'object' && 'url' in image && typeof image.url === 'string'
    ? getMediaUrl(image.url)
    : undefined

/**
 * A blog post: date and title over the picture, the text set for reading,
 * the questions and answers under it, and one way to get in touch.
 */
export default async function PostPage({ params }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await params
  const post = await getPost(decodeURIComponent(slug))
  if (!post) notFound()

  const path = `/blog/${post.slug}`
  const faq = post.faq ?? []
  const authors = (post.populatedAuthors ?? []).map((a) => a.name).filter(Boolean) as string[]

  return (
    <article>
      {draft ? <LivePreviewListener /> : null}
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            description: post.meta?.description,
            path,
            image: imageUrl(post.heroImage),
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            authors,
          }),
          breadcrumbSchema([
            { name: 'Blog', path: '/blog' },
            { name: post.title, path },
          ]),
          ...(faq.length ? [faqSchema(faq)] : []),
        ]}
      />

      {/* Title, date and the picture. */}
      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-5 pt-4">
          <Link
            href="/blog"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-subtle no-underline hover:text-strong"
          >
            <ArrowLeft size={14} strokeWidth={1.75} aria-hidden />
            Blog
          </Link>
          <Text size={TYPE.meta} color="gray">
            {formatDate(post.publishedAt)}
            {post.publishedAt ? ' · ' : ''}
            {readingMinutes(post.content)} min de citit
            {authors.length ? ` · ${authors.join(', ')}` : ''}
          </Text>
          <Heading as="h1" size={{ initial: '7', md: '8' }} className="text-balance">
            {post.title}
          </Heading>
          {post.meta?.description ? (
            <Text as="p" size={TYPE.lead} color="gray" className="text-pretty">
              {post.meta.description}
            </Text>
          ) : null}
        </div>

        {post.heroImage ? (
          <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-(--radius-5) shadow-[inset_0_0_0_1px_var(--gray-a5)]">
            <Media
              resource={post.heroImage}
              priority
              size="(min-width: 1024px) 64rem, 100vw"
              imgClassName="block h-auto w-full"
            />
          </div>
        ) : null}
      </Section>

      {/* The text, then the questions. */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <RichText
            data={post.content}
            enableGutter={false}
            enableProse={false}
            className="article"
          />

          {faq.length ? (
            <section className="mt-16" aria-labelledby="intrebari">
              <Heading as="h2" id="intrebari" size={TYPE.title} mb="4">
                Întrebări frecvente
              </Heading>
              <Faq items={faq} />
            </section>
          ) : null}
        </div>
      </Section>

      {/* The one next step. */}
      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Heading as="h2" size={TYPE.lead} weight="medium" className="max-w-[36ch] text-pretty">
            Ai un proiect în minte?{' '}
            <span className="text-subtle">
              Spune-ne ce vrei să rezolvi și îți răspundem în scris.
            </span>
          </Heading>
          <QuoteButton size="3" className="self-start md:self-auto" />
        </div>
      </Section>
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = '' } = await params
  const post = await getPost(decodeURIComponent(slug))
  if (!post) return buildMeta({ title: 'Articol negăsit', noIndex: true })

  const shareImage = imageUrl(post.meta?.image) ?? imageUrl(post.heroImage)
  return buildMeta({
    title: post.meta?.title || post.title,
    description: post.meta?.description || undefined,
    path: `/blog/${post.slug}`,
    image: shareImage,
    article: {
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
    },
  })
}
