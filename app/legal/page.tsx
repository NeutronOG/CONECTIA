import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bot, Cookie, FileCheck2, Scale, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { legalDocuments } from '@/lib/legal-documents'

export const metadata: Metadata = {
  title: 'Centro Legal | CONECTIA',
  description: 'Avisos de privacidad, términos, políticas y reglas aplicables al ecosistema inmobiliario CONECTIA.',
}

const categoryConfig = {
  privacidad: { label: 'Privacidad', icon: ShieldCheck },
  uso: { label: 'Uso de la plataforma', icon: FileCheck2 },
  seguridad: { label: 'Seguridad', icon: UserRoundCheck },
  tecnologia: { label: 'Tecnología', icon: Bot },
}

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#F6F2EE] dark:bg-[#0F2027] pt-24 pb-24">
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[32px] bg-[#17313A] text-white px-6 py-14 sm:px-12 sm:py-20 mb-12">
          <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-[var(--conectia-arcilla)]/20 blur-3xl" />
          <div className="relative max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-[var(--conectia-arcilla)] mb-6">
              <Scale className="h-4 w-4" /> Transparencia y cumplimiento
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-6">Centro Legal</h1>
            <p className="text-lg sm:text-xl text-white/70 leading-8 max-w-3xl">
              Consulta los documentos que regulan el uso de CONECTIA, el tratamiento de datos personales, la publicación de inmuebles y nuestras prácticas de seguridad y tecnología.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {legalDocuments.map((document) => {
            const category = categoryConfig[document.category]
            const Icon = document.slug === 'politica-cookies' ? Cookie : category.icon

            return (
              <Link
                key={document.slug}
                href={`/legal/${document.slug}`}
                className="group flex flex-col min-h-64 p-6 sm:p-7 rounded-[24px] bg-white dark:bg-[#17313A]/35 border border-[#17313A]/10 dark:border-white/10 hover:border-[var(--conectia-arcilla)]/50 hover:-translate-y-1 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-7">
                  <div className="h-11 w-11 rounded-xl bg-[var(--conectia-arcilla)]/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[var(--conectia-arcilla)]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#4A4F57] dark:text-[#B0ACA6]">{category.label}</span>
                </div>
                <h2 className="font-serif text-2xl font-black text-[#17313A] dark:text-[#EAE4DD] mb-3 group-hover:text-[var(--conectia-arcilla)] transition-colors">
                  {document.title}
                </h2>
                <p className="text-sm text-[#4A4F57] dark:text-[#B0ACA6] leading-6 flex-1">{document.description}</p>
                <span className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-[var(--conectia-arcilla)]">
                  Consultar documento <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 grid lg:grid-cols-[1.4fr_1fr] gap-5">
          <div className="p-7 sm:p-8 rounded-[24px] bg-white dark:bg-[#17313A]/35 border border-[#17313A]/10 dark:border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-[var(--conectia-arcilla)]" />
              <h2 className="font-serif text-2xl font-black text-[#17313A] dark:text-[#EAE4DD]">Privacidad y derechos ARCO</h2>
            </div>
            <p className="text-[#4A4F57] dark:text-[#B0ACA6] leading-7 mb-5">
              Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus datos mediante el formulario oficial, seleccionando el asunto “Privacidad y derechos ARCO”.
            </p>
            <Link href="/contacto" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#17313A] dark:bg-[var(--conectia-arcilla)] text-white dark:text-[#0F2027] font-bold">
              Iniciar solicitud <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="p-7 sm:p-8 rounded-[24px] bg-[var(--conectia-arcilla)]/10 border border-[var(--conectia-arcilla)]/20">
            <h2 className="font-serif text-2xl font-black text-[#17313A] dark:text-[#EAE4DD] mb-4">Contacto legal</h2>
            <div className="space-y-2 text-sm text-[#4A4F57] dark:text-[#D1CDC7]">
              <p><strong>Responsable:</strong> CONECTIA ECOSISTEMA INMOBILIARIO</p>
              <p><strong>Domicilio:</strong> León, Guanajuato, México</p>
              <p><strong>Teléfono:</strong> 563-157-2468</p>
              <p><strong>Correo de privacidad:</strong> pendiente de designación</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
