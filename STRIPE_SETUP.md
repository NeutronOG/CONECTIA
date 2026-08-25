# Configuración de Stripe para Suscripciones

Este documento explica cómo configurar Stripe para el sistema de suscripciones de ARKIN SELECT.

## 1. Variables de Entorno

Crea o actualiza tu archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Stripe API Keys (proporcionadas por el administrador)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica_aqui
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta_aqui

# Stripe Webhook Secret (se obtiene después de configurar el webhook)
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# URL de la aplicación
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

## 2. Configurar Webhook en Stripe Dashboard

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Haz clic en "Add endpoint"
3. Ingresa la URL de tu webhook: `https://tu-dominio.com/api/stripe/webhook`
4. Selecciona los siguientes eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copia el "Signing secret" y agrégalo a `.env.local` como `STRIPE_WEBHOOK_SECRET`

## 3. Configurar Base de Datos (Supabase)

Agrega las siguientes columnas a la tabla `usuarios` si no existen:

```sql
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'core',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_stripe_customer_id ON usuarios(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_plan ON usuarios(plan);
```

## 4. Planes Disponibles

### Plan Core (Gratuito)
- Hasta 6 propiedades activas
- Panel de gestión básico
- Estadísticas de propiedades
- Gestión de leads
- Soporte por email

### Plan Elite ($999 MXN/mes)
- Propiedades ilimitadas (7+)
- Asistente con Inteligencia Artificial
- Panel de gestión avanzado
- Estadísticas detalladas y reportes
- Gestión avanzada de leads
- Prioridad en soporte
- Marketing automatizado
- Análisis predictivo de mercado

## 5. Flujo de Pago

1. El usuario selecciona el Plan Elite en `/panel-asesor/planes`
2. Se crea una sesión de checkout en Stripe
3. El usuario es redirigido a Stripe Checkout
4. Después del pago exitoso:
   - Stripe envía un webhook a `/api/stripe/webhook`
   - El sistema actualiza el plan del usuario en la base de datos
   - El usuario es redirigido a `/panel-asesor/planes/success`

## 6. Webhooks Implementados

### `checkout.session.completed`
Se activa cuando un usuario completa el pago. Actualiza el plan del usuario a 'elite'.

### `customer.subscription.updated`
Se activa cuando una suscripción se actualiza (renovación, cambio de plan, etc.).

### `customer.subscription.deleted`
Se activa cuando una suscripción se cancela. Revierte al usuario al Plan Core.

### `invoice.payment_succeeded`
Se activa cuando un pago de factura es exitoso (renovaciones mensuales).

### `invoice.payment_failed`
Se activa cuando un pago falla. Puedes implementar lógica para notificar al usuario.

## 7. Testing en Desarrollo

Para probar webhooks en desarrollo local:

1. Instala Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Inicia sesión: `stripe login`
3. Reenvía webhooks a tu servidor local:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Usa las claves de prueba de Stripe en `.env.local`
5. Usa tarjetas de prueba: `4242 4242 4242 4242`

## 8. Seguridad

- ✅ Las claves secretas están en `.env.local` (no en el repositorio)
- ✅ Los webhooks verifican la firma de Stripe
- ✅ Las sesiones de checkout incluyen metadata del usuario
- ✅ Solo usuarios autenticados pueden crear sesiones de checkout

## 9. Monitoreo

Revisa regularmente en Stripe Dashboard:
- Pagos exitosos y fallidos
- Suscripciones activas
- Webhooks recibidos y procesados
- Disputas o reembolsos

## 10. Soporte

Si tienes problemas:
1. Verifica que las variables de entorno estén configuradas correctamente
2. Revisa los logs del webhook en Stripe Dashboard
3. Verifica que la URL del webhook sea accesible públicamente
4. Asegúrate de que la base de datos tenga las columnas necesarias
