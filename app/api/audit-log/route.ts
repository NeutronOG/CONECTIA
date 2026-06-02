import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// POST - Guardar log de auditoría
export async function POST(request: NextRequest) {
  try {
    const log = await request.json()
    
    // Insertar en Supabase
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        id: log.id,
        timestamp: log.timestamp,
        user_id: log.userId,
        user_email: log.userEmail,
        user_name: log.userName,
        action: log.action,
        entity_type: log.entityType,
        entity_id: log.entityId,
        entity_name: log.entityName,
        details: log.details,
        ip_address: log.ipAddress,
        user_agent: log.userAgent,
      })
    
    if (error) {
      console.error('Error saving audit log:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in audit-log API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Obtener logs (solo para admins)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let query = supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    if (action) {
      query = query.eq('action', action)
    }
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ logs: data })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
