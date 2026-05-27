import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, Award, TrendingUp, Globe } from "lucide-react"
import Link from "next/link"

export default function EmpresaPage() {
  return (
    <div className="min-h-screen bg-[#17313A]">
      {/* Header */}
      <div className="pt-24 pb-16 text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-light text-[#EAE4DD] mb-6">Sobre CONECTIA</h1>
        <p className="text-xl text-[#B0ACA6] max-w-3xl mx-auto px-6">
          Redefiniendo el mercado inmobiliario de lujo con innovación y excelencia
        </p>
      </div>

      {/* Story Section */}
      <div className="max-w-4xl mx-auto px-6 mb-24">
        <Card className="p-12 rounded-3xl glass-card rounded-3xl">
          <h2 className="font-serif text-3xl font-semibold text-[#EAE4DD] mb-8 text-center">Nuestra Historia</h2>
          <div className="prose prose-lg max-w-none text-[#B0ACA6]">
            <p className="mb-6">
              CONECTIA nació de la visión de transformar completamente la experiencia de venta inmobiliaria. Fundada por
              expertos en bienes raíces de lujo, nuestra misión es simple: tratar cada propiedad como la obra maestra
              que es.
            </p>
            <p className="mb-6">
              En un mercado saturado de opciones, creemos en la exclusividad. Trabajamos con un número limitado de
              propiedades al año, garantizando que cada cliente reciba la atención personalizada y los resultados
              excepcionales que merece.
            </p>
            <p>
              Nuestra combinación única de tecnología avanzada, marketing inteligente y servicio premium nos ha
              posicionado como la inmobiliaria de referencia para propietarios que buscan algo más que una simple
              transacción.
            </p>
          </div>
        </Card>
      </div>

      {/* Values */}
      <div className="max-w-6xl mx-auto px-6 mb-24">
        <h2 className="font-serif text-4xl font-light text-[#EAE4DD] mb-16 text-center">Nuestros Valores</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-8 text-center rounded-3xl glass-card rounded-3xl">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C78F7B] to-[#D4987E] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#EAE4DD] mb-4">Excelencia</h3>
            <p className="text-gray-600">
              Cada detalle importa. Buscamos la perfección en cada aspecto de nuestro servicio.
            </p>
          </Card>

          <Card className="p-8 text-center rounded-3xl glass-card rounded-3xl">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C78F7B] to-[#D4987E] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#EAE4DD] mb-4">Exclusividad</h3>
            <p className="text-gray-600">
              Limitamos nuestro portafolio para garantizar atención personalizada y resultados únicos.
            </p>
          </Card>

          <Card className="p-8 text-center rounded-3xl glass-card rounded-3xl">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C78F7B] to-[#D4987E] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#EAE4DD] mb-4">Innovación</h3>
            <p className="text-gray-600">
              Utilizamos la última tecnología e IA para maximizar el potencial de cada propiedad.
            </p>
          </Card>

          <Card className="p-8 text-center rounded-3xl glass-card rounded-3xl">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C78F7B] to-[#D4987E] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#EAE4DD] mb-4">Transparencia</h3>
            <p className="text-gray-600">Comunicación clara y honesta en cada paso del proceso de venta.</p>
          </Card>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-6xl mx-auto px-6 mb-24">
        <h2 className="font-serif text-4xl font-light text-[#EAE4DD] mb-16 text-center">Nuestro Equipo</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 text-center rounded-3xl glass-card rounded-3xl">
            <div className="w-24 h-24 bg-gradient-to-br from-[#C78F7B] to-[#D4987E] rounded-full mx-auto mb-6"></div>
            <h3 className="font-serif text-xl font-semibold text-[#EAE4DD] mb-2">Elena Martínez</h3>
            <p className="text-[#C78F7B] font-medium mb-4">CEO & Fundadora</p>
            <p className="text-gray-600 text-sm">
              15 años de experiencia en bienes raíces de lujo. Especialista en propiedades premium.
            </p>
          </Card>

          <Card className="p-8 text-center rounded-3xl glass-card rounded-3xl">
            <div className="w-24 h-24 bg-gradient-to-br from-[#C78F7B] to-[#D4987E] rounded-full mx-auto mb-6"></div>
            <h3 className="font-serif text-xl font-semibold text-[#EAE4DD] mb-2">Carlos Ruiz</h3>
            <p className="text-[#C78F7B] font-medium mb-4">Director de Marketing</p>
            <p className="text-gray-600 text-sm">
              Experto en marketing digital y estrategias de IA para el sector inmobiliario.
            </p>
          </Card>

          <Card className="p-8 text-center rounded-3xl glass-card rounded-3xl">
            <div className="w-24 h-24 bg-gradient-to-br from-[#C78F7B] to-[#D4987E] rounded-full mx-auto mb-6"></div>
            <h3 className="font-serif text-xl font-semibold text-[#EAE4DD] mb-2">Ana López</h3>
            <p className="text-[#C78F7B] font-medium mb-4">Directora de Operaciones</p>
            <p className="text-gray-600 text-sm">
              Gestión de procesos y experiencia del cliente. Garantiza la excelencia operativa.
            </p>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-24">
        <Link href="/propietarios">
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#C78F7B] to-[#D4987E] hover:from-[#D4987E] hover:to-[#C78F7B] text-[#EAE4DD] font-semibold px-12 py-6 text-lg rounded-2xl"
          >
            Conoce Más Sobre Nosotros
          </Button>
        </Link>
      </div>
    </div>
  )
}
