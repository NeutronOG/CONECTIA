'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Mail, Phone, AlertCircle, CheckCircle2, Crown, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

function RegistroContent() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  })
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
          mensaje: formData.mensaje || 'Solicitud de información para ser asesor CONECTIA SELECT',
          tipo: 'solicitud_asesor',
          fecha: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Error al enviar la solicitud')
      }
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud. Por favor intenta de nuevo.')
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
              ¡Solicitud Enviada!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gracias por tu interés en unirte a CONECTIA SELECT.
            </p>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Nuestro equipo te contactará en menos de 24 horas para brindarte toda la información sobre nuestros planes y beneficios.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 px-6 py-3 bg-conectia-gold hover:bg-conectia-gold/90 text-gray-800 font-semibold rounded-xl transition-all"
            >
              Volver al Inicio
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
              src="/logo.png"
              alt="CONECTIA SELECT"
              width={250}
              height={80}
              className="h-16 w-auto object-contain"
            />
          </div>
          
          {/* Mensaje inspirador */}
          {fromPlans ? (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-conectia-gold/10 rounded-full mb-3">
                <Crown className="w-4 h-4 text-conectia-gold" />
                <span className="text-sm font-medium text-conectia-gold">Únete a la élite inmobiliaria</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Únete como Asesor
              </h2>
              <p className="text-gray-600 text-sm">
                Déjanos tus datos y te contactaremos para brindarte toda la información.
              </p>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              Solicitar Información
            </p>
          )}
        </div>

        {/* Formulario */}
        <div className="bg-gray-300/50 dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-400/30 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-conectia-secondary/70 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-conectia-gold focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-conectia-secondary/70 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-conectia-gold focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-conectia-secondary/70 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-conectia-gold focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="+52 1 477 123 4567"
                  required
                />
              </div>
            </div>

            {/* Mensaje opcional */}
            <div>
              <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensaje (opcional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-conectia-secondary/70 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-conectia-gold focus:border-transparent outline-none transition-all text-gray-900 dark:text-white resize-none"
                  placeholder="Cuéntanos sobre tu experiencia o interés..."
                  rows={3}
                />
              </div>
            </div>


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
              {loading ? 'Enviando solicitud...' : 'Enviar Solicitud'}
            </button>
          </form>

          {/* Info adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Al enviar este formulario, aceptas que CONECTIA SELECT te contacte para brindarte información sobre nuestros servicios y planes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          © 2025 CONECTIA SELECT. Todos los derechos reservados.
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
