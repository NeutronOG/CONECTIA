import { NextRequest, NextResponse } from 'next/server'
import { stripe, getSuccessUrl, getCancelUrl } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { planId, userId, userEmail } = await req.json()

    if (!planId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Configurar precio según el plan
    let planName = ''
    let planDescription = ''
    let unitAmount = 0

    if (planId === 'core') {
      planName = 'Plan Core - CONECTIA'
      planDescription = 'Hasta 6 propiedades activas'
      unitAmount = 9900 // $99.00 MXN en centavos
    } else if (planId === 'elite') {
      planName = 'Plan Elite - CONECTIA'
      planDescription = 'Propiedades ilimitadas + Asistente con IA'
      unitAmount = 39900 // $399.00 MXN en centavos
    } else if (planId === 'team-core') {
      planName = 'Plan Core Equipo - CONECTIA'
      planDescription = 'Hasta 6 propiedades activas por miembro · Mínimo 2 miembros'
      unitAmount = 5900 // $59.00 MXN en centavos por miembro
    } else if (planId === 'team-elite') {
      planName = 'Plan Elite Equipo - CONECTIA'
      planDescription = 'Propiedades ilimitadas + IA por miembro · Mínimo 2 miembros'
      unitAmount = 24900 // $249.00 MXN en centavos por miembro
    } else {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Crear Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: planName,
              description: planDescription,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      metadata: {
        userId,
        planId,
      },
      success_url: getSuccessUrl('{CHECKOUT_SESSION_ID}'),
      cancel_url: getCancelUrl(),
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'es',
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Error creating checkout session' },
      { status: 500 }
    )
  }
}
