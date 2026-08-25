'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Mail, Clock, Send, Calendar, MessagesSquare } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export function ContactoYellow() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipo: 'consulta_general',
    mensaje: ''
  })
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!acceptedPrivacy) return

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contacto-asesor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: `${formData.nombre} ${formData.apellido}`.trim(),
          email: formData.email,
          telefono: formData.telefono,
          tipo: formData.tipo,
          mensaje: `${formData.mensaje}\n\nAviso de Privacidad leído y tratamiento necesario autorizado.`,
          fecha: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error('No se pudo enviar la solicitud')
      setSubmitStatus('success')
      setFormData({ nombre: '', apellido: '', email: '', telefono: '', tipo: 'consulta_general', mensaje: '' })
      setAcceptedPrivacy(false)
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F2027] relative overflow-hidden">

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#17313A]/10 dark:bg-[var(--conectia-arcilla)]/10 border border-[#17313A]/25 dark:border-[var(--conectia-arcilla)]/25 rounded-full mb-6">
            <MessagesSquare className="h-4 w-4 text-[#17313A] dark:text-[var(--conectia-arcilla)]" strokeWidth={1.55} />
            <span className="font-serif text-sm font-semibold text-[#17313A] dark:text-[#EAE4DD] uppercase tracking-[0.24em]">
              {t('contact.badge')}
            </span>
          </div>
          
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black text-[#17313A] dark:text-[#EAE4DD] mb-3 leading-tight">
            {t('contact.title')}
          </h1>
          <h2 className="text-xl sm:text-2xl bg-gradient-to-r from-[#17313A] to-[var(--conectia-arcilla-soft)] dark:from-[var(--conectia-arcilla)] dark:to-[var(--conectia-arcilla-soft)] bg-clip-text text-transparent font-bold mb-4">
            {t('contact.subtitle')}
          </h2>
          <p className="text-base sm:text-lg text-[#4A4F57] dark:text-[#B0ACA6] max-w-xl">
            {t('contact.description')}
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
                  {t('contact.formTitle')}
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#17313A] to-[var(--conectia-arcilla-soft)] rounded-full" />
              </div>

              <Card className="p-6 sm:p-8 bg-white dark:bg-[#17313A]/30 border border-[#E5E7EB] dark:border-[#EAE4DD]/10 rounded-2xl shadow-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#17313A] dark:text-[var(--conectia-arcilla)] uppercase tracking-wide">
                        {t('contact.labels.name')}
                      </label>
                      <Input
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="rounded-xl bg-[#F9FAFB] dark:bg-[#0F2027]/60 border border-[#E5E7EB] dark:border-[#EAE4DD]/20 h-11 font-medium text-[#17313A] dark:text-[#EAE4DD] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280]"
                        placeholder={t('contact.placeholders.name')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#17313A] dark:text-[var(--conectia-arcilla)] uppercase tracking-wide">
                        {t('contact.labels.lastName')}
                      </label>
                      <Input
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        className="rounded-xl bg-[#F9FAFB] dark:bg-[#0F2027]/60 border border-[#E5E7EB] dark:border-[#EAE4DD]/20 h-11 font-medium text-[#17313A] dark:text-[#EAE4DD] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280]"
                        placeholder={t('contact.placeholders.lastName')}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#17313A] dark:text-[var(--conectia-arcilla)] uppercase tracking-wide">
                      {t('contact.labels.email')}
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="rounded-xl bg-[#F9FAFB] dark:bg-[#0F2027]/60 border border-[#E5E7EB] dark:border-[#EAE4DD]/20 h-11 font-medium text-[#17313A] dark:text-[#EAE4DD] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280]"
                      placeholder={t('contact.placeholders.email')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#17313A] dark:text-[var(--conectia-arcilla)] uppercase tracking-wide">
                      {t('contact.labels.phone')}
                    </label>
                    <Input
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="rounded-xl bg-[#F9FAFB] dark:bg-[#0F2027]/60 border border-[#E5E7EB] dark:border-[#EAE4DD]/20 h-11 font-medium text-[#17313A] dark:text-[#EAE4DD] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280]"
                      placeholder="563-157-2468"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#17313A] dark:text-[var(--conectia-arcilla)] uppercase tracking-wide">
                      {t('contact.labels.type')}
                    </label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full px-4 h-11 rounded-xl bg-[#F9FAFB] dark:bg-[#0F2027]/60 border border-[#E5E7EB] dark:border-[#EAE4DD]/20 font-medium text-[#17313A] dark:text-[#EAE4DD]">
                      <option value="venta" className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-[#EAE4DD]">{t('contact.options.sell')}</option>
                      <option value="renta" className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-[#EAE4DD]">{t('contact.options.rent')}</option>
                      <option value="compra" className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-[#EAE4DD]">{t('contact.options.buy')}</option>
                      <option value="consulta_general" className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-[#EAE4DD]">{t('contact.options.general')}</option>
                      <option value="servicios" className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-[#EAE4DD]">{t('contact.options.services')}</option>
                      <option value="derechos_arco" className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-[#EAE4DD]">Privacidad y derechos ARCO</option>
                      <option value="reporte_fraude" className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-[#EAE4DD]">Reporte de posible fraude</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#17313A] dark:text-[var(--conectia-arcilla)] uppercase tracking-wide">
                      {t('contact.labels.message')}
                    </label>
                    <Textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      rows={5}
                      className="rounded-xl bg-[#F9FAFB] dark:bg-[#0F2027]/60 border border-[#E5E7EB] dark:border-[#EAE4DD]/20 resize-none font-medium text-[#17313A] dark:text-[#EAE4DD] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280]"
                      placeholder={t('contact.placeholders.message')}
                      required
                    />
                  </div>

                  <label className="flex items-start gap-3 text-sm text-[#4A4F57] dark:text-[#D1CDC7] leading-6">
                    <input
                      type="checkbox"
                      checked={acceptedPrivacy}
                      onChange={(event) => setAcceptedPrivacy(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#17313A]/30 accent-[var(--conectia-arcilla)]"
                      required
                    />
                    <span>
                      Confirmo que leí el{' '}
                      <Link href="/legal/aviso-privacidad-integral" target="_blank" className="font-bold text-[var(--conectia-arcilla)] hover:underline">Aviso de Privacidad Integral</Link>{' '}
                      y autorizo el tratamiento necesario para atender mi solicitud.
                    </span>
                  </label>

                  {submitStatus === 'success' && <p className="text-sm font-semibold text-green-600 dark:text-green-400">Tu solicitud fue recibida correctamente.</p>}
                  {submitStatus === 'error' && <p className="text-sm font-semibold text-red-600 dark:text-red-400">No fue posible enviar la solicitud. Inténtalo nuevamente.</p>}

                  <Button type="submit" disabled={isSubmitting || !acceptedPrivacy} className="w-full bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-deep)] text-white font-bold py-5 rounded-xl text-base hover:scale-[1.02] transition-all disabled:opacity-50">
                    <Send className="h-5 w-5 mr-2" />
                    {isSubmitting ? 'Enviando...' : t('contact.labels.submit')}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right - Contact Info Cards */}
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-4xl font-black text-[#17313A] dark:text-[#EAE4DD] mb-4">
                  {t('contact.infoTitle')}
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#17313A] to-[var(--conectia-arcilla-soft)] rounded-full" />
              </div>

              {/* Contact Cards */}
              <div className="grid gap-4">
                <Card className="p-5 bg-white dark:bg-[#17313A]/30 border border-[#E5E7EB] dark:border-[#EAE4DD]/10 rounded-xl hover:border-[var(--conectia-arcilla)]/40 transition-all duration-300 shadow-sm group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[var(--conectia-arcilla)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-[var(--conectia-arcilla)]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#17313A] dark:text-[#EAE4DD] text-sm mb-1 uppercase tracking-wider">{t('contact.office.title')}</h3>
                      <p className="text-[#6B7280] dark:text-[#B0ACA6] text-sm">
                        {t('contact.office.city')}<br />
                        {t('contact.office.country')}
                      </p>
                    </div>
                  </div>
                </Card>


                <Card className="p-5 bg-white dark:bg-[#17313A]/30 border border-[#E5E7EB] dark:border-[#EAE4DD]/10 rounded-xl hover:border-[var(--conectia-arcilla)]/40 transition-all duration-300 shadow-sm group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[var(--conectia-arcilla)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-[var(--conectia-arcilla)]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#17313A] dark:text-[#EAE4DD] text-sm mb-1 uppercase tracking-wider">{t('contact.email.title')}</h3>
                      <p className="text-[#6B7280] dark:text-[#B0ACA6] text-sm">conectia@gmail.com</p>
                      <p className="text-[#9CA3AF] dark:text-[#B0ACA6]/70 text-xs mt-0.5">{t('contact.email.response')}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-white dark:bg-[#17313A]/30 border border-[#E5E7EB] dark:border-[#EAE4DD]/10 rounded-xl hover:border-[var(--conectia-arcilla)]/40 transition-all duration-300 shadow-sm group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[var(--conectia-arcilla)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-[var(--conectia-arcilla)]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#17313A] dark:text-[#EAE4DD] text-sm mb-1 uppercase tracking-wider">{t('contact.hours.title')}</h3>
                      <p className="text-[#6B7280] dark:text-[#B0ACA6] text-sm">
                        {t('contact.hours.weekdays')}<br />
                        {t('contact.hours.saturday')}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-7 bg-[#17313A] dark:bg-[#17313A] rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#17313A]/20 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse-slow" />
                <div className="relative space-y-4">
                  <div className="w-10 h-10 bg-[var(--conectia-arcilla)]/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[var(--conectia-arcilla)]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-semibold">{t('contact.cta.badge')}</span>
                    <h3 className="font-serif text-xl font-black text-ivory mt-1">
                      {t('contact.cta.title')}
                    </h3>
                    <p className="text-white/70 text-sm mt-2">
                      {t('contact.cta.subtitle')}
                    </p>
                  </div>
                  <Button className="w-full bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-deep)] text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition-all">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('contact.cta.button')}
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
