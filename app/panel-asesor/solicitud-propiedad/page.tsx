'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { PropertyForm } from '@/components/property-form'
import { Propiedad } from '@/data/propiedades'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Camera, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/i18n'

export default function SolicitudPropiedadPage() {
  const { t } = useLanguage()
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
        throw new Error(data.error || t('panelAsesor.errors.sendRequest'))
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
      toast.success(t('panelAsesor.toast.requestSent'))
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || t('panelAsesor.errors.sendRequest'))
    }
  }

  if (enviada) {
    return (
      <div className="min-h-screen bg-[#0F2027] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#C78F7B]/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[28px] p-8 text-center max-w-md w-full z-10">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#C78F7B]/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('panelAsesor.request.successTitle')}</h2>
            <p className="text-sm text-[#B0ACA6] mb-2">{t('panelAsesor.request.successBody1')} <strong className="text-white">{tituloEnviado}</strong> {t('panelAsesor.request.successBody2')}</p>
            <p className="text-xs text-[#4A4F57] mb-6">{t('panelAsesor.request.successNote')}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEnviada(false)} className="flex-1 bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white rounded-xl">{t('panelAsesor.request.newRequest')}</Button>
              <Button onClick={() => router.push('/panel-asesor/propiedades')} className="flex-1 bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] rounded-xl font-bold">{t('panelAsesor.request.backToProperties')}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F2027] relative overflow-hidden">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#C78F7B]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <button onClick={() => router.push('/panel-asesor/propiedades')} className="flex items-center gap-2 text-[#B0ACA6] hover:text-white mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t('panelAsesor.request.backToProperties')}
        </button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">{t('panelAsesor.request.title')}</h1>
          <p className="text-sm text-[#B0ACA6]">{t('panelAsesor.request.subtitle')}</p>
        </div>

        {/* Info banner */}
        <div className="relative bg-blue-500/5 backdrop-blur-md border border-blue-500/20 rounded-[24px] p-5 mb-6 flex items-start gap-3">
          <Camera className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-blue-400">{t('panelAsesor.request.howTitle')}</p>
            <p className="text-xs text-blue-400/70 mt-1">{t('panelAsesor.request.howSteps')}</p>
          </div>
        </div>

        <PropertyForm
          asesorEmail={user?.email || ''}
          asesorNombre={user?.nombre || ''}
          onSubmit={handleSolicitud}
          onCancel={() => router.push('/panel-asesor/propiedades')}
          submitLabel={t('panelAsesor.request.submitLabel')}
        />
      </div>
    </div>
  )
}
