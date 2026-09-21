"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Buildings, Lightning, CircleNotch, Users, Diamond } from "@phosphor-icons/react"
import Link from "next/link"
import { toast } from "sonner"
import { useLanguage } from "@/lib/i18n"

const ALLIANCE_EN: Record<string, string> = {
    'Alianza Comercial': 'Commercial Partnership', 'Impulsa tu carrera': 'Advance your', 'inmobiliaria': 'real estate career',
    'Únete a la red de asesores más exclusiva. Elige el plan que mejor se adapte a tu portafolio.': 'Join the most exclusive advisor network. Choose the plan that best fits your portfolio.',
    'Individual': 'Individual', 'Equipo': 'Team', 'Para 2 o más miembros · Precio por miembro/mes': 'For 2 or more members · Price per member/month',
    'Plan Cimientos': 'Foundation Plan', 'Plan Torre': 'Tower Plan', 'Plan Conjunto': 'Team Plan', 'Plan Ciudad': 'City Plan',
    '/mes': '/month', '/mes por miembro': '/month per member', 'Hasta 6 propiedades': 'Up to 6 properties', 'Hasta 40 propiedades': 'Up to 40 properties',
    'Hasta 6 propiedades por miembro': 'Up to 6 properties per member', 'Hasta 40 propiedades por miembro': 'Up to 40 properties per member',
    'Comienza a construir tu carrera como asesor inmobiliario.': 'Start building your career as a real estate advisor.',
    'Eleva tu portafolio y llega más alto en el mercado.': 'Elevate your portfolio and go further in the market.',
    'Construye en equipo. Unidos crean más oportunidades.': 'Build as a team. Together you create more opportunities.',
    'Un equipo que domina el territorio y escala sin límites.': 'A team that masters its market and scales without limits.',
    'Básico': 'Basic', 'Más Popular': 'Most Popular', 'Mínimo 2 miembros': 'Minimum 2 members',
    'Hasta 6 propiedades activas': 'Up to 6 active properties', 'Hasta 40 propiedades activas': 'Up to 40 active properties',
    'Hasta 6 propiedades activas por miembro': 'Up to 6 active properties per member', 'Hasta 40 propiedades activas por miembro': 'Up to 40 active properties per member',
    'Panel de gestión básico': 'Basic management dashboard', 'Panel de gestión avanzado': 'Advanced management dashboard',
    'Estadísticas de propiedades': 'Property statistics', 'Estadísticas detalladas y reportes': 'Detailed statistics and reports',
    'Gestión de leads': 'Lead management', 'Gestión avanzada de leads': 'Advanced lead management', 'Soporte por email': 'Email support',
    'Acceso a la plataforma web': 'Web platform access', 'Asistente con Inteligencia Artificial': 'Artificial Intelligence assistant',
    'Prioridad en soporte': 'Priority support', 'Acceso a herramientas exclusivas': 'Access to exclusive tools',
    'Marketing automatizado': 'Automated marketing', 'Análisis predictivo de mercado': 'Predictive market analysis',
    'Seleccionar Plan': 'Select Plan', 'Procesando...': 'Processing...'
}

