"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

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

interface WishlistContextType {
  wishlist: Property[]
  addToWishlist: (property: Property) => void
  removeFromWishlist: (propertyId: string) => void
  isInWishlist: (propertyId: string) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Property[]>([])

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("conectia-wishlist")
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist))
      } catch (error) {
        console.error("Error loading wishlist:", error)
      }
    }
  }, [])

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem("conectia-wishlist", JSON.stringify(wishlist))
  }, [wishlist])

  const addToWishlist = (property: Property) => {
    setWishlist(prev => {
      if (prev.some(item => item.id === property.id)) {
        return prev // Already in wishlist
      }
      return [...prev, property]
    })
  }

  const removeFromWishlist = (propertyId: string) => {
    setWishlist(prev => prev.filter(item => item.id !== propertyId))
  }

  const isInWishlist = (propertyId: string) => {
    return wishlist.some(item => item.id === propertyId)
  }

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistCount: wishlist.length,
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
