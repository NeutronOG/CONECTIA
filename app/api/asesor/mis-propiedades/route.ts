import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar service role key para bypasear RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const nombre = searchParams.get('nombre')
    const userId = searchParams.get('userId')

    if (!email && !nombre && !userId) {
      return NextResponse.json({ error: 'Se requiere email, nombre o userId' }, { status: 400 })
    }

    console.log('API mis-propiedades:', { email, nombre, userId })

    // Usuarios con acceso a todas las propiedades
    const SUPER_USERS = ['lizzie@conectia.mx', 'admin@conectia.mx']
    const isSuperUser = email && SUPER_USERS.includes(email.toLowerCase())

    // Obtener todas las propiedades
    const { data, error } = await supabaseAdmin
      .from('propiedades')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Total propiedades en DB:', data?.length)
    
    // Log de todos los usuario_id para debugging
    const usuarioIds = [...new Set(data?.map(p => p.usuario_id).filter(Boolean))]
    console.log('Valores únicos de usuario_id:', usuarioIds)

    // Si es super usuario (Lizzie o admin), devolver todas las propiedades
    if (isSuperUser) {
      console.log('Super usuario detectado, devolviendo todas las propiedades:', email)
      return NextResponse.json({ 
        propiedades: data || [],
        total: data?.length || 0,
        debug: {
          totalEnDB: data?.length,
          usuarioIdsUnicos: usuarioIds,
          superUser: true
        }
      })
    }

    // Filtrar propiedades del usuario
    const filtered = (data || []).filter((p: any) => {
      if (!p.usuario_id) return false
      const uid = String(p.usuario_id).toLowerCase().trim()
      
      // Buscar por email exacto
      if (email && uid === email.toLowerCase()) return true
      
      // Buscar por userId
      if (userId && uid === userId.toLowerCase()) return true
      
      // Buscar si contiene el email
      if (email && uid.includes(email.toLowerCase())) return true
      
      // Buscar por nombre
      if (nombre) {
        const name = nombre.toLowerCase()
        if (uid.includes(name)) return true
        // Primer nombre
        const firstName = name.split(' ')[0]
        if (firstName.length > 2 && uid.includes(firstName)) return true
      }
      
      return false
    })

    console.log('Propiedades filtradas para', email || nombre, ':', filtered.length)

    return NextResponse.json({ 
      propiedades: filtered,
      total: filtered.length,
      debug: {
        totalEnDB: data?.length,
        usuarioIdsUnicos: usuarioIds
      }
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
