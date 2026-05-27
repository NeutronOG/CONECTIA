'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Building2, Calendar as CalendarIcon, MessageSquare, Edit3, Save, X, Plus, Trash2,
  ChevronLeft, ChevronRight, Clock, MapPin, DollarSign, Layers, Send, User,
  CheckCircle2, AlertCircle, TrendingUp, Home
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ─── Types ───
type UnitStatus = 'disponible' | 'vendido' | 'reservado'

interface Desarrollo {
  id: string
  nombre: string
  zona: string
  tipo: string
  precioDesde: string
  pisos: number
  entrega: string
  disponibles: number
  total: number
  unidades: UnitStatus[][]
  avanceObra: number // 0-100
  notas: string
}

interface CalendarEvent {
  id: string
  fecha: string // YYYY-MM-DD
  hora: string
  titulo: string
  tipo: 'visita' | 'entrega' | 'reunion' | 'obra' | 'otro'
  desarrollo: string
  descripcion: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ─── Initial Mock Data ───
const INITIAL_DESARROLLOS: Desarrollo[] = [
  {
    id: 'dev-1',
    nombre: 'Residencial del Parque',
    zona: 'La Gran Jardín, León Gto.',
    tipo: 'Torre Residencial',
    precioDesde: '$3,500,000',
    pisos: 12,
    entrega: 'Q2 2027',
    disponibles: 18,
    total: 36,
    avanceObra: 45,
    notas: 'Estructura completada hasta piso 6. Próxima etapa: acabados interiores.',
    unidades: [
      ['vendido','vendido','vendido'],
      ['vendido','vendido','reservado'],
      ['vendido','reservado','disponible'],
      ['reservado','disponible','disponible'],
      ['disponible','disponible','disponible'],
      ['disponible','disponible','disponible'],
    ],
  },
  {
    id: 'dev-2',
    nombre: 'Sky Tower León',
    zona: 'Lomas del Campestre, León Gto.',
    tipo: 'Torre de Oficinas y Vivienda',
    precioDesde: '$5,800,000',
    pisos: 22,
    entrega: 'Q1 2027',
    disponibles: 24,
    total: 60,
    avanceObra: 30,
    notas: 'Cimentación completada. Iniciando estructura vertical.',
    unidades: [
      ['vendido','vendido','vendido','vendido'],
      ['vendido','vendido','reservado','reservado'],
      ['vendido','reservado','disponible','disponible'],
      ['reservado','disponible','disponible','disponible'],
      ['disponible','disponible','disponible','disponible'],
      ['disponible','disponible','disponible','disponible'],
    ],
  },
  {
    id: 'dev-3',
    nombre: 'Bosque Residencial',
    zona: 'El Refugio, León Gto.',
    tipo: 'Apartamentos Modernos',
    precioDesde: '$2,900,000',
    pisos: 10,
    entrega: 'Q3 2026',
    disponibles: 15,
    total: 40,
    avanceObra: 72,
    notas: 'Acabados en pisos 1-7. Áreas comunes al 60%.',
    unidades: [
      ['vendido','vendido','vendido'],
      ['vendido','reservado','reservado'],
      ['reservado','disponible','disponible'],
      ['disponible','disponible','disponible'],
      ['disponible','disponible','disponible'],
    ],
  },
]

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'e1', fecha: getTodayStr(), hora: '10:00', titulo: 'Revisión avance de obra', tipo: 'obra', desarrollo: 'Residencial del Parque', descripcion: 'Inspección piso 6-7 con ingeniero estructural' },
  { id: 'e2', fecha: getTodayStr(), hora: '15:00', titulo: 'Visita inversionista VIP', tipo: 'visita', desarrollo: 'Sky Tower León', descripcion: 'Sr. Ramírez — interesado en 3 unidades' },
  { id: 'e3', fecha: getDateStr(2), hora: '11:00', titulo: 'Junta con arquitecto', tipo: 'reunion', desarrollo: 'Bosque Residencial', descripcion: 'Definir acabados área de amenidades' },
  { id: 'e4', fecha: getDateStr(5), hora: '09:00', titulo: 'Entrega parcial piso 1-3', tipo: 'entrega', desarrollo: 'Bosque Residencial', descripcion: 'Entrega de llaves a primeros propietarios' },
  { id: 'e5', fecha: getDateStr(8), hora: '14:00', titulo: 'Reunión con banco', tipo: 'reunion', desarrollo: 'Sky Tower León', descripcion: 'Negociación crédito puente segunda etapa' },
  { id: 'e6', fecha: getDateStr(-2), hora: '10:00', titulo: 'Firma de escrituras', tipo: 'entrega', desarrollo: 'Residencial del Parque', descripcion: 'Unidades P4-D1 y P4-D2' },
]

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}
function getDateStr(offsetDays: number) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

