"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Sparkles, Globe, Navigation, Home, Building, User, Phone, HelpCircle } from "lucide-react"

interface Message {
  id: string
  type: "bot" | "user"
  content: string
  timestamp: Date
}

interface Language {
  code: string
  name: string
  flag: string
}

const LANGUAGES: Language[] = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
]

const NAVIGATION_OPTIONS = {
  es: [
    { label: "🏠 Ver Propiedades", action: "navigate", url: "/propiedades" },
    { label: "💼 Vender Propiedad", action: "navigate", url: "/propietarios" },
    { label: "📞 Llamar con IA", action: "call" },
    { label: "💚 WhatsApp Directo", action: "whatsapp" },
    { label: "❤️ Mis Favoritos", action: "navigate", url: "/favoritos" },
    { label: "🔐 Acceso Interno", action: "navigate", url: "/login" },
    { label: "ℹ️ Sobre CONECTIA", action: "navigate", url: "/empresa" },
    { label: "🌐 Cambiar Idioma", action: "language" },
  ],
  en: [
    { label: "🏠 View Properties", action: "navigate", url: "/propiedades" },
    { label: "💼 Sell Property", action: "navigate", url: "/propietarios" },
    { label: "📞 Call with AI", action: "call" },
    { label: "💚 WhatsApp Direct", action: "whatsapp" },
    { label: "❤️ My Favorites", action: "navigate", url: "/favoritos" },
    { label: "🔐 Internal Access", action: "navigate", url: "/login" },
    { label: "ℹ️ About CONECTIA", action: "navigate", url: "/empresa" },
    { label: "🌐 Change Language", action: "language" },
  ],
  fr: [
    { label: "🏠 Voir Propriétés", action: "navigate", url: "/propiedades" },
    { label: "💼 Vendre Propriété", action: "navigate", url: "/propietarios" },
    { label: "📞 Appeler avec IA", action: "call" },
    { label: "💚 WhatsApp Direct", action: "whatsapp" },
    { label: "❤️ Mes Favoris", action: "navigate", url: "/favoritos" },
    { label: "🔐 Accès Interne", action: "navigate", url: "/login" },
    { label: "ℹ️ À propos CONECTIA", action: "navigate", url: "/empresa" },
    { label: "🌐 Changer Langue", action: "language" },
  ],
}

const RESPONSES = {
  es: {
    welcome: "¡Hola! 👋 Soy tu asistente virtual 24/7 de CONECTIA. Estoy aquí para ayudarte a navegar por nuestra plataforma y resolver cualquier duda. ¿En qué puedo ayudarte?",
    help: "Puedo ayudarte con:\n• Navegar por las secciones de la página\n• Cambiar el idioma\n• Información sobre nuestros servicios\n• Contactar con nuestro equipo\n• Buscar propiedades",
    services: "CONECTIA ofrece:\n• Marketing Digital para tu propiedad\n• Tours Virtuales inmersivos\n• Valoración con IA\n• Proceso directo\n• Conexión directa entre compradores y vendedores",
    contact: "Puedes contactarnos:\n📧 conectiaselect@gmail.com\n📱 +52 1 477 475 6951 (WhatsApp)\n📍 León, Guanajuato\n\n¿Te gustaría que te redirija a WhatsApp para contacto directo?",
    navigation: "¿A dónde te gustaría ir?",
    languageChanged: "Idioma cambiado exitosamente. ¿En qué más puedo ayudarte?",
  },
  en: {
    welcome: "Hello! 👋 I'm your 24/7 virtual assistant from CONECTIA. I'm here to help you navigate our platform and answer any questions. How can I help you?",
    help: "I can help you with:\n• Navigate through page sections\n• Change language\n• Information about our services\n• Contact our team\n• Search properties",
    services: "CONECTIA offers:\n• Digital Marketing for your property\n• Immersive Virtual Tours\n• AI Valuation\n• Direct process\n• Direct connection between buyers and sellers",
    contact: "You can contact us:\n📧 conectiaselect@gmail.com\n📱 +52 1 477 475 6951 (WhatsApp)\n📍 León, Guanajuato\n\nWould you like me to redirect you to WhatsApp for direct contact?",
    navigation: "Where would you like to go?",
    languageChanged: "Language changed successfully. How else can I help you?",
  },
  fr: {
    welcome: "Bonjour! 👋 Je suis votre assistant virtuel 24/7 d'CONECTIA. Je suis là pour vous aider à naviguer sur notre plateforme et répondre à vos questions. Comment puis-je vous aider?",
    help: "Je peux vous aider avec:\n• Naviguer dans les sections de la page\n• Changer la langue\n• Informations sur nos services\n• Contacter notre équipe\n• Rechercher des propriétés",
    services: "CONECTIA offre:\n• Marketing Digital pour votre propriété\n• Visites Virtuelles immersives\n• Évaluation par IA\n• Processus direct\n• Connexion directe entre acheteurs et vendeurs",
    contact: "Vous pouvez nous contacter:\n📧 conectiaselect@gmail.com\n📱 +52 1 477 475 6951 (WhatsApp)\n📍 León, Guanajuato\n\nVoulez-vous que je vous redirige vers WhatsApp pour un contact direct?",
    navigation: "Où aimeriez-vous aller?",
    languageChanged: "Langue changée avec succès. Comment puis-je vous aider d'autre?",
  },
}

