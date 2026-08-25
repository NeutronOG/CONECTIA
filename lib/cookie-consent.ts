export type CookieCategory = 'necessary' | 'preferences' | 'analytics' | 'marketing'

export interface CookiePreferences {
  necessary: true
  preferences: boolean
  analytics: boolean
  marketing: boolean
  updatedAt: string
  version: 1
}

export const COOKIE_CONSENT_KEY = 'conectia-cookie-consent'
export const COOKIE_CONSENT_EVENT = 'conectia:cookie-consent-changed'
export const OPEN_COOKIE_SETTINGS_EVENT = 'conectia:open-cookie-settings'

export const defaultCookiePreferences: CookiePreferences = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
  updatedAt: '',
  version: 1,
}

export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Partial<CookiePreferences>
    if (parsed.version !== 1) return null

    return {
      necessary: true,
      preferences: Boolean(parsed.preferences),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      version: 1,
    }
  } catch {
    return null
  }
}

export function hasCookieConsent(category: CookieCategory): boolean {
  if (category === 'necessary') return true
  return Boolean(getCookiePreferences()?.[category])
}

export function saveCookiePreferences(preferences: Pick<CookiePreferences, 'preferences' | 'analytics' | 'marketing'>) {
  if (typeof window === 'undefined') return

  const value: CookiePreferences = {
    necessary: true,
    ...preferences,
    updatedAt: new Date().toISOString(),
    version: 1,
  }

  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value))

  if (!value.preferences) {
    localStorage.removeItem('conectia-language')
    localStorage.removeItem('conectia-wishlist')
  }

  if (!value.analytics) {
    localStorage.removeItem('conectia_property_analytics')
  }

  window.dispatchEvent(new CustomEvent<CookiePreferences>(COOKIE_CONSENT_EVENT, { detail: value }))
}

export function openCookieSettings() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
}
