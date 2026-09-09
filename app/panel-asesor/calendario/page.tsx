'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BellRing, CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus, Sparkles, Trash2, UserRound } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type EventType = 'renta' | 'venta' | 'apartado' | 'visita' | 'reunion' | 'otro'
type CalendarEvent = { id: number; asesor_email: string; asesor_nombre: string; titulo: string; fecha: string; hora: string; tipo: EventType; descripcion: string; meses_antes: number }

const EVENT_TYPES: Record<EventType, string> = { renta: 'Renta', venta: 'Venta', apartado: 'Apartado', visita: 'Visita', reunion: 'Reunión', otro: 'Otro' }
const EVENT_STYLE: Record<EventType, { dot: string; surface: string; text: string }> = {
  renta: { dot: '#2D7A68', surface: '#E4F4ED', text: '#185646' },
  venta: { dot: '#C36C48', surface: '#FBEADF', text: '#9B4628' },
  apartado: { dot: '#8663C7', surface: '#EEE9FA', text: '#62429E' },
  visita: { dot: '#2777A7', surface: '#E3F1F8', text: '#195E89' },
  reunion: { dot: '#C8921C', surface: '#FBF3DB', text: '#8B650F' },
  otro: { dot: '#69727A', surface: '#EDF0F1', text: '#465058' },
}
const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function isoToday() {
  const date = new Date()
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}
function toISODate(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}
function parseDate(value: string) { return new Date(`${value}T12:00:00`) }
function reminderDate(event: CalendarEvent) {
  const date = parseDate(event.fecha)
  date.setMonth(date.getMonth() - event.meses_antes)
  return date
}
function reminderLabel(event: CalendarEvent) {
  const reminder = reminderDate(event)
  const today = parseDate(isoToday())
  const due = reminder.toLocaleDateString('es-MX')
  if (reminder < today) return `Pendiente desde el ${due}`
  if (reminder.toDateString() === today.toDateString()) return 'Recordatorio para hoy'
  return `Recordar el ${due}`
}
function dateLabel(value: string, compact = false) {
  return parseDate(value).toLocaleDateString('es-MX', compact
    ? { weekday: 'short', day: 'numeric', month: 'short' }
    : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function monthLabel(month: Date) { return month.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) }

export default function CalendarioAsesorPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState(isoToday())
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(`${isoToday()}T12:00:00`))
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

  const selectedEvents = useMemo(() => events.filter(event => event.fecha === selectedDate).sort((a, b) => a.hora.localeCompare(b.hora)), [events, selectedDate])
  const reminderEvents = useMemo(() => events.filter(event => reminderDate(event) <= parseDate(isoToday())).sort((a, b) => a.fecha.localeCompare(b.fecha)), [events])
  const upcomingEvents = useMemo(() => events.filter(event => event.fecha >= isoToday()).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)).slice(0, 4), [events])
  const eventDates = useMemo(() => new Set(events.map(event => event.fecha)), [events])
  const todayEvents = events.filter(event => event.fecha === isoToday()).length
  const weekEnd = new Date(`${isoToday()}T12:00:00`)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEvents = events.filter(event => event.fecha >= isoToday() && event.fecha <= toISODate(weekEnd)).length
  const calendarDays = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
    const startOffset = (first.getDay() + 6) % 7
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
    return Array.from({ length: startOffset + daysInMonth }, (_, index) => index < startOffset ? null : new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - startOffset + 1))
  }, [visibleMonth])

  const selectDay = (date: Date) => {
    setSelectedDate(toISODate(date))
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }
  const createEvent = async (event: FormEvent) => {
    event.preventDefault()
    if (!user?.email) return
    setIsSaving(true)
    try {
      const response = await fetch('/api/calendario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, email: user.email, nombre: user.nombre || user.email }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar el evento.')
      setEvents(current => [...current, data.event].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)))
      selectDay(parseDate(form.fecha))
      setShowForm(false)
      setForm({ titulo: '', fecha: form.fecha, hora: '09:00', tipo: 'otro', descripcion: '', mesesAntes: 3 })
      toast.success('Evento agendado.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el evento.')
    } finally { setIsSaving(false) }
  }
  const deleteEvent = async (id: number) => {
    if (!user?.email) return
    try {
      const response = await fetch(`/api/calendario?id=${id}&email=${encodeURIComponent(user.email)}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo eliminar el evento.')
      setEvents(current => current.filter(event => event.id !== id))
      toast.success('Evento eliminado.')
    } catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo eliminar el evento.') }
  }

  if (loading || !user) return null
  const isAdmin = user.email.toLowerCase() === 'lizzie@conectia.mx'

  return (
    <main className="min-h-screen bg-[#F5F2EE] px-4 pb-32 pt-7 text-[#17313A] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => router.push('/panel-asesor')} className="group flex items-center gap-2 text-sm font-semibold text-[#647078] transition-colors hover:text-[#17313A]"><span className="grid size-8 place-items-center rounded-full border border-[#D9D5CE] bg-white transition-transform group-hover:-translate-x-0.5"><ArrowLeft className="size-4" /></span>Volver al panel</button>
          <div className="hidden items-center gap-2 text-xs font-semibold text-[#647078] sm:flex"><span className="size-2 rounded-full bg-[#57A58D]" />Agenda sincronizada</div>
        </div>

        <section className="relative overflow-hidden rounded-[28px] bg-[#17313A] px-6 py-7 text-white shadow-[0_20px_45px_rgba(23,49,58,0.18)] sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-16 -top-28 size-80 rounded-full bg-[#D7A58D]/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 size-36 rounded-full border border-white/10" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl"><p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E7B29A]"><Sparkles className="size-3.5" />Organización sin fricción</p><h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Tu agenda, con claridad.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#D8DDD9] sm:text-base">{isAdmin ? 'Vista global para anticiparte a cada movimiento de tu equipo.' : 'Un espacio para tener cada oportunidad, visita y cierre exactamente donde debe estar.'}</p></div>
            <Button onClick={() => setShowForm(value => !value)} className="h-11 rounded-xl bg-[#F8F4EF] px-5 font-bold text-[#17313A] shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white"><Plus className="size-4" />{showForm ? 'Cerrar agenda' : 'Nuevo evento'}</Button>
          </div>
          <div className="relative mt-7 grid grid-cols-3 border-t border-white/15 pt-5 sm:max-w-xl"><div><p className="text-2xl font-bold">{todayEvents}</p><p className="mt-0.5 text-xs text-[#BFC9C6]">Para hoy</p></div><div className="border-l border-white/15 pl-5"><p className="text-2xl font-bold">{weekEvents}</p><p className="mt-0.5 text-xs text-[#BFC9C6]">En 7 días</p></div><div className="border-l border-white/15 pl-5"><p className="text-2xl font-bold">{reminderEvents.length}</p><p className="mt-0.5 text-xs text-[#BFC9C6]">Por atender</p></div></div>
        </section>

        {showForm && <form onSubmit={createEvent} className="mt-6 rounded-[24px] border border-[#D7D5CF] bg-white p-5 shadow-[0_14px_35px_rgba(23,49,58,0.08)] sm:p-6">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="font-serif text-2xl font-semibold">Crear un momento</h2><p className="mt-1 text-sm text-[#69747A]">Todo lo necesario, sin formularios pesados.</p></div><span className="hidden rounded-full bg-[#EFF5F2] px-3 py-1 text-xs font-bold text-[#2D7A68] sm:block">Nuevo registro</span></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1.5 text-xs font-bold uppercase tracking-wide text-[#526168]">Título<Input required placeholder="Ej. Visita con familia Ríos" value={form.titulo} onChange={e => setForm(current => ({ ...current, titulo: e.target.value }))} className="h-11 border-[#D7DCD9] bg-[#FCFCFB] text-[#17313A] placeholder:text-[#9BA4A5]" /></label>
            <label className="space-y-1.5 text-xs font-bold uppercase tracking-wide text-[#526168]">Fecha<Input required type="date" value={form.fecha} onChange={e => setForm(current => ({ ...current, fecha: e.target.value }))} className="h-11 border-[#D7DCD9] bg-[#FCFCFB] text-[#17313A] [color-scheme:light]" /></label>
            <label className="space-y-1.5 text-xs font-bold uppercase tracking-wide text-[#526168]">Hora<Input required type="time" value={form.hora} onChange={e => setForm(current => ({ ...current, hora: e.target.value }))} className="h-11 border-[#D7DCD9] bg-[#FCFCFB] text-[#17313A] [color-scheme:light]" /></label>
            <label className="space-y-1.5 text-xs font-bold uppercase tracking-wide text-[#526168]">Tipo<select value={form.tipo} onChange={e => setForm(current => ({ ...current, tipo: e.target.value as EventType }))} className="h-11 w-full rounded-md border border-[#D7DCD9] bg-[#FCFCFB] px-3 text-sm font-medium text-[#17313A] outline-none focus:border-[#17313A]">{Object.entries(EVENT_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="space-y-1.5 text-xs font-bold uppercase tracking-wide text-[#526168]">Avisarme antes<Input min="0" max="12" type="number" value={form.mesesAntes} onChange={e => setForm(current => ({ ...current, mesesAntes: Number(e.target.value) }))} className="h-11 border-[#D7DCD9] bg-[#FCFCFB] text-[#17313A]" /></label>
            <p className="self-end pb-2 text-xs leading-5 text-[#69747A]">Define cuántos meses antes quieres recibir el recordatorio.</p>
          </div>
          <label className="mt-4 block space-y-1.5 text-xs font-bold uppercase tracking-wide text-[#526168]">Notas (opcional)<Textarea placeholder="Contexto que te ayude a llegar preparado…" value={form.descripcion} onChange={e => setForm(current => ({ ...current, descripcion: e.target.value }))} className="min-h-24 border-[#D7DCD9] bg-[#FCFCFB] text-[#17313A] placeholder:text-[#9BA4A5]" /></label>
          <div className="mt-5 flex flex-wrap gap-3"><Button disabled={isSaving} type="submit" className="h-10 rounded-xl bg-[#17313A] px-5 font-bold text-white hover:bg-[#294952]">{isSaving ? 'Guardando…' : 'Guardar evento'}</Button><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="h-10 rounded-xl px-4 font-semibold text-[#526168] hover:bg-[#F3F1ED] hover:text-[#17313A]">Cancelar</Button></div>
        </form>}

        {reminderEvents.length > 0 && <section className="mt-6 flex gap-4 rounded-2xl border border-[#E9D6A7] bg-[#FFF9E9] p-4 text-[#674E15]"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F7E6B8]"><BellRing className="size-5" /></span><div><p className="font-bold">Tienes {reminderEvents.length} recordatorio{reminderEvents.length === 1 ? '' : 's'} por atender</p><p className="mt-1 text-sm text-[#7B682E]">{reminderEvents.slice(0, 2).map(event => `${event.titulo} · ${reminderLabel(event)}`).join('  /  ')}{reminderEvents.length > 2 ? '…' : ''}</p></div></section>}

        <div className="mt-6 grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="rounded-[24px] border border-[#DDDAD4] bg-white p-5 shadow-[0_12px_30px_rgba(23,49,58,0.06)]">
              <div className="mb-5 flex items-center justify-between"><h2 className="font-serif text-xl font-semibold capitalize">{monthLabel(visibleMonth)}</h2><div className="flex gap-1"><button aria-label="Mes anterior" onClick={() => setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="grid size-8 place-items-center rounded-lg text-[#526168] hover:bg-[#F2F1EE]"><ChevronLeft className="size-4" /></button><button aria-label="Mes siguiente" onClick={() => setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="grid size-8 place-items-center rounded-lg text-[#526168] hover:bg-[#F2F1EE]"><ChevronRight className="size-4" /></button></div></div>
              <div className="grid grid-cols-7 gap-y-2 text-center">{WEEK_DAYS.map((day, index) => <span key={`${day}-${index}`} className="pb-1 text-[10px] font-bold text-[#8B9496]">{day}</span>)}{calendarDays.map((day, index) => {
                if (!day) return <span key={`blank-${index}`} />
                const iso = toISODate(day); const selected = iso === selectedDate; const today = iso === isoToday(); const hasEvent = eventDates.has(iso)
                return <button key={iso} onClick={() => selectDay(day)} className={`relative mx-auto grid size-9 place-items-center rounded-xl text-sm font-semibold transition-all ${selected ? 'bg-[#17313A] text-white shadow-md shadow-[#17313A]/20' : today ? 'bg-[#E7F0ED] text-[#17313A]' : 'text-[#46545A] hover:bg-[#F2F1EE]'}`}><span>{day.getDate()}</span>{hasEvent && !selected && <i className="absolute bottom-1 size-1 rounded-full bg-[#C36C48]" />}</button>
              })}</div>
              <button onClick={() => selectDay(parseDate(isoToday()))} className="mt-5 w-full rounded-xl border border-[#D9D8D3] py-2 text-xs font-bold text-[#526168] transition-colors hover:border-[#17313A] hover:text-[#17313A]">Ir a hoy</button>
            </section>
            <section className="rounded-[24px] border border-[#DDDAD4] bg-[#FCFCFB] p-5">
              <div className="mb-4 flex items-center gap-2"><CalendarDays className="size-4 text-[#C36C48]" /><h2 className="font-serif text-xl font-semibold">Próximamente</h2></div>
              {upcomingEvents.length === 0 ? <p className="rounded-xl bg-[#F4F3F0] p-4 text-sm leading-6 text-[#738084]">Tu agenda está despejada. Un buen momento para preparar la siguiente oportunidad.</p> : <div className="space-y-2">{upcomingEvents.map(event => { const style = EVENT_STYLE[event.tipo]; return <button key={event.id} onClick={() => selectDay(parseDate(event.fecha))} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-[#F1F4F2]"><span className="grid size-10 shrink-0 place-items-center rounded-xl text-xs font-bold" style={{ backgroundColor: style.surface, color: style.text }}>{parseDate(event.fecha).getDate()}</span><span className="min-w-0"><span className="block truncate text-sm font-bold text-[#253D46]">{event.titulo}</span><span className="mt-0.5 block text-xs text-[#738084]">{dateLabel(event.fecha, true)} · {event.hora.slice(0, 5)}</span></span></button> })}</div>}
            </section>
          </aside>

          <section className="min-h-[510px] rounded-[28px] border border-[#DDDAD4] bg-white shadow-[0_12px_30px_rgba(23,49,58,0.06)]">
            <div className="flex flex-col justify-between gap-4 border-b border-[#E9E6E0] px-5 py-5 sm:flex-row sm:items-center sm:px-7"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C36C48]">Agenda del día</p><h2 className="mt-1 font-serif text-2xl font-semibold capitalize text-[#17313A]">{dateLabel(selectedDate)}</h2></div><div className="flex items-center gap-2 rounded-full bg-[#F1F5F3] px-3 py-1.5 text-xs font-bold text-[#2D7A68]"><span className="size-2 rounded-full bg-[#57A58D]" />{selectedEvents.length} evento{selectedEvents.length === 1 ? '' : 's'}</div></div>
            <div className="p-5 sm:p-7">
              {isLoading ? <div className="space-y-3"><div className="h-24 animate-pulse rounded-2xl bg-[#F2F1EE]" /><div className="h-24 animate-pulse rounded-2xl bg-[#F2F1EE]" /></div> : selectedEvents.length === 0 ? <div className="grid min-h-80 place-items-center rounded-[22px] border border-dashed border-[#D8D8D2] bg-[#FCFCFB] p-8 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#EAF2EF] text-[#2D7A68]"><CalendarDays className="size-6" /></span><h3 className="mt-4 font-serif text-2xl font-semibold">Un espacio para respirar</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#718087]">No hay compromisos para esta fecha. Puedes usar este tiempo para avanzar lo importante.</p><Button onClick={() => { setForm(current => ({ ...current, fecha: selectedDate })); setShowForm(true) }} className="mt-5 rounded-xl bg-[#17313A] font-bold text-white hover:bg-[#294952]"><Plus className="size-4" />Agendar aquí</Button></div></div> : <div className="space-y-4">{selectedEvents.map(event => { const style = EVENT_STYLE[event.tipo]; return <article key={event.id} className="group relative overflow-hidden rounded-2xl border border-[#E1E1DC] bg-[#FEFEFD] p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(23,49,58,0.08)] sm:p-5"><span className="absolute bottom-0 left-0 top-0 w-1" style={{ backgroundColor: style.dot }} /><div className="flex gap-3 pl-2"><div className="grid size-12 shrink-0 place-items-center rounded-2xl text-sm font-bold" style={{ backgroundColor: style.surface, color: style.text }}><Clock3 className="size-4" /><span className="text-xs">{event.hora.slice(0, 5)}</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: style.surface, color: style.text }}>{EVENT_TYPES[event.tipo]}</span><h3 className="mt-2 text-base font-bold text-[#17313A] sm:text-lg">{event.titulo}</h3></div><button onClick={() => void deleteEvent(event.id)} aria-label={`Eliminar ${event.titulo}`} className="grid size-9 place-items-center rounded-xl text-[#8D9698] opacity-100 transition-colors hover:bg-[#FCEBE7] hover:text-[#C05050] sm:opacity-0 sm:group-hover:opacity-100"><Trash2 className="size-4" /></button></div>{event.descripcion && <p className="mt-2 text-sm leading-6 text-[#637076]">{event.descripcion}</p>}<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[#718087]"><span className="flex items-center gap-1"><BellRing className="size-3.5" />{reminderLabel(event)}</span>{isAdmin && <span className="flex items-center gap-1"><UserRound className="size-3.5" />{event.asesor_nombre || event.asesor_email}</span>}</div></div></div></article> })}</div>}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
