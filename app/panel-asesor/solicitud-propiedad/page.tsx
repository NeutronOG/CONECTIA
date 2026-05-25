'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { PropertyForm } from '@/components/property-form'
import { Propiedad } from '@/data/propiedades'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Camera, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SolicitudPropiedadPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [enviada, setEnviada] = useState(false)
  const [tituloEnviado, setTituloEnviado] = useState('')

  if (!isAuthenticated || user?.role !== 'asesor') {
    router.push('/login')
    return null
  }

  const handleSolicitud = async (propertyData: Omit<Propiedad, 'id'>) => {
    try {
      // 1. Crear la solicitud con todos los datos del formulario
      const res = await fetch('/api/solicitudes-propiedad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asesor_email: user?.email,
          asesor_nombre: user?.nombre,
          titulo: propertyData.titulo,
          ubicacion: propertyData.ubicacion || null,
          descripcion: propertyData.descripcion || null,
          precio_estimado: propertyData.precio || null,
          tipo: propertyData.tipo || 'Departamento',
          categoria: propertyData.categoria || 'venta',
          habitaciones: propertyData.habitaciones || null,
          banos: propertyData.banos || null,
          area: propertyData.area || null
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al enviar solicitud')
      }

      const data = await res.json()

      // 2. Si hay imágenes (principal + galería), agregarlas a la solicitud
      const allImages: string[] = []
      if (propertyData.imagen && !propertyData.imagen.includes('placeholder')) {
        allImages.push(propertyData.imagen)
      }
      if (propertyData.galeria && propertyData.galeria.length > 0) {
        allImages.push(...propertyData.galeria)
      }

      if (allImages.length > 0 && data.solicitud?.id) {
        await fetch('/api/solicitudes-propiedad', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.solicitud.id,
            imagenes: allImages
          })
        })
      }

      setTituloEnviado(propertyData.titulo)
      setEnviada(true)
      toast.success('Solicitud enviada al fotógrafo')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al enviar solicitud')
    }
  }

  if (enviada) {
    return (
      <div className="min-h-screen bg-conectia-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-conectia-secondary/60 backdrop-blur-xl border-white/40 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-conectia-graphite mb-2">Solicitud Enviada</h2>
            <p className="text-gray-500 mb-2">
              Tu solicitud para <strong>{tituloEnviado}</strong> ha sido enviada al fotógrafo.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Santiago recibirá la solicitud y se encargará de completar las fotos y publicar la propiedad.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setEnviada(false)}
                className="flex-1"
              >
                Nueva Solicitud
              </Button>
              <Button
                onClick={() => router.push('/panel-asesor/propiedades')}
                className="flex-1 bg-conectia-gold hover:bg-conectia-gold/90 text-black"
              >
                Volver a Propiedades
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-conectia-secondary text-conectia-graphite p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/panel-asesor/propiedades')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Propiedades
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-conectia-graphite">
            Solicitar Fotografía de Propiedad
          </h1>
          <p className="text-gray-500 text-sm">
            Llena todos los datos de la propiedad igual que si fueras a publicarla. El fotógrafo recibirá la solicitud y se encargará de completar las fotos profesionales.
          </p>
        </div>

        {/* Info banner */}
        <Card className="mb-6 bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Camera className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-700">¿Cómo funciona?</p>
              <p className="text-xs text-blue-600 mt-1">
                1. Llena todos los datos de la propiedad (puedes subir fotos provisionales o dejar que el fotógrafo las suba) → 2. Envía la solicitud → 3. El fotógrafo recibe la solicitud, sube las fotos profesionales y la completa → 4. La propiedad se publica automáticamente en tu panel
              </p>
            </div>
          </CardContent>
        </Card>

        <PropertyForm
          asesorEmail={user?.email || ''}
          asesorNombre={user?.nombre || ''}
          onSubmit={handleSolicitud}
          onCancel={() => router.push('/panel-asesor/propiedades')}
        />
      </div>
    </div>
  )
}
