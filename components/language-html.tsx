"use client"

import { useEffect } from "react"
import { useLanguage } from "@/lib/i18n"
import { usePathname } from "next/navigation"

export function LanguageHtml() {
  const { language } = useLanguage()
  const pathname = usePathname()

  useEffect(() => {
    document.documentElement.lang = language
    const route = pathname.split('/').filter(Boolean)[0] || 'home'
    const pageNames: Record<string, [string, string]> = {
      home: ['CONECTIA - Tu Plataforma Inmobiliaria de Confianza', 'CONECTIA - Your Trusted Real Estate Platform'],
      propiedades: ['Propiedades | CONECTIA', 'Properties | CONECTIA'],
      propietarios: ['Propietarios | CONECTIA', 'Property Owners | CONECTIA'],
      empresa: ['Empresa | CONECTIA', 'About CONECTIA'],
      servicios: ['Servicios | CONECTIA', 'Services | CONECTIA'],
      contacto: ['Contacto | CONECTIA', 'Contact | CONECTIA'],
      brokers: ['Brokers | CONECTIA', 'Brokers | CONECTIA'],
      venta: ['Propiedades en venta | CONECTIA', 'Properties for Sale | CONECTIA'],
      renta: ['Propiedades en renta | CONECTIA', 'Properties for Rent | CONECTIA'],
      ofertas: ['Ofertas | CONECTIA', 'Offers | CONECTIA'],
      especiales: ['Propiedades especiales | CONECTIA', 'Special Properties | CONECTIA'],
      preventa: ['Preventa | CONECTIA', 'Presale | CONECTIA'],
      exclusivos: ['Exclusivos | CONECTIA', 'Exclusive Properties | CONECTIA'],
      favoritos: ['Favoritos | CONECTIA', 'Favorites | CONECTIA'],
      legal: ['Centro Legal | CONECTIA', 'Legal Center | CONECTIA'],
    }
    const pair = pageNames[route] || pageNames.home
    const title = pair[language === 'en' ? 1 : 0]
    document.title = title
    const refreshTitles = [0, 100, 500, 1200].map(delay => window.setTimeout(() => { document.title = title }, delay))
    return () => refreshTitles.forEach(window.clearTimeout)
  }, [language, pathname])

  return null
}
