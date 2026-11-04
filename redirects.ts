import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // The blog moved from the template's /posts to /blog; old links keep working.
  const blogRedirects = [
    { source: '/posts', destination: '/blog', permanent: true },
    { source: '/posts/page/:page', destination: '/blog', permanent: true },
    { source: '/posts/:slug', destination: '/blog/:slug', permanent: true },
  ]

  return [internetExplorerRedirect, ...blogRedirects]
}
