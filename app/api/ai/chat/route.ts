import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type Property = {
  id: number
  titulo: string
  ubicacion: string
  precio: number
  precioTexto: string
  tipo: string
  habitaciones: number
  banos: number
  area: number
  areaTexto: string
  imagen: string
  descripcion: string
  caracteristicas: string[]
  status: string
  categoria: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false } },
)

const normalize = (value: string) => value
  .toLocaleLowerCase("es-MX")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")

const formatPrice = (value: number) => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
}).format(value)

function readAmount(query: string) {
  const match = query.match(/(?:\$\s*)?(\d+(?:[.,]\d+)?)\s*(millones?|mdp|m\b)|\$\s*(\d{1,3}(?:[,.]\d{3})+)/i)
  if (!match) return null

  const raw = match[1] || match[3]
  const number = Number(raw.replace(/,/g, ""))
  if (!Number.isFinite(number)) return null
  return match[2] || number < 1_000 ? number * 1_000_000 : number
}

function searchProperties(properties: Property[], rawQuery: string) {
  const query = normalize(rawQuery)
  const amount = readAmount(query)
  const wantsMaximum = /hasta|menos de|maximo|presupuesto|no mas de|barato|economico/.test(query)
  const wantsMinimum = /desde|mas de|al menos|superior a/.test(query)
  const bedrooms = query.match(/(\d+)\s*(?:recamaras?|habitaciones?|cuartos?|hab\b)/)?.[1]
  const bathrooms = query.match(/(\d+)\s*(?:banos?|baths?)/)?.[1]
  const area = query.match(/(\d+)\s*(?:m2|m²|metros?(?: cuadrados?)?)/)?.[1]
  const isRental = /renta|rentar|alquilar|arrendar/.test(query)
  const isSale = /venta|comprar|compra|adquirir/.test(query)

  const typeAliases: Record<string, string[]> = {
    casa: ["casa", "residencia", "villa"],
    departamento: ["departamento", "depto", "apartamento", "dpto", "flat"],
    penthouse: ["penthouse", "pent house"],
    terreno: ["terreno", "lote", "predio"],
    oficina: ["oficina"],
    local: ["local", "comercial"],
    bodega: ["bodega", "nave"],
    loft: ["loft"],
  }
  const detectedType = Object.entries(typeAliases).find(([, aliases]) => aliases.some(alias => query.includes(alias)))

  const terms = query
    .split(/[^\p{L}\p{N}]+/u)
    .filter(term => term.length > 3 && !new Set(["busco", "quiero", "propiedad", "propiedades", "cerca", "para", "renta", "venta", "hasta", "desde", "recamaras", "habitaciones"]).has(term))

  const scored = properties.map(property => {
    const searchable = normalize(`${property.titulo} ${property.ubicacion} ${property.tipo} ${property.descripcion} ${(property.caracteristicas || []).join(" ")}`)
    let score = terms.reduce((total, term) => total + (searchable.includes(term) ? 3 : 0), 0)
    let matches = true

    if (amount) {
      if (wantsMinimum && !wantsMaximum) matches &&= property.precio >= amount
      else matches &&= property.precio <= amount
      if (matches) score += 2
    }
    if (bedrooms) {
      matches &&= property.habitaciones >= Number(bedrooms)
      if (matches) score += 2
    }
    if (bathrooms) {
      matches &&= property.banos >= Number(bathrooms)
      if (matches) score += 1
    }
    if (area) matches &&= property.area >= Number(area)
    if (isRental && !isSale) matches &&= property.categoria === "renta"
    if (isSale && !isRental) matches &&= property.categoria !== "renta"
    if (detectedType) {
      matches &&= detectedType[1].some(alias => normalize(property.tipo).includes(alias))
      if (matches) score += 3
    }

    return { property, score, matches }
  })

  const strictResults = scored.filter(item => item.matches && (terms.length === 0 || item.score > 0))
  const results = strictResults.length > 0
    ? strictResults
    : scored.filter(item => item.score > 0)

  return results
    .sort((a, b) => b.score - a.score || a.property.precio - b.property.precio)
    .slice(0, 6)
    .map(item => item.property)
}

function buildReply(query: string, results: Property[]) {
  if (results.length === 0) {
    return "No encontré una coincidencia exacta en el inventario disponible. Prueba con otra zona, un presupuesto distinto o deja tus datos y un asesor hará una búsqueda personalizada."
  }

  const summary = results.length === 1 ? "Encontré una opción que encaja" : `Encontré ${results.length} opciones que encajan`
  const first = results[0]
  return `${summary} con tu búsqueda. La primera es ${first.titulo}, en ${first.ubicacion}, desde ${first.precioTexto || formatPrice(first.precio)}. Puedes abrir la ficha para revisar todos los detalles.`
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const rawMessage = payload?.messages?.at?.(-1)?.content
    const query = typeof rawMessage === "string" ? rawMessage.trim().slice(0, 500) : ""

    if (!query) return NextResponse.json({ error: "Escribe qué estás buscando." }, { status: 400 })
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "La búsqueda no está configurada." }, { status: 503 })
    }

    const { data, error } = await supabase
      .from("propiedades")
      .select("id, titulo, ubicacion, precio, precio_texto, tipo, habitaciones, banos, area, area_texto, imagen, descripcion, caracteristicas, status, categoria")
      .in("status", ["Disponible", "Exclusiva"])
      .order("created_at", { ascending: false })
      .limit(150)

    if (error) throw error

    const properties: Property[] = (data || []).map((property: any) => ({
      id: Number(property.id),
      titulo: property.titulo,
      ubicacion: property.ubicacion,
      precio: Number(property.precio),
      precioTexto: property.precio_texto || formatPrice(Number(property.precio)),
      tipo: property.tipo,
      habitaciones: property.habitaciones || 0,
      banos: property.banos || 0,
      area: property.area || 0,
      areaTexto: property.area_texto || `${property.area || 0} m²`,
      imagen: property.imagen || "/placeholder.svg",
      descripcion: property.descripcion || "",
      caracteristicas: property.caracteristicas || [],
      status: property.status,
      categoria: property.categoria || "venta",
    }))
    const results = searchProperties(properties, query)

    return NextResponse.json({
      response: buildReply(query, results),
      properties: results,
      total: results.length,
      source: "supabase",
    })
  } catch (error) {
    console.error("Property assistant error:", error)
    return NextResponse.json(
      { error: "No pudimos consultar el inventario en este momento. Inténtalo de nuevo." },
      { status: 500 },
    )
  }
}
