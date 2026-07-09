import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Migrar todas las solicitudes completadas sin propiedad_id a la tabla propiedades
export async function POST(request: Request) {
  try {
    // Buscar solicitudes completadas sin propiedad_id vinculada
    const { data: solicitudes, error: fetchError } = await supabaseAdmin
      .from('solicitudes_propiedad')
      .select('*')
      .eq('status', 'completada')
      .is('propiedad_id', null)

    if (fetchError) {
      console.error('Error fetching solicitudes completadas:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!solicitudes || solicitudes.length === 0) {
      return NextResponse.json({
        mensaje: 'No hay solicitudes completadas pendientes de migrar',
        migradas: 0,
        errores: 0,
        detalles: []
      })
    }

    const resultados: any[] = []
    let migradas = 0
    let errores = 0

    for (const solicitud of solicitudes) {
      try {
        const extra = solicitud.datos_extra || {}
        const imagenesArr: string[] = solicitud.imagenes || []
        const imagenPrincipal = imagenesArr.length > 0 ? imagenesArr[0] : ''
        const galeria = imagenesArr.length > 1 ? imagenesArr.slice(1) : []

        const precioNum = Math.round(Number(solicitud.precio_estimado) || 0)
        const precioTexto = precioNum > 0
          ? `$${precioNum.toLocaleString('es-MX')}`
          : 'Consultar precio'

        const areaNum = Math.round(Number(solicitud.area) || 0)
        const habitacionesNum = Math.round(Number(String(solicitud.habitaciones || '0').replace(/\+.*/, '')) || 0)
        const banosNum = Math.round(Number(String(solicitud.banos || '0').replace(/\+.*/, '')) || 0)

        const nuevaPropiedad: any = {
          titulo: solicitud.titulo,
          ubicacion: solicitud.ubicacion || 'Sin ubicación',
          precio: precioNum,
          precio_texto: precioTexto,
          tipo: solicitud.tipo || 'Departamento',
          categoria: solicitud.categoria || 'venta',
          habitaciones: habitacionesNum,
          banos: banosNum,
          area: areaNum,
          area_texto: areaNum > 0 ? `${areaNum} m²` : '0 m²',
          imagen: imagenPrincipal,
          galeria: galeria,
          descripcion: solicitud.descripcion || '',
          caracteristicas: extra.caracteristicas || [],
          status: 'Disponible',
          unidad_superficie: extra.unidadSuperficie || 'm²',
          tour_virtual: extra.tourVirtual || null,
        }

        const { data: propData, error: propError } = await supabaseAdmin
          .from('propiedades')
          .insert(nuevaPropiedad)
          .select()
          .single()

        if (propError) {
          console.error(`Error migrando solicitud ${solicitud.id}:`, propError)
          errores++
          resultados.push({
            solicitud_id: solicitud.id,
            titulo: solicitud.titulo,
            error: propError.message,
            exito: false
          })
          continue
        }

        // Vincular propiedad_id en la solicitud
        await supabaseAdmin
          .from('solicitudes_propiedad')
          .update({ propiedad_id: propData.id })
          .eq('id', solicitud.id)

        migradas++
        resultados.push({
          solicitud_id: solicitud.id,
          titulo: solicitud.titulo,
          propiedad_id: propData.id,
          exito: true
        })
      } catch (err: any) {
        console.error(`Error inesperado migrando solicitud ${solicitud.id}:`, err)
        errores++
        resultados.push({
          solicitud_id: solicitud.id,
          titulo: solicitud.titulo,
          error: err.message || 'Error inesperado',
          exito: false
        })
      }
    }

    return NextResponse.json({
      mensaje: `Migración completada: ${migradas} propiedades creadas, ${errores} errores`,
      total_solicitudes: solicitudes.length,
      migradas,
      errores,
      detalles: resultados
    })
  } catch (error: any) {
    console.error('Error en migración:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
