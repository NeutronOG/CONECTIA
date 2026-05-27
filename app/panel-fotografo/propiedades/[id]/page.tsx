"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { uploadImage } from "@/lib/supabase/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Camera, 
  Upload, 
  X, 
  ArrowLeft,
  Image as ImageIcon,
  Trash2,
  Eye,
  Loader2,
  CheckCircle
} from "lucide-react"
import { toast } from 'sonner'

interface Propiedad {
  id: number
  titulo: string
  ubicacion: string
  precio: number
  precio_texto: string
  imagen?: string
  galeria?: string[]
}

export default function SubirImagenesPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const propiedadId = params.id as string

  const [propiedad, setPropiedad] = useState<Propiedad | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'fotografo') {
      router.push('/login')
      return
    }
    loadPropiedad()
  }, [user, isAuthenticated, router, propiedadId])

  const loadPropiedad = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/fotografo/propiedad?id=${propiedadId}`)
      if (!res.ok) throw new Error('Error cargando propiedad')
      const data = await res.json()
      setPropiedad(data.propiedad)
    } catch (error) {
      console.error('Error loading property:', error)
      toast.error('Error al cargar la propiedad')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0 || !propiedad) return

    setUploading(true)
    setUploadProgress(0)
    try {
      const uploadedUrls: string[] = []
      const total = selectedFiles.length

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        setUploadProgress(Math.round(((i) / total) * 100))

        // Usar la misma función de upload que los asesores
        const result = await uploadImage(file, `galeria/${propiedadId}`)
        
        if (result.error) {
          console.error('Error uploading:', result.error)
          toast.error(`Error subiendo ${file.name}: ${result.error}`)
          continue
        }

        if (result.url) {
          uploadedUrls.push(result.url)
        }
      }

      if (uploadedUrls.length === 0) {
        toast.error('No se pudo subir ninguna imagen')
        return
      }

      // Actualizar la propiedad con las nuevas imágenes via API (bypasea RLS)
      const currentGaleria = propiedad.galeria || []
      const newGaleria = [...currentGaleria, ...uploadedUrls]
      
      // Si no tiene imagen principal, usar la primera subida
      const newImagen = propiedad.imagen || uploadedUrls[0]

      const res = await fetch('/api/fotografo/propiedad', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: propiedad.id,
          imagen: newImagen,
          galeria: newGaleria
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error actualizando propiedad')
      }

      setUploadProgress(100)
      toast.success(`${uploadedUrls.length} imagen${uploadedUrls.length > 1 ? 'es' : ''} subida${uploadedUrls.length > 1 ? 's' : ''} exitosamente`)
      
      // Limpiar y recargar
      setSelectedFiles([])
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setPreviewUrls([])
      await loadPropiedad()
    } catch (error: any) {
      console.error('Error uploading images:', error)
      toast.error(error.message || 'Error al subir imágenes')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    if (!confirm('¿Eliminar esta imagen de la galería?') || !propiedad) return

    try {
      const newGaleria = (propiedad.galeria || []).filter(img => img !== imageUrl)
      // Si la imagen principal es la que se elimina, usar la primera de la galería
      const newImagen = propiedad.imagen === imageUrl 
        ? (newGaleria[0] || '') 
        : propiedad.imagen

      const res = await fetch('/api/fotografo/propiedad', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: propiedad.id,
          imagen: newImagen,
          galeria: newGaleria
        })
      })

      if (!res.ok) throw new Error('Error eliminando imagen')

      toast.success('Imagen eliminada')
      await loadPropiedad()
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Error al eliminar imagen')
    }
  }

  const handleSetPrincipal = async (imageUrl: string) => {
    if (!propiedad) return
    try {
      const res = await fetch('/api/fotografo/propiedad', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: propiedad.id,
          imagen: imageUrl
        })
      })
      if (!res.ok) throw new Error('Error actualizando imagen principal')
      toast.success('Imagen principal actualizada')
      await loadPropiedad()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar imagen principal')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#17313A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-conectia-gold" />
      </div>
    )
  }

  if (!propiedad) {
    return (
      <div className="min-h-screen bg-[#17313A] flex items-center justify-center">
        <p className="text-gray-500">Propiedad no encontrada</p>
      </div>
    )
  }

  const allImages = propiedad.galeria || []

  return (
    <div className="min-h-screen bg-[#17313A]">
      {/* Header */}
      <div className="bg-gradient-to-r from-conectia-dark to-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <Button
            onClick={() => router.push('/panel-fotografo')}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-conectia-gold rounded-full flex items-center justify-center">
              <Camera className="h-6 w-6 text-[#17313A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{propiedad.titulo}</h1>
              <p className="text-gray-300">{propiedad.ubicacion} · {propiedad.precio_texto || `$${(propiedad.precio || 0).toLocaleString('es-MX')}`}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Imagen Principal */}
        {propiedad.imagen && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Imagen Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <img
                  src={propiedad.imagen}
                  alt="Imagen principal"
                  className="w-full h-64 object-cover rounded-xl border-2 border-green-500/30"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-conectia-gold" />
              Subir Nuevas Imágenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-conectia-gold transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Selecciona imágenes
                  </p>
                  <p className="text-sm text-gray-500">
                    Haz clic para seleccionar fotos de la propiedad
                  </p>
                </label>
              </div>

              {/* Preview Selected Files */}
              {selectedFiles.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">
                    Imágenes seleccionadas ({selectedFiles.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeSelectedFile(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  {uploading && (
                    <div className="mb-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-conectia-gold rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">{uploadProgress}%</p>
                    </div>
                  )}

                  <Button
                    onClick={handleUploadImages}
                    disabled={uploading}
                    className="w-full bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] font-semibold py-5"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Subiendo imágenes...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2" />
                        Subir {selectedFiles.length} imagen{selectedFiles.length > 1 ? 'es' : ''}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Existing Images (Galería) */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-conectia-gold" />
              Galería de la Propiedad ({allImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allImages.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Aún no hay imágenes en la galería. Sube fotos arriba.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Imagen ${index + 1}`}
                      className={`w-full h-48 object-cover rounded-lg ${propiedad.imagen === imageUrl ? 'ring-2 ring-green-500' : ''}`}
                    />
                    {propiedad.imagen === imageUrl && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Principal
                      </span>
                    )}
                    <div className="absolute inset-0 bg-[#17313A]/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => window.open(imageUrl, '_blank')}
                        title="Ver"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {propiedad.imagen !== imageUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-green-500/50"
                          onClick={() => handleSetPrincipal(imageUrl)}
                          title="Hacer principal"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-red-500/50"
                        onClick={() => handleDeleteImage(imageUrl)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
