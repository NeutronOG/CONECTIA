"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { X, Heart, MessageCircle, CheckCircle } from "lucide-react"

interface NotificationToastProps {
  isOpen: boolean
  onClose: () => void
  onWhatsApp: () => void
  propertyTitle: string
  type?: "wishlist" | "success" | "info"
}

export function NotificationToast({ 
  isOpen, 
  onClose, 
  onWhatsApp, 
  propertyTitle,
  type = "wishlist" 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleWhatsAppClick = () => {
    onWhatsApp()
    handleClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-[#17313A]/40 transition-opacity duration-300 pointer-events-auto ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <Card
          className={`
            max-w-md w-full bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden
            pointer-events-auto transform transition-all duration-300
            ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-6 opacity-0 scale-95"}
          `}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  {type === "wishlist" ? (
                    <Heart className="h-5 w-5 text-white fill-current" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base leading-tight">
                    ¡Agregado a Favoritos!
                  </h3>
                  <p className="text-green-100 text-xs mt-0.5">
                    Propiedad guardada exitosamente
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              {propertyTitle}
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              La propiedad ha sido agregada a tu lista de favoritos. ¿Te gustaría contactarnos
              por WhatsApp para obtener más información y agendar una cita?
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleWhatsAppClick}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-md whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4 mr-2 shrink-0" />
                Contactar por WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="shrink-0 px-5 font-medium rounded-xl border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Ahora no
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
