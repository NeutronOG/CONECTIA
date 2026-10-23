'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, CalendarClock, Check, Landmark, PenTool, Plus, Trash2, Users, Wallet } from 'lucide-react'
import { ESTATUS_BANCARIO, ETAPAS_BANCARIO, etapasBancario, moverEtapa, type ChecklistEstado, type Etapa, type EstatusBancario } from '@/lib/broker-checklist'

// Pipeline bancario de Ara Brokers: mismas columnas que la hoja de Excel.
interface ClientePipeline {
  id: number
  cliente_nombre: string
  banco: string
  monto_credito: string
  avaluo: string
  notaria: string
  vencimiento: string | null
  fecha_firma: string | null
  estatus: EstatusBancario
  checklist: ChecklistEstado | null
}

type Campo = Exclude<keyof ClientePipeline, 'id' | 'estatus' | 'checklist'>

const COLUMNAS: { campo: Campo; titulo: string; placeholder: string; fecha?: boolean }[] = [
  { campo: 'cliente_nombre', titulo: 'Cliente', placeholder: 'Nombre del cliente' },
  { campo: 'banco', titulo: 'Banco', placeholder: 'Ej: BBVA' },
  { campo: 'monto_credito', titulo: 'Monto aprobado', placeholder: '$0' },
  { campo: 'avaluo', titulo: 'Avalúo', placeholder: 'Ej: $2,800,000' },
  { campo: 'notaria', titulo: 'Notaría', placeholder: 'Ej: Notaría 15' },
  { campo: 'vencimiento', titulo: 'Vencimiento', placeholder: '', fecha: true },
  { campo: 'fecha_firma', titulo: 'Fecha firma', placeholder: '', fecha: true },
]

const FILA_VACIA: Record<Campo, string> = {
  cliente_nombre: '', banco: '', monto_credito: '', avaluo: '', notaria: '', vencimiento: '', fecha_firma: '',
}

