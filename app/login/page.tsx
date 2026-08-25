'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Lock, Mail, AlertCircle, Award, Fingerprint, Trash2, CheckCircle2 } from 'lucide-react'
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
import { useLanguage } from '@/lib/i18n'

const LOGIN_TEXT_FALLBACK = {
  es: {
    title: 'Acceso a Plataforma CONECTIA',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    signInButton: 'Iniciar Sesión',
    signingIn: 'Iniciando sesión...',
    noAccount: '¿No tienes cuenta?',
    createAdvisorAccount: 'Crear cuenta de asesor',
    footer: '© 2025 CONECTIA. Todos los derechos reservados.',
    fromPlans: {
      successBegins: 'Tu éxito comienza aquí',
      welcome: 'Bienvenido a CONECTIA',
      subtitle: 'Inicia sesión para activar tu plan y potenciar tu carrera inmobiliaria.',
    },
    biometric: {
      accessButton: 'Acceder con Face ID / Huella',
      quickAccess: 'Acceso rápido como {{nombre}}',
      deleteButton: 'Borrar biométrico',
      deleteTitle: 'Borrar datos biométricos guardados',
      registeredSuccess: 'Face ID / Huella configurado. La próxima vez podrás acceder más rápido.',
    },
    errors: {
      invalidCredentials: 'Credenciales incorrectas',
      credentialsExpired: 'Credenciales expiradas. Por favor inicia sesión con tu contraseña para reactivar el acceso biométrico.',
      biometricError: 'Error en autenticación biométrica',
    },
  },
  en: {
    title: 'Access CONECTIA Platform',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    signInButton: 'Sign In',
    signingIn: 'Signing in...',
    noAccount: "Don't have an account?",
    createAdvisorAccount: 'Create advisor account',
    footer: '© 2025 CONECTIA. All rights reserved.',
    fromPlans: {
      successBegins: 'Your success starts here',
      welcome: 'Welcome to CONECTIA',
      subtitle: 'Sign in to activate your plan and boost your real estate career.',
    },
    biometric: {
      accessButton: 'Access with Face ID / Fingerprint',
      quickAccess: 'Quick access as {{nombre}}',
      deleteButton: 'Delete biometric',
      deleteTitle: 'Delete saved biometric data',
      registeredSuccess: 'Face ID / Fingerprint configured. Next time you can access faster.',
    },
    errors: {
      invalidCredentials: 'Invalid credentials',
      credentialsExpired: 'Credentials expired. Please sign in with your password to reactivate biometric access.',
      biometricError: 'Biometric authentication error',
    },
  },
} as const

function LoginContent() {
  const { language, dict } = useLanguage()
  const loginText = (dict as any)?.login ?? LOGIN_TEXT_FALLBACK[language]
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
      setError(err.message || loginText.errors.invalidCredentials)
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
        setError(loginText.errors.credentialsExpired)
        return
      }

      // Step 3: Login with stored credentials
      const userData = await login(loginData.email, loginData.password)
      redirectAfterLogin(userData)
    } catch (err: any) {
      setError(err.message || loginText.errors.biometricError)
    } finally {
      setBiometricLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-light flex items-center justify-center p-4 relative overflow-hidden">
      {/* Orbs decorativos glassmorphism */}
      <div className="orb orb-blue w-96 h-96 -top-48 -left-48"></div>
      <div className="orb orb-accent w-80 h-80 -bottom-40 -right-40"></div>
      <div className="orb orb-blue w-64 h-64 bottom-1/4 left-1/4 opacity-20"></div>

      <div className="w-full max-w-md relative z-10">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3 glass-card">
                <Award className="w-4 h-4 text-[var(--conectia-arcilla)]" />
                <span className="text-sm font-medium text-ivory">{loginText.fromPlans.successBegins}</span>
              </div>
              <h2 className="font-titles text-2xl font-light text-[#17313A] mb-2">
                {loginText.fromPlans.welcome}
              </h2>
              <p className="text-[#4A4F57] text-sm">
                {loginText.fromPlans.subtitle}
              </p>
            </div>
          ) : (
            <p className="text-[#4A4F57] text-lg font-medium">
              {loginText.title}
            </p>
          )}
        </div>

        {/* Formulario */}
        <div className="login-card glass-card rounded-3xl p-8 glow-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="login-form-label block text-xs uppercase tracking-widest font-semibold mb-2">
                {loginText.emailLabel}
              </label>
              <div className="relative">
                <Mail className="login-input-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none glass-input"
                  placeholder="tu@conectia.mx"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="login-form-label block text-xs uppercase tracking-widest font-semibold mb-2">
                {loginText.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="login-input-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none glass-input"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-red-300 text-sm glass-card" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-300" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glass-primary text-ivory hover:scale-[1.02]"
            >
              {loading ? loginText.signingIn : loginText.signInButton}
            </button>
          </form>

          {/* Biometric Login */}
          {biometricSupported && hasBiometric && biometricUser && (
            <div className="mt-6 pt-6 border-t border-white/15">
              <button
                onClick={handleBiometricLogin}
                disabled={biometricLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-ivory transition-all duration-300 disabled:opacity-50 glass-card hover:scale-[1.02]"
              >
                {biometricLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5 text-[var(--conectia-arcilla)]" />
                    <span>{loginText.biometric.accessButton}</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-white/60">
                  {loginText.biometric.quickAccess.replace('{{nombre}}', biometricUser.nombre || biometricUser.email)}
                </p>
                <button
                  onClick={() => {
                    removeBiometricCredentials()
                    setHasBiometric(false)
                    setBiometricUser(null)
                  }}
                  className="flex items-center gap-1 text-xs text-red-300 hover:text-red-200 transition-colors"
                  title={loginText.biometric.deleteTitle}
                >
                  <Trash2 className="w-3 h-3" />
                  {loginText.biometric.deleteButton}
                </button>
              </div>
            </div>
          )}

          {/* Biometric registration success */}
          {biometricRegistered && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl text-green-300 text-sm glass-card" style={{ background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-300" />
              <span>{loginText.biometric.registeredSuccess}</span>
            </div>
          )}

          {/* Link a registro */}
          <div className="mt-6 pt-6 text-center border-t border-white/15">
            <p className="login-card-muted text-sm">
              {loginText.noAccount}{' '}
              <Link 
                href={fromPlans ? "/registro?from=planes" : "/registro"} 
                className="login-card-link underline font-medium transition-colors"
              >
                {loginText.createAdvisorAccount}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#4A4F57] mt-6">
          {loginText.footer}
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-light flex items-center justify-center p-4 relative overflow-hidden">
        <div className="orb orb-blue w-96 h-96 -top-48 -left-48"></div>
        <div className="orb orb-accent w-80 h-80 -bottom-40 -right-40"></div>
        <div className="w-full max-w-md text-center relative z-10">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-16 w-48 rounded-xl glass-card"></div>
            <div className="h-4 w-64 rounded-full glass-panel-light"></div>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
