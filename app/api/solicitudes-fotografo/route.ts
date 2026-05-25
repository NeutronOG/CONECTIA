import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { data: solicitudes, error } = await supabaseAdmin
      .from('solicitudes_fotografo')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching solicitudes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      solicitudes: solicitudes || [],
      total: solicitudes?.length || 0
    })
  } catch (error) {
    console.error('Error in solicitudes-fotografo API:', error)
    return NextResponse.json({ 
      error: 'Error al cargar solicitudes',
      solicitudes: [],
      total: 0
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, notas_admin } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('solicitudes_fotografo')
      .update({ notas_admin })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating solicitud:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ solicitud: data })
  } catch (error) {
    console.error('Error in PATCH solicitudes-fotografo:', error)
    return NextResponse.json({ error: 'Error al actualizar solicitud' }, { status: 500 })
  }
}
