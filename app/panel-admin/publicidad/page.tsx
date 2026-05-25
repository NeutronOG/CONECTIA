'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  MousePointer,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  LayoutGrid,
  Palette,
  Calendar,
  PenLine,
  Pause,
  Play,
  Ban,
} from 'lucide-react'

interface Ad {
  id: string
  titulo: string
  descripcion: string
  imagen: string
  enlace: string
  texto_boton: string
  ubicacion: string
  estilo: string
  activo: boolean
  estado: string
  fecha_inicio: string
  fecha_fin: string
  creado_por: string
  creado_en: string
  clicks: number
  impresiones: number
}

const ALLOWED_EMAILS = ['admin@conectia.mx', 'lizzie@conectia.mx']

export default function PublicidadPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    imagen: '',
    enlace: '',
    textoBoton: 'Ver más',
    ubicacion: 'entre-secciones',
    estilo: 'elegante',
    activo: true,
    estado: 'activo',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
  })

  useEffect(() => {
    if (!isAuthenticated || !user?.email || !ALLOWED_EMAILS.includes(user.email)) {
      router.push('/login')
      return
    }
    loadAds()
  }, [user, isAuthenticated, router])

  const loadAds = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/anuncios')
      const data = await res.json()
      setAds(data.anuncios || [])
    } catch {
      toast.error('Error cargando anuncios')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      titulo: '',
      descripcion: '',
      imagen: '',
      enlace: '',
      textoBoton: 'Ver más',
      ubicacion: 'entre-secciones',
      estilo: 'elegante',
      activo: true,
      estado: 'activo',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async () => {
    if (!form.titulo.trim()) {
      toast.error('El título es obligatorio')
      return
    }
    setSaving(true)
    try {
      const body = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        imagen: form.imagen,
        enlace: form.enlace,
        textoBoton: form.textoBoton,
        ubicacion: form.ubicacion,
        estilo: form.estilo,
        activo: form.activo,
        estado: form.estado,
        fechaInicio: form.fechaInicio ? new Date(form.fechaInicio).toISOString() : null,
        fechaFin: form.fechaFin ? new Date(form.fechaFin).toISOString() : null,
        creadoPor: user?.email || '',
      }

      if (editingId) {
        const res = await fetch(`/api/admin/anuncios/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('Error actualizando')
        toast.success('Anuncio actualizado')
      } else {
        const res = await fetch('/api/admin/anuncios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('Error creando')
        toast.success('Anuncio creado')
      }

      resetForm()
      loadAds()
    } catch {
      toast.error('Error guardando anuncio')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (ad: Ad) => {
    setForm({
      titulo: ad.titulo,
      descripcion: ad.descripcion,
      imagen: ad.imagen,
      enlace: ad.enlace,
      textoBoton: ad.texto_boton,
      ubicacion: ad.ubicacion,
      estilo: ad.estilo,
      activo: ad.activo,
      estado: ad.estado,
      fechaInicio: ad.fecha_inicio ? ad.fecha_inicio.split('T')[0] : '',
      fechaFin: ad.fecha_fin ? ad.fecha_fin.split('T')[0] : '',
    })
    setEditingId(ad.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este anuncio?')) return
    try {
      await fetch(`/api/admin/anuncios/${id}`, { method: 'DELETE' })
      setAds(prev => prev.filter(a => a.id !== id))
      toast.success('Anuncio eliminado')
    } catch {
      toast.error('Error eliminando')
    }
  }

  const setEstado = async (id: string, estado: string) => {
    const activo = estado === 'activo'
    try {
      await fetch(`/api/admin/anuncios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, activo }),
      })
      setAds(prev => prev.map(a => a.id === id ? { ...a, estado, activo } : a))
      const labels: Record<string, string> = { activo: 'Activo', pausado: 'Pausado', suspendido: 'Suspendido' }
      toast.success(`Anuncio ${labels[estado] || estado}`)
    } catch {
      toast.error('Error actualizando estado')
    }
  }

  const ubicacionLabels: Record<string, string> = {
    'banner-hero': 'Debajo del Hero',
    'entre-secciones': 'Entre Secciones',
    'lateral': 'Lateral',
    'footer': 'Antes del Footer',
  }

  const estiloLabels: Record<string, string> = {
    elegante: 'Elegante',
    destacado: 'Destacado (con imagen de fondo)',
    sutil: 'Sutil',
  }

  const estadoBadge = (ad: Ad) => {
    if (ad.estado === 'suspendido') return { color: 'bg-red-500/20 text-red-400 border-red-500/50', label: 'Suspendido' }
    if (ad.estado === 'pausado') return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', label: 'Pausado' }
    return { color: 'bg-green-500/20 text-green-400 border-green-500/50', label: 'Activo' }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1a1a1a] to-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/panel-admin')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Sparkles className="h-7 w-7 text-[#D4AF37]" />
                Publicidad
              </h1>
              <p className="text-gray-400">Gestiona los espacios publicitarios del homepage</p>
            </div>
            <Button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Anuncio
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardContent className="p-5 text-center">
              <p className="text-gray-400 text-xs mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{ads.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardContent className="p-5 text-center">
              <p className="text-gray-400 text-xs mb-1">Activos</p>
              <p className="text-2xl font-bold text-green-400">{ads.filter(a => a.estado === 'activo').length}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardContent className="p-5 text-center">
              <p className="text-gray-400 text-xs mb-1">Impresiones</p>
              <p className="text-2xl font-bold text-blue-400">{ads.reduce((s, a) => s + (a.impresiones || 0), 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardContent className="p-5 text-center">
              <p className="text-gray-400 text-xs mb-1">Clicks</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{ads.reduce((s, a) => s + (a.clicks || 0), 0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="bg-[#1a1a1a] border-gray-800 mb-8">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <PenLine className="h-5 w-5 text-[#D4AF37]" />
                {editingId ? 'Editar Anuncio' : 'Nuevo Anuncio'}
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Título del anuncio *</Label>
                    <Input
                      placeholder="Ej: Nuevo desarrollo en Polanco"
                      value={form.titulo}
                      onChange={(e) => setForm(prev => ({ ...prev, titulo: e.target.value }))}
                      className="bg-black/50 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Texto del botón</Label>
                    <Input
                      placeholder="Ej: Ver más"
                      value={form.textoBoton}
                      onChange={(e) => setForm(prev => ({ ...prev, textoBoton: e.target.value }))}
                      className="bg-black/50 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Descripción</Label>
                  <Textarea
                    placeholder="Describe el anuncio..."
                    rows={3}
                    value={form.descripcion}
                    onChange={(e) => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="bg-black/50 border-gray-700 text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" /> URL de imagen
                    </Label>
                    <Input
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={form.imagen}
                      onChange={(e) => setForm(prev => ({ ...prev, imagen: e.target.value }))}
                      className="bg-black/50 border-gray-700 text-white"
                    />
                    {form.imagen && (
                      <div className="mt-2 rounded-xl overflow-hidden h-32 bg-black/30">
                        <img src={form.imagen} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm flex items-center gap-1.5">
                      <LinkIcon className="h-3.5 w-3.5" /> Enlace de destino
                    </Label>
                    <Input
                      placeholder="https://ejemplo.com"
                      value={form.enlace}
                      onChange={(e) => setForm(prev => ({ ...prev, enlace: e.target.value }))}
                      className="bg-black/50 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm flex items-center gap-1.5">
                      <LayoutGrid className="h-3.5 w-3.5" /> Ubicación
                    </Label>
                    <Select value={form.ubicacion} onValueChange={(v) => setForm(prev => ({ ...prev, ubicacion: v }))}>
                      <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner-hero">Debajo del Hero</SelectItem>
                        <SelectItem value="entre-secciones">Entre Secciones</SelectItem>
                        <SelectItem value="lateral">Lateral</SelectItem>
                        <SelectItem value="footer">Antes del Footer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5" /> Estilo
                    </Label>
                    <Select value={form.estilo} onValueChange={(v) => setForm(prev => ({ ...prev, estilo: v }))}>
                      <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elegante">Elegante</SelectItem>
                        <SelectItem value="destacado">Destacado (imagen de fondo)</SelectItem>
                        <SelectItem value="sutil">Sutil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Estado inicial</Label>
                    <div className="flex items-center gap-3 pt-2">
                      <Switch
                        checked={form.activo}
                        onCheckedChange={(v) => setForm(prev => ({ ...prev, activo: v, estado: v ? 'activo' : 'pausado' }))}
                      />
                      <span className={form.activo ? 'text-green-400 text-sm' : 'text-gray-500 text-sm'}>
                        {form.activo ? 'Activo' : 'Pausado'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Fecha inicio
                    </Label>
                    <Input
                      type="date"
                      value={form.fechaInicio}
                      onChange={(e) => setForm(prev => ({ ...prev, fechaInicio: e.target.value }))}
                      className="bg-black/50 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Fecha fin (opcional)
                    </Label>
                    <Input
                      type="date"
                      value={form.fechaFin}
                      onChange={(e) => setForm(prev => ({ ...prev, fechaFin: e.target.value }))}
                      className="bg-black/50 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold px-8"
                  >
                    {saving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Anuncio'}
                  </Button>
                  <Button variant="outline" onClick={resetForm} className="border-gray-600 text-gray-300">
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ads List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardContent className="p-12 text-center">
                <p className="text-gray-400">Cargando anuncios...</p>
              </CardContent>
            </Card>
          ) : ads.length === 0 ? (
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardContent className="p-12 text-center">
                <Sparkles className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No hay anuncios creados</p>
                <p className="text-gray-500 text-sm">Crea tu primer anuncio para mostrarlo en el homepage</p>
              </CardContent>
            </Card>
          ) : (
            ads.map((ad) => {
              const badge = estadoBadge(ad)
              return (
                <Card key={ad.id} className="bg-[#1a1a1a] border-gray-800">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {ad.imagen && (
                        <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-black/30">
                          <img src={ad.imagen} alt={ad.titulo} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-white truncate">{ad.titulo}</h3>
                          <Badge className={`${badge.color} text-xs`}>{badge.label}</Badge>
                          <Badge variant="outline" className="text-xs text-[#D4AF37] border-[#D4AF37]/50">
                            {ubicacionLabels[ad.ubicacion] || ad.ubicacion}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {estiloLabels[ad.estilo] || ad.estilo}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 truncate mb-2">{ad.descripcion || 'Sin descripción'}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{ad.impresiones || 0} impresiones</span>
                          <span className="flex items-center gap-1"><MousePointer className="h-3 w-3" />{ad.clicks || 0} clicks</span>
                          <span>Por: {ad.creado_por || '—'}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {ad.estado !== 'activo' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEstado(ad.id, 'activo')}
                            title="Reanudar"
                            className="text-green-400 hover:text-green-300"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {ad.estado === 'activo' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEstado(ad.id, 'pausado')}
                            title="Pausar"
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {ad.estado !== 'suspendido' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEstado(ad.id, 'suspendido')}
                            title="Suspender"
                            className="text-orange-400 hover:text-orange-300"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(ad)}
                          title="Editar"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <PenLine className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(ad.id)}
                          title="Eliminar"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
