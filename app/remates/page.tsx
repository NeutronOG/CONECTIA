'use client'

import { Gavel } from "lucide-react"
import { CategoryPropertyPage } from "@/components/category-property-page"

export default function RematesPage() {
  return <CategoryPropertyPage title="Remates judiciales" description="Explora las propiedades publicadas como remate judicial." badge="Remate judicial" icon={Gavel} categories={['remate']} />
}
