import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Fetch live properties from Supabase
async function getProperties() {
  try {
    const { data, error } = await supabase
      .from('propiedades')
      .select('id, titulo, ubicacion, precio, precio_texto, tipo, habitaciones, banos, area, area_texto, imagen, descripcion, caracteristicas, status, categoria')
      .eq('status', 'Disponible')
      .limit(50)

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

function buildSystemPrompt(properties: any[]) {
  const propSummary = properties.map(p =>
    `[ID:${p.id}] ${p.titulo} | ${p.ubicacion} | ${p.precio_texto || p.precio} | ${p.tipo} | ${p.habitaciones}hab ${p.banos}baños ${p.area}m² | ${p.categoria || 'venta'}`
  ).join('\n')

  return `Eres el asistente virtual de CONECTIA, una plataforma inmobiliaria premium en León, Guanajuato, México.

Tu nombre es CONECTIA AI. Eres amable, profesional y muy conocedor del mercado inmobiliario mexicano.

PROPIEDADES DISPONIBLES AHORA MISMO:
${propSummary || 'No hay propiedades disponibles en este momento.'}

INSTRUCCIONES:
- Ayuda a encontrar propiedades según los criterios del usuario (precio, tipo, ubicación, habitaciones, etc.)
- Cuando encuentres propiedades relevantes, menciona sus IDs entre corchetes [ID:X] para que el sistema las muestre
- Responde SIEMPRE en español
- Sé conciso y útil — máximo 3-4 oraciones por respuesta
- Si no hay propiedades que coincidan, ofrece alternativas o sugiere contactar a un asesor
- Puedes responder preguntas sobre el proceso de compra/venta, créditos hipotecarios, zonas de León, etc.
- Si te preguntan por WhatsApp o contacto: +52 477 475 6951 | conectiaselect@gmail.com
- Para visitas, siempre sugiere agendar con un asesor CONECTIA

FORMATO DE RESPUESTA:
- Responde en texto natural
- Cuando menciones propiedades específicas, incluye [ID:X] para cada una
- Ejemplo: "Encontré 2 opciones ideales: [ID:5] en Gran Jardín y [ID:12] en Campestre"

PROCESO DE COMPRA CONECTIA:
1. Búsqueda personalizada con asesor
2. Visitas a propiedades seleccionadas
3. Negociación y oferta
4. Due diligence y documentación
5. Escrituración ante notario`
}

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationHistory } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Mensajes requeridos' }, { status: 400 })
    }

    const properties = await getProperties()
    const systemPrompt = buildSystemPrompt(properties)

    // Build conversation history for context
    const history = (conversationHistory || []).map((m: any) => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.content,
    }))

    // Add new user message
    const userMessage = messages[messages.length - 1]
    const allMessages = [
      ...history,
      { role: 'user' as const, content: userMessage.content }
    ]

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: allMessages,
    })

    const aiText = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    // Extract property IDs mentioned in response [ID:X]
    const idMatches = aiText.matchAll(/\[ID:(\d+)\]/g)
    const mentionedIds = [...idMatches].map(m => parseInt(m[1]))

    // Get full property objects for mentioned IDs
    const mentionedProperties = properties.filter(p => mentionedIds.includes(p.id))

    // Clean text (remove [ID:X] markers from display text)
    const cleanText = aiText.replace(/\[ID:\d+\]/g, '').trim()

    return NextResponse.json({
      response: cleanText,
      properties: mentionedProperties,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        // claude-haiku-4-5 pricing: $0.80/M input, $4.00/M output
        estimated_cost_usd: (
          (response.usage.input_tokens / 1_000_000) * 0.80 +
          (response.usage.output_tokens / 1_000_000) * 4.00
        ).toFixed(6),
      }
    })

  } catch (error: any) {
    console.error('Claude AI error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
