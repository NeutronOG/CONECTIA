'use client'

import { Palette, Home, Award, TrendingUp, Shield } from 'lucide-react'
import Image from 'next/image'

export default function FichaMarcaPage() {
  return (
    <div
      className="min-h-screen bg-conectia-secondary py-8 sm:py-16 md:py-20 px-4 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('https://mnrfsdrjadretxesjxhu.supabase.co/storage/v1/object/sign/conectia/hf_20260219_015208_b75495b2-1016-45df-a1f8-d1160006831b.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZTg2NjJkMS1lZjIzLTRkZjUtYjAwYy04NjVkOTcwYzljZWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcmtpbi9oZl8yMDI2MDIxOV8wMTUyMDhfYjc1NDk1YjItMTAxNi00NWRmLWExZjgtZDExNjAwMDY4MzFiLmpwZWciLCJpYXQiOjE3NzE0NjYyNTQsImV4cCI6MTgwMzAwMjI1NH0.0ew5z0WbvUkHQAwo8zOlhQFyLokmh2PKTqjqBtpxcuc')" }}
    >
      {/* Contenedor de la ficha */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-conectia-secondary rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header con color amarillo sólido */}
          <div className="relative h-40 sm:h-52 md:h-64 bg-conectia-primary overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="bg-conectia-primary px-6 sm:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-3xl shadow-2xl">
                <Image 
                  src="/logo.png" 
                  alt="CONECTIA" 
                  width={400} 
                  height={120} 
                  className="h-12 sm:h-16 md:h-20 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-4 sm:p-8 md:p-12 space-y-8 sm:space-y-10 md:space-y-12">
            
            {/* Introducción */}
            <section>
              <div className="bg-gradient-to-br from-conectia-gold/10 to-conectia-gold/5 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-l-4 border-conectia-gold">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-conectia-graphite mb-3 sm:mb-4">La Plataforma Inmobiliaria del Futuro</h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                  <span className="font-bold text-conectia-gold">CONECTIA</span> combina <span className="font-semibold">inteligencia artificial, marketing digital agresivo y tecnología 360°</span> para vender tu propiedad más rápido y al mejor precio.
                </p>
              </div>
            </section>

            {/* Factores Diferenciadores */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-conectia-graphite mb-6 sm:mb-8 text-center">🚀 Nuestros Factores Diferenciadores</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-conectia-secondary/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border-t-4 border-conectia-gold hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-conectia-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6 text-conectia-gold" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-conectia-graphite">IA + Big Data</h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700">
                    Valoración inteligente con <span className="font-semibold">análisis de mercado en tiempo real</span>. Precio óptimo basado en datos, no intuición.
                  </p>
                </div>

                <div className="bg-conectia-secondary/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border-t-4 border-conectia-gold hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-conectia-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 sm:w-6 h-5 sm:h-6 text-conectia-gold" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-conectia-graphite">Tours 360° Inmersivos</h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700">
                    Tecnología de <span className="font-semibold">realidad virtual</span> que permite visitas desde cualquier lugar del mundo.
                  </p>
                </div>

                <div className="bg-conectia-secondary/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border-t-4 border-conectia-gold hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-conectia-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-conectia-gold" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-conectia-graphite">Marketing Multicanal</h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700">
                    <span className="font-semibold">+50,000 impresiones</span> en la primera semana. Facebook, Instagram, Google Ads y portales premium.
                  </p>
                </div>

                <div className="bg-conectia-secondary/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border-t-4 border-conectia-gold hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-conectia-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Palette className="w-5 sm:w-6 h-5 sm:h-6 text-conectia-gold" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-conectia-graphite">Producción Premium</h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700">
                    Fotografía profesional, video drone y <span className="font-semibold">staging digital</span> incluido.
                  </p>
                </div>
              </div>

              {/* Tecnología */}
              <div className="mt-6 sm:mt-8 bg-gradient-to-r from-conectia-graphite via-black to-conectia-graphite text-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">⚙️ Tecnología de Vanguardia</h3>
                <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
                  <div>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-conectia-gold mb-1 sm:mb-2">24/7</p>
                    <p className="text-xs sm:text-sm">Asistente IA</p>
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-conectia-gold mb-1 sm:mb-2">360°</p>
                    <p className="text-xs sm:text-sm">Tours Virtuales</p>
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-conectia-gold mb-1 sm:mb-2">+10</p>
                    <p className="text-xs sm:text-sm">Canales Ads</p>
                  </div>
                </div>
              </div>
            </section>


            {/* Proceso Simplificado */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-conectia-graphite mb-4 sm:mb-6 text-center">⚡ Proceso Rápido y Efectivo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-conectia-gold/10 to-conectia-gold/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-conectia-gold text-white rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl mx-auto mb-3 sm:mb-4">1</div>
                  <h3 className="text-base sm:text-lg font-bold text-conectia-graphite mb-1 sm:mb-2">Valuación IA</h3>
                  <p className="text-xs sm:text-sm text-gray-700">Precio óptimo en 24h</p>
                </div>

                <div className="bg-gradient-to-br from-conectia-gold/10 to-conectia-gold/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-conectia-gold text-white rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl mx-auto mb-3 sm:mb-4">2</div>
                  <h3 className="text-base sm:text-lg font-bold text-conectia-graphite mb-1 sm:mb-2">Producción 360°</h3>
                  <p className="text-xs sm:text-sm text-gray-700">Fotos + Tour virtual</p>
                </div>

                <div className="bg-gradient-to-br from-conectia-gold/10 to-conectia-gold/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-conectia-gold text-white rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl mx-auto mb-3 sm:mb-4">3</div>
                  <h3 className="text-base sm:text-lg font-bold text-conectia-graphite mb-1 sm:mb-2">Marketing Masivo</h3>
                  <p className="text-xs sm:text-sm text-gray-700">+50k impresiones/semana</p>
                </div>
              </div>
            </section>

            {/* Garantía */}
            <section>
              <div className="bg-gradient-to-br from-conectia-gold via-[#FFD700] to-conectia-gold p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl text-center shadow-2xl">
                <Shield className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-white mx-auto mb-2 sm:mb-3" />
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">💯 Garantía de Resultados</h2>
                <p className="text-white text-sm sm:text-base max-w-2xl mx-auto">
                  <span className="font-bold">30 días</span> para ver resultados tangibles o ajustamos la estrategia sin costo adicional.
                </p>
              </div>
            </section>

            {/* Call to Action */}
            <section>
              <div className="bg-conectia-graphite text-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">📞 Contáctanos</h2>
                <div className="flex flex-col gap-2 sm:gap-4 justify-center items-center">
                  <div className="flex items-center gap-2 bg-conectia-secondary/50/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm">
                    <span>📱</span>
                    <p className="font-bold">+52 1 477 475 6951</p>
                  </div>
                  <div className="flex items-center gap-2 bg-conectia-secondary/50/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm">
                    <span>📧</span>
                    <p className="font-bold">conectiaselect@gmail.com</p>
                  </div>
                  <div className="flex items-center gap-2 bg-conectia-gold text-conectia-graphite px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm">
                    <span>📍</span>
                    <span>León, GTO</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Identidad Visual */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-conectia-graphite mb-3 sm:mb-4 text-center">🎨 Identidad Visual</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="text-center p-2 sm:p-3 bg-conectia-secondary/50 rounded-lg sm:rounded-xl shadow">
                  <div className="w-full h-12 sm:h-16 bg-conectia-gold rounded-lg mb-1 sm:mb-2"></div>
                  <p className="font-bold text-xs">Dorado</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500">#D4AF37</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-conectia-secondary/50 rounded-lg sm:rounded-xl shadow">
                  <div className="w-full h-12 sm:h-16 bg-conectia-primary rounded-lg mb-1 sm:mb-2"></div>
                  <p className="font-bold text-xs">Amarillo</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500">#F4E5C3</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-conectia-secondary/50 rounded-lg sm:rounded-xl shadow">
                  <div className="w-full h-12 sm:h-16 bg-conectia-graphite rounded-lg mb-1 sm:mb-2"></div>
                  <p className="font-bold text-xs">Grafito</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500">#212121</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-conectia-secondary/50 rounded-lg sm:rounded-xl shadow">
                  <div className="w-full h-12 sm:h-16 bg-conectia-secondary rounded-lg mb-1 sm:mb-2 border border-gray-200"></div>
                  <p className="font-bold text-xs">Beige</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500">#F5F5DC</p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <section className="border-t-2 border-conectia-gold/20 pt-6 sm:pt-8">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="flex justify-center">
                  <Image 
                    src="/logo.png" 
                    alt="CONECTIA" 
                    width={250} 
                    height={80} 
                    className="h-8 sm:h-10 md:h-12 w-auto object-contain"
                  />
                </div>
                <p className="text-sm sm:text-base text-gray-600">Tu socio inmobiliario de confianza</p>
                <p className="text-xs sm:text-sm text-gray-500">© 2025 CONECTIA. Todos los derechos reservados.</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
