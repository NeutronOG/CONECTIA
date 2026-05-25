'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Lock, Mail, AlertCircle, Sparkles, Fingerprint, Trash2, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  isPlatformAuthenticatorAvailable,
  hasBiometricCredentials,
  getBiometricUser,
  registerBiometric,
  authenticateWithBiometric,
  storeBiometricLoginData,
  getBiometricLoginData,
  removeBiometricCredentials,
} from '@/lib/biometric-auth'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [hasBiometric, setHasBiometric] = useState(false)
  const [biometricUser, setBiometricUser] = useState<{ email: string; nombre?: string } | null>(null)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [biometricRegistered, setBiometricRegistered] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || null
  const fromPlans = searchParams.get('from') === 'planes'

  useEffect(() => {
    const checkBiometric = async () => {
      const available = await isPlatformAuthenticatorAvailable()
      setBiometricSupported(available)
      setHasBiometric(hasBiometricCredentials())
      setBiometricUser(getBiometricUser())
    }
    checkBiometric()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userData = await login(email, password)

      // After successful login, offer to register biometric if supported and not yet registered
      if (biometricSupported && !hasBiometricCredentials()) {
        try {
          await registerBiometric(email, userData?.nombre)
          storeBiometricLoginData(email, password)
          setBiometricRegistered(true)
          setHasBiometric(true)
        } catch {
          // Silently fail — biometric registration is optional
        }
      } else if (biometricSupported && hasBiometricCredentials()) {
        // Update stored credentials on every successful login
        storeBiometricLoginData(email, password)
      }

      redirectAfterLogin(userData)
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  const redirectAfterLogin = (userData: any) => {
    if (redirectTo) {
      router.push(redirectTo)
      return
    }
    if (userData?.role === 'admin') router.push('/panel-admin')
    else if (userData?.role === 'propietario') router.push('/panel-propietario')
    else if (userData?.role === 'fotografo') router.push('/panel-fotografo')
    else if (userData?.role === 'broker') router.push('/panel-broker')
    else if (userData?.role === 'asesor') router.push('/panel-asesor')
    else if (userData?.role === 'empresa') router.push('/panel-empresa')
    else router.push('/')
  }

  const handleBiometricLogin = async () => {
    setError('')
    setBiometricLoading(true)
    try {
      // Step 1: Verify biometric (Face ID / Fingerprint)
      await authenticateWithBiometric()

      // Step 2: Get stored login credentials
      const loginData = getBiometricLoginData()
      if (!loginData) {
        setError('Credenciales expiradas. Por favor inicia sesión con tu contraseña para reactivar el acceso biométrico.')
        return
      }

      // Step 3: Login with stored credentials
      const userData = await login(loginData.email, loginData.password)
      redirectAfterLogin(userData)
    } catch (err: any) {
      setError(err.message || 'Error en autenticación biométrica')
    } finally {
      setBiometricLoading(false)
    }
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
                <Sparkles className="w-4 h-4 text-conectia-gold" />
                <span className="text-sm font-medium text-conectia-gold">Tu éxito comienza aquí</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Bienvenido a CONECTIA SELECT
              </h2>
              <p className="text-gray-600 text-sm">
                Inicia sesión para activar tu plan y potenciar tu carrera inmobiliaria.
              </p>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              Acceso a Plataforma CONECTIA SELECT
            </p>
          )}
        </div>

        {/* Formulario */}
        <div className="bg-gray-300/50 dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-400/30 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-conectia-secondary/70 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-conectia-gold focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="tu@conectia.mx"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-conectia-secondary/70 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-conectia-gold focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  required
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
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Biometric Login */}
          {biometricSupported && hasBiometric && biometricUser && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleBiometricLogin}
                disabled={biometricLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg"
              >
                {biometricLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5" />
                    <span>Acceder con Face ID / Huella</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Acceso rápido como <strong>{biometricUser.nombre || biometricUser.email}</strong>
                </p>
                <button
                  onClick={() => {
                    removeBiometricCredentials()
                    setHasBiometric(false)
                    setBiometricUser(null)
                  }}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                  title="Borrar datos biométricos guardados"
                >
                  <Trash2 className="w-3 h-3" />
                  Borrar biométrico
                </button>
              </div>
            </div>
          )}

          {/* Biometric registration success */}
          {biometricRegistered && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Face ID / Huella configurado. La próxima vez podrás acceder más rápido.</span>
            </div>
          )}

          {/* Link a registro */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link 
                href={fromPlans ? "/registro?from=planes" : "/registro"} 
                className="text-conectia-gold hover:underline font-medium"
              >
                Crear cuenta de asesor
              </Link>
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

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  )
}
