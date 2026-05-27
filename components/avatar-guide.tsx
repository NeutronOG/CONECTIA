"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Home,
  Building,
  User,
  MapPin,
  Heart,
  Search,
  Phone,
  Sparkles
} from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

interface GuideSpeech {
  id: string
  title: string
  icon: React.ElementType
  speech: string
  shortSpeech: string
  route?: string
  targetSelector?: string
  scrollToTop?: boolean
}

const GUIDE_SPEECHES: GuideSpeech[] = [
  {
    id: "welcome",
    title: "¡Bienvenido!",
    icon: Sparkles,
    speech: "¡Hola! Soy tu guía virtual de CONECTIA. Te voy a mostrar cómo navegar por nuestra plataforma inmobiliaria de manera rápida y sencilla. Somos tu inmobiliaria de confianza en León, Guanajuato. ¡Empecemos!",
    shortSpeech: "Bienvenido a CONECTIA, tu inmobiliaria de confianza.",
    route: "/",
    scrollToTop: true,
  },
  {
    id: "dynamic-island",
    title: "Isla Dinámica",
    icon: Sparkles,
    speech: "¿Ves esta barra flotante? Es nuestra isla dinámica de navegación. Se adapta a tu pantalla y siempre está disponible. Desde aquí puedes acceder a todas las secciones principales de la plataforma.",
    shortSpeech: "Barra de navegación flotante y adaptable.",
    targetSelector: "div[class*='fixed'][class*='left-1/2']",
  },
  {
    id: "hero",
    title: "Sección Principal",
    icon: Home,
    speech: "Aquí está nuestra sección principal con un video de fondo. Puedes ver nuestro logo y los botones principales para explorar propiedades o vender tu propiedad. Todo muy visual y fácil de usar.",
    shortSpeech: "Sección principal con acceso rápido.",
    targetSelector: "section:first-of-type",
  },
  {
    id: "stats",
    title: "Nuestras Estadísticas",
    icon: Sparkles,
    speech: "Mira nuestras estadísticas en tiempo real: propiedades activas, clientes satisfechos y años de experiencia. Estos números reflejan nuestra trayectoria y compromiso.",
    shortSpeech: "Estadísticas de nuestro éxito.",
    targetSelector: "section:nth-of-type(2)",
  },
  {
    id: "featured",
    title: "Propiedades Destacadas",
    icon: Building,
    speech: "Aquí están nuestras propiedades destacadas en un carrusel interactivo. Desliza para ver las mejores opciones disponibles. Cada una tiene fotos, precio y características principales.",
    shortSpeech: "Carrusel de propiedades destacadas.",
    targetSelector: "section:nth-of-type(3)",
  },
  {
    id: "features",
    title: "¿Por qué CONECTIA?",
    icon: Heart,
    speech: "En esta sección te mostramos por qué elegirnos: confianza total con proceso transparente, exclusividad con propiedades únicas, y una red selecta de conexión directa.",
    shortSpeech: "Nuestros valores y ventajas.",
    targetSelector: "section:nth-of-type(4)",
  },
  {
    id: "assistant",
    title: "Asistente Virtual",
    icon: Phone,
    speech: "¿Ves el botón dorado en la esquina? Es nuestro asistente virtual disponible las 24 horas. Puedes chatear con él o incluso hacer una llamada con inteligencia artificial para resolver tus dudas al instante.",
    shortSpeech: "Asistente 24/7 para ayudarte.",
  },
  {
    id: "end",
    title: "¡Listo!",
    icon: Sparkles,
    speech: "¡Eso es todo! Ya conoces lo básico de CONECTIA. Recuerda: proceso transparente, sin complicaciones y conexión directa entre compradores y vendedores. ¡Explora y encuentra tu próximo hogar!",
    shortSpeech: "¡Explora y encuentra tu hogar ideal!",
    scrollToTop: true,
  },
]

