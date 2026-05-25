import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Star, Users, Zap, Eye, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ServiciosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 text-center px-4">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-conectia-graphite mb-4 sm:mb-6">
          Nuestros Servicios
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-6">
          Servicios premium diseñados para maximizar el valor de tu propiedad
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Card className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-0 bg-conectia-secondary/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-conectia-gold to-yellow-400 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-conectia-graphite mb-3 sm:mb-4">
              Venta Exclusiva
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              Representación exclusiva de tu propiedad con atención personalizada y estrategia de marketing única.
            </p>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li>• Contrato de exclusividad</li>
              <li>• Estrategia personalizada</li>
              <li>• Seguimiento continuo</li>
            </ul>
          </Card>

          <Card className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-0 bg-conectia-secondary/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-conectia-gold to-yellow-400 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-conectia-graphite mb-3 sm:mb-4">
              Asesoría Premium
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              Consultoría especializada en propiedades de lujo con análisis de mercado y recomendaciones estratégicas.
            </p>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li>• Análisis de mercado</li>
              <li>• Valoración profesional</li>
              <li>• Optimización de precio</li>
            </ul>
          </Card>

          <Card className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-0 bg-conectia-secondary/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-conectia-gold to-yellow-400 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-conectia-graphite mb-3 sm:mb-4">
              Marketing Digital
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              Campañas digitales avanzadas con IA para llegar a compradores calificados en el momento perfecto.
            </p>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li>• Campañas Meta & Google</li>
              <li>• Targeting inteligente</li>
              <li>• Analytics avanzados</li>
            </ul>
          </Card>

          <Card className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-0 bg-conectia-secondary/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-conectia-gold to-yellow-400 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-conectia-graphite mb-3 sm:mb-4">
              Tours Virtuales
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              Experiencias inmersivas en VR y 360° que permiten a los compradores explorar tu propiedad desde cualquier
              lugar.
            </p>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li>• Tours VR inmersivos</li>
              <li>• Fotografía 360°</li>
              <li>• Recorridos interactivos</li>
            </ul>
          </Card>

          <Card className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-0 bg-conectia-secondary/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-conectia-gold to-yellow-400 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-conectia-graphite mb-3 sm:mb-4">
              Valoración IA
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              Inteligencia artificial avanzada para predicción de demanda y valoración precisa basada en datos del
              mercado.
            </p>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li>• Predicción de demanda</li>
              <li>• Análisis comparativo</li>
              <li>• Tendencias de mercado</li>
            </ul>
          </Card>

          <Card className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-0 bg-conectia-secondary/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-conectia-gold to-yellow-400 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-conectia-graphite mb-3 sm:mb-4">
              Red Exclusiva
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              Acceso a nuestra red privada de compradores pre-calificados y inversores de alto patrimonio.
            </p>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li>• Compradores calificados</li>
              <li>• Red de inversores</li>
              <li>• Matching inteligente</li>
            </ul>
          </Card>
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <Link href="/propietarios">
            <Button
              size="lg"
              className="bg-gradient-to-r from-conectia-gold to-yellow-400 hover:from-yellow-400 hover:to-conectia-gold text-conectia-graphite font-semibold px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg rounded-xl sm:rounded-2xl w-full sm:w-auto"
            >
              Solicitar Consulta Gratuita
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
