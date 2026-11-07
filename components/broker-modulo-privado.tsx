'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Calculator, ExternalLink, FileText, FolderLock, Link2, Plus, Trash2 } from 'lucide-react'
import { MAX_ARCHIVO_MB } from '@/lib/broker-archivos'
import { subirArchivoBroker } from '@/lib/broker-archivos-cliente'
import { CATEGORIAS_RECURSO, SIMULADORES_OFICIALES, type CategoriaRecurso, type RecursoBroker } from '@/lib/broker-recursos'
import { fechaHoy } from '@/lib/broker-previa'

const FORM_VACIO = { titulo: '', banco: '', descripcion: '', liga: '', vigente_hasta: '' }
const inputClass = 'w-full rounded-xl bg-[#17313A] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-conectia-gold/50 [color-scheme:dark]'
const TIPOS_ARCHIVO = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png'

export function BrokerModuloPrivado() {
  const [recursos, setRecursos] = useState<RecursoBroker[]>([])
  const [cargando, setCargando] = useState(true)
  const [categoria, setCategoria] = useState<CategoriaRecurso>('formato')
  const [banco, setBanco] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let activo = true
    fetch('/api/broker/recursos')
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        if (activo) setRecursos(data.recursos || [])
      })
      .catch((error: Error) => toast.error(`Error cargando el módulo: ${error.message}`))
      .finally(() => activo && setCargando(false))
    return () => { activo = false }
  }, [])

  const elegirArchivo = (file: File | null) => {
    if (file && file.size > MAX_ARCHIVO_MB * 1024 * 1024) {
      toast.error(`El archivo no debe pesar más de ${MAX_ARCHIVO_MB} MB`)
      return
    }
    setArchivo(file)
  }

  const cerrarForm = () => { setMostrarForm(false); setForm(FORM_VACIO); setArchivo(null) }

  const guardar = async () => {
    if (!form.titulo.trim()) { toast.error('El título es obligatorio'); return }
    if (!archivo && !form.liga.trim()) { toast.error('Adjunta un archivo o una liga'); return }
    setGuardando(true)
    try {
      const archivoPath = archivo ? await subirArchivoBroker('/api/broker/recursos', archivo) : ''
      const res = await fetch('/api/broker/recursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, categoria, archivoPath, archivoNombre: archivo?.name ?? '', archivoTipo: archivo?.type ?? '' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRecursos(prev => [data.recurso, ...prev])
      cerrarForm()
      toast.success('Recurso guardado')
    } catch (error) {
      toast.error(error instanceof Error ? `No se pudo guardar: ${error.message}` : 'No se pudo guardar el recurso')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (recurso: RecursoBroker) => {
    if (!confirm(`¿Eliminar "${recurso.titulo}"? El archivo también se borrará.`)) return
    try {
      const res = await fetch(`/api/broker/recursos?id=${recurso.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setRecursos(prev => prev.filter(r => r.id !== recurso.id))
      toast.success('Recurso eliminado')
    } catch {
      toast.error('No se pudo eliminar el recurso')
    }
  }

  const deCategoria = recursos.filter(r => r.categoria === categoria)
  const bancos = [...new Set(deCategoria.map(r => r.banco).filter(Boolean))].sort()
  const visibles = deCategoria.filter(r => !banco || r.banco === banco)

  return (
    <div className="space-y-6">
      <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-700/60 bg-gradient-to-r from-conectia-gold/10 to-transparent flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 bg-conectia-gold/15 rounded-lg flex items-center justify-center">
                <FolderLock className="h-4 w-4 text-conectia-gold dark:text-[#EAE4DD]" />
              </span>
              Módulo privado
            </h2>
            <p className="text-xs text-gray-400 mt-1">Solo tú ves estos archivos. Cada descarga usa una liga temporal.</p>
          </div>
          <button
            type="button"
            onClick={() => (mostrarForm ? cerrarForm() : setMostrarForm(true))}
            className="flex items-center gap-2 px-4 py-2 bg-conectia-gold dark:bg-white/15 hover:bg-conectia-gold/80 text-white rounded-xl font-semibold text-sm transition-all"
          >
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>

        <div role="tablist" aria-label="Categorías del módulo" className="flex gap-1 overflow-x-auto px-5 pt-4">
          {CATEGORIAS_RECURSO.map(c => {
            const activa = c.id === categoria
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={activa}
                onClick={() => { setCategoria(c.id); setBanco('') }}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${activa ? 'bg-conectia-gold/15 text-conectia-gold dark:text-[#EAE4DD]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {c.titulo} <span className="ml-1 text-xs opacity-70">{recursos.filter(r => r.categoria === c.id).length}</span>
              </button>
            )
          })}
        </div>

        {mostrarForm && (
          <div className="m-5 rounded-xl border border-conectia-gold/30 p-4 space-y-3">
            <h3 className="text-sm font-bold text-white">Nuevo en {CATEGORIAS_RECURSO.find(c => c.id === categoria)!.titulo.toLowerCase()}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs text-gray-400">Título *</span>
                <input value={form.titulo} onChange={e => setForm(prev => ({ ...prev, titulo: e.target.value }))} placeholder="Ej: Solicitud de crédito" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-400">Banco</span>
                <input value={form.banco} onChange={e => setForm(prev => ({ ...prev, banco: e.target.value }))} placeholder="Ej: BBVA" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-400">Archivo (hasta {MAX_ARCHIVO_MB} MB)</span>
                <input type="file" accept={TIPOS_ARCHIVO} onChange={e => elegirArchivo(e.target.files?.[0] ?? null)} className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-xs file:text-current`} />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-400">O liga</span>
                <input type="url" value={form.liga} onChange={e => setForm(prev => ({ ...prev, liga: e.target.value }))} placeholder="https://" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-400">Vigente hasta</span>
                <input type="date" value={form.vigente_hasta} onChange={e => setForm(prev => ({ ...prev, vigente_hasta: e.target.value }))} className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-400">Descripción</span>
                <input value={form.descripcion} onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))} className={inputClass} />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={cerrarForm} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 border border-white/15 hover:bg-white/10 transition-all">Cancelar</button>
              <button type="button" onClick={guardar} disabled={guardando} className="px-5 py-2 rounded-xl text-sm font-semibold bg-conectia-gold dark:bg-white/15 text-white hover:bg-conectia-gold/80 disabled:opacity-50 transition-all">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}

        <div className="p-5 space-y-3">
          {bancos.length > 0 && (
            <select
              value={banco}
              aria-label="Filtrar por banco"
              onChange={e => setBanco(e.target.value)}
              className={`${inputClass} sm:w-56 cursor-pointer`}
            >
              <option value="">Todos los bancos</option>
              {bancos.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
          {cargando ? (
            <p className="py-8 text-center text-sm text-gray-400">Cargando...</p>
          ) : visibles.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Todavía no hay nada aquí. Usa el botón Agregar.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibles.map(recurso => {
                const url = recurso.archivo_url || recurso.liga
                const vencido = Boolean(recurso.vigente_hasta) && recurso.vigente_hasta! < fechaHoy()
                return (
                  <li key={recurso.id} className="flex items-start gap-3 rounded-xl border border-gray-700/60 p-3">
                    <span className="mt-0.5 w-9 h-9 shrink-0 rounded-lg bg-white/5 flex items-center justify-center">
                      {recurso.archivo_url ? <FileText className="h-4 w-4 text-conectia-gold dark:text-[#EAE4DD]" /> : <Link2 className="h-4 w-4 text-conectia-gold dark:text-[#EAE4DD]" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-semibold text-[#17313A] dark:text-white hover:text-conectia-gold">{recurso.titulo}</a>
                      <p className="truncate text-xs text-gray-400">{[recurso.banco, recurso.descripcion].filter(Boolean).join(' · ') || recurso.archivo_nombre}</p>
                      {recurso.vigente_hasta && (
                        <p className={`text-[11px] font-semibold ${vencido ? 'text-red-400' : 'text-gray-500'}`}>
                          {vencido ? 'Vencido' : 'Vigente hasta'} {recurso.vigente_hasta}
                        </p>
                      )}
                    </div>
                    <button type="button" onClick={() => eliminar(recurso)} aria-label={`Eliminar ${recurso.titulo}`} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 p-5 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <span className="w-8 h-8 bg-conectia-gold/15 rounded-lg flex items-center justify-center">
            <Calculator className="h-4 w-4 text-conectia-gold dark:text-[#EAE4DD]" />
          </span>
          Simuladores oficiales
        </h2>
        <p className="text-xs text-gray-400 mb-4">Se abren en el sitio de cada institución, con sus condiciones vigentes.</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SIMULADORES_OFICIALES.map(simulador => (
            <li key={simulador.nombre}>
              <a href={simulador.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-gray-700/60 p-3 hover:border-conectia-gold/40 transition-colors">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">{simulador.nombre}</span>
                  <span className="block truncate text-xs text-gray-400">{simulador.detalle}</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-gray-500" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
