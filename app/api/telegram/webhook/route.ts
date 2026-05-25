import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 10

export async function POST(req: NextRequest) {
  let body: string
  try {
    body = await req.text()
  } catch {
    return NextResponse.json({ ok: true })
  }

  // Fire-and-forget: call /process without awaiting so Telegram gets 200 immediately
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.conectiaselect.com'
  fetch(`${baseUrl}/api/telegram/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }).catch((err) => console.error('Fire-and-forget error:', err))

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({
    status: 'CONECTIA Telegram Bot activo',
    model: 'claude-haiku-4-5',
  })
}
