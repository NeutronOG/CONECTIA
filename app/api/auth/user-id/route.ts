import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase config')
    return NextResponse.json({ userId: null })
  }

  // Usar service role key para acceder a auth.users
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Buscar usuario por email en auth.users
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('Error listing users:', error)
      return NextResponse.json({ userId: null })
    }

    const user = users?.find(u => u.email === email)
    
    return NextResponse.json({ userId: user?.id || null })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ userId: null })
  }
}
