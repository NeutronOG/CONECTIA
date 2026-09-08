'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BellRing, CalendarDays, Clock, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type EventType = 'renta' | 'venta' | 'apartado' | 'visita' | 'reunion' | 'otro'

type CalendarEvent = {
  id: number
  asesor_email: string
  asesor_nombre: string
  titulo: string
  fecha: string
  hora: string
  tipo: EventType
  descripcion: string
  meses_antes: number
}

const EVENT_TYPES: Record<EventType, string> = {
  renta: 'Renta', venta: 'Venta', apartado: 'Apartado', visita: 'Visita', reunion: 'Reunión', otro: 'Otro',
}

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

function parseDate(value: string) {
  return new Date(`${value}T12:00:00`)
}

function reminderDate(event: CalendarEvent) {
  const date = parseDate(event.fecha)
  date.setMonth(date.getMonth() - event.meses_antes)
  return date
}

function reminderLabel(event: CalendarEvent) {
  const reminder = reminderDate(event)
  const today = parseDate(isoToday())
  const due = reminder.toLocaleDateString('es-MX')
  if (reminder < today) return `Recordatorio pendiente desde el ${due}`
  if (reminder.toDateString() === today.toDateString()) return 'Recordatorio para hoy'
  return `Recordar el ${due} (${event.meses_antes} meses antes)`
}

