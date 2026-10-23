'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { BROKER_CHECKLIST, brokerPipeline, checklistAvance, etapasInfonavit, moverEtapa, type ChecklistEstado, type Etapa } from '@/lib/broker-checklist'
import { BrokerPipelineBancario } from '@/components/broker-pipeline-bancario'
import {
  LogOut,
  Plus,
  Home,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Users,
  Landmark,
  ClipboardCheck,
  PenTool,
  Trash2,
} from 'lucide-react'

// Cliente en proceso de crédito hipotecario (tabla broker_clientes)
interface CreditoHipotecario {
  id: number
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  propiedad: string
  monto_credito: string
  tipo_credito: string
  checklist: ChecklistEstado
  fecha_inicio: string
  updated_at: string
  notas: string
  notaria: string
  fecha_firma: string | null
}

const NUEVO_CLIENTE = {
  cliente_nombre: '',
  cliente_email: '',
  cliente_telefono: '',
  propiedad: '',
  monto_credito: '',
  tipo_credito: '',
  notas: '',
}

const formatFecha = (value: string, options: Intl.DateTimeFormatOptions) =>
  new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString('es-MX', options)

const hoy = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Siguiente documento pendiente según el orden de la hoja
const siguientePendiente = (checklist: ChecklistEstado) => {
  for (const grupo of BROKER_CHECKLIST) {
    const doc = grupo.documentos.find(d => !checklist?.[d.id])
    if (doc) return { grupo: grupo.titulo, nombre: doc.nombre }
  }
  return null
}

