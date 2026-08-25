import { NextRequest, NextResponse } from 'next/server'
import { authorizeN8nRequest } from '@/lib/n8n-auth'
import { LizzieAgentError, runLizzieAgent } from '@/lib/lizzie-agent'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const authError = authorizeN8nRequest(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const result = await runLizzieAgent(body)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof LizzieAgentError) {
      return NextResponse.json(
        { ok: false, error: error.message, text: error.message, parse_mode: null },
        { status: error.status },
      )
    }

    console.error('Lizzie n8n agent error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: 'Error interno del agente',
        text: 'No pude procesar la solicitud en este momento. Intenta nuevamente.',
        parse_mode: null,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const authError = authorizeN8nRequest(request)
  if (authError) return authError
  return NextResponse.json({
    ok: true,
    agent: 'lizzie-n8n',
    version: '1.0.0',
    capabilities: [
      'search_properties',
      'get_property',
      'get_platform_info',
      'list_information_requests',
      'request_property_update_with_confirmation',
    ],
  })
}

