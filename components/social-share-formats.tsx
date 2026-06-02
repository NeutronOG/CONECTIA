'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Share2,
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  Copy,
  Check,
  Download,
  Eye,
} from 'lucide-react'

interface PropertyShareData {
  id: string | number
  titulo: string
  ubicacion: string
  precioTexto: string
  tipo: string
  imagen?: string
  descripcion?: string
  habitaciones?: number
  banos?: number
  areaTexto?: string
  asesor?: {
    nombre: string
    telefono: string
  }
}

interface SocialShareFormatsProps {
  property: PropertyShareData
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

// Colores de marca CONECTIA
const BRAND_COLORS = {
  primary: '#17313A',
  gold: '#C78F7B',
  cream: '#EAE4DD',
  white: '#FFFFFF',
}

export function SocialShareFormats({
  property,
  variant = 'outline',
  size = 'default',
  className = '',
}: SocialShareFormatsProps) {
  const [open, setOpen] = useState(false)
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)
  const [previewPlatform, setPreviewPlatform] = useState<string>('whatsapp')

  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/propiedades/${property.id}`
    : `/propiedades/${property.id}`

  const asesorInfo = property.asesor || {
    nombre: 'CONECTIA',
    telefono: '+52 477 475 6951'
  }

  // Formato WhatsApp (texto plano, emojis estratégicos)
  const whatsappFormat = `🏠 *${property.titulo.toUpperCase()}*

📍 ${property.ubicacion}
💰 ${property.precioTexto}
📐 ${property.tipo} • ${property.habitaciones || '-'} hab • ${property.banos || '-'} baños

✨ Disponible en CONECTIA

🔗 Ver más: ${fullUrl}

📞 ${asesorInfo.nombre}: ${asesorInfo.telefono}

🏡 Tu nuevo hogar te espera 💫`

  // Formato Instagram (con hashtags y saltos de línea)
  const instagramFormat = `🏠 ${property.titulo}

📍 Ubicación: ${property.ubicacion}
💰 Precio: ${property.precioTexto}
🏠 Tipo: ${property.tipo}
${property.habitaciones ? `🛏️ Habitaciones: ${property.habitaciones}` : ''}
${property.banos ? `🚿 Baños: ${property.banos}` : ''}
${property.areaTexto ? `📐 Área: ${property.areaTexto}` : ''}

✨ La propiedad de tus sueños te espera en CONECTIA

🔗 Link en bio para ver más fotos e información

📞 Contacto: ${asesorInfo.telefono}
.
.
.
#CONECTIA #Inmobiliaria #${property.tipo?.replace(/\s+/g, '')} #${property.ubicacion?.split(',')[0]?.replace(/\s+/g, '')} #PropiedadesEnVenta #BienesRaíces #InversiónInmobiliaria #CasaNueva #HogarDulceHogar #LeónGuanajuato #México`

  // Formato Facebook (más descriptivo)
  const facebookFormat = `🏠 ${property.titulo.toUpperCase()}

📍 Ubicación: ${property.ubicacion}
💰 Precio: ${property.precioTexto}
🏠 Tipo de propiedad: ${property.tipo}
${property.habitaciones ? `🛏️ Habitaciones: ${property.habitaciones}` : ''}
${property.banos ? `🚿 Baños: ${property.banos}` : ''}
${property.areaTexto ? `📐 Superficie: ${property.areaTexto}` : ''}
${property.descripcion ? `\n📝 Descripción:\n${property.descripcion.slice(0, 200)}${property.descripcion.length > 200 ? '...' : ''}` : ''}

✨ Encuentra esta y más propiedades exclusivas en CONECTIA

🔗 Más información: ${fullUrl}

📞 Para agendar una visita contacta a ${asesorInfo.nombre}: ${asesorInfo.telefono}

🏡 CONECTIA - Conectando personas con su hogar ideal 💫`

  // Formato TikTok (corto, viral, con hooks)
  const tiktokFormat = `🏠 ${property.titulo}
📍 ${property.ubicacion}
💰 ${property.precioTexto}

✨ Disponible ahora en CONECTIA

🔗 ${fullUrl}

#CONECTIA #casanueva #bienesraices #inmobiliaria #${property.tipo?.replace(/\s+/g, '')} #hogar #inversión`

  // Formato para imagen/story (sin emojis, solo texto para overlay)
  const storyFormat = `${property.titulo}
${property.ubicacion}
${property.precioTexto}

CONECTIA
${fullUrl}`

