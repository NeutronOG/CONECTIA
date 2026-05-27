"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Lock, Shield, Phone, Mail } from "lucide-react"
import { usePropertiesStatic } from "@/hooks/use-properties-static"

export default function ExclusivosPage() {
  // Hook optimizado - carga instantánea desde JSON + realtime
  const { properties } = usePropertiesStatic()
  const propiedades = useMemo(() => 
    properties.filter(p => p.categoria === 'exclusivo'), 
    [properties]
  )

  const ejemplos = [
    { id: 9001, titulo: 'Residencia Exclusiva', ubicacion: 'Lomas de Querétaro, Querétaro', tipo: 'Casa', imagen: '', categoria: 'exclusivo' },
    { id: 9002, titulo: 'Penthouse de Lujo', ubicacion: 'Jurica, Querétaro', tipo: 'Departamento', imagen: '', categoria: 'exclusivo' },
  ]

  const propiedadesDisplay = propiedades.length > 0 ? propiedades : ejemplos

  const handleContacto = (ubicacion: string) => {
    const mensaje = `Hola, estoy interesado en una propiedad exclusiva en ${ubicacion}. Me gustaría recibir más información.`
    const whatsappUrl = `https://wa.me/5214774756951?text=${encodeURIComponent(mensaje)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-conectia-secondary transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[320px] sm:min-h-[420px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://mnrfsdrjadretxesjxhu.supabase.co/storage/v1/object/sign/conectia/hf_20260219_015208_b75495b2-1016-45df-a1f8-d1160006831b.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZTg2NjJkMS1lZjIzLTRkZjUtYjAwYy04NjVkOTcwYzljZWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcmtpbi9oZl8yMDI2MDIxOV8wMTUyMDhfYjc1NDk1YjItMTAxNi00NWRmLWExZjgtZDExNjAwMDY4MzFiLmpwZWciLCJpYXQiOjE3NzE0NjYyNTQsImV4cCI6MTgwMzAwMjI1NH0.0ew5z0WbvUkHQAwo8zOlhQFyLokmh2PKTqjqBtpxcuc')" }}
        />
        <div className="absolute inset-0 bg-[#17313A]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F2027]/60 via-[#17313A]/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24 flex items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-conectia-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-conectia-accent" />
              </div>
              <span className="text-conectia-primary text-sm font-semibold uppercase tracking-widest">Conectia Select</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4">
              Propiedades<br/>
              <span className="text-conectia-primary">Exclusivas</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-6 leading-relaxed">
              Propiedades de máxima privacidad. Por discreción, solo mostramos ubicaciones generales
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-conectia-primary text-conectia-accent border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                {propiedadesDisplay.length} Propiedades Disponibles
              </Badge>
              <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm flex items-center gap-2 backdrop-blur-sm">
                <Lock className="h-3 w-3" />
                Información Protegida
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-conectia-primary/10 to-conectia-primary/5 border border-conectia-primary/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-conectia-primary" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-conectia-accent mb-2">
                  Protección de Privacidad
                </h3>
                <p className="text-conectia-accent/70 text-sm leading-relaxed">
                  Estas propiedades pertenecen a clientes que requieren máxima discreción. Por respeto a su privacidad, 
                  solo mostramos la ubicación general. Para obtener información completa, fotos y detalles específicos, 
                  contáctanos directamente. Verificaremos tu perfil antes de compartir información sensible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid - Solo Ubicación */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propiedadesDisplay.map((propiedad) => (
              <div
                key={propiedad.id}
                className="group bg-conectia-secondary/50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-conectia-primary/20"
              >
                {/* Blurred Image with Lock */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-conectia-accent/10 to-conectia-accent/5">
                  <img
                    src={propiedad.imagen || "/placeholder.svg"}
                    alt="Propiedad exclusiva"
                    className="w-full h-full object-cover blur-2xl opacity-30"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-conectia-primary rounded-full mb-3">
                        <Lock className="h-8 w-8 text-conectia-accent" />
                      </div>
                      <p className="text-conectia-accent font-semibold">Información Protegida</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-conectia-primary/90 text-conectia-accent backdrop-blur-sm text-xs">
                      Exclusiva
                    </Badge>
                  </div>
                </div>

                {/* Content - Solo Ubicación */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-conectia-accent/10 text-conectia-accent text-xs">{propiedad.tipo}</Badge>
                    <Badge className="bg-conectia-primary/10 text-conectia-primary text-xs flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Privada
                    </Badge>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-conectia-accent mb-4">
                    Propiedad Exclusiva
                  </h3>

                  {/* Solo Ubicación Visible */}
                  <div className="bg-conectia-primary/5 border border-conectia-primary/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center text-conectia-accent mb-2">
                      <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-conectia-primary" />
                      <span className="text-base font-semibold">{propiedad.ubicacion}</span>
                    </div>
                    <p className="text-conectia-accent/60 text-xs ml-7">
                      Ubicación general por privacidad del propietario
                    </p>
                  </div>

                  {/* Información Oculta */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm text-conectia-accent/40">
                      <span>Precio:</span>
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Confidencial
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-conectia-accent/40">
                      <span>Detalles:</span>
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Bajo solicitud
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-conectia-accent/40">
                      <span>Fotografías:</span>
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Previa verificación
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => handleContacto(propiedad.ubicacion)}
                    className="w-full bg-conectia-primary hover:bg-conectia-primary/90 text-conectia-accent rounded-xl font-semibold"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Solicitar Información
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {propiedadesDisplay.length === 0 && (
            <div className="text-center py-16">
              <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-conectia-accent mb-2">No hay propiedades exclusivas disponibles</h3>
              <p className="text-conectia-accent/60 mb-6">Vuelve pronto para ver nuevas propiedades</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-conectia-accent via-[#17313A] to-conectia-accent">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-12 w-12 mx-auto mb-6 text-conectia-primary" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Máxima Discreción Garantizada
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Contáctanos para recibir información completa de estas propiedades exclusivas. 
            Verificamos cada solicitud para proteger la privacidad de nuestros clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.open('https://wa.me/5214774756951', '_blank')}
              className="bg-conectia-primary hover:bg-conectia-primary/90 text-conectia-accent px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg"
            >
              <Phone className="h-5 w-5 mr-2" />
              WhatsApp
            </Button>
            <Button 
              onClick={() => window.location.href = 'mailto:conectiaselect@gmail.com'}
              variant="outline"
              className="border-conectia-primary text-conectia-primary hover:bg-conectia-primary hover:text-conectia-accent px-8 py-4 text-lg font-semibold rounded-2xl"
            >
              <Mail className="h-5 w-5 mr-2" />
              Email
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
