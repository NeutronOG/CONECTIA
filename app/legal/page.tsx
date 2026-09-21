'use client'

import Link from 'next/link'
import { ArrowRight, Bot, Cookie, FileCheck2, Scale, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { legalDocuments } from '@/lib/legal-documents'
import { useLanguage } from '@/lib/i18n'

const categoryConfig = {
  privacidad: { label: 'Privacidad', icon: ShieldCheck },
  uso: { label: 'Uso de la plataforma', icon: FileCheck2 },
  seguridad: { label: 'Seguridad', icon: UserRoundCheck },
  tecnologia: { label: 'Tecnología', icon: Bot },
}

export default function LegalPage() {
  const { language } = useLanguage()
  const l = (es: string, en: string) => language === 'en' ? en : es
  const englishDocuments: Record<string, [string, string]> = {
    'aviso-privacidad-integral': ['Comprehensive Privacy Notice', 'Complete information about the personal data we collect, its purposes, transfers, and the exercise of ARCO rights.'],
    'aviso-privacidad-simplificado': ['Short-form Privacy Notice', 'A summary of data categories, primary purposes, and data-subject rights.'],
    'proteccion-datos-personales': ['Personal Data Protection Policy', 'Principles, responsibilities, security measures, and internal governance for the personal-data lifecycle.'],
    'terminos-condiciones': ['Terms and Conditions of Use', 'Rules governing access, registration, browsing, contracting, and use of the CONECTIA ecosystem.'],
    'reglamento-usuarios': ['User Rules', 'Rights, obligations, standards of conduct, and measures applicable to platform users.'],
    'publicacion-inmuebles': ['Property Listing Policy', 'Accuracy, documentation, maintenance, and accountability requirements for property listings.'],
    'politica-antifraude': ['Anti-Fraud Policy', 'Measures to prevent, detect, investigate, and respond to fraud, impersonation, and illicit activity.'],
    'politica-cookies': ['Cookie Policy', 'Types of cookies and similar technologies, their purposes, providers, and consent-management options.'],
    'uso-responsable-ia': ['Responsible AI Use Policy', 'Principles, authorized uses, restrictions, and responsibilities for the safe use of AI tools.'],
  }
  const categoryLabel = (category: keyof typeof categoryConfig) => language === 'en'
    ? ({ privacidad: 'Privacy', uso: 'Platform use', seguridad: 'Security', tecnologia: 'Technology' }[category])
    : categoryConfig[category].label
  return (
    <main className="min-h-screen bg-[#F6F2EE] dark:bg-[#0F2027] pt-24 pb-24">
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[32px] bg-[#17313A] text-white px-6 py-14 sm:px-12 sm:py-20 mb-12">
          <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-[var(--conectia-arcilla)]/20 blur-3xl" />
          <div className="relative max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-[var(--conectia-arcilla)] mb-6">
              <Scale className="h-4 w-4" /> {l('Transparencia y cumplimiento', 'Transparency and compliance')}
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-6">{l('Centro Legal', 'Legal Center')}</h1>
            <p className="text-lg sm:text-xl text-white/70 leading-8 max-w-3xl">
              {l('Consulta los documentos que regulan el uso de CONECTIA, el tratamiento de datos personales, la publicación de inmuebles y nuestras prácticas de seguridad y tecnología.', 'Review the documents governing the use of CONECTIA, personal-data processing, property listings, and our security and technology practices.')}
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
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#4A4F57] dark:text-[#B0ACA6]">{categoryLabel(document.category)}</span>
                </div>
                <h2 className="font-serif text-2xl font-black text-[#17313A] dark:text-[#EAE4DD] mb-3 group-hover:text-[var(--conectia-arcilla)] transition-colors">
                  {language === 'en' ? englishDocuments[document.slug]?.[0] || document.title : document.title}
                </h2>
                <p className="text-sm text-[#4A4F57] dark:text-[#B0ACA6] leading-6 flex-1">{language === 'en' ? englishDocuments[document.slug]?.[1] || document.description : document.description}</p>
                <span className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-[var(--conectia-arcilla)]">
                  {l('Consultar documento', 'View document')} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 grid lg:grid-cols-[1.4fr_1fr] gap-5">
          <div className="p-7 sm:p-8 rounded-[24px] bg-white dark:bg-[#17313A]/35 border border-[#17313A]/10 dark:border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-[var(--conectia-arcilla)]" />
              <h2 className="font-serif text-2xl font-black text-[#17313A] dark:text-[#EAE4DD]">{l('Privacidad y derechos ARCO', 'Privacy and ARCO rights')}</h2>
            </div>
            <p className="text-[#4A4F57] dark:text-[#B0ACA6] leading-7 mb-5">
              {l('Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus datos mediante el formulario oficial, seleccionando el asunto “Privacidad y derechos ARCO”.', 'You may request access, correction, deletion, or objection to the processing of your data through the official form by selecting “Privacy and ARCO rights.”')}
            </p>
            <Link href="/contacto" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#17313A] dark:bg-[var(--conectia-arcilla)] text-white dark:text-[#0F2027] font-bold">
              {l('Iniciar solicitud', 'Start a request')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="p-7 sm:p-8 rounded-[24px] bg-[var(--conectia-arcilla)]/10 border border-[var(--conectia-arcilla)]/20">
            <h2 className="font-serif text-2xl font-black text-[#17313A] dark:text-[#EAE4DD] mb-4">{l('Contacto legal', 'Legal contact')}</h2>
            <div className="space-y-2 text-sm text-[#4A4F57] dark:text-[#D1CDC7]">
              <p><strong>{l('Responsable:', 'Data controller:')}</strong> CONECTIA ECOSISTEMA INMOBILIARIO</p>
              <p><strong>{l('Domicilio:', 'Address:')}</strong> {l('León, Guanajuato, México', 'León, Guanajuato, Mexico')}</p>
              <p><strong>{l('Teléfono:', 'Phone:')}</strong> 563-157-2468</p>
              <p><strong>{l('Correo de privacidad:', 'Privacy email:')}</strong> {l('pendiente de designación', 'to be designated')}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
