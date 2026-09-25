"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { hasCookieConsent } from '@/lib/cookie-consent'

type Currency = 'MXN' | 'USD'
type Rate = { rate: number; date: string }
type CurrencyContextValue = {
  currency: Currency
  loading: boolean
  rate: Rate | null
  toggleCurrency: () => Promise<void>
  formatPrice: (price: number | null | undefined, priceText?: string) => string
}

const STORAGE_KEY = 'conectia-currency'
const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('MXN')
  const [rate, setRate] = useState<Rate | null>(null)
  const [loading, setLoading] = useState(false)

  const loadRate = useCallback(async () => {
    const response = await fetch('/api/exchange-rate')
    if (!response.ok) throw new Error('Exchange rate unavailable')
    const data: Rate = await response.json()
    if (!Number.isFinite(data.rate) || data.rate <= 0) throw new Error('Invalid exchange rate')
    setRate(data)
    return data
  }, [])

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY) || (hasCookieConsent('preferences') ? localStorage.getItem(STORAGE_KEY) : null)
        if (stored === 'USD') void loadRate().then(() => setCurrency('USD')).catch(() => sessionStorage.removeItem(STORAGE_KEY))
      } catch {}
    }, 0)
    return () => window.clearTimeout(initialize)
  }, [loadRate])

  const toggleCurrency = async () => {
    if (loading) return
    const next: Currency = currency === 'MXN' ? 'USD' : 'MXN'
    if (next === 'USD') {
      setLoading(true)
      try {
        if (!rate) await loadRate()
      } catch (error) {
        setCurrency('MXN')
        throw error
      } finally {
        setLoading(false)
      }
    }
    setCurrency(next)
    try {
      sessionStorage.setItem(STORAGE_KEY, next)
      if (hasCookieConsent('preferences')) localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }

  const formatPrice = (price: number | null | undefined, priceText?: string) => {
    const legacyAmount = /^\$\s*([\d,]+(?:\.\d+)?)/.exec(priceText || '')
    const priceMxn = price ?? (legacyAmount ? Number(legacyAmount[1].replaceAll(',', '')) : null)
    if (currency === 'USD' && rate && typeof priceMxn === 'number' && Number.isFinite(priceMxn) && priceMxn > 0) {
      const amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(priceMxn / rate.rate)
      return `USD $${amount}${/\/m(?:²|2)/i.test(priceText || '') ? '/m²' : ''}`
    }
    return priceText || (typeof price === 'number' && Number.isFinite(price)
      ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(price)
      : '')
  }

  return <CurrencyContext.Provider value={{ currency, rate, loading, toggleCurrency, formatPrice }}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider')
  return context
}
