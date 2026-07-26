'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { subscriptionPlans, teamPlans } from '@/data/subscription-plans'
import { ArrowLeft, Check, Diamond, Zap, HelpCircle, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/i18n'

export default function PlanesPage() {
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated || user?.role !== 'asesor') {
    router.push('/login')
    return null
  }

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'core') {
      toast.info(t('panelAsesor.planes.alreadyOnCore'), {
        description: t('panelAsesor.planes.currentPlan')
      })
      return
    }

    // Para planes de pago, crear sesión de pago con Stripe
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user?.id,
          userEmail: user?.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('panelAsesor.planes.errors.createSessionError'))
      }

      // Redirigir a Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(t('panelAsesor.planes.errors.paymentError'), {
        description: error.message || t('panelAsesor.planes.errors.tryAgain')
      })
      setLoading(false)
    }
  }

  const currentPlan = user?.plan || 'core'

  return (
    <div className="min-h-screen bg-[#17313A] text-[#EAE4DD] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/panel-asesor')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('panelAsesor.planes.backButton')}
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-conectia-graphite">
            {t('panelAsesor.planes.title')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('panelAsesor.planes.subtitle')}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {subscriptionPlans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id
            const isElite = plan.id === 'elite'

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 ${
                  isElite
                    ? 'border-conectia-gold/50 bg-gradient-to-br from-conectia-gold/10 to-conectia-gold/5 shadow-xl'
                    : 'border-gray-300 bg-conectia-secondary/60'
                } ${isCurrentPlan ? 'ring-2 ring-conectia-gold' : ''}`}
              >
                {isElite && (
                  <div className="absolute top-0 right-0 bg-conectia-gold text-[#17313A] px-4 py-1 text-xs font-bold">
                    RECOMENDADO
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {isElite ? (
                        <div className="p-3 bg-conectia-gold rounded-xl">
                          <Diamond className="h-8 w-8 text-white" />
                        </div>
                      ) : (
                        <div className="p-3 bg-blue-500 rounded-xl">
                          <Zap className="h-8 w-8 text-white" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        {isCurrentPlan && (
                          <Badge className="mt-1 bg-conectia-gold text-[#17313A]">
                            Plan Actual
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-conectia-graphite">
                        {plan.price === 0 ? t('panelAsesor.planes.free') : `$${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500">{t('panelAsesor.planes.perMonth')}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1 rounded-full ${
                          isElite ? 'bg-conectia-gold/20' : 'bg-blue-500/20'
                        }`}>
                          <Check className={`h-4 w-4 ${
                            isElite ? 'text-conectia-gold' : 'text-blue-600'
                          }`} />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan || loading}
                    className={`w-full ${
                      isElite
                        ? 'bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#17313A]'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {loading && isElite ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : isCurrentPlan ? (
                      'Plan Actual'
                    ) : isElite ? (
                      <>
                        <Diamond className="h-4 w-4 mr-2" />
                        Actualizar a Elite
                      </>
                    ) : (
                      'Seleccionar Plan'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Team Plans Section */}
        <div className="mt-12 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-600 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-conectia-graphite">{t('panelAsesor.planes.team.title')}</h2>
              <p className="text-gray-500 text-sm">{t('panelAsesor.planes.team.subtitle')}</p>
            </div>
          </div>
          <p className="text-gray-600 mb-6 ml-1">
            {t('panelAsesor.planes.team.description')}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {teamPlans.map((plan) => {
              const isCurrentPlan = currentPlan === plan.id
              const isElite = plan.id === 'team-elite'

              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    isElite
                      ? 'border-purple-400/50 bg-gradient-to-br from-purple-50 to-purple-100/50 shadow-xl'
                      : 'border-gray-300 bg-conectia-secondary/60'
                  } ${isCurrentPlan ? 'ring-2 ring-purple-500' : ''}`}
                >
                  {isElite && (
                    <div className="absolute top-0 right-0 bg-purple-600 text-white px-4 py-1 text-xs font-bold">
                      RECOMENDADO
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {isElite ? (
                          <div className="p-3 bg-purple-600 rounded-xl">
                            <Diamond className="h-8 w-8 text-white" />
                          </div>
                        ) : (
                          <div className="p-3 bg-purple-400 rounded-xl">
                            <Users className="h-8 w-8 text-white" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-2xl">{plan.displayName}</CardTitle>
                          {isCurrentPlan && (
                            <Badge className="mt-1 bg-purple-600 text-white">
                              Plan Actual
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-conectia-graphite">${plan.price}</span>
                        <span className="text-gray-500">{t('panelAsesor.planes.team.perMonthPerMember')}</span>
                      </div>
                      <p className="text-xs text-purple-600 font-medium mt-1">{t('panelAsesor.plans.team.minMembers')}</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1 rounded-full ${
                            isElite ? 'bg-purple-600/20' : 'bg-purple-400/20'
                          }`}>
                            <Check className={`h-4 w-4 ${
                              isElite ? 'text-purple-600' : 'text-purple-500'
                            }`} />
                          </div>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isCurrentPlan || loading}
                      className={`w-full ${
                        isElite
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-400 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {loading ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Procesando...</>
                      ) : isCurrentPlan ? (
                        'Plan Actual'
                      ) : (
                        <><Users className="h-4 w-4 mr-2" />{t('panelAsesor.planes.team.selectForTeam')}</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Additional Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-conectia-graphite mb-2">
                  {t('panelAsesor.planes.help.title')}
                </h3>
                <p className="text-gray-700 mb-4">
                  {t('panelAsesor.planes.help.description')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/contacto')}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  {t('panelAsesor.planes.help.contactButton')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
