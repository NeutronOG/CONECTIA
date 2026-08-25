'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie, Settings2, ShieldCheck, X } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  defaultCookiePreferences,
  getCookiePreferences,
  OPEN_COOKIE_SETTINGS_EVENT,
  saveCookiePreferences,
} from '@/lib/cookie-consent'

interface EditablePreferences {
  preferences: boolean
  analytics: boolean
  marketing: boolean
}

const categories = [
  {
    key: 'necessary' as const,
    title: 'Necesarias',
    description: 'Permiten seguridad, autenticación, navegación y funciones indispensables del sitio.',
  },
  {
    key: 'preferences' as const,
    title: 'Preferencias',
    description: 'Recuerdan opciones como idioma, favoritos y configuración de visualización.',
  },
  {
    key: 'analytics' as const,
    title: 'Analíticas',
    description: 'Nos ayudan a medir visitas e interacción para mejorar propiedades y servicios.',
  },
  {
    key: 'marketing' as const,
    title: 'Marketing',
    description: 'Permiten medir campañas y personalizar comunicaciones o publicidad autorizada.',
  },
]

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<EditablePreferences>({
    preferences: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      const stored = getCookiePreferences()
      if (stored) {
        setPreferences({
          preferences: stored.preferences,
          analytics: stored.analytics,
          marketing: stored.marketing,
        })
      } else {
        setShowBanner(true)
      }
    }, 0)

    const openSettings = () => {
      const current = getCookiePreferences() || defaultCookiePreferences
      setPreferences({
        preferences: current.preferences,
        analytics: current.analytics,
        marketing: current.marketing,
      })
      setShowSettings(true)
    }

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings)
    return () => {
      window.clearTimeout(initialize)
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings)
    }
  }, [])

  const save = (nextPreferences: EditablePreferences) => {
    saveCookiePreferences(nextPreferences)
    setPreferences(nextPreferences)
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptAll = () => save({ preferences: true, analytics: true, marketing: true })
  const rejectOptional = () => save({ preferences: false, analytics: false, marketing: false })

  return (
    <>
      {showBanner && (
        <section className="fixed inset-x-3 bottom-3 sm:inset-x-6 sm:bottom-6 z-[100] max-w-6xl mx-auto rounded-[24px] bg-[#17313A] text-white border border-white/10 shadow-2xl p-5 sm:p-6" aria-label="Preferencias de cookies">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            <div className="h-11 w-11 rounded-xl bg-[var(--conectia-arcilla)]/15 flex items-center justify-center flex-shrink-0">
              <Cookie className="h-5 w-5 text-[var(--conectia-arcilla)]" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-2xl font-black mb-2">Tu privacidad, tus preferencias</h2>
              <p className="text-sm text-white/70 leading-6 max-w-3xl">
                Utilizamos almacenamiento necesario para operar el sitio y, con tu permiso, tecnologías de preferencias, analítica y marketing. Puedes cambiar tu elección en cualquier momento. Consulta nuestra{' '}
                <Link href="/legal/politica-cookies" className="font-bold text-[var(--conectia-arcilla)] hover:underline">Política de Cookies</Link>.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 lg:flex gap-2 flex-shrink-0">
              <button type="button" onClick={rejectOptional} className="px-4 py-3 rounded-xl border border-white/20 text-sm font-bold hover:bg-white/10 transition-colors">Rechazar opcionales</button>
              <button type="button" onClick={() => setShowSettings(true)} className="px-4 py-3 rounded-xl border border-white/20 text-sm font-bold hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"><Settings2 className="h-4 w-4" /> Configurar</button>
              <button type="button" onClick={acceptAll} className="px-4 py-3 rounded-xl bg-[var(--conectia-arcilla)] text-[#0F2027] text-sm font-black hover:bg-[var(--conectia-arcilla-hover)] transition-colors">Aceptar todas</button>
            </div>
          </div>
        </section>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[110] bg-[#0F2027]/80 backdrop-blur-sm p-4 flex items-center justify-center" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-white dark:bg-[#17313A] border border-[#17313A]/10 dark:border-white/10 shadow-2xl">
            <header className="flex items-start justify-between gap-4 p-6 sm:p-8 border-b border-[#17313A]/10 dark:border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--conectia-arcilla)] mb-3"><ShieldCheck className="h-4 w-4" /> Centro de preferencias</div>
                <h2 id="cookie-settings-title" className="font-serif text-3xl font-black text-[#17313A] dark:text-[#EAE4DD]">Configurar cookies</h2>
              </div>
              <button type="button" onClick={() => setShowSettings(false)} className="h-10 w-10 rounded-xl flex items-center justify-center text-[#4A4F57] dark:text-[#B0ACA6] hover:bg-[#17313A]/10 dark:hover:bg-white/10" aria-label="Cerrar configuración"><X className="h-5 w-5" /></button>
            </header>

            <div className="p-6 sm:p-8 space-y-4">
              {categories.map((category) => {
                const checked = category.key === 'necessary' ? true : preferences[category.key]
                return (
                  <div key={category.key} className="flex items-start justify-between gap-5 p-4 rounded-2xl bg-[#F6F2EE] dark:bg-[#0F2027]/60 border border-[#17313A]/10 dark:border-white/10">
                    <div>
                      <h3 className="font-bold text-[#17313A] dark:text-[#EAE4DD] mb-1">{category.title}</h3>
                      <p className="text-sm text-[#4A4F57] dark:text-[#B0ACA6] leading-6">{category.description}</p>
                    </div>
                    <Switch
                      checked={checked}
                      disabled={category.key === 'necessary'}
                      onCheckedChange={(value) => {
                        if (category.key !== 'necessary') setPreferences((current) => ({ ...current, [category.key]: value }))
                      }}
                      aria-label={`${category.title}: ${checked ? 'activadas' : 'desactivadas'}`}
                    />
                  </div>
                )
              })}
              <p className="text-xs text-[#4A4F57] dark:text-[#B0ACA6] leading-5">
                Las tecnologías necesarias permanecen activas para prestar funciones solicitadas. Más información en la{' '}
                <Link href="/legal/politica-cookies" className="font-bold text-[var(--conectia-arcilla)] hover:underline">Política de Cookies</Link> y el{' '}
                <Link href="/legal/aviso-privacidad-integral" className="font-bold text-[var(--conectia-arcilla)] hover:underline">Aviso de Privacidad Integral</Link>.
              </p>
            </div>

            <footer className="p-6 sm:p-8 border-t border-[#17313A]/10 dark:border-white/10 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button type="button" onClick={rejectOptional} className="px-5 py-3 rounded-xl border border-[#17313A]/20 dark:border-white/20 text-sm font-bold text-[#17313A] dark:text-[#EAE4DD]">Rechazar opcionales</button>
              <button type="button" onClick={() => save(preferences)} className="px-5 py-3 rounded-xl bg-[#17313A] dark:bg-[var(--conectia-arcilla)] text-white dark:text-[#0F2027] text-sm font-black">Guardar preferencias</button>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
