"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Mail, Phone, ArrowUpRight } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#17313A]/8 dark:bg-[#C78F7B]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#17313A]/10 dark:bg-[#C78F7B]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top gradient line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#17313A]/30 dark:via-[#C78F7B]/30 to-transparent" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-8 lg:px-16 py-16 sm:py-20">
        {/* Top CTA Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-16 pb-16 border-b border-[#17313A]/10 dark:border-white/10">
          <div className="max-w-lg">
            <h3 className="font-serif text-3xl sm:text-4xl font-black text-[#17313A] dark:text-[#C78F7B] mb-3">
              {t('home.cta.title')} <span className="bg-gradient-to-r from-[#17313A] to-[#E8A88F] dark:from-[#C78F7B] dark:to-[#E8A88F] bg-clip-text text-transparent">{t('home.hero.titleHighlight')}?</span>
            </h3>
            <p className="text-[#B0ACA6] text-base">
              {t('home.cta.subtitle')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/contacto">
              <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#17313A] hover:bg-[#D4987E] dark:bg-[#C78F7B] dark:hover:bg-[#D4987E] text-[#EAE4DD] dark:text-[#0F2027] font-bold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[#17313A]/20 dark:shadow-[#C78F7B]/20">
                {t('common.contact')}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/propiedades">
              <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#17313A]/5 dark:bg-white/5 border border-[#17313A]/15 dark:border-white/15 text-[#17313A] dark:text-white font-semibold hover:bg-[#17313A]/10 dark:hover:bg-white/10 hover:border-[#17313A]/30 dark:hover:border-[#C78F7B]/30 transition-all duration-300">
                {t('common.seeMore')} {t('properties.pageTitle')}
              </button>
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-12 gap-10 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <div className="mb-6">
              <Image
                src="/logoconectiaoficial.png"
                alt="CONECTIA"
                width={200}
                height={60}
                className="h-11 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-[#B0ACA6] leading-relaxed mb-8 max-w-xs">
              {t('common.tagline')}
            </p>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#17313A] dark:text-[#C78F7B] font-bold mb-5">{t('footer.company')}</p>
            <ul className="space-y-3">
              {[
                { label: t('footer.links.about'), href: '/nosotros' },
                { label: t('footer.links.brokers'), href: '/brokers' },
                { label: t('footer.links.developments'), href: '/desarrollos' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="group text-sm text-[#4A4F57] dark:text-[#B0ACA6] hover:text-[#17313A] dark:hover:text-[#C78F7B] transition-colors duration-300 flex items-center gap-1">
                    {item.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#17313A] dark:text-[#C78F7B] font-bold mb-5">{t('footer.explore')}</p>
            <ul className="space-y-3">
              {[
                { label: t('footer.links.buy'), href: '/compra' },
                { label: t('footer.links.rent'), href: '/renta' },
                { label: t('footer.links.ofertas'), href: '/ofertas' },
                { label: t('footer.links.especial'), href: '/especiales' },
                { label: t('footer.links.preventa'), href: '/preventa' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="group text-sm text-[#4A4F57] dark:text-[#B0ACA6] hover:text-[#17313A] dark:hover:text-[#C78F7B] transition-colors duration-300 flex items-center gap-1">
                    {item.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#17313A] dark:text-[#C78F7B] font-bold mb-5">{t('common.contact')}</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#17313A]/10 dark:bg-[#C78F7B]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#17313A]/20 dark:hover:bg-[#C78F7B]/20 transition-colors">
                  <MapPin className="h-4 w-4 text-[#17313A] dark:text-[#C78F7B]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#4A4F57] uppercase tracking-wider">{t('common.location')}</p>
                  <p className="text-sm text-[#17313A] dark:text-[#EAE4DD]">León, Guanajuato, México</p>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#17313A]/10 dark:bg-[#C78F7B]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#17313A]/20 dark:hover:bg-[#C78F7B]/20 transition-colors">
                  <Mail className="h-4 w-4 text-[#17313A] dark:text-[#C78F7B]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#4A4F57] uppercase tracking-wider">Email</p>
                  <Link href="/contacto" className="text-sm text-[#17313A] dark:text-[#EAE4DD] hover:text-[#17313A] dark:hover:text-[#C78F7B] transition-colors">
                    conectia@gmail.com
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#17313A]/10 dark:border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm text-[#4A4F57]">{t('common.copyright', { year: new Date().getFullYear() })}</span>
            <div className="flex gap-6">
              <Link href="/legal" className="text-sm text-[#4A4F57] hover:text-[#17313A] dark:hover:text-[#C78F7B] transition-colors">
                {t('footer.links.privacy')}
              </Link>
              <Link href="/legal" className="text-sm text-[#4A4F57] hover:text-[#17313A] dark:hover:text-[#C78F7B] transition-colors">
                {t('footer.links.terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
