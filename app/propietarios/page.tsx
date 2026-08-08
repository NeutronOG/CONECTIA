"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Upload,
  Shield,
  Crown,
  Star,
  FileText,
  MapPin,
  Camera,
  DollarSign,
  Home,
  User,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  X,
  Plus,
  Eye,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Link from "next/link"
import { OwnerSubmissionsStorage } from "@/lib/owner-submissions-storage"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/i18n"

export default function PropietariosPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [submissionId, setSubmissionId] = useState<string>('')
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false)
  const [neighborhoodQuery, setNeighborhoodQuery] = useState('')
  const [zones, setZones] = useState<string[]>([])
  const [placesSuggestions, setPlacesSuggestions] = useState<string[]>([])
  const [formData, setFormData] = useState({
    titulo: '',
    propertyType: '',
    categoria: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    areaConstruccion: '',
    address: '',
    city: '',
    neighborhood: '',
    postalCode: '',
    askingPrice: '',
    tipoConsulta: '',
    urgency: '',
    description: '',
    gravamen: '',
    amenities: [] as string[],
    actividadesRecreativas: [] as string[],
    caracteristicasEspeciales: [] as string[],
    photos: [] as File[],
    ownerName: '',
    phone: '',
    email: '',
    preferredContact: '',
    promocion: '',
    promocionPersonalizada: '',
    exclusivity: false,
    nonExclusivity: false,
    terms: false,
    privacy: false
  })
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([])
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null)

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  useEffect(() => {
    if (!neighborhoodOpen) return
    if (zones.length > 0) return

    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch('/api/zones', { cache: 'no-store' })
        const json = await res.json()
        const list = Array.isArray(json?.zones) ? json.zones : []
        if (!cancelled) setZones(list)
      } catch {
        if (!cancelled) setZones([])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [neighborhoodOpen, zones.length])

  useEffect(() => {
    if (!neighborhoodOpen) return
    const q = neighborhoodQuery.trim()

    if (q.length < 2) {
      setPlacesSuggestions([])
      return
    }

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(q)}`, {
          cache: 'no-store',
        })
        const json = await res.json()
        const list = Array.isArray(json?.suggestions) ? json.suggestions : []
        setPlacesSuggestions(list)
      } catch {
        setPlacesSuggestions([])
      }
    }, 250)

    return () => clearTimeout(t)
  }, [neighborhoodOpen, neighborhoodQuery])

  const combinedNeighborhoodSuggestions = useMemo(() => {
    const q = neighborhoodQuery.trim().toLowerCase()
    const localFiltered = q
      ? zones.filter((z) => z.toLowerCase().includes(q))
      : zones

    const map = new Map<string, string>()

    for (const z of localFiltered) {
      const key = z.toLowerCase()
      if (!map.has(key)) map.set(key, z)
    }

    for (const z of placesSuggestions) {
      const key = z.toLowerCase()
      if (!map.has(key)) map.set(key, z)
    }

    return Array.from(map.values()).slice(0, 30)
  }, [neighborhoodQuery, placesSuggestions, zones])

  const amenitiesList = [
    'Alberca', 'Gimnasio', 'Área de juegos infantiles', 'Roof garden',
    'Asadores', 'Salón de eventos', 'Coworking', 'Seguridad / vigilancia',
    'Estacionamiento', 'Elevadores', 'Áreas verdes', 'Pet park',
    'Cancha deportiva', 'Guardería', 'Terraza', 'Acceso controlado',
    'Cámaras de vigilancia', 'WIFI en áreas comunes', 'Cafetería'
  ]

  const actividadesRecreativasList = [
    'Clases de yoga', 'Torneos deportivos', 'Talleres', 'Eventos sociales',
    'Actividades infantiles', 'Cine al aire libre', 'Clases de baile',
    'Activaciones comunitarias', 'Manualidades', 'Convivencia'
  ]

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleActividadRecreativaToggle = (actividad: string) => {
    setFormData(prev => ({
      ...prev,
      actividadesRecreativas: prev.actividadesRecreativas.includes(actividad)
        ? prev.actividadesRecreativas.filter(a => a !== actividad)
        : [...prev.actividadesRecreativas, actividad]
    }))
  }

  const handleCaracteristicaToggle = (caracteristica: string) => {
    setFormData(prev => ({
      ...prev,
      caracteristicasEspeciales: prev.caracteristicasEspeciales.includes(caracteristica)
        ? prev.caracteristicasEspeciales.filter(c => c !== caracteristica)
        : [...prev.caracteristicasEspeciales, caracteristica]
    }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedPhotos(prev => {
      const combined = [...prev, ...files as File[]]
      if (combined.length > 30) {
        alert(t('propietarios.maxPhotos'))
        return combined.slice(0, 30)
      }
      return combined
    })
  }

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const calculateEstimateFor = (area: string, neighborhood: string) => {
    const basePrice = parseInt(area) * 45000 // Precio base por m²
    const locationMultiplier = neighborhood.toLowerCase().includes('polanco') ? 1.8 :
                              neighborhood.toLowerCase().includes('santa fe') ? 1.6 :
                              neighborhood.toLowerCase().includes('roma') ? 1.4 : 1.2
    const estimate = basePrice * locationMultiplier
    setPriceEstimate(estimate)
  }

  const calculateEstimate = () => {
    // Simulación de cálculo de precio estimado
    if (formData.area && formData.neighborhood) {
      calculateEstimateFor(formData.area, formData.neighborhood)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Validar campos requeridos
    if (!formData.propertyType || !formData.area || !formData.bedrooms || !formData.bathrooms) {
      toast.error(t('propietarios.errors.propertyRequired'))
      return
    }

    if (!formData.categoria) {
      toast.error('Selecciona una categoría para tu propiedad')
      return
    }

    if (!formData.address || !formData.city || !formData.neighborhood) {
      toast.error(t('propietarios.errors.locationRequired'))
      return
    }

    if (!formData.askingPrice || !formData.description) {
      toast.error(t('propietarios.errors.priceDescriptionRequired'))
      return
    }

    if (!formData.ownerName || !formData.phone || !formData.email) {
      toast.error(t('propietarios.errors.contactRequired'))
      return
    }

    if ((!formData.exclusivity && !formData.nonExclusivity) || !formData.terms || !formData.privacy) {
      toast.error(t('propietarios.errors.termsRequired'))
      return
    }

    setIsSubmitting(true)

    try {
      // Guardar en localStorage
      const submission = OwnerSubmissionsStorage.add({
        titulo: formData.titulo || undefined,
        propertyType: formData.propertyType,
        categoria: formData.categoria,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: formData.area,
        areaConstruccion: formData.areaConstruccion || undefined,
        address: formData.address,
        city: formData.city,
        neighborhood: formData.neighborhood,
        postalCode: formData.postalCode,
        askingPrice: formData.askingPrice,
        tipoConsulta: formData.tipoConsulta || undefined,
        urgency: formData.urgency,
        description: formData.description,
        gravamen: formData.gravamen || undefined,
        amenities: formData.amenities,
        actividadesRecreativas: formData.actividadesRecreativas || undefined,
        caracteristicasEspeciales: formData.caracteristicasEspeciales || undefined,
        photoCount: uploadedPhotos.length,
        ownerName: formData.ownerName,
        phone: formData.phone,
        email: formData.email,
        preferredContact: formData.preferredContact,
        promocion: formData.promocion && formData.promocion !== 'ninguna' ? formData.promocion : undefined,
        promocionPersonalizada: formData.promocion === 'personalizada' ? formData.promocionPersonalizada : undefined,
        exclusivity: formData.exclusivity,
        terms: formData.terms,
        privacy: formData.privacy,
        estimatedValue: priceEstimate || undefined
      })

      setSubmissionId(submission.id)
      setSubmissionSuccess(true)

      toast.success(t('propietarios.success.toast'), {
        description: t('propietarios.success.toastDesc')
      })

      // Simular envío a servidor (aquí podrías hacer un fetch a tu API)
      console.log('Submission saved:', submission)

    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(t('propietarios.errors.submit'), {
        description: t('propietarios.errors.tryAgain')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pantalla de éxito
  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-conectia-secondary transition-colors duration-500 pt-20 flex items-center justify-center px-6">
        <Card className="max-w-2xl w-full border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-[#17313A] dark:text-white" />
            </div>

            <h1 className="font-serif text-3xl font-bold text-[#17313A] dark:text-[#17313A] dark:text-white mb-4">
              {t('propietarios.success.title')}
            </h1>

            <p className="text-lg text-[#4A4F57] dark:text-[#B0ACA6] mb-6">
              {t('propietarios.success.message')}
            </p>

            <div className="bg-conectia-gold/10 border border-conectia-gold/20 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-conectia-gold mr-2" />
                <h3 className="font-semibold text-conectia-gold">{t('propietarios.success.idLabel')}</h3>
              </div>
              <p className="text-2xl font-mono font-bold text-[#17313A] dark:text-white">
                {submissionId}
              </p>
              <p className="text-sm text-[#4A4F57] dark:text-[#B0ACA6] mt-2">
                {t('propietarios.success.idHint')}
              </p>
            </div>

            <div className="space-y-4 text-left mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#17313A] dark:text-white">{t('propietarios.success.benefits.contact.title')}</p>
                  <p className="text-sm text-[#4A4F57] dark:text-[#B0ACA6]">{t('propietarios.success.benefits.contact.desc')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#17313A] dark:text-white">{t('propietarios.success.benefits.valuation.title')}</p>
                  <p className="text-sm text-[#4A4F57] dark:text-[#B0ACA6]">{t('propietarios.success.benefits.valuation.desc')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#17313A] dark:text-white">{t('propietarios.success.benefits.marketing.title')}</p>
                  <p className="text-sm text-[#4A4F57] dark:text-[#B0ACA6]">{t('propietarios.success.benefits.marketing.desc')}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/')}
                className="bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#17313A]"
              >
                {t('propietarios.success.homeButton')}
              </Button>
              <Button
                onClick={() => router.push('/propiedades')}
                variant="outline"
                className="border-conectia-gold text-[#17313A] hover:bg-conectia-gold/10"
              >
                {t('propietarios.success.propertiesButton')}
              </Button>
            </div>

            <p className="text-sm text-[#4A4F57] mt-8">
              {t('propietarios.success.confirmation', { email: formData.email })}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F2EE] dark:bg-[#0F2027] transition-colors duration-500 pt-20">

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Header */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--conectia-arcilla)]/10 border border-[var(--conectia-arcilla)]/30 mb-4">
              <Crown className="h-4 w-4 text-[var(--conectia-arcilla)]" strokeWidth={1.55} />
              <span className="font-serif text-sm font-semibold uppercase tracking-[0.28em] text-[#17313A] dark:text-[#EAE4DD]">{t('common.appName')}</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-black text-[#17313A] dark:text-[#17313A] dark:text-white mb-3">
              {t('propietarios.title')}
            </h1>
            <p className="text-lg text-[#4A4F57] dark:text-[#4A4F57] dark:text-[#B0ACA6] max-w-2xl mx-auto">
              {t('propietarios.subtitle')}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--conectia-arcilla)]">{t('propietarios.progress')}</span>
              <span className="text-sm font-medium text-[var(--conectia-arcilla)]">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-[#17313A]/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--conectia-arcilla)] to-[var(--conectia-arcilla-soft)] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between mt-6">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step < currentStep
                      ? 'bg-[var(--conectia-arcilla)] text-[#0F2027] shadow-lg shadow-[var(--conectia-arcilla)]/30'
                      : step === currentStep
                        ? 'bg-[var(--conectia-arcilla)]/20 text-[var(--conectia-arcilla)] border-2 border-[var(--conectia-arcilla)] shadow-lg shadow-[var(--conectia-arcilla)]/20'
                        : 'bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 text-[#4A4F57] border border-[#17313A]/10 dark:border-[#17313A]/10 dark:border-white/10'
                  }`}>
                    {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    step <= currentStep ? 'text-[var(--conectia-arcilla)]' : 'text-[#4A4F57]'
                  }`}>
                    {step === 1 && t('propietarios.steps.property')}
                    {step === 2 && t('propietarios.steps.location')}
                    {step === 3 && t('propietarios.steps.details')}
                    {step === 4 && t('propietarios.steps.photos')}
                    {step === 5 && t('propietarios.steps.contact')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Carousel */}
        <Carousel
          opts={{ align: 'start', loop: true }}
          className="mb-10"
        >
          <CarouselContent className="-ml-3">
            {[
              { icon: Shield, title: t('propietarios.benefits.exclusivity.title'), desc: t('propietarios.benefits.exclusivity.desc') },
              { icon: TrendingUp, title: t('propietarios.benefits.valuation.title'), desc: t('propietarios.benefits.valuation.desc') },
              { icon: Star, title: t('propietarios.benefits.marketing.title'), desc: t('propietarios.benefits.marketing.desc') },
              { icon: Calendar, title: t('propietarios.benefits.speed.title'), desc: t('propietarios.benefits.speed.desc') },
            ].map((item, i) => (
              <CarouselItem key={i} className="pl-3 basis-3/4 sm:basis-1/2 md:basis-1/4">
                <div className="group relative p-5 text-center h-full rounded-2xl bg-[#17313A]/[0.03] dark:bg-white/[0.03] backdrop-blur-md border border-[#17313A]/10 dark:border-[#17313A]/10 dark:border-white/10 hover:bg-[#17313A]/[0.06] dark:hover:bg-white/[0.06] hover:border-[var(--conectia-arcilla)]/30 transition-all duration-500">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--conectia-arcilla)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-[var(--conectia-arcilla)]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--conectia-arcilla)]/20 transition-colors">
                      <item.icon className="h-5 w-5 text-[var(--conectia-arcilla)]" />
                    </div>
                    <h3 className="font-semibold text-sm text-[#17313A] dark:text-[#17313A] dark:text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-[#4A4F57] dark:text-[#4A4F57] dark:text-[#B0ACA6]">{item.desc}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 sm:-left-4 bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/10 dark:border-[#17313A]/10 dark:border-white/10 text-[#17313A] dark:text-[#17313A] dark:text-white hover:bg-[var(--conectia-arcilla)]/20 hover:border-[var(--conectia-arcilla)]/30" />
          <CarouselNext className="-right-3 sm:-right-4 bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/10 dark:border-[#17313A]/10 dark:border-white/10 text-[#17313A] dark:text-[#17313A] dark:text-white hover:bg-[var(--conectia-arcilla)]/20 hover:border-[var(--conectia-arcilla)]/30" />
        </Carousel>

        {/* Multi-Step Form */}
        <Card className="border-0 shadow-2xl overflow-hidden bg-[#EAE4DD]/50 dark:bg-[#17313A]/50 backdrop-blur-sm border border-[#17313A]/5 dark:border-[#17313A]/5 dark:border-white/5">
          {/* Step 1: Property Information */}
          {currentStep === 1 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-conectia-gold rounded-full flex items-center justify-center mr-4">
                  <Home className="h-6 w-6 text-[#17313A]" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#17313A] dark:text-white">
                    Información de la Propiedad
                  </h2>
                  <p className="text-[#4A4F57] dark:text-[#4A4F57] dark:text-[#B0ACA6]">Cuéntanos sobre tu propiedad exclusiva</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="titulo" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                    Título de la Propiedad *
                  </Label>
                  <Input
                    id="titulo"
                    placeholder="Ej: Casa en coto Lomas del Moral"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({...prev, titulo: e.target.value}))}
                    className="bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property-type" className="text-sm font-medium text-[#17313A] dark:text-[#17313A] dark:text-[#EAE4DD]">
                    Tipo de Propiedad *
                  </Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData(prev => ({...prev, propertyType: value}))}
                  >
                    <SelectTrigger className="bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Casa en condominio">Casa en condominio</SelectItem>
                      <SelectItem value="Residencia">Residencia</SelectItem>
                      <SelectItem value="Departamento">Departamento</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                      <SelectItem value="Loft">Loft</SelectItem>
                      <SelectItem value="Dúplex">Dúplex</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Quinta">Quinta</SelectItem>
                      <SelectItem value="Cabaña">Cabaña</SelectItem>
                      <SelectItem value="Rancho">Rancho</SelectItem>
                      <SelectItem value="Hacienda">Hacienda</SelectItem>
                      <SelectItem value="Finca">Finca</SelectItem>
                      <SelectItem value="Condominio">Condominio</SelectItem>
                      <SelectItem value="Terreno campestre">Terreno campestre</SelectItem>
                      <SelectItem value="Históricos">Históricos</SelectItem>
                      <SelectItem value="Terreno habitacional">Terreno habitacional</SelectItem>
                      <SelectItem value="Terreno comercial">Terreno comercial</SelectItem>
                      <SelectItem value="Terreno industrial">Terreno industrial</SelectItem>
                      <SelectItem value="Terreno agrícola">Terreno agrícola</SelectItem>
                      <SelectItem value="Terreno mixto">Terreno mixto</SelectItem>
                      <SelectItem value="Local comercial">Local comercial</SelectItem>
                      <SelectItem value="Plaza comercial">Plaza comercial</SelectItem>
                      <SelectItem value="Oficina">Oficina</SelectItem>
                      <SelectItem value="Consultorio">Consultorio</SelectItem>
                      <SelectItem value="Edificio comercial">Edificio comercial</SelectItem>
                      <SelectItem value="Edificio mixto">Edificio mixto</SelectItem>
                      <SelectItem value="Hotel">Hotel</SelectItem>
                      <SelectItem value="Hospital">Hospital</SelectItem>
                      <SelectItem value="Clínica">Clínica</SelectItem>
                      <SelectItem value="Centro médico">Centro médico</SelectItem>
                      <SelectItem value="Restaurante">Restaurante</SelectItem>
                      <SelectItem value="Salón de eventos">Salón de eventos</SelectItem>
                      <SelectItem value="Nave industrial">Nave industrial</SelectItem>
                      <SelectItem value="Bodega industrial">Bodega industrial</SelectItem>
                      <SelectItem value="Bodega comercial">Bodega comercial</SelectItem>
                      <SelectItem value="Parque industrial">Parque industrial</SelectItem>
                      <SelectItem value="Patio de maniobras">Patio de maniobras</SelectItem>
                      <SelectItem value="Complejo habitacional">Complejo habitacional</SelectItem>
                      <SelectItem value="Centro de negocios">Centro de negocios</SelectItem>
                      <SelectItem value="Granja">Granja</SelectItem>
                      <SelectItem value="Motel">Motel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-sm font-medium text-[#17313A] dark:text-[#17313A] dark:text-[#EAE4DD]">
                    Categoría *
                  </Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData(prev => ({...prev, categoria: value}))}
                  >
                    <SelectTrigger className="bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20">
                      <SelectValue placeholder="Selecciona la categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="renta">Renta</SelectItem>
                      <SelectItem value="compra">Compra</SelectItem>
                      <SelectItem value="preventa">Preventa</SelectItem>
                      <SelectItem value="exclusivo">Exclusivo</SelectItem>
                      <SelectItem value="especiales">Especiales</SelectItem>
                      <SelectItem value="oferta">Oferta</SelectItem>
                      <SelectItem value="remate">Remate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area" className="text-sm font-medium text-[#17313A] dark:text-[#17313A] dark:text-[#EAE4DD]">
                    Área Total (m²) *
                  </Label>
                  <Input
                    id="area"
                    placeholder="Ej: 450"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({...prev, area: e.target.value}))}
                    onBlur={calculateEstimate}
                    className="bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area-construccion" className="text-sm font-medium text-[#17313A] dark:text-[#17313A] dark:text-[#EAE4DD]">
                    Área de Construcción (m²)
                  </Label>
                  <Input
                    id="area-construccion"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 350 (opcional)"
                    value={formData.areaConstruccion}
                    onChange={(e) => setFormData(prev => ({ ...prev, areaConstruccion: e.target.value }))}
                    className="bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms" className="text-sm font-medium text-[#17313A] dark:text-[#17313A] dark:text-[#EAE4DD]">
                    Habitaciones *
                  </Label>
                  <Select
                    value={formData.bedrooms}
                    onValueChange={(value) => setFormData(prev => ({...prev, bedrooms: value}))}
                  >
                    <SelectTrigger className="bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20">
                      <SelectValue placeholder="Número de habitaciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 habitaciones</SelectItem>
                      <SelectItem value="1">1 habitación</SelectItem>
                      <SelectItem value="2">2 habitaciones</SelectItem>
                      <SelectItem value="3">3 habitaciones</SelectItem>
                      <SelectItem value="4">4 habitaciones</SelectItem>
                      <SelectItem value="5">5 habitaciones</SelectItem>
                      <SelectItem value="6">6+ habitaciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms" className="text-sm font-medium text-[#17313A] dark:text-[#17313A] dark:text-[#EAE4DD]">
                    Baños *
                  </Label>
                  <Select
                    value={formData.bathrooms}
                    onValueChange={(value) => setFormData(prev => ({...prev, bathrooms: value}))}
                  >
                    <SelectTrigger className="bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20">
                      <SelectValue placeholder="Número de baños" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 baños</SelectItem>
                      <SelectItem value="1">1 baño</SelectItem>
                      <SelectItem value="2">2 baños</SelectItem>
                      <SelectItem value="3">3 baños</SelectItem>
                      <SelectItem value="4">4 baños</SelectItem>
                      <SelectItem value="5">5 baños</SelectItem>
                      <SelectItem value="6">6+ baños</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price Estimate */}
              {priceEstimate && (
                <div className="mt-6 p-4 bg-conectia-gold/10 rounded-lg border border-conectia-gold/20">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-conectia-gold mr-2" />
                    <h3 className="font-semibold text-conectia-gold">Valoración Estimada por IA</h3>
                  </div>
                  <p className="text-2xl font-bold text-conectia-gold">
                    {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                      minimumFractionDigits: 0
                    }).format(priceEstimate)}
                  </p>
                  <p className="text-sm text-[#4A4F57] dark:text-[#B0ACA6] mt-1">
                    Estimación basada en ubicación y características similares
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-conectia-gold rounded-full flex items-center justify-center mr-4">
                  <MapPin className="h-6 w-6 text-[#17313A]" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#17313A] dark:text-white">
                    Ubicación Privilegiada
                  </h2>
                  <p className="text-[#4A4F57] dark:text-[#B0ACA6]">La ubicación es clave para maximizar el valor</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                    Dirección Completa *
                  </Label>
                  <Input
                    id="address"
                    placeholder="Calle, número, colonia"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                    className="bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                    Colonia/Zona *
                  </Label>
                  <Popover open={neighborhoodOpen} onOpenChange={(open) => {
                    if (open) {
                      setNeighborhoodQuery(formData.neighborhood || '')
                    }
                    setNeighborhoodOpen(open)
                  }}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={neighborhoodOpen}
                        className="w-full justify-between bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20 font-normal"
                      >
                        {formData.neighborhood ? formData.neighborhood : 'Selecciona la zona'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-[--radix-popover-trigger-width] p-0"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Buscar zona..."
                          value={neighborhoodQuery}
                          onValueChange={setNeighborhoodQuery}
                        />
                        <CommandList>
                          <CommandEmpty>No se encontró la zona.</CommandEmpty>
                          <CommandGroup>
                            {neighborhoodQuery.trim().length > 0 && (
                              <CommandItem
                                key={`__custom__${neighborhoodQuery}`}
                                value={neighborhoodQuery}
                                onSelect={() => {
                                  const custom = neighborhoodQuery.trim()
                                  if (!custom) return
                                  setFormData(prev => ({ ...prev, neighborhood: custom }))
                                  setNeighborhoodOpen(false)
                                  if (formData.area) {
                                    calculateEstimateFor(formData.area, custom)
                                  }
                                }}
                              >
                                Usar "{neighborhoodQuery.trim()}"
                              </CommandItem>
                            )}

                            {combinedNeighborhoodSuggestions.map((zone) => (
                              <CommandItem
                                key={zone}
                                value={zone}
                                onSelect={() => {
                                  setFormData(prev => ({ ...prev, neighborhood: zone }))
                                  setNeighborhoodOpen(false)
                                  if (formData.area) {
                                    calculateEstimateFor(formData.area, zone)
                                  }
                                }}
                              >
                                <CheckCircle
                                  className={`h-4 w-4 mr-2 ${formData.neighborhood === zone ? 'opacity-100' : 'opacity-0'}`}
                                />
                                {zone}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                    Ciudad *
                  </Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData(prev => ({...prev, city: value}))}
                  >
                    <SelectTrigger className="bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20">
                      <SelectValue placeholder="Selecciona la ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ciudad de México">Ciudad de México</SelectItem>
                      <SelectItem value="León, Guanajuato">León, Guanajuato</SelectItem>
                      <SelectItem value="Guadalajara">Guadalajara</SelectItem>
                      <SelectItem value="Monterrey">Monterrey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal-code" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                    Código Postal
                  </Label>
                  <Input
                    id="postal-code"
                    placeholder="Ej: 11560"
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({...prev, postalCode: e.target.value}))}
                    className="bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Details & Pricing */}
          {currentStep === 3 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-conectia-gold rounded-full flex items-center justify-center mr-4">
                  <DollarSign className="h-6 w-6 text-[#17313A]" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#17313A] dark:text-white">
                    Detalles y Precio
                  </h2>
                  <p className="text-[#4A4F57] dark:text-[#B0ACA6]">Características que hacen única tu propiedad</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="asking-price" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                      {formData.tipoConsulta === 'rentar' ? 'Renta mensual (MXN) *' : 'Precio Solicitado (MXN) *'}
                    </Label>
                    <Input
                      id="asking-price"
                      placeholder={formData.tipoConsulta === 'rentar' ? 'Ej: $35,000' : 'Ej: $15,000,000'}
                      value={formData.askingPrice}
                      onChange={(e) => setFormData(prev => ({...prev, askingPrice: e.target.value}))}
                      className="bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                      Tiempo Ideal de Venta
                    </Label>
                    <Select
                      value={formData.urgency}
                      onValueChange={(value) => setFormData(prev => ({...prev, urgency: value}))}
                    >
                      <SelectTrigger className="bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20">
                        <SelectValue placeholder="Selecciona tiempo ideal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Menos de 3 meses</SelectItem>
                        <SelectItem value="medium">3-6 meses</SelectItem>
                        <SelectItem value="flexible">6-12 meses</SelectItem>
                        <SelectItem value="patient">Sin prisa, busco el mejor precio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo-consulta" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                      Tipo de consulta
                    </Label>
                    <Select
                      value={formData.tipoConsulta}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tipoConsulta: value }))}
                    >
                      <SelectTrigger className="bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20">
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vender">Vender mi propiedad</SelectItem>
                        <SelectItem value="rentar">Rentar mi propiedad</SelectItem>
                        <SelectItem value="comprar">Comprar propiedad</SelectItem>
                        <SelectItem value="general">Consulta general</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gravamen" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                      Gravamen
                    </Label>
                    <Select
                      value={formData.gravamen}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gravamen: value }))}
                    >
                      <SelectTrigger className="bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20">
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">Sin gravamen</SelectItem>
                        <SelectItem value="si">Con gravamen</SelectItem>
                        <SelectItem value="en_proceso">En proceso de liberación</SelectItem>
                        <SelectItem value="desconocido">Desconocido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                      Descripción de la Propiedad *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe las características especiales, acabados de lujo, vistas, etc."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      className="bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                      Características Especiales
                    </Label>
                    <p className="text-xs text-[#4A4F57] mb-2">Selecciona las características especiales de tu propiedad</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Tinaco',
                        'Aljibe',
                        'Calentador solar',
                        'Cisterna',
                        'Tanque estacionario',
                        'Sistema de purificación',
                        'Instalación de gas',
                        'Aire acondicionado',
                        'Calefacción',
                        'Ventanas de aluminio',
                        'Loseta de alta calidad',
                        'Mampostería',
                        'Plafón',
                        'Cloreto'
                      ].map((caracteristica) => (
                        <div
                          key={caracteristica}
                          onClick={() => handleCaracteristicaToggle(caracteristica)}
                          className={`p-2 rounded-lg border cursor-pointer transition-all ${
                            formData.caracteristicasEspeciales?.includes(caracteristica)
                              ? 'border-[var(--conectia-arcilla)] bg-[var(--conectia-arcilla)]/10 text-white'
                              : 'border-[#17313A]/10 dark:border-white/10 hover:border-[var(--conectia-arcilla)]/50 hover:bg-[#17313A]/5 dark:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                formData.caracteristicasEspeciales?.includes(caracteristica)
                                  ? 'border-[var(--conectia-arcilla)] bg-[var(--conectia-arcilla)]'
                                  : 'border-white/30'
                              }`}
                            >
                              {formData.caracteristicasEspeciales?.includes(caracteristica) && (
                                <CheckCircle className="h-3 w-3 text-[#0F2027]" />
                              )}
                            </div>
                            <span className="text-sm">{caracteristica}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                      Actividades recreativas (opcional)
                    </Label>
                    <p className="text-xs text-[#4A4F57] mb-2">Selecciona las actividades que ofrece el desarrollo</p>
                    <div className="grid grid-cols-2 gap-2">
                      {actividadesRecreativasList.map((actividad) => (
                        <div
                          key={actividad}
                          onClick={() => handleActividadRecreativaToggle(actividad)}
                          className={`p-2 rounded-lg border cursor-pointer transition-all ${
                            formData.actividadesRecreativas.includes(actividad)
                              ? 'border-[var(--conectia-arcilla)] bg-[var(--conectia-arcilla)]/10 text-white'
                              : 'border-[#17313A]/10 dark:border-white/10 hover:border-[var(--conectia-arcilla)]/50 hover:bg-[#17313A]/5 dark:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                formData.actividadesRecreativas.includes(actividad)
                                  ? 'border-[var(--conectia-arcilla)] bg-[var(--conectia-arcilla)]'
                                  : 'border-white/30'
                              }`}
                            >
                              {formData.actividadesRecreativas.includes(actividad) && (
                                <CheckCircle className="h-3 w-3 text-[#0F2027]" />
                              )}
                            </div>
                            <span className="text-sm">{actividad}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-[#17313A] dark:text-[#EAE4DD]">Amenidades del desarrollo</Label>
                  <p className="text-xs text-[#4A4F57] dark:text-[#B0ACA6]">Selecciona las amenidades disponibles en el desarrollo o condominio</p>
                  <div className="grid grid-cols-2 gap-2">
                {amenitiesList.map((amenity) => (
                  <div
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.amenities.includes(amenity)
                        ? 'border-[var(--conectia-arcilla)] bg-[var(--conectia-arcilla)]/10 text-white'
                        : 'border-[#17313A]/10 dark:border-white/10 hover:border-[var(--conectia-arcilla)]/50 hover:bg-[#17313A]/5 dark:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          formData.amenities.includes(amenity)
                            ? 'border-[var(--conectia-arcilla)] bg-[var(--conectia-arcilla)]'
                            : 'border-white/30'
                        }`}
                      >
                        {formData.amenities.includes(amenity) && (
                          <CheckCircle className="h-3 w-3 text-[#0F2027]" />
                        )}
                      </div>
                      <span className="text-sm">{amenity}</span>
                    </div>
                  </div>
                ))}
                  </div>
                </div>

                {/* Promoción / Bono */}
                <div className="mt-8 p-6 bg-[#EAE4DD]/50 dark:bg-[#17313A]/50 rounded-xl border border-[var(--conectia-arcilla)]/30">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-conectia-gold rounded-full flex items-center justify-center mr-3">
                      <Star className="h-5 w-5 text-[#17313A]" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-[#17313A] dark:text-white">
                        Promoción o Bono Especial
                      </h3>
                      <p className="text-xs text-[#4A4F57]">Agrega un incentivo para atraer más compradores</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                        Selecciona una promoción (opcional)
                      </Label>
                      <Select
                        value={formData.promocion}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, promocion: value, promocionPersonalizada: value === 'personalizada' ? prev.promocionPersonalizada : '' }))}
                      >
                        <SelectTrigger className="bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20">
                          <SelectValue placeholder="Sin promoción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ninguna">Sin promoción</SelectItem>
                          <SelectItem value="escrituras_gratis">Escrituras gratis</SelectItem>
                          <SelectItem value="meses_mantenimiento">3 meses de mantenimiento gratis</SelectItem>
                          <SelectItem value="mudanza_gratis">Mudanza incluida</SelectItem>
                          <SelectItem value="descuento_5">5% de descuento por cierre rápido</SelectItem>
                          <SelectItem value="descuento_10">10% de descuento por pago de contado</SelectItem>
                          <SelectItem value="amueblado">Incluye mobiliario / amueblado</SelectItem>
                          <SelectItem value="remodelacion">Remodelación incluida</SelectItem>
                          <SelectItem value="electrodomesticos">Electrodomésticos incluidos</SelectItem>
                          <SelectItem value="estacionamiento_extra">Estacionamiento extra sin costo</SelectItem>
                          <SelectItem value="bodega_extra">Bodega adicional incluida</SelectItem>
                          <SelectItem value="comision_reducida">Comisión reducida al comprador</SelectItem>
                          <SelectItem value="personalizada">Otra promoción (personalizada)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.promocion === 'personalizada' && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                          Describe tu promoción personalizada
                        </Label>
                        <Input
                          placeholder="Ej: Regalo de pantalla 65'' al cerrar trato"
                          value={formData.promocionPersonalizada}
                          onChange={(e) => setFormData(prev => ({ ...prev, promocionPersonalizada: e.target.value }))}
                          className="bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20"
                        />
                      </div>
                    )}

                    {formData.promocion && formData.promocion !== 'ninguna' && (
                      <div className="p-3 bg-conectia-gold/20 rounded-lg border border-conectia-gold/40">
                        <p className="text-xs text-[#4A4F57] dark:text-[#B0ACA6] mb-1">Vista previa del bono en la publicación:</p>
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-conectia-gold to-yellow-400 text-[#17313A] px-4 py-2 rounded-full text-sm font-bold shadow-md">
                          <Star className="h-4 w-4" />
                          {formData.promocion === 'escrituras_gratis' && 'Escrituras Gratis'}
                          {formData.promocion === 'meses_mantenimiento' && '3 Meses Mantenimiento Gratis'}
                          {formData.promocion === 'mudanza_gratis' && 'Mudanza Incluida'}
                          {formData.promocion === 'descuento_5' && '5% Descuento Cierre Rápido'}
                          {formData.promocion === 'descuento_10' && '10% Descuento Pago Contado'}
                          {formData.promocion === 'amueblado' && 'Incluye Mobiliario'}
                          {formData.promocion === 'remodelacion' && 'Remodelación Incluida'}
                          {formData.promocion === 'electrodomesticos' && 'Electrodomésticos Incluidos'}
                          {formData.promocion === 'estacionamiento_extra' && 'Estacionamiento Extra Gratis'}
                          {formData.promocion === 'bodega_extra' && 'Bodega Adicional Incluida'}
                          {formData.promocion === 'comision_reducida' && 'Comisión Reducida'}
                          {formData.promocion === 'personalizada' && (formData.promocionPersonalizada || 'Promoción Especial')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Photos */}
          {currentStep === 4 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-conectia-gold rounded-full flex items-center justify-center mr-4">
                  <Camera className="h-6 w-6 text-[#17313A]" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#17313A] dark:text-white">
                    Fotografías Profesionales
                  </h2>
                  <p className="text-[#4A4F57] dark:text-[#B0ACA6]">Las imágenes son clave para atraer compradores</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-[var(--conectia-arcilla)]/30 rounded-xl p-8 text-center bg-[var(--conectia-arcilla)]/5">
                  <Camera className="h-16 w-16 text-conectia-gold mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#17313A] dark:text-[#17313A] dark:text-white mb-2">
                    Sube las fotos de tu propiedad
                  </h3>
                  <p className="text-[#4A4F57] dark:text-[#B0ACA6] mb-4">
                    Arrastra y suelta las imágenes o haz clic para seleccionar
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      type="button"
                      className="bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#17313A]"
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Seleccionar Fotos
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-[#4A4F57] mt-2">
                    Máximo 30 fotos • JPG, PNG • Máximo 10MB por foto
                  </p>
                </div>

                {/* Photo Preview */}
                {uploadedPhotos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#17313A] dark:text-[#17313A] dark:text-white mb-4">
                      Fotos subidas ({uploadedPhotos.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-conectia-secondary rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-[#17313A] dark:text-[#17313A] dark:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Tips */}
                <div className="bg-[#17313A]/50 border border-[var(--conectia-arcilla)]/20 rounded-xl p-4">
                  <h4 className="font-semibold text-[var(--conectia-arcilla)] mb-2">
                    💡 Tips para mejores fotos
                  </h4>
                  <ul className="text-sm text-[#4A4F57] dark:text-[#B0ACA6] space-y-1">
                    <li>• Toma fotos con buena iluminación natural</li>
                    <li>• Incluye todas las habitaciones principales</li>
                    <li>• Muestra las amenidades especiales</li>
                    <li>• Captura las vistas panorámicas</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Contact & Agreement */}
          {currentStep === 5 && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-conectia-gold rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-[#17313A]" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#17313A] dark:text-white">
                    Información de Contacto
                  </h2>
                  <p className="text-[#4A4F57] dark:text-[#B0ACA6]">Finaliza tu registro exclusivo</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="owner-name" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                      Nombre Completo *
                    </Label>
                    <Input
                      id="owner-name"
                      placeholder="Tu nombre completo"
                      value={formData.ownerName}
                      onChange={(e) => setFormData(prev => ({...prev, ownerName: e.target.value}))}
                      className="bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                      Teléfono *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+52 477 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                      className="bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                      Correo Electrónico *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      className="bg-[#17313A]/5 dark:bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred-contact" className="text-sm font-medium text-[#17313A] dark:text-[#EAE4DD]">
                      Horario Preferido
                    </Label>
                    <Select
                      value={formData.preferredContact}
                      onValueChange={(value) => setFormData(prev => ({...prev, preferredContact: value}))}
                    >
                      <SelectTrigger className="bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white placeholder:text-[#4A4F57] focus:border-[var(--conectia-arcilla)] focus:ring-[var(--conectia-arcilla)]/20">
                        <SelectValue placeholder="Selecciona horario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Mañana (9:00 - 12:00)</SelectItem>
                        <SelectItem value="afternoon">Tarde (12:00 - 18:00)</SelectItem>
                        <SelectItem value="evening">Noche (18:00 - 21:00)</SelectItem>
                        <SelectItem value="anytime">Cualquier horario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Agreement Section */}
                <div className="bg-gradient-to-br from-conectia-gold/5 to-transparent p-6 rounded-xl border border-conectia-gold/20">
                  <h3 className="font-serif text-xl font-semibold text-[#17313A] dark:text-[#17313A] dark:text-white mb-4">
                    Tipo de Acuerdo
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="exclusivity"
                        checked={formData.exclusivity}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({...prev, exclusivity: checked as boolean, nonExclusivity: false}))
                        }}
                        className="mt-1 border-white/30 data-[state=checked]:bg-[var(--conectia-arcilla)] data-[state=checked]:border-[var(--conectia-arcilla)]"
                      />
                      <Label htmlFor="exclusivity" className="text-sm leading-relaxed">
                        <strong>CON Exclusividad (6 meses)</strong> - Maximiza el valor de tu propiedad con atención personalizada,
                        marketing exclusivo y mejores resultados.
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="nonExclusivity"
                        checked={formData.nonExclusivity}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({...prev, nonExclusivity: checked as boolean, exclusivity: false}))
                        }}
                        className="mt-1 border-white/30 data-[state=checked]:bg-[var(--conectia-arcilla)] data-[state=checked]:border-[var(--conectia-arcilla)]"
                      />
                      <Label htmlFor="nonExclusivity" className="text-sm leading-relaxed">
                        <strong>SIN Exclusividad</strong> - Flexibilidad total para trabajar con múltiples agentes.
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.terms}
                        onCheckedChange={(checked) => setFormData(prev => ({...prev, terms: checked as boolean}))}
                        className="mt-1 border-white/30 data-[state=checked]:bg-[var(--conectia-arcilla)] data-[state=checked]:border-[var(--conectia-arcilla)]"
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed">
                        Acepto los <strong>términos y condiciones</strong> del servicio de CONECTIA,
                        incluyendo la comisión competitiva del 4% sobre el precio final de venta.
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="privacy"
                        checked={formData.privacy}
                        onCheckedChange={(checked) => setFormData(prev => ({...prev, privacy: checked as boolean}))}
                        className="mt-1 border-white/30 data-[state=checked]:bg-[var(--conectia-arcilla)] data-[state=checked]:border-[var(--conectia-arcilla)]"
                      />
                      <Label htmlFor="privacy" className="text-sm leading-relaxed">
                        Autorizo el <strong>tratamiento de mis datos</strong> conforme a la política de privacidad
                        de CONECTIA para fines de comercialización exclusiva de mi propiedad.
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="px-8 py-6 bg-[#EAE4DD]/80 dark:bg-[#0F2027]/80 border-t border-[#17313A]/5 dark:border-white/5">
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="bg-[#17313A]/5 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-[#17313A] dark:text-white hover:border-[var(--conectia-arcilla)] hover:text-[#17313A] dark:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <div className="flex items-center space-x-4">
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#17313A] px-8"
                  >
                    Continuar
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!formData.exclusivity || !formData.terms || !formData.privacy || isSubmitting}
                    className="bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#17313A] px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Registrar Propiedad Exclusiva
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {currentStep === totalSteps && (
              <p className="text-sm text-[#4A4F57] mt-4 text-center">
                🚀 Un especialista de CONECTIA se pondrá en contacto contigo en las próximas 2 horas
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
