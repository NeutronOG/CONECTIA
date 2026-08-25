'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Mail, Phone, AlertCircle, CheckCircle2, Diamond, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'

function RegistroContent() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  })
  const [acceptedLegal, setAcceptedLegal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromPlans = searchParams.get('from') === 'planes'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!acceptedLegal) {
      setError('Debes aceptar los Términos y Condiciones y confirmar que leíste el Aviso de Privacidad.')
      return
    }

    setLoading(true)

    try {
      // Enviar datos a API para guardar solicitud de contacto
      const response = await fetch('/api/contacto-asesor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          mensaje: `${formData.mensaje || 'Solicitud de información para ser asesor CONECTIA'}\n\nConsentimiento: Términos y Aviso de Privacidad aceptados el ${new Date().toISOString()}.`,
          tipo: 'solicitud_asesor',
          fecha: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(t('registro.errors.sendError'))
      }
      
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('registro.errors.retryError'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-conectia-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-3xl shadow-xl p-8 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('registro.success.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('registro.success.message')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {t('registro.success.description')}
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 px-6 py-3 bg-conectia-gold hover:bg-conectia-gold/90 text-gray-800 font-semibold rounded-xl transition-all"
            >
              {t('registro.success.backButton')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-conectia-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logoconectiaoficial.png"
              alt="CONECTIA"
              width={250}
              height={80}
              className="h-16 w-auto object-contain"
            />
          </div>
          
          {/* Mensaje inspirador */}
          {fromPlans ? (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-conectia-gold/10 rounded-full mb-3">
                <Diamond className="w-4 h-4 text-conectia-gold" />
                <span className="text-sm font-medium text-conectia-gold">{t('registro.fromPlans.badge')}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t('registro.fromPlans.title')}
              </h2>
              <p className="text-gray-600 text-sm">
                {t('registro.fromPlans.subtitle')}
              </p>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              {t('registro.title')}
            </p>
          )}
        </div>

        {/* Formulario */}
        <div className="bg-gray-300/50 dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-400/30 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('registro.nameLabel')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-[#17313A] border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-conectia-gold focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder={t('registro.namePlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('registro.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-[#17313A] border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-conectia-gold focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('registro.phoneLabel')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-[#17313A] border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-conectia-gold focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="563-157-2468"
                  required
                />
              </div>
            </div>

            {/* Mensaje opcional */}
            <div>
              <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('registro.messageLabel')}
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-[#17313A] border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-conectia-gold focus:border-transparent outline-none transition-all text-gray-900 dark:text-white resize-none"
                  placeholder={t('registro.messagePlaceholder')}
                  rows={3}
                />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 leading-6">
              <input
                type="checkbox"
                checked={acceptedLegal}
                onChange={(event) => setAcceptedLegal(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-400 accent-[var(--conectia-arcilla)]"
                required
              />
              <span>
                Acepto los{' '}
                <Link href="/legal/terminos-condiciones" target="_blank" className="font-bold text-[var(--conectia-arcilla)] hover:underline">Términos y Condiciones</Link>{' '}
                y confirmo que leí el{' '}
                <Link href="/legal/aviso-privacidad-integral" target="_blank" className="font-bold text-[var(--conectia-arcilla)] hover:underline">Aviso de Privacidad Integral</Link>.
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-conectia-gold hover:bg-conectia-gold/90 text-gray-800 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-conectia-gold/20"
            >
              {loading ? t('registro.sending') : t('registro.submitButton')}
            </button>
          </form>

          {/* Info adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {t('registro.disclaimer')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          {t('registro.footer')}
        </p>
      </div>
    </div>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-conectia-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-pulse">
            <div className="h-16 w-48 bg-gray-300 rounded mx-auto mb-4"></div>
            <div className="h-4 w-64 bg-gray-300 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <RegistroContent />
    </Suspense>
  )
}
