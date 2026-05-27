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
              alt="CONECTIA"
              width={250}
              height={80}
              className="h-16 w-auto object-contain"
            />
          </div>
          
          {/* Mensaje inspirador */}
          {fromPlans ? (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
                style={{ background: 'rgba(199,143,123,0.15)', border: '1px solid rgba(199,143,123,0.30)' }}>
                <Sparkles className="w-4 h-4 text-[#C78F7B]" />
                <span className="text-sm font-medium text-[#C78F7B]">Tu éxito comienza aquí</span>
              </div>
              <h2 className="font-titles text-2xl font-light text-[#EAE4DD] mb-2">
                Bienvenido a CONECTIA
              </h2>
              <p className="text-[#B0ACA6] text-sm">
                Inicia sesión para activar tu plan y potenciar tu carrera inmobiliaria.
              </p>
            </div>
          ) : (
            <p className="text-[#B0ACA6] text-lg font-medium">
              Acceso a Plataforma CONECTIA
            </p>
          )}
        </div>

        {/* Formulario */}
        <div className="rounded-3xl p-8"
          style={{
            background: 'linear-gradient(160deg, rgba(234,228,221,0.13) 0%, rgba(23,49,58,0.35) 100%)',
            backdropFilter: 'blur(32px) saturate(160%)',
            WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            border: '1px solid rgba(234,228,221,0.18)',
            borderTopColor: 'rgba(255,255,255,0.24)',
            boxShadow: '0 2px 0 rgba(255,255,255,0.08) inset, 0 24px 64px rgba(23,49,58,0.35)',
          }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-widest font-semibold text-[#C78F7B] mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0ACA6]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-[#EAE4DD] placeholder:text-[#B0ACA6]/60 outline-none transition-all"
                  style={{ background: 'rgba(234,228,221,0.08)', border: '1px solid rgba(234,228,221,0.15)' }}
                  placeholder="tu@conectia.mx"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-widest font-semibold text-[#C78F7B] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0ACA6]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-[#EAE4DD] placeholder:text-[#B0ACA6]/60 outline-none transition-all"
                  style={{ background: 'rgba(234,228,221,0.08)', border: '1px solid rgba(234,228,221,0.15)' }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/30 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: loading ? 'rgba(199,143,123,0.5)' : '#C78F7B', color: 'white', boxShadow: '0 8px 24px rgba(199,143,123,0.25)' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Biometric Login */}
          {biometricSupported && hasBiometric && biometricUser && (
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(234,228,221,0.12)' }}>
              <button
                onClick={handleBiometricLogin}
                disabled={biometricLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-[#EAE4DD] transition-all duration-300 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1F3D47, #17313A)', border: '1px solid rgba(234,228,221,0.15)', boxShadow: '0 4px 16px rgba(23,49,58,0.40)' }}
              >
                {biometricLoading ? (
                  <div className="w-5 h-5 border-2 border-[#EAE4DD]/30 border-t-[#EAE4DD] rounded-full animate-spin" />
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5 text-[#C78F7B]" />
                    <span>Acceder con Face ID / Huella</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[#B0ACA6]">
                  Acceso rápido como <strong className="text-[#EAE4DD]">{biometricUser.nombre || biometricUser.email}</strong>
                </p>
                <button
                  onClick={() => {
                    removeBiometricCredentials()
                    setHasBiometric(false)
                    setBiometricUser(null)
                  }}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
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
            <div className="mt-4 flex items-center gap-2 p-3 bg-green-900/20 border border-green-700/30 rounded-xl text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Face ID / Huella configurado. La próxima vez podrás acceder más rápido.</span>
            </div>
          )}

          {/* Link a registro */}
          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid rgba(234,228,221,0.12)' }}>
            <p className="text-sm text-[#B0ACA6]">
              ¿No tienes cuenta?{' '}
              <Link 
                href={fromPlans ? "/registro?from=planes" : "/registro"} 
                className="text-[#C78F7B] hover:text-[#D4987E] underline font-medium transition-colors"
              >
                Crear cuenta de asesor
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#B0ACA6] mt-6">
          © 2025 CONECTIA. Todos los derechos reservados.
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
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-16 w-48 rounded-xl" style={{ background: 'rgba(234,228,221,0.10)' }}></div>
            <div className="h-4 w-64 rounded-full" style={{ background: 'rgba(234,228,221,0.08)' }}></div>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
