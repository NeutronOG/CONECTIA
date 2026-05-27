"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  X,
  Home,
  Building,
  User,
  Users,
  Search,
  Heart,
  MapPin,
  Shield,
  UserCircle,
  ChevronDown,
  Tag,
  Key,
  Sparkles,
  Percent,
  Palette,
  Camera,
  Briefcase,
} from "lucide-react"
import { WishlistCounter } from "./wishlist-button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

export function DynamicHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isOtrosMenuOpen, setIsOtrosMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const otrosButtonRef = useRef<HTMLButtonElement | null>(null)
  const [otrosRect, setOtrosRect] = useState<{ top: number; right: number } | null>(null)

  const handleOtrosToggle = () => {
    if (!isOtrosMenuOpen && otrosButtonRef.current) {
      const r = otrosButtonRef.current.getBoundingClientRect()
      setOtrosRect({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
    setIsOtrosMenuOpen(prev => !prev)
  }
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    // Animación de entrada
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timer)
    }
  }, [])

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/propiedades", label: "Propiedades", icon: Building },
    { href: "/propietarios", label: "Propietarios", icon: User },
    { href: "/contacto", label: "Contacto", icon: MapPin },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  // Detectar si estamos en una página de panel
  const isInPanel = pathname.startsWith('/panel-admin') || pathname.startsWith('/panel-asesor') || pathname.startsWith('/panel-broker') || pathname.startsWith('/panel-fotografo') || pathname.startsWith('/panel-empresa')

  return (
    <>
      {/* Dynamic Island Header — forma de pastilla asimétrica */}
      <div className={`
        fixed left-1/2 transform -translate-x-1/2 z-50 
        ${isInPanel
          ? 'bottom-6 top-auto'
          : 'md:top-5 md:bottom-auto bottom-6 top-auto'
        }
        transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
        ${isLoaded ? 'translate-y-0 opacity-100' : `${isInPanel ? 'translate-y-4' : 'md:translate-y-[-16px] translate-y-4'} opacity-0`}
      `}>
        <div
          className={`
            transform-gpu will-change-transform
            mx-auto md:origin-top origin-bottom
            transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
            ${isMobileMenuOpen
              ? `rounded-[32px] px-6 py-6 min-w-[320px] 
                 glass-nav
                 shadow-2xl
                 transform scale-100 opacity-100
                 mobile-menu-expanded`
              : `rounded-[28px] px-4 py-2 max-w-fit
                 glass-nav
                 ${isScrolled ? 'scale-[0.97] shadow-lg' : ''}
                 transform scale-100 opacity-100`
            }
          `}
        >
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center gap-2 min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0 px-2 group">
              <svg viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto transition-transform group-hover:scale-105">
                <text x="0" y="30" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="32" fontWeight="600" fill="#EAE4DD" letterSpacing="2">CONECTIA</text>
              </svg>
            </Link>

            {/* Separator */}
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-[#B0ACA6]/25 to-transparent flex-shrink-0"></div>

            {/* Navigation Items */}
            <nav className="flex items-center gap-1 min-w-0">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group relative flex items-center justify-center gap-1.5 px-3 py-1.5
                      rounded-full transition-all duration-300 ease-out flex-shrink-0
                      ${isActive(item.href)
                        ? 'bg-[#17313A]/10 text-[#17313A] font-semibold shadow-[0_1px_0_rgba(255,255,255,0.60)_inset]'
                        : 'text-[#4A4F57] hover:text-[#17313A] hover:bg-[#17313A]/07'
                      }
                    `}
                  >
                    <Icon className="h-3.5 w-3.5 flex-shrink-0 transition-transform group-hover:scale-110" />
                    <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Separator entre nav y action buttons */}
            <div className="w-px h-4 bg-[#B0ACA6]/20 mx-2"></div>

            {/* Action Buttons - Lupa pegada al corazón */}
            <div className="flex items-center gap-0 flex-shrink-0">
              <Link href="/favoritos">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md text-[#B0ACA6] hover:bg-conectia-primary/10 hover:text-conectia-primary"
                >
                  <Heart className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                  className="rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md text-[#B0ACA6] hover:bg-conectia-primary/10 hover:text-conectia-primary"
              >
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Separator */}
            <div className="w-px h-4 bg-conectia-accent/20 mx-1"></div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link href="/propietarios">
                <Button
                  size="sm"
                  className="btn-glass-primary rounded-xl px-4 py-1.5 font-semibold text-xs h-8 transition-all duration-300 hover:scale-105 whitespace-nowrap flex items-center gap-1.5 border-0"
                >
                  <Building className="h-3 w-3" />
                  Vender
                </Button>
              </Link>
              <Link href="/alianza-comercial">
                <Button
                  size="sm"
                  className="btn-glass-secondary rounded-xl px-4 py-1.5 font-semibold text-xs h-8 transition-all duration-300 hover:scale-105 whitespace-nowrap flex items-center gap-1.5 border-0"
                >
                  <User className="h-3 w-3" />
                  Asesor
                </Button>
              </Link>
              <Button
                ref={otrosButtonRef}
                size="sm"
                onClick={handleOtrosToggle}
                className="btn-glass-tertiary rounded-xl px-3 py-1.5 font-medium text-xs h-8 transition-all duration-300 hover:scale-105 whitespace-nowrap flex items-center gap-1.5 border-0"
              >
                Otros
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOtrosMenuOpen ? 'rotate-180' : ''}`} />
              </Button>

              {/* Separator */}
              <div className="w-px h-4 bg-[#B0ACA6]/20 mx-1 flex-shrink-0"></div>

              {/* Panel Interno Access - Desktop */}
              {isAuthenticated && user ? (
                <Link
                  href={
                    user.role === 'admin' ? '/panel-admin' :
                      user.role === 'propietario' ? '/panel-propietario' :
                        user.role === 'fotografo' ? '/panel-fotografo' :
                          user.role === 'broker' ? '/panel-broker' :
                            user.role === 'empresa' ? '/panel-empresa' :
                            '/panel-asesor'
                  }
                >
                  <Button
                    size="sm"
                    className="btn-glass-secondary rounded-full px-2 py-0.5 font-medium text-xs h-5 ml-0.5 transition-all duration-300 hover:scale-105 whitespace-nowrap flex items-center gap-1 border-0"
                  >
                    {user.role === 'admin' ? (
                      <>
                        <Shield className="h-2.5 w-2.5" />
                        <span>Admin</span>
                      </>
                    ) : user.role === 'propietario' ? (
                      <>
                        <Building className="h-2.5 w-2.5" />
                        <span>Mi Propiedad</span>
                      </>
                    ) : user.role === 'fotografo' ? (
                      <>
                        <Camera className="h-2.5 w-2.5" />
                        <span>Mi Panel</span>
                      </>
                    ) : user.role === 'empresa' ? (
                      <>
                        <Briefcase className="h-2.5 w-2.5" />
                        <span>Mi Empresa</span>
                      </>
                    ) : (
                      <>
                        <UserCircle className="h-2.5 w-2.5" />
                        <span>Mi Panel</span>
                      </>
                    )}
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button
                    size="sm"
                    className="btn-glass-tertiary rounded-xl px-2 py-0.5 font-medium text-xs h-5 ml-0.5 transition-all duration-300 hover:scale-105 whitespace-nowrap flex items-center gap-1 border-0"
                  >
                    <UserCircle className="h-2.5 w-2.5" />
                    <span>Acceso</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            {!isMobileMenuOpen ? (
              <div className="flex items-center gap-2 px-1">
                {/* Mobile Logo */}
                <Link href="/" className="flex items-center flex-shrink-0">
                  <Image
                    src="/logo.png"
                    alt="CONECTIA"
                    width={120}
                    height={35}
                    className="h-7 w-auto object-contain transition-all duration-300"
                  />
                </Link>

                {/* Divider */}
                <div className="w-px h-5 bg-[#B0ACA6]/20 mx-1 flex-shrink-0" />

                {/* Menú button — grande y visible */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass-pill text-[#17313A] active:scale-95 transition-all duration-200 font-semibold text-sm"
                >
                  <Menu className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap tracking-wide">Menú</span>
                </button>

                {/* Heart icon */}
                <Link href="/favoritos" className="flex-shrink-0">
                  <button className="flex items-center justify-center w-9 h-9 rounded-full glass-pill text-[#17313A] hover:scale-110 active:scale-95 transition-all duration-200">
                    <Heart className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 w-full transition-all duration-300 ease-out">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between transition-all duration-200 ease-out">
                  <Link href="/" className="flex items-center space-x-2">
                    <Image
                      src="/logo.png"
                      alt="CONECTIA"
                      width={160}
                      height={50}
                      className="h-8 w-auto object-contain"
                    />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-full w-8 h-8 p-0 hover:bg-conectia-accent/10 transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Navigation Grid - Apple Style */}
                <div className="grid grid-cols-2 gap-3 transition-all duration-200 ease-out">
                  {navItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex flex-col items-center space-y-2 px-4 py-4 rounded-2xl
                          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                          hover:scale-105 active:scale-95
                          opacity-100
                          ${isActive(item.href)
                            ? 'glass-panel text-[#17313A] font-medium'
                            : 'text-[#4A4F57] hover:text-[#17313A] hover:bg-[#17313A]/05'
                          }
                        `}
                      >
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center
                          transition-all duration-300 ease-out
                          ${isActive(item.href)
                            ? 'bg-[#17313A]/15'
                            : 'bg-[#17313A]/08'
                          }
                        `}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>

                {/* Categorías Dropdown */}
                <div className="pt-3 border-t border-[#17313A]/10">
                  <button
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass-pill hover:opacity-80 transition-all duration-300"
                  >
                    <span className="text-sm font-semibold text-[#17313A]">Categorías</span>
                    <ChevronDown className={`h-5 w-5 text-[#17313A] transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isCategoriesOpen && (
                    <div className="mt-2 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
                      <Link href="/renta" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl glass-pill hover:opacity-80 transition-all">
                          <Key className="h-4 w-4 text-[#17313A]" />
                          <span className="text-xs font-medium text-[#1D1F24]">Renta</span>
                        </button>
                      </Link>
                      <Link href="/exclusivos" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl glass-pill hover:opacity-80 transition-all">
                          <Shield className="h-4 w-4 text-[#17313A]" />
                          <span className="text-xs font-medium text-[#1D1F24]">Exclusivos</span>
                        </button>
                      </Link>
                      <Link href="/desarrollos" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl glass-pill hover:opacity-80 transition-all">
                          <Building className="h-4 w-4 text-[#17313A]" />
                          <span className="text-xs font-medium text-[#1D1F24]">Desarrollos</span>
                        </button>
                      </Link>
                      <Link href="/especiales" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl glass-pill hover:opacity-80 transition-all">
                          <Sparkles className="h-4 w-4 text-[#B0ACA6]" />
                          <span className="text-xs font-medium text-[#1D1F24]">Especiales</span>
                        </button>
                      </Link>
                      <Link href="/ofertas" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl glass-pill hover:opacity-80 transition-all">
                          <Percent className="h-4 w-4 text-[#C78F7B]" />
                          <span className="text-xs font-medium text-[#1D1F24]">Ofertas</span>
                        </button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between pt-3 border-t border-[#17313A]/10 transition-all duration-200 ease-out">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-[#4A4F57] hover:text-[#17313A] hover:bg-[#17313A]/06 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <Search className="h-4 w-4" />
                    <span className="text-sm">Buscar</span>
                  </Button>
                  <Link href="/favoritos">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl text-[#4A4F57] hover:text-[#17313A] hover:bg-[#17313A]/06 transition-all duration-300 hover:scale-105 active:scale-95"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <WishlistCounter />
                      <span className="text-sm">Favoritos</span>
                    </Button>
                  </Link>
                </div>

                {/* Primary Action - Combined Button */}
                {isAuthenticated && user ? (
                  <>
                    {user.role === 'propietario' ? (
                      <Link
                        href="/panel-propietario"
                        className="transition-all duration-200 ease-out"
                      >
                        <Button
                          className="w-full btn-glass-primary rounded-2xl font-semibold py-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-0"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Building className="h-4 w-4 mr-2" />
                          Mi Propiedad
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        href={user.role === 'admin' ? '/panel-admin' : user.role === 'broker' ? '/panel-broker' : user.role === 'fotografo' ? '/panel-fotografo' : '/panel-asesor'}
                        className="transition-all duration-200 ease-out"
                      >
                        <Button
                          className="w-full btn-glass-primary rounded-2xl font-semibold py-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-0"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {user.role === 'admin' ? (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Panel Admin
                            </>
                          ) : (
                            <>
                              <UserCircle className="h-4 w-4 mr-2" />
                              Mi Panel
                            </>
                          )}
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/propietarios" className="transition-all duration-200 ease-out">
                      <Button
                        className="w-full btn-glass-primary rounded-2xl font-semibold py-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-0"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Vender mi Propiedad
                      </Button>
                    </Link>
                    <Link href="/alianza-comercial" className="transition-all duration-200 ease-out">
                      <Button
                        className="w-full btn-glass-secondary rounded-2xl font-semibold py-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-0"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserCircle className="h-4 w-4 mr-2" />
                        Soy Asesor
                      </Button>
                    </Link>
                    <Link href="/login" className="transition-all duration-200 ease-out">
                      <Button
                        className="w-full btn-glass-tertiary rounded-2xl font-semibold py-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-0"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserCircle className="h-4 w-4 mr-2" />
                        Acceso Interno
                      </Button>
                    </Link>
                  </>
                )}

                {/* Contact Info */}
                <div className="text-center pt-3 border-t border-[#17313A]/10 transition-all duration-200 ease-out">
                  <div className="flex items-center justify-center space-x-2 text-sm text-[#4A4F57] mb-2">
                    <MapPin className="h-4 w-4 text-[#C78F7B]" />
                    <span>León, Guanajuato</span>
                  </div>
                  <div className="space-y-1 text-sm text-[#4A4F57]">
                    <div>+52 1 477 475 6951</div>
                    <div>conectiaselect@gmail.com</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#17313A]/15 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Dropdown Otros — fuera de la isla, position:fixed independiente */}
      {isOtrosMenuOpen && otrosRect && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOtrosMenuOpen(false)} />
          <div
            className="fixed z-50 w-52 rounded-2xl overflow-hidden"
            style={{
              top: otrosRect.top,
              right: otrosRect.right,
              background: 'rgba(250,247,244,0.94)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(234,228,221,0.50)',
              boxShadow: '0 20px 60px rgba(23,49,58,0.22), 0 4px 12px rgba(23,49,58,0.12)',
            }}
          >
            <div className="py-2">
              <Link href="/renta" onClick={() => setIsOtrosMenuOpen(false)}>
                <button className="w-full px-4 py-2.5 text-left text-sm text-[#1D1F24] hover:bg-[#17313A]/08 transition-colors flex items-center gap-2">
                  <Key className="h-4 w-4 text-[#17313A]" />
                  <span>Renta</span>
                </button>
              </Link>
              <Link href="/especiales" onClick={() => setIsOtrosMenuOpen(false)}>
                <button className="w-full px-4 py-2.5 text-left text-sm text-[#1D1F24] hover:bg-[#17313A]/08 transition-colors flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#C78F7B]" />
                  <span>Especiales</span>
                </button>
              </Link>
              <Link href="/ofertas" onClick={() => setIsOtrosMenuOpen(false)}>
                <button className="w-full px-4 py-2.5 text-left text-sm text-[#1D1F24] hover:bg-[#17313A]/08 transition-colors flex items-center gap-2">
                  <Percent className="h-4 w-4 text-[#17313A]" />
                  <span>Ofertas</span>
                </button>
              </Link>
              <Link href="/exclusivos" onClick={() => setIsOtrosMenuOpen(false)}>
                <button className="w-full px-4 py-2.5 text-left text-sm text-[#1D1F24] hover:bg-[#17313A]/08 transition-colors flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#17313A]" />
                  <span>Exclusivos</span>
                </button>
              </Link>
              <div className="my-1.5 mx-4 border-t border-[#B0ACA6]/25" />
              <Link href="/desarrollos" onClick={() => setIsOtrosMenuOpen(false)}>
                <button className="w-full px-4 py-2.5 text-left text-sm text-[#1D1F24] hover:bg-[#17313A]/08 transition-colors flex items-center gap-2">
                  <Building className="h-4 w-4 text-[#17313A]" />
                  <span>Desarrollos</span>
                </button>
              </Link>
              <Link href="/brokers" onClick={() => setIsOtrosMenuOpen(false)}>
                <button className="w-full px-4 py-2.5 text-left text-sm text-[#1D1F24] hover:bg-[#17313A]/08 transition-colors flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#17313A]" />
                  <span>Brokers y Notarías</span>
                </button>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