export function CommercialAlliance() {
    const { language } = useLanguage()
    const tr = (text: string) => language === 'en' ? (ALLIANCE_EN[text] || text) : text
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
            name: "Plan Cimientos",
            price: "$99",
            period: "/mes",
            properties: "Hasta 6 propiedades",
            description: "Comienza a construir tu carrera como asesor inmobiliario.",
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
            cardClass: "border-[#17313A]/30 bg-[#17313A]/[0.08] dark:border-[var(--conectia-arcilla)]/30 dark:bg-[var(--conectia-arcilla)]/[0.08] backdrop-blur-2xl hover:-translate-y-1 shadow-lg hover:shadow-xl",
            iconBg: "bg-[#17313A]/10 dark:bg-[var(--conectia-arcilla)]/10",
            iconColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            badgeClass: "bg-[#17313A]/20 text-[#17313A] border-[#17313A]/40 dark:bg-[var(--conectia-arcilla)]/20 dark:text-[var(--conectia-arcilla)] dark:border-[var(--conectia-arcilla)]/40",
            titleColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            descColor: "text-[#4A4F57] dark:text-[#B0ACA6]",
            priceColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            periodColor: "text-[#4A4F57] dark:text-[#B0ACA6]",
            propColor: "font-semibold text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            checkColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            featureColor: "text-[#4A4F57] dark:text-[#D5D2C9]",
            btnClass: "bg-[#17313A] hover:bg-[#1F3D47] text-white dark:bg-[var(--conectia-arcilla)] dark:hover:bg-[var(--conectia-arcilla-hover)] border-0 font-semibold shadow-lg",
        },
        {
            id: "elite",
            name: "Plan Torre",
            price: "$399",
            period: "/mes",
            properties: "Hasta 40 propiedades",
            description: "Eleva tu portafolio y llega más alto en el mercado.",
            features: [
                "Hasta 40 propiedades activas",
                "Asistente con Inteligencia Artificial",
                "Panel de gestión avanzado",
                "Estadísticas detalladas y reportes",
                "Gestión avanzada de leads",
                "Prioridad en soporte",
                "Acceso a herramientas exclusivas",
                "Marketing automatizado",
                "Análisis predictivo de mercado"
            ],
            icon: Lightning,
            highlight: true,
            badge: "Más Popular",
            cardClass: "border-[#17313A]/40 shadow-2xl scale-105 z-10 bg-[#17313A]/[0.12] dark:border-[var(--conectia-arcilla)]/40 dark:bg-[var(--conectia-arcilla)]/[0.12] backdrop-blur-xl",
            iconBg: "bg-[#17313A]/10 dark:bg-[var(--conectia-arcilla)]/10",
            iconColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            badgeClass: "bg-[#17313A]/30 text-[#17313A] border-[#17313A]/50 dark:bg-[var(--conectia-arcilla)]/30 dark:text-[var(--conectia-arcilla)] dark:border-[var(--conectia-arcilla)]/50",
            titleColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            descColor: "text-[#4A4F57] dark:text-[#B0ACA6]",
            priceColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            periodColor: "text-[#4A4F57] dark:text-[#B0ACA6]",
            propColor: "font-semibold text-[#EAE4DD]",
            checkColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            featureColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            btnClass: "bg-[#17313A] hover:bg-[#1F3D47] text-white dark:bg-[var(--conectia-arcilla)] dark:hover:bg-[var(--conectia-arcilla-hover)] shadow-lg hover:shadow-xl font-semibold border-0",
        }
    ]

    // ── Planes de equipo ───────
    const teamPlans = [
        {
            id: "team-core",
            name: "Plan Conjunto",
            price: "$59",
            period: "/mes por miembro",
            properties: "Hasta 6 propiedades por miembro",
            description: "Construye en equipo. Unidos crean más oportunidades.",
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
            cardClass: "border-[#17313A]/30 bg-[#17313A]/[0.08] dark:border-[var(--conectia-arcilla)]/30 dark:bg-[var(--conectia-arcilla)]/[0.08] backdrop-blur-2xl hover:-translate-y-1 shadow-lg hover:shadow-xl",
            iconBg: "bg-[#17313A]/10 dark:bg-[var(--conectia-arcilla)]/10",
            iconColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            badgeClass: "bg-[#17313A]/20 text-[#17313A] border-[#17313A]/40 dark:bg-[var(--conectia-arcilla)]/20 dark:text-[var(--conectia-arcilla)] dark:border-[var(--conectia-arcilla)]/40",
            titleColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            descColor: "text-[#4A4F57] dark:text-[#B0ACA6]",
            priceColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            periodColor: "text-[#4A4F57] dark:text-[#B0ACA6]",
            propColor: "font-semibold text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            checkColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            featureColor: "text-[#4A4F57] dark:text-[#D5D2C9]",
            btnClass: "bg-[#17313A] hover:bg-[#1F3D47] text-white dark:bg-[var(--conectia-arcilla)] dark:hover:bg-[var(--conectia-arcilla-hover)] border-0 font-semibold shadow-lg",
        },
        {
            id: "team-elite",
            name: "Plan Ciudad",
            price: "$249",
            period: "/mes por miembro",
            properties: "Hasta 40 propiedades por miembro",
            description: "Un equipo que domina el territorio y escala sin límites.",
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
            icon: Diamond,
            highlight: true,
            badge: "Más Popular",
            cardClass: "border-[#17313A]/40 shadow-2xl scale-105 z-10 bg-[#17313A]/[0.12] dark:border-[var(--conectia-arcilla)]/40 dark:bg-[var(--conectia-arcilla)]/[0.12] backdrop-blur-xl",
            iconBg: "bg-[#17313A]/10 dark:bg-[var(--conectia-arcilla)]/10",
            iconColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            badgeClass: "bg-[#17313A]/30 text-[#17313A] border-[#17313A]/50 dark:bg-[var(--conectia-arcilla)]/30 dark:text-[var(--conectia-arcilla)] dark:border-[var(--conectia-arcilla)]/50",
            titleColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            descColor: "text-[#4A4F57] dark:text-[#B0ACA6]",
            priceColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            periodColor: "text-[#4A4F57] dark:text-[#B0ACA6]",
            propColor: "font-semibold text-[#EAE4DD]",
            checkColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            featureColor: "text-[#17313A] dark:text-[var(--conectia-arcilla)]",
            btnClass: "bg-[#17313A] hover:bg-[#1F3D47] text-white dark:bg-[var(--conectia-arcilla)] dark:hover:bg-[var(--conectia-arcilla-hover)] shadow-lg hover:shadow-xl font-semibold border-0",
        }
    ]

    const activePlans = isTeam ? teamPlans : individualPlans

    return (
        <div className="min-h-screen bg-[#F6F2EE] dark:bg-[#0F2027] relative overflow-hidden transition-all duration-500">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#17313A]/12 dark:bg-[var(--conectia-arcilla)]/12 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#17313A]/6 dark:bg-[var(--conectia-arcilla)]/6 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#17313A]/6 dark:bg-[var(--conectia-arcilla)]/6 rotate-45 blur-2xl" />
            </div>

            <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-12 space-y-6">
                        <Badge variant="outline" className="px-4 py-1.5 text-sm border-[#17313A]/40 text-[#17313A] dark:border-[var(--conectia-arcilla)]/40 dark:text-[var(--conectia-arcilla)] bg-[#17313A]/10 dark:bg-[var(--conectia-arcilla)]/10 backdrop-blur-sm">
                            {tr('Alianza Comercial')}
                        </Badge>
                        <h1 className="font-serif text-4xl md:text-6xl font-black text-[#17313A] dark:text-[var(--conectia-arcilla)] tracking-tight leading-tight">
                            {tr('Impulsa tu carrera')} <br />
                            <span className="text-[var(--conectia-arcilla)] italic">{tr('inmobiliaria')}</span>
                        </h1>
                        <p className="text-xl text-[#4A4F57] dark:text-[#B0ACA6] max-w-2xl mx-auto font-light">
                            {tr('Únete a la red de asesores más exclusiva. Elige el plan que mejor se adapte a tu portafolio.')}
                        </p>
                    </div>

                    {/* ── Toggle Individual / Equipo ── */}
                    <div className="flex justify-center mb-12">
                        <div className="relative flex items-center bg-[#17313A]/10 dark:bg-[var(--conectia-arcilla)]/10 border border-[#17313A]/15 dark:border-[var(--conectia-arcilla)]/15 rounded-2xl p-1.5 gap-1 shadow-sm">
                            {/* Sliding pill */}
                            <div
                                className="absolute top-1.5 bottom-1.5 rounded-xl bg-[#17313A] dark:bg-[var(--conectia-arcilla)] transition-all duration-300 ease-in-out shadow-md"
                                style={{
                                    left: isTeam ? 'calc(50% + 2px)' : '6px',
                                    right: isTeam ? '6px' : 'calc(50% + 2px)',
                                }}
                            />
                            <button
                                onClick={() => setIsTeam(false)}
                                className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                                    !isTeam 
                                        ? 'text-white dark:text-[#17313A]' 
                                        : 'text-[#17313A]/60 dark:text-[#EAE4DD]/60 hover:text-[#17313A] dark:hover:text-[#EAE4DD]'
                                }`}
                            >
                                <Buildings className="h-4 w-4" weight={!isTeam ? "fill" : "duotone"} />
                                {tr('Individual')}
                            </button>
                            <button
                                onClick={() => setIsTeam(true)}
                                className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                                    isTeam 
                                        ? 'text-white dark:text-[#17313A]' 
                                        : 'text-[#17313A]/60 dark:text-[#EAE4DD]/60 hover:text-[#17313A] dark:hover:text-[#EAE4DD]'
                                }`}
                            >
                                <Users className="h-4 w-4" weight={isTeam ? "fill" : "duotone"} />
                                {tr('Equipo')}
                                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold transition-colors duration-300 ${
                                    isTeam
                                        ? 'bg-white/20 text-white dark:bg-[#17313A]/15 dark:text-[#17313A]'
                                        : 'bg-[#17313A]/10 dark:bg-[var(--conectia-arcilla)]/10 text-[#17313A] dark:text-[var(--conectia-arcilla)]'
                                }`}>
                                    -40%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Subtitle for team */}
                    {isTeam && (
                        <p className="text-center text-[#4A4F57] dark:text-[#B0ACA6] text-sm mb-8 -mt-6">
                            {tr('Para 2 o más miembros · Precio por miembro/mes')}
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
                                            <Badge className="bg-[#17313A] text-white dark:bg-[var(--conectia-arcilla)] dark:text-white px-4 py-1 font-bold shadow-lg">
                                                {tr(plan.badge)}
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
                                                    {tr(plan.badge)}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className={`text-2xl font-bold ${plan.titleColor}`}>{tr(plan.name)}</CardTitle>
                                        <CardDescription className={`mt-2 ${plan.descColor}`}>{tr(plan.description)}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="mb-6">
                                            <span className={`text-4xl font-black ${plan.priceColor}`}>{plan.price}</span>
                                            <span className={`ml-2 font-medium text-sm ${plan.periodColor}`}>{tr(plan.period)}</span>
                                            <div className={`mt-2 text-sm ${plan.propColor}`}>{tr(plan.properties)}</div>
                                            {isTeam && (
                                                <p className={`text-xs mt-1 opacity-60 ${plan.titleColor}`}>{tr('Mínimo 2 miembros')}</p>
                                            )}
                                        </div>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start">
                                                    <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${plan.checkColor}`} />
                                                    <span className={`text-sm ${plan.featureColor}`}>{tr(feature)}</span>
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
                                                <><CircleNotch className="h-5 w-5 mr-2 animate-spin" weight="bold" />{tr('Procesando...')}</>
                                            ) : (
                                                tr('Seleccionar Plan')
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