const EVENT_COLORS: Record<string, string> = {
  visita: 'bg-blue-500',
  entrega: 'bg-green-500',
  reunion: 'bg-purple-500',
  obra: 'bg-orange-500',
  otro: 'bg-gray-500',
}
const EVENT_LABELS: Record<string, string> = {
  visita: 'Visita',
  entrega: 'Entrega',
  reunion: 'Reunión',
  obra: 'Obra',
  otro: 'Otro',
}

// ─── AI Agent Logic (local, modifies state via callbacks) ───
function processAICommand(
  input: string,
  desarrollos: Desarrollo[],
  events: CalendarEvent[],
  setDesarrollos: React.Dispatch<React.SetStateAction<Desarrollo[]>>,
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>,
): string {
  const lower = input.toLowerCase().trim()

  // Update avance de obra
  const avanceMatch = lower.match(/(?:avance|progreso|obra)\s+(?:de\s+)?["""]?(.+?)["""]?\s+(?:a|al|en)\s+(\d+)/)
  if (avanceMatch) {
    const name = avanceMatch[1].trim()
    const pct = Math.min(100, Math.max(0, parseInt(avanceMatch[2])))
    const idx = desarrollos.findIndex(d => d.nombre.toLowerCase().includes(name))
    if (idx >= 0) {
      setDesarrollos(prev => prev.map((d, i) => i === idx ? { ...d, avanceObra: pct } : d))
      return `✅ Avance de obra de **${desarrollos[idx].nombre}** actualizado a **${pct}%**.`
    }
    return `❌ No encontré un desarrollo que coincida con "${name}".`
  }

  // Update precio
  const precioMatch = lower.match(/(?:precio|costo)\s+(?:de\s+)?["""]?(.+?)["""]?\s+(?:a|en)\s+\$?([\d,]+)/)
  if (precioMatch) {
    const name = precioMatch[1].trim()
    const precio = '$' + precioMatch[2].replace(/,/g, ',')
    const idx = desarrollos.findIndex(d => d.nombre.toLowerCase().includes(name))
    if (idx >= 0) {
      setDesarrollos(prev => prev.map((d, i) => i === idx ? { ...d, precioDesde: precio } : d))
      return `✅ Precio de **${desarrollos[idx].nombre}** actualizado a **${precio}**.`
    }
    return `❌ No encontré un desarrollo que coincida con "${name}".`
  }

  // Update entrega
  const entregaMatch = lower.match(/(?:entrega|fecha de entrega)\s+(?:de\s+)?["""]?(.+?)["""]?\s+(?:a|para|en)\s+(.+)/)
  if (entregaMatch) {
    const name = entregaMatch[1].trim()
    const entrega = entregaMatch[2].trim()
    const idx = desarrollos.findIndex(d => d.nombre.toLowerCase().includes(name))
    if (idx >= 0) {
      setDesarrollos(prev => prev.map((d, i) => i === idx ? { ...d, entrega } : d))
      return `✅ Fecha de entrega de **${desarrollos[idx].nombre}** actualizada a **${entrega}**.`
    }
    return `❌ No encontré un desarrollo que coincida con "${name}".`
  }

  // Add nota
  const notaMatch = lower.match(/(?:nota|notas|agregar nota|añadir nota)\s+(?:a|de|en|para)\s+["""]?(.+?)["""]?\s*[:]\s*(.+)/)
  if (notaMatch) {
    const name = notaMatch[1].trim()
    const nota = notaMatch[2].trim()
    const idx = desarrollos.findIndex(d => d.nombre.toLowerCase().includes(name))
    if (idx >= 0) {
      setDesarrollos(prev => prev.map((d, i) => i === idx ? { ...d, notas: nota } : d))
      return `✅ Nota de **${desarrollos[idx].nombre}** actualizada.`
    }
    return `❌ No encontré un desarrollo que coincida con "${name}".`
  }

  // Mark unit as vendido/reservado/disponible
  const unitMatch = lower.match(/(?:marcar?|cambiar?|poner)\s+(?:unidad\s+)?(?:piso\s+)?(\d+)\s*[-–]\s*(?:depa?\s+)?(\d+)\s+(?:de\s+)?["""]?(.+?)["""]?\s+(?:como|a)\s+(vendid[oa]|reservad[oa]|disponible)/)
  if (unitMatch) {
    const piso = parseInt(unitMatch[1])
    const depa = parseInt(unitMatch[2]) - 1
    const name = unitMatch[3].trim()
    const statusRaw = unitMatch[4].toLowerCase()
    const status: UnitStatus = statusRaw.startsWith('vendid') ? 'vendido' : statusRaw.startsWith('reservad') ? 'reservado' : 'disponible'
    const idx = desarrollos.findIndex(d => d.nombre.toLowerCase().includes(name))
    if (idx >= 0) {
      const d = desarrollos[idx]
      const pisoIdx = d.unidades.length - 1 - Math.floor((piso - 1) * d.unidades.length / d.pisos)
      if (pisoIdx >= 0 && pisoIdx < d.unidades.length && depa >= 0 && depa < (d.unidades[pisoIdx]?.length || 0)) {
        setDesarrollos(prev => prev.map((dev, i) => {
          if (i !== idx) return dev
          const newUnits = dev.unidades.map(row => [...row])
          newUnits[pisoIdx][depa] = status
          const disp = newUnits.flat().filter(u => u === 'disponible').length
          return { ...dev, unidades: newUnits, disponibles: disp }
        }))
        return `✅ Unidad piso ${piso}, depa ${depa + 1} de **${d.nombre}** marcada como **${status}**.`
      }
      return `❌ Piso o departamento fuera de rango para ${d.nombre}.`
    }
    return `❌ No encontré un desarrollo que coincida con "${name}".`
  }

  // Create calendar event
  const eventMatch = lower.match(/(?:agendar?|crear?|programar?|añadir)\s+(?:evento|cita|visita|reunión|reunion)\s+(?:el\s+)?(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\s+(?:a las?\s+)?(\d{1,2}):?(\d{2})?\s*(?:—|[-–]|:)?\s*(.+)/)
  if (eventMatch) {
    const day = eventMatch[1].padStart(2, '0')
    const month = eventMatch[2].padStart(2, '0')
    const year = eventMatch[3] ? (eventMatch[3].length === 2 ? '20' + eventMatch[3] : eventMatch[3]) : new Date().getFullYear().toString()
    const hour = eventMatch[4].padStart(2, '0')
    const min = (eventMatch[5] || '00').padStart(2, '0')
    const titulo = eventMatch[6].trim()
    const fecha = `${year}-${month}-${day}`
    const newEvent: CalendarEvent = {
      id: `e-${Date.now()}`,
      fecha,
      hora: `${hour}:${min}`,
      titulo,
      tipo: 'otro',
      desarrollo: desarrollos[0]?.nombre || '',
      descripcion: titulo,
    }
    setEvents(prev => [...prev, newEvent])
    return `✅ Evento **"${titulo}"** agendado para el **${day}/${month}/${year}** a las **${hour}:${min}**.`
  }

  // Show resumen
  if (lower.includes('resumen') || lower.includes('status') || lower.includes('estado')) {
    const lines = desarrollos.map(d => {
      const disp = d.unidades.flat().filter(u => u === 'disponible').length
      const res = d.unidades.flat().filter(u => u === 'reservado').length
      const vend = d.unidades.flat().filter(u => u === 'vendido').length
      return `📊 **${d.nombre}** — Obra: ${d.avanceObra}% | Disp: ${disp} | Res: ${res} | Vend: ${vend} | Entrega: ${d.entrega}`
    })
    return `📋 **Resumen de Desarrollos:**\n\n${lines.join('\n')}`
  }

  // Help
  return `🤖 **Comandos disponibles:**\n
• "avance de [nombre] a [%]" — Actualizar progreso de obra
• "precio de [nombre] a $X" — Cambiar precio desde
• "entrega de [nombre] a [fecha]" — Cambiar fecha de entrega
• "nota de [nombre]: [texto]" — Actualizar notas
• "marcar piso X-Y de [nombre] como vendido/reservado/disponible"
• "agendar visita el DD/MM a HH:MM — descripción"
• "resumen" — Ver estado general de todos los desarrollos

Escribe tu comando en lenguaje natural y lo procesaré.`
}

// ─── Calendar Component ───
function MiniCalendar({
  events,
  onSelectDate,
  selectedDate,
}: {
  events: CalendarEvent[]
  onSelectDate: (date: string) => void
  selectedDate: string
}) {
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = getTodayStr()

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const getDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const eventsByDate = new Map<string, CalendarEvent[]>()
  events.forEach(e => {
    const arr = eventsByDate.get(e.fecha) || []
    arr.push(e)
    eventsByDate.set(e.fecha, arr)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          {monthNames[month]} {year}
        </h3>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d => (
          <div key={d} className="text-[10px] font-medium text-gray-400 py-1">{d}</div>
        ))}
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const dateKey = getDateKey(day)
          const dayEvents = eventsByDate.get(dateKey) || []
          const isToday = dateKey === today
          const isSelected = dateKey === selectedDate
          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateKey)}
              className={`relative p-1 text-xs rounded-lg transition-all ${
                isSelected
                  ? 'bg-conectia-gold text-[#17313A] font-bold'
                  : isToday
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {day}
              {dayEvents.length > 0 && (
                <div className="flex justify-center gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((ev, j) => (
                    <div key={j} className={`w-1 h-1 rounded-full ${EVENT_COLORS[ev.tipo]}`} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Component ───
export function DesarrollosManager({ userRole }: { userRole: 'empresa' | 'asesor' }) {
  const [desarrollos, setDesarrollos] = useState<Desarrollo[]>(INITIAL_DESARROLLOS)
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS)
  const [selectedDate, setSelectedDate] = useState(getTodayStr())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Desarrollo>>({})
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: '🤖 ¡Hola! Soy tu asistente de desarrollos. Puedo modificar avance de obra, precios, fechas de entrega, estado de unidades y agendar eventos. Escribe "ayuda" para ver los comandos disponibles.', timestamp: new Date() }
  ])
  const [chatInput, setChatInput] = useState('')
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({ tipo: 'visita', desarrollo: INITIAL_DESARROLLOS[0]?.nombre })
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [activeView, setActiveView] = useState<'desarrollos' | 'calendario'>('desarrollos')

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [chatMessages, scrollToBottom])

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: chatInput, timestamp: new Date() }
    setChatMessages(prev => [...prev, userMsg])
    const response = processAICommand(chatInput, desarrollos, events, setDesarrollos, setEvents)
    const aiMsg: ChatMessage = { id: `a-${Date.now()}`, role: 'assistant', content: response, timestamp: new Date() }
    setTimeout(() => setChatMessages(prev => [...prev, aiMsg]), 300)
    setChatInput('')
  }

  const startEditing = (d: Desarrollo) => {
    setEditingId(d.id)
    setEditForm({ nombre: d.nombre, zona: d.zona, tipo: d.tipo, precioDesde: d.precioDesde, pisos: d.pisos, entrega: d.entrega, avanceObra: d.avanceObra, notas: d.notas })
  }

  const saveEditing = () => {
    if (!editingId) return
    setDesarrollos(prev => prev.map(d => d.id === editingId ? { ...d, ...editForm } : d))
    setEditingId(null)
    setEditForm({})
  }

  const addEvent = () => {
    if (!newEvent.titulo || !newEvent.fecha || !newEvent.hora) return
    const ev: CalendarEvent = {
      id: `e-${Date.now()}`,
      fecha: newEvent.fecha!,
      hora: newEvent.hora!,
      titulo: newEvent.titulo!,
      tipo: (newEvent.tipo as CalendarEvent['tipo']) || 'otro',
      desarrollo: newEvent.desarrollo || '',
      descripcion: newEvent.descripcion || '',
    }
    setEvents(prev => [...prev, ev])
    setShowNewEvent(false)
    setNewEvent({ tipo: 'visita', desarrollo: desarrollos[0]?.nombre })
  }

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  const selectedEvents = events.filter(e => e.fecha === selectedDate).sort((a, b) => a.hora.localeCompare(b.hora))

  const formatDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-')
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
  }

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          ['desarrollos', 'Proyectos', Building2],
          ['calendario', 'Calendario', CalendarIcon],
        ] as [string, string, any][]).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setActiveView(key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeView === key
                ? 'bg-conectia-gold text-[#17313A] shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Desarrollos View ─── */}
      {activeView === 'desarrollos' && (
        <div className="space-y-5">
          {desarrollos.map(d => {
            const disp = d.unidades.flat().filter(u => u === 'disponible').length
            const res = d.unidades.flat().filter(u => u === 'reservado').length
            const vend = d.unidades.flat().filter(u => u === 'vendido').length
            const isEditing = editingId === d.id

            return (
              <Card key={d.id} className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input value={editForm.nombre || ''} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} className="bg-white/10 border-white/20 text-white text-lg font-bold" />
                            <div className="grid grid-cols-2 gap-2">
                              <Input value={editForm.zona || ''} onChange={e => setEditForm(f => ({ ...f, zona: e.target.value }))} className="bg-white/10 border-white/20 text-white text-sm" placeholder="Zona" />
                              <Input value={editForm.tipo || ''} onChange={e => setEditForm(f => ({ ...f, tipo: e.target.value }))} className="bg-white/10 border-white/20 text-white text-sm" placeholder="Tipo" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-bold text-white">{d.nombre}</h3>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-slate-300"><MapPin className="h-3 w-3" />{d.zona}</span>
                              <Badge className="bg-white/10 text-white text-xs border-white/20">{d.tipo}</Badge>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2 ml-3 flex-shrink-0">
                        {isEditing ? (
                          <>
                            <Button size="sm" onClick={saveEditing} className="bg-green-500 hover:bg-green-600 text-white h-8 px-3"><Save className="h-3.5 w-3.5 mr-1" />Guardar</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-white/70 hover:text-white hover:bg-white/10 h-8 px-2"><X className="h-3.5 w-3.5" /></Button>
                          </>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => startEditing(d)} className="text-white/70 hover:text-white hover:bg-white/10 h-8 px-3"><Edit3 className="h-3.5 w-3.5 mr-1" />Editar</Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <DollarSign className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        {isEditing ? (
                          <Input value={editForm.precioDesde || ''} onChange={e => setEditForm(f => ({ ...f, precioDesde: e.target.value }))} className="text-center text-sm h-7 mt-1" />
                        ) : (
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{d.precioDesde}</p>
                        )}
                        <p className="text-xs text-gray-500">Precio desde</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <Layers className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        {isEditing ? (
                          <Input type="number" value={editForm.pisos || 0} onChange={e => setEditForm(f => ({ ...f, pisos: parseInt(e.target.value) || 0 }))} className="text-center text-sm h-7 mt-1" />
                        ) : (
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{d.pisos}</p>
                        )}
                        <p className="text-xs text-gray-500">Pisos</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <CalendarIcon className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                        {isEditing ? (
                          <Input value={editForm.entrega || ''} onChange={e => setEditForm(f => ({ ...f, entrega: e.target.value }))} className="text-center text-sm h-7 mt-1" />
                        ) : (
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{d.entrega}</p>
                        )}
                        <p className="text-xs text-gray-500">Entrega</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <Home className="h-4 w-4 text-conectia-gold mx-auto mb-1" />
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{disp}/{d.unidades.flat().length}</p>
                        <p className="text-xs text-gray-500">Disponibles</p>
                      </div>
                    </div>

                    {/* Avance de obra */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avance de Obra</span>
                        {isEditing ? (
                          <Input type="number" min={0} max={100} value={editForm.avanceObra || 0} onChange={e => setEditForm(f => ({ ...f, avanceObra: parseInt(e.target.value) || 0 }))} className="w-20 text-center text-sm h-7" />
                        ) : (
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{d.avanceObra}%</span>
                        )}
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            d.avanceObra >= 80 ? 'bg-green-500' : d.avanceObra >= 50 ? 'bg-conectia-gold' : 'bg-orange-500'
                          }`}
                          style={{ width: `${d.avanceObra}%` }}
                        />
                      </div>
                    </div>

                    {/* Unidades grid */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unidades</p>
                      <div className="flex items-center gap-4 mb-2 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded-sm bg-[#e8ff50] inline-block" />Disponible ({disp})</span>
                        <span className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded-sm bg-orange-500 inline-block" />Reservado ({res})</span>
                        <span className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded-sm bg-slate-400 inline-block" />Vendido ({vend})</span>
                      </div>
                      <div className="space-y-1">
                        {d.unidades.map((row, ri) => (
                          <div key={ri} className="flex gap-1">
                            {row.map((status, ci) => (
                              <div
                                key={ci}
                                className={`flex-1 h-6 rounded text-[9px] font-semibold flex items-center justify-center cursor-default transition-all ${
                                  status === 'disponible' ? 'bg-[#e8ff50]/20 text-[#8a9900] border border-[#e8ff50]/50' :
                                  status === 'reservado' ? 'bg-orange-100 text-orange-600 border border-orange-300' :
                                  'bg-slate-200 text-slate-500 border border-slate-300'
                                }`}
                              >
                                {status === 'disponible' ? 'D' : status === 'reservado' ? 'R' : 'V'}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notas */}
                    {(d.notas || isEditing) && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        {isEditing ? (
                          <textarea
                            value={editForm.notas || ''}
                            onChange={e => setEditForm(f => ({ ...f, notas: e.target.value }))}
                            className="w-full bg-transparent text-sm text-yellow-800 dark:text-yellow-300 resize-none border-0 focus:outline-none"
                            rows={2}
                          />
                        ) : (
                          <p className="text-xs text-yellow-800 dark:text-yellow-300">📝 {d.notas}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ─── Calendar View ─── */}
      {activeView === 'calendario' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md lg:col-span-1">
            <CardContent className="p-5">
              <MiniCalendar events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(EVENT_LABELS).map(([key, label]) => (
                    <span key={key} className="flex items-center gap-1 text-xs text-gray-500">
                      <span className={`w-2 h-2 rounded-full ${EVENT_COLORS[key]}`} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-conectia-gold" />
                  {formatDateDisplay(selectedDate)}
                  {selectedDate === getTodayStr() && <Badge className="bg-blue-100 text-blue-700 text-xs">Hoy</Badge>}
                </CardTitle>
                <Button size="sm" onClick={() => { setShowNewEvent(true); setNewEvent(prev => ({ ...prev, fecha: selectedDate })) }} className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] h-8 px-3 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />Nuevo Evento
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* New event form */}
              {showNewEvent && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 space-y-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Nuevo Evento</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" value={newEvent.fecha || selectedDate} onChange={e => setNewEvent(p => ({ ...p, fecha: e.target.value }))} className="text-sm h-9" />
                    <Input type="time" value={newEvent.hora || '10:00'} onChange={e => setNewEvent(p => ({ ...p, hora: e.target.value }))} className="text-sm h-9" />
                  </div>
                  <Input placeholder="Título del evento" value={newEvent.titulo || ''} onChange={e => setNewEvent(p => ({ ...p, titulo: e.target.value }))} className="text-sm h-9" />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={newEvent.tipo || 'visita'} onChange={e => setNewEvent(p => ({ ...p, tipo: e.target.value as any }))} className="text-sm h-9 rounded-md border px-2 bg-white dark:bg-gray-800">
                      {Object.entries(EVENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <select value={newEvent.desarrollo || ''} onChange={e => setNewEvent(p => ({ ...p, desarrollo: e.target.value }))} className="text-sm h-9 rounded-md border px-2 bg-white dark:bg-gray-800">
                      {desarrollos.map(d => <option key={d.id} value={d.nombre}>{d.nombre}</option>)}
                    </select>
                  </div>
                  <Input placeholder="Descripción (opcional)" value={newEvent.descripcion || ''} onChange={e => setNewEvent(p => ({ ...p, descripcion: e.target.value }))} className="text-sm h-9" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addEvent} className="bg-green-500 hover:bg-green-600 text-white h-8 text-xs"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Guardar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowNewEvent(false)} className="h-8 text-xs">Cancelar</Button>
                  </div>
                </div>
              )}

              {/* Events list */}
              {selectedEvents.length === 0 && !showNewEvent ? (
                <div className="text-center py-8 text-gray-400">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay eventos para esta fecha</p>
                </div>
              ) : (
                selectedEvents.map(ev => (
                  <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${EVENT_COLORS[ev.tipo]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{ev.hora}</span>
                        <Badge className="text-[10px] bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">{EVENT_LABELS[ev.tipo]}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{ev.titulo}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{ev.desarrollo}</p>
                      {ev.descripcion && ev.descripcion !== ev.titulo && (
                        <p className="text-xs text-gray-400 mt-0.5">{ev.descripcion}</p>
                      )}
                    </div>
                    <button onClick={() => deleteEvent(ev.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all flex-shrink-0">
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── AI Agent Chat ─── */}
      {activeView === 'agente' && (
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4 text-conectia-gold" />
              Agente IA — Gestión de Desarrollos
              <Badge className="bg-green-500/20 text-green-300 text-[10px] border-green-500/30 ml-auto">En línea</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-conectia-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-conectia-gold" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-conectia-gold text-[#17313A] rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-700'
                  }`}>
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-1' : ''}>
                        {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                          part.startsWith('**') && part.endsWith('**')
                            ? <strong key={j}>{part.slice(2, -2)}</strong>
                            : <span key={j}>{part}</span>
                        )}
                      </p>
                    ))}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                  placeholder="Ej: avance de Residencial del Parque a 50..."
                  className="text-sm"
                />
                <Button onClick={handleSendChat} className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] px-4 flex-shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {['resumen', 'ayuda'].map(cmd => (
                  <button
                    key={cmd}
                    onClick={() => { setChatInput(cmd); }}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
