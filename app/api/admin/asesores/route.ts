import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
  }

  // Usar service role para bypasear RLS
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  // Obtener asesores
  const { data: usuarios, error: usuariosError } = await supabase
    .from('usuarios')
    .select('id,nombre,email,role')
    .eq('role', 'asesor')
    .order('nombre', { ascending: true })

  if (usuariosError) {
    return NextResponse.json({ error: usuariosError.message }, { status: 500 })
  }

  // Obtener todas las propiedades para contar por asesor
  const { data: propiedades } = await supabase
    .from('propiedades')
    .select('usuario_id')

  // Contar propiedades por email de asesor
  const propCountByEmail: Record<string, number> = {}
  for (const prop of propiedades || []) {
    if (prop.usuario_id) {
      const key = prop.usuario_id.toLowerCase()
      propCountByEmail[key] = (propCountByEmail[key] || 0) + 1
    }
  }

  const asesores = (usuarios || []).map((u: any) => ({
    id: String(u.id),
    nombre: String(u.nombre || ''),
    email: String(u.email || ''),
    propiedades: propCountByEmail[u.email?.toLowerCase()] || 0
  }))

  return NextResponse.json({ asesores })
}
