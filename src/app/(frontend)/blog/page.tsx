import React from 'react'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Heading, Text } from '@radix-ui/themes'

import { Media } from '@/components/Media'
import { Section } from '@/components/site/Frame'
import { Highlight } from '@/components/site/Highlight'
import { JsonLd } from '@/components/site/JsonLd'
import { TYPE } from '@/design/type'
import { formatDate, readingMinutes } from '@/utilities/postText'
import { buildMeta } from '@/utilities/seo'
import { breadcrumbSchema } from '@/utilities/structuredData'

/* Rebuilt every ten minutes, and right away when a post is published (see revalidatePost). */
export const revalidate = 600

/**
 * The blog: every published post, newest first, as cards with the picture,
 * the date and reading time, the title and its one-line description.
 */
export default async function BlogPage() {
  const payload = await getPayload({ config: configPromise })
  const { docs: posts } = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 60,
    overrideAccess: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      heroImage: true,
      meta: true,
      publishedAt: true,
      content: true,
    },
  })

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Blog', path: '/blog' }])} />

      <Section>
        <div className="flex flex-col gap-5 pt-8">
          <Heading as="h1" size={TYPE.display} className="max-w-3xl text-balance">
            Note din <Highlight>atelier</Highlight>
          </Heading>
          <Text as="p" size={TYPE.lead} color="gray" className="max-w-(--reading-width)">
            Ce învățăm construind site-uri și aplicații pentru firme, scris pe înțelesul tuturor.
          </Text>
        </div>
      </Section>

      <Section>
        {posts.length ? (
          <ul className="m-0 grid list-none gap-x-8 gap-y-14 p-0 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-4 no-underline"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-(--radius-4) bg-sunken shadow-[inset_0_0_0_1px_var(--gray-a5)]">
                    {post.heroImage ? (
                      <Media
                        resource={post.heroImage}
                        fill
                        size="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        imgClassName="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : null}
                  </div>
                  <Text size={TYPE.meta} color="gray">
                    {formatDate(post.publishedAt)}
                    {post.publishedAt ? ' · ' : ''}
                    {readingMinutes(post.content)} min de citit
                  </Text>
                  <Heading
                    as="h2"
                    size={TYPE.title}
                    className="text-balance text-strong decoration-1 underline-offset-4 group-hover:underline"
                  >
                    {post.title}
                  </Heading>
                  {post.meta?.description ? (
                    <Text as="p" size={TYPE.body} color="gray" className="-mt-2">
                      {post.meta.description}
                    </Text>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Text as="p" size={TYPE.body} color="gray">
            Primul articol apare în curând.
          </Text>
        )}
      </Section>
    </>
  )
}

export const metadata = buildMeta({
  title: 'Blog',
  description:
    'Articole despre site-uri, magazine online, aplicații web și e-Factura, scrise de echipa care le construiește.',
  path: '/blog',
})
