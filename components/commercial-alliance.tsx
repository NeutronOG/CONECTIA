"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Buildings, Lightning, CircleNotch, Users, Crown } from "@phosphor-icons/react"
import Link from "next/link"
import { toast } from "sonner"

export function CommercialAlliance() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(false)
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
    const [isTeam, setIsTeam] = useState(false)

    const handleSelectPlan = async (planId: string) => {
        if (!isAuthenticated || !user) {
            toast.info('Inicia sesión para continuar', {
                description: 'Necesitas una cuenta de asesor para suscribirte'
            })
            router.push('/login?from=planes&redirect=/alianza-comercial')
            return
        }
        if (user.role !== 'asesor') {
            toast.error('Acceso denegado', {
                description: 'Solo los asesores pueden suscribirse a estos planes'
            })
            return
        }
        setLoading(true)
        setSelectedPlanId(planId)
        try {
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, userId: user.id, userEmail: user.email }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Error al crear sesión de pago')
            if (data.url) window.location.href = data.url
        } catch (error: any) {
            toast.error('Error al procesar el pago', { description: error.message })
            setLoading(false)
            setSelectedPlanId(null)
        }
    }

    // ── Planes individuales: fondo marfil / acentos arcilla rosada ──────
    const individualPlans = [
        {
            id: "core",
            name: "Plan Core",
            price: "$99",
            period: "/mes",
            properties: "Hasta 6 propiedades",
            description: "Perfecto para comenzar tu carrera como asesor inmobiliario.",
            features: [
                "Hasta 6 propiedades activas",
                "Panel de gestión básico",
                "Estadísticas de propiedades",
                "Gestión de leads",
                "Soporte por email",
                "Acceso a la plataforma web"
            ],
            icon: Buildings,
            highlight: false,
            badge: "Básico",
            cardClass: "border-[#C78F7B]/30 bg-white/12 backdrop-blur-2xl hover:-translate-y-1 shadow-lg hover:shadow-xl",
            iconBg: "bg-[#EAE4DD]/15",
            iconColor: "text-[#EAE4DD]",
            badgeClass: "bg-[#C78F7B]/20 text-[#C78F7B] border-[#C78F7B]/40",
            titleColor: "text-[#EAE4DD]",
            descColor: "text-[#B0ACA6]",
            priceColor: "text-[#EAE4DD]",
            periodColor: "text-[#B0ACA6]",
            propColor: "font-semibold text-[#C78F7B]",
            checkColor: "text-[#C78F7B]",
            featureColor: "text-[#D5D2C9]",
            btnClass: "bg-[#C78F7B] hover:bg-[#D4987E] text-white border-0 font-semibold shadow-lg",
        },
        {
            id: "elite",
            name: "Plan Elite",
            price: "$399",
            period: "/mes",
            properties: "Hasta 40 propiedades",
            description: "Para asesores profesionales que buscan maximizar su potencial.",
            features: [
                "Hasta 40 propiedades activas",
                "Asistente con Inteligencia Artificial",
                "Panel de gestión avanzado",
                "Estadísticas detalladas y reportes",
                "Gestión avanzada de leads",
                "Prioridad en soporte",
                "Acceso a herramientas premium",
                "Marketing automatizado",
                "Análisis predictivo de mercado"
            ],
            icon: Lightning,
            highlight: true,
            badge: "Más Popular",
            cardClass: "border-[#C78F7B]/40 shadow-2xl scale-105 z-10 bg-[#1F3D47] backdrop-blur-xl",
            iconBg: "bg-[#EAE4DD]/15",
            iconColor: "text-[#EAE4DD]",
            badgeClass: "bg-[#C78F7B]/30 text-[#C78F7B] border-[#C78F7B]/50",
            titleColor: "text-white",
            descColor: "text-[#B0ACA6]",
            priceColor: "text-white",
            periodColor: "text-[#B0ACA6]",
            propColor: "font-semibold text-[#EAE4DD]",
            checkColor: "text-[#C78F7B]",
            featureColor: "text-[#EAE4DD]",
            btnClass: "bg-[#C78F7B] hover:bg-[#D4987E] text-white shadow-lg hover:shadow-xl font-semibold border-0",
        }
    ]

    // ── Planes de equipo ───────
    const teamPlans = [
        {
            id: "team-core",
            name: "Core Equipo",
            price: "$59",
            period: "/mes por miembro",
            properties: "Hasta 6 propiedades por miembro",
            description: "Plan Core para equipos de 2 o más miembros.",
            features: [
                "Hasta 6 propiedades activas por miembro",
                "Panel de gestión básico",
                "Estadísticas de propiedades",
                "Gestión de leads",
                "Soporte por email",
                "Mínimo 2 miembros"
            ],
            icon: Users,
            highlight: false,
            badge: "Equipo",
            cardClass: "border-[#C78F7B]/30 bg-white/12 backdrop-blur-2xl hover:-translate-y-1 shadow-lg hover:shadow-xl",
            iconBg: "bg-[#EAE4DD]/15",
            iconColor: "text-[#EAE4DD]",
            badgeClass: "bg-[#C78F7B]/20 text-[#C78F7B] border-[#C78F7B]/40",
            titleColor: "text-[#EAE4DD]",
            descColor: "text-[#B0ACA6]",
            priceColor: "text-[#EAE4DD]",
            periodColor: "text-[#B0ACA6]",
            propColor: "font-semibold text-[#C78F7B]",
            checkColor: "text-[#C78F7B]",
            featureColor: "text-[#D5D2C9]",
            btnClass: "bg-[#C78F7B] hover:bg-[#D4987E] text-white border-0 font-semibold shadow-lg",
        },
        {
            id: "team-elite",
            name: "Elite Equipo",
            price: "$249",
            period: "/mes por miembro",
            properties: "Hasta 40 propiedades por miembro",
            description: "Plan Elite para equipos de 2 o más miembros.",
            features: [
                "Hasta 40 propiedades activas por miembro",
                "Asistente con Inteligencia Artificial",
                "Panel de gestión avanzado",
                "Estadísticas detalladas y reportes",
                "Gestión avanzada de leads",
                "Marketing automatizado",
                "Análisis predictivo de mercado",
                "Mínimo 2 miembros"
            ],
            icon: Crown,
            highlight: true,
            badge: "Más Popular",
            cardClass: "border-[#C78F7B]/40 shadow-2xl scale-105 z-10 bg-[#1F3D47] backdrop-blur-xl",
            iconBg: "bg-[#EAE4DD]/15",
            iconColor: "text-[#EAE4DD]",
            badgeClass: "bg-[#C78F7B]/30 text-[#C78F7B] border-[#C78F7B]/50",
            titleColor: "text-white",
            descColor: "text-[#B0ACA6]",
            priceColor: "text-white",
            periodColor: "text-[#B0ACA6]",
            propColor: "font-semibold text-[#EAE4DD]",
            checkColor: "text-[#C78F7B]",
            featureColor: "text-[#EAE4DD]",
            btnClass: "bg-[#C78F7B] hover:bg-[#D4987E] text-white shadow-lg hover:shadow-xl font-semibold border-0",
        }
    ]

    const activePlans = isTeam ? teamPlans : individualPlans

    return (
        <div className="min-h-screen bg-[#17313A] relative overflow-hidden transition-all duration-500">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C78F7B]/12 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#17313A]/6 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#C78F7B]/6 rotate-45 blur-2xl" />
            </div>

            <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-12 space-y-6">
                        <Badge variant="outline" className="px-4 py-1.5 text-sm border-[#C78F7B]/40 text-[#C78F7B] bg-[#C78F7B]/10 backdrop-blur-sm">
                            Alianza Comercial
                        </Badge>
                        <h1 className="font-serif text-4xl md:text-6xl font-black text-[#EAE4DD] tracking-tight leading-tight">
                            Impulsa tu carrera <br />
                            <span className="text-[#C78F7B] italic">inmobiliaria</span>
                        </h1>
                        <p className="text-xl text-[#B0ACA6] max-w-2xl mx-auto font-light">
                            Únete a la red de asesores más exclusiva. Elige el plan que mejor se adapte a tu portafolio.
                        </p>
                    </div>

                    {/* ── Toggle Individual / Equipo ── */}
                    <div className="flex justify-center mb-12">
                        <div className="relative flex items-center bg-[#EAE4DD]/8 border border-[#EAE4DD]/12 rounded-2xl p-1.5 gap-1 shadow-sm">
                            {/* Sliding pill */}
                            <div
                                className="absolute top-1.5 bottom-1.5 rounded-xl bg-[#C78F7B] transition-all duration-300 ease-in-out shadow-md"
                                style={{
                                    left: isTeam ? 'calc(50% + 2px)' : '6px',
                                    right: isTeam ? '6px' : 'calc(50% + 2px)',
                                }}
                            />
                            <button
                                onClick={() => setIsTeam(false)}
                                className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                                    !isTeam ? 'text-white' : 'text-[#EAE4DD]/50 hover:text-[#EAE4DD]'
                                }`}
                            >
                                <Buildings className="h-4 w-4" weight="duotone" />
                                Individual
                            </button>
                            <button
                                onClick={() => setIsTeam(true)}
                                className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                                    isTeam ? 'text-white' : 'text-[#EAE4DD]/50 hover:text-[#EAE4DD]'
                                }`}
                            >
                                <Users className="h-4 w-4" weight="duotone" />
                                Equipo
                                <span className="ml-1 text-xs bg-[#EAE4DD]/15 text-[#EAE4DD] px-1.5 py-0.5 rounded-full font-bold">
                                    -40%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Subtitle for team */}
                    {isTeam && (
                        <p className="text-center text-[#B0ACA6] text-sm mb-8 -mt-6">
                            Para 2 o más miembros · Precio por miembro/mes
                        </p>
                    )}

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto transition-all duration-500">
                        {activePlans.map((plan) => {
                            const Icon = plan.icon
                            return (
                                <Card
                                    key={plan.id}
                                    className={`relative flex flex-col transition-all duration-300 hover:shadow-2xl ${plan.cardClass}`}
                                >
                                    {plan.highlight && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                            <Badge className="bg-[#C78F7B] text-white px-4 py-1 font-bold shadow-lg">
                                                {plan.badge}
                                            </Badge>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-2xl ${plan.iconBg}`}>
                                                <Icon className={`h-6 w-6 ${plan.iconColor}`} />
                                            </div>
                                            {!plan.highlight && (
                                                <Badge variant="secondary" className={`font-medium ${plan.badgeClass}`}>
                                                    {plan.badge}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className={`text-2xl font-bold ${plan.titleColor}`}>{plan.name}</CardTitle>
                                        <CardDescription className={`mt-2 ${plan.descColor}`}>{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="mb-6">
                                            <span className={`text-4xl font-black ${plan.priceColor}`}>{plan.price}</span>
                                            <span className={`ml-2 font-medium text-sm ${plan.periodColor}`}>{plan.period}</span>
                                            <div className={`mt-2 text-sm ${plan.propColor}`}>{plan.properties}</div>
                                            {isTeam && (
                                                <p className={`text-xs mt-1 opacity-60 ${plan.titleColor}`}>Mínimo 2 miembros</p>
                                            )}
                                        </div>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start">
                                                    <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${plan.checkColor}`} />
                                                    <span className={`text-sm ${plan.featureColor}`}>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            onClick={() => handleSelectPlan(plan.id)}
                                            disabled={loading}
                                            className={`w-full py-7 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] ${plan.btnClass}`}
                                        >
                                            {loading && selectedPlanId === plan.id ? (
                                                <><CircleNotch className="h-5 w-5 mr-2 animate-spin" weight="bold" />Procesando...</>
                                            ) : (
                                                'Seleccionar Plan'
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
