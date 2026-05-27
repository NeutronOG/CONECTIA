'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Crown, Loader2 } from 'lucide-react'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular verificación de pago
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-conectia-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-16 w-16 text-conectia-gold mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-conectia-graphite mb-2">
              Procesando tu pago...
            </h2>
            <p className="text-gray-600">
              Por favor espera mientras confirmamos tu suscripción
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-conectia-secondary flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gradient-to-br from-conectia-gold/10 to-conectia-gold/5 border-conectia-gold/30">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-conectia-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <Crown className="h-12 w-12 text-conectia-gold mx-auto mb-4" />
          </div>

          <h1 className="text-3xl font-bold text-conectia-graphite mb-3">
            ¡Bienvenido al Plan Elite!
          </h1>
          
          <p className="text-gray-700 mb-6">
            Tu suscripción ha sido activada exitosamente. Ahora tienes acceso a:
          </p>

          <div className="bg-white/50 rounded-xl p-6 mb-6 text-left">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-conectia-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Propiedades ilimitadas</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-conectia-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Asistente con Inteligencia Artificial</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-conectia-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Panel de gestión avanzado</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-conectia-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Prioridad en soporte</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-conectia-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Marketing automatizado</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/panel-asesor')}
              className="w-full bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] font-semibold"
            >
              Ir al Panel
            </Button>
            <Button
              onClick={() => router.push('/panel-asesor/propiedades')}
              variant="outline"
              className="w-full"
            >
              Gestionar Propiedades
            </Button>
          </div>

          {sessionId && (
            <p className="text-xs text-gray-500 mt-6">
              ID de sesión: {sessionId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-conectia-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-16 w-16 text-conectia-gold mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-conectia-graphite mb-2">
              Cargando...
            </h2>
          </CardContent>
        </Card>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
