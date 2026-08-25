'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="mode-toggle opacity-0"
        aria-label="Cambiar tema"
        disabled
      >
        <span className="sr-only">Cambiar tema</span>
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
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDark}
    >
      <span className="mode-toggle-track" aria-hidden="true">
        <Sun className="mode-toggle-sun" />
        <Moon className="mode-toggle-moon" />
        <span className="mode-toggle-thumb" />
      </span>
      <span className="sr-only">{isDark ? 'Modo oscuro activo' : 'Modo claro activo'}</span>
    </button>
  )
}
