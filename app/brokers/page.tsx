"use client"

import { ArrowUpRight, FileText, Phone, MapPin, Scale, ShieldCheck } from "lucide-react"
import { PageHero } from "@/components/page-hero"
import { useLanguage } from "@/lib/i18n"

const notariasAsociadas = [
  {
    nombre: "Notaría 100",
    notario: "Lic. Jorge Arturo Zepeda Orozco",
    especialidad: "Escrituración y Compraventa",
    especialidadEn: "Deeds and Purchase Agreements",
    ubicacion: "León, Guanajuato",
    telefono: "563-157-2468"
  },
  {
    nombre: "Notaría 65",
    notario: "Lic. Pablo Francisco Toriello Arce",
    especialidad: "Compraventa y Fideicomisos",
    especialidadEn: "Purchase Agreements and Trusts",
    ubicacion: "León, Guanajuato",
    telefono: "563-157-2468"
  },
  {
    nombre: "Notaría 98",
    notario: "Lic. Jose Manuel Toriello Arce",
    especialidad: "Desarrollos Inmobiliarios",
    especialidadEn: "Real Estate Developments",
    ubicacion: "León, Guanajuato",
    telefono: "563-157-2468"
  },
  {
    nombre: "Notaría 15",
    notario: "Lic. Cesar Santos del Muro Amador",
    especialidad: "Hipotecas y Escrituración",
    especialidadEn: "Mortgages and Deeds",
    ubicacion: "León, Guanajuato",
    telefono: "563-157-2468"
  },
  {
    nombre: "Notaría 82",
    notario: "Lic. Enrique Duran Llamas",
    especialidad: "Compraventa Inmobiliaria",
    especialidadEn: "Real Estate Purchase Agreements",
    ubicacion: "León, Guanajuato",
    telefono: "563-157-2468"
  }
]

export default function BrokersPage() {
  const { language, t } = useLanguage()
  return (
    <div className="min-h-screen bg-conectia-surface transition-colors dark:bg-[#0F2027]">
      <PageHero
        icon={Scale}
        title={t('pages.brokers.heroTitle')}
        titleAccent={t('pages.brokers.heroAccent')}
        description={t('pages.brokers.heroDescription')}
        badge={t('pages.brokers.heroBadge')}
        bgImage="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=80"
      />

      {/* Notarías Asociadas */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-24 lg:px-16">
        <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#17313A]/5 blur-3xl" />
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
            <span className="text-[10px] uppercase tracking-[0.35em] text-conectia-primary font-semibold">{t('pages.brokers.sectionEyebrow')}</span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#17313A] dark:text-[#EAE4DD] sm:text-5xl">
              {t('pages.brokers.sectionTitle')}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4A4F57] dark:text-[#B0ACA6] sm:text-base">
              {t('pages.brokers.sectionDescription')}
            </p>
            </div>
            <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-[#17313A]/10 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
              <ShieldCheck className="h-5 w-5 text-[var(--conectia-arcilla)]" />
              <div>
                <p className="text-lg font-black leading-none text-[#17313A] dark:text-white">05</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#4A4F57] dark:text-[#B0ACA6]">{t('pages.brokers.heroBadge')}</p>
              </div>
            </div>
          </div>
          
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {notariasAsociadas.map((notaria, index) => (
              <article key={notaria.nombre} className="group relative overflow-hidden rounded-[28px] border border-[#17313A]/10 bg-white p-6 shadow-[0_18px_50px_rgba(23,49,58,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#17313A]/25 hover:shadow-[0_24px_70px_rgba(23,49,58,0.15)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="absolute right-5 top-4 font-serif text-6xl font-black leading-none text-[#17313A]/[0.05] dark:text-white/[0.05]">{String(index + 1).padStart(2, '0')}</div>
                <div className="relative">
                  <div className="mb-7 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17313A] text-white shadow-lg shadow-[#17313A]/20 dark:bg-[var(--conectia-arcilla)] dark:text-[#0F2027]">
                      <Scale className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-emerald-700/15 bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-800 dark:border-emerald-300/15 dark:bg-emerald-400/10 dark:text-emerald-200">
                      {t('pages.brokers.verified')}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#17313A] dark:text-[#EAE4DD]">{notaria.nombre}</h3>
                  <p className="mt-1 min-h-10 text-xs leading-5 text-[#4A4F57] dark:text-[#B0ACA6]">{notaria.notario}</p>
                  <div className="my-5 h-px bg-gradient-to-r from-[#17313A]/15 to-transparent dark:from-white/15" />
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-xs leading-5 text-[#4A4F57] dark:text-[#D5D2C9]">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--conectia-arcilla)]" />
                      <span>{language === 'en' ? notaria.especialidadEn : notaria.especialidad}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#4A4F57] dark:text-[#D5D2C9]">
                      <MapPin className="h-4 w-4 shrink-0 text-[var(--conectia-arcilla)]" />
                      <span>{notaria.ubicacion}</span>
                    </div>
                  </div>
                  <a href={`tel:${notaria.telefono.replace(/\D/g, '')}`} className="mt-6 flex items-center justify-between rounded-xl bg-[#17313A]/[0.06] px-4 py-3 text-xs font-bold text-[#17313A] transition-colors hover:bg-[#17313A] hover:text-white dark:bg-white/[0.07] dark:text-white dark:hover:bg-[var(--conectia-arcilla)] dark:hover:text-[#0F2027]">
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{notaria.telefono}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
