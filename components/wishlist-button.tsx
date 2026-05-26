"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { useWishlist } from "./wishlist-provider"
import { Button } from "./ui/button"
import { NotificationToast } from "./notification-toast"

interface Property {
  id: string
  title: string
  price: string
  location: string
  image: string
  bedrooms?: number
  bathrooms?: number
  area?: string
}

interface WishlistButtonProps {
  property: Property
  className?: string
  size?: "sm" | "md" | "lg"
  showCount?: boolean
}

export function WishlistButton({ 
  property, 
  className = "", 
  size = "md",
  showCount = false 
}: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistCount } = useWishlist()
  const [showNotification, setShowNotification] = useState(false)
  const isLiked = isInWishlist(property.id)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLiked) {
      removeFromWishlist(property.id)
    } else {
      addToWishlist(property)
      // Show custom notification instead of browser alert
      setShowNotification(true)
    }
  }

  const handleWhatsAppContact = () => {
    const message = `Hola CONECTIA, me interesa la propiedad "${property.title}" ubicada en ${property.location} con precio de ${property.price}. ¿Podrían enviarme más información y agendar una cita para verla?`
    const whatsappUrl = `https://wa.me/5214774756951?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12"
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={`
          ${sizeClasses[size]} rounded-full p-0
          ${isLiked 
            ? 'bg-red-50 hover:bg-red-100 text-red-500 border-red-200' 
            : 'bg-conectia-secondary/50/80 hover:bg-conectia-secondary/50 text-gray-600 border-gray-200'
          }
          border backdrop-blur-sm transition-all duration-300 
          hover:scale-110 active:scale-95 shadow-sm hover:shadow-md
          ${className}
        `}
      >
        <Heart 
          className={`${iconSizes[size]} transition-all duration-300 ${
            isLiked ? 'fill-current scale-110' : ''
          }`}
        />
        {showCount && wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </Button>

      <NotificationToast
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        onWhatsApp={handleWhatsAppContact}
        propertyTitle={property.title}
        type="wishlist"
      />
    </>
  )
}

export function WishlistCounter() {
  const { wishlistCount } = useWishlist()
  
  return (
    <div className="flex items-center space-x-2">
      <Heart className="h-4 w-4 text-red-500" />
      <span className="text-sm font-medium">{wishlistCount}</span>
    </div>
  )
}
