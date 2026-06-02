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
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Check,
  X,
  MessageCircle,
} from 'lucide-react'

interface ShareButtonProps {
  title: string
  description?: string
  url: string
  image?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function ShareButton({
  title,
  description = '',
  url,
  image,
  variant = 'outline',
  size = 'default',
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  // Asegurar que la URL sea absoluta
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`
  const shareText = `${title}${description ? ` - ${description}` : ''}`
  const encodedText = encodeURIComponent(shareText)
  const encodedUrl = encodeURIComponent(fullUrl)

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-[#1877F2] hover:bg-[#166fe5]',
    },
    {
      name: 'Twitter / X',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'bg-[#000000] hover:bg-[#333333]',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-[#0A66C2] hover:bg-[#0958a8]',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: 'bg-[#25D366] hover:bg-[#1faa52]',
    },
  ]

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      toast.success('Enlace copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar el enlace')
    }
  }

  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400')
    setOpen(false)
  }

  // Compartir nativo en móviles
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        })
        setOpen(false)
      } catch {
        // El usuario canceló o error
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 ${className}`}
        >
          <Share2 className="h-4 w-4" />
          <span className={size === 'icon' ? 'sr-only' : ''}>Compartir</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#1F3D47] border-[#EAE4DD]/20 text-[#EAE4DD]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir Propiedad
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Preview de la propiedad */}
          <div className="p-4 bg-[#17313A] rounded-lg border border-[#EAE4DD]/10">
            <p className="text-sm text-[#EAE4DD]/60 mb-1">Compartiendo:</p>
            <p className="font-medium text-[#EAE4DD] line-clamp-2">{title}</p>
            {image && (
              <div className="mt-3 aspect-video rounded-md overflow-hidden bg-[#0F2027]">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Botones de redes sociales */}
          <div className="grid grid-cols-2 gap-3">
            {shareLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleShare(link.url)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white transition-all ${link.color}`}
              >
                <link.icon className="h-5 w-5" />
                <span className="font-medium">{link.name}</span>
              </button>
            ))}
          </div>

          {/* Botón de compartir nativo (solo móviles) */}
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] rounded-lg font-medium transition-all"
            >
              <Share2 className="h-5 w-5" />
              Compartir en mi dispositivo
            </button>
          )}

          {/* Copiar enlace */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={fullUrl}
                readOnly
                className="pr-10 bg-[#17313A] border-[#EAE4DD]/20 text-[#EAE4DD] text-sm"
              />
              <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EAE4DD]/40" />
            </div>
            <Button
              onClick={handleCopyLink}
              variant={copied ? 'default' : 'outline'}
              className={`gap-2 ${
                copied 
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                  : 'bg-transparent border-[#EAE4DD]/20 text-[#EAE4DD] hover:bg-[#EAE4DD]/10'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>

          {/* Cerrar */}
          <button
            onClick={() => setOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[#EAE4DD]/60 hover:text-[#EAE4DD] transition-colors"
          >
            <X className="h-4 w-4" />
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Versión simplificada para uso rápido
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
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: fullUrl,
        })
      } catch {
        // Usuario canceló
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(fullUrl)
        toast.success('Enlace copiado al portapapeles')
      } catch {
        toast.error('No se pudo copiar el enlace')
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-3 py-2 bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] rounded-lg font-medium transition-all ${className}`}
    >
      <Share2 className="h-4 w-4" />
      Compartir
    </button>
  )
}
