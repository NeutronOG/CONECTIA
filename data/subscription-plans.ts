export type PlanType = 'core' | 'elite' | 'team-core' | 'team-elite'

export interface SubscriptionPlan {
  id: PlanType
  name: string
  displayName: string
  description: string
  price: number
  priceText: string
  maxProperties: number
  features: string[]
  recommended?: boolean
}

export const teamPlans: SubscriptionPlan[] = [
  {
    id: 'team-core',
    name: 'Plan Core Equipo',
    displayName: 'Core Equipo',
    description: 'Plan Core para equipos de 2 o más miembros',
    price: 59,
    priceText: '$59 MXN/mes por miembro',
    maxProperties: 6,
    features: [
      'Hasta 6 propiedades activas por miembro',
      'Panel de gestión básico',
      'Estadísticas de propiedades',
      'Gestión de leads',
      'Soporte por email',
      'Acceso a la plataforma web',
      'Mínimo 2 miembros',
    ]
  },
  {
    id: 'team-elite',
    name: 'Plan Elite Equipo',
    displayName: 'Elite Equipo',
    description: 'Plan Elite para equipos de 2 o más miembros',
    price: 249,
    priceText: '$249 MXN/mes por miembro',
    maxProperties: -1,
    features: [
      'Propiedades ilimitadas por miembro',
      'Asistente con Inteligencia Artificial',
      'Panel de gestión avanzado',
      'Estadísticas detalladas y reportes',
      'Gestión avanzada de leads',
      'Prioridad en soporte',
      'Acceso a herramientas premium',
      'Marketing automatizado',
      'Análisis predictivo de mercado',
      'Mínimo 2 miembros',
    ],
    recommended: true
  }
]

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'core',
    name: 'Plan Core',
    displayName: 'Core',
    description: 'Perfecto para comenzar tu carrera como asesor inmobiliario',
    price: 99,
    priceText: '$99 MXN/mes',
    maxProperties: 6,
    features: [
      'Hasta 6 propiedades activas',
      'Panel de gestión básico',
      'Estadísticas de propiedades',
      'Gestión de leads',
      'Soporte por email',
      'Acceso a la plataforma web',
    ]
  },
  {
    id: 'elite',
    name: 'Plan Elite',
    displayName: 'Elite',
    description: 'Para asesores profesionales que buscan maximizar su potencial',
    price: 399,
    priceText: '$399 MXN/mes',
    maxProperties: 40,
    features: [
      'Hasta 40 propiedades activas',
      'Asistente con Inteligencia Artificial',
      'Panel de gestión avanzado',
      'Estadísticas detalladas y reportes',
      'Gestión avanzada de leads',
      'Prioridad en soporte',
      'Acceso a herramientas premium',
      'Marketing automatizado',
      'Análisis predictivo de mercado',
    ],
    recommended: true
  }
]

export function getPlanById(planId: PlanType): SubscriptionPlan | undefined {
  return [...subscriptionPlans, ...teamPlans].find(plan => plan.id === planId)
}

export function canAddProperty(currentPlan: PlanType, currentPropertyCount: number): boolean {
  const plan = getPlanById(currentPlan)
  if (!plan) return false
  
  // Si maxProperties es -1, es ilimitado
  if (plan.maxProperties === -1) return true
  
  // Verificar si no ha alcanzado el límite
  return currentPropertyCount < plan.maxProperties
}

export function getPropertyLimit(planId: PlanType): number {
  const plan = getPlanById(planId)
  return plan?.maxProperties ?? 0
}
