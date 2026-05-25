"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Send, 
  Bot, 
  User, 
  MessageSquare,
  ExternalLink,
  Sparkles,
  Search,
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Property {
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
  fechaPublicacion?: string
}

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  properties?: Property[]
  suggestions?: string[]
}

interface AISearchChatProps {
  isOpen: boolean
  onClose: () => void
  properties: Property[]
}

export function AISearchChat({ isOpen, onClose, properties }: AISearchChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '¡Hola! Soy tu asistente de búsqueda inteligente de CONECTIA. Puedo ayudarte a encontrar la propiedad perfecta. ¿Qué tipo de propiedad estás buscando?',
      timestamp: new Date(),
      suggestions: [
        'Busco un penthouse en Polanco',
        'Quiero una casa con jardín',
        'Necesito 3 habitaciones máximo $15M',
        'Propiedades cerca del centro'
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationHistory = useRef<Array<{ type: 'user' | 'ai'; content: string }>>([
    {
      type: 'ai',
      content: '¡Hola! Soy tu asistente de búsqueda inteligente de CONECTIA. Puedo ayudarte a encontrar la propiedad perfecta. ¿Qué tipo de propiedad estás buscando?'
    }
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Sistema de IA interno para procesar consultas
  const processAIQuery = (query: string): { results: Property[], response: string, suggestions?: string[] } => {
    const q = query.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos para comparar
    const qOrig = query.toLowerCase()

    // ── 1. PARSEAR PRECIO ──────────────────────────────────────────────────────
    // Detectar números escritos como "5 millones", "5m", "5,000,000", "$5M", "cinco millones"
    const wordNumbers: Record<string, number> = {
      'un millon': 1e6, 'uno millon': 1e6, 'dos millones': 2e6, 'tres millones': 3e6,
      'cuatro millones': 4e6, 'cinco millones': 5e6, 'seis millones': 6e6,
      'siete millones': 7e6, 'ocho millones': 8e6, 'nueve millones': 9e6,
      'diez millones': 10e6, 'quince millones': 15e6, 'veinte millones': 20e6
    }

    let parsedPrice: number | null = null
    // Primero intentar palabras escritas
    for (const [word, val] of Object.entries(wordNumbers)) {
      if (q.includes(word)) { parsedPrice = val; break }
    }
    // Luego patrones numéricos: "5 millones", "5m", "5.5m", "$5,000,000", "5000000"
    if (!parsedPrice) {
      const patterns = [
        /\$?\s*(\d+(?:[.,]\d+)?)\s*(?:millones?|mdp|mdd|m(?=\s|$))/i,
        /\$?\s*(\d{1,3}(?:[.,]\d{3})+)/,  // 5,000,000 o 5.000.000
        /presupuesto[^0-9]*(\d+(?:[.,]\d+)?)\s*(?:millones?|m)?/i,
        /hasta[^0-9]*(\d+(?:[.,]\d+)?)\s*(?:millones?|m)?/i,
        /maximo[^0-9]*(\d+(?:[.,]\d+)?)\s*(?:millones?|m)?/i,
        /menos de[^0-9]*(\d+(?:[.,]\d+)?)\s*(?:millones?|m)?/i,
      ]
      for (const pat of patterns) {
        const m = q.match(pat)
        if (m) {
          let num = parseFloat(m[1].replace(/,/g, ''))
          // Si el número es pequeño (< 1000), asumir millones
          if (num < 1000) num = num * 1e6
          parsedPrice = num
          break
        }
      }
    }

    // Detectar si es precio máximo o mínimo
    const isMaxPrice = /presupuesto|maximo|hasta|menos de|no mas de|no pase de|que no sea mas|por menos|economico|barato/i.test(q)
    const isMinPrice = /minimo|desde|mas de|superior a|por encima/i.test(q)

    // ── 2. PARSEAR HABITACIONES ────────────────────────────────────────────────
    const roomsMatch = q.match(/(\d+)\s*(?:hab(?:itacion(?:es)?)?|rec(?:amara(?:s)?)?|cuarto(?:s)?|bedroom(?:s)?)/i)
    const rooms = roomsMatch ? parseInt(roomsMatch[1]) : null
    const roomsIsMin = /mas de|minimo|al menos|por lo menos/.test(q)
    const roomsIsMax = /maximo|hasta|menos de/.test(q)

    // ── 3. PARSEAR BAÑOS ──────────────────────────────────────────────────────
    const bathsMatch = q.match(/(\d+)\s*(?:bano(?:s)?|bathroom(?:s)?)/i)
    const baths = bathsMatch ? parseInt(bathsMatch[1]) : null

    // ── 4. PARSEAR ÁREA ───────────────────────────────────────────────────────
    const areaMatch = q.match(/(\d+)\s*(?:m2|m²|metros?(?:\s*cuadrados?)?)/i)
    const area = areaMatch ? parseInt(areaMatch[1]) : null
    const areaIsMax = /maximo|hasta|menos de/.test(q)
    const areaIsMin = /minimo|desde|mas de/.test(q)

    // ── 5. DETECTAR TIPO DE OPERACIÓN ─────────────────────────────────────────
    const isRenta = /rent(?:a(?:r)?)?|arrendar|alquil/i.test(q)
    const isVenta = /venta|comprar|compra|adquirir/i.test(q)

    // ── 6. DETECTAR UBICACIÓN ─────────────────────────────────────────────────
    const locationMap: Record<string, string[]> = {
      'polanco': ['polanco'],
      'roma': ['roma norte', 'roma sur', 'roma'],
      'condesa': ['condesa'],
      'santa fe': ['santa fe'],
      'lomas': ['lomas altas', 'lomas de chapultepec', 'lomas'],
      'interlomas': ['interlomas'],
      'leon': ['leon', 'guanajuato', 'gto'],
      'valenciana': ['valenciana'],
      'gran jardin': ['gran jardin', 'gran jardín'],
      'campestre': ['campestre'],
      'refugio': ['refugio'],
      'mayorazgo': ['mayorazgo'],
      'canada': ['canada', 'cañada'],
      'puerta plata': ['puerta plata'],
      'san isidro': ['san isidro'],
      'centro': ['centro historico', 'centro'],
    }
    let detectedLocation: string | null = null
    for (const [key, aliases] of Object.entries(locationMap)) {
      if (aliases.some(a => q.includes(a)) || q.includes(key)) {
        detectedLocation = key
        break
      }
    }

    // ── 7. DETECTAR TIPO DE PROPIEDAD ─────────────────────────────────────────
    const typeMap: Record<string, string[]> = {
      'penthouse': ['penthouse', 'atico', 'pent house'],
      'casa': ['casa', 'villa', 'residencia', 'vivienda', 'chalet'],
      'departamento': ['departamento', 'depto', 'apartamento', 'dpto', 'flat'],
      'loft': ['loft'],
      'terreno': ['terreno', 'lote', 'predio', 'hectareas', 'hectarea'],
      'local comercial': ['local', 'comercial', 'negocio'],
      'oficina': ['oficina'],
      'bodega': ['bodega', 'nave', 'industrial'],
      'hospital': ['hospital'],
      'clinica': ['clinica'],
    }
    let detectedType: string | null = null
    for (const [key, aliases] of Object.entries(typeMap)) {
      if (aliases.some(a => q.includes(a))) {
        detectedType = key
        break
      }
    }

    // ── 8. DETECTAR AMENIDADES ────────────────────────────────────────────────
    const amenityMap: Record<string, string[]> = {
      'alberca': ['alberca', 'piscina', 'pool'],
      'jardin': ['jardin', 'garden', 'area verde'],
      'terraza': ['terraza', 'balcon', 'roof'],
      'gimnasio': ['gimnasio', 'gym'],
      'seguridad': ['seguridad', 'vigilancia', 'guardia'],
      'estacionamiento': ['estacionamiento', 'garage', 'cochera'],
      'elevador': ['elevador', 'ascensor'],
    }
    const detectedAmenities: string[] = []
    for (const [key, aliases] of Object.entries(amenityMap)) {
      if (aliases.some(a => q.includes(a))) detectedAmenities.push(key)
    }

    // ── 9. APLICAR FILTROS ────────────────────────────────────────────────────
    let filtered = [...properties]

    // Precio
    if (parsedPrice) {
      if (isMaxPrice && !isMinPrice) {
        filtered = filtered.filter(p => p.precio <= parsedPrice!)
      } else if (isMinPrice && !isMaxPrice) {
        filtered = filtered.filter(p => p.precio >= parsedPrice!)
      } else {
        // Sin contexto claro → asumir máximo (lo más común en búsquedas)
        filtered = filtered.filter(p => p.precio <= parsedPrice!)
      }
    }

    // Operación
    if (isRenta && !isVenta) {
      filtered = filtered.filter(p => p.categoria === 'renta')
    } else if (isVenta && !isRenta) {
      filtered = filtered.filter(p => p.categoria === 'venta' || p.categoria === 'exclusivo' || p.categoria === 'remate')
    }

    // Ubicación
    if (detectedLocation) {
      const aliases = locationMap[detectedLocation]
      filtered = filtered.filter(p => {
        const loc = p.ubicacion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return aliases.some(a => loc.includes(a)) || loc.includes(detectedLocation!)
      })
    }

    // Tipo
    if (detectedType) {
      filtered = filtered.filter(p => {
        const tipo = p.tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const aliases = typeMap[detectedType!]
        return aliases.some(a => tipo.includes(a)) || tipo.includes(detectedType!)
      })
    }

    // Habitaciones
    if (rooms !== null) {
      if (roomsIsMin) filtered = filtered.filter(p => p.habitaciones >= rooms)
      else if (roomsIsMax) filtered = filtered.filter(p => p.habitaciones <= rooms)
      else filtered = filtered.filter(p => p.habitaciones >= rooms) // al menos N
    }

    // Baños
    if (baths !== null) {
      filtered = filtered.filter(p => p.banos >= baths)
    }

    // Área
    if (area !== null) {
      if (areaIsMax) filtered = filtered.filter(p => p.area <= area)
      else if (areaIsMin) filtered = filtered.filter(p => p.area >= area)
      else filtered = filtered.filter(p => p.area >= area)
    }

    // Amenidades
    for (const amenity of detectedAmenities) {
      const aliases = amenityMap[amenity]
      filtered = filtered.filter(p => {
        const searchable = [...p.caracteristicas, p.descripcion].join(' ').toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return aliases.some(a => searchable.includes(a))
      })
    }

    // ── 10. FALLBACK: búsqueda por texto libre si no hay resultados ───────────
    if (filtered.length === 0) {
      const stopWords = new Set(['que', 'con', 'una', 'para', 'por', 'los', 'las', 'del', 'en', 'de', 'un', 'la', 'el', 'se', 'al', 'mi', 'me'])
      const words = q.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w))
      if (words.length > 0) {
        const textMatches = properties.filter(p => {
          const text = `${p.titulo} ${p.ubicacion} ${p.descripcion} ${p.caracteristicas.join(' ')}`.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          return words.some(w => text.includes(w))
        })
        if (textMatches.length > 0) filtered = textMatches
      }
    }

    // ── 11. ORDENAR POR RELEVANCIA ────────────────────────────────────────────
    if (filtered.length > 1) {
      const stopWords = new Set(['que', 'con', 'una', 'para', 'por', 'los', 'las', 'del', 'en', 'de', 'un', 'la', 'el'])
      const words = q.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w))
      filtered.sort((a, b) => {
        const ta = `${a.titulo} ${a.ubicacion} ${a.descripcion}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const tb = `${b.titulo} ${b.ubicacion} ${b.descripcion}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const ma = words.filter(w => ta.includes(w)).length
        const mb = words.filter(w => tb.includes(w)).length
        // Si hay precio máximo, ordenar de menor a mayor precio
        if (parsedPrice && isMaxPrice) return a.precio - b.precio
        return mb - ma
      })
    }

    // ── 12. GENERAR RESPUESTA ─────────────────────────────────────────────────
    const criterios: string[] = []
    if (detectedType) criterios.push(detectedType)
    if (detectedLocation) criterios.push(`en ${detectedLocation}`)
    if (parsedPrice) criterios.push(`presupuesto ${isMinPrice ? 'desde' : 'hasta'} $${(parsedPrice/1e6).toFixed(parsedPrice%1e6===0?0:1)}M`)
    if (rooms) criterios.push(`${rooms}+ recámaras`)
    if (baths) criterios.push(`${baths}+ baños`)
    if (isRenta) criterios.push('en renta')
    if (isVenta) criterios.push('en venta')

    let response = ''
    let suggestions: string[] = []

    if (filtered.length === 0) {
      response = `No encontré propiedades con esos criterios${criterios.length ? ` (${criterios.join(', ')})` : ''}. Puedo ampliar la búsqueda o conectarte con un asesor.`
      suggestions = ['Ampliar presupuesto', 'Ver todas las propiedades', 'Hablar con un asesor']
    } else if (filtered.length === 1) {
      const p = filtered[0]
      response = `Encontré **1 propiedad** que coincide${criterios.length ? ` con: ${criterios.join(', ')}` : ''}: **${p.titulo}** en ${p.ubicacion} — ${p.precioTexto}.`
      suggestions = ['Ver detalles', 'Buscar similares', 'Agendar visita']
    } else {
      response = `Encontré **${filtered.length} propiedades**${criterios.length ? ` con: ${criterios.join(', ')}` : ''}. Aquí están las mejores opciones:`
      suggestions = ['Refinar búsqueda', 'Ver todas', 'Comparar opciones']
    }

    return { results: filtered, response, suggestions }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue('')
    setIsTyping(true)

    // Add to conversation history
    conversationHistory.current.push({ type: 'user', content: currentInput })

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ content: currentInput }],
          conversationHistory: conversationHistory.current.slice(-12),
        }),
      })

      if (!response.ok) throw new Error('Error en la respuesta de IA')

      const data = await response.json()

      // Add AI response to history
      conversationHistory.current.push({ type: 'ai', content: data.response })

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        properties: data.properties?.length > 0 ? data.properties : undefined,
        suggestions: data.properties?.length > 0
          ? ['Refinar búsqueda', 'Ver todas las propiedades', 'Hablar con un asesor']
          : ['Ver propiedades disponibles', 'Hablar con un asesor', 'Más información'],
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      // Fallback to local search on error
      const aiResult = processAIQuery(currentInput)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResult.response,
        timestamp: new Date(),
        properties: aiResult.results,
        suggestions: aiResult.suggestions,
      }
      setMessages(prev => [...prev, aiMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === 'Hablar con un especialista') {
      const whatsappNumber = '+5247712345678'
      const message = encodeURIComponent('Hola, me interesa obtener ayuda personalizada para encontrar una propiedad exclusiva con CONECTIA.')
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
      return
    }
    
    setInputValue(suggestion)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-conectia-gold to-yellow-400 text-black p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2 shadow-md">
                <Image
                  src="/logo.png"
                  alt="CONECTIA SELECT"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Búsqueda con IA</CardTitle>
                <p className="text-sm font-medium opacity-90">Asistente inteligente CONECTIA</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-black hover:bg-black/10 rounded-full w-8 h-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-conectia-gold text-black' 
                      : 'bg-conectia-secondary text-conectia-gold'
                  }`}>
                    {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-conectia-gold text-black'
                      : 'bg-conectia-secondary text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('es-MX', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Properties Results */}
                {message.properties && message.properties.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.properties.slice(0, 3).map((property) => (
                      <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex space-x-3">
                            <img
                              src={property.imagen || "/placeholder.svg"}
                              alt={property.titulo}
                              className="w-16 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm truncate uppercase">{property.titulo}</h4>
                              <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{property.ubicacion}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1.5">
                                <span className="flex items-center gap-1">
                                  <Bed className="h-3 w-3" />
                                  <span>{property.habitaciones} hab</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Bath className="h-3 w-3" />
                                  <span>{property.banos} baños</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Square className="h-3 w-3" />
                                  <span>{property.area}m²</span>
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-sm font-bold text-conectia-gold">
                                  {formatPrice(property.precio)}
                                </p>
                                <Link href={`/propiedades/${property.id}`}>
                                  <Button size="sm" className="bg-conectia-gold hover:bg-conectia-gold/90 text-black text-xs h-7 px-3 font-semibold">
                                    Ver Detalles
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {message.properties.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{message.properties.length - 3} propiedades más
                      </p>
                    )}
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left justify-start text-xs h-8 border-conectia-gold/30 hover:bg-conectia-gold/10 hover:border-conectia-gold"
                      >
                        {suggestion === 'Hablar con un especialista' && <ExternalLink className="h-3 w-3 mr-2" />}
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-conectia-secondary text-conectia-gold flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-conectia-secondary rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe la propiedad que buscas..."
              className="flex-1 border-gray-200 focus:border-conectia-gold focus:ring-conectia-gold/20"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-conectia-gold hover:bg-conectia-gold/90 text-black"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Powered by Claude AI • CONECTIA SELECT
          </p>
        </div>
      </div>
    </div>
  )
}