export default function PanelBrokerPage() {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [clientes, setClientes] = useState<CreditoHipotecario[]>([])
  const [cargando, setCargando] = useState(true)
  const [clienteId, setClienteId] = useState<number | null>(null)
  const [vistaDetalle, setVistaDetalle] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState(NUEVO_CLIENTE)
  const [guardando, setGuardando] = useState(false)
  const [borrador, setBorrador] = useState({ notas: '', notaria: '', fecha_firma: '' })

  const email = user?.email?.toLowerCase() || ''
  const pipeline = brokerPipeline(email)
  const clienteSeleccionado = clientes.find(c => c.id === clienteId) || null

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || user?.role !== 'broker') {
      router.push('/login')
      return
    }
    // El pipeline bancario carga sus propios datos
    if (pipeline === 'infonavit') cargarClientes()
  }, [user, isAuthenticated, loading, router])

  useEffect(() => {
    if (clienteSeleccionado) {
      setBorrador({
        notas: clienteSeleccionado.notas || '',
        notaria: clienteSeleccionado.notaria || '',
        fecha_firma: clienteSeleccionado.fecha_firma || '',
      })
    }
  }, [clienteId])

  const cargarClientes = async () => {
    setCargando(true)
    try {
      const res = await fetch(`/api/broker/clientes?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setClientes(data.clientes || [])
    } catch (error: any) {
      toast.error(error?.message ? `Error cargando clientes: ${error.message}` : 'Error cargando clientes')
    } finally {
      setCargando(false)
    }
  }

  const crearCliente = async () => {
    if (!nuevoCliente.cliente_nombre.trim()) { toast.error('El nombre del cliente es obligatorio'); return }
    setGuardando(true)
    try {
      const res = await fetch('/api/broker/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...nuevoCliente }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setClientes(prev => [data.cliente, ...prev])
      setNuevoCliente(NUEVO_CLIENTE)
      setMostrarFormulario(false)
      toast.success('Cliente agregado')
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo crear el cliente')
    } finally {
      setGuardando(false)
    }
  }

  const guardarCambios = async (id: number, cambios: Record<string, unknown>) => {
    const res = await fetch('/api/broker/clientes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, id, ...cambios }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data.cliente as CreditoHipotecario
  }

  const guardarDetalles = async (cliente: CreditoHipotecario) => {
    try {
      const actualizado = await guardarCambios(cliente.id, borrador)
      setClientes(prev => prev.map(c => c.id === cliente.id ? actualizado : c))
      toast.success('Cambios guardados')
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo guardar el cambio')
    }
  }

  // Se actualiza la vista al instante y se guarda en segundo plano.
  const guardarChecklist = async (cliente: CreditoHipotecario, checklist: ChecklistEstado, mensaje?: string) => {
    setClientes(prev => prev.map(c => c.id === cliente.id ? { ...c, checklist } : c))
    try {
      await guardarCambios(cliente.id, { checklist })
      if (mensaje) toast.success(mensaje)
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo guardar el avance')
      cargarClientes()
    }
  }

  // Palomear / despalomear un documento del expediente
  const toggleDocumento = (cliente: CreditoHipotecario, docId: string) => {
    const checklist = { ...(cliente.checklist || {}) }
    if (checklist[docId]) delete checklist[docId]
    else checklist[docId] = hoy()
    guardarChecklist(cliente, checklist, checklistAvance(checklist).porcentaje === 100 ? '¡Expediente completo!' : undefined)
  }

  // Avanzar o regresar la línea de tiempo Infonavit
  const moverEtapaCliente = (cliente: CreditoHipotecario, etapa: Etapa) => {
    const regresar = etapa.estado === 'completado'
    if (regresar && !confirm(`¿Regresar a la etapa "${etapa.titulo}"? Se desmarcarán esta etapa y las siguientes.`)) return
    guardarChecklist(cliente, moverEtapa(cliente.checklist || {}, etapa.id, hoy()), regresar ? 'Etapa actualizada' : `Etapa "${etapa.titulo}" completada`)
  }

  const eliminarCliente = async (cliente: CreditoHipotecario) => {
    if (!confirm(`¿Eliminar a ${cliente.cliente_nombre} de tus clientes?`)) return
    try {
      const res = await fetch(`/api/broker/clientes?id=${cliente.id}&email=${encodeURIComponent(email)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setClientes(prev => prev.filter(c => c.id !== cliente.id))
      cerrarDetalle()
      toast.success('Cliente eliminado')
    } catch {
      toast.error('No se pudo eliminar el cliente')
    }
  }

  const abrirDetalle = (cliente: CreditoHipotecario) => { setClienteId(cliente.id); setVistaDetalle(true) }
  const cerrarDetalle = () => { setVistaDetalle(false); setClienteId(null) }

  if (loading || !user) return null

  const inputClass = 'w-full rounded-xl bg-white dark:bg-[#17313A] border border-[#17313A]/15 dark:border-white/10 px-3 py-2 text-sm text-[#17313A] dark:text-white placeholder:text-gray-500 focus:outline-none focus:border-conectia-gold/50'

  // Estadísticas
  const avances = clientes.map(c => checklistAvance(c.checklist))
  const totalClientes = clientes.length
  const completos = avances.filter(a => a.porcentaje === 100).length
  const enProceso = totalClientes - completos
  const conFirma = clientes.filter(c => c.fecha_firma).length

  const STATS = [
    { label: 'Total Clientes', sub: `${completos} con expediente completo`, value: totalClientes, badge: 'Total', icon: Users, tone: 'blue' },
    { label: 'En Proceso', sub: 'Expedientes con pendientes', value: enProceso, badge: 'Activos', icon: Clock, tone: 'orange' },
    { label: 'Firma Programada', sub: 'Con fecha de firma', value: conFirma, badge: 'Firma', icon: PenTool, tone: 'gold' },
    { label: 'Expediente Completo', sub: 'Todos los documentos', value: completos, badge: 'Éxito', icon: CheckCircle2, tone: 'green' },
  ] as const

  const TONOS = {
    blue: { border: 'border-blue-500/20 hover:border-blue-500/50', soft: 'bg-blue-500/10', icon: 'bg-blue-500/20 text-blue-400', badge: 'text-blue-400 bg-blue-500/10' },
    orange: { border: 'border-orange-500/20 hover:border-orange-500/50', soft: 'bg-orange-500/10', icon: 'bg-orange-500/20 text-orange-400', badge: 'text-orange-400 bg-orange-500/10' },
    gold: { border: 'border-conectia-gold/20 hover:border-conectia-gold/50', soft: 'bg-conectia-gold/10', icon: 'bg-conectia-gold/20 text-conectia-gold', badge: 'text-conectia-gold bg-conectia-gold/10' },
    green: { border: 'border-green-500/20 hover:border-green-500/50', soft: 'bg-green-500/10', icon: 'bg-green-500/20 text-green-400', badge: 'text-green-400 bg-green-500/10' },
  }

  return (
    <div className="min-h-screen bg-[#17313A] text-[#EAE4DD]">
      {/* Header */}
      <header className="bg-[#1A3540] border-b border-gray-700/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-conectia-gold/20 rounded-xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-conectia-gold" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Panel de Broker</h1>
                <p className="text-sm text-gray-400">{user.nombre} · {pipeline === 'bancario' ? 'Pipeline bancario' : 'Crédito Hipotecario'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={cerrarDetalle}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  !vistaDetalle
                    ? 'bg-conectia-gold text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Mis Clientes</span>
              </button>
              <button
                onClick={async () => { await logout(); router.replace('/login') }}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {pipeline === 'bancario' ? <BrokerPipelineBancario email={email} /> : <>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map(stat => {
            const tono = TONOS[stat.tone]
            return (
              <div key={stat.label} className={`bg-[#1A3540] rounded-2xl p-5 border relative overflow-hidden hover:shadow-lg transition-all duration-300 ${tono.border}`}>
                <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none ${tono.soft}`} />
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tono.icon}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tono.badge}`}>{stat.badge}</span>
                </div>
                <p className="text-4xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
              </div>
            )
          })}
        </div>

        {/* Vista detalle de cliente o lista */}
        {vistaDetalle && clienteSeleccionado ? (() => {
          const avance = checklistAvance(clienteSeleccionado.checklist)
          const etapas = etapasInfonavit(clienteSeleccionado.checklist)
          const indiceActual = etapas.findIndex(e => e.estado === 'actual')
          const etapaActual = etapas[indiceActual]
          return (
          <div className="space-y-6">
            <button
              onClick={cerrarDetalle}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-conectia-gold transition-colors mb-4"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Volver a mis clientes
            </button>

            {/* Info del cliente */}
            <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
              <div className="p-5 bg-gradient-to-r from-blue-500/10 to-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{clienteSeleccionado.cliente_nombre}</h2>
                    <p className="text-sm text-gray-400">{[clienteSeleccionado.cliente_email, clienteSeleccionado.cliente_telefono].filter(Boolean).join(' · ') || 'Sin datos de contacto'}</p>
                    {clienteSeleccionado.propiedad && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2"><span className="text-gray-500">Propiedad:</span> {clienteSeleccionado.propiedad}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="text-sm text-conectia-gold font-semibold">{clienteSeleccionado.monto_credito}</span>
                      <span className="text-sm text-gray-400">{clienteSeleccionado.tipo_credito}</span>
                    </div>
                  </div>
                  <div className="md:text-right shrink-0">
                    <p className="text-xs text-gray-500">Inicio del proceso</p>
                    <p className="text-sm font-semibold text-white">{formatFecha(clienteSeleccionado.fecha_inicio, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Línea de tiempo: etapas del trámite Infonavit (las avanza el broker) */}
            <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-conectia-gold/10 to-transparent flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500/15 rounded-lg flex items-center justify-center">
                    <Landmark className="h-4 w-4 text-orange-500" />
                  </div>
                  Línea de Tiempo · Trámite Infonavit
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${etapaActual ? 'bg-orange-500/15 text-orange-500 border-orange-500/30' : 'bg-green-500/15 text-green-500 border-green-500/30'}`}>
                  {etapaActual ? `Etapa ${indiceActual + 1} de ${etapas.length} · ${etapaActual.titulo}` : 'Crédito ejercido'}
                </span>
              </div>
              <div className="p-5 sm:p-6">
                <LineaDeTiempo
                  etapas={etapas}
                  fechaFirma={clienteSeleccionado.fecha_firma}
                  onMover={(etapa) => moverEtapaCliente(clienteSeleccionado, etapa)}
                />
                <p className="text-xs text-gray-500 mt-5">Toca una etapa para marcarla como completada (también se marcan las anteriores). Toca una etapa completada para regresar a ella.</p>
              </div>
            </div>

            {/* Checklist del expediente */}
            <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-conectia-gold/10 to-transparent space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500/15 rounded-lg flex items-center justify-center">
                      <ClipboardCheck className="h-4 w-4 text-orange-500" />
                    </div>
                    Checklist · Expediente de Crédito
                  </h2>
                  <span className={`text-sm font-bold ${avance.porcentaje === 100 ? 'text-green-500' : 'text-white'}`}>
                    {avance.hechos}/{avance.total} documentos · {avance.porcentaje}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500" style={{ width: `${avance.porcentaje}%` }} />
                </div>
                <p className="text-xs text-gray-400">Palomea cada documento conforme lo recibas. Se guarda la fecha en que lo marcaste.</p>
              </div>

              <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {BROKER_CHECKLIST.map((grupo, indice) => {
                  const hechos = grupo.documentos.filter(d => clienteSeleccionado.checklist?.[d.id]).length
                  const completo = hechos === grupo.documentos.length
                  return (
                    <section key={grupo.id}>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${completo ? 'bg-green-500 text-white' : 'bg-orange-500/15 text-orange-500'}`}>
                            {completo ? <CheckCircle2 className="h-4 w-4" /> : indice + 1}
                          </span>
                          {grupo.titulo}
                        </h3>
                        <span className={`text-xs font-semibold ${completo ? 'text-green-500' : 'text-gray-400'}`}>{hechos}/{grupo.documentos.length}</span>
                      </div>
                      <ol className="relative ml-3 border-l-2 border-gray-700/60">
                        {grupo.documentos.map(doc => {
                          const fecha = clienteSeleccionado.checklist?.[doc.id]
                          return (
                            <li key={doc.id} className="relative">
                              <button
                                type="button"
                                role="checkbox"
                                aria-checked={Boolean(fecha)}
                                onClick={() => toggleDocumento(clienteSeleccionado, doc.id)}
                                className="group w-full flex items-start gap-3 py-1.5 pl-5 pr-2 text-left rounded-r-lg hover:bg-white/5 transition-colors"
                              >
                                <span className="absolute -left-[11px] top-1.5 bg-[#1A3540] rounded-full">
                                  {fecha
                                    ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    : <Circle className="h-5 w-5 text-gray-500 group-hover:text-orange-500" />}
                                </span>
                                <span className="flex-1 min-w-0">
                                  <span className={`block text-sm leading-snug ${fecha ? 'font-semibold text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {doc.nombre}
                                  </span>
                                  {fecha && <span className="block text-[11px] text-gray-500">Recibido {formatFecha(fecha, { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ol>
                    </section>
                  )
                })}
              </div>
            </div>

            {/* Notaría, firma y notas (editables) */}
            <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Landmark className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="font-bold text-white">Notaría, firma y notas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-xs text-gray-400">Notaría asignada</span>
                  <input
                    value={borrador.notaria}
                    onChange={(e) => setBorrador(prev => ({ ...prev, notaria: e.target.value }))}
                    placeholder="Ej: Notaría 15 - Lic. Fernando Ramírez"
                    className={inputClass}
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs text-gray-400">Fecha de firma</span>
                  <input
                    type="date"
                    value={borrador.fecha_firma}
                    onChange={(e) => setBorrador(prev => ({ ...prev, fecha_firma: e.target.value }))}
                    className={inputClass}
                  />
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className="text-xs text-gray-400">Notas</span>
                <textarea
                  rows={3}
                  value={borrador.notas}
                  onChange={(e) => setBorrador(prev => ({ ...prev, notas: e.target.value }))}
                  placeholder="Pendientes, acuerdos, próximos pasos..."
                  className={inputClass}
                />
              </label>
              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  Última actualización: {formatFecha(clienteSeleccionado.updated_at, { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => eliminarCliente(clienteSeleccionado)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                  <button
                    onClick={() => guardarDetalles(clienteSeleccionado)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-conectia-gold text-white hover:bg-conectia-gold/80 transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
          )
        })() : (
          /* Lista de clientes */
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Mis Clientes en Proceso</h2>
              <button
                onClick={() => setMostrarFormulario(v => !v)}
                className="flex items-center gap-2 px-5 py-2.5 bg-conectia-gold hover:bg-conectia-gold/80 text-white rounded-xl font-semibold text-sm transition-all shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Nuevo Cliente
              </button>
            </div>

            {mostrarFormulario && (
              <div className="bg-[#1A3540] rounded-2xl border border-conectia-gold/30 p-5 shadow-xl space-y-4">
                <h3 className="font-bold text-white">Nuevo cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {([
                    ['cliente_nombre', 'Nombre del cliente *', 'Ej: Juan Pérez Rodríguez'],
                    ['propiedad', 'Propiedad', 'Ej: Casa en Villas La Valenciana'],
                    ['cliente_email', 'Correo', 'cliente@correo.com'],
                    ['cliente_telefono', 'Teléfono', '477 000 0000'],
                    ['monto_credito', 'Monto del crédito', 'Ej: $3,500,000'],
                    ['tipo_credito', 'Tipo de crédito', 'Ej: INFONAVIT + Bancario'],
                  ] as const).map(([campo, etiqueta, placeholder]) => (
                    <label key={campo} className="space-y-1.5">
                      <span className="text-xs text-gray-400">{etiqueta}</span>
                      <input
                        value={nuevoCliente[campo]}
                        onChange={(e) => setNuevoCliente(prev => ({ ...prev, [campo]: e.target.value }))}
                        placeholder={placeholder}
                        className={inputClass}
                      />
                    </label>
                  ))}
                </div>
                <label className="block space-y-1.5">
                  <span className="text-xs text-gray-400">Notas</span>
                  <textarea
                    rows={2}
                    value={nuevoCliente.notas}
                    onChange={(e) => setNuevoCliente(prev => ({ ...prev, notas: e.target.value }))}
                    className={inputClass}
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setMostrarFormulario(false); setNuevoCliente(NUEVO_CLIENTE) }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 border border-white/15 hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={crearCliente}
                    disabled={guardando}
                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-conectia-gold text-white hover:bg-conectia-gold/80 disabled:opacity-50 transition-all"
                  >
                    {guardando ? 'Guardando...' : 'Agregar cliente'}
                  </button>
                </div>
              </div>
            )}

            {cargando ? (
              <p className="text-center text-sm text-gray-400 py-12">Cargando clientes...</p>
            ) : clientes.length === 0 ? (
              <div className="text-center py-14 bg-[#1A3540] rounded-2xl border border-gray-700/60">
                <Users className="h-10 w-10 mx-auto text-gray-600 mb-3" />
                <p className="font-semibold text-white">Aún no tienes clientes en proceso</p>
                <p className="text-sm text-gray-400 mt-1">Agrega el primero con el botón &quot;Nuevo Cliente&quot;.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientes.map((cliente, i) => {
                  const avance = avances[i]
                  const pendiente = siguientePendiente(cliente.checklist)
                  const etapas = etapasInfonavit(cliente.checklist)
                  const indiceActual = etapas.findIndex(e => e.estado === 'actual')
                  return (
                    <div
                      key={cliente.id}
                      className="bg-[#1A3540] rounded-2xl border border-gray-700/60 hover:border-conectia-gold/30 shadow-xl hover:shadow-conectia-gold/5 transition-all duration-300 cursor-pointer group overflow-hidden"
                      onClick={() => abrirDetalle(cliente)}
                    >
                      {/* Mini línea de tiempo por etapa */}
                      <div className="flex h-1.5 gap-0.5">
                        {etapas.map(etapa => (
                          <div key={etapa.id} className={`flex-1 ${etapa.estado === 'completado' ? 'bg-green-500' : etapa.estado === 'actual' ? 'bg-orange-500' : 'bg-gray-700'}`} />
                        ))}
                      </div>

                      <div className="p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Info del cliente */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-base font-bold text-white truncate">{cliente.cliente_nombre}</h3>
                              <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                indiceActual === -1
                                  ? 'bg-green-500/20 text-green-500 border-green-500/30'
                                  : 'bg-orange-500/15 text-orange-500 border-orange-500/30'
                              }`}>
                                {indiceActual === -1 ? 'Crédito ejercido' : `Etapa ${indiceActual + 1}/${etapas.length} · ${etapas[indiceActual].titulo}`}
                              </span>
                            </div>
                            {cliente.propiedad && (
                              <p className="text-sm text-gray-400 truncate mb-1">
                                <Home className="inline h-3 w-3 mr-1" />
                                {cliente.propiedad}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="text-conectia-gold font-semibold">{cliente.monto_credito}</span>
                              {cliente.monto_credito && cliente.tipo_credito && <span>·</span>}
                              <span>{cliente.tipo_credito}</span>
                            </div>
                          </div>

                          {/* Siguiente pendiente */}
                          <div className="flex items-center gap-3 lg:min-w-[300px] lg:max-w-[340px]">
                            <div className={`p-2.5 rounded-xl ${pendiente ? 'bg-orange-500/10' : 'bg-green-500/10'}`}>
                              {pendiente ? <Clock className="h-5 w-5 text-orange-400" /> : <CheckCircle2 className="h-5 w-5 text-green-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold ${pendiente ? 'text-orange-400' : 'text-green-500'}`}>
                                {pendiente ? `Siguiente pendiente · ${pendiente.grupo}` : 'Expediente completo'}
                              </p>
                              <p className="text-sm font-medium text-white truncate">
                                {pendiente ? pendiente.nombre : cliente.fecha_firma ? `Firma: ${formatFecha(cliente.fecha_firma, { day: 'numeric', month: 'short' })}` : 'Listo para firma'}
                              </p>
                            </div>
                          </div>

                          {/* Documentos */}
                          <div className="lg:min-w-[120px]">
                            <p className="text-xs text-gray-500 mb-1">Documentos</p>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${avance.porcentaje}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-gray-400">{avance.hechos}/{avance.total}</span>
                            </div>
                          </div>

                          <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-conectia-gold transition-colors hidden lg:block shrink-0" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        </>}
      </div>
    </div>
  )
}

function LineaDeTiempo({ etapas, fechaFirma, onMover }: { etapas: Etapa[]; fechaFirma: string | null; onMover: (etapa: Etapa) => void }) {
  const detalle = (etapa: Etapa) => {
    if (etapa.fecha) return formatFecha(etapa.fecha, { day: 'numeric', month: 'short', year: 'numeric' })
    if (etapa.id === 'firma' && fechaFirma) return `Programada ${formatFecha(fechaFirma, { day: 'numeric', month: 'short' })}`
    return etapa.descripcion
  }

  return (
    <ol className="flex flex-col lg:flex-row">
      {etapas.map((etapa, i) => {
        const ultima = i === etapas.length - 1
        const lineaHecha = etapa.estado === 'completado'
        return (
          <li key={etapa.id} className="relative lg:flex-1 pb-5 lg:pb-0 last:pb-0">
            {/* Conector hacia la siguiente etapa */}
            {!ultima && (
              <>
                <span className={`hidden lg:block absolute top-5 left-1/2 w-full h-1 rounded-full ${lineaHecha ? 'bg-green-500' : 'bg-gray-700'}`} />
                <span className={`lg:hidden absolute left-5 top-10 bottom-0 w-1 -ml-0.5 rounded-full ${lineaHecha ? 'bg-green-500' : 'bg-gray-700'}`} />
              </>
            )}
            <button
              type="button"
              onClick={() => onMover(etapa)}
              title={etapa.estado === 'completado' ? 'Regresar a esta etapa' : 'Marcar como completada'}
              className="group relative w-full flex lg:flex-col items-start lg:items-center gap-3 lg:gap-0 text-left lg:text-center rounded-xl"
            >
              <span className={`relative z-10 shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all group-hover:scale-110 ${
                etapa.estado === 'completado'
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : etapa.estado === 'actual'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-500/20'
                  : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600'
              }`}>
                {etapa.estado === 'completado' ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
              </span>
              <span className="block lg:mt-3 lg:px-1.5 pt-0.5 lg:pt-0">
                <span className={`block text-sm font-bold leading-tight ${
                  etapa.estado === 'completado' ? 'text-green-500' : etapa.estado === 'actual' ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {etapa.titulo}
                </span>
                <span className="block text-[11px] text-gray-500 mt-1 leading-snug">{detalle(etapa)}</span>
                {etapa.estado === 'actual' && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-500 text-[10px] font-bold uppercase tracking-wider">
                    Etapa actual
                  </span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
