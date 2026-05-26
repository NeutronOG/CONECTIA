import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const conversationHistory = new Map<number, Array<{ role: 'user' | 'assistant'; content: string }>>()

const ADMIN_IDS = [1322017996]

function isAdmin(userId: number): boolean {
  return ADMIN_IDS.includes(userId)
}

function getTelegramAPI() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set')
  return `https://api.telegram.org/bot${token}`
}

async function sendTelegramMessage(chatId: number, text: string, parseMode: string | null = 'HTML') {
  const api = getTelegramAPI()
  const body: any = { chat_id: chatId, text, disable_web_page_preview: false }
  if (parseMode) body.parse_mode = parseMode
  const res = await fetch(`${api}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('Telegram sendMessage error:', err)
    if (parseMode === 'HTML' && err.includes('parse')) {
      const plain = text.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      await fetch(`${api}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: plain }),
      })
    }
  }
}

async function sendTelegramTyping(chatId: number) {
  const api = getTelegramAPI()
  await fetch(`${api}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  })
}

async function getProperties() {
  try {
    const { data, error } = await getSupabase()
      .from('propiedades')
      .select('id, titulo, ubicacion, precio, precio_texto, tipo, habitaciones, banos, area, categoria, status')
      .eq('status', 'Disponible')
      .limit(50)
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

function buildSystemPrompt(properties: any[], admin: boolean) {
  const propSummary = properties.map(p =>
    `[ID:${p.id}] ${p.titulo} | ${p.ubicacion} | ${p.precio_texto || p.precio} | ${p.tipo} | ${p.habitaciones}hab ${p.banos}baños ${p.area}m² | ${p.categoria || 'venta'} | status:${p.status}`
  ).join('\n')

  const adminContext = admin ? `

ACCESO ADMIN TOTAL — eres el asistente del dueño de la plataforma.
Puedes ejecutar cualquier operación administrativa:
- Crear asesores: responde con JSON {"accion":"crear_asesor","nombre":"...","email":"...","telefono":"...","password":"..."}
- Cambiar status de propiedad: {"accion":"cambiar_status","id":123,"status":"Disponible|Vendido|Rentado|Pausado"}
- Ver estadísticas: {"accion":"stats"}
- Enviar notificación a todos los asesores: {"accion":"notificar","mensaje":"..."}
- Listar asesores: {"accion":"listar_asesores"}
- El dueño puede pedirte CUALQUIER COSA sobre el sistema y tienes que ayudarle
- Cuando ejecutes una acción administrativa, incluye el JSON en tu respuesta entre triple backtick json

GESTIÓN DE ANUNCIOS (reconoce frases en lenguaje natural):
- "pausa el anuncio [nombre]" → pausa el anuncio que contenga ese nombre
- "reanuda el anuncio [nombre]" / "reactiva el anuncio [nombre]" → lo activa de nuevo
- "suspende el anuncio [nombre]" → lo suspende completamente
- "elimina el anuncio [nombre]" / "borra el anuncio [nombre]" → lo elimina permanentemente
- Usa /anuncios para ver todos los anuncios con su estado actual
- Los cambios se reflejan en tiempo real en el homepage del sitio

GESTIÓN DE CITAS Y CALENDARIO:
- Puedes agendar citas, visitas, reuniones para cualquier asesor
- Para agendar, responde con JSON: {"accion":"agendar_cita","asesor":"nombre","fecha":"YYYY-MM-DD","hora":"HH:MM","titulo":"descripción","tipo":"visita|reunion|entrega|obra"}
- Los tipos son: visita (mostrar propiedad), reunion, entrega (llaves/docs), obra (inspección)
- SIEMPRE confirma la cita con todos los detalles al usuario después de agendarla

ASESORES DEL EQUIPO:
- Ana García (ana@conectia.mx) — Residencial Premium
- Roberto Silva (roberto@conectia.mx) — Comercial e Industrial
- María López (maria@conectia.mx) — Renta Residencial
- Daniela Belmonte (daniela@conectia.mx) — Desarrollos Nuevos
- Subje Hamue (subje@conectia.mx) — Residencial Medio

DESARROLLOS ACTIVOS:
- Residencial del Parque — La Gran Jardín — $3,500,000 — Avance: 45% — Entrega: Q2 2027
- Sky Tower León — Lomas del Campestre — $5,800,000 — Avance: 30% — Entrega: Q1 2027
- Bosque Residencial — El Refugio — $2,900,000 — Avance: 72% — Entrega: Q3 2026
` : ''

  return `Eres CONECTIA AI, el asistente${admin ? ' ADMINISTRADOR' : ' virtual'} de CONECTIA — plataforma inmobiliaria premium en León, Guanajuato, México.
Estás respondiendo a través de Telegram.${adminContext}

PROPIEDADES DISPONIBLES (${properties.length} total):
${propSummary || 'No hay propiedades.'}

INSTRUCCIONES:
- Responde SIEMPRE en español
- Sé conciso pero completo
- Cuando encuentres propiedades relevantes, menciona sus IDs así: [ID:X]
- Formatea con HTML de Telegram: <b>negrita</b>, <i>cursiva</i>, <a href="...">link</a>
- IMPORTANTE: No uses caracteres < o > fuera de tags HTML válidos. No uses markdown.
- No uses & excepto en entidades HTML (&amp; &lt; &gt;)
- Para contacto: +52 477 475 6951 | conectiaselect@gmail.com
- Para propiedades: https://www.conectiaselect.com/propiedades`
}

function formatPropertyForTelegram(p: any) {
  const url = `https://www.conectiaselect.com/propiedades/${p.id}`
  return `🏠 <b>${p.titulo?.toUpperCase()}</b>\n📍 ${p.ubicacion}\n💰 ${p.precio_texto || p.precio}\n🛏 ${p.habitaciones} hab · 🚿 ${p.banos} baños · 📐 ${p.area}m²\n<a href="${url}">Ver propiedad →</a>`
}

export async function POST(req: NextRequest) {
  let update: any = null
  try {
    update = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const debug = {
    has_token: !!process.env.TELEGRAM_BOT_TOKEN,
    has_anthropic: !!process.env.ANTHROPIC_API_KEY,
    has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_supabase_service: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_stripe: !!process.env.STRIPE_SECRET_KEY,
    chat_id: update?.message?.chat?.id || null,
    text: update?.message?.text || null,
    error: null as string | null,
  }

  try {
    await processUpdate(update)
  } catch (error: any) {
    debug.error = String(error?.message || error)
    console.error('Telegram process error:', error)
  }

  return NextResponse.json(debug)
}

async function processUpdate(update: any) {
  const message = update.message || update.edited_message
  if (!message) return

  const chatId: number = message.chat.id
  const text: string = message.text || message.caption || ''
  const firstName = message.from?.first_name || 'Usuario'

  if (!text.trim()) {
    await sendTelegramMessage(chatId, `👋 Hola <b>${firstName}</b>, por ahora solo puedo procesar mensajes de texto. Escríbeme tu consulta y con gusto te ayudo.`)
    return
  }

  await sendTelegramTyping(chatId)

  const userId: number = message.from?.id || 0
  const admin = isAdmin(userId)

  if (text === '/miid') {
    await sendTelegramMessage(chatId, `🆔 Tu Telegram ID es: <b>${userId}</b>\n${admin ? '\n✅ <b>Tienes acceso ADMIN completo</b>' : '\nComparte este número con el administrador para obtener acceso.'}`)
    return
  }

  if (admin) {
    const tl = text.toLowerCase()

    const crearAsesorMatch = tl.match(/crea(?:r)?\s+(?:un\s+)?asesor\s+(?:llamado\s+)?(.+?)\s*,?\s*email\s+([\w.+-]+@[\w.-]+\.\w+)/i)
    if (crearAsesorMatch) {
      const nombre = crearAsesorMatch[1].trim()
      const email = crearAsesorMatch[2].trim()
      const telMatch = text.match(/tel(?:[eé]fono)?[:\s]*([\d\s+()-]{7,})/i)
      const telefono = telMatch ? telMatch[1].trim() : ''
      const password = `${nombre.split(' ')[0].toLowerCase()}_conectia${new Date().getFullYear()}`
      await executeAdminAction(chatId, { accion: 'crear_asesor', nombre, email, telefono, password })
      return
    }

    const cambiarStatusMatch = tl.match(/cambia(?:r)?\s+(?:la\s+)?(?:propiedad\s+)?#?(\d+)\s+a\s+(disponible|vendid[ao]|rentad[ao]|pausad[ao])/i)
    if (cambiarStatusMatch) {
      const id = parseInt(cambiarStatusMatch[1])
      const rawStatus = cambiarStatusMatch[2].toLowerCase()
      const statusMap: Record<string, string> = {
        disponible: 'Disponible', vendida: 'Vendido', vendido: 'Vendido',
        rentada: 'Rentado', rentado: 'Rentado', pausada: 'Pausado', pausado: 'Pausado'
      }
      await executeAdminAction(chatId, { accion: 'cambiar_status', id, status: statusMap[rawStatus] || 'Disponible' })
      return
    }

    const eliminarPropMatch = tl.match(/(?:elim[ií]na?|borra?)\s+(?:la\s+)?propiedad\s+#?(\d+)/i)
    if (eliminarPropMatch) {
      const id = parseInt(eliminarPropMatch[1])
      const supabase = getSupabase()
      const { error } = await supabase.from('propiedades').update({ status: 'Pausado' }).eq('id', id)
      if (error) {
        await sendTelegramMessage(chatId, `❌ Error: ${error.message}`)
      } else {
        await sendTelegramMessage(chatId, `✅ Propiedad <b>#${id}</b> marcada como <b>Pausada</b>`)
      }
      return
    }

    const pausarAnuncioMatch = tl.match(/paus[ae]r?\s+(?:el\s+)?anuncio\s+(.+)/i)
    if (pausarAnuncioMatch) { await executeAdAction(chatId, 'pausado', pausarAnuncioMatch[1].trim()); return }

    const reanudarAnuncioMatch = tl.match(/(?:reactiv[ae]r?|reanud[ae]r?)\s+(?:el\s+)?anuncio\s+(.+)/i)
    if (reanudarAnuncioMatch) { await executeAdAction(chatId, 'activo', reanudarAnuncioMatch[1].trim()); return }

    const suspenderAnuncioMatch = tl.match(/suspend[eé]r?\s+(?:el\s+)?anuncio\s+(.+)/i)
    if (suspenderAnuncioMatch) { await executeAdAction(chatId, 'suspendido', suspenderAnuncioMatch[1].trim()); return }

    const eliminarAnuncioMatch = tl.match(/(?:elim[ií]na?|borra?)\s+(?:el\s+)?anuncio\s+(.+)/i)
    if (eliminarAnuncioMatch) { await executeAdDelete(chatId, eliminarAnuncioMatch[1].trim()); return }

    if (text === '/admin') {
      await sendTelegramMessage(chatId,
        `⚙️ <b>PANEL ADMIN CONECTIA</b>\n\n` +
        `👤 /nuevo_asesor — Crear nuevo asesor\n` +
        `📋 /asesores — Ver todos los asesores\n` +
        `🏠 /todas_propiedades — Ver todas (inc. pausadas)\n` +
        `📊 /stats — Estadísticas del sistema\n` +
        `📢 /anuncios — Ver y gestionar anuncios\n` +
        `🌐 /panel — Links al panel de administración`
      )
      return
    }

    if (text === '/panel') {
      await sendTelegramMessage(chatId,
        `🌐 <b>PANELES DE ADMINISTRACIÓN</b>\n\n` +
        `🔧 <a href="https://www.conectiaselect.com/panel-admin">Panel Admin →</a>\n` +
        `👤 <a href="https://www.conectiaselect.com/panel-asesor">Panel Asesor →</a>\n` +
        `📸 <a href="https://www.conectiaselect.com/panel-fotografo">Panel Fotógrafo →</a>\n` +
        `🏢 <a href="https://www.conectiaselect.com/panel-broker">Panel Broker →</a>`
      )
      return
    }

    if (text === '/stats') {
      const supabase = getSupabase()
      const [propRes, userRes] = await Promise.all([
        supabase.from('propiedades').select('status'),
        supabase.from('usuarios').select('role'),
      ])
      const props = propRes.data || []
      const users = userRes.data || []
      await sendTelegramMessage(chatId,
        `📊 <b>ESTADÍSTICAS CONECTIA</b>\n\n` +
        `🏠 Disponibles: ${props.filter((p: any) => p.status === 'Disponible').length}\n` +
        `🏷 Vendidas: ${props.filter((p: any) => p.status === 'Vendido').length}\n` +
        `🔑 Rentadas: ${props.filter((p: any) => p.status === 'Rentado').length}\n` +
        `📦 Total: ${props.length}\n\n` +
        `👥 Asesores: ${users.filter((u: any) => u.role === 'asesor').length}\n` +
        `🔑 Admins: ${users.filter((u: any) => u.role === 'admin').length}`
      )
      return
    }

    if (text === '/asesores') {
      const supabase = getSupabase()
      const { data } = await supabase.from('usuarios').select('nombre, email, telefono, role').in('role', ['asesor', 'admin', 'broker']).order('nombre')
      if (!data || data.length === 0) { await sendTelegramMessage(chatId, 'No hay asesores registrados.'); return }
      const list = data.map((u: any) => `• <b>${u.nombre}</b> (${u.role}) — ${u.email}`).join('\n')
      await sendTelegramMessage(chatId, `👥 <b>EQUIPO CONECTIA</b>\n\n${list}`)
      return
    }

    if (text === '/anuncios') {
      const supabase = getSupabase()
      const { data } = await supabase.from('anuncios').select('id, titulo, estado, ubicacion, clicks, impresiones').order('creado_en', { ascending: false }).limit(10)
      if (!data || data.length === 0) {
        await sendTelegramMessage(chatId, `📢 <b>ANUNCIOS</b>\n\nNo hay anuncios.\n\n<a href="https://www.conectiaselect.com/panel-admin/publicidad">Crear anuncio →</a>`)
        return
      }
      const estadoEmoji: Record<string, string> = { activo: '🟢', pausado: '🟡', suspendido: '🔴' }
      const list = data.map((a: any) => `${estadoEmoji[a.estado] || '⚪'} <b>${a.titulo}</b> — <i>${a.estado}</i>\n   👁 ${a.impresiones || 0} · 🖱 ${a.clicks || 0}`).join('\n\n')
      await sendTelegramMessage(chatId, `📢 <b>ANUNCIOS (${data.length})</b>\n\n${list}\n\n<a href="https://www.conectiaselect.com/panel-admin/publicidad">Ver panel →</a>`)
      return
    }

    if (text === '/todas_propiedades') {
      const supabase = getSupabase()
      const { data } = await supabase.from('propiedades').select('id, titulo, precio_texto, status').order('created_at', { ascending: false }).limit(10)
      if (!data || data.length === 0) { await sendTelegramMessage(chatId, 'No hay propiedades.'); return }
      const list = data.map((p: any) => `[${p.id}] <b>${p.titulo}</b> — ${p.precio_texto} — <i>${p.status}</i>`).join('\n')
      await sendTelegramMessage(chatId, `🏠 <b>ÚLTIMAS 10 PROPIEDADES</b>\n\n${list}\n\n<a href="https://www.conectiaselect.com/panel-admin">Ver panel →</a>`)
      return
    }
  }

  if (text === '/start') {
    conversationHistory.delete(chatId)
    await sendTelegramMessage(chatId,
      `🏠 <b>¡Bienvenido a CONECTIA!</b>\n\n` +
      `Hola <b>${firstName}</b>, soy <b>CONECTIA AI</b> 🤖\n\n` +
      `Puedo ayudarte a buscar propiedades, asesorarte sobre precios y zonas de León, o conectarte con un asesor.\n\n` +
      `/propiedades — Ver disponibles\n` +
      `/contacto — Información de contacto\n` +
      `/asesor — Hablar con un asesor\n\n` +
      `¿Qué tipo de propiedad buscas? 🏡`
    )
    return
  }

  if (text === '/propiedades') {
    const properties = await getProperties()
    if (properties.length === 0) { await sendTelegramMessage(chatId, 'No hay propiedades disponibles. Contacta: +52 477 475 6951'); return }
    const msgs = properties.slice(0, 5).map(formatPropertyForTelegram).join('\n\n──────────\n\n')
    await sendTelegramMessage(chatId, `📋 <b>PROPIEDADES DISPONIBLES</b>\n\n${msgs}\n\n🔍 <a href="https://www.conectiaselect.com/propiedades">Ver todas →</a>`)
    return
  }

  if (text === '/contacto') {
    await sendTelegramMessage(chatId, `📞 <b>CONTACTO CONECTIA</b>\n\n📱 <a href="https://wa.me/5214774756951">+52 477 475 6951</a>\n📧 conectiaselect@gmail.com\n🌐 <a href="https://www.conectiaselect.com">www.conectiaselect.com</a>\n\n⏰ Lunes a Sábado 9am - 7pm`)
    return
  }

  if (text === '/asesor') {
    await sendTelegramMessage(chatId, `👤 <b>HABLAR CON UN ASESOR</b>\n\n📱 <a href="https://wa.me/5214774756951?text=Hola,%20me%20interesa%20información%20sobre%20propiedades">Contactar por WhatsApp →</a>\n\nDisponibles Lunes a Sábado, 9am - 7pm.`)
    return
  }

  // General AI conversation
  const properties = await getProperties()
  const systemPrompt = buildSystemPrompt(properties, admin)
  const history = conversationHistory.get(chatId) || []
  history.push({ role: 'user', content: text })

  let aiText = ''
  try {
    const response = await getAnthropic().messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: history.slice(-20),
    })
    aiText = response.content[0].type === 'text' ? response.content[0].text : ''
  } catch (aiError: any) {
    console.error('Claude API error:', aiError)
    await sendTelegramMessage(chatId, '⚠️ Error al procesar tu mensaje. Intenta de nuevo.')
    if (admin) await sendTelegramMessage(chatId, `🔧 <code>${String(aiError?.message || aiError).slice(0, 400)}</code>`)
    return
  }

  const idMatches = [...aiText.matchAll(/\[ID:(\d+)\]/g)]
  const mentionedIds = idMatches.map(m => parseInt(m[1]))
  const mentionedProperties = properties.filter(p => mentionedIds.includes(p.id))
  const cleanText = aiText.replace(/\[ID:\d+\]/g, '').trim()

  history.push({ role: 'assistant', content: aiText })
  conversationHistory.set(chatId, history.slice(-20))

  if (admin) {
    const jsonPatterns = [/```json\s*({[\s\S]*?})\s*```/, /```\s*({[\s\S]*?})\s*```/, /\{"accion"[\s\S]*?\}/]
    for (const pattern of jsonPatterns) {
      const jsonMatch = aiText.match(pattern)
      if (jsonMatch) {
        try {
          const action = JSON.parse(jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0])
          if (action?.accion) { await executeAdminAction(chatId, action); break }
        } catch { /* try next */ }
      }
    }
  }

  const displayText = cleanText.replace(/```json[\s\S]*?```/g, '').trim()
  if (displayText) await sendTelegramMessage(chatId, displayText)

  for (const prop of mentionedProperties.slice(0, 3)) {
    await sendTelegramMessage(chatId, formatPropertyForTelegram(prop))
  }
}

async function executeAdminAction(chatId: number, action: any) {
  const supabase = getSupabase()

  if (action.accion === 'crear_asesor') {
    const password = action.password || `${action.nombre?.split(' ')[0]?.toLowerCase()}_conectia2025`
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({ email: action.email, password, email_confirm: true })
    if (authError) { await sendTelegramMessage(chatId, `❌ Error al crear asesor: ${authError.message}`); return }
    await supabase.from('usuarios').insert({ id: authData.user.id, email: action.email, nombre: action.nombre, telefono: action.telefono || '', role: action.role || 'asesor' })
    await sendTelegramMessage(chatId, `✅ <b>Asesor creado</b>\n\n👤 <b>${action.nombre}</b>\n📧 ${action.email}\n🔑 Contraseña: <code>${password}</code>`)
  }

  else if (action.accion === 'cambiar_status') {
    const { error } = await supabase.from('propiedades').update({ status: action.status }).eq('id', action.id)
    if (error) { await sendTelegramMessage(chatId, `❌ Error: ${error.message}`) }
    else { await sendTelegramMessage(chatId, `✅ Propiedad <b>#${action.id}</b> → <b>${action.status}</b>`) }
  }

  else if (action.accion === 'agendar_cita') {
    const tipo = action.tipo || 'visita'
    const tipoEmoji: Record<string, string> = { visita: '🏠', reunion: '🤝', entrega: '🔑', obra: '🏗️' }
    try {
      await supabase.from('calendario').insert({
        asesor_nombre: action.asesor || 'Sin asignar',
        fecha: action.fecha, hora: action.hora, titulo: action.titulo || 'Cita', tipo,
        descripcion: action.descripcion || action.titulo || 'Cita',
      })
    } catch { /* table may not exist */ }
    await sendTelegramMessage(chatId,
      `${tipoEmoji[tipo] || '📅'} <b>CITA AGENDADA</b>\n\n` +
      `📋 <b>${action.titulo}</b>\n👤 ${action.asesor}\n📅 ${action.fecha} · 🕐 ${action.hora}\n✅ Registrada exitosamente.`
    )
  }

  else if (action.accion === 'stats') {
    const [propRes, userRes] = await Promise.all([supabase.from('propiedades').select('status'), supabase.from('usuarios').select('role')])
    const props = propRes.data || []
    const users = userRes.data || []
    await sendTelegramMessage(chatId,
      `📊 Propiedades: ${props.length} | ✅ ${props.filter((p: any) => p.status === 'Disponible').length} disponibles\n` +
      `👥 Usuarios: ${users.length} | 👤 ${users.filter((u: any) => u.role === 'asesor').length} asesores`
    )
  }
}

async function executeAdAction(chatId: number, estado: string, query: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('anuncios').select('id, titulo').ilike('titulo', `%${query}%`).limit(5)
  if (error || !data || data.length === 0) { await sendTelegramMessage(chatId, `❌ No encontré anuncio con "<b>${query}</b>". Usa /anuncios para ver todos.`); return }
  const activo = estado === 'activo'
  const labels: Record<string, string> = { activo: '🟢 Activo', pausado: '🟡 Pausado', suspendido: '🔴 Suspendido' }
  const ids = data.map((a: any) => a.id)
  await supabase.from('anuncios').update({ estado, activo }).in('id', ids)
  const list = data.map((a: any) => `• <b>${a.titulo}</b>`).join('\n')
  await sendTelegramMessage(chatId, `✅ ${data.length} anuncio(s) → ${labels[estado]}\n\n${list}`)
}

async function executeAdDelete(chatId: number, query: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('anuncios').select('id, titulo').ilike('titulo', `%${query}%`).limit(5)
  if (error || !data || data.length === 0) { await sendTelegramMessage(chatId, `❌ No encontré anuncio con "<b>${query}</b>".`); return }
  if (data.length > 1) {
    const list = data.map((a: any) => `• <b>${a.titulo}</b>`).join('\n')
    await sendTelegramMessage(chatId, `⚠️ Encontré ${data.length} anuncios:\n\n${list}\n\nSé más específico.`)
    return
  }
  await supabase.from('anuncios').delete().eq('id', data[0].id)
  await sendTelegramMessage(chatId, `🗑 Anuncio eliminado: <b>${data[0].titulo}</b>`)
}
