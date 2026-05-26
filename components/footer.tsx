import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-conectia-accent text-white relative overflow-hidden">
      {/* Línea superior de marca */}
      <div className="h-[3px] bg-gradient-to-r from-conectia-primary via-conectia-primary/70 to-transparent" />

      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-8 lg:px-16">
        <div className="footer-container relative rounded-[2rem] overflow-hidden backdrop-blur-[1rem] my-6">
          {/* Estrellas animadas de fondo */}
          <div className="container-stars absolute z-[-1] w-full h-full overflow-hidden transition-all duration-500 backdrop-blur-[1rem] rounded-[2rem]">
            <div className="stars-wrapper">
              <div className="stars"></div>
            </div>
          </div>

          {/* Efecto de brillo (glow) */}
          <div className="glow-effect absolute flex w-full h-full pointer-events-none">
            <div className="glow-circle glow-circle-1"></div>
            <div className="glow-circle glow-circle-2"></div>
          </div>

          {/* Contenido */}
          <div className="relative z-10 px-6 sm:px-10 py-14 sm:py-16 bg-conectia-accent/95">
            <div className="grid md:grid-cols-4 gap-10 mb-12">

              {/* Columna Marca */}
              <div className="md:col-span-1">
                <div className="mb-5">
                  <Image
                    src="/logo.png"
                    alt="CONECTIA"
                    width={200}
                    height={60}
                    className="h-11 w-auto object-contain"
                  />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-6 text-pretty">
                  Conectamos directamente compradores y vendedores. Sin complicaciones.
                  Proceso simple y transparente.
                </p>
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-conectia-primary/20 hover:bg-conectia-primary/40 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 border border-conectia-primary/30">
                    <span className="text-conectia-primary font-bold text-sm">f</span>
                  </div>
                  <div className="w-9 h-9 bg-conectia-primary/20 hover:bg-conectia-primary/40 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 border border-conectia-primary/30">
                    <span className="text-conectia-primary font-bold text-xs">in</span>
                  </div>
                  <div className="w-9 h-9 bg-conectia-primary/20 hover:bg-conectia-primary/40 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 border border-conectia-primary/30">
                    <span className="text-conectia-primary font-bold text-sm">@</span>
                  </div>
                </div>
              </div>

              {/* Servicios */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-conectia-primary font-bold mb-4">Servicios</p>
                <ul className="space-y-3">
                  <li>
                    <Link href="/servicios" className="text-sm text-gray-300 hover:text-conectia-primary transition-colors duration-300">
                      Marketing Digital
                    </Link>
                  </li>
                  <li>
                    <Link href="/servicios" className="text-sm text-gray-300 hover:text-conectia-primary transition-colors duration-300">
                      Tours Virtuales
                    </Link>
                  </li>
                  <li>
                    <Link href="/servicios" className="text-sm text-gray-300 hover:text-conectia-primary transition-colors duration-300">
                      Valoración IA
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Soluciones */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-conectia-primary font-bold mb-4">Soluciones</p>
                <ul className="space-y-3">
                  <li>
                    <Link href="/propiedades" className="text-sm text-gray-300 hover:text-conectia-primary transition-colors duration-300">
                      Venta
                    </Link>
                  </li>
                  <li>
                    <Link href="/propiedades" className="text-sm text-gray-300 hover:text-conectia-primary transition-colors duration-300">
                      Renta
                    </Link>
                  </li>
                  <li>
                    <Link href="/propiedades" className="text-sm text-gray-300 hover:text-conectia-primary transition-colors duration-300">
                      Compra
                    </Link>
                  </li>
                  <li>
                    <Link href="/servicios" className="text-sm text-gray-300 hover:text-conectia-primary transition-colors duration-300">
                      Construcción
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contacto */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-conectia-primary font-bold mb-4">Contacto</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-conectia-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-widest">Oficina Principal</p>
                      <p className="text-sm text-gray-200">León, Gto</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-conectia-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-widest">Email</p>
                      <Link href="/contacto" className="text-sm text-gray-200 hover:text-conectia-primary transition-colors">
                        conectiaselect@gmail.com
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 bg-conectia-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-widest">WhatsApp</p>
                      <a
                        href="https://wa.me/5214774756951?text=Hola%20CONECTIA%20SELECT,%20me%20interesa%20obtener%20más%20información%20sobre%20sus%20servicios%20inmobiliarios."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-200 hover:text-conectia-primary transition-colors flex items-center gap-2"
                      >
                        <span>📱</span>
                        <span>+52 1 477 475 6951</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra inferior */}
            <div className="border-t border-conectia-primary/15 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
                  <span className="text-sm text-gray-400">© 2025 CONECTIA. Todos los derechos reservados.</span>
                  <span className="text-xs text-gray-600">Powered by HUTEC</span>
                </div>
                <div className="flex gap-6 text-sm">
                  <Link href="/legal" className="text-gray-400 hover:text-conectia-primary transition-colors duration-300">
                    Política de Privacidad
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
