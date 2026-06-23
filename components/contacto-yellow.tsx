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
    <div className="min-h-screen bg-gradient-light relative overflow-hidden">
      {/* Orbs decorativos glassmorphism */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#17313A]/10 dark:bg-[#C78F7B]/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#17313A]/30 dark:bg-[#17313A]/30 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#17313A]/5 dark:bg-[#C78F7B]/5 rounded-full blur-[80px]" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#17313A]/20 dark:bg-[#17313A]/20 rounded-full blur-[60px]" />
      </div>

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#17313A]/10 dark:bg-[#C78F7B]/10 border border-[#17313A]/25 dark:border-[#C78F7B]/25 rounded-full mb-6">
            <Zap className="h-4 w-4 text-[#17313A] dark:text-[#C78F7B]" />
            <span className="text-[10px] font-bold text-[#17313A] dark:text-[#C78F7B] uppercase tracking-[0.3em]">
              Respuesta Inmediata
            </span>
          </div>
          
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black text-[#17313A] dark:text-[#EAE4DD] mb-3 leading-tight">
            Hablemos
          </h1>
          <h2 className="text-xl sm:text-2xl bg-gradient-to-r from-[#17313A] to-[#E8A88F] dark:from-[#C78F7B] dark:to-[#E8A88F] bg-clip-text text-transparent font-bold mb-4">
            de tu propiedad
          </h2>
          <p className="text-base sm:text-lg text-[#4A4F57] dark:text-[#B0ACA6] max-w-xl">
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
                <h2 className="font-serif text-4xl font-black text-[#17313A] dark:text-[#EAE4DD] mb-4">
                  ENVÍA TU MENSAJE
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#17313A] to-[#E8A88F] rounded-full" />
              </div>

              <Card className="p-6 sm:p-8 glass-card glow-border rounded-2xl shadow-2xl">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#17313A] dark:text-[#C78F7B] uppercase tracking-wide">
                        Nombre
                      </label>
                      <Input 
                        className="rounded-xl glass-input h-11 font-medium text-[#17313A] placeholder:text-[#4A4F57]/60"
                        placeholder="Juan"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#17313A] dark:text-[#C78F7B] uppercase tracking-wide">
                        Apellido
                      </label>
                      <Input 
                      className="rounded-xl glass-input h-11 font-medium text-[#17313A] placeholder:text-[#4A4F57]/60"
                      placeholder="Pérez"
                    />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#17313A] dark:text-[#C78F7B] uppercase tracking-wide">
                      Email
                    </label>
                    <Input 
                    type="email"
                    className="rounded-xl glass-input h-11 font-medium text-[#17313A] placeholder:text-[#4A4F57]/60"
                    placeholder="juan@email.com"
                  />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#17313A] dark:text-[#C78F7B] uppercase tracking-wide">
                      Teléfono
                    </label>
                    <Input 
                    type="tel"
                    className="rounded-xl glass-input h-11 font-medium text-[#17313A] placeholder:text-[#4A4F57]/60"
                    placeholder="+52 477 123 4567"
                  />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#17313A] dark:text-[#C78F7B] uppercase tracking-wide">
                      Tipo de Consulta
                    </label>
                    <select className="w-full px-4 h-11 rounded-xl glass-input font-medium text-[#17313A] dark:text-[#EAE4DD] dark:bg-[#0F2027]/50">
                      <option className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-[#EAE4DD]">Vender mi propiedad</option>
                      <option className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-[#EAE4DD]">Rentar mi propiedad</option>
                      <option className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-[#EAE4DD]">Comprar propiedad</option>
                      <option className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-[#EAE4DD]">Consulta general</option>
                      <option className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-[#EAE4DD]">Información sobre servicios</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#17313A] dark:text-[#C78F7B] uppercase tracking-wide">
                      Mensaje
                    </label>
                    <Textarea 
                    rows={5}
                    className="rounded-xl glass-input resize-none font-medium text-[#17313A] placeholder:text-[#4A4F57]/60"
                    placeholder="Cuéntanos sobre tu propiedad o consulta..."
                  />
                  </div>

                  <Button className="w-full glass-primary text-ivory font-bold py-5 rounded-xl text-base hover:scale-[1.02] transition-all">
                    <Send className="h-5 w-5 mr-2" />
                    ENVIAR MENSAJE
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right - Contact Info Cards */}
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-4xl font-black text-[#17313A] dark:text-[#EAE4DD] mb-4">
                  CONTÁCTANOS
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#17313A] to-[#E8A88F] rounded-full" />
              </div>

              {/* Contact Cards */}
              <div className="grid gap-4">
                <Card className="p-5 glass-card rounded-xl hover:border-[#17313A]/40 dark:hover:border-[#C78F7B]/40 transition-all duration-300 shadow-lg group glow-border">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#17313A]/20 dark:bg-[#C78F7B]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#17313A]/30 dark:group-hover:bg-[#C78F7B]/30 transition-colors">
                      <MapPin className="h-5 w-5 text-[#17313A] dark:text-[#C78F7B]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#17313A] dark:text-[#EAE4DD] text-sm mb-1 uppercase tracking-wider">Oficina Principal</h3>
                      <p className="text-[#4A4F57] dark:text-[#B0ACA6] text-sm">
                        León, Guanajuato<br />
                        México
                      </p>
                    </div>
                  </div>
                </Card>


                <Card className="p-5 glass-card rounded-xl hover:border-[#17313A]/40 dark:hover:border-[#C78F7B]/40 transition-all duration-300 shadow-lg group glow-border">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#17313A]/20 dark:bg-[#C78F7B]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#17313A]/30 dark:group-hover:bg-[#C78F7B]/30 transition-colors">
                      <Mail className="h-5 w-5 text-[#17313A] dark:text-[#C78F7B]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#17313A] dark:text-[#EAE4DD] text-sm mb-1 uppercase tracking-wider">Email</h3>
                      <p className="text-[#4A4F57] dark:text-[#B0ACA6] text-sm">conectia@gmail.com</p>
                      <p className="text-[#4A4F57]/70 dark:text-[#B0ACA6]/70 text-xs mt-0.5">Respuesta en 24h</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 glass-card rounded-xl hover:border-[#17313A]/40 dark:hover:border-[#C78F7B]/40 transition-all duration-300 shadow-lg group glow-border">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#17313A]/20 dark:bg-[#C78F7B]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#17313A]/30 dark:group-hover:bg-[#C78F7B]/30 transition-colors">
                      <Clock className="h-5 w-5 text-[#17313A] dark:text-[#C78F7B]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#17313A] dark:text-[#EAE4DD] text-sm mb-1 uppercase tracking-wider">Horario</h3>
                      <p className="text-[#4A4F57] dark:text-[#B0ACA6] text-sm">
                        Lun - Vie: 9:00 - 19:00<br />
                        Sábados: 10:00 - 14:00
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-7 liquid-glass-dark rounded-2xl shadow-2xl relative overflow-hidden glow-border">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#17313A]/20 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse-slow" />
                <div className="relative space-y-4">
                  <div className="w-10 h-10 bg-[#C78F7B]/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[#C78F7B]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-semibold">Consulta Gratuita</span>
                    <h3 className="font-serif text-xl font-black text-ivory mt-1">
                      ¿Listo para vender?
                    </h3>
                    <p className="text-white/70 text-sm mt-2">
                      Agenda una consulta gratuita y maximiza el valor de tu propiedad
                    </p>
                  </div>
                  <Button className="w-full glass-primary text-ivory font-bold py-4 rounded-xl hover:scale-[1.02] transition-all">
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
