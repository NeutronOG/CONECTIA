'use client'

import { useEffect } from 'react'

/**
 * Evita las acciones de guardado más directas sobre imágenes del sitio.
 * No sustituye controles de servidor: una imagen visible siempre puede
 * capturarse por pantalla.
 */
export function MediaProtection() {
  useEffect(() => {
    const isImageTarget = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('img'))

    const preventImageMenu = (event: MouseEvent) => {
      if (isImageTarget(event.target)) event.preventDefault()
    }
    const preventImageDrag = (event: DragEvent) => {
      if (isImageTarget(event.target)) event.preventDefault()
    }

    document.addEventListener('contextmenu', preventImageMenu)
    document.addEventListener('dragstart', preventImageDrag)
    return () => {
      document.removeEventListener('contextmenu', preventImageMenu)
      document.removeEventListener('dragstart', preventImageDrag)
    }
  }, [])

  return null
}
