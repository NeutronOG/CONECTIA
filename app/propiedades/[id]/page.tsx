import { PropertyDetailClient } from "@/components/property-detail-client"
import { use } from "react"

interface PageProps {
  params: Promise<{ id: string }>
}

// ISR: Revalidar cada 60 segundos para mostrar propiedades nuevas en tiempo real
export const revalidate = 60

export default function PropertyDetailPage({ params }: PageProps) {
  const { id } = use(params)
  // El componente cliente cargará los datos desde Supabase
  return <PropertyDetailClient propertyData={null} propertyId={id} />
}
