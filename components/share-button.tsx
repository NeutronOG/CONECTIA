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
import { createWatermarkedShareFiles } from '@/lib/share-watermark'
import { Check, Copy, Facebook, Link as LinkIcon, Share2 } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

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
  /** Ruta de la ficha de CONECTIA que se compartirá. */
  url: string
  /** Solo se habilita dentro del panel del asesor. */
  allowMediaShare?: boolean
  /** Fotos que se convertirán en copias con marca de agua antes de compartir. */
  images?: string[]
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  propertyId?: string | number
  propertyMeta?: PropertyMeta
}

/**
 * Público: comparte solamente la ficha. Asesor: puede adjuntar copias marcadas.
 */
export function ShareButton({
  title,
  description = '',
  url,
  allowMediaShare = false,
  images = [],
  variant = 'outline',
  size = 'default',
  className = '',
  propertyId,
  propertyMeta,
}: ShareButtonProps) {
  const { language } = useLanguage()
  const copy = language === 'en' ? {
    viewListing: 'View the full listing on CONECTIA:',
    linkCopied: 'Link copied',
    shareError: 'Unable to share the link',
    compatibleDevice: 'Use a compatible phone or browser to attach protected photos',
    preparePhotosError: 'Unable to prepare the watermarked photos',
    devicePhotosError: 'This device cannot share photos from the browser',
    sharePhotosError: 'Unable to share the protected photos',
    conectiaLinkCopied: 'CONECTIA link copied',
    copyError: 'Unable to copy the link',
    share: 'Share',
    shareListing: 'Share listing',
    advisorDescription: 'Send the listing or CONECTIA-watermarked photos.',
    publicDescription: 'Only the official CONECTIA listing link is shared; photos are not attached or downloaded.',
    facebook: 'Share link on Facebook',
    copyLink: 'Copy CONECTIA link',
    device: 'Share link from this device',
    applying: 'Applying watermark…',
    protected: 'Send listing and protected photos',
  } : {
    viewListing: 'Ver ficha completa en CONECTIA:',
    linkCopied: 'Enlace copiado',
    shareError: 'No se pudo compartir el enlace',
    compatibleDevice: 'Comparte desde un teléfono o navegador compatible para adjuntar fotos protegidas',
    preparePhotosError: 'No se pudieron preparar las fotos con la marca de agua',
    devicePhotosError: 'Este dispositivo no permite compartir fotos desde el navegador',
    sharePhotosError: 'No se pudieron compartir las fotos protegidas',
    conectiaLinkCopied: 'Enlace de CONECTIA copiado',
    copyError: 'No se pudo copiar el enlace',
    share: 'Compartir',
    shareListing: 'Compartir ficha',
    advisorDescription: 'Puedes enviar la ficha o fotos con marca de agua CONECTIA.',
    publicDescription: 'Se comparte solo el enlace oficial de CONECTIA; las fotos no se adjuntan ni se descargan.',
    facebook: 'Compartir enlace en Facebook',
    copyLink: 'Copiar enlace de CONECTIA',
    device: 'Compartir enlace en mi dispositivo',
    applying: 'Aplicando marca de agua…',
    protected: 'Enviar ficha y fotos protegidas',
  }
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const [isPreparingMedia, setIsPreparingMedia] = useState(false)

  const getFullUrl = () => {
    if (typeof window === 'undefined') return url
    return url.startsWith('http') ? url : `${window.location.origin}${url}`
  }

  const shareText = () => {
    const details = [
      propertyMeta?.ubicacion && `📍 ${propertyMeta.ubicacion}`,
      propertyMeta?.precioTexto && `💰 ${propertyMeta.precioTexto}`,
      propertyMeta?.tipo && `🏠 ${propertyMeta.tipo}`,
    ].filter(Boolean)
    const summary = description ? `\n${description.slice(0, 140)}${description.length > 140 ? '…' : ''}` : ''
    return [`🏠 *${title}*`, ...details, summary, `🔗 ${copy.viewListing}`, getFullUrl()].filter(Boolean).join('\n')
  }

  const recordShare = () => {
    if (propertyId) trackPropertyShare(propertyId)
  }

  const handleNativeShare = async () => {
    try {
      if (!navigator.share) {
        await navigator.clipboard.writeText(getFullUrl())
        setCopied(true)
        toast.success(copy.linkCopied)
        return
      }
      await navigator.share({ title, text: shareText(), url: getFullUrl() })
      recordShare()
      setOpen(false)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast.error(copy.shareError)
    }
  }

  const handleAdvisorMediaShare = async () => {
    if (!allowMediaShare || !propertyId) return
    if (!navigator.share) {
      toast.error(copy.compatibleDevice)
      return
    }

    setIsPreparingMedia(true)
    try {
      const files = await createWatermarkedShareFiles(images, propertyId)
      if (!files.length) {
        toast.error(copy.preparePhotosError)
        return
      }
      if (navigator.canShare && !navigator.canShare({ files })) {
        toast.error(copy.devicePhotosError)
        return
      }
      // El texto lleva la ficha oficial; los únicos adjuntos son copias marcadas.
      await navigator.share({ title, text: shareText(), files })
      recordShare()
      setOpen(false)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast.error(copy.sharePhotosError)
    } finally {
      setIsPreparingMedia(false)
    }
  }

  const handleFacebook = () => {
    const params = new URLSearchParams({ u: getFullUrl() })
    window.open(`https://www.facebook.com/sharer/sharer.php?${params.toString()}`, '_blank', 'noopener,noreferrer')
    recordShare()
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getFullUrl())
      setCopied(true)
      recordShare()
      toast.success(copy.conectiaLinkCopied)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(copy.copyError)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`}>
          <Share2 className="h-4 w-4" />
          <span className={size === 'icon' ? 'sr-only' : ''}>{copy.share}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-[24px] border-white/10" style={{ background: '#17313A' }}>
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[var(--conectia-arcilla)]" /> {copy.shareListing}
          </DialogTitle>
          <p className="text-white/55 text-sm pt-1">
            {allowMediaShare ? copy.advisorDescription : copy.publicDescription}
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-3">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-white font-semibold">{title}</p>
            {propertyMeta?.precioTexto && <p className="text-[var(--conectia-arcilla)] font-black mt-1">{propertyMeta.precioTexto}</p>}
          </div>
          <button onClick={handleFacebook} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold transition-all active:scale-95 text-sm">
            <Facebook className="h-4 w-4" /> {copy.facebook}
          </button>
          <button onClick={handleCopyLink} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all active:scale-95 ${copied ? 'bg-green-600 border-green-600 text-white' : 'bg-white/8 border-white/15 text-white hover:bg-white/15'}`}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? copy.linkCopied : copy.copyLink}
          </button>
          <button onClick={handleNativeShare} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[var(--conectia-arcilla)] border border-[var(--conectia-arcilla)]/30 hover:bg-[var(--conectia-arcilla)]/10 text-sm font-semibold transition-all">
            <LinkIcon className="h-4 w-4" /> {copy.device}
          </button>
          {allowMediaShare && (
            <button onClick={handleAdvisorMediaShare} disabled={isPreparingMedia} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--conectia-arcilla)] text-[#17313A] hover:bg-[var(--conectia-arcilla-hover)] disabled:opacity-60 disabled:cursor-wait text-sm font-bold transition-all">
              <Share2 className="h-4 w-4" /> {isPreparingMedia ? copy.applying : copy.protected}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
