'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconButton } from '@radix-ui/themes'
import { NavigationMenu } from 'radix-ui'
import { ChevronDown, Menu, X } from 'lucide-react'

import { cn } from '@/utilities/ui'

import { columnClass } from './Frame'
import type { SiteLink } from './links'
import { NAV, type NavGroup } from './navigation'
import { QuoteButton } from './QuoteButton'

const itemClass =
  'flex items-center gap-1 rounded-(--radius-2) px-3 py-1.5 text-sm text-subtle no-underline transition-colors hover:bg-(--gray-a3) hover:text-strong data-[state=open]:text-strong'

const bigLinkClass =
  'text-(length:--font-size-5) font-medium tracking-tight text-strong no-underline transition-colors hover:text-(--accent-11)'

const groupLinkClass = `group/link inline-flex items-center gap-3 ${bigLinkClass}`

/** A link's thin outline icon, grey until the link is hovered, then its label. */
function LinkBody({ link }: { link: NavGroup['links'][number] }) {
  const Icon = link.icon
  return (
    <>
      <Icon
        size={20}
        strokeWidth={1.25}
        aria-hidden
        className="shrink-0 text-(--gray-9) transition-colors group-hover/link:text-(--accent-11)"
      />
      {link.label}
    </>
  )
}

/** A panel's groups side by side: a small label over large links. */
function Groups({
  groups,
  inMenu = false,
  onNavigate,
}: {
  groups: NavGroup[]
  /** Inside Radix's menu, links register with it for keyboard navigation. */
  inMenu?: boolean
  onNavigate?: () => void
}) {
  return (
    <div className="grid gap-8 md:grid-cols-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="m-0 mb-3 text-sm text-subtle">{group.label}</p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {group.links.map((link) => (
              <li key={link.href}>
                {inMenu ? (
                  <NavigationMenu.Link asChild>
                    <Link href={link.href} onClick={onNavigate} className={groupLinkClass}>
                      <LinkBody link={link} />
                    </Link>
                  </NavigationMenu.Link>
                ) : (
                  <Link href={link.href} onClick={onNavigate} className={groupLinkClass}>
                    <LinkBody link={link} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/**
 * The desktop navigation. Entries with groups open a panel the full width of
 * the header, under it, the page behind dimmed. Built on Radix's navigation
 * menu, which handles hover intent, the keyboard and focus.
 */
export function DesktopNav() {
  const [open, setOpen] = useState('')
  const pathname = usePathname()

  // Close on every navigation, including links to a section of the same page.
  useEffect(() => setOpen(''), [pathname])

  return (
    <NavigationMenu.Root
      value={open}
      onValueChange={setOpen}
      delayDuration={60}
      aria-label="Principal"
      className="hidden md:block"
    >
      <NavigationMenu.List className="m-0 flex list-none items-center gap-1 p-0">
        {NAV.map((entry) =>
          'groups' in entry ? (
            <NavigationMenu.Item key={entry.label} value={entry.label}>
              <NavigationMenu.Trigger className={cn(itemClass, 'group cursor-default')}>
                {entry.label}
                <ChevronDown
                  size={14}
                  strokeWidth={1.75}
                  aria-hidden
                  className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="nav-content">
                <div className={cn(columnClass, 'px-(--gutter) pt-8 pb-12')}>
                  <Groups groups={entry.groups} inMenu onNavigate={() => setOpen('')} />
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          ) : (
            <NavigationMenu.Item key={entry.href}>
              <NavigationMenu.Link asChild>
                <Link href={entry.href} className={itemClass}>
                  {entry.label}
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          ),
        )}
      </NavigationMenu.List>

      {/* The panel hangs from the header's bottom edge, across its full width. */}
      <div className="absolute inset-x-0 top-full">
        <NavigationMenu.Viewport className="nav-viewport overflow-hidden border-b border-frame bg-page" />
      </div>

      {/* The page behind, dimmed while a panel is open. */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none fixed inset-x-0 top-(--header-height) bottom-0 -z-10 bg-black/10 backdrop-blur-[2px] dark:bg-black/40 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
    </NavigationMenu.Root>
  )
}

/**
 * The same navigation on small screens: a button that opens a full-screen
 * panel under the header, every group listed in turn, the call to action at
 * the bottom.
 */
export function MobileNav({ cta }: { cta: SiteLink }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  // Hold the page still behind the panel; Escape closes it.
  useEffect(() => {
    if (!open) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <IconButton
        variant="ghost"
        color="gray"
        size="2"
        aria-label={open ? 'Închide meniul' : 'Meniu'}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
      </IconButton>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Principal"
          className="fixed inset-x-0 top-(--header-height) bottom-0 z-30 flex flex-col gap-8 overflow-y-auto border-t border-frame bg-page px-(--gutter) py-8"
        >
          <div className="flex flex-col gap-8">
            {NAV.map((entry) =>
              'groups' in entry ? (
                <Groups key={entry.label} groups={entry.groups} onNavigate={close} />
              ) : (
                <Link key={entry.href} href={entry.href} onClick={close} className={bigLinkClass}>
                  {entry.label}
                </Link>
              ),
            )}
          </div>

          <QuoteButton size="3" className="mt-auto" href={cta.href} onClick={close} />
        </nav>
      ) : null}
    </>
  )
}
