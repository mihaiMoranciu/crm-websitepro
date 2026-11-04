import React from 'react'
import Link from 'next/link'
import { Button } from '@radix-ui/themes'
import { Send } from 'lucide-react'

import { cn } from '@/utilities/ui'

import { CONTACT_HREF } from './links'

/**
 * "Cere o ofertă", the one action every page leads to, the same everywhere.
 * On hover the paper plane flies off and comes back, a band of light crosses
 * the button and it lifts a little; it presses in on click. With `attention`
 * (the home page's hero) the light also crosses it every few seconds, so the
 * eye finds it. All of it is CSS (see .quote-btn in globals.css) and stops
 * under reduced motion.
 */
export function QuoteButton({
  size = '3',
  attention,
  className,
  href = CONTACT_HREF,
  onClick,
}: {
  size?: '2' | '3' | '4'
  attention?: boolean
  className?: string
  href?: string
  onClick?: () => void
}) {
  const icon = size === '4' ? 18 : size === '3' ? 16 : 14
  return (
    <Button
      asChild
      size={size}
      className={cn('quote-btn font-medium', size === '4' && 'gap-3 pr-6 pl-5', className)}
      data-attention={attention ? '' : undefined}
    >
      <Link href={href} onClick={onClick}>
        <span className="quote-btn-icon" aria-hidden>
          <Send size={icon} strokeWidth={1.75} />
        </span>
        Cere o ofertă
      </Link>
    </Button>
  )
}
