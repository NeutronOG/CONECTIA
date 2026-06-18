import Link from "next/link"
import Image from "next/image"
import { MapPin, Mail, Phone, ArrowUpRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#F6F2EE] dark:bg-[#0F2027] text-[#17313A] dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C78F7B]/8 dark:bg-[#C78F7B]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#17313A]/10 dark:bg-[#17313A]/60 rounded-full blur-[100px] pointer-events-none" />

      {/* Top gradient line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C78F7B]/30 dark:via-[#C78F7B]/40 to-transparent" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-8 lg:px-16 py-16 sm:py-20">
        {/* Top CTA Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-16 pb-16 border-b border-[#17313A]/10 dark:border-white/10">
          <div className="max-w-lg">
            <h3 className="font-serif text-3xl sm:text-4xl font-black text-[#17313A] dark:text-white mb-3">
              ¿Listo para tu <span className="bg-gradient-to-r from-[#C78F7B] to-[#E8A88F] bg-clip-text text-transparent">próximo hogar?</span>
            </h3>
            <p className="text-[#B0ACA6] text-base">
              Conectamos directamente compradores y vendedores. Sin complicaciones.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/contacto">
              <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] dark:text-[#0F2027] font-bold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[#C78F7B]/20">
                Contactar Ahora
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/propiedades">
              <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#17313A]/5 dark:bg-white/5 border border-[#17313A]/15 dark:border-white/15 text-[#17313A] dark:text-white font-semibold hover:bg-[#17313A]/10 dark:hover:bg-white/10 hover:border-[#C78F7B]/30 transition-all duration-300">
                Ver Propiedades
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
                src="/logo.png"
                alt="CONECTIA"
                width={200}
                height={60}
                className="h-11 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-[#B0ACA6] leading-relaxed mb-8 max-w-xs">
              La forma más transparente y estética de encontrar tu próxima propiedad en Guanajuato.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {['f', 'in', '@'].map((icon) => (
                <div key={icon} className="w-10 h-10 bg-[#17313A]/5 dark:bg-white/[0.05] border border-[#17313A]/10 dark:border-white/10 hover:bg-[#C78F7B]/20 hover:border-[#C78F7B]/30 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#C78F7B]/10">
                  <span className="text-[#17313A] dark:text-[#EAE4DD] font-bold text-sm">{icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#C78F7B] font-bold mb-5">Servicios</p>
            <ul className="space-y-3">
              {['Marketing Digital', 'Tours Virtuales', 'Valoración IA'].map((item) => (
                <li key={item}>
                  <Link href="/servicios" className="group text-sm text-[#4A4F57] dark:text-[#B0ACA6] hover:text-[#17313A] dark:hover:text-[#EAE4DD] transition-colors duration-300 flex items-center gap-1">
                    {item}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#C78F7B] font-bold mb-5">Explorar</p>
            <ul className="space-y-3">
              {[
                { label: 'Compra', href: '/compra' },
                { label: 'Venta', href: '/venta' },
                { label: 'Renta', href: '/renta' },
                { label: 'Ofertas', href: '/ofertas' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="group text-sm text-[#4A4F57] dark:text-[#B0ACA6] hover:text-[#17313A] dark:hover:text-[#EAE4DD] transition-colors duration-300 flex items-center gap-1">
                    {item.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#C78F7B] font-bold mb-5">Contacto</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#C78F7B]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C78F7B]/20 transition-colors">
                  <MapPin className="h-4 w-4 text-[#C78F7B]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#4A4F57] uppercase tracking-wider">Oficina</p>
                  <p className="text-sm text-[#17313A] dark:text-[#EAE4DD]">León, Guanajuato, México</p>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#C78F7B]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C78F7B]/20 transition-colors">
                  <Mail className="h-4 w-4 text-[#C78F7B]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#4A4F57] uppercase tracking-wider">Email</p>
                  <Link href="/contacto" className="text-sm text-[#17313A] dark:text-[#EAE4DD] hover:text-[#C78F7B] transition-colors">
                    conectia@gmail.com
                  </Link>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#C78F7B]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C78F7B]/20 transition-colors">
                  <Phone className="h-4 w-4 text-[#C78F7B]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#4A4F57] uppercase tracking-wider">WhatsApp</p>
                  <a
                    href="https://wa.me/5214774756951?text=Hola%20CONECTIA,%20me%20interesa%20obtener%20más%20información%20sobre%20sus%20servicios%20inmobiliarios."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#17313A] dark:text-[#EAE4DD] hover:text-[#C78F7B] transition-colors"
                  >
                    +52 1 477 475 6951
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#17313A]/10 dark:border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm text-[#4A4F57]">© 2025 CONECTIA. Todos los derechos reservados.</span>
            <div className="flex gap-6">
              <Link href="/legal" className="text-sm text-[#4A4F57] hover:text-[#17313A] dark:hover:text-[#B0ACA6] transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/legal" className="text-sm text-[#4A4F57] hover:text-[#17313A] dark:hover:text-[#B0ACA6] transition-colors">
                Términos de Servicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