const DIA = 86_400_000
const hoy = () => {
  const d = new Date()
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
}
const diasPara = (fecha: string) => Math.round((Date.parse(`${fecha}T00:00:00Z`) - hoy()) / DIA)
const monto = (texto: string) => Number(texto.replace(/[^\d.]/g, '')) || 0
const fechaHoy = () => new Date().toLocaleDateString('en-CA')
const pesos = (valor: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(valor)

const celdaClass = 'w-full min-w-0 rounded-lg bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-gray-500 border border-transparent hover:border-white/10 focus:border-conectia-gold/60 focus:bg-white/5 focus:outline-none [color-scheme:dark]'

export function BrokerPipelineBancario({ email }: { email: string }) {
  const [clientes, setClientes] = useState<ClientePipeline[]>([])
  const [cargando, setCargando] = useState(true)
  const [nuevo, setNuevo] = useState(FILA_VACIA)
  const [guardando, setGuardando] = useState(false)
  const [bandeja, setBandeja] = useState<EstatusBancario>('pipeline')

  const mes = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  useEffect(() => {
    let activo = true
    fetch(`/api/broker/clientes?email=${encodeURIComponent(email)}`)
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        if (activo) setClientes(data.clientes || [])
      })
      .catch((error: Error) => toast.error(`Error cargando el pipeline: ${error.message}`))
      .finally(() => activo && setCargando(false))
    return () => { activo = false }
  }, [email])

  const actualizar = async (cliente: ClientePipeline, cambios: Partial<ClientePipeline>, exito?: string) => {
    setClientes(prev => prev.map(c => c.id === cliente.id ? { ...c, ...cambios } : c))
    try {
      const res = await fetch('/api/broker/clientes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, id: cliente.id, ...cambios }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setClientes(prev => prev.map(c => c.id === cliente.id ? data.cliente : c))
      if (exito) toast.success(exito)
    } catch (error) {
      setClientes(prev => prev.map(c => c.id === cliente.id ? cliente : c))
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el cambio')
    }
  }

  const guardarCelda = (cliente: ClientePipeline, campo: Campo, valor: string) => {
    if ((cliente[campo] ?? '') === valor) return
    if (campo === 'cliente_nombre' && !valor.trim()) { toast.error('El nombre del cliente es obligatorio'); return }
    actualizar(cliente, { [campo]: valor })
  }

  const cambiarEstatus = (cliente: ClientePipeline, estatus: EstatusBancario) => {
    const destino = ESTATUS_BANCARIO.find(e => e.id === estatus)!
    actualizar(cliente, { estatus }, `${cliente.cliente_nombre} pasó a ${destino.titulo}`)
  }

  const moverEtapaCliente = (cliente: ClientePipeline, etapa: Etapa) => {
    const regresar = etapa.estado === 'completado'
    if (regresar && !confirm(`¿Regresar a la etapa "${etapa.titulo}"? Se desmarcarán esta etapa y las siguientes.`)) return
    actualizar(
      cliente,
      { checklist: moverEtapa(cliente.checklist || {}, etapa.id, fechaHoy(), ETAPAS_BANCARIO) },
      regresar ? 'Etapa actualizada' : `${etapa.titulo} completada`,
    )
  }

  const agregarCliente = async () => {
    if (!nuevo.cliente_nombre.trim()) { toast.error('El nombre del cliente es obligatorio'); return }
    setGuardando(true)
    try {
      const res = await fetch('/api/broker/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...nuevo, estatus: bandeja }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setClientes(prev => [...prev, data.cliente])
      setNuevo(FILA_VACIA)
      toast.success('Cliente agregado al pipeline')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo agregar el cliente')
    } finally {
      setGuardando(false)
    }
  }

  const eliminarCliente = async (cliente: ClientePipeline) => {
    if (!confirm(`¿Eliminar a ${cliente.cliente_nombre} del pipeline?`)) return
    try {
      const res = await fetch(`/api/broker/clientes?id=${cliente.id}&email=${encodeURIComponent(email)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setClientes(prev => prev.filter(c => c.id !== cliente.id))
      toast.success('Cliente eliminado')
    } catch {
      toast.error('No se pudo eliminar el cliente')
    }
  }

  const todos = [...clientes].sort((a, b) => a.id - b.id)
  const filas = todos.filter(c => (c.estatus ?? 'pipeline') === bandeja)
  const enPipeline = todos.filter(c => (c.estatus ?? 'pipeline') === 'pipeline')
  const totalAprobado = enPipeline.reduce((suma, c) => suma + monto(c.monto_credito || ''), 0)
  const conFirma = enPipeline.filter(c => c.fecha_firma).length
  const porVencer = todos.filter(c => c.vencimiento && diasPara(c.vencimiento) <= 15).length
  const conEtapas = bandeja === 'pipeline'
  const totalColumnas = COLUMNAS.length + (conEtapas ? 3 : 2)

  const STATS = [
    { label: 'Clientes en pipeline', value: enPipeline.length, icon: Users, tone: 'text-blue-400 bg-blue-500/15' },
    { label: 'Monto aprobado total', value: pesos(totalAprobado), icon: Wallet, tone: 'text-green-400 bg-green-500/15' },
    { label: 'Firmas programadas', value: conFirma, icon: PenTool, tone: 'text-conectia-gold bg-conectia-gold/15' },
    { label: 'Vencen en 15 días o vencidos', value: porVencer, icon: AlertTriangle, tone: 'text-orange-400 bg-orange-500/15' },
  ]

  const avisoVencimiento = (fecha: string | null) => {
    if (!fecha) return null
    const dias = diasPara(fecha)
    if (dias < 0) return <span className="block px-2 text-[11px] font-semibold text-red-400">Vencido</span>
    if (dias <= 15) return <span className="block px-2 text-[11px] font-semibold text-orange-400">{dias === 0 ? 'Vence hoy' : `Vence en ${dias} día${dias === 1 ? '' : 's'}`}</span>
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className="bg-[#1A3540] rounded-2xl p-5 border border-gray-700/60">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${stat.tone}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mb-1 break-words">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-conectia-gold/10 to-transparent flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-conectia-gold/15 rounded-lg flex items-center justify-center">
              <Landmark className="h-4 w-4 text-conectia-gold" />
            </span>
            Pipeline Ara Brokers · <span className="capitalize">{mes}</span>
          </h2>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" /> Edita cualquier celda; se guarda al salir del campo.
          </p>
        </div>

        <div role="tablist" aria-label="Bandejas del pipeline" className="flex gap-1 overflow-x-auto px-5 pt-4">
          {ESTATUS_BANCARIO.map(estatus => {
            const activa = estatus.id === bandeja
            const total = todos.filter(c => (c.estatus ?? 'pipeline') === estatus.id).length
            return (
              <button
                key={estatus.id}
                type="button"
                role="tab"
                aria-selected={activa}
                onClick={() => setBandeja(estatus.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${activa ? 'bg-conectia-gold/15 text-conectia-gold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {estatus.titulo} <span className="ml-1 text-xs opacity-70">{total}</span>
              </button>
            )
          })}
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full text-left ${conEtapas ? 'min-w-[1320px]' : 'min-w-[1080px]'}`}>
            <thead>
              <tr className="border-b border-gray-700/60 text-[11px] uppercase tracking-wider text-gray-400">
                {COLUMNAS.map(col => <th key={col.campo} scope="col" className="px-3 py-3 font-semibold">{col.titulo}</th>)}
                {conEtapas && <th scope="col" className="px-3 py-3 font-semibold">Etapa</th>}
                <th scope="col" className="px-3 py-3 font-semibold">Estatus</th>
                <th scope="col" className="w-12 px-3 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={totalColumnas} className="px-3 py-10 text-center text-sm text-gray-400">Cargando pipeline...</td></tr>
              ) : filas.length === 0 ? (
                <tr><td colSpan={totalColumnas} className="px-3 py-10 text-center text-sm text-gray-400">No hay clientes en esta bandeja. Agrega uno en la fila de abajo.</td></tr>
              ) : filas.map(cliente => (
                <tr key={cliente.id} className="border-b border-gray-700/40 hover:bg-white/[0.02]">
                  {COLUMNAS.map(col => (
                    <td key={col.campo} className="px-1.5 py-1 align-top">
                      <input
                        key={`${cliente.id}-${col.campo}-${cliente[col.campo] ?? ''}`}
                        type={col.fecha ? 'date' : 'text'}
                        defaultValue={cliente[col.campo] ?? ''}
                        placeholder={col.placeholder}
                        aria-label={`${col.titulo} de ${cliente.cliente_nombre}`}
                        onBlur={(e) => guardarCelda(cliente, col.campo, e.target.value.trim())}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                        className={`${celdaClass} ${col.campo === 'cliente_nombre' ? 'font-semibold' : ''} ${col.campo === 'monto_credito' ? 'text-conectia-gold font-semibold' : ''}`}
                      />
                      {col.campo === 'vencimiento' && avisoVencimiento(cliente.vencimiento)}
                    </td>
                  ))}
                  {conEtapas && (
                    <td className="px-1.5 py-1.5 align-top">
                      <EtapasCliente etapas={etapasBancario(cliente.checklist)} onMover={(etapa) => moverEtapaCliente(cliente, etapa)} />
                    </td>
                  )}
                  <td className="px-1.5 py-1 align-top">
                    <select
                      value={cliente.estatus ?? 'pipeline'}
                      aria-label={`Estatus de ${cliente.cliente_nombre}`}
                      onChange={(e) => cambiarEstatus(cliente, e.target.value as EstatusBancario)}
                      className={`${celdaClass} cursor-pointer [&>option]:bg-[#1A3540]`}
                    >
                      {ESTATUS_BANCARIO.map(e => <option key={e.id} value={e.id}>{e.titulo}</option>)}
                    </select>
                  </td>
                  <td className="px-1.5 py-1 align-top">
                    <button
                      type="button"
                      onClick={() => eliminarCliente(cliente)}
                      aria-label={`Eliminar a ${cliente.cliente_nombre}`}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-conectia-gold/5">
                {COLUMNAS.map(col => (
                  <td key={col.campo} className="px-1.5 py-2">
                    <input
                      type={col.fecha ? 'date' : 'text'}
                      value={nuevo[col.campo]}
                      placeholder={col.fecha ? '' : col.placeholder}
                      aria-label={`${col.titulo} del nuevo cliente`}
                      onChange={(e) => setNuevo(prev => ({ ...prev, [col.campo]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') agregarCliente() }}
                      className={`${celdaClass} border-white/10`}
                    />
                  </td>
                ))}
                {conEtapas && <td />}
                <td />
                <td className="px-1.5 py-2">
                  <button
                    type="button"
                    onClick={agregarCliente}
                    disabled={guardando}
                    aria-label="Agregar cliente al pipeline"
                    className="p-2 rounded-lg bg-conectia-gold text-white hover:bg-conectia-gold/80 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

// Autorización → Avalúo → Notaría → Programación de firma. Tocar una etapa la completa
// (y las anteriores); tocar una completada regresa a ella.
function EtapasCliente({ etapas, onMover }: { etapas: Etapa[]; onMover: (etapa: Etapa) => void }) {
  return (
    <ol className="flex gap-1">
      {etapas.map(etapa => (
        <li key={etapa.id}>
          <button
            type="button"
            onClick={() => onMover(etapa)}
            aria-pressed={etapa.estado === 'completado'}
            title={etapa.fecha ? `${etapa.titulo} · ${etapa.fecha}` : etapa.descripcion}
            className={`flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-[11px] font-semibold transition-colors ${
              etapa.estado === 'completado'
                ? 'border-green-500/30 bg-green-500/15 text-green-400'
                : etapa.estado === 'actual'
                  ? 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10'
                  : 'border-gray-700 text-gray-500 hover:text-gray-300'
            }`}
          >
            {etapa.estado === 'completado' && <Check className="h-3 w-3" />}
            {etapa.titulo}
          </button>
        </li>
      ))}
    </ol>
  )
}
