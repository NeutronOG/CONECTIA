'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useLanguage } from '@/lib/i18n'

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}

export function ModeToggle() {
  const { language } = useLanguage()
  const labels = language === 'en'
    ? { change: 'Change theme', light: 'Switch to light mode', dark: 'Switch to dark mode', lightActive: 'Light mode active', darkActive: 'Dark mode active' }
    : { change: 'Cambiar tema', light: 'Cambiar a modo claro', dark: 'Cambiar a modo oscuro', lightActive: 'Modo claro activo', darkActive: 'Modo oscuro activo' }
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="mode-toggle opacity-0"
        aria-label={labels.change}
        disabled
      >
        <span className="sr-only">{labels.change}</span>
      </button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  const handleThemeChange = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    const root = document.documentElement
    const button = document.querySelector<HTMLElement>('[data-theme-toggle]')
    const rect = button?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    root.style.setProperty('--theme-x', `${x}px`)
    root.style.setProperty('--theme-y', `${y}px`)
    root.style.setProperty('--theme-radius', `${radius}px`)

    const doc = document as ViewTransitionDocument
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!doc.startViewTransition || reduceMotion) {
      setTheme(nextTheme)
      return
    }

    root.dataset.themeTransition = nextTheme
    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(nextTheme))
    })

    transition.finished.finally(() => {
      delete root.dataset.themeTransition
    })
  }

  return (
    <button
      type="button"
      data-theme-toggle
      onClick={handleThemeChange}
      className="mode-toggle"
      aria-label={isDark ? labels.light : labels.dark}
      title={isDark ? labels.light : labels.dark}
      aria-pressed={isDark}
    >
      <span className="mode-toggle-track" aria-hidden="true">
        <Sun className="mode-toggle-sun" />
        <Moon className="mode-toggle-moon" />
        <span className="mode-toggle-thumb" />
      </span>
      <span className="sr-only">{isDark ? labels.darkActive : labels.lightActive}</span>
    </button>
  )
}
