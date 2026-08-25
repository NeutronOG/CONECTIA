"use client"

import { useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PropertyCard, EmptyProperties } from "@/components/property-card"
import { SubcategoryFilter } from "@/components/subcategory-filter"
import { usePropertiesStatic } from "@/hooks/use-properties-static"
import type { PropertyCategory } from "@/lib/property-categories"

interface CategoryPropertyPageProps {
  title: string
  description: string
  badge: string
  icon: LucideIcon
  categories: readonly PropertyCategory[]
}

/** Página reutilizable para que cada categoría del menú muestre sus publicaciones. */
export function CategoryPropertyPage({ title, description, badge, icon: Icon, categories }: CategoryPropertyPageProps) {
  const { properties } = usePropertiesStatic()
  const [tipoFilter, setTipoFilter] = useState<string[]>([])

  const propiedades = useMemo(() => {
    let result = properties.filter((property) => categories.includes(property.categoria))
    if (tipoFilter.length > 0) {
      result = result.filter((property) =>
        tipoFilter.some((tipo) => property.tipo?.toLowerCase() === tipo.toLowerCase())
      )
    }
    return result
  }, [categories, properties, tipoFilter])

  return (
    <main className="min-h-screen bg-[#F6F2EE] dark:bg-[#0F2027] pt-24">
      <section className="bg-[#17313A] text-white px-5 py-14 sm:px-10 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 text-[var(--conectia-arcilla)] text-xs font-bold uppercase tracking-[0.3em]">
            <Icon className="h-4 w-4" /> Explorar
          </div>
          <h1 className="mt-4 text-4xl sm:text-6xl font-black">{title}</h1>
          <p className="mt-4 max-w-2xl text-white/75 text-base sm:text-lg">{description}</p>
          <Badge className="mt-6 bg-[var(--conectia-arcilla)]/20 text-[var(--conectia-arcilla)] border border-[var(--conectia-arcilla)]/30 px-4 py-2">
            {propiedades.length} {badge.toLowerCase()}
          </Badge>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <SubcategoryFilter onChange={setTipoFilter} resultCount={propiedades.length} />
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {propiedades.map((property) => (
            <PropertyCard key={property.id} propiedad={property} badgeLabel={badge} />
          ))}
          {propiedades.length === 0 && <EmptyProperties label={`Aún no hay propiedades en ${title.toLowerCase()}.`} />}
        </div>
      </section>
    </main>
  )
}
