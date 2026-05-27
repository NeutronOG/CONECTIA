'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

// Tipos para el proceso de crédito hipotecario
interface DocumentoVendedor {
  nombre: string
  entregado: boolean
  archivo?: string
}

interface CreditoHipotecario {
  id: string
  clienteNombre: string
  clienteEmail: string
  clienteTelefono: string
  propiedad: string
  montoCredito: string
  tipoCredito: string
  pasoActual: number
  fechaInicio: string
  fechaUltimaActualizacion: string
  notas: string
  documentosVendedor: DocumentoVendedor[]
  notaria?: string
  fechaFirma?: string
}

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

// Datos mock de clientes en proceso
const MOCK_CLIENTES: CreditoHipotecario[] = [
  {
    id: 'cred-1',
    clienteNombre: 'Juan Pérez Rodríguez',
    clienteEmail: 'juan.perez@email.com',
    clienteTelefono: '+52 477 111 2233',
    propiedad: 'Residencia en La Valenciana Residencial',
    montoCredito: '$3,500,000',
    tipoCredito: 'INFONAVIT + Crédito Bancario',
    pasoActual: 4,
    fechaInicio: '2026-01-15',
    fechaUltimaActualizacion: '2026-02-04',
    notas: 'Avalúo programado para el 10 de febrero',
    documentosVendedor: [
      { nombre: 'Escrituras', entregado: true },
      { nombre: 'Predial', entregado: true },
      { nombre: 'Recibo de Agua', entregado: true },
      { nombre: 'Planos', entregado: true },
      { nombre: 'N° Cuenta Vendedor', entregado: true },
      { nombre: 'Generales Vendedor', entregado: true }
    ]
  },
  {
    id: 'cred-2',
    clienteNombre: 'María González López',
    clienteEmail: 'maria.gonzalez@email.com',
    clienteTelefono: '+52 477 222 3344',
    propiedad: 'Casa en Villas La Valenciana',
    montoCredito: '$2,800,000',
    tipoCredito: 'Crédito Bancario',
    pasoActual: 2,
    fechaInicio: '2026-01-28',
    fechaUltimaActualizacion: '2026-02-05',
    notas: 'Pendiente recibo de agua y planos del vendedor',
    documentosVendedor: [
      { nombre: 'Escrituras', entregado: true },
      { nombre: 'Predial', entregado: true },
      { nombre: 'Recibo de Agua', entregado: false },
      { nombre: 'Planos', entregado: false },
      { nombre: 'N° Cuenta Vendedor', entregado: true },
      { nombre: 'Generales Vendedor', entregado: false }
    ]
  },
  {
    id: 'cred-3',
    clienteNombre: 'Roberto Sánchez Martínez',
    clienteEmail: 'roberto.sanchez@email.com',
    clienteTelefono: '+52 477 333 4455',
    propiedad: 'Departamento en Zona Centro',
    montoCredito: '$1,950,000',
    tipoCredito: 'FOVISSSTE',
    pasoActual: 6,
    fechaInicio: '2025-12-10',
    fechaUltimaActualizacion: '2026-02-06',
    notas: 'Firma programada para el 12 de febrero en Notaría 15',
    documentosVendedor: [
      { nombre: 'Escrituras', entregado: true },
      { nombre: 'Predial', entregado: true },
      { nombre: 'Recibo de Agua', entregado: true },
      { nombre: 'Planos', entregado: true },
      { nombre: 'N° Cuenta Vendedor', entregado: true },
      { nombre: 'Generales Vendedor', entregado: true }
    ],
    notaria: 'Notaría 15 - Lic. Fernando Ramírez',
    fechaFirma: '2026-02-12'
  },
  {
    id: 'cred-4',
    clienteNombre: 'Ana Lucía Torres',
    clienteEmail: 'ana.torres@email.com',
    clienteTelefono: '+52 477 444 5566',
    propiedad: 'Casa en Fraccionamiento El Refugio',
    montoCredito: '$4,200,000',
    tipoCredito: 'Crédito Bancario HSBC',
    pasoActual: 1,
    fechaInicio: '2026-02-03',
    fechaUltimaActualizacion: '2026-02-05',
    notas: 'Expediente en proceso de integración, faltan estados de cuenta',
    documentosVendedor: [
      { nombre: 'Escrituras', entregado: false },
      { nombre: 'Predial', entregado: false },
      { nombre: 'Recibo de Agua', entregado: false },
      { nombre: 'Planos', entregado: false },
      { nombre: 'N° Cuenta Vendedor', entregado: false },
      { nombre: 'Generales Vendedor', entregado: false }
    ]
  },
  {
    id: 'cred-5',
    clienteNombre: 'Carlos Mendoza Ruiz',
    clienteEmail: 'carlos.mendoza@email.com',
    clienteTelefono: '+52 477 555 6677',
    propiedad: 'Terreno en Gran Jardín',
    montoCredito: '$5,100,000',
    tipoCredito: 'INFONAVIT Total',
    pasoActual: 5,
    fechaInicio: '2025-12-20',
    fechaUltimaActualizacion: '2026-02-06',
    notas: 'Asignado a Notaría 8, pendiente programar firma',
    documentosVendedor: [
      { nombre: 'Escrituras', entregado: true },
      { nombre: 'Predial', entregado: true },
      { nombre: 'Recibo de Agua', entregado: true },
      { nombre: 'Planos', entregado: true },
      { nombre: 'N° Cuenta Vendedor', entregado: true },
      { nombre: 'Generales Vendedor', entregado: true }
    ],
    notaria: 'Notaría 8 - Lic. Patricia Vega'
  }
]