export function AIAgent() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof RESPONSES>("es")
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)

  const addMessage = (content: string, type: "bot" | "user") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const simulateTyping = (callback: () => void, delay = 1000) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      callback()
    }, delay)
  }

  const handleUserInput = (input: string) => {
    addMessage(input, "user")
    
    const lowerInput = input.toLowerCase()
    let response = ""

    // Intelligent response system
    if (lowerInput.includes("ayuda") || lowerInput.includes("help") || lowerInput.includes("aide")) {
      response = RESPONSES[currentLanguage].help
    } else if (lowerInput.includes("servicio") || lowerInput.includes("service") || lowerInput.includes("que ofrecen")) {
      response = RESPONSES[currentLanguage].services
    } else if (lowerInput.includes("contacto") || lowerInput.includes("contact") || lowerInput.includes("telefono") || lowerInput.includes("email") || lowerInput.includes("whatsapp")) {
      response = RESPONSES[currentLanguage].contact
    } else if (lowerInput.includes("idioma") || lowerInput.includes("language") || lowerInput.includes("langue")) {
      setShowLanguageSelector(true)
      response = "Selecciona tu idioma preferido:"
    } else if (lowerInput.includes("navegar") || lowerInput.includes("navigate") || lowerInput.includes("ir a") || lowerInput.includes("go to")) {
      response = RESPONSES[currentLanguage].navigation
    } else {
      // Default helpful response
      response = RESPONSES[currentLanguage].help
    }

    simulateTyping(() => {
      addMessage(response, "bot")
    })
  }

  const handleOptionClick = (option: any) => {
    addMessage(option.label, "user")

    if (option.action === "navigate") {
      simulateTyping(() => {
        addMessage(`Redirigiendo a ${option.label}...`, "bot")
        setTimeout(() => {
          window.location.href = option.url
        }, 1000)
      })
    } else if (option.action === "language") {
      setShowLanguageSelector(true)
      simulateTyping(() => {
        addMessage("Selecciona tu idioma preferido:", "bot")
      })
    } else if (option.action === "whatsapp") {
      simulateTyping(() => {
        addMessage("Te redirijo a WhatsApp para contacto directo...", "bot")
        setTimeout(() => {
          const whatsappUrl = "https://wa.me/5214774756951?text=Hola%20CONECTIA%20SELECT,%20me%20interesa%20obtener%20más%20información%20sobre%20sus%20servicios%20inmobiliarios."
          window.open(whatsappUrl, '_blank')
        }, 1000)
      })
    } else if (option.action === "call") {
      simulateTyping(() => {
        addMessage("Activando llamada con IA... Busca el botón de teléfono en la esquina inferior derecha para hablar directamente con nuestro asistente especializado.", "bot")
        // Trigger the call button (this could be enhanced to directly open the call widget)
        setTimeout(() => {
          const callButton = document.querySelector('[data-call-button]') as HTMLElement
          if (callButton) {
            callButton.click()
          }
        }, 1000)
      })
    }
  }

  const handleLanguageChange = (langCode: keyof typeof RESPONSES) => {
    setCurrentLanguage(langCode)
    setShowLanguageSelector(false)
    const selectedLang = LANGUAGES.find(lang => lang.code === langCode)
    addMessage(`${selectedLang?.flag} ${selectedLang?.name}`, "user")
    
    simulateTyping(() => {
      addMessage(RESPONSES[langCode].languageChanged, "bot")
    })
  }

  const initializeChat = () => {
    setIsOpen(true)
    if (messages.length === 0) {
      simulateTyping(() => {
        addMessage(RESPONSES[currentLanguage].welcome, "bot")
      }, 500)
    }
  }

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return
    handleUserInput(inputValue)
    setInputValue("")
  }

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <Button
          onClick={initializeChat}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-conectia-gold to-yellow-400 hover:from-yellow-400 hover:to-conectia-gold text-conectia-graphite shadow-2xl hover:shadow-conectia-gold/30 transition-all duration-300 z-50 hover:scale-110 transform group"
          size="lg"
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        </Button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <Card className="fixed bottom-0 right-0 sm:bottom-8 sm:right-8 w-full sm:w-[420px] h-[100dvh] sm:h-[650px] sm:max-h-[90vh] shadow-2xl border-0 z-50 flex flex-col overflow-hidden sm:rounded-3xl backdrop-blur-md bg-conectia-secondary/50/95">
          {/* Header */}
          <div className="bg-gradient-to-r from-conectia-graphite to-gray-900 text-white p-4 sm:p-6 flex items-center justify-between sm:rounded-t-3xl">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-conectia-gold to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-conectia-graphite" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-base sm:text-lg">Asistente CONECTIA</h3>
                <p className="text-xs sm:text-sm text-gray-300">{currentLanguage === "es" ? "Asistente 24/7 • Navegación" : currentLanguage === "en" ? "24/7 Assistant • Navigation" : "Assistant 24/7 • Navigation"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-conectia-accent/10 rounded-full w-9 h-9 sm:w-10 sm:h-10 transition-all duration-300 hover:scale-110"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] p-3 sm:p-4 rounded-2xl transition-all duration-300 ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-conectia-gold to-yellow-400 text-conectia-graphite shadow-lg"
                      : "bg-conectia-secondary/50 text-gray-800 shadow-md border border-gray-100"
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-conectia-secondary/50 p-4 rounded-2xl shadow-md border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-conectia-gold rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-conectia-gold rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-conectia-gold rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-6 bg-conectia-secondary/50 border-t border-gray-100">
            {!isTyping && (
              <div className="space-y-3 sm:space-y-4">
                {/* Language Selector */}
                {showLanguageSelector && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {LANGUAGES.map((lang) => (
                      <Button
                        key={lang.code}
                        variant="outline"
                        size="sm"
                        onClick={() => handleLanguageChange(lang.code as keyof typeof RESPONSES)}
                        className="text-[10px] sm:text-xs hover:bg-gradient-to-r hover:from-conectia-gold hover:to-yellow-400 hover:text-conectia-graphite hover:border-conectia-gold rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        {lang.flag} {lang.name}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Navigation Options */}
                {!showLanguageSelector && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-32 sm:max-h-none overflow-y-auto">
                    {NAVIGATION_OPTIONS[currentLanguage].map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleOptionClick(option)}
                        className="text-[10px] sm:text-xs hover:bg-gradient-to-r hover:from-conectia-gold hover:to-yellow-400 hover:text-conectia-graphite hover:border-conectia-gold rounded-full px-2 sm:px-3 py-1.5 sm:py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg whitespace-nowrap"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Text Input */}
                <div className="flex space-x-2 sm:space-x-3">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentLanguage === "es" ? "Escribe tu pregunta..." : currentLanguage === "en" ? "Type your question..." : "Tapez votre question..."}
                    onKeyPress={(e) => e.key === "Enter" && handleInputSubmit()}
                    className="flex-1 rounded-full border-gray-200 focus:border-conectia-gold focus:ring-conectia-gold/20 text-sm"
                  />
                  <Button
                    onClick={handleInputSubmit}
                    size="sm"
                    className="bg-gradient-to-r from-conectia-gold to-yellow-400 hover:from-yellow-400 hover:to-conectia-gold text-conectia-graphite rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 hover:scale-110 shadow-lg flex-shrink-0"
                  >
                    <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="p-2.5 sm:p-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">{currentLanguage === "es" ? "Asistente 24/7 activo" : currentLanguage === "en" ? "24/7 Assistant active" : "Assistant 24/7 actif"}</span>
                <span className="sm:hidden">{currentLanguage === "es" ? "Activo" : currentLanguage === "en" ? "Active" : "Actif"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="h-3 w-3" />
                <span>{LANGUAGES.find(lang => lang.code === currentLanguage)?.flag}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
