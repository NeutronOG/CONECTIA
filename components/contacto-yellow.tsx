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
    <div className="min-h-screen bg-conectia-surface relative overflow-hidden">
      {/* Geometric Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-conectia-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-conectia-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative pt-28 pb-12 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="h-0.5 w-10 bg-conectia-primary mb-6" />
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-conectia-primary/10 border border-conectia-primary/25 rounded-lg mb-6">
            <Zap className="h-4 w-4 text-conectia-primary" />
            <span className="text-[10px] font-bold text-conectia-primary uppercase tracking-[0.3em]">
              Respuesta Inmediata
            </span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-conectia-accent mb-3 leading-tight">
            Hablemos
          </h1>
          <h2 className="text-lg sm:text-xl text-conectia-primary font-semibold mb-3">
            de tu propiedad
          </h2>
          <p className="text-sm sm:text-base text-conectia-accent/55 max-w-xl">
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
                <h2 className="font-serif text-4xl font-black text-conectia-accent mb-4">
                  ENVÍA TU MENSAJE
                </h2>
                <div className="w-20 h-1 bg-conectia-primary rounded-full" />
              </div>

              <Card className="p-6 sm:p-8 bg-conectia-surface border border-conectia-accent/10 rounded-2xl shadow-md">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-conectia-accent uppercase tracking-wide">
                        Nombre
                      </label>
                      <Input 
                        className="rounded-lg border border-conectia-accent/20 focus:border-conectia-primary bg-conectia-surface-container h-11 font-medium"
                        placeholder="Juan"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-conectia-accent uppercase tracking-wide">
                        Apellido
                      </label>
                      <Input 
                      className="rounded-lg border border-conectia-accent/20 focus:border-conectia-primary bg-conectia-surface-container h-11 font-medium"
                      placeholder="Pérez"
                    />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-conectia-accent uppercase tracking-wide">
                      Email
                    </label>
                    <Input 
                    type="email"
                    className="rounded-lg border border-conectia-accent/20 focus:border-conectia-primary bg-conectia-surface-container h-11 font-medium"
                    placeholder="juan@email.com"
                  />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-conectia-accent uppercase tracking-wide">
                      Teléfono
                    </label>
                    <Input 
                    type="tel"
                    className="rounded-lg border border-conectia-accent/20 focus:border-conectia-primary bg-conectia-surface-container h-11 font-medium"
                    placeholder="+52 477 123 4567"
                  />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-conectia-accent uppercase tracking-wide">
                      Tipo de Consulta
                    </label>
                    <select className="w-full px-4 h-11 rounded-lg border border-conectia-accent/20 focus:border-conectia-primary focus:outline-none bg-conectia-surface-container font-medium text-conectia-accent">
                      <option>Vender mi propiedad</option>
                      <option>Rentar mi propiedad</option>
                      <option>Comprar propiedad</option>
                      <option>Consulta general</option>
                      <option>Información sobre servicios</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-conectia-accent uppercase tracking-wide">
                      Mensaje
                    </label>
                    <Textarea 
                    rows={5}
                    className="rounded-lg border border-conectia-accent/20 focus:border-conectia-primary bg-conectia-surface-container resize-none font-medium"
                    placeholder="Cuéntanos sobre tu propiedad o consulta..."
                  />
                  </div>

                  <Button className="w-full bg-conectia-primary hover:bg-conectia-primary/90 text-white font-bold py-5 rounded-lg text-base shadow-lg">
                    <Send className="h-5 w-5 mr-2" />
                    ENVIAR MENSAJE
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right - Contact Info Cards */}
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-4xl font-black text-conectia-accent mb-4">
                  CONTÁCTANOS
                </h2>
                <div className="w-20 h-1 bg-conectia-primary rounded-full" />
              </div>

              {/* Contact Cards */}
              <div className="grid gap-6">
                <Card className="p-5 bg-conectia-surface border border-conectia-primary/15 rounded-xl hover:border-conectia-primary/35 transition-all duration-300 shadow-sm group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-conectia-primary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-conectia-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-conectia-accent text-sm mb-1 uppercase tracking-wider">Oficina Principal</h3>
                      <p className="text-conectia-accent/60 text-sm">
                        León, Guanajuato<br />
                        México
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-conectia-surface border border-conectia-primary/15 rounded-xl hover:border-conectia-primary/35 transition-all duration-300 shadow-sm group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-conectia-primary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-conectia-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-conectia-accent text-sm mb-1 uppercase tracking-wider">Teléfono</h3>
                      <p className="text-conectia-accent/60 text-sm">+52 1 477 475 6951</p>
                      <p className="text-conectia-accent/40 text-xs mt-0.5">WhatsApp disponible</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-conectia-surface border border-conectia-primary/15 rounded-xl hover:border-conectia-primary/35 transition-all duration-300 shadow-sm group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-conectia-primary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-conectia-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-conectia-accent text-sm mb-1 uppercase tracking-wider">Email</h3>
                      <p className="text-conectia-accent/60 text-sm">conectiaselect@gmail.com</p>
                      <p className="text-conectia-accent/40 text-xs mt-0.5">Respuesta en 24h</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-conectia-surface border border-conectia-primary/15 rounded-xl hover:border-conectia-primary/35 transition-all duration-300 shadow-sm group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-conectia-primary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-conectia-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-conectia-accent text-sm mb-1 uppercase tracking-wider">Horario</h3>
                      <p className="text-conectia-accent/60 text-sm">
                        Lun - Vie: 9:00 - 19:00<br />
                        Sábados: 10:00 - 14:00
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-7 bg-conectia-accent border-0 rounded-2xl shadow-xl">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-conectia-primary/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-conectia-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-conectia-primary font-semibold">Consulta Gratuita</span>
                    <h3 className="font-serif text-xl font-black text-white mt-1">
                      ¿Listo para vender?
                    </h3>
                    <p className="text-white/55 text-sm mt-2">
                      Agenda una consulta gratuita y maximiza el valor de tu propiedad
                    </p>
                  </div>
                  <Button className="w-full bg-conectia-primary hover:bg-conectia-primary/90 text-white font-bold py-4 rounded-lg">
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
