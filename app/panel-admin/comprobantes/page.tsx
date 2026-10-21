'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client'
import { isSuperUser } from '@/lib/super-users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, Receipt, Upload, FileText, Image as ImageIcon, ExternalLink, Loader2, Search, X } from 'lucide-react'

interface Comprobante {
  id: number
  concepto: string
  tipo: TipoComprobante
  monto: number | null
  fecha: string
  notas: string
  archivo_nombre: string
  archivo_tipo: string
  archivo_url: string | null
  subido_por_email: string
  subido_por_nombre: string
  created_at: string
}

type TipoComprobante = 'ingreso' | 'egreso' | 'comision' | 'transferencia' | 'otro'

const TIPOS: { value: TipoComprobante; label: string; color: string }[] = [
  { value: 'ingreso', label: 'Ingreso', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  { value: 'egreso', label: 'Egreso', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
  { value: 'comision', label: 'Comisión', color: 'bg-[var(--conectia-arcilla)]/15 text-[var(--conectia-arcilla)] border-[var(--conectia-arcilla)]/30' },
  { value: 'transferencia', label: 'Transferencia', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { value: 'otro', label: 'Otro', color: 'bg-white/10 text-[#B0ACA6] border-white/15' },
]

const MAX_FILE_MB = 20
const today = () => new Date().toISOString().split('T')[0]
const emptyForm = () => ({ concepto: '', tipo: 'ingreso' as TipoComprobante, monto: '', fecha: today(), notas: '' })
const formatMoney = (value: number) => `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

export default function ComprobantesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoComprobante>('todos')

  const email = user?.email?.toLowerCase() || ''
  const backHref = user?.role === 'admin' ? '/panel-admin' : '/panel-asesor'

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || !isSuperUser(user)) {
      router.push('/login')
      return
    }
    loadComprobantes()
  }, [user, isAuthenticated, authLoading, router])

  const loadComprobantes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/comprobantes?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setComprobantes(data.comprobantes || [])
    } catch (error: any) {
      toast.error(error?.message ? `Error cargando comprobantes: ${error.message}` : 'Error cargando comprobantes')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm(emptyForm())
    setArchivo(null)
    setShowForm(false)
  }

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Sube una imagen o un PDF')
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`El archivo no debe pesar más de ${MAX_FILE_MB} MB`)
      return
    }
    setArchivo(file)
  }

  const handleSubmit = async () => {
    if (!form.concepto.trim()) { toast.error('El concepto es obligatorio'); return }
    if (!archivo) { toast.error('Adjunta el comprobante'); return }
    setSaving(true)
    try {
      // 1. Pedir URL firmada y subir el archivo directo al bucket privado
      const urlRes = await fetch('/api/comprobantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upload-url', email, fileName: archivo.name }),
      })
      const urlData = await urlRes.json()
      if (!urlRes.ok) throw new Error(urlData.error)

      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .uploadToSignedUrl(urlData.path, urlData.token, archivo, { contentType: archivo.type })
      if (uploadError) throw new Error(uploadError.message)

      // 2. Registrar el comprobante
      const res = await fetch('/api/comprobantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nombre: user?.nombre || email,
          ...form,
          archivoPath: urlData.path,
          archivoNombre: archivo.name,
          archivoTipo: archivo.type,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success('Comprobante guardado')
      resetForm()
      loadComprobantes()
    } catch (error: any) {
      toast.error(error?.message ? `No se pudo guardar: ${error.message}` : 'No se pudo guardar el comprobante')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (comprobante: Comprobante) => {
    if (!confirm(`¿Eliminar el comprobante "${comprobante.concepto}"? El archivo también se borrará.`)) return
    try {
      const res = await fetch(`/api/comprobantes?id=${comprobante.id}&email=${encodeURIComponent(email)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setComprobantes(prev => prev.filter(c => c.id !== comprobante.id))
      toast.success('Comprobante eliminado')
    } catch {
      toast.error('Error eliminando el comprobante')
    }
  }

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return comprobantes.filter(c =>
      (filtroTipo === 'todos' || c.tipo === filtroTipo) &&
      (!q || [c.concepto, c.notas, c.subido_por_nombre, c.archivo_nombre].some(v => v?.toLowerCase().includes(q)))
    )
  }, [comprobantes, busqueda, filtroTipo])

  const totalPorTipo = (tipo: TipoComprobante) =>
    comprobantes.filter(c => c.tipo === tipo).reduce((sum, c) => sum + (Number(c.monto) || 0), 0)

  if (!user) return null

  const inputClass = 'bg-[#0F2027] border-white/10 text-white placeholder:text-[#4A4F57]'

  return (
    <div className="min-h-screen bg-[#0F2027] text-[#EAE4DD] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[var(--conectia-arcilla)]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#17313A]/60 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(backHref)}
            className="flex items-center gap-2 text-[#B0ACA6] hover:text-white text-sm font-medium mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Panel
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--conectia-arcilla)]/10 flex items-center justify-center border border-[var(--conectia-arcilla)]/20">
                  <Receipt className="w-5 h-5 text-[var(--conectia-arcilla)]" />
                </div>
                Comprobantes
              </h1>
              <p className="text-sm text-[#B0ACA6] mt-1">Movimientos internos · Solo administración y Lizzie</p>
            </div>
            <Button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#0F2027] font-bold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Subir Comprobante
            </Button>
          </div>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Comprobantes', value: String(comprobantes.length), accent: 'var(--conectia-arcilla)' },
            { label: 'Ingresos', value: formatMoney(totalPorTipo('ingreso')), accent: '#22c55e' },
            { label: 'Egresos', value: formatMoney(totalPorTipo('egreso')), accent: '#ef4444' },
            { label: 'Comisiones', value: formatMoney(totalPorTipo('comision')), accent: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[20px] p-5 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none opacity-30" style={{ background: `${stat.accent}20` }} />
              <p className="text-xl sm:text-2xl font-black text-white break-words">{stat.value}</p>
              <p className="text-xs text-[#8A8F97] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden mb-8">
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Upload className="h-5 w-5 text-[var(--conectia-arcilla)]" />
                  Nuevo Comprobante
                </h2>
                <button onClick={resetForm} className="text-[#B0ACA6] hover:text-white" aria-label="Cerrar formulario">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#B0ACA6] text-sm">Concepto *</Label>
                  <Input
                    placeholder="Ej: Pago de comisión Casa Cumbres"
                    value={form.concepto}
                    onChange={(e) => setForm(prev => ({ ...prev, concepto: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#B0ACA6] text-sm">Tipo de movimiento</Label>
                  <Select value={form.tipo} onValueChange={(value) => setForm(prev => ({ ...prev, tipo: value as TipoComprobante }))}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#B0ACA6] text-sm">Monto (MXN)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.monto}
                    onChange={(e) => setForm(prev => ({ ...prev, monto: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#B0ACA6] text-sm">Fecha del movimiento *</Label>
                  <Input
                    type="date"
                    value={form.fecha}
                    onChange={(e) => setForm(prev => ({ ...prev, fecha: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#B0ACA6] text-sm">Notas</Label>
                <Textarea
                  rows={3}
                  placeholder="Detalles del movimiento (opcional)"
                  value={form.notas}
                  onChange={(e) => setForm(prev => ({ ...prev, notas: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]) }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 hover:border-[var(--conectia-arcilla)]/50 bg-[#0F2027]/60 p-8 text-center cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                {archivo ? (
                  <>
                    {archivo.type === 'application/pdf'
                      ? <FileText className="h-8 w-8 text-[var(--conectia-arcilla)]" />
                      : <ImageIcon className="h-8 w-8 text-[var(--conectia-arcilla)]" />}
                    <span className="text-sm font-semibold text-white break-all">{archivo.name}</span>
                    <span className="text-xs text-[#8A8F97]">{(archivo.size / 1024 / 1024).toFixed(2)} MB · Toca para cambiar</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-[#8A8F97]" />
                    <span className="text-sm font-semibold text-white">Arrastra o selecciona el comprobante *</span>
                    <span className="text-xs text-[#8A8F97]">Imagen o PDF, máximo {MAX_FILE_MB} MB</span>
                  </>
                )}
              </label>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>Cancelar</Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#0F2027] font-bold sm:min-w-[200px]"
                >
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Subiendo...</> : <><Upload className="h-4 w-4 mr-2" />Guardar Comprobante</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8F97]" />
            <Input
              placeholder="Buscar por concepto, notas o quién lo subió"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          <Select value={filtroTipo} onValueChange={(value) => setFiltroTipo(value as typeof filtroTipo)}>
            <SelectTrigger className={`${inputClass} sm:w-48`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[var(--conectia-arcilla)]" /></div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.03] border border-white/10 rounded-[24px]">
            <Receipt className="h-12 w-12 mx-auto text-[#4A4F57] mb-3" />
            <p className="text-white font-semibold">{comprobantes.length === 0 ? 'Aún no hay comprobantes' : 'Sin resultados'}</p>
            <p className="text-sm text-[#8A8F97] mt-1">{comprobantes.length === 0 ? 'Sube el primero con el botón "Subir Comprobante".' : 'Prueba con otra búsqueda o tipo.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map(c => {
              const tipo = TIPOS.find(t => t.value === c.tipo) || TIPOS[4]
              const esPdf = c.archivo_tipo === 'application/pdf'
              return (
                <div key={c.id} className="bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 rounded-[20px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors">
                  <a
                    href={c.archivo_url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#0F2027] border border-white/10 flex items-center justify-center"
                    aria-label={`Abrir ${c.archivo_nombre}`}
                  >
                    {!esPdf && c.archivo_url
                      ? <img src={c.archivo_url} alt="" className="w-full h-full object-cover" />
                      : <FileText className="h-7 w-7 text-[var(--conectia-arcilla)]" />}
                  </a>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate">{c.concepto}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tipo.color}`}>{tipo.label}</span>
                    </div>
                    <p className="text-xs text-[#8A8F97]">
                      {formatDate(c.fecha)} · Subido por {c.subido_por_nombre || c.subido_por_email}
                    </p>
                    {c.notas && <p className="text-sm text-[#B0ACA6] mt-1 line-clamp-2">{c.notas}</p>}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:min-w-[220px]">
                    {c.monto !== null && <span className="text-lg font-black text-white">{formatMoney(Number(c.monto))}</span>}
                    <div className="flex gap-1">
                      {c.archivo_url && (
                        <a
                          href={c.archivo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-[#B0ACA6] hover:text-white hover:bg-white/10 transition-colors"
                          aria-label="Ver comprobante"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(c)}
                        className="p-2 rounded-lg text-[#B0ACA6] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        aria-label="Eliminar comprobante"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
