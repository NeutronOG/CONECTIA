"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Building, Users, Settings, MapPin, ChevronDown } from "lucide-react"

export function MobileNavigation() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showProperties, setShowProperties] = useState(false)

  // Close island when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".dynamic-island")) {
        setIsExpanded(false)
        setShowProperties(false)
      }
    }

    if (isExpanded) {
      document.addEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isExpanded])

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
      {/* Dynamic Island */}
      <div
        className={`dynamic-island transition-all duration-500 ease-out ${
          isExpanded
            ? "w-80 h-auto bg-[#17313A]/90 backdrop-blur-2xl rounded-3xl shadow-2xl"
            : "w-32 h-8 bg-[#17313A]/80 backdrop-blur-xl rounded-full shadow-lg cursor-pointer hover:bg-[#17313A]/90"
        }`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        {/* Collapsed State */}
        {!isExpanded && (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-conectia-gold rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">CONECTIA</span>
            </div>
          </div>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <div className="p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-conectia-gold to-yellow-400 rounded-lg shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-conectia-secondary/50 rounded-sm"></div>
                </div>
                <span className="text-white font-serif text-lg font-bold">CONECTIA</span>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(false)
                  setShowProperties(false)
                }}
                className="w-6 h-6 p-0 bg-conectia-secondary/50/10 hover:bg-conectia-secondary/50/20 rounded-full border-0"
              >
                <div className="w-3 h-0.5 bg-conectia-secondary/50 rounded-full transform rotate-45 absolute"></div>
                <div className="w-3 h-0.5 bg-conectia-secondary/50 rounded-full transform -rotate-45 absolute"></div>
              </Button>
            </div>

            {/* Properties Toggle */}
            <div className="mb-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowProperties(!showProperties)
                }}
                className="w-full bg-conectia-gold/20 hover:bg-conectia-gold/30 border border-conectia-gold/30 text-white rounded-2xl py-3 text-sm font-medium flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Propiedades Exclusivas</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${showProperties ? "rotate-180" : ""}`}
                />
              </Button>

              {/* Properties List */}
              {showProperties && (
                <div className="mt-3 space-y-2 animate-slide-down">
                  <div className="bg-conectia-secondary/50/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <img
                        src="/luxury-penthouse-polanco-main.png"
                        alt="Penthouse"
                        className="w-10 h-8 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">Penthouse Polanco IV</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-300">
                          <MapPin className="h-3 w-3" />
                          <span>CDMX</span>
                          <span className="text-conectia-gold font-semibold">$18.5M</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-conectia-secondary/50/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <img src="/luxury-villa-santa-fe.png" alt="Villa" className="w-10 h-8 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">Villa Santa Fe</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-300">
                          <MapPin className="h-3 w-3" />
                          <span>CDMX</span>
                          <span className="text-conectia-gold font-semibold">$22.8M</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Link
                href="/servicios"
                onClick={() => setIsExpanded(false)}
                className="bg-conectia-secondary/50/10 hover:bg-conectia-secondary/50/20 backdrop-blur-xl rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Settings className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-white text-xs font-medium">Servicios</span>
                </div>
              </Link>

              <Link
                href="/empresa"
                onClick={() => setIsExpanded(false)}
                className="bg-conectia-secondary/50/10 hover:bg-conectia-secondary/50/20 backdrop-blur-xl rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-400" />
                  </div>
                  <span className="text-white text-xs font-medium">Empresa</span>
                </div>
              </Link>

              <Link
                href="/propiedades"
                onClick={() => setIsExpanded(false)}
                className="bg-conectia-secondary/50/10 hover:bg-conectia-secondary/50/20 backdrop-blur-xl rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Building className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="text-white text-xs font-medium">Propiedades</span>
                </div>
              </Link>

              <Link
                href="/marketing"
                onClick={() => setIsExpanded(false)}
                className="bg-conectia-secondary/50/10 hover:bg-conectia-secondary/50/20 backdrop-blur-xl rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Home className="h-4 w-4 text-orange-400" />
                  </div>
                  <span className="text-white text-xs font-medium">Marketing</span>
                </div>
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/propietarios" onClick={() => setIsExpanded(false)}>
                <Button className="w-full bg-gradient-to-r from-conectia-gold to-yellow-400 hover:from-conectia-gold/90 hover:to-yellow-400/90 text-[#17313A] rounded-2xl py-3 text-sm font-semibold shadow-lg">
                  Vender mi Propiedad
                </Button>
              </Link>
              <Link href="/dashboard" onClick={() => setIsExpanded(false)}>
                <Button className="w-full bg-conectia-secondary/50/20 hover:bg-conectia-secondary/50/30 border border-white/30 text-white rounded-2xl py-3 text-sm font-medium">
                  Acceso Propietarios
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
