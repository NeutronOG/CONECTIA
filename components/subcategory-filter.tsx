"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"

export const SUBCATEGORY_GROUPS = [
  {
    label: "Residencial",
    items: [
      "Casa", "Casa en condominio", "Residencia", "Departamento",
      "Penthouse", "Loft", "Dúplex", "Villa", "Quinta",
      "Cabaña", "Rancho", "Hacienda", "Finca", "Condominio"
    ]
  },
  {
    label: "Terrenos",
    items: [
      "Terreno campestre", "Terreno habitacional", "Terreno comercial",
      "Terreno industrial", "Terreno agrícola", "Terreno mixto", "Históricos"
    ]
  },
  {
    label: "Comercial",
    items: [
      "Local comercial", "Plaza comercial", "Oficina", "Consultorio",
      "Edificio comercial", "Edificio mixto", "Hotel", "Hospital",
      "Clínica", "Centro médico", "Restaurante", "Salón de eventos"
    ]
  },
  {
    label: "Industrial",
    items: [
      "Nave industrial", "Bodega industrial", "Bodega comercial",
      "Parque industrial", "Patio de maniobras"
    ]
  },
  {
    label: "Especial",
    items: [
      "Complejo habitacional", "Centro de negocios", "Granja", "Motel"
    ]
  }
]

export const ALL_SUBCATEGORY_ITEMS = SUBCATEGORY_GROUPS.flatMap(g => g.items)

interface SubcategoryFilterProps {
  onChange: (tiposSeleccionados: string[]) => void
  variant?: "light" | "dark"
  resultCount?: number
}

export function SubcategoryFilter({ onChange, variant = "light", resultCount }: SubcategoryFilterProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedSub, setSelectedSub] = useState<string | null>(null)

  const isDark = variant === "dark"
  const activeGroup = SUBCATEGORY_GROUPS.find(g => g.label === selectedGroup)

  const handleGroupClick = (groupLabel: string) => {
    if (selectedGroup === groupLabel) {
      setSelectedGroup(null)
      setSelectedSub(null)
      onChange([])
    } else {
      setSelectedGroup(groupLabel)
      setSelectedSub(null)
      const group = SUBCATEGORY_GROUPS.find(g => g.label === groupLabel)!
      onChange(group.items)
    }
  }

  const handleSubClick = (sub: string) => {
    if (selectedSub === sub) {
      setSelectedSub(null)
      const group = SUBCATEGORY_GROUPS.find(g => g.label === selectedGroup)!
      onChange(group.items)
    } else {
      setSelectedSub(sub)
      onChange([sub])
    }
  }

  const handleAllClick = () => {
    setSelectedGroup(null)
    setSelectedSub(null)
    onChange([])
  }

  const groupBase = "flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap"
  const groupActive = isDark ? "bg-[#C78F7B] text-[#0F2027]" : "bg-[#17313A] text-white shadow-sm"
  const groupInactive = isDark
    ? "bg-white/8 text-white/70 border border-white/10 hover:bg-white/15 hover:text-white"
    : "bg-white border border-[#17313A]/12 text-[#4A4F57] hover:border-[#17313A]/30 hover:text-[#17313A] shadow-sm"

  const subBase = "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap"
  const subActive = "bg-[#C78F7B] text-white shadow-sm"
  const subInactive = isDark
    ? "bg-white/5 text-white/60 border border-white/10 hover:bg-white/12 hover:text-white"
    : "bg-white border border-[#17313A]/10 text-[#4A4F57] hover:border-[#C78F7B]/40 hover:text-[#C78F7B] shadow-sm"

  return (
    <div className="space-y-3 mb-8">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className={`text-[10px] uppercase tracking-[0.35em] font-bold ${isDark ? "text-[#C78F7B]" : "text-[#17313A]/50"}`}>
          Subcategoría
        </p>
        {(selectedGroup || selectedSub) && (
          <button
            onClick={handleAllClick}
            className={`text-xs font-medium transition-colors ${isDark ? "text-white/40 hover:text-white/70" : "text-[#B0ACA6] hover:text-[#17313A]"}`}
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {/* Group tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={handleAllClick}
          className={`${groupBase} ${!selectedGroup ? groupActive : groupInactive}`}
        >
          Todas
        </button>
        {SUBCATEGORY_GROUPS.map(g => (
          <button
            key={g.label}
            onClick={() => handleGroupClick(g.label)}
            className={`${groupBase} ${selectedGroup === g.label ? groupActive : groupInactive}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Subcategory pills */}
      {activeGroup && (
        <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <button
            onClick={handleAllClick}
            className={`${subBase} flex items-center gap-1 ${isDark ? "bg-white/10 text-white/50 hover:text-white border border-white/10" : "border border-[#17313A]/10 text-[#B0ACA6] hover:text-[#17313A]"}`}
          >
            <ChevronLeft className="h-3 w-3" /> Todo {activeGroup.label}
          </button>
          {activeGroup.items.map(sub => (
            <button
              key={sub}
              onClick={() => handleSubClick(sub)}
              className={`${subBase} ${selectedSub === sub ? subActive : subInactive}`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      {resultCount !== undefined && (selectedGroup || selectedSub) && (
        <p className={`text-xs ${isDark ? "text-white/40" : "text-[#B0ACA6]"}`}>
          {resultCount} {resultCount === 1 ? "propiedad" : "propiedades"} encontrada{resultCount === 1 ? "" : "s"}
          {selectedSub ? ` en "${selectedSub}"` : selectedGroup ? ` en ${selectedGroup}` : ""}
        </p>
      )}
    </div>
  )
}
