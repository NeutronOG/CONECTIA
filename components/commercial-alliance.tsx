"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Building, Zap, Loader2, Users, Crown } from "lucide-react"
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

    // ── Planes individuales: fondo claro / texto oscuro (estilo original) ──────
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
            icon: Building,
            highlight: false,
            badge: "Básico",
            cardClass: "border-conectia-accent/10 bg-conectia-secondary/60 backdrop-blur-lg hover:-translate-y-1",
            iconBg: "bg-conectia-accent/5",
            iconColor: "text-conectia-accent/70",
            badgeClass: "bg-conectia-accent/5 text-conectia-accent",
            titleColor: "text-conectia-accent",
            descColor: "text-conectia-accent/60",
            priceColor: "text-conectia-accent",
            periodColor: "text-conectia-accent/50",
            propColor: "font-semibold text-conectia-accent/80",
            checkColor: "text-conectia-accent/40",
            featureColor: "text-conectia-accent/70",
            btnClass: "bg-conectia-accent/5 hover:bg-conectia-accent/10 text-conectia-accent",
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
            icon: Zap,
            highlight: true,
            badge: "Más Popular",
            // Fondo oscuro (conectia-accent = grafito), texto amarillo (conectia-primary)
            cardClass: "border-conectia-primary shadow-xl scale-105 z-10 bg-conectia-accent backdrop-blur-xl",
            iconBg: "bg-conectia-primary/20",
            iconColor: "text-conectia-primary",
            badgeClass: "bg-conectia-primary/20 text-conectia-primary",
            titleColor: "text-white",
            descColor: "text-white/60",
            priceColor: "text-conectia-primary",
            periodColor: "text-white/50",
            propColor: "font-semibold text-white/80",
            checkColor: "text-conectia-primary",
            featureColor: "text-white/70",
            btnClass: "bg-conectia-primary hover:bg-conectia-primary/90 text-conectia-accent shadow-lg hover:shadow-xl",
        }
    ]

    // ── Planes de equipo: versión negativa/invertida de los individuales ───────
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
            // Negativo del Core: fondo oscuro (conectia-accent), texto claro
            cardClass: "border-white/10 bg-conectia-accent backdrop-blur-lg hover:-translate-y-1",
            iconBg: "bg-white/5",
            iconColor: "text-white/70",
            badgeClass: "bg-white/5 text-white/80",
            titleColor: "text-white",
            descColor: "text-white/60",
            priceColor: "text-white",
            periodColor: "text-white/50",
            propColor: "font-semibold text-white/80",
            checkColor: "text-white/40",
            featureColor: "text-white/70",
            btnClass: "bg-white/10 hover:bg-white/20 text-white",
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
            // Negativo del Elite: fondo amarillo (conectia-primary), texto oscuro (conectia-accent)
            cardClass: "border-conectia-accent/30 shadow-xl scale-105 z-10 bg-conectia-primary backdrop-blur-xl",
            iconBg: "bg-conectia-accent/10",
            iconColor: "text-conectia-accent",
            badgeClass: "bg-conectia-accent/10 text-conectia-accent",
            titleColor: "text-conectia-accent",
            descColor: "text-conectia-accent/60",
            priceColor: "text-conectia-accent",
            periodColor: "text-conectia-accent/50",
            propColor: "font-semibold text-conectia-accent/80",
            checkColor: "text-conectia-accent",
            featureColor: "text-conectia-accent/70",
            btnClass: "bg-conectia-accent hover:bg-conectia-accent/90 text-conectia-primary shadow-lg hover:shadow-xl",
        }
    ]

    const activePlans = isTeam ? teamPlans : individualPlans

    return (
        <div className="min-h-screen bg-conectia-secondary relative overflow-hidden transition-all duration-500">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-conectia-primary/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-conectia-primary/5 rounded-full blur-3xl animate-float" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-conectia-primary/5 rotate-45 blur-2xl" />
            </div>

            <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-12 space-y-6">
                        <Badge variant="outline" className="px-4 py-1.5 text-sm border-conectia-accent/20 text-conectia-accent bg-conectia-accent/5 backdrop-blur-sm">
                            Alianza Comercial
                        </Badge>
                        <h1 className="font-serif text-4xl md:text-6xl font-black text-conectia-accent tracking-tight leading-tight">
                            Impulsa tu carrera <br />
                            <span className="text-conectia-primary">inmobiliaria</span>
                        </h1>
                        <p className="text-xl text-conectia-accent/70 max-w-2xl mx-auto font-light">
                            Únete a la red de asesores más exclusiva. Elige el plan que mejor se adapte a tu portafolio.
                        </p>
                    </div>

                    {/* ── Toggle Individual / Equipo ── */}
                    <div className="flex justify-center mb-12">
                        <div className="relative flex items-center bg-conectia-accent/8 border border-conectia-accent/15 rounded-2xl p-1.5 gap-1 shadow-inner">
                            {/* Sliding pill */}
                            <div
                                className="absolute top-1.5 bottom-1.5 rounded-xl bg-conectia-accent transition-all duration-300 ease-in-out shadow-md"
                                style={{
                                    left: isTeam ? 'calc(50% + 2px)' : '6px',
                                    right: isTeam ? '6px' : 'calc(50% + 2px)',
                                }}
                            />
                            <button
                                onClick={() => setIsTeam(false)}
                                className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                                    !isTeam ? 'text-conectia-primary' : 'text-conectia-accent/60 hover:text-conectia-accent'
                                }`}
                            >
                                <Building className="h-4 w-4" />
                                Individual
                            </button>
                            <button
                                onClick={() => setIsTeam(true)}
                                className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                                    isTeam ? 'text-conectia-primary' : 'text-conectia-accent/60 hover:text-conectia-accent'
                                }`}
                            >
                                <Users className="h-4 w-4" />
                                Equipo
                                <span className="ml-1 text-xs bg-conectia-primary/20 text-conectia-primary px-1.5 py-0.5 rounded-full font-bold">
                                    -40%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Subtitle for team */}
                    {isTeam && (
                        <p className="text-center text-conectia-accent/60 text-sm mb-8 -mt-6">
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
                                            <Badge className="bg-conectia-primary text-conectia-accent px-4 py-1 font-bold shadow-lg">
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
                                                <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Procesando...</>
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
