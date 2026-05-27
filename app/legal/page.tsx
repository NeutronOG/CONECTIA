import { Card } from "@/components/ui/card"

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#17313A]">
      {/* Header */}
      <div className="pt-24 pb-16 text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-light text-[#EAE4DD] mb-6">Información Legal</h1>
        <p className="text-xl text-[#B0ACA6] max-w-3xl mx-auto px-6">
          Transparencia y cumplimiento en todos nuestros procesos
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-24 space-y-8">
        {/* Privacy Policy */}
        <Card className="p-8 rounded-3xl glass-card rounded-3xl">
          <h2 className="font-serif text-3xl font-semibold text-[#EAE4DD] mb-6">Política de Privacidad</h2>
          <div className="prose prose-gray max-w-none">
            <p className="mb-4">
              En CONECTIA, protegemos tu privacidad y datos personales conforme al Reglamento General de Protección de
              Datos (RGPD).
            </p>
            <h3 className="text-xl font-semibold text-[#EAE4DD] mt-6 mb-3">Datos que recopilamos</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Información de contacto (nombre, email, teléfono)</li>
              <li>Detalles de la propiedad</li>
              <li>Preferencias de comunicación</li>
              <li>Datos de navegación web</li>
            </ul>
            <h3 className="text-xl font-semibold text-[#EAE4DD] mt-6 mb-3">Uso de los datos</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Prestación de servicios inmobiliarios</li>
              <li>Comunicación sobre tu propiedad</li>
              <li>Mejora de nuestros servicios</li>
              <li>Cumplimiento de obligaciones legales</li>
            </ul>
          </div>
        </Card>

        {/* Terms of Use */}
        <Card className="p-8 rounded-3xl glass-card rounded-3xl">
          <h2 className="font-serif text-3xl font-semibold text-[#EAE4DD] mb-6">Términos de Uso</h2>
          <div className="prose prose-gray max-w-none">
            <h3 className="text-xl font-semibold text-[#EAE4DD] mt-6 mb-3">Servicios</h3>
            <p className="mb-4">
              CONECTIA proporciona servicios de intermediación inmobiliaria exclusiva para propiedades de lujo.
            </p>
            <h3 className="text-xl font-semibold text-[#EAE4DD] mt-6 mb-3">Responsabilidades del cliente</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Proporcionar información veraz sobre la propiedad</li>
              <li>Cumplir con los términos del contrato de exclusividad</li>
              <li>Colaborar en el proceso de venta</li>
            </ul>
            <h3 className="text-xl font-semibold text-[#EAE4DD] mt-6 mb-3">Limitación de responsabilidad</h3>
            <p className="mb-4">
              CONECTIA actúa como intermediario y no garantiza la venta en un plazo específico, aunque nos comprometemos a
              usar nuestros mejores esfuerzos.
            </p>
          </div>
        </Card>

        {/* Cookies Policy */}
        <Card className="p-8 rounded-3xl glass-card rounded-3xl">
          <h2 className="font-serif text-3xl font-semibold text-[#EAE4DD] mb-6">Política de Cookies</h2>
          <div className="prose prose-gray max-w-none">
            <p className="mb-4">
              Utilizamos cookies para mejorar tu experiencia en nuestro sitio web y proporcionar servicios
              personalizados.
            </p>
            <h3 className="text-xl font-semibold text-[#EAE4DD] mt-6 mb-3">Tipos de cookies</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Esenciales:</strong> Necesarias para el funcionamiento del sitio
              </li>
              <li>
                <strong>Analíticas:</strong> Para entender cómo usas nuestro sitio
              </li>
              <li>
                <strong>Marketing:</strong> Para personalizar anuncios y contenido
              </li>
              <li>
                <strong>Funcionales:</strong> Para recordar tus preferencias
              </li>
            </ul>
            <h3 className="text-xl font-semibold text-[#EAE4DD] mt-6 mb-3">Control de cookies</h3>
            <p className="mb-4">
              Puedes gestionar tus preferencias de cookies en cualquier momento a través de la configuración de tu
              navegador.
            </p>
          </div>
        </Card>

        {/* Contact for Legal */}
        <Card className="p-8 rounded-3xl border-0 bg-gradient-to-br from-conectia-graphite to-gray-900 text-white shadow-xl">
          <h2 className="font-serif text-3xl font-semibold mb-6">Contacto Legal</h2>
          <p className="text-gray-300 mb-4">
            Para consultas sobre privacidad, términos de uso o cualquier asunto legal:
          </p>
          <div className="space-y-2">
            <p>
              <strong>Email:</strong> legal@conectia.es
            </p>
            <p>
              <strong>Dirección:</strong> Calle Serrano 123, 28006 Madrid, España
            </p>
            <p>
              <strong>Registro Mercantil:</strong> Madrid, Tomo 12345, Folio 67, Hoja M-123456
            </p>
            <p>
              <strong>CIF:</strong> B-12345678
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
