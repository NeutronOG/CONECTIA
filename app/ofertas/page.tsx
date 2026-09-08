"use client"

import { useMemo, useState } from "react"
import { Percent, Flame, Clock, TrendingDown, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePropertiesStatic } from "@/hooks/use-properties-static"
import { PropertyCard, EmptyProperties } from "@/components/property-card"
import { SubcategoryFilter } from "@/components/subcategory-filter"
import { useLanguage } from "@/lib/i18n"

const HERO_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"

export default function OfertasPage() {
  const { t } = useLanguage()
  const { properties } = usePropertiesStatic()
  const [tipoFilter, setTipoFilter] = useState<string[]>([])

  const CARDS = [
    { icon: TrendingDown, label: t('pages.ofertas.cards.price'), value: t('pages.ofertas.cards.priceValue'), sub: t('pages.ofertas.cards.priceSub') },
    { icon: Flame, label: t('pages.ofertas.cards.bonus'), value: t('pages.ofertas.cards.bonusValue'), sub: t('pages.ofertas.cards.bonusSub') },
    { icon: Clock, label: t('pages.ofertas.cards.availability'), value: t('pages.ofertas.cards.availabilityValue'), sub: t('pages.ofertas.cards.availabilitySub') },
    { icon: Percent, label: t('pages.ofertas.cards.financing'), value: t('pages.ofertas.cards.financingValue'), sub: t('pages.ofertas.cards.financingSub') },
  ]

  const propiedades = useMemo(() => {
    let result = properties.filter(p => p.bono || p.categoria === 'oferta')
    if (tipoFilter.length > 0) {
      result = result.filter(p => tipoFilter.some(t => p.tipo?.toLowerCase() === t.toLowerCase()))
    }
    return result
  }, [properties, tipoFilter])

  return (
    <div className="min-h-screen bg-[#F6F2EE] [--conectia-arcilla:#E7B29A] [--conectia-arcilla-hover:#F0C2AE] [--conectia-on-accent:#0F2027] dark:bg-[#0F2027]">

      {/* HERO — Creative dark with glow effects */}
      <section className="relative isolate overflow-hidden bg-[#0B1C23] [--offer-accent:#E7B29A]">
        {/* Background image */}
        <Image
          src={HERO_IMAGE}
          alt={t('pages.ofertas.title')}
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover object-[62%_center] opacity-45 sm:object-center sm:opacity-50"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,16,21,0.80)_0%,rgba(9,26,33,0.70)_42%,rgba(7,22,28,0.96)_100%)] lg:bg-[linear-gradient(90deg,rgba(5,16,21,0.96)_0%,rgba(7,22,28,0.84)_48%,rgba(7,22,28,0.50)_100%)]" />
        {/* Accent gradient orbs */}
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-[var(--offer-accent)]/20 blur-[110px]" />
        <div className="absolute -left-16 bottom-8 h-64 w-64 rounded-full bg-[#315D68]/30 blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(115deg,transparent_0,transparent_46px,rgba(255,255,255,0.45)_47px,transparent_48px)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-32 pt-14 sm:px-10 sm:py-24 lg:px-16 lg:py-28">
          <div className="grid items-end gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
            {/* Left: bold typography */}
            <div className="space-y-5 sm:space-y-7">
              <div className="flex items-center justify-between gap-3">
                <h1 className="inline-flex items-center gap-2 rounded-full border border-[var(--offer-accent)]/35 bg-[var(--offer-accent)]/10 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.32em] text-[var(--offer-accent)] backdrop-blur-md sm:text-[10px]">
                  <Flame className="h-3.5 w-3.5 fill-current" />
                  {t('pages.ofertas.badge')}
                </h1>
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45 sm:hidden">
                  {String(propiedades.length).padStart(2, '0')} {t('pages.ofertas.active')}
                </span>
              </div>

              {/* Giant number with gradient */}
              <div className="relative flex items-center border-y border-white/10 py-2 sm:py-3">
                <span className="bg-gradient-to-br from-white via-white to-[#AAB9B9] bg-clip-text text-[clamp(7.5rem,36vw,10rem)] font-black leading-[0.78] tracking-[-0.09em] text-transparent">30</span>
                <div className="ml-4 border-l border-[var(--offer-accent)]/40 pl-4 sm:ml-6 sm:pl-6">
                  <span className="block text-5xl font-black leading-none text-[var(--offer-accent)] sm:text-7xl">%</span>
                  <p className="mt-2 max-w-24 text-[10px] font-bold uppercase leading-snug tracking-[0.18em] text-[var(--offer-accent)]/75 sm:text-xs">{t('pages.ofertas.discount')}</p>
                </div>
              </div>

              <p className="max-w-lg text-xl font-light leading-snug text-white/80 sm:text-2xl lg:text-3xl">
                {t('pages.ofertas.subtitle')}
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="hidden items-center gap-2 rounded-full border border-[var(--offer-accent)]/35 bg-[var(--offer-accent)]/10 px-4 py-2 text-xs font-semibold text-[var(--offer-accent)] sm:inline-flex">
                  <Flame className="h-3.5 w-3.5" />
                  {propiedades.length} {t('pages.ofertas.active')}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs text-white/80 backdrop-blur-md">
                  <Clock className="h-3.5 w-3.5 text-[var(--offer-accent)]" />
                  {t('pages.ofertas.limitedTime')}
                </span>
              </div>

              <Link href="#propiedades-en-oferta" className="group inline-flex w-full items-center justify-between rounded-2xl bg-[var(--offer-accent)] px-5 py-4 text-sm font-bold text-[#0F2027] shadow-[0_18px_45px_rgba(231,178,154,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#F0C2AE] sm:w-auto sm:gap-8 sm:px-6">
                {t('pages.ofertas.cta')}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F2027]/10 transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>

            {/* Right: glowing glass cards */}
            <div className="-mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-10 sm:gap-4 sm:px-10 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
              {CARDS.map((item, index) => (
                <div key={item.label} className="group relative min-h-36 min-w-[10.5rem] snap-start overflow-hidden rounded-[22px] border border-white/12 bg-[#17313A]/55 p-4 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[var(--offer-accent)]/40 hover:bg-[#17313A]/75 sm:min-h-44 sm:min-w-52 sm:rounded-[28px] sm:p-5 lg:min-w-0">
                  <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-[var(--offer-accent)]/10 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="absolute right-4 top-3 text-[10px] font-bold tracking-[0.2em] text-white/20">0{index + 1}</span>
                  <div className="relative flex h-full flex-col justify-between gap-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--offer-accent)]/20 bg-[var(--offer-accent)]/10 sm:h-11 sm:w-11 sm:rounded-2xl">
                      <item.icon className="h-4 w-4 text-[var(--offer-accent)] sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="text-base font-black leading-tight text-white sm:text-xl">{item.value}</p>
                      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-white/65 sm:text-xs sm:tracking-wider">{item.label}</p>
                      <p className="mt-1 hidden text-xs text-white/35 sm:block">{item.sub}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--offer-accent)]/70 to-transparent" />
      </section>

      {/* GRID */}
      <section id="propiedades-en-oferta" className="scroll-mt-8 bg-[#0F2027] px-4 py-14 sm:px-8 sm:py-20 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end gap-8 mb-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-[var(--conectia-arcilla)] font-bold">{t('pages.ofertas.active')}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">{t('properties.availableTitle')}</h2>
            </div>
            <div className="h-px flex-1 bg-[var(--conectia-arcilla)]/20 hidden sm:block" />
          </div>
          <SubcategoryFilter onChange={setTipoFilter} variant="dark" resultCount={propiedades.length} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {propiedades.map((p) => (<PropertyCard key={p.id} propiedad={p} badgeLabel={t('properties.cards.forOffer')} />))}
            {propiedades.length === 0 && (<EmptyProperties label={t('properties.empty.subtitle')} />)}
          </div>
        </div>
      </section>
    </div>
  )
}
