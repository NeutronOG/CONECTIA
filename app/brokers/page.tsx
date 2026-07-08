"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Phone, MapPin, Scale } from "lucide-react"
import { PageHero } from "@/components/page-hero"
import { useLanguage } from "@/lib/i18n"

const notariasAsociadas = [
  {
    nombre: "Notaría 100",
    notario: "Lic. Jorge Arturo Zepeda Orozco",
    especialidad: "Escrituración y Compraventa",
    ubicacion: "León, Guanajuato",
    telefono: "+52 477 475 6951"
  },
  {
    nombre: "Notaría 65",
    notario: "Lic. Pablo Francisco Toriello Arce",
    especialidad: "Compraventa y Fideicomisos",
    ubicacion: "León, Guanajuato",
    telefono: "+52 477 475 6951"
  },
  {
    nombre: "Notaría 98",
    notario: "Lic. Jose Manuel Toriello Arce",
    especialidad: "Desarrollos Inmobiliarios",
    ubicacion: "León, Guanajuato",
    telefono: "+52 477 475 6951"
  },
  {
    nombre: "Notaría 15",
    notario: "Lic. Cesar Santos del Muro Amador",
    especialidad: "Hipotecas y Escrituración",
    ubicacion: "León, Guanajuato",
    telefono: "+52 477 475 6951"
  },
  {
    nombre: "Notaría 82",
    notario: "Lic. Enrique Duran Llamas",
    especialidad: "Compraventa Inmobiliaria",
    especialidadDisplay: "Compraventa <span class='text-[#C78F7B]'>Inmobiliaria</span>",
    ubicacion: "León, Guanajuato",
    telefono: "+52 477 475 6951"
  }
]

export default function BrokersPage() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen bg-conectia-surface">
      <PageHero
        icon={Scale}
        title={t('pages.brokers.heroTitle')}
        titleAccent={t('pages.brokers.heroAccent')}
        description={t('pages.brokers.heroDescription')}
        badge={t('pages.brokers.heroBadge')}
        bgImage="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=80"
      />

      {/* Notarías Asociadas */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-[10px] uppercase tracking-[0.35em] text-conectia-primary font-semibold">{t('pages.brokers.sectionEyebrow')}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-conectia-accent mt-1">
              {t('pages.brokers.sectionTitle')}
            </h2>
            <p className="text-sm text-conectia-accent/55 mt-2 max-w-xl">
              {t('pages.brokers.sectionDescription')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notariasAsociadas.map((notaria, index) => (
              <Card key={index} className="border border-conectia-primary/20 bg-conectia-surface shadow-md hover:shadow-lg hover:border-conectia-primary/40 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-conectia-primary/15 rounded-lg flex items-center justify-center">
                      <Scale className="h-5 w-5 text-conectia-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-conectia-accent">{notaria.nombre}</CardTitle>
                      <p className="text-xs text-conectia-accent/50">{notaria.notario}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-conectia-accent/60">
                      <FileText className="h-3.5 w-3.5 text-conectia-primary/60" />
                      <span dangerouslySetInnerHTML={{ __html: notaria.especialidadDisplay || notaria.especialidad }} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-conectia-accent/60">
                      <MapPin className="h-3.5 w-3.5 text-conectia-primary/60" />
                      <span>{notaria.ubicacion}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-conectia-accent/60">
                      <Phone className="h-3.5 w-3.5 text-conectia-primary/60" />
                      <span>{notaria.telefono}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
