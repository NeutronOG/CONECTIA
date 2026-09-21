"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, Award, TrendingUp, Globe } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n"

export default function EmpresaPage() {
  const { language } = useLanguage()
  const en = language === "en"
  const values = en ? [
    [Award, "Excellence", "Every detail matters. We pursue excellence in every aspect of our service."],
    [Users, "Exclusivity", "We keep our portfolio intentionally focused to provide personal attention and exceptional results."],
    [TrendingUp, "Innovation", "We use advanced technology and AI to unlock each property's full potential."],
    [Globe, "Transparency", "Clear, honest communication at every stage of the sales process."],
  ] as const : [
    [Award, "Excelencia", "Cada detalle importa. Buscamos la perfección en cada aspecto de nuestro servicio."],
    [Users, "Exclusividad", "Limitamos nuestro portafolio para garantizar atención personalizada y resultados únicos."],
    [TrendingUp, "Innovación", "Utilizamos la última tecnología e IA para maximizar el potencial de cada propiedad."],
    [Globe, "Transparencia", "Comunicación clara y honesta en cada paso del proceso de venta."],
  ] as const
  const team = en ? [
    ["Elena Martínez", "Founder & CEO", "15 years of experience in luxury real estate, specializing in exceptional properties."],
    ["Carlos Ruiz", "Marketing Director", "An expert in digital marketing and AI-powered strategies for the real-estate market."],
    ["Ana López", "Operations Director", "Focused on process management and client experience, ensuring operational excellence."],
  ] : [
    ["Elena Martínez", "CEO & Fundadora", "15 años de experiencia en bienes raíces de lujo. Especialista en propiedades exclusivas."],
    ["Carlos Ruiz", "Director de Marketing", "Experto en marketing digital y estrategias de IA para el sector inmobiliario."],
    ["Ana López", "Directora de Operaciones", "Gestión de procesos y experiencia del cliente. Garantiza la excelencia operativa."],
  ]

  return (
    <div className="min-h-screen bg-[#F6F2EE] dark:bg-[#17313A]">
      <div className="pt-24 pb-16 text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-light text-[#17313A] dark:text-[#EAE4DD] mb-6">{en ? "About CONECTIA" : "Sobre CONECTIA"}</h1>
        <p className="text-xl text-[#4A4F57] dark:text-[#B0ACA6] max-w-3xl mx-auto px-6">{en ? "Redefining luxury real estate through innovation and excellence" : "Redefiniendo el mercado inmobiliario de lujo con innovación y excelencia"}</p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mb-24">
        <Card className="p-12 rounded-3xl glass-card">
          <h2 className="font-serif text-3xl font-semibold text-[#17313A] dark:text-[#EAE4DD] mb-8 text-center">{en ? "Our Story" : "Nuestra historia"}</h2>
          <div className="prose prose-lg max-w-none text-[#4A4F57] dark:text-[#B0ACA6]">
            <p className="mb-6">{en ? "CONECTIA was born from a vision to transform the real-estate sales experience. Founded by luxury property experts, our mission is simple: to treat every property as the masterpiece it is." : "CONECTIA nació de la visión de transformar completamente la experiencia de venta inmobiliaria. Fundada por expertos en bienes raíces de lujo, nuestra misión es simple: tratar cada propiedad como la obra maestra que es."}</p>
            <p className="mb-6">{en ? "In a crowded market, we believe in being selective. We represent a limited number of properties each year so every client receives personal attention and the exceptional results they deserve." : "En un mercado saturado de opciones, creemos en la exclusividad. Trabajamos con un número limitado de propiedades al año, garantizando que cada cliente reciba la atención personalizada y los resultados excepcionales que merece."}</p>
            <p>{en ? "Our unique combination of advanced technology, intelligent marketing, and highly personal service has made us the trusted choice for owners looking for more than a transaction." : "Nuestra combinación única de tecnología avanzada, marketing inteligente y servicio exclusivo nos ha posicionado como la inmobiliaria de referencia para propietarios que buscan algo más que una simple transacción."}</p>
          </div>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto px-6 mb-24">
        <h2 className="font-serif text-4xl font-light text-[#17313A] dark:text-[#EAE4DD] mb-16 text-center">{en ? "Our Values" : "Nuestros valores"}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map(([Icon, title, text]) => <Card key={title} className="p-8 text-center rounded-3xl glass-card">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--conectia-arcilla)] to-[var(--conectia-arcilla-hover)] rounded-2xl flex items-center justify-center mx-auto mb-6"><Icon className="h-8 w-8 text-white" /></div>
            <h3 className="font-serif text-xl font-semibold text-[#17313A] dark:text-[#EAE4DD] mb-4">{title}</h3>
            <p className="text-[#4A4F57] dark:text-gray-400">{text}</p>
          </Card>)}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mb-24">
        <h2 className="font-serif text-4xl font-light text-[#17313A] dark:text-[#EAE4DD] mb-16 text-center">{en ? "Our Team" : "Nuestro equipo"}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map(([name, role, bio]) => <Card key={name} className="p-8 text-center rounded-3xl glass-card">
            <div className="w-24 h-24 bg-gradient-to-br from-[var(--conectia-arcilla)] to-[var(--conectia-arcilla-hover)] rounded-full mx-auto mb-6" />
            <h3 className="font-serif text-xl font-semibold text-[#17313A] dark:text-[#EAE4DD] mb-2">{name}</h3>
            <p className="text-[var(--conectia-arcilla)] font-medium mb-4">{role}</p>
            <p className="text-[#4A4F57] dark:text-gray-400 text-sm">{bio}</p>
          </Card>)}
        </div>
      </div>

      <div className="text-center pb-24"><Link href="/propietarios"><Button size="lg" className="bg-gradient-to-r from-[var(--conectia-arcilla)] to-[var(--conectia-arcilla-hover)] text-white font-semibold px-12 py-6 text-lg rounded-2xl">{en ? "Learn More About Us" : "Conoce más sobre nosotros"}</Button></Link></div>
    </div>
  )
}
