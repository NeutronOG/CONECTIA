"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Phone, X } from "lucide-react"
import { ConvAIWidget } from "./convai-widget"

export function CallButton() {
  const [isCallWidgetOpen, setIsCallWidgetOpen] = useState(false)

  return (
    <>
      {/* Call Button - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsCallWidgetOpen(!isCallWidgetOpen)}
          data-call-button
          className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
            isCallWidgetOpen 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-conectia-primary hover:bg-conectia-primary/90 text-conectia-accent'
          }`}
          size="sm"
        >
          {isCallWidgetOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Phone className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* ConvAI Widget Overlay */}
      {isCallWidgetOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm">
          <div className="fixed bottom-24 left-6 z-50">
            <div className="bg-conectia-secondary/50 rounded-2xl shadow-2xl p-4 border border-gray-200 w-80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Llamada con IA</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCallWidgetOpen(false)}
                  className="w-8 h-8 p-0 hover:bg-conectia-secondary"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Habla directamente con nuestro asistente de IA especializado en propiedades
              </p>
              <ConvAIWidget />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
