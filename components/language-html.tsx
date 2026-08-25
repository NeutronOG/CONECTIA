"use client"

import { useEffect } from "react"
import { useLanguage } from "@/lib/i18n"

export function LanguageHtml() {
  const { language } = useLanguage()

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return null
}