function dateLabel(value: string) {
  return parseDate(value).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function CalendarioAsesorPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState(isoToday())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titulo: '', fecha: isoToday(), hora: '09:00', tipo: 'otro' as EventType, descripcion: '', mesesAntes: 3 })

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || !user?.email) {
      router.push('/login')
      return
    }
    let active = true
    const loadEvents = async () => {
      try {
        const response = await fetch(`/api/calendario?email=${encodeURIComponent(user.email)}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'No se pudo cargar el calendario.')
        if (active) setEvents(data.events || [])
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : 'No se pudo cargar el calendario.')
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void loadEvents()
    return () => { active = false }
  }, [isAuthenticated, loading, router, user?.email])

  const selectedEvents = useMemo(
    () => events.filter(event => event.fecha === selectedDate).sort((a, b) => a.hora.localeCompare(b.hora)),
    [events, selectedDate],
  )
  const reminderEvents = useMemo(
    () => events.filter(event => reminderDate(event) <= parseDate(isoToday())).sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [events],
  )

  const createEvent = async (event: FormEvent) => {
    event.preventDefault()
    if (!user?.email) return
    setIsSaving(true)
    try {
      const response = await fetch('/api/calendario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email: user.email, nombre: user.nombre || user.email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar el evento.')
      setEvents(current => [...current, data.event].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)))
      setSelectedDate(form.fecha)
      setShowForm(false)
      setForm({ titulo: '', fecha: form.fecha, hora: '09:00', tipo: 'otro', descripcion: '', mesesAntes: 3 })
      toast.success('Evento agendado.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el evento.')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteEvent = async (id: number) => {
    if (!user?.email) return
    try {
      const response = await fetch(`/api/calendario?id=${id}&email=${encodeURIComponent(user.email)}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo eliminar el evento.')
      setEvents(current => current.filter(event => event.id !== id))
      toast.success('Evento eliminado.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar el evento.')
    }
  }

  if (loading || !user) return null

  return (
    <main className="min-h-screen bg-[#0F2027] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button onClick={() => router.push('/panel-asesor')} className="mb-5 flex items-center gap-2 text-sm text-[#B0ACA6] transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver al panel
        </button>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-3xl font-black">Calendario</h1>
            <p className="mt-1 text-sm text-[#B0ACA6]">
              {user.email.toLowerCase() === 'lizzie@conectia.mx' ? 'Ves los eventos de todos los asesores.' : 'Agenda tus rentas, ventas, apartados, visitas y reuniones.'}
            </p>
          </div>
          <Button onClick={() => setShowForm(value => !value)} className="bg-[var(--conectia-arcilla)] font-bold text-[#0F2027] hover:bg-[var(--conectia-arcilla-hover)]">
            <Plus className="mr-2 h-4 w-4" /> Nuevo evento
          </Button>
        </div>

        {reminderEvents.length > 0 && (
          <section className="mb-6 rounded-2xl border border-amber-400/35 bg-amber-400/10 p-4">
            <div className="mb-2 flex items-center gap-2 font-bold text-amber-200"><BellRing className="h-4 w-4" /> Recordatorios pendientes</div>
            <div className="space-y-1 text-sm text-amber-100">
              {reminderEvents.map(event => <p key={event.id}>{event.titulo}: {reminderLabel(event)}.</p>)}
            </div>
          </section>
        )}

        {showForm && (
          <form onSubmit={createEvent} className="mb-6 rounded-2xl border border-white/15 bg-white/[0.04] p-5">
            <h2 className="mb-4 font-bold">Agendar evento</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input required placeholder="Título del evento" value={form.titulo} onChange={e => setForm(current => ({ ...current, titulo: e.target.value }))} className="border-white/20 bg-white/5 text-white placeholder:text-white/40" />
              <Input required type="date" value={form.fecha} onChange={e => setForm(current => ({ ...current, fecha: e.target.value }))} className="border-white/20 bg-white/5 text-white" />
              <Input required type="time" value={form.hora} onChange={e => setForm(current => ({ ...current, hora: e.target.value }))} className="border-white/20 bg-white/5 text-white" />
              <select value={form.tipo} onChange={e => setForm(current => ({ ...current, tipo: e.target.value as EventType }))} className="h-10 rounded-md border border-white/20 bg-[#17313A] px-3 text-sm text-white">
                {Object.entries(EVENT_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <Input min="0" max="12" type="number" value={form.mesesAntes} onChange={e => setForm(current => ({ ...current, mesesAntes: Number(e.target.value) }))} className="border-white/20 bg-white/5 text-white" aria-label="Meses de anticipación" />
              <p className="self-center text-xs text-[#B0ACA6]">Meses de anticipación para recordar.</p>
            </div>
            <Textarea placeholder="Notas del evento (opcional)" value={form.descripcion} onChange={e => setForm(current => ({ ...current, descripcion: e.target.value }))} className="mt-4 border-white/20 bg-white/5 text-white placeholder:text-white/40" />
            <div className="mt-4 flex gap-3"><Button disabled={isSaving} type="submit" className="bg-[var(--conectia-arcilla)] font-bold text-[#0F2027]">{isSaving ? 'Guardando…' : 'Guardar evento'}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">Cancelar</Button></div>
          </form>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <label className="mb-3 block text-sm font-bold">Selecciona una fecha</label>
            <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border-white/20 bg-white/5 text-white" />
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold"><CalendarDays className="h-4 w-4 text-[var(--conectia-arcilla)]" /> Próximos eventos</p>
              <div className="space-y-2">{events.filter(event => event.fecha >= isoToday()).slice(0, 6).map(event => <button key={event.id} onClick={() => setSelectedDate(event.fecha)} className="w-full rounded-xl bg-white/5 p-3 text-left text-sm hover:bg-white/10"><span className="font-semibold">{event.titulo}</span><span className="mt-1 block text-xs text-[#B0ACA6]">{dateLabel(event.fecha)}</span></button>)}</div>
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="mb-4 text-lg font-bold">{dateLabel(selectedDate)}</h2>
            {isLoading ? <p className="text-sm text-[#B0ACA6]">Cargando eventos…</p> : selectedEvents.length === 0 ? <p className="text-sm text-[#B0ACA6]">No hay eventos para esta fecha.</p> : <div className="space-y-3">{selectedEvents.map(event => <article key={event.id} className="rounded-xl border border-white/10 bg-white/5 p-4"><div className="flex justify-between gap-3"><div><p className="font-bold">{event.titulo}</p><p className="mt-1 flex items-center gap-1 text-xs text-[#B0ACA6]"><Clock className="h-3.5 w-3.5" /> {event.hora.slice(0, 5)} · {EVENT_TYPES[event.tipo]}</p>{user.email.toLowerCase() === 'lizzie@conectia.mx' && <p className="mt-1 text-xs text-[var(--conectia-arcilla)]">{event.asesor_nombre || event.asesor_email}</p>}</div><Button variant="ghost" size="icon" onClick={() => void deleteEvent(event.id)} className="text-red-300 hover:bg-red-500/15 hover:text-red-200"><Trash2 className="h-4 w-4" /></Button></div>{event.descripcion && <p className="mt-3 text-sm text-[#B0ACA6]">{event.descripcion}</p>}<p className="mt-3 text-xs text-amber-200">{reminderLabel(event)}</p></article>)}</div>}
          </section>
        </div>
      </div>
    </main>
  )
}
