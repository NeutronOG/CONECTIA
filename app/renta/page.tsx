"use client"

import { useMemo, useState } from "react"
import { Key, ArrowRight, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePropertiesStatic } from "@/hooks/use-properties-static"
import { PropertyCard, EmptyProperties } from "@/components/property-card"
import { SubcategoryFilter } from "@/components/subcategory-filter"
import { useLanguage } from "@/lib/i18n"

const HERO_IMAGE = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80"

export default function RentaPage() {
  const { t } = useLanguage()
  const { properties } = usePropertiesStatic()
  const [tipoFilter, setTipoFilter] = useState<string[]>([])

  const BENEFICIOS = [
    { label: t('home.search.rent'), sub: t('pages.renta.subtitle') },
    { label: t('properties.filters.allTypes'), sub: t('home.hero.subtitle') },
    { label: t('common.contact'), sub: t('footer.links.help') },
  ]

  const propiedades = useMemo(() => {
    let result = properties.filter(p => p.categoria === 'renta')
    if (tipoFilter.length > 0) {
      result = result.filter(p => tipoFilter.some(t => p.tipo?.toLowerCase() === t.toLowerCase()))
    }
    return result
  }, [properties, tipoFilter])

  return (
    <div className="min-h-screen bg-conectia-surface">

      {/* HERO — Clean modern split */}
      <section className="relative min-h-[85dvh] flex flex-col lg:flex-row bg-[#F6F2EE] dark:bg-[#0F2027]">

        {/* Izquierda: contenido claro */}
        <div className="relative flex-1 lg:max-w-[50%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 sm:py-20 z-10">
          <div className="max-w-xl space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#17313A]/5 dark:bg-[#EAE4DD]/5 border border-[#17313A]/10 dark:border-[#EAE4DD]/10">
              <Key className="h-3.5 w-3.5 text-[#C78F7B]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#17313A] dark:text-[#EAE4DD] font-bold">{t('common.appName')}</span>
            </div>

            {/* Título */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#17313A] dark:text-[#EAE4DD] leading-[0.95]">{t('pages.renta.title')}</h1>
              <p className="text-2xl sm:text-3xl font-light text-[#C78F7B] dark:text-[#C78F7B] italic mt-2">{t('pages.renta.subtitle')}</p>
            </div>

            {/* Descripción */}
            <p className="text-[#4A4F57] dark:text-[#B0ACA6] text-base leading-relaxed max-w-md">
              {t('pages.renta.subtitle')}
            </p>

            {/* Beneficios como tarjetas */}
            <div className="flex flex-wrap gap-3">
              {BENEFICIOS.map((b) => (
                <div key={b.label} className="px-4 py-3 rounded-xl bg-white dark:bg-[#17313A]/30 border border-[#17313A]/8 dark:border-[#EAE4DD]/10 shadow-sm">
                  <p className="text-[#17313A] dark:text-[#EAE4DD] text-sm font-semibold">{b.label}</p>
                  <p className="text-[#B0ACA6] dark:text-[#B0ACA6] text-xs mt-0.5">{b.sub}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4 pt-2">
              <Badge className="bg-[#C78F7B]/15 text-[#C78F7B] border border-[#C78F7B]/25 text-sm font-semibold px-4 py-2">
                {propiedades.length} {t('properties.cards.forRent').toLowerCase()}
              </Badge>
              <Link href="/contacto">
                <Button className="bg-[#17313A] hover:bg-[#0F2027] text-white gap-2 text-sm rounded-xl px-6">
                  {t('common.contact')} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Derecha: imagen con bordes redondeados */}
        <div className="relative flex-1 min-h-[40vh] lg:min-h-0 p-4 lg:p-6 lg:pl-0">
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
            <img src={HERO_IMAGE} alt={t('pages.renta.title')} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#17313A]/30 via-transparent to-transparent" />

            {/* Tarjeta flotante */}
            <div className="absolute bottom-6 right-6 bg-white/95 dark:bg-[#17313A]/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-[#17313A]/5 dark:border-[#EAE4DD]/10">
              <div className="flex items-center gap-1 mb-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm font-bold text-[#17313A] dark:text-[#EAE4DD]">{t('home.hero.stats.happyClients')}</p>
              <p className="text-xs text-[#B0ACA6] dark:text-[#B0ACA6]">+200 {t('pages.renta.title').toLowerCase()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-conectia-primary font-bold">{t('properties.pageTitle')}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-conectia-accent mt-1">{t('properties.availableTitle')}</h2>
            </div>
            <div className="h-px flex-1 mx-8 bg-conectia-primary/20 hidden sm:block" />
          </div>
          <SubcategoryFilter onChange={setTipoFilter} variant="light" resultCount={propiedades.length} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {propiedades.map((p) => (<PropertyCard key={p.id} propiedad={p as any} badgeLabel={t('properties.cards.forRent')} />))}
            {propiedades.length === 0 && (<EmptyProperties label={t('properties.empty.subtitle')} />)}
          </div>
        </div>
      </section>
    </div>
  )
}
