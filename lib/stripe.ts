import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export const getStripe = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// Mantener export para compatibilidad
export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    return getStripe()[prop as keyof Stripe]
  }
})

// Configuración de precios de Stripe
export const STRIPE_PRICES = {
  core: null, // Plan gratuito
  elite: process.env.STRIPE_ELITE_PRICE_ID || 'price_elite', // Se configurará en Stripe Dashboard
}

// URLs de retorno
export const getSuccessUrl = (sessionId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/panel-asesor/planes/success?session_id=${sessionId}`
}

export const getCancelUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/panel-asesor/planes`
}
