import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getComisionAsesor, getComisionAsesorTexto, getPrecioTotal } from '@/lib/commission'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// GET /api/n8n/ficha-tecnica?id=100
// GET /api/n8n/ficha-tecnica?id=100&format=pdf
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const format = searchParams.get('format') || 'json'

    if (!id) {
      return NextResponse.json(
        { error: 'Parámetro "id" es requerido. Ejemplo: /api/n8n/ficha-tecnica?id=100' },
        { status: 400 }
      )
    }

    // 1. Obtener la propiedad completa
    const { data: prop, error } = await supabaseAdmin
      .from('propiedades')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !prop) {
      return NextResponse.json(
        { error: `Propiedad con id ${id} no encontrada` },
        { status: 404 }
      )
    }

    // 2. Obtener info del asesor
    let asesor: any = null
    if (prop.usuario_id) {
      const { data: usuario } = await supabaseAdmin
        .from('usuarios')
        .select('nombre, email, telefono, role')
        .eq('id', prop.usuario_id)
        .single()
      if (usuario) asesor = usuario
    }

    // 3. Obtener leads/solicitudes de esta propiedad
    const { data: leads } = await supabaseAdmin
      .from('solicitudes_contacto')
      .select('*')
      .eq('propiedad_id', id)
      .order('created_at', { ascending: false })

    // 4. Calcular comisiones según el porcentaje elegido por el asesor y precio total
    const propForCalc = {
      precio: Number(prop.precio) || 0,
      area: Number(prop.area) || 0,
      unidadSuperficie: prop.unidad_superficie === 'Hectáreas' ? 'Hectáreas' as const : 'm²' as const,
      comisionAsesorPct: Number(prop.comision_asesor_pct) || 4,
    }
    const precioTotal = getPrecioTotal(propForCalc)
    const comisionAsesor = getComisionAsesor(propForCalc)
    const comisionAsesorTexto = `$${comisionAsesor.toLocaleString('es-MX')} MXN (${getComisionAsesorTexto(propForCalc)})`
    const comisionEmpresa = getComisionAsesor(propForCalc)
    const comisionEmpresaTexto = `$${comisionEmpresa.toLocaleString('es-MX')} MXN (${getComisionAsesorTexto(propForCalc)})`

    // 5. Construir ficha técnica estructurada
    const fichaTecnica = {
      header: {
        titulo: 'Ficha Técnica de Propiedad',
        plataforma: 'CONECTIA',
        fechaGeneracion: new Date().toISOString(),
        folio: `CON-${prop.id}-${new Date().getFullYear()}`,
      },
      propiedad: {
        id: prop.id,
        titulo: prop.titulo,
        status: prop.status,
        categoria: prop.categoria,
        tipo: prop.tipo,
        ubicacion: prop.ubicacion,
        descripcion: prop.descripcion || '',
        fechaPublicacion: prop.fecha_publicacion || prop.created_at,
      },
      dimensiones: {
        area: prop.area ? `${prop.area} ${prop.unidad_superficie || 'm²'}` : 'No especificada',
        areaTexto: prop.area_texto || '',
        frente: prop.frente || null,
        fondo: prop.fondo || null,
        areaConstruccion: prop.area_construccion || null,
        unidadSuperficie: prop.unidad_superficie || 'm²',
      },
      distribucion: {
        habitaciones: prop.habitaciones || 0,
        banos: prop.banos || 0,
        mediosBanos: prop.medios_banos || 0,
        cochera: prop.cochera || 0,
        amueblado: prop.amueblado || 'no_especificado',
      },
      financiero: {
        precio: precioTotal,
        precioTexto: prop.precio_texto || `$${precioTotal.toLocaleString('es-MX')} MXN`,
        comisionTotalPct: propForCalc.comisionAsesorPct,
        comisionAsesor: comisionAsesor,
        comisionAsesorTexto: comisionAsesorTexto,
        comisionEmpresa: comisionEmpresa,
        comisionEmpresaTexto: comisionEmpresaTexto,
        bono: prop.bono || null,
      },
      caracteristicas: prop.caracteristicas || [],
      multimedia: {
        imagenPrincipal: prop.imagen || '',
        galeria: prop.galeria || [],
        tourVirtual: prop.tour_virtual || null,
      },
      asesor: asesor ? {
        nombre: asesor.nombre,
        email: asesor.email,
        telefono: asesor.telefono || '',
        rol: asesor.role,
      } : {
        nombre: 'Asesor CONECTIA',
        email: 'conectiaselect@gmail.com',
        telefono: '+52 1 477 475 6951',
        rol: 'asesor',
      },
      metricas: {
        totalLeads: leads?.length || 0,
        leadsPendientes: leads?.filter((l: any) => l.estado === 'pendiente').length || 0,
        leadsAtendidos: leads?.filter((l: any) => l.estado !== 'pendiente').length || 0,
      },
    }

    // 6. Si format=pdf, devolver texto formateado para conversión a PDF
    if (format === 'pdf' || format === 'text') {
      const textoFormateado = `
═══════════════════════════════════════════
         FICHA TÉCNICA DE PROPIEDAD
              CONECTIA
═══════════════════════════════════════════
Folio: ${fichaTecnica.header.folio}
Fecha: ${new Date(fichaTecnica.header.fechaGeneracion).toLocaleDateString('es-MX')}

─── INFORMACIÓN GENERAL ───
Título: ${prop.titulo}
Tipo: ${prop.tipo}
Status: ${prop.status}
Categoría: ${prop.categoria}
Ubicación: ${prop.ubicacion}
Descripción: ${prop.descripcion || 'Sin descripción'}

─── DIMENSIONES ───
Área: ${fichaTecnica.dimensiones.area}
${prop.frente ? `Frente: ${prop.frente} m` : ''}
${prop.fondo ? `Fondo: ${prop.fondo} m` : ''}
${prop.area_construccion ? `Área construcción: ${prop.area_construccion} m²` : ''}

─── DISTRIBUCIÓN ───
Habitaciones: ${prop.habitaciones || 0}
Baños: ${prop.banos || 0}
${prop.medios_banos ? `Medios baños: ${prop.medios_banos}` : ''}
${prop.cochera ? `Cochera: ${prop.cochera} vehículos` : ''}
Amueblado: ${prop.amueblado || 'No especificado'}

─── INFORMACIÓN FINANCIERA ───
Precio: ${fichaTecnica.financiero.precioTexto}
Comisión Asesor (${fichaTecnica.financiero.comisionTotalPct / 2}%): ${fichaTecnica.financiero.comisionAsesorTexto}
Comisión Empresa (${fichaTecnica.financiero.comisionTotalPct / 2}%): ${fichaTecnica.financiero.comisionEmpresaTexto}
${prop.bono ? `Bono: ${prop.bono}` : ''}

─── CARACTERÍSTICAS ───
${(prop.caracteristicas || []).map((c: string) => `• ${c}`).join('\n')}

─── MULTIMEDIA ───
Imagen principal: ${prop.imagen || 'No disponible'}
Galería: ${(prop.galeria || []).length} imágenes
Tour virtual: ${prop.tour_virtual || 'No disponible'}

─── ASESOR ASIGNADO ───
Nombre: ${fichaTecnica.asesor.nombre}
Email: ${fichaTecnica.asesor.email}
Teléfono: ${fichaTecnica.asesor.telefono}

─── MÉTRICAS ───
Total de leads: ${fichaTecnica.metricas.totalLeads}
Leads pendientes: ${fichaTecnica.metricas.leadsPendientes}
Leads atendidos: ${fichaTecnica.metricas.leadsAtendidos}

═══════════════════════════════════════════
      Documento generado por CONECTIA
═══════════════════════════════════════════
`.trim()

      return new NextResponse(textoFormateado, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `inline; filename="ficha-tecnica-${prop.id}.txt"`,
        },
      })
    }

    return NextResponse.json({ fichaTecnica })
  } catch (error: any) {
    console.error('Error en ficha-tecnica:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
