'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Calendar, Zap } from "lucide-react"

export function ContactoYellow() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipo: '',
    mensaje: ''
  })

  return (
    <div className="min-h-screen bg-[#0F2027] relative overflow-hidden">
      {/* Geometric Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C78F7B]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#17313A]/80 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#C78F7B]/5 rounded-full blur-[80px]" />
      </div>

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C78F7B]/10 border border-[#C78F7B]/25 rounded-full mb-6">
            <Zap className="h-4 w-4 text-[#C78F7B]" />
            <span className="text-[10px] font-bold text-[#C78F7B] uppercase tracking-[0.3em]">
              Respuesta Inmediata
            </span>
          </div>
          
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-3 leading-tight">
            Hablemos
          </h1>
          <h2 className="text-xl sm:text-2xl bg-gradient-to-r from-[#C78F7B] to-[#E8A88F] bg-clip-text text-transparent font-bold mb-4">
            de tu propiedad
          </h2>
          <p className="text-base sm:text-lg text-[#B0ACA6] max-w-xl">
            Tu próxima gran decisión inmobiliaria comienza aquí.
          </p>
        </div>
      </section>

      {/* Main Content - Split Screen */}
      <section className="relative py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Contact Form */}
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-4xl font-black text-white mb-4">
                  ENVÍA TU MENSAJE
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#C78F7B] to-[#E8A88F] rounded-full" />
              </div>

              <Card className="p-6 sm:p-8 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#EAE4DD] uppercase tracking-wide">
                        Nombre
                      </label>
                      <Input 
                        className="rounded-xl border border-white/15 focus:border-[#C78F7B] bg-white/5 h-11 font-medium text-white placeholder:text-[#4A4F57]"
                        placeholder="Juan"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#EAE4DD] uppercase tracking-wide">
                        Apellido
                      </label>
                      <Input 
                      className="rounded-xl border border-white/15 focus:border-[#C78F7B] bg-white/5 h-11 font-medium text-white placeholder:text-[#4A4F57]"
                      placeholder="Pérez"
                    />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#EAE4DD] uppercase tracking-wide">
                      Email
                    </label>
                    <Input 
                    type="email"
                    className="rounded-xl border border-white/15 focus:border-[#C78F7B] bg-white/5 h-11 font-medium text-white placeholder:text-[#4A4F57]"
                    placeholder="juan@email.com"
                  />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#EAE4DD] uppercase tracking-wide">
                      Teléfono
                    </label>
                    <Input 
                    type="tel"
                    className="rounded-xl border border-white/15 focus:border-[#C78F7B] bg-white/5 h-11 font-medium text-white placeholder:text-[#4A4F57]"
                    placeholder="+52 477 123 4567"
                  />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#EAE4DD] uppercase tracking-wide">
                      Tipo de Consulta
                    </label>
                    <select className="w-full px-4 h-11 rounded-xl border border-white/15 focus:border-[#C78F7B] focus:outline-none bg-white/5 font-medium text-[#EAE4DD]">
                      <option className="bg-[#0F2027] text-white">Vender mi propiedad</option>
                      <option className="bg-[#0F2027] text-white">Rentar mi propiedad</option>
                      <option className="bg-[#0F2027] text-white">Comprar propiedad</option>
                      <option className="bg-[#0F2027] text-white">Consulta general</option>
                      <option className="bg-[#0F2027] text-white">Información sobre servicios</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#EAE4DD] uppercase tracking-wide">
                      Mensaje
                    </label>
                    <Textarea 
                    rows={5}
                    className="rounded-xl border border-white/15 focus:border-[#C78F7B] bg-white/5 resize-none font-medium text-white placeholder:text-[#4A4F57]"
                    placeholder="Cuéntanos sobre tu propiedad o consulta..."
                  />
                  </div>

                  <Button className="w-full bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] font-bold py-5 rounded-xl text-base shadow-lg shadow-[#C78F7B]/20">
                    <Send className="h-5 w-5 mr-2" />
                    ENVIAR MENSAJE
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right - Contact Info Cards */}
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-4xl font-black text-white mb-4">
                  CONTÁCTANOS
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#C78F7B] to-[#E8A88F] rounded-full" />
              </div>

              {/* Contact Cards */}
              <div className="grid gap-4">
                <Card className="p-5 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/[0.06] hover:border-[#C78F7B]/30 transition-all duration-300 shadow-lg group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#C78F7B]/15 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#C78F7B]/25 transition-colors">
                      <MapPin className="h-5 w-5 text-[#C78F7B]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#EAE4DD] text-sm mb-1 uppercase tracking-wider">Oficina Principal</h3>
                      <p className="text-[#B0ACA6] text-sm">
                        León, Guanajuato<br />
                        México
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/[0.06] hover:border-[#C78F7B]/30 transition-all duration-300 shadow-lg group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#C78F7B]/15 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#C78F7B]/25 transition-colors">
                      <Phone className="h-5 w-5 text-[#C78F7B]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#EAE4DD] text-sm mb-1 uppercase tracking-wider">Teléfono</h3>
                      <p className="text-[#B0ACA6] text-sm">+52 1 477 475 6951</p>
                      <p className="text-[#4A4F57] text-xs mt-0.5">WhatsApp disponible</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/[0.06] hover:border-[#C78F7B]/30 transition-all duration-300 shadow-lg group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#C78F7B]/15 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#C78F7B]/25 transition-colors">
                      <Mail className="h-5 w-5 text-[#C78F7B]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#EAE4DD] text-sm mb-1 uppercase tracking-wider">Email</h3>
                      <p className="text-[#B0ACA6] text-sm">conectia@gmail.com</p>
                      <p className="text-[#4A4F57] text-xs mt-0.5">Respuesta en 24h</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/[0.06] hover:border-[#C78F7B]/30 transition-all duration-300 shadow-lg group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#C78F7B]/15 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#C78F7B]/25 transition-colors">
                      <Clock className="h-5 w-5 text-[#C78F7B]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#EAE4DD] text-sm mb-1 uppercase tracking-wider">Horario</h3>
                      <p className="text-[#B0ACA6] text-sm">
                        Lun - Vie: 9:00 - 19:00<br />
                        Sábados: 10:00 - 14:00
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-7 bg-gradient-to-br from-[#C78F7B] to-[#B57A66] border-0 rounded-2xl shadow-2xl shadow-[#C78F7B]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="relative space-y-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-semibold">Consulta Gratuita</span>
                    <h3 className="font-serif text-xl font-black text-white mt-1">
                      ¿Listo para vender?
                    </h3>
                    <p className="text-white/70 text-sm mt-2">
                      Agenda una consulta gratuita y maximiza el valor de tu propiedad
                    </p>
                  </div>
                  <Button className="w-full bg-white hover:bg-white/90 text-[#0F2027] font-bold py-4 rounded-xl">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Consulta
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