export default function PanelBrokerPage() {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [clientes, setClientes] = useState<CreditoHipotecario[]>(MOCK_CLIENTES)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<CreditoHipotecario | null>(null)
  const [vistaDetalle, setVistaDetalle] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || user?.role !== 'broker') {
      router.push('/login')
      return
    }
  }, [user, isAuthenticated, loading, router])

  if (loading || !user) return null

  // Estadísticas
  const totalClientes = clientes.length
  const enProceso = clientes.filter(c => c.pasoActual < 6).length
  const porFirmar = clientes.filter(c => c.pasoActual === 6).length
  const completados = clientes.filter(c => c.pasoActual > 6).length

  const getEstadoPaso = (pasoActual: number, pasoId: number) => {
    if (pasoId < pasoActual) return 'completado'
    if (pasoId === pasoActual) return 'actual'
    return 'pendiente'
  }

  return (
    <div className="min-h-screen bg-[#17313A] text-[#EAE4DD]">
      {/* Header */}
      <div className="bg-conectia-secondary/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-conectia-graphite">Panel de Broker</h1>
              <p className="text-sm text-gray-500">{user.nombre} · Crédito Hipotecario</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setVistaDetalle(false); setClienteSeleccionado(null) }}
                className={!vistaDetalle ? 'bg-conectia-gold/20 border-conectia-gold text-conectia-gold' : ''}
              >
                <Users className="h-4 w-4 mr-2" />
                Mis Clientes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => { await logout(); router.replace('/login') }}
                className="text-gray-500 hover:text-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-conectia-secondary/60 backdrop-blur-xl border-white/40 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Clientes</p>
                  <p className="text-3xl font-bold text-conectia-graphite">{totalClientes}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Users className="h-7 w-7 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-conectia-secondary/60 backdrop-blur-xl border-white/40 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">En Proceso</p>
                  <p className="text-3xl font-bold text-orange-500">{enProceso}</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Clock className="h-7 w-7 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-conectia-secondary/60 backdrop-blur-xl border-white/40 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Por Firmar</p>
                  <p className="text-3xl font-bold text-conectia-gold">{porFirmar}</p>
                </div>
                <div className="p-3 bg-conectia-gold/10 rounded-xl">
                  <PenTool className="h-7 w-7 text-conectia-gold" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-conectia-secondary/60 backdrop-blur-xl border-white/40 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completados</p>
                  <p className="text-3xl font-bold text-green-500">{completados}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <CheckCircle2 className="h-7 w-7 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vista detalle de cliente o lista */}
        {vistaDetalle && clienteSeleccionado ? (
          <div className="space-y-6">
            {/* Botón volver */}
            <Button
              variant="ghost"
              onClick={() => { setVistaDetalle(false); setClienteSeleccionado(null) }}
              className="mb-2"
            >
              ← Volver a mis clientes
            </Button>

            {/* Info del cliente */}
            <Card className="bg-conectia-secondary/60 backdrop-blur-xl border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-conectia-graphite">{clienteSeleccionado.clienteNombre}</h2>
                    <p className="text-gray-500">{clienteSeleccionado.clienteEmail} · {clienteSeleccionado.clienteTelefono}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm"><strong>Propiedad:</strong> {clienteSeleccionado.propiedad}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm"><strong>Monto:</strong> {clienteSeleccionado.montoCredito}</span>
                      <span className="text-sm"><strong>Tipo:</strong> {clienteSeleccionado.tipoCredito}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Inicio del proceso</p>
                    <p className="text-sm font-semibold">{new Date(clienteSeleccionado.fechaInicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Línea de Tiempo - Crédito Hipotecario */}
            <Card className="bg-conectia-secondary/60 backdrop-blur-xl border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-conectia-gold" />
                  Línea de Tiempo · Crédito Hipotecario
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Timeline horizontal en desktop, vertical en mobile */}
                <div className="hidden lg:block">
                  {/* Línea horizontal */}
                  <div className="relative">
                    <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full" />
                    <div
                      className="absolute top-6 left-0 h-1 bg-conectia-gold rounded-full transition-all duration-500"
                      style={{ width: `${((clienteSeleccionado.pasoActual - 1) / (PASOS_CREDITO.length - 1)) * 100}%` }}
                    />
                    <div className="relative flex justify-between">
                      {PASOS_CREDITO.map((paso) => {
                        const estado = getEstadoPaso(clienteSeleccionado.pasoActual, paso.id)
                        const Icono = paso.icono
                        return (
                          <div key={paso.id} className="flex flex-col items-center w-40">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                                estado === 'completado'
                                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                  : estado === 'actual'
                                  ? 'bg-conectia-gold text-white shadow-lg shadow-conectia-gold/30 ring-4 ring-conectia-gold/20'
                                  : 'bg-gray-200 text-gray-400'
                              }`}
                            >
                              {estado === 'completado' ? (
                                <CheckCircle2 className="h-6 w-6" />
                              ) : (
                                <Icono className="h-5 w-5" />
                              )}
                            </div>
                            <p className={`text-xs font-semibold mt-3 text-center leading-tight ${
                              estado === 'actual' ? 'text-conectia-gold' : estado === 'completado' ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {paso.titulo}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 text-center leading-tight max-w-[140px]">
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
                    const estado = getEstadoPaso(clienteSeleccionado.pasoActual, paso.id)
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
                                : 'bg-gray-200 text-gray-400'
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
                              estado === 'completado' ? 'bg-green-500' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                        <div className="pb-8">
                          <p className={`text-sm font-semibold ${
                            estado === 'actual' ? 'text-conectia-gold' : estado === 'completado' ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {paso.titulo}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{paso.descripcion}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Documentos del Vendedor */}
            <Card className="bg-conectia-secondary/60 backdrop-blur-xl border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-purple-500" />
                  Carpeta Técnica · Documentos del Vendedor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {clienteSeleccionado.documentosVendedor.map((doc, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        doc.entregado
                          ? 'bg-green-500/5 border-green-500/30'
                          : 'bg-red-500/5 border-red-500/30'
                      }`}
                    >
                      {doc.entregado ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      <span className={`text-sm font-medium ${doc.entregado ? 'text-green-700' : 'text-red-700'}`}>
                        {doc.nombre}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(clienteSeleccionado.documentosVendedor.filter(d => d.entregado).length / clienteSeleccionado.documentosVendedor.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    {clienteSeleccionado.documentosVendedor.filter(d => d.entregado).length}/{clienteSeleccionado.documentosVendedor.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Notas y detalles adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clienteSeleccionado.notaria && (
                <Card className="bg-conectia-secondary/60 backdrop-blur-xl border-white/40 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Landmark className="h-5 w-5 text-indigo-500" />
                      <h3 className="font-bold text-conectia-graphite">Notaría Asignada</h3>
                    </div>
                    <p className="text-sm text-gray-600">{clienteSeleccionado.notaria}</p>
                    {clienteSeleccionado.fechaFirma && (
                      <div className="mt-3 p-3 bg-conectia-gold/10 rounded-xl border border-conectia-gold/30">
                        <p className="text-xs text-conectia-gold font-semibold">Fecha de Firma</p>
                        <p className="text-sm font-bold text-conectia-graphite">
                          {new Date(clienteSeleccionado.fechaFirma).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-conectia-secondary/60 backdrop-blur-xl border-white/40 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h3 className="font-bold text-conectia-graphite">Notas</h3>
                  </div>
                  <p className="text-sm text-gray-600">{clienteSeleccionado.notas}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    Última actualización: {new Date(clienteSeleccionado.fechaUltimaActualizacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Lista de clientes */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-conectia-graphite">Mis Clientes en Proceso</h2>
              <Button className="bg-conectia-gold hover:bg-conectia-gold/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </div>

            <div className="space-y-4">
              {clientes.map((cliente) => {
                const pasoActualInfo = PASOS_CREDITO.find(p => p.id === cliente.pasoActual)
                const PasoIcono = pasoActualInfo?.icono || Clock
                const docsEntregados = cliente.documentosVendedor.filter(d => d.entregado).length
                const totalDocs = cliente.documentosVendedor.length

                return (
                  <Card
                    key={cliente.id}
                    className="bg-conectia-secondary/60 backdrop-blur-xl border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => { setClienteSeleccionado(cliente); setVistaDetalle(true) }}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Info del cliente */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-conectia-graphite truncate">{cliente.clienteNombre}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              cliente.pasoActual >= 6
                                ? 'bg-conectia-gold/20 text-conectia-gold border border-conectia-gold/50'
                                : cliente.pasoActual >= 4
                                ? 'bg-green-500/20 text-green-700 border border-green-500/50'
                                : 'bg-blue-500/20 text-blue-700 border border-blue-500/50'
                            }`}>
                              Paso {cliente.pasoActual}/6
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            <Home className="inline h-3.5 w-3.5 mr-1" />
                            {cliente.propiedad}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                            <span>{cliente.montoCredito}</span>
                            <span>·</span>
                            <span>{cliente.tipoCredito}</span>
                          </div>
                        </div>

                        {/* Paso actual */}
                        <div className="flex items-center gap-3 lg:min-w-[280px]">
                          <div className={`p-2.5 rounded-xl ${pasoActualInfo?.bgColor || 'bg-gray-100'}`}>
                            <PasoIcono className={`h-5 w-5 ${pasoActualInfo?.color || 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${pasoActualInfo?.color || 'text-gray-400'}`}>
                              Paso actual
                            </p>
                            <p className="text-sm font-medium text-conectia-graphite truncate">
                              {pasoActualInfo?.titulo}
                            </p>
                          </div>
                        </div>

                        {/* Documentos progress */}
                        <div className="lg:min-w-[120px]">
                          <p className="text-xs text-gray-400 mb-1">Documentos</p>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${(docsEntregados / totalDocs) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-500">{docsEntregados}/{totalDocs}</span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-conectia-gold transition-colors hidden lg:block" />
                      </div>

                      {/* Mini timeline */}
                      <div className="mt-4 flex items-center gap-1">
                        {PASOS_CREDITO.map((paso) => {
                          const estado = getEstadoPaso(cliente.pasoActual, paso.id)
                          return (
                            <div key={paso.id} className="flex items-center flex-1">
                              <div
                                className={`h-1.5 flex-1 rounded-full ${
                                  estado === 'completado'
                                    ? 'bg-green-500'
                                    : estado === 'actual'
                                    ? 'bg-conectia-gold'
                                    : 'bg-gray-200'
                                }`}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
