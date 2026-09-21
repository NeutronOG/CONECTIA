import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

type Translation = {
  title: string
  description: string
  features: string[]
}

const cache = new Map<string, Translation>()

function clean(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Translation service is not configured.' }, { status: 503 })
    }

    const body = await request.json()
    const id = clean(body?.id, 80)
    const title = clean(body?.title, 300)
    const description = clean(body?.description, 6000)
    const features = Array.isArray(body?.features)
      ? body.features.slice(0, 60).map((item: unknown) => clean(item, 160)).filter(Boolean)
      : []

    if (!title && !description && features.length === 0) {
      return NextResponse.json({ error: 'No property content was provided.' }, { status: 400 })
    }

    const cacheKey = `${id}:${title}:${description.length}:${features.join('|')}`
    const cached = cache.get(cacheKey)
    if (cached) return NextResponse.json(cached)

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await anthropic.messages.create({
      model: process.env.TRANSLATION_MODEL || 'claude-haiku-4-5',
      max_tokens: 2200,
      temperature: 0,
      system: 'You are a professional US English real-estate copy editor. Translate Mexican Spanish property content into natural, polished English. Preserve proper names, place names, measurements, prices, formatting, bullet points, and factual meaning. Do not add claims. Return only valid JSON with keys title, description, features.',
      messages: [{
        role: 'user',
        content: JSON.stringify({ title, description, features }),
      }],
    })

    const text = response.content.find(block => block.type === 'text')?.text || ''
    const jsonText = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(jsonText) as Partial<Translation>
    const translation: Translation = {
      title: clean(parsed.title, 400) || title,
      description: clean(parsed.description, 8000) || description,
      features: Array.isArray(parsed.features)
        ? parsed.features.map(item => clean(item, 200)).filter(Boolean).slice(0, features.length)
        : features,
    }

    cache.set(cacheKey, translation)
    if (cache.size > 250) cache.delete(cache.keys().next().value as string)

    return NextResponse.json(translation)
  } catch (error) {
    console.error('Property translation error:', error)
    return NextResponse.json({ error: 'Property translation is temporarily unavailable.' }, { status: 500 })
  }
}
