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
import { trackPropertyShare } from '@/lib/property-analytics'
import {
  Share2,
  Link as LinkIcon,
  Check,
  Copy,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react'

const WhatsAppIcon = () => (
  <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

export interface PropertyMeta {
  precioTexto?: string
  tipo?: string
  ubicacion?: string
  habitaciones?: number
  banos?: number
  areaTexto?: string
}

interface ShareButtonProps {
  title: string
  description?: string
  url: string
  image?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  propertyId?: string | number
  propertyMeta?: PropertyMeta
}

export function ShareButton({
  title,
  description = '',
  url,
  image,
  variant = 'outline',
  size = 'default',
  className = '',
  propertyId,
  propertyMeta,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<'main' | 'instagram'>('main')

  const getFullUrl = () => {
    if (typeof window === 'undefined') return url
    return url.startsWith('http') ? url : `${window.location.origin}${url}`
  }

  const buildWhatsAppMessage = () => {
    const lines: string[] = [`🏠 *${title}*`, '']
    if (propertyMeta?.ubicacion) lines.push(`📍 ${propertyMeta.ubicacion}`)
    if (propertyMeta?.precioTexto) lines.push(`💰 *${propertyMeta.precioTexto}*`)
    if (propertyMeta?.tipo) lines.push(`🏗 ${propertyMeta.tipo}`)
    lines.push('')
    const stats: string[] = []
    if (propertyMeta?.habitaciones) stats.push(`🛏 ${propertyMeta.habitaciones} rec.`)
    if (propertyMeta?.banos) stats.push(`🚿 ${propertyMeta.banos} baños`)
    if (propertyMeta?.areaTexto) stats.push(`📐 ${propertyMeta.areaTexto}`)
    if (stats.length) { lines.push(stats.join('  ')); lines.push('') }
    if (description) {
      const short = description.slice(0, 140) + (description.length > 140 ? '...' : '')
      lines.push(short); lines.push('')
    }
    lines.push(`👆 Ver todos los detalles:`)
    lines.push(getFullUrl())
    lines.push('')
    lines.push(`_CONECTIA · Red Inmobiliaria_`)
    return lines.join('\n')
  }

  const buildInstagramCaption = () => {
    const lines: string[] = [`${title} 🏡`, '']
    if (propertyMeta?.ubicacion) lines.push(`📍 ${propertyMeta.ubicacion}`)
    if (propertyMeta?.precioTexto) lines.push(`💰 ${propertyMeta.precioTexto}`)
    const stats: string[] = []
    if (propertyMeta?.habitaciones) stats.push(`🛏 ${propertyMeta.habitaciones} rec.`)
    if (propertyMeta?.banos) stats.push(`🚿 ${propertyMeta.banos} baños`)
    if (propertyMeta?.areaTexto) stats.push(`📐 ${propertyMeta.areaTexto}`)
    if (stats.length) lines.push(stats.join(' · '))
    lines.push('')
    lines.push(`✨ Más propiedades exclusivas en CONECTIA`)
    lines.push(`🔗 Link en bio`)
    lines.push('')
    lines.push(`#conectia #bienesraices #propiedades #inmobiliaria #casas #realestate`)
    if (propertyMeta?.tipo) lines.push(`#${propertyMeta.tipo.toLowerCase().replace(/\s+/g, '')}`)
    return lines.join('\n')
  }

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildWhatsAppMessage())}`, '_blank')
    if (propertyId) trackPropertyShare(propertyId)
  }

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getFullUrl())}`, '_blank', 'width=600,height=400')
    if (propertyId) trackPropertyShare(propertyId)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getFullUrl())
      setCopied(true)
      toast.success('Enlace copiado')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: propertyMeta?.precioTexto || description, url: getFullUrl() })
        if (propertyId) trackPropertyShare(propertyId)
        setOpen(false)
      } catch { /* cancelado */ }
    }
  }

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(buildInstagramCaption())
      toast.success('Texto copiado para Instagram')
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setPanel('main') }}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`}>
          <Share2 className="h-4 w-4" />
          <span className={size === 'icon' ? 'sr-only' : ''}>Compartir</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-[24px] border-white/10"
        style={{ background: '#17313A' }}>

        {panel === 'main' ? (
          <>
            {/* Preview con imagen */}
            {image ? (
              <div className="relative h-52 overflow-hidden">
                <img src={image} alt={title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2027]/92 via-[#0F2027]/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-bold text-lg leading-tight line-clamp-2">{title}</p>
                  {propertyMeta?.precioTexto && (
                    <p className="text-[var(--conectia-arcilla)] font-black text-xl mt-0.5">{propertyMeta.precioTexto}</p>
                  )}
                  {propertyMeta?.ubicacion && (
                    <p className="text-white/55 text-xs mt-1">📍 {propertyMeta.ubicacion}</p>
                  )}
                  {(propertyMeta?.habitaciones || propertyMeta?.banos || propertyMeta?.areaTexto) && (
                    <div className="flex gap-3 mt-1.5 text-white/50 text-xs">
                      {propertyMeta.habitaciones && <span>🛏 {propertyMeta.habitaciones}</span>}
                      {propertyMeta.banos && <span>🚿 {propertyMeta.banos}</span>}
                      {propertyMeta.areaTexto && <span>📐 {propertyMeta.areaTexto}</span>}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 pb-0">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-[var(--conectia-arcilla)]" /> Compartir propiedad
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-white font-semibold">{title}</p>
                  {propertyMeta?.precioTexto && <p className="text-[var(--conectia-arcilla)] font-black mt-1">{propertyMeta.precioTexto}</p>}
                </div>
              </div>
            )}

            <div className="p-5 space-y-3">
              <p className="text-[#8A8F97] text-[10px] uppercase tracking-[0.3em] font-bold">Compartir en</p>

              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={handleWhatsApp}
                  className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20c05b] text-white font-semibold transition-all active:scale-95 text-sm">
                  <WhatsAppIcon /> WhatsApp
                </button>

                <button onClick={handleFacebook}
                  className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold transition-all active:scale-95 text-sm">
                  <FacebookIcon /> Facebook
                </button>

                <button onClick={() => setPanel('instagram')}
                  className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-white font-semibold transition-all active:scale-95 text-sm"
                  style={{ background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)' }}>
                  <InstagramIcon /> Instagram
                </button>

                <button onClick={handleCopyLink}
                  className={`flex items-center gap-2.5 px-4 py-3.5 rounded-2xl transition-all active:scale-95 text-sm font-semibold ${
                    copied ? 'bg-green-600 text-white' : 'bg-white/8 border border-white/15 text-white/80 hover:bg-white/15'
                  }`}>
                  {copied ? <Check className="h-5 w-5 flex-shrink-0" /> : <LinkIcon className="h-5 w-5 flex-shrink-0" />}
                  {copied ? 'Copiado' : 'Copiar link'}
                </button>
              </div>

              <button onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--conectia-arcilla)]/12 border border-[var(--conectia-arcilla)]/25 text-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla)]/22 transition-all text-sm font-semibold">
                <Share2 className="h-4 w-4" /> Compartir en mi dispositivo
              </button>
            </div>
          </>
        ) : (
          /* Instagram panel */
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setPanel('main')}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0">
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <InstagramIcon />
                <h3 className="text-white font-bold text-base">Compartir en Instagram</h3>
              </div>
            </div>

            {/* Step 1: Image */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--conectia-arcilla)] text-[#0F2027] text-xs font-black flex items-center justify-center flex-shrink-0">1</span>
                <p className="text-white font-semibold text-sm">Guarda la imagen</p>
              </div>
              {image && (
                <div className="aspect-square w-full rounded-xl overflow-hidden max-h-44 bg-[#0F2027]">
                  <img src={image} alt={title} className="w-full h-full object-cover" />
                </div>
              )}
              <a href={image || '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/18 text-white text-sm font-semibold transition-all">
                <ExternalLink className="h-4 w-4" /> Abrir imagen para guardar
              </a>
            </div>

            {/* Step 2: Caption */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--conectia-arcilla)] text-[#0F2027] text-xs font-black flex items-center justify-center flex-shrink-0">2</span>
                <p className="text-white font-semibold text-sm">Copia el pie de foto</p>
              </div>
              <pre className="text-white/65 text-xs bg-[#0F2027]/60 rounded-xl p-3 whitespace-pre-wrap font-sans leading-relaxed max-h-32 overflow-y-auto scrollbar-hide">
                {buildInstagramCaption()}
              </pre>
              <button onClick={handleCopyCaption}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #833AB4, #FD1D1D)' }}>
                <Copy className="h-4 w-4" /> Copiar texto
              </button>
            </div>

            {/* Step 3: Open IG */}
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)' }}>
              <InstagramIcon /> Abrir Instagram
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function ShareButtonSimple({
  title,
  url,
  className = '',
}: {
  title: string
  url: string
  className?: string
}) {
  const handleShare = async () => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title, url: fullUrl }) } catch { /* cancelado */ }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl)
        toast.success('Enlace copiado al portapapeles')
      } catch {
        toast.error('No se pudo copiar el enlace')
      }
    }
  }

  return (
    <button onClick={handleShare}
      className={`flex items-center gap-2 px-3 py-2 bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#17313A] rounded-lg font-medium transition-all ${className}`}>
      <Share2 className="h-4 w-4" />
      Compartir
    </button>
  )
}
