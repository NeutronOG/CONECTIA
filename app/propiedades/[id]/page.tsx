import { PropertyDetailClient } from "@/components/property-detail-client"
import { use } from "react"
import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const { data: prop } = await supabaseAdmin
      .from('propiedades')
      .select('titulo, descripcion, precio_texto, tipo, ubicacion, imagen, habitaciones, banos, area_texto')
      .eq('id', id)
      .single()

    if (!prop) return {}

    const title = `${prop.titulo} | CONECTIA`
    const parts = [prop.precio_texto, prop.tipo, prop.ubicacion].filter(Boolean)
    if (prop.habitaciones) parts.push(`${prop.habitaciones} rec.`)
    if (prop.banos) parts.push(`${prop.banos} baños`)
    if (prop.area_texto) parts.push(prop.area_texto)
    const description = parts.join(' · ')
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.conectiaselect.com'
    const pageUrl = `${siteUrl}/propiedades/${id}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: pageUrl,
        type: 'website',
        locale: 'es_MX',
        siteName: 'CONECTIA',
        images: prop.imagen ? [{ url: prop.imagen, width: 1200, height: 630, alt: prop.titulo }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: prop.imagen ? [prop.imagen] : undefined,
      },
    }
  } catch {
    return {}
  }
}

export const revalidate = 60

export default function PropertyDetailPage({ params }: PageProps) {
  const { id } = use(params)
  return <PropertyDetailClient propertyData={null} propertyId={id} />
}
