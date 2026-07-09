import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// GET /api/n8n/reporte-actividad?dias=7
// GET /api/n8n/reporte-actividad?dias=7&format=telegram
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dias = parseInt(searchParams.get('dias') || '7')
    const format = searchParams.get('format') || 'json'

    const fechaInicio = new Date()
    fechaInicio.setDate(fechaInicio.getDate() - dias)
    const fechaInicioISO = fechaInicio.toISOString()

    // 1. Propiedades nuevas en el periodo
    const { data: propiedadesNuevas } = await supabaseAdmin
      .from('propiedades')
      .select('id, titulo, ubicacion, precio, precio_texto, tipo, status, categoria, created_at, usuario_id')
      .gte('created_at', fechaInicioISO)
      .order('created_at', { ascending: false })

    // 2. Todas las propiedades activas
    const { data: todasPropiedades } = await supabaseAdmin
      .from('propiedades')
      .select('id, titulo, status, precio, categoria, usuario_id')
      .order('created_at', { ascending: false })

    // 3. Leads / solicitudes de contacto en el periodo
    const { data: leadsNuevos } = await supabaseAdmin
      .from('solicitudes_contacto')
      .select('*')
      .gte('created_at', fechaInicioISO)
      .order('created_at', { ascending: false })

    // 4. Solicitudes de fotografia en el periodo
    const { data: solicitudesFoto } = await supabaseAdmin
      .from('solicitudes_propiedad')
      .select('*')
      .gte('created_at', fechaInicioISO)
      .order('created_at', { ascending: false })

    // 5. Obtener nombres de asesores
    const usuarioIds = [...new Set([
      ...(propiedadesNuevas || []).map((p: any) => p.usuario_id).filter(Boolean),
      ...(todasPropiedades || []).map((p: any) => p.usuario_id).filter(Boolean),
    ])]
    let usuariosMap: Record<string, any> = {}
    if (usuarioIds.length > 0) {
      const { data: usuarios } = await supabaseAdmin
        .from('usuarios')
        .select('id, nombre, email, role')
        .in('id', usuarioIds)
      if (usuarios) {
        usuariosMap = usuarios.reduce((acc: Record<string, any>, u: any) => {
          acc[u.id] = u
          return acc
        }, {})
      }
    }

    // 6. Calcular estadisticas
    const propiedadesActivas = (todasPropiedades || []).filter((p: any) => p.status === 'Disponible')
    const propiedadesReservadas = (todasPropiedades || []).filter((p: any) => p.status === 'Reservada')
    const propiedadesExclusivas = (todasPropiedades || []).filter((p: any) => p.status === 'Exclusiva')

    const valorPortafolio = (todasPropiedades || []).reduce((sum: number, p: any) => sum + (Number(p.precio) || 0), 0)
    const comisionPotencial = Math.round((todasPropiedades || []).reduce((sum: number, p: any) => {
      const pct = Number((p as any).comision_asesor_pct) || 4
      return sum + (Number(p.precio) || 0) * (pct / 100 / 2)
    }, 0))

    const leadsPendientes = (leadsNuevos || []).filter((l: any) => l.estado === 'pendiente')
    const leadsAtendidos = (leadsNuevos || []).filter((l: any) => l.estado !== 'pendiente')

    // Propiedades por asesor
    const porAsesor: Record<string, { nombre: string; email: string; propiedades: number; comisionPotencial: number }> = {}
    for (const prop of (todasPropiedades || [])) {
      if (!prop.usuario_id) continue
      const usuario = usuariosMap[prop.usuario_id]
      if (!usuario) continue
      if (!porAsesor[prop.usuario_id]) {
        porAsesor[prop.usuario_id] = {
          nombre: usuario.nombre,
          email: usuario.email,
          propiedades: 0,
          comisionPotencial: 0,
        }
      }
      const pctAsesor = Number((prop as any).comision_asesor_pct) || 4
      porAsesor[prop.usuario_id].propiedades++
      porAsesor[prop.usuario_id].comisionPotencial += Math.round((Number(prop.precio) || 0) * (pctAsesor / 100 / 2))
    }

    // 7. Construir reporte
    const reporte = {
      header: {
        titulo: `Reporte de Actividad CONECTIA - Ultimos ${dias} dias`,
        fechaGeneracion: new Date().toISOString(),
        periodoInicio: fechaInicioISO,
        periodoFin: new Date().toISOString(),
        dias: dias,
      },
      resumen: {
        propiedadesNuevas: propiedadesNuevas?.length || 0,
        totalPropiedades: todasPropiedades?.length || 0,
        propiedadesActivas: propiedadesActivas.length,
        propiedadesReservadas: propiedadesReservadas.length,
        propiedadesExclusivas: propiedadesExclusivas.length,
        leadsNuevos: leadsNuevos?.length || 0,
        leadsPendientes: leadsPendientes.length,
        leadsAtendidos: leadsAtendidos.length,
        solicitudesFotografia: solicitudesFoto?.length || 0,
        valorPortafolio: valorPortafolio,
        valorPortafolioTexto: `$${valorPortafolio.toLocaleString('es-MX')} MXN`,
        comisionPotencial: comisionPotencial,
        comisionPotencialTexto: `$${comisionPotencial.toLocaleString('es-MX')} MXN`,
      },
      propiedadesNuevas: (propiedadesNuevas || []).map((p: any) => ({
        id: p.id,
        titulo: p.titulo,
        ubicacion: p.ubicacion,
        precio: Number(p.precio),
        precioTexto: p.precio_texto,
        tipo: p.tipo,
        status: p.status,
        categoria: p.categoria,
        fecha: p.created_at,
        asesor: p.usuario_id && usuariosMap[p.usuario_id] ? usuariosMap[p.usuario_id].nombre : 'Sin asignar',
        comisionAsesor: Math.round((Number(p.precio) || 0) * ((Number((p as any).comision_asesor_pct) || 4) / 100 / 2)),
      })),
      leads: (leadsNuevos || []).map((l: any) => ({
        id: l.id,
        nombre: l.nombre,
        email: l.email,
        telefono: l.telefono,
        mensaje: l.mensaje,
        estado: l.estado,
        fecha: l.created_at,
      })),
      solicitudesFotografia: (solicitudesFoto || []).map((s: any) => ({
        id: s.id,
        titulo: s.titulo,
        asesor: s.asesor_nombre || s.asesor_email,
        status: s.status,
        fecha: s.created_at,
      })),
      porAsesor: Object.values(porAsesor).sort((a, b) => b.propiedades - a.propiedades),
    }

    // 8. Formato Telegram (mensaje plano con emojis)
    if (format === 'telegram') {
      const r = reporte.resumen
      const mensaje = `📊 *REPORTE CONECTIA - Ultimos ${dias} dias*
📅 ${new Date().toLocaleDateString('es-MX')}

🏠 *Propiedades*
• Nuevas: ${r.propiedadesNuevas}
• Total activas: ${r.propiedadesActivas}
• Reservadas: ${r.propiedadesReservadas}
• Exclusivas: ${r.propiedadesExclusivas}

👤 *Leads*
• Nuevos: ${r.leadsNuevos}
• Pendientes: ${r.leadsPendientes}
• Atendidos: ${r.leadsAtendidos}

📷 *Solicitudes fotografia*: ${r.solicitudesFotografia}

💰 *Financiero*
• Valor portafolio: ${r.valorPortafolioTexto}
• Comisión potencial a asesores: ${r.comisionPotencialTexto}

${reporte.porAsesor.length > 0 ? `🏆 *Top Asesores*\n${reporte.porAsesor.slice(0, 3).map((a, i) => `${i + 1}. ${a.nombre} - ${a.propiedades} props - $${a.comisionPotencial.toLocaleString('es-MX')} MXN`).join('\n')}` : ''}

─ CONECTIA · Reporte automatico ─`

      return new NextResponse(mensaje, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    return NextResponse.json({ reporte })
  } catch (error: any) {
    console.error('Error en reporte-actividad:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
