"use client"

import { useEffect, useRef, useCallback } from "react"
import Shepherd from "shepherd.js"
import "shepherd.js/dist/css/shepherd.css"
import "@/styles/shepherd-custom.css"
import { useRouter, usePathname } from "next/navigation"

const TOUR_STORAGE_KEY = "conectia-tour-completed"

type ShepherdTourInstance = any

export function ShepherdTour() {
  const tourRef = useRef<ShepherdTourInstance | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const navigateAndWait = useCallback((path: string): Promise<void> => {
    return new Promise((resolve) => {
      if (window.location.pathname === path) {
        resolve()
        return
      }
      router.push(path)
      // Wait for navigation to settle
      const check = setInterval(() => {
        if (window.location.pathname === path) {
          clearInterval(check)
          setTimeout(resolve, 800) // extra time for DOM render
        }
      }, 200)
      // Fallback timeout
      setTimeout(() => {
        clearInterval(check)
        resolve()
      }, 3000)
    })
  }, [router])

  const startTour = useCallback(async () => {
    // Destroy previous tour if exists
    if (tourRef.current) {
      try { tourRef.current.cancel() } catch {}
      tourRef.current = null
    }

    // Navigate to home first
    await navigateAndWait("/")
    window.scrollTo({ top: 0, behavior: "smooth" })
    await new Promise(r => setTimeout(r, 500))

    const isMobile = window.innerWidth < 640

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: "shepherd-theme-custom",
        scrollTo: { behavior: "smooth", block: "center" },
        cancelIcon: { enabled: true },
        modalOverlayOpeningPadding: isMobile ? 8 : 16,
        modalOverlayOpeningRadius: isMobile ? 8 : 16,
        popperOptions: {
          modifiers: [
            { name: "preventOverflow", options: { boundary: "viewport", padding: 12 } },
            { name: "flip", options: { fallbackPlacements: ["top", "bottom", "left", "right"] } },
          ],
        },
      } as any,
    })

    // ============================
    // PASO 1: BIENVENIDA
    // ============================
    tour.addStep({
      id: "welcome",
      title: "¡Bienvenido a CONECTIA!",
      text: `
        <div style="text-align:center; margin-bottom: 12px;">
          <img src="/logo.png" alt="CONECTIA" style="height:48px; margin:0 auto; border-radius:12px;" />
        </div>
        <p>Te voy a guiar paso a paso por toda la plataforma. Descubrirás cómo buscar propiedades, contactar asesores, vender tu propiedad y mucho más.</p>
        <p style="margin-top:8px;opacity:0.7;font-size:13px;">Duración aproximada: 2 minutos</p>
      `,
      buttons: [
        { text: "Omitir Tour", classes: "shepherd-button-secondary", action: () => tour.cancel() },
        { text: "¡Vamos!", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 2: NAVEGACIÓN / ISLA DINÁMICA
    // ============================
    tour.addStep({
      id: "navigation",
      title: "Navegación Principal",
      text: "Esta es la <strong>Isla Dinámica</strong>: tu barra de navegación flotante. Desde aquí accedes a <strong>Inicio, Propiedades, Propietarios y Contacto</strong>. En móvil, toca el botón <strong>Menú</strong> para desplegarla.",
      attachTo: {
        element: "div[class*='fixed'][class*='left-1/2']",
        on: isMobile ? "top" as const : "bottom" as const,
      },
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 3: HERO / VIDEO
    // ============================
    tour.addStep({
      id: "hero",
      title: "Sección Principal",
      text: "Aquí encontrarás nuestro <strong>video de presentación</strong> y los accesos rápidos para <strong>explorar propiedades</strong> o <strong>vender tu propiedad</strong>. Es la primera impresión de CONECTIA.",
      attachTo: { element: "section:first-of-type", on: "bottom" as const },
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 4: ESTADÍSTICAS
    // ============================
    tour.addStep({
      id: "stats",
      title: "Estadísticas en Tiempo Real",
      text: "Nuestros <strong>números hablan por sí solos</strong>: propiedades activas, clientes satisfechos, años de experiencia y más. Se actualizan automáticamente.",
      attachTo: { element: "section:nth-of-type(2)", on: "top" as const },
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 5: PROPIEDADES DESTACADAS
    // ============================
    tour.addStep({
      id: "featured",
      title: "Propiedades Destacadas",
      text: "Nuestro <strong>carrusel interactivo</strong> muestra las mejores propiedades disponibles. Desliza para ver fotos, precios, ubicación y características de cada una.",
      attachTo: { element: "section:nth-of-type(3)", on: "top" as const },
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 6: ¿POR QUÉ CONECTIA?
    // ============================
    tour.addStep({
      id: "why-conectia",
      title: "¿Por qué CONECTIA?",
      text: "<strong>Confianza</strong> con proceso 100% transparente. <strong>Exclusividad</strong> con propiedades únicas. <strong>Conexión</strong> directa entre compradores y vendedores, sin intermediarios innecesarios.",
      attachTo: { element: "section:nth-of-type(4)", on: "top" as const },
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 7: NAVEGAR A PROPIEDADES
    // ============================
    tour.addStep({
      id: "go-to-properties",
      title: "Catálogo de Propiedades",
      text: "Ahora te llevaré al <strong>catálogo completo de propiedades</strong>. Aquí podrás filtrar por tipo, precio, ubicación y más. Espera un momento mientras cargamos la página...",
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        {
          text: "Ir a Propiedades →",
          action: async () => {
            await navigateAndWait("/propiedades")
            window.scrollTo({ top: 0, behavior: "smooth" })
            await new Promise(r => setTimeout(r, 600))
            tour.next()
          },
        },
      ],
    })

    // ============================
    // PASO 8: PÁGINA DE PROPIEDADES
    // ============================
    tour.addStep({
      id: "properties-page",
      title: "Explora Propiedades",
      text: `
        <p>Aquí puedes ver <strong>todas las propiedades disponibles</strong>. Cada tarjeta muestra:</p>
        <ul style="margin:8px 0;padding-left:16px;">
          <li>Fotografías profesionales</li>
          <li>Precio y ubicación</li>
          <li>Habitaciones, baños y área</li>
          <li>Estado (Disponible, Vendida, etc.)</li>
        </ul>
        <p>Haz clic en cualquier propiedad para ver todos sus <strong>detalles, amenidades y contacto</strong>.</p>
      `,
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 9: IR A PROPIETARIOS
    // ============================
    tour.addStep({
      id: "go-to-owners",
      title: "¿Quieres Vender tu Propiedad?",
      text: "Ahora te muestro la sección de <strong>Propietarios</strong>, donde puedes registrar tu propiedad para que CONECTIA la promueva con la mejor estrategia de mercado.",
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        {
          text: "Ir a Propietarios →",
          action: async () => {
            await navigateAndWait("/propietarios")
            window.scrollTo({ top: 0, behavior: "smooth" })
            await new Promise(r => setTimeout(r, 600))
            tour.next()
          },
        },
      ],
    })

    // ============================
    // PASO 10: FORMULARIO DE PROPIETARIOS
    // ============================
    tour.addStep({
      id: "owners-page",
      title: "Registro de Propiedad",
      text: `
        <p>Este formulario te guía paso a paso para registrar tu propiedad:</p>
        <ul style="margin:8px 0;padding-left:16px;">
          <li><strong>Paso 1:</strong> Datos de la propiedad (tipo, área, habitaciones)</li>
          <li><strong>Paso 2:</strong> Ubicación exacta</li>
          <li><strong>Paso 3:</strong> Precio y condiciones</li>
          <li><strong>Paso 4:</strong> Fotos (hasta 30)</li>
          <li><strong>Paso 5:</strong> Amenidades y extras</li>
        </ul>
        <p>¡Nuestro equipo te contactará en menos de 24 horas!</p>
      `,
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 11: IR A CONTACTO
    // ============================
    tour.addStep({
      id: "go-to-contact",
      title: "Contacto Directo",
      text: "Veamos la sección de <strong>Contacto</strong> donde puedes comunicarte directamente con el equipo CONECTIA.",
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        {
          text: "Ir a Contacto →",
          action: async () => {
            await navigateAndWait("/contacto")
            window.scrollTo({ top: 0, behavior: "smooth" })
            await new Promise(r => setTimeout(r, 600))
            tour.next()
          },
        },
      ],
    })

    // ============================
    // PASO 12: PÁGINA DE CONTACTO
    // ============================
    tour.addStep({
      id: "contact-page",
      title: "Comunícate con Nosotros",
      text: `
        <p>Aquí encontrarás todas las formas de contactarnos:</p>
        <ul style="margin:8px 0;padding-left:16px;">
          <li><strong>WhatsApp:</strong> Respuesta inmediata</li>
          <li><strong>Teléfono:</strong> +52 1 477 475 6951</li>
          <li><strong>Email:</strong> conectiaselect@gmail.com</li>
          <li><strong>Formulario:</strong> Te respondemos en 24h</li>
        </ul>
      `,
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 13: FAVORITOS
    // ============================
    tour.addStep({
      id: "favorites-info",
      title: "Lista de Favoritos",
      text: `
        <p>¿Te gustó una propiedad? <strong>Agrega a favoritos</strong> con el ícono de corazón.</p>
        <p style="margin-top:8px;">Tu lista se guarda localmente y puedes accederla desde el ícono <strong>♡</strong> en la navegación.</p>
        <p style="margin-top:8px;opacity:0.7;font-size:13px;">También puedes compartir propiedades por WhatsApp directamente.</p>
      `,
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 14: CATEGORÍAS
    // ============================
    tour.addStep({
      id: "categories-info",
      title: "Categorías Especiales",
      text: `
        <p>Tenemos categorías para cada necesidad:</p>
        <ul style="margin:8px 0;padding-left:16px;">
          <li><strong>Venta:</strong> Propiedades en venta</li>
          <li><strong>Renta:</strong> Propiedades en renta</li>
          <li><strong>Exclusivos:</strong> Propiedades premium</li>
          <li><strong>Desarrollos:</strong> Nuevos proyectos con mapa 3D</li>
          <li><strong>Especiales:</strong> Oportunidades únicas</li>
          <li><strong>Ofertas:</strong> Los mejores precios</li>
        </ul>
        <p style="margin-top:8px;">Accede desde el menú en la sección <strong>Categorías</strong>.</p>
      `,
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 15: ASISTENTE IA
    // ============================
    tour.addStep({
      id: "ai-assistant",
      title: "Asistente con Inteligencia Artificial",
      text: `
        <p>Tenemos un <strong>asistente virtual con IA</strong> disponible 24/7. Puede:</p>
        <ul style="margin:8px 0;padding-left:16px;">
          <li>Buscar propiedades por criterios específicos</li>
          <li>Responder preguntas sobre el proceso de compra/venta</li>
          <li>Mostrarte propiedades que se ajusten a tu perfil</li>
        </ul>
        <p style="margin-top:8px;">Búscalo como un botón flotante en la pantalla.</p>
      `,
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 16: ACCESO PARA PROFESIONALES
    // ============================
    tour.addStep({
      id: "professionals",
      title: "Para Profesionales Inmobiliarios",
      text: `
        <p>Si eres <strong>asesor, broker o fotógrafo</strong>, CONECTIA tiene un panel exclusivo para ti:</p>
        <ul style="margin:8px 0;padding-left:16px;">
          <li><strong>Panel Asesor:</strong> Gestiona propiedades y clientes</li>
          <li><strong>Panel Broker:</strong> Administra tu equipo</li>
          <li><strong>Panel Fotógrafo:</strong> Sube fotos profesionales</li>
          <li><strong>Alianza Comercial:</strong> Únete como aliado</li>
        </ul>
        <p style="margin-top:8px;">Accede desde <strong>"Soy Asesor"</strong> o <strong>"Acceso Interno"</strong> en el menú.</p>
      `,
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 17: SEGURIDAD Y BIOMETRÍA
    // ============================
    tour.addStep({
      id: "security",
      title: "Seguridad de tu Cuenta",
      text: `
        <p>Tu seguridad es prioridad:</p>
        <ul style="margin:8px 0;padding-left:16px;">
          <li><strong>Sesión segura:</strong> Se cierra tras 45 min de inactividad</li>
          <li><strong>Face ID / Huella:</strong> Acceso biométrico rápido</li>
          <li><strong>Datos encriptados:</strong> Protección total</li>
        </ul>
        <p style="margin-top:8px;opacity:0.7;font-size:13px;">Configura el acceso biométrico desde la pantalla de inicio de sesión.</p>
      `,
      buttons: [
        { text: "Anterior", classes: "shepherd-button-secondary", action: () => tour.back() },
        { text: "Siguiente", action: () => tour.next() },
      ],
    })

    // ============================
    // PASO 18: FINALIZACIÓN
    // ============================
    tour.addStep({
      id: "complete",
      title: "¡Tour Completado!",
      text: `
        <div style="text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">🎉</div>
          <p style="font-size:16px;font-weight:600;margin-bottom:12px;">Ya conoces toda la plataforma CONECTIA</p>
          <p>Proceso transparente, sin complicaciones, con la mejor tecnología inmobiliaria.</p>
          <p style="margin-top:12px;opacity:0.7;font-size:13px;">Puedes repetir este tour cuando quieras desde el menú.</p>
        </div>
      `,
      buttons: [
        {
          text: "Volver al Inicio",
          classes: "shepherd-button-secondary",
          action: async () => {
            localStorage.setItem(TOUR_STORAGE_KEY, "true")
            tour.complete()
            await navigateAndWait("/")
            window.scrollTo({ top: 0, behavior: "smooth" })
          },
        },
        {
          text: "¡Finalizar!",
          action: () => {
            localStorage.setItem(TOUR_STORAGE_KEY, "true")
            tour.complete()
          },
        },
      ],
    })

    // Event handlers
    tour.on("complete", () => {
      localStorage.setItem(TOUR_STORAGE_KEY, "true")
    })
    tour.on("cancel", () => {
      localStorage.setItem(TOUR_STORAGE_KEY, "true")
    })

    tourRef.current = tour
    tour.start()
  }, [navigateAndWait])

  // Listen for custom event to trigger tour from anywhere (e.g., menu)
  useEffect(() => {
    const handler = () => startTour()
    window.addEventListener("conectia-start-tour", handler)
    return () => window.removeEventListener("conectia-start-tour", handler)
  }, [startTour])

  // No floating button — tour is triggered from the menu
  return null
}
