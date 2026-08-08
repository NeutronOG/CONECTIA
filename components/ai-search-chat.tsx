"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowUp, Bot, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface AssistantProperty {
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
  categoria?: string
}

type Message = {
  id: string
  role: "assistant" | "user"
  content: string
  properties?: AssistantProperty[]
}

const firstMessage: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hola, soy el asistente de CONECTIA. Dime qué buscas y consultaré las propiedades disponibles ahora mismo.",
}

const suggestions = [
  "Casa en León con 3 recámaras",
  "Departamento en renta",
  "Terreno hasta 5 millones",
]

function localSearch(properties: AssistantProperty[], query: string) {
  const terms = query.toLocaleLowerCase("es-MX").split(/\s+/).filter(term => term.length > 3)
  return properties
    .filter(property => {
      const text = `${property.titulo} ${property.ubicacion} ${property.tipo} ${property.descripcion} ${(property.caracteristicas || []).join(" ")}`.toLocaleLowerCase("es-MX")
      return terms.some(term => text.includes(term))
    })
    .slice(0, 6)
}

function formatPrice(property: AssistantProperty) {
  return property.precioTexto || new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", maximumFractionDigits: 0,
  }).format(property.precio)
}

interface AISearchChatProps {
  isOpen: boolean
  onClose: () => void
  properties?: AssistantProperty[]
}

export function AISearchChat({ isOpen, onClose, properties = [] }: AISearchChatProps) {
  const [messages, setMessages] = useState<Message[]>([firstMessage])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 120)
    return () => window.clearTimeout(timeout)
  }, [isOpen])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const submit = async (providedQuery?: string) => {
    const cleanQuery = (providedQuery ?? query).trim()
    if (!cleanQuery || isLoading) return

    setMessages(previous => [...previous, { id: `user-${Date.now()}`, role: "user", content: cleanQuery }])
    setQuery("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ content: cleanQuery }] }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Search error")

      setMessages(previous => [...previous, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        properties: data.properties,
      }])
    } catch {
      const matches = localSearch(properties, cleanQuery)
      setMessages(previous => [...previous, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: matches.length
          ? `Te muestro ${matches.length} opciones que coinciden con esa búsqueda.`
          : "No pude consultar el inventario en este momento. Puedes intentar nuevamente o contactar a un asesor.",
        properties: matches,
      }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] flex items-end justify-end bg-[#0d2026]/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Asistente de búsqueda CONECTIA">
      <div className="flex h-[min(740px,100dvh)] w-full flex-col overflow-hidden bg-[#fbfaf8] shadow-2xl sm:h-[min(740px,calc(100dvh-3rem))] sm:max-w-[540px] sm:rounded-[28px]" onClick={event => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-[#17313a]/10 bg-[#17313A] px-5 py-4 text-[#f5f0ea] sm:px-6">
          <div className="flex min-w-0 items-center">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#dfb29e]">CONECTIA</p>
              <h2 className="truncate font-serif text-xl leading-none">Asistente de propiedades</h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white hover:bg-white/10 hover:text-white" aria-label="Cerrar asistente">
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="border-b border-[#17313a]/10 bg-white px-5 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-[#52646a]">
            <span className="h-2 w-2 rounded-full bg-[#7d9b88]" />
            Inventario en vivo
            <span className="text-[#90a0a4]">·</span>
            Resultados directos de CONECTIA
          </div>
        </div>

        <main className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-6">
          {messages.map(message => (
            <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[88%]" : "max-w-[92%]"}>
              {message.role === "assistant" && (
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#718186]">
                  <Bot className="h-3.5 w-3.5" /> CONECTIA
                </div>
              )}
              <p className={message.role === "user"
                ? "rounded-2xl rounded-br-md bg-[#17313A] px-4 py-3 text-sm leading-relaxed text-white"
                : "rounded-2xl rounded-tl-md border border-[#17313a]/10 bg-white px-4 py-3 text-sm leading-relaxed text-[#263e46] shadow-[0_5px_20px_rgba(23,49,58,0.05)]"}
              >{message.content}</p>

              {message.properties && message.properties.length > 0 && (
                <div className="mt-3 space-y-3">
                  {message.properties.slice(0, 3).map(property => (
                    <Link key={property.id} href={`/propiedades/${property.id}`} className="group block overflow-hidden rounded-2xl border border-[#17313a]/10 bg-white transition hover:-translate-y-0.5 hover:border-[#17313a]/25 hover:shadow-lg">
                      <div className="flex gap-3 p-3">
                        <img src={property.imagen || "/placeholder.svg"} alt="" className="h-[76px] w-[88px] rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.13em] text-[#9a7062]">{property.tipo}</p>
                          <h3 className="truncate font-serif text-lg leading-tight text-[#17313A]">{property.titulo}</h3>
                          <p className="mt-1 truncate text-xs text-[#64767b]">{property.ubicacion}</p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-[#17313A]">{formatPrice(property)}</p>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#80594d] group-hover:underline">Ver ficha <span aria-hidden>→</span></span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {message.properties.length > 3 && <Link href="/propiedades" className="block pt-1 text-center text-xs font-semibold text-[#80594d] hover:underline">Ver las {message.properties.length} opciones</Link>}
                </div>
              )}
            </div>
          ))}

          {messages.length === 1 && !isLoading && (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map(suggestion => <button key={suggestion} onClick={() => submit(suggestion)} className="rounded-full border border-[#17313a]/15 bg-white px-3 py-2 text-left text-xs text-[#3c545b] transition hover:border-[#9a7062] hover:text-[#80594d]">{suggestion}</button>)}
            </div>
          )}

          {isLoading && <div className="flex items-center gap-2 text-sm text-[#65777c]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#9a7062]" />Consultando propiedades disponibles…</div>}
          <div ref={endRef} />
        </main>

        <footer className="border-t border-[#17313a]/10 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2 rounded-2xl border border-[#17313a]/15 bg-[#fbfaf8] p-1.5 focus-within:border-[#80594d] focus-within:ring-2 focus-within:ring-[#80594d]/10">
            <input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Enter") submit() }} disabled={isLoading} placeholder="Ej. casa en León con jardín" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-[#17313A] outline-none placeholder:text-[#8c999c]" />
            <Button onClick={() => submit()} disabled={!query.trim() || isLoading} size="icon" className="h-9 w-9 shrink-0 rounded-xl bg-[#17313A] text-white hover:bg-[#274c58]" aria-label="Enviar búsqueda">
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-[#7b898d]">
            <span>Busca por zona, tipo, precio o recámaras.</span>
            <Link href="/contacto" className="font-semibold text-[#80594d] hover:underline">Hablar con un asesor</Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
