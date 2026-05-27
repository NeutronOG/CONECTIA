"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { uploadImage } from "@/lib/supabase/storage"
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Camera, 
  Upload, 
  X, 
  ArrowLeft,
  Image as ImageIcon,
  Home,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle
} from "lucide-react"

export default function NuevaSolicitudPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    titulo: "",
    ubicacion: "",
    descripcion: "",
    precio_estimado: ""
  })
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedFiles.length === 0) {
      alert('Debes subir al menos una foto')
      return
    }

    if (!formData.titulo || !formData.ubicacion) {
      alert('Completa todos los campos requeridos')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // 1. Subir imágenes usando uploadImage (misma lógica que asesores)
      const uploadedUrls: string[] = []
      const totalFiles = selectedFiles.length

      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i]
        setUploadProgress(Math.round(((i) / totalFiles) * 100))

        const result = await uploadImage(file, `solicitudes/${user?.id}`)
        
        if (result.error) {
          toast.error(`Error subiendo ${file.name}: ${result.error}`)
          continue
        }

        if (result.url) {
          uploadedUrls.push(result.url)
        }
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100))
      }

      if (uploadedUrls.length === 0) {
        toast.error('No se pudo subir ninguna imagen')
        return
      }

      // 2. Crear solicitud via API (usa service role, sin RLS)
      const res = await fetch('/api/solicitudes-propiedad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asesor_email: user?.email || 'fotografo@conectia.mx',
          asesor_nombre: user?.nombre || 'Santiago Canales',
          titulo: formData.titulo,
          ubicacion: formData.ubicacion,
          descripcion: formData.descripcion,
          precio_estimado: formData.precio_estimado ? parseFloat(formData.precio_estimado) : null
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error creando solicitud')
      }

      const data = await res.json()

      // 3. Agregar imágenes a la solicitud
      if (data.solicitud?.id && uploadedUrls.length > 0) {
        await fetch('/api/solicitudes-propiedad', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.solicitud.id,
            imagenes: uploadedUrls
          })
        })
      }

      setShowSuccessModal(true)
    } catch (error: any) {
      console.error('Error creating request:', error)
      toast.error(error.message || 'Error al enviar solicitud')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-[#17313A]">
      {/* Header */}
      <div className="bg-gradient-to-r from-conectia-graphite to-gray-900 text-white py-6">
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
            <div className="w-12 h-12 bg-conectia-primary rounded-full flex items-center justify-center">
              <Camera className="h-6 w-6 text-conectia-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Nueva Solicitud de Propiedad</h1>
              <p className="text-gray-300">Sube las fotos y detalles de la propiedad</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-conectia-primary" />
                Información de la Propiedad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Título de la Propiedad *
                </label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Ej: Casa en Venta - Zona Norte"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ubicación *
                </label>
                <Input
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                  placeholder="Ej: León, Gto. Zona Norte, Villa Valbuena"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Precio Estimado (opcional)
                </label>
                <Input
                  type="number"
                  value={formData.precio_estimado}
                  onChange={(e) => setFormData({...formData, precio_estimado: e.target.value})}
                  placeholder="Ej: 3500000"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descripción (opcional)
                </label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Detalles adicionales sobre la propiedad..."
                  rows={4}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Subir Fotos */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-conectia-primary" />
                Fotografías de la Propiedad *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-conectia-primary transition-colors">
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
                      Selecciona las fotos
                    </p>
                    <p className="text-sm text-gray-500">
                      Haz clic para seleccionar o arrastra imágenes aquí
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Las fotos se guardan automáticamente en Supabase Storage
                    </p>
                  </label>
                </div>

                {/* Preview Selected Files */}
                {selectedFiles.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Fotos seleccionadas ({selectedFiles.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          {!uploading && (
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-900">
                        Subiendo fotos...
                      </span>
                      <span className="text-sm text-blue-700">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/panel-fotografo')}
              disabled={uploading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              className="flex-1 bg-conectia-primary hover:bg-conectia-primary/90 text-conectia-accent"
            >
              {uploading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      </div>

      {/* Modal de Éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#17313A]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-conectia-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-conectia-accent" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Solicitud Enviada!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu solicitud ha sido enviada exitosamente. El administrador la revisará pronto y te notificaremos cuando sea aprobada.
            </p>
            <Button
              onClick={() => router.push('/panel-fotografo')}
              className="w-full bg-conectia-primary hover:bg-conectia-primary/90 text-conectia-accent font-semibold py-3"
            >
              Volver al Panel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
