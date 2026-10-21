'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LogOut,
  Plus,
  FileText,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Users,
  Landmark,
  ClipboardCheck,
  FileSearch,
  PenTool,
  Trash2,
  Edit,
  Eye
} from 'lucide-react'

// Tipos para el proceso de crédito hipotecario (tabla broker_clientes)
interface DocumentoVendedor {
  nombre: string
  entregado: boolean
}

interface CreditoHipotecario {
  id: number
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  propiedad: string
  monto_credito: string
  tipo_credito: string
  paso_actual: number
  fecha_inicio: string
  updated_at: string
  notas: string
  documentos_vendedor: DocumentoVendedor[]
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

// Pasos del proceso
const PASOS_CREDITO = [
  {
    id: 1,
    titulo: 'Integración de Expediente',
    descripcion: 'Recopilar documentos del comprador y solicitud de crédito',
    icono: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/50'
  },
  {
    id: 2,
    titulo: 'Documentos del Vendedor',
    descripcion: 'Carpeta técnica: Escrituras, Predial, Recibo de Agua, Planos, Cuenta y Generales',
    icono: ClipboardCheck,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/50'
  },
  {
    id: 3,
    titulo: 'Autorización del Crédito',
    descripcion: 'Revisión y autorización por parte de la institución financiera',
    icono: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/50'
  },
  {
    id: 4,
    titulo: 'Solicitud y Elaboración de Avalúo',
    descripcion: 'Solicitar avalúo de la propiedad y esperar resultados',
    icono: FileSearch,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/50'
  },
  {
    id: 5,
    titulo: 'Asignación a Notaría',
    descripcion: 'Selección y asignación del notario público para la operación',
    icono: Landmark,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/50'
  },
  {
    id: 6,
    titulo: 'Programación de Firma',
    descripcion: 'Coordinar fecha y hora para la firma de escrituras',
    icono: PenTool,
    color: 'text-conectia-gold',
    bgColor: 'bg-conectia-gold/10',
    borderColor: 'border-conectia-gold/50'
  }
]

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
  const clienteSeleccionado = clientes.find(c => c.id === clienteId) || null

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || user?.role !== 'broker') {
      router.push('/login')
      return
    }
    cargarClientes()
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

  const actualizarCliente = async (id: number, cambios: Partial<CreditoHipotecario>, mensaje?: string) => {
    try {
      const res = await fetch('/api/broker/clientes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, id, ...cambios }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setClientes(prev => prev.map(c => c.id === id ? data.cliente : c))
      if (mensaje) toast.success(mensaje)
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo guardar el cambio')
    }
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
  const totalClientes = clientes.length
  const enProceso = clientes.filter(c => c.paso_actual < PASOS_CREDITO.length).length
  const porFirmar = clientes.filter(c => c.paso_actual === PASOS_CREDITO.length).length
  const completados = clientes.filter(c => c.paso_actual > PASOS_CREDITO.length).length

  const getEstadoPaso = (pasoActual: number, pasoId: number) => {
    if (pasoId < pasoActual) return 'completado'
    if (pasoId === pasoActual) return 'actual'
    return 'pendiente'
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
                <p className="text-sm text-gray-400">{user.nombre} · Crédito Hipotecario</p>
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
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A3540] rounded-2xl p-5 border border-blue-500/20 relative overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-500/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{totalClientes}</p>
            <p className="text-sm text-gray-400">Total Clientes</p>
            <p className="text-xs text-gray-500 mt-1">{completados} finalizados</p>
          </div>

          <div className="bg-[#1A3540] rounded-2xl p-5 border border-orange-500/20 relative overflow-hidden hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-orange-500/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
              <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">Activos</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{enProceso}</p>
            <p className="text-sm text-gray-400">En Proceso</p>
            <p className="text-xs text-gray-500 mt-1">Créditos en trámite</p>
          </div>

          <div className="bg-[#1A3540] rounded-2xl p-5 border border-conectia-gold/20 relative overflow-hidden hover:border-conectia-gold/50 hover:shadow-lg hover:shadow-conectia-gold/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-conectia-gold/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-conectia-gold/20 rounded-xl flex items-center justify-center">
                <PenTool className="h-5 w-5 text-conectia-gold" />
              </div>
              <span className="text-xs font-semibold text-conectia-gold bg-conectia-gold/10 px-2 py-1 rounded-full">Urgente</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{porFirmar}</p>
            <p className="text-sm text-gray-400">Por Firmar</p>
            <p className="text-xs text-gray-500 mt-1">Pendientes de firma</p>
          </div>

          <div className="bg-[#1A3540] rounded-2xl p-5 border border-green-500/20 relative overflow-hidden hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-green-500/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Éxito</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{completados}</p>
            <p className="text-sm text-gray-400">Completados</p>
            <p className="text-xs text-gray-500 mt-1">Operaciones cerradas</p>
          </div>
        </div>

        {/* Vista detalle de cliente o lista */}
        {vistaDetalle && clienteSeleccionado ? (
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
              <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-blue-500/10 to-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{clienteSeleccionado.cliente_nombre}</h2>
                    <p className="text-sm text-gray-400">{[clienteSeleccionado.cliente_email, clienteSeleccionado.cliente_telefono].filter(Boolean).join(' · ') || 'Sin datos de contacto'}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300"><span className="text-gray-500">Propiedad:</span> {clienteSeleccionado.propiedad}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="text-sm text-conectia-gold font-semibold">{clienteSeleccionado.monto_credito}</span>
                      <span className="text-sm text-gray-400">{clienteSeleccionado.tipo_credito}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">Inicio del proceso</p>
                    <p className="text-sm font-semibold text-white">{formatFecha(clienteSeleccionado.fecha_inicio, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Línea de Tiempo - Crédito Hipotecario */}
            <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-conectia-gold/10 to-transparent">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-conectia-gold/20 rounded-lg flex items-center justify-center">
                    <Landmark className="h-4 w-4 text-conectia-gold" />
                  </div>
                  Línea de Tiempo · Crédito Hipotecario
                </h2>
              </div>
              <div className="p-5">
                {/* Timeline horizontal en desktop, vertical en mobile */}
                <div className="hidden lg:block">
                  {/* Línea horizontal */}
                  <div className="relative">
                    <div className="absolute top-6 left-0 right-0 h-1 bg-gray-700 rounded-full" />
                    <div
                      className="absolute top-6 left-0 h-1 bg-conectia-gold rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((clienteSeleccionado.paso_actual - 1) / (PASOS_CREDITO.length - 1), 1) * 100}%` }}
                    />
                    <div className="relative flex justify-between">
                      {PASOS_CREDITO.map((paso) => {
                        const estado = getEstadoPaso(clienteSeleccionado.paso_actual, paso.id)
                        const Icono = paso.icono
                        return (
                          <div key={paso.id} className="flex flex-col items-center w-40">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                                estado === 'completado'
                                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                  : estado === 'actual'
                                  ? 'bg-conectia-gold text-white shadow-lg shadow-conectia-gold/30 ring-4 ring-conectia-gold/20'
                                  : 'bg-gray-700 text-gray-500'
                              }`}
                            >
                              {estado === 'completado' ? (
                                <CheckCircle2 className="h-6 w-6" />
                              ) : (
                                <Icono className="h-5 w-5" />
                              )}
                            </div>
                            <p className={`text-xs font-semibold mt-3 text-center leading-tight ${
                              estado === 'actual' ? 'text-conectia-gold' : estado === 'completado' ? 'text-green-400' : 'text-gray-500'
                            }`}>
                              {paso.titulo}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1 text-center leading-tight max-w-[140px]">
                              {paso.descripcion}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Timeline vertical en mobile */}
                <div className="lg:hidden space-y-0">
                  {PASOS_CREDITO.map((paso, index) => {
                    const estado = getEstadoPaso(clienteSeleccionado.paso_actual, paso.id)
                    const Icono = paso.icono
                    return (
                      <div key={paso.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                              estado === 'completado'
                                ? 'bg-green-500 text-white'
                                : estado === 'actual'
                                ? 'bg-conectia-gold text-white ring-4 ring-conectia-gold/20'
                                : 'bg-gray-700 text-gray-500'
                            }`}
                          >
                            {estado === 'completado' ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Icono className="h-4 w-4" />
                            )}
                          </div>
                          {index < PASOS_CREDITO.length - 1 && (
                            <div className={`w-0.5 h-12 ${
                              estado === 'completado' ? 'bg-green-500' : 'bg-gray-700'
                            }`} />
                          )}
                        </div>
                        <div className="pb-8">
                          <p className={`text-sm font-semibold ${
                            estado === 'actual' ? 'text-conectia-gold' : estado === 'completado' ? 'text-green-400' : 'text-gray-500'
                          }`}>
                            {paso.titulo}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{paso.descripcion}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Controles del proceso */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1A3540] rounded-2xl border border-gray-700/60 p-4 shadow-xl">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {clienteSeleccionado.paso_actual > PASOS_CREDITO.length
                  ? <span className="font-semibold text-green-400">Operación cerrada</span>
                  : <>Paso {clienteSeleccionado.paso_actual} de {PASOS_CREDITO.length}: <span className="font-semibold text-white">{PASOS_CREDITO[clienteSeleccionado.paso_actual - 1]?.titulo}</span></>}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => actualizarCliente(clienteSeleccionado.id, { paso_actual: clienteSeleccionado.paso_actual - 1 })}
                  disabled={clienteSeleccionado.paso_actual <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-white/15 text-gray-600 dark:text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" /> Paso anterior
                </button>
                <button
                  onClick={() => actualizarCliente(
                    clienteSeleccionado.id,
                    { paso_actual: clienteSeleccionado.paso_actual + 1 },
                    clienteSeleccionado.paso_actual === PASOS_CREDITO.length ? 'Operación cerrada' : 'Paso actualizado',
                  )}
                  disabled={clienteSeleccionado.paso_actual > PASOS_CREDITO.length}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-conectia-gold text-white hover:bg-conectia-gold/80 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  {clienteSeleccionado.paso_actual === PASOS_CREDITO.length ? 'Cerrar operación' : 'Avanzar paso'} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Documentos del Vendedor */}
            <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-purple-500/10 to-transparent">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="h-4 w-4 text-purple-400" />
                  </div>
                  Carpeta Técnica · Documentos del Vendedor
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {clienteSeleccionado.documentos_vendedor.map((doc, i) => (
                    <button
                      key={doc.nombre}
                      type="button"
                      aria-pressed={doc.entregado}
                      title={doc.entregado ? 'Marcar como pendiente' : 'Marcar como entregado'}
                      onClick={() => actualizarCliente(clienteSeleccionado.id, {
                        documentos_vendedor: clienteSeleccionado.documentos_vendedor.map((d, j) => j === i ? { ...d, entregado: !d.entregado } : d),
                      })}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:brightness-125 ${
                        doc.entregado
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      {doc.entregado ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm font-medium ${
                        doc.entregado ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                      }`}>
                        {doc.nombre}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2.5 flex-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                      style={{ width: `${(clienteSeleccionado.documentos_vendedor.filter(d => d.entregado).length / Math.max(clienteSeleccionado.documentos_vendedor.length, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                    {clienteSeleccionado.documentos_vendedor.filter(d => d.entregado).length}/{clienteSeleccionado.documentos_vendedor.length}
                  </span>
                </div>
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
                    onClick={() => actualizarCliente(clienteSeleccionado.id, borrador, 'Cambios guardados')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-conectia-gold text-white hover:bg-conectia-gold/80 transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
              {clientes.map((cliente) => {
                const pasoActualInfo = PASOS_CREDITO.find(p => p.id === cliente.paso_actual)
                const PasoIcono = pasoActualInfo?.icono || Clock
                const docsEntregados = cliente.documentos_vendedor.filter(d => d.entregado).length
                const totalDocs = cliente.documentos_vendedor.length

                return (
                  <div
                    key={cliente.id}
                    className="bg-[#1A3540] rounded-2xl border border-gray-700/60 hover:border-conectia-gold/30 shadow-xl hover:shadow-conectia-gold/5 transition-all duration-300 cursor-pointer group overflow-hidden"
                    onClick={() => abrirDetalle(cliente)}
                  >
                    {/* Mini timeline top bar */}
                    <div className="flex h-1">
                      {PASOS_CREDITO.map((paso) => {
                        const estado = getEstadoPaso(cliente.paso_actual, paso.id)
                        return (
                          <div key={paso.id} className={`flex-1 ${
                            estado === 'completado' ? 'bg-green-500' :
                            estado === 'actual' ? 'bg-conectia-gold' : 'bg-gray-700'
                          }`} />
                        )
                      })}
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Info del cliente */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-bold text-white truncate">{cliente.cliente_nombre}</h3>
                            <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              cliente.paso_actual >= 6
                                ? 'bg-conectia-gold/20 text-conectia-gold border border-conectia-gold/40'
                                : cliente.paso_actual >= 4
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {cliente.paso_actual > PASOS_CREDITO.length ? 'Cerrada' : `Paso ${cliente.paso_actual}/${PASOS_CREDITO.length}`}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 truncate mb-1">
                            <Home className="inline h-3 w-3 mr-1" />
                            {cliente.propiedad}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="text-conectia-gold font-semibold">{cliente.monto_credito}</span>
                            <span>·</span>
                            <span>{cliente.tipo_credito}</span>
                          </div>
                        </div>

                        {/* Paso actual */}
                        <div className="flex items-center gap-3 lg:min-w-[260px]">
                          <div className={`p-2.5 rounded-xl ${pasoActualInfo?.bgColor || 'bg-gray-700'}`}>
                            <PasoIcono className={`h-5 w-5 ${pasoActualInfo?.color || 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${pasoActualInfo?.color || 'text-gray-400'}`}>
                              Paso actual
                            </p>
                            <p className="text-sm font-medium text-white truncate">
                              {pasoActualInfo?.titulo || 'Operación cerrada'}
                            </p>
                          </div>
                        </div>

                        {/* Documentos progress */}
                        <div className="lg:min-w-[120px]">
                          <p className="text-xs text-gray-500 mb-1">Documentos</p>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${(docsEntregados / Math.max(totalDocs, 1)) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-400">{docsEntregados}/{totalDocs}</span>
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
      </div>
    </div>
  )
}
