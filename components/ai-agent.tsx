"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { AISearchChat } from "@/components/ai-search-chat"
import { useLanguage } from "@/lib/i18n"

/** Asistente global: la búsqueda se resuelve en el servidor contra Supabase. */
export function AIAgent() {
  const { language } = useLanguage()
  const label = language === 'en' ? 'Open property assistant' : 'Abrir asistente de propiedades'
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+6rem)] right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-[#17313A] px-4 text-white shadow-[0_16px_38px_rgba(23,49,58,0.30)] transition hover:-translate-y-0.5 hover:bg-[#274c58] focus:outline-none focus:ring-4 focus:ring-[#17313A]/20 md:bottom-7 md:right-7"
        aria-label={label}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden text-xs font-semibold sm:inline">{language === 'en' ? 'Can I help you search?' : '¿Te ayudo a buscar?'}</span>
      </button>
      <AISearchChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