export function AvatarGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasSeenGuide, setHasSeenGuide] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if user has seen the guide before
    const seen = localStorage.getItem("conectia-guide-seen")
    if (!seen) {
      // Show prompt after 3 seconds for new visitors
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setHasSeenGuide(true)
    }
  }, [])

  const handleStartGuide = () => {
    setShowPrompt(false)
    setIsOpen(true)
    setCurrentStep(0)
    setIsPlaying(true)
    speakText(GUIDE_SPEECHES[0].speech)
    highlightStep(0)
  }

  const handleDismissPrompt = () => {
    setShowPrompt(false)
    localStorage.setItem("conectia-guide-seen", "true")
    setHasSeenGuide(true)
  }

  const speakText = useCallback((text: string) => {
    if (isMuted || typeof window === "undefined") return
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-MX"
    utterance.rate = 0.95
    utterance.pitch = 1
    
    // Try to find a Spanish voice
    const voices = window.speechSynthesis.getVoices()
    const spanishVoice = voices.find(voice => 
      voice.lang.includes("es") && voice.name.includes("female")
    ) || voices.find(voice => voice.lang.includes("es"))
    
    if (spanishVoice) {
      utterance.voice = spanishVoice
    }
    
    utterance.onend = () => {
      setIsPlaying(false)
    }
    
    window.speechSynthesis.speak(utterance)
    setIsPlaying(true)
  }, [isMuted])

  const highlightStep = useCallback((stepIndex: number) => {
    const speech = GUIDE_SPEECHES[stepIndex]
    
    // Clear previous highlight
    if (highlightedElement) {
      highlightedElement.style.position = ''
      highlightedElement.style.zIndex = ''
    }
    
    // Navigate to route if specified
    if (speech.route && pathname !== speech.route) {
      router.push(speech.route)
      // Wait for navigation to complete
      setTimeout(() => {
        highlightElement(speech)
      }, 500)
    } else {
      highlightElement(speech)
    }
  }, [highlightedElement, pathname, router])

  const highlightElement = (speech: GuideSpeech) => {
    // Scroll to top if specified
    if (speech.scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setHighlightedElement(null)
      return
    }
    
    // Find and highlight target element
    if (speech.targetSelector) {
      const element = document.querySelector(speech.targetSelector) as HTMLElement
      if (element) {
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Highlight the element
        setHighlightedElement(element)
        
        // Add temporary styles to bring element forward and make it visible
        element.style.position = 'relative'
        element.style.zIndex = '10000'
        element.style.filter = 'none'
        element.style.opacity = '1'
      } else {
        setHighlightedElement(null)
      }
    } else {
      setHighlightedElement(null)
    }
  }

  const handleNext = () => {
    window.speechSynthesis.cancel()
    if (currentStep < GUIDE_SPEECHES.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      speakText(GUIDE_SPEECHES[nextStep].speech)
      highlightStep(nextStep)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    window.speechSynthesis.cancel()
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      speakText(GUIDE_SPEECHES[prevStep].speech)
      highlightStep(prevStep)
    }
  }

  const handleClose = () => {
    window.speechSynthesis.cancel()
    setIsOpen(false)
    setIsPlaying(false)
    localStorage.setItem("conectia-guide-seen", "true")
    setHasSeenGuide(true)
    
    // Clear highlight and restore original styles
    if (highlightedElement) {
      highlightedElement.style.position = ''
      highlightedElement.style.zIndex = ''
      highlightedElement.style.filter = ''
      highlightedElement.style.opacity = ''
      setHighlightedElement(null)
    }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      } else {
        speakText(GUIDE_SPEECHES[currentStep].speech)
      }
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    }
    setIsMuted(!isMuted)
  }

  const handleStepClick = (index: number) => {
    window.speechSynthesis.cancel()
    setCurrentStep(index)
    speakText(GUIDE_SPEECHES[index].speech)
    highlightStep(index)
  }

  const currentSpeech = GUIDE_SPEECHES[currentStep]
  const Icon = currentSpeech.icon

  return (
    <>
      {/* Initial Prompt for New Visitors */}
      {showPrompt && (
        <div className="fixed inset-0 bg-[#17313A]/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-conectia-secondary border-conectia-accent/20 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-4">
              {/* Avatar */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-conectia-primary to-conectia-gold rounded-full animate-pulse"></div>
                <div className="absolute inset-1 bg-conectia-secondary rounded-full flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="CONECTIA Guide"
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-serif font-bold text-conectia-accent mb-2">
                  ¡Hola! ¿Primera vez aquí?
                </h3>
                <p className="text-conectia-accent/70 text-sm">
                  Te puedo dar un tour rápido de 1 minuto para que conozcas cómo funciona nuestra plataforma.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleStartGuide}
                  className="flex-1 bg-conectia-primary hover:bg-conectia-primary/90 text-conectia-accent font-semibold rounded-xl py-3"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Sí, muéstrame
                </Button>
                <Button
                  onClick={handleDismissPrompt}
                  variant="outline"
                  className="flex-1 border-conectia-accent/20 text-conectia-accent hover:bg-conectia-accent/5 rounded-xl py-3"
                >
                  Ya conozco, gracias
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Floating Guide Button (for users who dismissed or completed) */}
      {hasSeenGuide && !isOpen && (
        <Button
          onClick={() => {
            setIsOpen(true)
            setCurrentStep(0)
            speakText(GUIDE_SPEECHES[0].speech)
            highlightStep(0)
          }}
          className="fixed bottom-24 right-4 sm:bottom-28 sm:right-8 w-12 h-12 rounded-full bg-gradient-to-r from-conectia-primary to-conectia-gold hover:from-conectia-gold hover:to-conectia-primary text-conectia-accent shadow-xl hover:shadow-conectia-primary/30 transition-all duration-300 z-40 hover:scale-110 group"
          title="Guía de navegación"
        >
          <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
        </Button>
      )}

      {/* Walkthrough Overlay - Difumina todo excepto el elemento destacado */}
      {isOpen && highlightedElement && (
        <>
          {/* Overlay oscuro con recorte para el elemento destacado */}
          <div 
            ref={overlayRef}
            className="fixed inset-0 z-[9998] pointer-events-none"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {/* Capa oscura con recorte */}
            <div
              className="absolute transition-all duration-500 ease-in-out"
              style={{
                top: `${highlightedElement.getBoundingClientRect().top - 10}px`,
                left: `${highlightedElement.getBoundingClientRect().left - 10}px`,
                width: `${highlightedElement.getBoundingClientRect().width + 20}px`,
                height: `${highlightedElement.getBoundingClientRect().height + 20}px`,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)',
                borderRadius: '20px',
                border: '4px solid #FFD700',
                animation: 'pulse-highlight 2s infinite',
              }}
            />
          </div>
          
          {/* Clon visual del elemento para mostrarlo claramente */}
          <div
            className="fixed z-[9999] pointer-events-none transition-all duration-500 ease-in-out"
            style={{
              top: `${highlightedElement.getBoundingClientRect().top - 10}px`,
              left: `${highlightedElement.getBoundingClientRect().left - 10}px`,
              width: `${highlightedElement.getBoundingClientRect().width + 20}px`,
              height: `${highlightedElement.getBoundingClientRect().height + 20}px`,
              borderRadius: '20px',
              border: '4px solid #FFD700',
              boxShadow: '0 0 50px 20px rgba(255, 215, 0, 0.6), inset 0 0 30px rgba(255, 215, 0, 0.1)',
              animation: 'pulse-highlight 2s infinite',
            }}
          />
        </>
      )}

      {/* Guide Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
          <div className="pointer-events-auto">
          <Card className="w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl rounded-b-none bg-conectia-secondary border-conectia-accent/20 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-conectia-graphite to-gray-900 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-conectia-primary to-conectia-gold rounded-full flex items-center justify-center">
                  <Icon className="h-5 w-5 text-conectia-accent" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-white">{currentSpeech.title}</h3>
                  <p className="text-xs text-gray-400">Paso {currentStep + 1} de {GUIDE_SPEECHES.length}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-white/10 rounded-full w-8 h-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-conectia-accent/10">
              <div 
                className="h-full bg-gradient-to-r from-conectia-primary to-conectia-gold transition-all duration-300"
                style={{ width: `${((currentStep + 1) / GUIDE_SPEECHES.length) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Avatar with animation */}
              <div className="flex justify-center">
                <div className={`relative w-20 h-20 ${isPlaying ? 'animate-pulse' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-conectia-primary to-conectia-gold rounded-full"></div>
                  <div className="absolute inset-1 bg-conectia-secondary rounded-full flex items-center justify-center overflow-hidden">
                    <Image
                      src="/logo.png"
                      alt="CONECTIA Guide"
                      width={72}
                      height={72}
                      className="rounded-full object-cover"
                    />
                  </div>
                  {isPlaying && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      <div className="w-1 h-3 bg-conectia-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-4 bg-conectia-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-3 bg-conectia-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Speech Text */}
              <div className="bg-conectia-accent/5 rounded-2xl p-4 min-h-[100px]">
                <p className="text-conectia-accent text-sm leading-relaxed">
                  {currentSpeech.speech}
                </p>
              </div>

              {/* Step Indicators */}
              <div className="flex justify-center gap-1.5 py-2">
                {GUIDE_SPEECHES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleStepClick(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-conectia-primary w-6' 
                        : index < currentStep 
                          ? 'bg-conectia-gold' 
                          : 'bg-conectia-accent/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-conectia-accent/5 border-t border-conectia-accent/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="rounded-full w-10 h-10 text-conectia-accent hover:bg-conectia-accent/10"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="rounded-full w-10 h-10 text-conectia-accent hover:bg-conectia-accent/10"
                  disabled={isMuted}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="rounded-xl border-conectia-accent/20 text-conectia-accent hover:bg-conectia-accent/5 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="rounded-xl bg-conectia-primary hover:bg-conectia-primary/90 text-conectia-accent font-semibold"
                >
                  {currentStep === GUIDE_SPEECHES.length - 1 ? (
                    <>Finalizar</>
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
          </div>
        </div>
      )}
    </>
  )
}