  const platforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#1faa52]',
      textColor: 'text-white',
      format: whatsappFormat,
      description: 'Formato optimizado para mensajes y estados',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90',
      textColor: 'text-white',
      format: instagramFormat,
      description: 'Captions con hashtags estratégicos',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#166fe5]',
      textColor: 'text-white',
      format: facebookFormat,
      description: 'Formato descriptivo para publicaciones',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Music2,
      color: 'bg-black hover:bg-gray-900 border-2 border-white',
      textColor: 'text-white',
      format: tiktokFormat,
      description: 'Formato corto viral para videos',
    },
  ]

  const handleCopy = async (platform: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPlatform(platform)
      toast.success(`Formato ${platform} copiado al portapapeles`)
      setTimeout(() => setCopiedPlatform(null), 2000)
    } catch {
      toast.error('No se pudo copiar el texto')
    }
  }

  const handleDownload = (platform: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `conectia-${platform}-${property.id}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Archivo descargado`)
  }

  const selectedPlatform = platforms.find(p => p.id === previewPlatform)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 ${className}`}
          style={{ 
            borderColor: BRAND_COLORS.gold,
            color: BRAND_COLORS.primary 
          }}
        >
          <Share2 className="h-4 w-4" style={{ color: BRAND_COLORS.gold }} />
          <span>Compartir</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0"
        style={{ 
          backgroundColor: BRAND_COLORS.primary,
          borderColor: `${BRAND_COLORS.gold}40`,
        }}
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <DialogTitle 
            className="text-xl font-semibold flex items-center gap-3"
            style={{ color: BRAND_COLORS.cream }}
          >
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${BRAND_COLORS.gold}20` }}
            >
              <Share2 className="h-5 w-5" style={{ color: BRAND_COLORS.gold }} />
            </div>
            Compartir en Redes Sociales
          </DialogTitle>
          <p className="text-sm mt-2" style={{ color: `${BRAND_COLORS.cream}80` }}>
            Formato personalizado para cada plataforma - manteniendo la identidad CONECTIA
          </p>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-4">
          {/* Selector de plataforma */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setPreviewPlatform(platform.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  previewPlatform === platform.id 
                    ? 'ring-2 ring-offset-2 ring-offset-[#17313A] ring-[#C78F7B]' 
                    : 'opacity-70 hover:opacity-100'
                } ${platform.color} ${platform.textColor}`}
              >
                <platform.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{platform.name}</span>
              </button>
            ))}
          </div>

          {/* Preview */}
          {selectedPlatform && (
            <div className="space-y-3">
              <div 
                className="flex items-center justify-between text-sm"
                style={{ color: `${BRAND_COLORS.cream}80` }}
              >
                <span>{selectedPlatform.description}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(selectedPlatform.id, selectedPlatform.format)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{ 
                      backgroundColor: `${BRAND_COLORS.gold}20`,
                      color: BRAND_COLORS.gold 
                    }}
                  >
                    {copiedPlatform === selectedPlatform.id ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copiar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownload(selectedPlatform.id, selectedPlatform.format)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{ 
                      backgroundColor: `${BRAND_COLORS.cream}10`,
                      color: BRAND_COLORS.cream 
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </button>
                </div>
              </div>

              {/* Textarea con el formato */}
              <div 
                className="relative rounded-xl overflow-hidden"
                style={{ 
                  backgroundColor: `${BRAND_COLORS.cream}05`,
                  border: `1px solid ${BRAND_COLORS.gold}30`,
                }}
              >
                <div 
                  className="absolute top-0 left-0 right-0 px-4 py-2 text-xs font-medium flex items-center gap-2"
                  style={{ 
                    backgroundColor: `${BRAND_COLORS.gold}15`,
                    color: BRAND_COLORS.gold,
                    borderBottom: `1px solid ${BRAND_COLORS.gold}20`,
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Vista previa - {selectedPlatform.name}
                </div>
                <textarea
                  readOnly
                  value={selectedPlatform.format}
                  className="w-full h-64 p-4 pt-12 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: BRAND_COLORS.cream,
                  }}
                />
              </div>

              {/* Stats del formato */}
              <div 
                className="flex gap-4 text-xs px-1"
                style={{ color: `${BRAND_COLORS.cream}60` }}
              >
                <span>{selectedPlatform.format.length} caracteres</span>
                <span>•</span>
                <span>{selectedPlatform.format.split('\n').length} líneas</span>
              </div>
            </div>
          )}

          {/* Botón de cerrar */}
          <Button
            onClick={() => setOpen(false)}
            className="w-full mt-4"
            style={{ 
              backgroundColor: `${BRAND_COLORS.gold}20`,
              color: BRAND_COLORS.gold,
              border: `1px solid ${BRAND_COLORS.gold}40`,
            }}
          >
            Cerrar
          </Button>
        </div>

        {/* Footer con marca */}
        <div 
          className="px-6 py-3 text-center text-xs"
          style={{ 
            backgroundColor: `${BRAND_COLORS.gold}10`,
            color: `${BRAND_COLORS.cream}60`,
            borderTop: `1px solid ${BRAND_COLORS.gold}20`,
          }}
        >
          Formatos de marca CONECTIA • Colores: Azul Petróleo {BRAND_COLORS.primary} • Oro Cálido {BRAND_COLORS.gold}
        </div>
      </DialogContent>
    </Dialog>
  )
}
