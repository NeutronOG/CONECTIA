"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Star, Users, Zap, Eye, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n"

export default function ServiciosPage() {
  const { language } = useLanguage()
  const en = language === "en"
  const services = en ? [
    [Shield, "Exclusive Representation", "Dedicated representation with personal attention and a tailored marketing strategy.", ["Exclusive representation agreement", "Tailored strategy", "Ongoing guidance"]],
    [Star, "Private Advisory", "Specialist guidance for luxury properties, backed by market analysis and strategic recommendations.", ["Market analysis", "Professional valuation", "Pricing strategy"]],
    [TrendingUp, "Digital Marketing", "AI-powered campaigns designed to reach qualified buyers at exactly the right time.", ["Meta and Google campaigns", "Intelligent targeting", "Advanced analytics"]],
    [Eye, "Virtual Tours", "Immersive VR and 360° experiences that let buyers explore your property from anywhere.", ["Immersive VR tours", "360° photography", "Interactive walkthroughs"]],
    [Zap, "AI Valuation", "Advanced artificial intelligence for demand forecasting and accurate, market-based valuations.", ["Demand forecasting", "Comparable-market analysis", "Market trends"]],
    [Users, "Private Network", "Access to our private network of pre-qualified buyers and high-net-worth investors.", ["Qualified buyers", "Investor network", "Intelligent matching"]],
  ] as const : [
    [Shield, "Venta exclusiva", "Representación exclusiva de tu propiedad con atención personalizada y estrategia de marketing única.", ["Contrato de exclusividad", "Estrategia personalizada", "Seguimiento continuo"]],
    [Star, "Asesoría exclusiva", "Consultoría especializada en propiedades de lujo con análisis de mercado y recomendaciones estratégicas.", ["Análisis de mercado", "Valoración profesional", "Optimización de precio"]],
    [TrendingUp, "Marketing digital", "Campañas digitales avanzadas con IA para llegar a compradores calificados en el momento perfecto.", ["Campañas Meta y Google", "Targeting inteligente", "Analytics avanzados"]],
    [Eye, "Tours virtuales", "Experiencias inmersivas en VR y 360° que permiten a los compradores explorar tu propiedad desde cualquier lugar.", ["Tours VR inmersivos", "Fotografía 360°", "Recorridos interactivos"]],
    [Zap, "Valoración IA", "Inteligencia artificial avanzada para predicción de demanda y valoración precisa basada en datos del mercado.", ["Predicción de demanda", "Análisis comparativo", "Tendencias de mercado"]],
    [Users, "Red exclusiva", "Acceso a nuestra red privada de compradores precalificados e inversores de alto patrimonio.", ["Compradores calificados", "Red de inversores", "Matching inteligente"]],
  ] as const

  return <div className="min-h-screen bg-[#F6F2EE] dark:bg-[#17313A]">
    <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 text-center px-4">
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-[#17313A] dark:text-[#EAE4DD] mb-4 sm:mb-6">{en ? "Our Services" : "Nuestros servicios"}</h1>
      <p className="text-lg sm:text-xl text-[#4A4F57] dark:text-[#B0ACA6] max-w-3xl mx-auto px-2 sm:px-6">{en ? "Exceptional services designed to maximize your property's value" : "Servicios exclusivos diseñados para maximizar el valor de tu propiedad"}</p>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {services.map(([Icon, title, description, benefits]) => <Card key={title} className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl glass-card">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[var(--conectia-arcilla)] to-[var(--conectia-arcilla-hover)] rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6"><Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" /></div>
          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#17313A] dark:text-[#EAE4DD] mb-3 sm:mb-4">{title}</h3>
          <p className="text-[#4A4F57] dark:text-gray-400 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">{description}</p>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-[#4A4F57] dark:text-[#B0ACA6]">{benefits.map(benefit => <li key={benefit}>• {benefit}</li>)}</ul>
        </Card>)}
      </div>
      <div className="text-center mt-12 sm:mt-16"><Link href="/propietarios"><Button size="lg" className="bg-gradient-to-r from-[var(--conectia-arcilla)] to-[var(--conectia-arcilla-hover)] text-white font-semibold px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg rounded-xl sm:rounded-2xl w-full sm:w-auto">{en ? "Request a Free Consultation" : "Solicitar consulta gratuita"}</Button></Link></div>
    </div>
  </div>
}
