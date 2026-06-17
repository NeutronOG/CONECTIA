'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PropertyAnalytics,
  getPropertyAnalytics,
  getAllAnalytics,
  getAnalyticsForProperties,
  getTopProperties,
  getTotalViews,
  getTotalShares,
  getAverageInteractionTimeMs,
  formatDuration,
} from '@/lib/property-analytics'

export function usePropertyAnalytics(propertyId?: string | number) {
  const [analytics, setAnalytics] = useState<PropertyAnalytics | null>(null)

  const refresh = useCallback(() => {
    if (propertyId !== undefined) {
      setAnalytics(getPropertyAnalytics(propertyId))
    }
  }, [propertyId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    analytics,
    refresh,
    avgInteractionTime: analytics ? getAverageInteractionTimeMs(analytics.propertyId) : 0,
    formattedAvgTime: analytics ? formatDuration(getAverageInteractionTimeMs(analytics.propertyId)) : '0s',
  }
}

export function useAllPropertyAnalytics() {
  const [analytics, setAnalytics] = useState<PropertyAnalytics[]>([])
  const [totalViews, setTotalViews] = useState(0)
  const [totalShares, setTotalShares] = useState(0)
  const [topProperties, setTopProperties] = useState<PropertyAnalytics[]>([])

  const refresh = useCallback(() => {
    const all = getAllAnalytics()
    setAnalytics(all)
    setTotalViews(getTotalViews())
    setTotalShares(getTotalShares())
    setTopProperties(getTopProperties())
  }, [])

  useEffect(() => {
    refresh()
    // Refresh cada 5 segundos para mantener datos actualizados
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [refresh])

  return {
    analytics,
    totalViews,
    totalShares,
    topProperties,
    refresh,
  }
}

export function usePropertiesAnalyticsList(propertyIds: (string | number)[]) {
  const [analytics, setAnalytics] = useState<PropertyAnalytics[]>([])

  useEffect(() => {
    if (propertyIds.length > 0) {
      setAnalytics(getAnalyticsForProperties(propertyIds))
    }
  }, [propertyIds])

  const refresh = useCallback(() => {
    if (propertyIds.length > 0) {
      setAnalytics(getAnalyticsForProperties(propertyIds))
    }
  }, [propertyIds])

  return { analytics, refresh }
}
