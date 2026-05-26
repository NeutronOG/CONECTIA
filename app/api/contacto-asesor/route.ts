import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, email, telefono, mensaje, tipo, fecha } = body

    // Validar campos requeridos
    if (!nombre || !email || !telefono) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Guardar en tabla de solicitudes de contacto
    const { data, error } = await supabase
      .from('solicitudes_contacto')
      .insert({
        nombre,
        email,
        telefono,
        mensaje: mensaje || 'Solicitud de información para ser asesor CONECTIA',
        tipo: tipo || 'solicitud_asesor',
        fecha: fecha || new Date().toISOString(),
        estado: 'pendiente'
      })
      .select()
      .single()

    if (error) {
      console.error('Error guardando solicitud:', error)
      // Si la tabla no existe, devolver éxito de todas formas (modo desarrollo)
      if (error.code === '42P01') {
        console.warn('Tabla solicitudes_contacto no existe - modo desarrollo')
        return NextResponse.json({ 
          success: true, 
          message: 'Solicitud recibida (modo desarrollo)',
          data: { nombre, email, telefono }
        })
      }
      return NextResponse.json(
        { error: 'Error al guardar la solicitud' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Solicitud enviada correctamente',
      data 
    })

  } catch (error) {
    console.error('Error en API contacto-asesor:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
