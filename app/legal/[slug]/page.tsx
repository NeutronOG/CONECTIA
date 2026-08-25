import type React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, Download, ShieldCheck } from 'lucide-react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getLegalDocument, legalDocuments } from '@/lib/legal-documents'

interface LegalDocumentPageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return legalDocuments.map((document) => ({ slug: document.slug }))
}

export async function generateMetadata({ params }: LegalDocumentPageProps): Promise<Metadata> {
  const { slug } = await params
  const document = getLegalDocument(slug)
  if (!document) return {}

  return {
    title: `${document.title} | CONECTIA`,
    description: document.description,
  }
}

function isSectionHeading(line: string) {
  return /^(CAPÍTULO|TÍTULO|DISPOSICIONES GENERALES|[IVXLCDM]+\.\s|Artículo\s+\d+)/i.test(line)
}

function renderDocument(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.replace(/\f/g, '').trim())
    .filter(Boolean)

  lines.shift()
  if (lines[0]?.toUpperCase() === 'CONECTIA ECOSISTEMA INMOBILIARIO') lines.shift()

  const elements: React.ReactNode[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    if (line.startsWith('•')) {
      const items: string[] = []
      while (index < lines.length && lines[index].startsWith('•')) {
        const item = lines[index].replace(/^•\s*/, '').trim()
        if (item) items.push(item)
        index += 1
      }
      index -= 1
      elements.push(
        <ul key={`list-${index}`} className="my-5 space-y-2 pl-5 list-disc marker:text-[var(--conectia-arcilla)]">
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`} className="pl-1 text-[#4A4F57] dark:text-[#D1CDC7] leading-7">
              {item}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    if (isSectionHeading(line)) {
      const isArticle = /^Artículo\s+\d+/i.test(line)
      elements.push(
        isArticle ? (
          <h3 key={`heading-${index}`} className="font-serif text-xl sm:text-2xl font-bold text-[#17313A] dark:text-[#EAE4DD] mt-8 mb-3">
            {line}
          </h3>
        ) : (
          <h2 key={`heading-${index}`} className="font-serif text-2xl sm:text-3xl font-black text-[#17313A] dark:text-[#EAE4DD] mt-12 mb-4 pt-8 border-t border-[#17313A]/10 dark:border-white/10">
            {line}
          </h2>
        ),
      )
      continue
    }

    if (/^Última actualización:/i.test(line)) {
      continue
    }

    elements.push(
      <p key={`paragraph-${index}`} className="my-4 text-[#4A4F57] dark:text-[#D1CDC7] leading-8 text-[15px] sm:text-base">
        {line}
      </p>,
    )
  }

  return elements
}

export default async function LegalDocumentPage({ params }: LegalDocumentPageProps) {
  const { slug } = await params
  const document = getLegalDocument(slug)
  if (!document) notFound()

  const content = readFileSync(join(process.cwd(), 'public', document.file), 'utf8')

  return (
    <main className="min-h-screen bg-[#F6F2EE] dark:bg-[#0F2027] pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Link href="/legal" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A4F57] dark:text-[#B0ACA6] hover:text-[var(--conectia-arcilla)] transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Volver al Centro Legal
        </Link>

        <header className="rounded-[28px] bg-[#17313A] text-white p-7 sm:p-10 mb-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[var(--conectia-arcilla)]/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-[0.18em] text-[var(--conectia-arcilla)] mb-5">
              <ShieldCheck className="h-4 w-4" /> Documento oficial
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-5">{document.title}</h1>
            <p className="text-white/70 leading-7 max-w-3xl mb-6">{document.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-white/60">
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Actualizado: {document.updatedAt}</span>
              <a href={`/${document.file}`} download className="inline-flex items-center gap-2 hover:text-white transition-colors">
                <Download className="h-4 w-4" /> Descargar versión de texto
              </a>
            </div>
          </div>
        </header>

        <article className="bg-white dark:bg-[#17313A]/35 border border-[#17313A]/10 dark:border-white/10 rounded-[28px] p-6 sm:p-10 lg:p-12 shadow-sm">
          {renderDocument(content)}
        </article>

        <aside className="mt-8 p-6 rounded-2xl bg-[var(--conectia-arcilla)]/10 border border-[var(--conectia-arcilla)]/20">
          <p className="text-sm text-[#4A4F57] dark:text-[#D1CDC7] leading-6">
            Para consultas, aclaraciones o solicitudes relacionadas con este documento, utiliza el{' '}
            <Link href="/contacto" className="font-bold text-[var(--conectia-arcilla)] hover:underline">formulario oficial de contacto</Link>{' '}
            o comunícate al <strong>563-157-2468</strong>.
          </p>
        </aside>
      </div>
    </main>
  )
}
