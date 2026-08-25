import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'

function secureEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function authorizeN8nRequest(request: Request): NextResponse | null {
  const configuredSecret = process.env.N8N_AGENT_SECRET
  if (!configuredSecret) {
    console.error('N8N_AGENT_SECRET is not configured')
    return NextResponse.json(
      { ok: false, error: 'Integración n8n no configurada' },
      { status: 503 },
    )
  }

  const authorization = request.headers.get('authorization') || ''
  const bearerSecret = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : ''
  const headerSecret = request.headers.get('x-conectia-agent-secret') || ''
  const suppliedSecret = bearerSecret || headerSecret

  if (!suppliedSecret || !secureEqual(suppliedSecret, configuredSecret)) {
    return NextResponse.json(
      { ok: false, error: 'No autorizado' },
      { status: 401 },
    )
  }

  return null
}

