import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET() {
  try {
    // Add bono column if it doesn't exist
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS bono TEXT;'
    })

    if (error) {
      // Try direct query approach
      const { error: error2 } = await supabaseAdmin
        .from('propiedades')
        .select('bono')
        .limit(1)

      if (error2 && error2.message.includes('column')) {
        return NextResponse.json({ 
          error: 'La columna bono no existe. Ejecuta este SQL en Supabase Dashboard > SQL Editor:\n\nALTER TABLE propiedades ADD COLUMN IF NOT EXISTS bono TEXT;',
          sql: 'ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS bono TEXT;'
        }, { status: 500 })
      }

      return NextResponse.json({ ok: true, message: 'Columna bono ya existe o fue creada' })
    }

    return NextResponse.json({ ok: true, message: 'Columna bono agregada exitosamente' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
