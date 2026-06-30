"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
import { translations, Language } from "./translations"

type Translations = typeof translations

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: string, params?: Record<string, string | number>) => string
  dict: Translations[Language]
}

const STORAGE_KEY = "conectia-language"
const DEFAULT_LANGUAGE: Language = "es"

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getNestedValue(obj: any, key: string): string | undefined {
  const parts = key.split(".")
  let current = obj
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined
    current = current[part]
  }
  return typeof current === "string" ? current : undefined
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null
      if (stored && translations[stored]) {
        setLanguageState(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "es" ? "en" : "es")
  }, [language, setLanguage])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[language]
      let value = getNestedValue(dict, key)

      if (value === undefined) {
        // Fallback to Spanish
        const fallback = getNestedValue(translations["es"], key)
        value = fallback ?? key
      }

      if (params) {
        return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
          return acc.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue))
        }, value)
      }

      return value
    },
    [language]
  )

  const dict = translations[language]

  // Prevent hydration mismatch by rendering children only after mounted
  if (!mounted) {
    return (
      <LanguageContext.Provider
        value={{
          language: DEFAULT_LANGUAGE,
          setLanguage,
          toggleLanguage,
          t: (key: string, params?: Record<string, string | number>) => {
            const dict = translations[DEFAULT_LANGUAGE]
            let value = getNestedValue(dict, key) ?? key
            if (params) {
              return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
                return acc.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue))
              }, value)
            }
            return value
          },
          dict: translations[DEFAULT_LANGUAGE],
        }}
      >
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, dict }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
