/**
 * Sistema de analytics para propiedades
 * Tracks: vistas, compartidos, tiempo promedio de interacción
 * Usa localStorage como backend temporal (migrable a Supabase)
 */

import { hasCookieConsent } from '@/lib/cookie-consent'

export interface PropertyAnalytics {
  propertyId: string | number
  views: number
  shares: number
  totalInteractionTimeMs: number
  interactionsCount: number
  lastViewedAt: string
  firstViewedAt: string
}

const STORAGE_KEY = 'conectia_property_analytics'

function getAll(): Record<string, PropertyAnalytics> {
  if (typeof window === 'undefined' || !hasCookieConsent('analytics')) return {}
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveAll(data: Record<string, PropertyAnalytics>) {
  if (typeof window === 'undefined' || !hasCookieConsent('analytics')) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function getKey(propertyId: string | number): string {
  return String(propertyId)
}

export function trackPropertyView(propertyId: string | number) {
  const data = getAll()
  const key = getKey(propertyId)
  const now = new Date().toISOString()

  if (!data[key]) {
    data[key] = {
      propertyId,
      views: 0,
      shares: 0,
      totalInteractionTimeMs: 0,
      interactionsCount: 0,
      lastViewedAt: now,
      firstViewedAt: now,
    }
  }

  data[key].views += 1
  data[key].lastViewedAt = now
  data[key].interactionsCount += 1
  saveAll(data)
}

export function trackPropertyShare(propertyId: string | number) {
  const data = getAll()
  const key = getKey(propertyId)
  const now = new Date().toISOString()

  if (!data[key]) {
    data[key] = {
      propertyId,
      views: 0,
      shares: 0,
      totalInteractionTimeMs: 0,
      interactionsCount: 0,
      lastViewedAt: now,
      firstViewedAt: now,
    }
  }

  data[key].shares += 1
  data[key].lastViewedAt = now
  saveAll(data)
}

export function startInteractionTimer(propertyId: string | number): () => void {
  const startTime = Date.now()

  return () => {
    const duration = Date.now() - startTime
    const data = getAll()
    const key = getKey(propertyId)
    const now = new Date().toISOString()

    if (!data[key]) {
      data[key] = {
        propertyId,
        views: 0,
        shares: 0,
        totalInteractionTimeMs: 0,
        interactionsCount: 0,
        lastViewedAt: now,
        firstViewedAt: now,
      }
    }

    data[key].totalInteractionTimeMs += duration
    data[key].interactionsCount += 1
    data[key].lastViewedAt = now
    saveAll(data)
  }
}

export function getPropertyAnalytics(propertyId: string | number): PropertyAnalytics {
  const data = getAll()
  const key = getKey(propertyId)
  return data[key] || {
    propertyId,
    views: 0,
    shares: 0,
    totalInteractionTimeMs: 0,
    interactionsCount: 0,
    lastViewedAt: '-',
    firstViewedAt: '-',
  }
}

export function getAllAnalytics(): PropertyAnalytics[] {
  const data = getAll()
  return Object.values(data)
}

export function getAnalyticsForProperties(propertyIds: (string | number)[]): PropertyAnalytics[] {
  const data = getAll()
  return propertyIds.map(id => data[getKey(id)] || {
    propertyId: id,
    views: 0,
    shares: 0,
    totalInteractionTimeMs: 0,
    interactionsCount: 0,
    lastViewedAt: '-',
    firstViewedAt: '-',
  })
}

export function getAverageInteractionTimeMs(propertyId: string | number): number {
  const analytics = getPropertyAnalytics(propertyId)
  if (analytics.interactionsCount === 0) return 0
  return Math.round(analytics.totalInteractionTimeMs / analytics.interactionsCount)
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

export function getTopProperties(limit = 5): PropertyAnalytics[] {
  return getAllAnalytics()
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

export function getTotalViews(): number {
  return getAllAnalytics().reduce((sum, a) => sum + a.views, 0)
}

export function getTotalShares(): number {
  return getAllAnalytics().reduce((sum, a) => sum + a.shares, 0)
}
