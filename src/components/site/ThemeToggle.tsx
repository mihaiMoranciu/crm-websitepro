'use client'

import React from 'react'
import { IconButton } from '@radix-ui/themes'
import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/providers/Theme'

/**
 * Switches between light and dark. Both icons are rendered and the `dark:`
 * variant shows the right one from the attribute already on <html>, so the
 * button is correct on the very first paint.
 */
export function ThemeToggle() {
  const { setTheme } = useTheme()

  const toggle = () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark'
    setTheme(dark ? 'light' : 'dark')
  }

  return (
    <IconButton variant="ghost" color="gray" size="2" onClick={toggle} aria-label="Schimbă tema">
      <Moon className="dark:hidden" size={16} strokeWidth={1.75} />
      <Sun className="hidden dark:block" size={16} strokeWidth={1.75} />
    </IconButton>
  )
}
