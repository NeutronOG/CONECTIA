import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase/client'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Manejar diferentes tipos de eventos
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded for invoice:', invoice.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', invoice.id)
        // Aquí podrías enviar un email al usuario notificándole
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session')
    return
  }

  console.log(`Checkout completed for user ${userId}, plan ${planId}`)

  // Actualizar el plan del usuario en Supabase
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ 
        plan: planId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user plan:', error)
    } else {
      console.log(`Successfully updated user ${userId} to plan ${planId}`)
    }
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  try {
    // Buscar usuario por stripe_customer_id
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (error || !user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // Actualizar estado de suscripción
    const isActive = subscription.status === 'active'
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ 
        plan: isActive ? 'elite' : 'core',
        stripe_subscription_id: subscription.id,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating subscription:', updateError)
    }
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  try {
    // Buscar usuario por stripe_customer_id
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (error || !user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // Revertir al plan gratuito
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ 
        plan: 'core',
        stripe_subscription_id: null,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error reverting to free plan:', updateError)
    } else {
      console.log(`User ${user.id} reverted to core plan`)
    }
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error)
  }
}
