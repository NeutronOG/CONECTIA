'use client'

import { useState, useEffect } from "react"
import { ArrowRight, Star, Users, MapPin, House, List, Tag, Key, Percent, Crown, X, TrendUp, ShoppingBag, Bathtub, Ruler } from "@phosphor-icons/react"
import Link from "next/link"
import Image from "next/image"
import { FeaturedPropertiesCarousel } from "./featured-properties-carousel"
import { CommercialAlliance } from "./commercial-alliance"
import { HomepageAdSlot } from "./homepage-ads"
import { Propiedad } from "@/data/propiedades"
import { useLanguage } from "@/lib/i18n"

export function HomeYellow() {
  const { t } = useLanguage()
  const [isCategoriasMenuOpen, setIsCategoriasMenuOpen] = useState(false)
  const [activeThumb, setActiveThumb] = useState(0)
  const [featuredProp, setFeaturedProp] = useState<Propiedad | null>(null)
  const [isLoadingProp, setIsLoadingProp] = useState(true)

  useEffect(() => {
    // Casa en Comanjilla es la ficha editorial elegida para este espacio.
    fetch('/api/propiedades?id=98')
      .then(res => {
        if (!res.ok) {
          console.warn('Featured property fetch failed with status:', res.status)
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data?.propiedad) setFeaturedProp(data.propiedad)
      })
      .catch(err => console.error('Error fetching featured property:', err))
      .finally(() => setIsLoadingProp(false))
  }, [])

  const gallery = featuredProp?.galeria?.length ? featuredProp.galeria : [featuredProp?.imagen || '/placeholder.svg']
  const formatPrice = (p?: number) => {
    if (p === undefined || p === null || isNaN(p)) return '—'
    return p >= 1_000_000 ? `$${(p / 1_000_000).toFixed(1).replace(/\.0$/, '')}M` : `$${(p / 1_000).toFixed(0)}K`
  }

  return (
    <div className="home-experience min-h-screen bg-white dark:bg-[#0F2027] transition-colors duration-300">

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="home-hero max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-12 mt-[60px]">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Left */}
          <div className="home-hero-copy flex-1 space-y-8">
            <div className="home-eyebrow">
              <span className="home-signal" aria-hidden="true" />
              <span>{t('home.hero.badge')}</span>
            </div>
            <h1 className="home-display text-[5rem] sm:text-[6.5rem] md:text-[8rem] font-black text-[#17313A] dark:text-[#EAE4DD] leading-[0.88] tracking-tighter">
              {t('home.hero.title')}
              <span className="block font-serif italic font-normal text-[var(--conectia-arcilla)]">
                {t('home.hero.titleHighlight')}
              </span>
            </h1>

            <p className="text-base md:text-lg text-[#6B7280] dark:text-[#B0ACA6] max-w-sm font-normal leading-relaxed">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/propiedades">
                <button className="home-primary-cta flex items-center gap-2 bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200 text-sm">
                  <ArrowRight className="h-4 w-4" weight="bold" />
                  {t('home.hero.ctaPrimary')}
                </button>
              </Link>
              <button
                onClick={() => setIsCategoriasMenuOpen(true)}
                className="home-secondary-cta flex items-center gap-2 bg-white dark:bg-[#17313A]/30 border border-[#E5E7EB] dark:border-[#EAE4DD]/20 text-[#17313A] dark:text-[#EAE4DD] font-semibold px-6 py-3 rounded-xl hover:border-[#1e40af]/40 dark:hover:border-[var(--conectia-arcilla)]/40 transition-colors duration-200 text-sm"
              >
                <List className="h-4 w-4" weight="duotone" />
                {t('home.categories.title')}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { icon: House, value: '+500', label: t('home.hero.stats.properties').toUpperCase() },
                { icon: Star,  value: '98%',  label: t('home.hero.stats.happyClients').toUpperCase() },
                { icon: MapPin,value: 'CTO',  label: t('home.hero.stats.brokers').toUpperCase() },
              ].map((s, i) => (
                <div key={i} className="home-metric-card flex flex-col gap-1 p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 bg-white dark:bg-[#17313A]/10">
                  <s.icon className="h-4 w-4 text-[#1e40af] dark:text-[var(--conectia-arcilla)]" weight="duotone" />
                  <p className="text-2xl font-black text-[#17313A] dark:text-[#EAE4DD] leading-none">{s.value}</p>
                  <p className="text-[9px] uppercase tracking-widest text-[#9CA3AF] dark:text-[#B0ACA6] font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: gran foto — blob shape */}
          <div className="home-hero-visual flex-1 w-full lg:max-w-[52%]">
            <div
              className="home-hero-media relative w-full aspect-[4/3] overflow-hidden shadow-2xl bg-[#F3F4F6] dark:bg-[#17313A]/20"
              style={{ borderRadius: '24px 96px 24px 96px' }}
            >
              {isLoadingProp ? (
                <div className="absolute inset-0 animate-pulse bg-[#E5E7EB] dark:bg-[#EAE4DD]/10" />
              ) : featuredProp ? (
                <>
                  <Image
                    src={featuredProp.imagen || '/placeholder.svg'}
                    alt={featuredProp.titulo}
                    fill
                    className="object-cover scale-[1.03] hover:scale-[1.06] transition-transform duration-700"
                    priority
                  />
                  {/* subtle gradient overlay at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#F3F4F6] dark:bg-[#17313A]/20">
                  <House className="h-12 w-12 text-[#9CA3AF]" weight="duotone" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROPIEDAD DESTACADA ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <div className="home-feature-panel rounded-3xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 bg-white dark:bg-[#17313A]/10 overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* Galería */}
            <div className="md:w-[55%] p-4 flex flex-col gap-3">
              <div className="home-feature-image relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F3F4F6] dark:bg-[#17313A]/20">
                {isLoadingProp ? (
                  <div className="absolute inset-0 animate-pulse bg-[#E5E7EB] dark:bg-[#EAE4DD]/10" />
                ) : featuredProp ? (
                  <Image
                    src={gallery[activeThumb] || '/placeholder.svg'}
                    alt={featuredProp.titulo}
                    fill
                    className="object-cover transition-all duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#F3F4F6] dark:bg-[#17313A]/20">
                    <House className="h-10 w-10 text-[#9CA3AF]" weight="duotone" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {isLoadingProp ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#E5E7EB] dark:bg-[#EAE4DD]/10 animate-pulse" />
                  ))
                ) : featuredProp ? (
                  gallery.slice(0, 4).map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveThumb(i)}
                      className={`home-thumbnail relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        activeThumb === i ? 'border-[var(--conectia-arcilla)]' : 'border-transparent hover:border-[var(--conectia-arcilla)]/40'
                      }`}
                    >
                      <Image src={src || '/placeholder.svg'} alt={`foto ${i}`} fill className="object-cover" />
                    </button>
                  ))
                ) : (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F3F4F6] dark:bg-[#17313A]/20" />
                  ))
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {isLoadingProp ? (
                    <div className="h-4 w-32 bg-[#E5E7EB] dark:bg-[#EAE4DD]/10 rounded animate-pulse" />
                  ) : featuredProp ? (
                    <p className="text-xs font-semibold text-[#9CA3AF] dark:text-[#B0ACA6] uppercase tracking-widest">{featuredProp.ubicacion}</p>
                  ) : (
                    <p className="text-xs font-semibold text-[#9CA3AF] dark:text-[#B0ACA6] uppercase tracking-widest">Propiedad destacada</p>
                  )}
                  <span className="bg-[#1e40af] dark:bg-[var(--conectia-arcilla)] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {isLoadingProp ? '...' : t('common.featured')}
                  </span>
                </div>

                {isLoadingProp ? (
                  <div className="h-8 w-3/4 bg-[#E5E7EB] dark:bg-[#EAE4DD]/10 rounded animate-pulse" />
                ) : featuredProp ? (
                  <h2 className="text-2xl md:text-3xl font-bold text-[#17313A] dark:text-[#EAE4DD] leading-tight">
                    {featuredProp.titulo}
                  </h2>
                ) : (
                  <h2 className="text-2xl md:text-3xl font-bold text-[#17313A] dark:text-[#EAE4DD] leading-tight">
                    Sin propiedad destacada
                  </h2>
                )}

                <div className="w-8 h-[2px] bg-[#1e40af] dark:bg-[var(--conectia-arcilla)] rounded-full" />

                {isLoadingProp ? (
                  <div className="h-10 w-32 bg-[#E5E7EB] dark:bg-[#EAE4DD]/10 rounded animate-pulse" />
                ) : featuredProp ? (
                  <p className="text-4xl font-black text-[#17313A] dark:text-[#EAE4DD]">{formatPrice(featuredProp.precio)}</p>
                ) : (
                  <p className="text-4xl font-black text-[#17313A] dark:text-[#EAE4DD]">—</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-[#6B7280] dark:text-[#B0ACA6]">
                  <span className="flex items-center gap-1.5">
                    <House className="h-4 w-4 text-[#1e40af] dark:text-[var(--conectia-arcilla)]" weight="duotone" />
                    {isLoadingProp ? '...' : featuredProp ? `${featuredProp.habitaciones} Rec` : '—'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bathtub className="h-4 w-4 text-[#1e40af] dark:text-[var(--conectia-arcilla)]" weight="duotone" />
                    {isLoadingProp ? '...' : featuredProp ? `${featuredProp.banos} Baños` : '—'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Ruler className="h-4 w-4 text-[#1e40af] dark:text-[var(--conectia-arcilla)]" weight="duotone" />
                    {isLoadingProp ? '...' : featuredProp ? featuredProp.areaTexto : '—'}
                  </span>
                </div>
              </div>

              <Link href={isLoadingProp || !featuredProp ? '/propiedades' : `/propiedades/${featuredProp.id}`} className="mt-6">
                <div className="home-detail-link flex items-center justify-between p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#EAE4DD]/10 hover:border-[#1e40af]/40 dark:hover:border-[var(--conectia-arcilla)]/40 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1e40af]/10 dark:bg-[var(--conectia-arcilla)]/10 flex items-center justify-center">
                      <Star className="h-4 w-4 text-[#1e40af] dark:text-[var(--conectia-arcilla)]" weight="duotone" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#17313A] dark:text-[#EAE4DD]">{t('common.exclusive')}</p>
                      <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">{t('home.featured.subtitle')}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#1e40af] dark:group-hover:text-[var(--conectia-arcilla)] transition-colors" weight="bold" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROPIEDADES DESTACADAS CAROUSEL ───────────────────── */}
      <section className="home-featured-section relative py-16 sm:py-24 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 mb-12 sm:mb-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--conectia-arcilla)] font-bold mb-2">{t('home.featured.subtitle')}</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#17313A] dark:text-[#EAE4DD] leading-tight">
                {t('properties.pageTitle')} <span className="font-serif italic font-normal text-[var(--conectia-arcilla)]">{t('common.featured')}</span>
              </h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-[#E5E7EB] to-transparent mb-1 hidden sm:block dark:from-[#EAE4DD]/10" />
          </div>
          <FeaturedPropertiesCarousel />
        </div>
      </section>

      {/* ── ALIANZAS COMERCIALES ──────────────────────────────── */}
      <section>
        <CommercialAlliance />
      </section>

      {/* ── AD SLOT ───────────────────────────────────────────── */}
      <HomepageAdSlot ubicacion="footer" />

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="home-cta-panel relative rounded-3xl overflow-hidden bg-[#17313A] dark:bg-[#17313A] px-10 sm:px-16 py-14">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
              <div className="space-y-4 md:max-w-lg">
                <p className="text-[10px] uppercase tracking-[0.40em] text-[var(--conectia-arcilla)] font-semibold">{t('home.newsletter.title')}</p>
                <h2 className="text-4xl sm:text-5xl font-black text-[#EAE4DD] leading-[1.1]">
                  {t('home.cta.title')}
                </h2>
                <p className="text-[#B0ACA6] text-base leading-relaxed max-w-md">
                  {t('home.cta.subtitle')}
                </p>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0 min-w-[200px]">
                <Link href="/contacto">
                  <button className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-deep)] text-white transition-colors duration-200">
                    <MapPin className="h-4 w-4" weight="duotone" />
                    {t('common.contact')}
                  </button>
                </Link>
                <Link href="/propiedades">
                  <button className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold text-[#EAE4DD] border border-[#EAE4DD]/20 hover:border-[var(--conectia-arcilla)]/50 hover:bg-white/5 transition-all duration-200">
                    {t('common.seeMore')} {t('properties.pageTitle')}
                    <ArrowRight className="h-4 w-4" weight="bold" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: House,   value: '+500', label: t('home.hero.stats.properties') },
              { icon: Users,   value: '98%',  label: t('home.hero.stats.happyClients') },
              { icon: MapPin,  value: 'GTO',  label: t('home.hero.stats.brokers') },
              { icon: TrendUp, value: '45d',  label: t('home.cta.title') },
            ].map((stat, i) => (
              <div key={i} className="home-stat-card group p-6 text-center rounded-2xl bg-white dark:bg-[#17313A]/10 border border-[#E5E7EB] dark:border-[#EAE4DD]/10 shadow-sm hover:border-[var(--conectia-arcilla)]/30 transition-colors duration-200">
                <div className="w-10 h-10 rounded-xl bg-[var(--conectia-arcilla)]/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-5 w-5 text-[var(--conectia-arcilla)]" weight="duotone" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-[#17313A] dark:text-[#EAE4DD] mb-1">{stat.value}</p>
                <p className="text-xs text-[#9CA3AF] dark:text-[#B0ACA6] uppercase tracking-wider font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DRAWER CATEGORÍAS ─────────────────────────────────── */}
      {isCategoriasMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setIsCategoriasMenuOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
            <div
              className="home-drawer bg-white dark:bg-[#17313A] border-t border-[#E5E7EB] dark:border-[#EAE4DD]/10 shadow-xl w-full pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 rounded-t-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1 bg-[#E5E7EB] dark:bg-[#EAE4DD]/20 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#EAE4DD]/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--conectia-arcilla)]/10 rounded-lg flex items-center justify-center">
                    <List className="h-4 w-4 text-[var(--conectia-arcilla)]" weight="duotone" />
                  </div>
                  <h3 className="text-base font-black text-[#17313A] dark:text-[#EAE4DD] uppercase tracking-widest">{t('home.categories.title')}</h3>
                </div>
                <button
                  onClick={() => setIsCategoriasMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] dark:bg-[#EAE4DD]/10 hover:bg-[#E5E7EB] dark:hover:bg-[#EAE4DD]/20 transition-colors"
                >
                  <X className="h-4 w-4 text-[#6B7280] dark:text-[#B0ACA6]" weight="bold" />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
                  {[
                    { href: '/compra',     icon: ShoppingBag, label: t('home.search.buy') },
                    { href: '/venta',      icon: Tag,         label: t('home.search.sell') },
                    { href: '/renta',      icon: Key,         label: t('home.search.rent') },
                    { href: '/especiales', icon: Crown,       label: t('home.search.especial') },
                    { href: '/ofertas',    icon: Percent,     label: t('home.search.ofertas') },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link key={href} href={href} onClick={() => setIsCategoriasMenuOpen(false)}>
                      <button className="home-category-card w-full p-3 sm:p-4 rounded-xl bg-white dark:bg-[#17313A]/30 border border-[#E5E7EB] dark:border-[#EAE4DD]/10 hover:border-[var(--conectia-arcilla)]/40 hover:scale-105 active:scale-95 transition-all duration-200 group flex flex-col items-center gap-2 shadow-sm">
                        <div className="w-10 h-10 bg-[var(--conectia-arcilla)]/8 rounded-lg flex items-center justify-center group-hover:bg-[var(--conectia-arcilla)]/15 transition-colors">
                          <Icon className="h-5 w-5 text-[var(--conectia-arcilla)]" weight="duotone" />
                        </div>
                        <span className="text-xs font-bold text-[#17313A] dark:text-[#EAE4DD]">{label}</span>
                      </button>
                    </Link>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/brokers" onClick={() => setIsCategoriasMenuOpen(false)}>
                    <button className="home-category-card w-full p-4 rounded-xl bg-white dark:bg-[#17313A]/30 border border-[#E5E7EB] dark:border-[#EAE4DD]/10 hover:border-[var(--conectia-arcilla)]/40 transition-all duration-200 group flex items-center justify-center gap-3 shadow-sm">
                      <div className="w-9 h-9 bg-[var(--conectia-arcilla)]/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-[var(--conectia-arcilla)]" weight="duotone" />
                      </div>
                      <span className="text-sm font-black text-[#17313A] dark:text-[#EAE4DD] uppercase tracking-wide">{t('nav.menu.broker')}</span>
                    </button>
                  </Link>
                </div>
                <div className="h-4 sm:h-6" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
