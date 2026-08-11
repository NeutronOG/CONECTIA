import type React from "react"
import type { Metadata, Viewport } from "next"
import { Montserrat } from "next/font/google"
import { Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import { Footer } from "@/components/footer"
import { DynamicHeader } from "@/components/dynamic-header"
import { WishlistProvider } from "@/components/wishlist-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { SWRProvider } from "@/components/swr-provider"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/i18n"
import { LanguageHtml } from "@/components/language-html"
import { PanelShell } from "@/components/panel-shell"
import { AIAgent } from "@/components/ai-agent"
import { MediaProtection } from "@/components/media-protection"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.conectiaselect.com'),
  title: "CONECTIA - Tu Plataforma Inmobiliaria de Confianza",
  description: "Exclusividad, Conexión y Confianza. Confía tu propiedad a CONECTIA.",
  generator: "v0.app",
  icons: {
    icon: "/logoconectiaoficial.png",
    apple: "/logoconectiaoficial.png",
    shortcut: "/logoconectiaoficial.png",
  },
  openGraph: {
    title: "CONECTIA - Red Inmobiliaria",
    description: "Conecta oportunidades. Publica con confianza. Vende con resultados.",
    images: [
      {
        url: "/logoconectiaoficial.png",
        width: 1200,
        height: 630,
        alt: "CONECTIA Logo",
      },
    ],
    type: "website",
    locale: "es_MX",
    siteName: "CONECTIA",
  },
  twitter: {
    card: "summary_large_image",
    title: "CONECTIA - Red Inmobiliaria",
    description: "Conecta oportunidades. Publica con confianza. Vende con resultados.",
    images: ["/logoconectiaoficial.png"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${cormorant.variable} font-sans m-0 p-0`}>
        <LanguageProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            <SWRProvider>
              <AuthProvider>
                <WishlistProvider>
                  <LanguageHtml />
                  <MediaProtection />
                  <DynamicHeader />
                  <PanelShell>{children}</PanelShell>
                  <Footer />
                  <AIAgent />
                  <Toaster position="top-right" richColors />
                </WishlistProvider>
              </AuthProvider>
            </SWRProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
