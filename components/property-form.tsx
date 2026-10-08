"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Propiedad } from "@/data/propiedades"
import { Upload, X, Plus, Loader2, Check, Pencil, ShieldCheck } from "lucide-react"
import { uploadImage, uploadMultipleImages } from "@/lib/supabase/storage"
import { getComisionAsesorTexto, usaComisionPorcentual } from "@/lib/commission"
import { validateReservation } from "@/lib/property-reservation"
import { PUBLIC_PROPERTY_CATEGORIES } from "@/lib/property-categories"
import { useLanguage } from "@/lib/i18n"
import { formatPropertyLocation, isVideoUrl } from "@/lib/property-extra-fields"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_VIDEO_BYTES = 50 * 1024 * 1024

const FORM_COPY = {
  es: {
    basicTitle: "Información Básica", basicSubtitle: "Datos principales de la propiedad", title: "Título", location: "Ubicación / Dirección", neighborhood: "Colonia / Zona", city: "Ciudad", propertyType: "Tipo de Propiedad", surfaceUnit: "Unidad de Superficie", bedrooms: "Habitaciones", fullBathrooms: "Baños Completos", halfBathrooms: "Medios Baños", landArea: "Área Terreno (m²)", furnished: "Amueblado", constructionArea: "Área Construcción (m²)", frontage: "Frente (m)", depth: "Fondo (m)", garage: "Cochera (Coches)", status: "Estado", publicCategory: "Categoría pública", creditType: "Tipo de Crédito", age: "Antigüedad", lien: "¿Tiene Gravamen?", description: "Descripción", observations: "Observaciones de la Propiedad", selectOption: "Selecciona una opción", notApplicable: "No aplica", furnishedOption: "Amueblado", semiFurnished: "Semiamueblado", unfurnished: "Sin amueblar", selectAge: "Selecciona antigüedad", newProperty: "Nueva (Estrenar)", characteristics: "Características", characteristicsSubtitle: "Agrega las características destacadas", amenities: "Amenidades", amenitiesSubtitle: "Selecciona las amenidades disponibles en la propiedad", addCharacteristic: "Agregar otra característica...", selectedCharacteristics: "característica(s) seleccionada(s)", selectedAmenities: "amenidad(es) seleccionada(s)", mainImage: "Imagen Principal", mainImageSubtitle: "Sube la imagen principal de la propiedad", gallery: "Galería de imágenes y videos", gallerySubtitle: "Sube hasta 30 fotos o videos adicionales", change: "Cambiar", remove: "Eliminar", bonus: "Bono o Descuento", cancel: "Cancelar", processing: "Procesando...", update: "Actualizar", publish: "Publicar", property: "Propiedad"
  },
  en: {
    basicTitle: "Basic Information", basicSubtitle: "Main property details", title: "Title", location: "Location / Address", neighborhood: "Neighborhood / Area", city: "City", propertyType: "Property Type", surfaceUnit: "Surface Unit", bedrooms: "Bedrooms", fullBathrooms: "Full Bathrooms", halfBathrooms: "Half Bathrooms", landArea: "Land Area (m²)", furnished: "Furnished", constructionArea: "Construction Area (m²)", frontage: "Frontage (m)", depth: "Depth (m)", garage: "Garage (Cars)", status: "Status", publicCategory: "Public Category", creditType: "Credit Type", age: "Property Age", lien: "Does it have a lien?", description: "Description", observations: "Property Notes", selectOption: "Select an option", notApplicable: "Not applicable", furnishedOption: "Furnished", semiFurnished: "Semi-furnished", unfurnished: "Unfurnished", selectAge: "Select property age", newProperty: "New (Never occupied)", characteristics: "Features", characteristicsSubtitle: "Add the property's standout features", amenities: "Amenities", amenitiesSubtitle: "Select the amenities available at the property", addCharacteristic: "Add another feature...", selectedCharacteristics: "feature(s) selected", selectedAmenities: "amenity/amenities selected", mainImage: "Main Image", mainImageSubtitle: "Upload the property's main image", gallery: "Photo & Video Gallery", gallerySubtitle: "Upload up to 30 additional photos or videos", change: "Change", remove: "Remove", bonus: "Bonus or Discount", cancel: "Cancel", processing: "Processing...", update: "Update", publish: "Publish", property: "Property"
  }
} as const

const labelClass = "text-sm font-semibold text-[#17313A] dark:text-white/90"
const inputClass = "bg-white/80 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-white placeholder:text-[#4A4F57]/60 dark:placeholder:text-white/30 focus-visible:ring-[var(--conectia-arcilla)]/50 h-11 rounded-xl"
const textareaClass = "bg-white/80 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-white placeholder:text-[#4A4F57]/60 dark:placeholder:text-white/30 focus-visible:ring-[var(--conectia-arcilla)]/50 rounded-xl"
const selectTriggerClass = "bg-white/80 dark:bg-white/5 border-[#17313A]/20 dark:border-white/20 text-[#17313A] dark:text-white focus:ring-[var(--conectia-arcilla)]/50 h-11 rounded-xl"
const selectContentClass = "bg-white dark:bg-[#17313A] border-[#17313A]/15 dark:border-white/10 text-[#17313A] dark:text-white"
const selectItemClass = "property-select-item text-[#17313A] dark:text-white/90 focus:bg-[#17313A]/10 dark:focus:bg-white/10 focus:text-[#17313A] dark:focus:text-white"
const surfacePattern = String.raw`(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)`

interface PropertyFormProps {
  initialData?: Propiedad
  asesorEmail: string
  asesorNombre: string
  onSubmit: (data: Omit<Propiedad, 'id'>) => void
  onCancel?: () => void
  submitLabel?: string
}

export function PropertyForm({ initialData, asesorEmail, asesorNombre, onSubmit, onCancel, submitLabel }: PropertyFormProps) {
  const { language } = useLanguage()
  const copy = FORM_COPY[language]
  const [formData, setFormData] = useState<Partial<Propiedad>>(initialData || {
    titulo: "",
    ubicacion: "",
    precio: undefined,
    tipo: "Departamento",
    habitaciones: undefined,
    banos: undefined,
    mediosBanos: undefined,
    area: undefined,
    areaConstruccion: undefined,
    cochera: undefined,
    amueblado: undefined,
    descripcion: "",
    caracteristicas: [],
    status: "Disponible",
    categoria: "venta" as any,
    imagen: "",
    galeria: [],
    unidadSuperficie: "m²",
    comisionAsesorPct: ((initialData as Propiedad | undefined)?.comisionAsesorPct) || 4
  })

  const isRenta = formData.categoria === 'renta'

  const [actividadesRecreativasSeleccionadas, setActividadesRecreativasSeleccionadas] = useState<string[]>(
    (() => {
      const desc = String(initialData?.descripcion || '')
      const match = desc.match(/Actividades recreativas:\s*(.*)$/i)
      const actividades = (match?.[1] || '').trim()
      return actividades ? actividades.split(',').map(a => a.trim()).filter(Boolean) : []
    })()
  )

  // Lista de actividades recreativas disponibles
  const actividadesRecreativasDisponibles = [
    "Clases de yoga",
    "Torneos deportivos",
    "Talleres",
    "Eventos sociales",
    "Actividades infantiles",
    "Cine al aire libre",
    "Clases de baile",
    "Activaciones comunitarias",
    "Manualidades",
    "Convivencia"
  ]

  const toggleActividadRecreativa = (actividad: string) => {
    setActividadesRecreativasSeleccionadas(prev =>
      prev.includes(actividad)
        ? prev.filter(a => a !== actividad)
        : [...prev, actividad]
    )
  }

  const [amenidadesSeleccionadas, setAmenidadesSeleccionadas] = useState<string[]>(
    initialData?.amenidades || (initialData?.detalles as any)?.amenidades || []
  )
  const [caracteristicaPersonalizada, setCaracteristicaPersonalizada] = useState("")
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imagen || "")
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initialData?.galeria || [])
  // Los videos no se convierten a base64: se guardan como archivo y se previsualizan con una URL blob:
  const [pendingVideos, setPendingVideos] = useState<Record<string, File>>({})
  const isGalleryVideo = (src: string) => Boolean(pendingVideos[src]) || isVideoUrl(src)
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewConfirmed, setReviewConfirmed] = useState(false)
  const [observaciones, setObservaciones] = useState<string>((initialData as any)?.observaciones || "")
  const [bono, setBono] = useState<string>((initialData as any)?.bono || "")
  const [isDraggingMain, setIsDraggingMain] = useState(false)
  const [isDraggingGallery, setIsDraggingGallery] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const [surfaceInputs, setSurfaceInputs] = useState(() => ({
    area: initialData?.area?.toString() ?? "",
    areaConstruccion: initialData?.areaConstruccion?.toString() ?? "",
    frente: initialData?.frente?.toString() ?? "",
    fondo: initialData?.fondo?.toString() ?? "",
  }))
  const updateSurface = (field: keyof typeof surfaceInputs, value: string) => {
    setSurfaceInputs(previous => ({ ...previous, [field]: value }))
    const parsed = Number(value)
    setFormData(previous => ({ ...previous, [field]: value === "" || !Number.isFinite(parsed) ? undefined : parsed }))
  }
  // Lista de amenidades disponibles (amenidades del desarrollo/condominio)
  const amenidadesDisponibles = [
    "Alberca",
    "Gimnasio",
    "Área de juegos infantiles",
    "Roof garden",
    "Asadores",
    "Salón de eventos",
    "Coworking",
    "Seguridad / vigilancia",
    "Estacionamiento",
    "Elevadores",
    "Áreas verdes",
    "Pet park",
    "Cancha deportiva",
    "Guardería",
    "Terraza",
    "Acceso controlado",
    "Cámaras de vigilancia",
    "WIFI en áreas comunes",
    "Cafetería"
  ]

  // Lista de características (características propias de la propiedad)
  const caracteristicasDisponibles = [
    "Tinaco",
    "Aljibe",
    "Calentador solar",
    "Hidroneumático",
    "Bodega",
    "Cuarto de servicio",
    "Cuarto de lavado",
    "Sala de televisión",
    "Cuarto de máquinas",
    "Penthouse",
    "Sistema de sonido Bose",
    "Spa",
    "Bomba de calor",
    "Celda eléctrica",
    "Panel solar",
    "Mini split",
    "Jardín privado",
    "Balcón",
    "Chimenea",
    "Cocina equipada",
    "Aire acondicionado",
    "Calefacción",
    "Jacuzzi"
  ]

  const toggleAmenidad = (amenidad: string) => {
    setAmenidadesSeleccionadas(prev =>
      prev.includes(amenidad)
        ? prev.filter(a => a !== amenidad)
        : [...prev, amenidad]
    )
  }

  const toggleCaracteristica = (caracteristica: string) => {
    setFormData(prev => {
      const actuales = prev.caracteristicas || []
      return {
        ...prev,
        caracteristicas: actuales.includes(caracteristica)
          ? actuales.filter(c => c !== caracteristica)
          : [...actuales, caracteristica]
      }
    })
  }

  const addCaracteristicaPersonalizada = () => {
    if (caracteristicaPersonalizada.trim()) {
      const nueva = caracteristicaPersonalizada.trim()
      if (!formData.caracteristicas?.includes(nueva)) {
        setFormData(prev => ({
          ...prev,
          caracteristicas: [...(prev.caracteristicas || []), nueva]
        }))
      }
      setCaracteristicaPersonalizada("")
    }
  }

  const removeCaracteristica = (car: string) => {
    setFormData(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas?.filter(c => c !== car)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const reservationError = isRenta
      ? validateReservation(formData.fechaApartado, formData.fechaTerminoContrato, formData.status, formData.categoria)
      : null
    if (reservationError) { alert(reservationError); return }

    // Validar campos requeridos
    if (!formData.titulo?.trim()) {
      alert('Por favor ingresa el título de la propiedad')
      return
    }
    if (!formData.ubicacion?.trim()) {
      alert('Por favor ingresa la ubicación de la propiedad')
      return
    }
    if (!formData.precio || formData.precio <= 0) {
      alert('Por favor ingresa un precio válido')
      return
    }
    if (!formData.area || formData.area <= 0) {
      alert('Por favor ingresa el área del terreno')
      return
    }
    if (formData.habitaciones === undefined || formData.habitaciones === null) {
      alert('Por favor selecciona el número de habitaciones')
      return
    }
    if (formData.banos === undefined || formData.banos === null) {
      alert('Por favor selecciona el número de baños')
      return
    }

    // Validar imagen principal si no hay datos iniciales
    if (!initialData && !imagePreview) {
      alert('Por favor sube una imagen principal')
      return
    }

    // Penúltimo paso: verificar toda la información antes de guardar
    setReviewConfirmed(false)
    setIsReviewing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const publishProperty = async () => {
    setIsUploading(true)
    setUploadProgress("Subiendo imágenes...")

    try {
      // Subir imagen principal a Storage si es base64
      let imagenUrl = imagePreview
      if (imagePreview && imagePreview.startsWith('data:')) {
        setUploadProgress("Subiendo imagen principal...")
        const result = await uploadImage(imagePreview, 'principal')
        if (result.error) {
          alert('Error al subir imagen principal: ' + result.error)
          setIsUploading(false)
          return
        }
        imagenUrl = result.url
      }

      // Subir a Storage las fotos (base64) y videos (blob:) nuevos, conservando el orden
      const pendingCount = galleryPreviews.filter(item => item.startsWith('data:') || pendingVideos[item]).length
      const galeriaUrls: string[] = []
      let uploaded = 0
      for (const item of galleryPreviews) {
        const videoFile: File | undefined = pendingVideos[item]
        if (!videoFile && !item.startsWith('data:')) {
          galeriaUrls.push(item)
          continue
        }
        const source: File | string = videoFile || item
        uploaded += 1
        setUploadProgress(`Subiendo galería (${uploaded}/${pendingCount})...`)
        const result = await uploadImage(source, 'galeria')
        if (!result.url) {
          const kind = pendingVideos[item] ? 'el video' : 'una imagen'
          alert(`No se pudo subir ${kind} de la galería: ${result.error || 'error desconocido'}`)
          return
        }
        galeriaUrls.push(result.url)
      }

      setUploadProgress("Guardando propiedad...")

      const propertyData: Omit<Propiedad, 'id'> = {
        titulo: formData.titulo || "",
        ubicacion: formData.ubicacion || "",
        precio: formData.precio || 0,
        precioTexto: formData.unidadSuperficie === 'Hectáreas'
          ? `$${(formData.precio || 0).toLocaleString('es-MX')}/m²`
          : `$${(formData.precio || 0).toLocaleString('es-MX')}`,
        tipo: formData.tipo || "Departamento",
        habitaciones: formData.habitaciones ?? 0,
        banos: formData.banos ?? 0,
        mediosBanos: formData.mediosBanos ?? 0,
        area: formData.area ?? 0,
        areaConstruccion: formData.areaConstruccion ?? 0,
        cochera: formData.cochera ?? 0,
        amueblado: formData.amueblado,
        areaTexto: `${formData.area ?? 0} m²`,
        imagen: imagenUrl || "/placeholder.svg",
        descripcion: (() => {
          const base = String(formData.descripcion || '').trim()
          const act = actividadesRecreativasSeleccionadas.join(', ')
          if (!act) return base
          if (!base) return `Actividades recreativas: ${act}`
          return `${base}\n\nActividades recreativas: ${act}`
        })(),
        caracteristicas: formData.caracteristicas || [],
        status: formData.status as any,
        categoria: formData.categoria === "compra" ? "venta" : formData.categoria || "venta",
        // El calendario sólo aplica a renta
        fechaApartado: isRenta ? formData.fechaApartado || "" : "",
        fechaTerminoContrato: isRenta ? formData.fechaTerminoContrato || "" : "",
        fechaPublicacion: new Date().toISOString().split('T')[0],
        agente: {
          nombre: asesorNombre,
          especialidad: "Asesor Inmobiliario",
          rating: 4.5,
          ventas: 0,
          telefono: "563-157-2468",
          email: asesorEmail
        },
        detalles: {
          tipoPropiedad: formData.tipo || "Departamento",
          areaTerreno: `${formData.area ?? 0} m²`,
          antiguedad: formData.antiguedad || "Nueva",
          vistas: 0,
          favoritos: 0,
          publicado: new Date().toLocaleDateString('es-MX'),
          amenidades: amenidadesSeleccionadas
        } as any,
        galeria: galeriaUrls,
        tourVirtual: undefined,
        unidadSuperficie: formData.unidadSuperficie || "m²",
        comisionAsesorPct: usaComisionPorcentual(formData) ? formData.comisionAsesorPct || 4 : undefined,
        tipoCredito: (formData as any).tipoCredito || undefined,
        observaciones: observaciones || undefined,
        bono: bono.trim() || undefined,
        frente: formData.frente || undefined,
        fondo: formData.fondo || undefined,
        colonia: formData.colonia?.trim() || undefined,
        ciudad: formData.ciudad?.trim() || undefined,
        antiguedad: formData.antiguedad || undefined,
        gravamen: formData.gravamen || undefined,
        amenidades: amenidadesSeleccionadas,
      } as any

      await onSubmit(propertyData)
    } catch (error) {
      console.error('Error al guardar propiedad:', error)
      alert('Error al guardar la propiedad')
    } finally {
      setIsUploading(false)
      setUploadProgress("")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida')
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar 5MB')
        return
      }

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setFormData({ ...formData, imagen: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processGalleryImages(Array.from(e.target.files))
    e.target.value = ''
  }

  const removeImage = () => {
    setImagePreview("")
    setFormData({ ...formData, imagen: "" })
  }

  const removeGalleryImage = (index: number) => {
    const removed = galleryPreviews[index]
    if (pendingVideos[removed]) {
      URL.revokeObjectURL(removed)
      setPendingVideos(prev => {
        const { [removed]: _, ...rest } = prev
        return rest
      })
    }
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Funciones de Drag & Drop para imagen principal
  const handleDragOver = (e: React.DragEvent, setDragging: (value: boolean) => void) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent, setDragging: (value: boolean) => void) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }

  const handleDropMain = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingMain(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      processMainImage(file)
    }
  }

  const handleDropGallery = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingGallery(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processGalleryImages(Array.from(files))
    }
  }

  const processMainImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setImagePreview(base64String)
      setFormData({ ...formData, imagen: base64String })
    }
    reader.readAsDataURL(file)
  }

  const processGalleryImages = (files: File[]) => {
    if (galleryPreviews.length + files.length > 30) {
      alert('Máximo 30 fotos o videos en la galería')
      return
    }
    files.forEach(file => {
      const isVideo = file.type.startsWith('video/')
      if (!isVideo && !file.type.startsWith('image/')) {
        alert(`${file.name} no es una imagen ni un video válido`)
        return
      }
      if (file.size > (isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) {
        alert(`${file.name} no debe superar ${isVideo ? '50MB' : '5MB'}`)
        return
      }
      if (isVideo) {
        const objectUrl = URL.createObjectURL(file)
        setPendingVideos(prev => ({ ...prev, [objectUrl]: file }))
        setGalleryPreviews(prev => [...prev, objectUrl])
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setGalleryPreviews(prev => [...prev, base64String])
      }
      reader.readAsDataURL(file)
    })
  }

  const amuebladoLabel: Record<string, string> = {
    amueblado: copy.furnishedOption, semiamueblado: copy.semiFurnished, sin_amueblar: copy.unfurnished, no_aplica: copy.notApplicable,
  }
  const gravamenLabel: Record<string, string> = {
    no: 'No tiene gravamen', si: 'Sí tiene gravamen', en_proceso: 'En proceso de liberación', desconocido: 'Desconocido',
  }
  const categoriaLabel = PUBLIC_PROPERTY_CATEGORIES.find(c => c.value === (formData.categoria === 'compra' ? 'venta' : formData.categoria))?.label
  const withUnit = (value: string, unit: string) => value ? `${value} ${unit}` : ''
  const galleryVideoCount = galleryPreviews.filter(isGalleryVideo).length

  const reviewSections: { title: string; rows: [string, string | number | undefined][] }[] = [
    {
      title: copy.basicTitle,
      rows: [
        [copy.title, formData.titulo],
        [copy.propertyType, formData.tipo],
        [copy.publicCategory, categoriaLabel],
        [copy.status, formData.status],
        [formData.unidadSuperficie === 'Hectáreas' ? 'Precio por m² (MXN)' : 'Precio (MXN)', formData.precio ? `$${formData.precio.toLocaleString('es-MX')}` : ''],
        [copy.location, formatPropertyLocation({ ubicacion: formData.ubicacion || '', colonia: formData.colonia, ciudad: formData.ciudad })],
      ],
    },
    {
      title: 'Medidas y distribución',
      rows: [
        [copy.landArea, withUnit(surfaceInputs.area, formData.unidadSuperficie || 'm²')],
        [copy.constructionArea, withUnit(surfaceInputs.areaConstruccion, 'm²')],
        [copy.frontage, withUnit(surfaceInputs.frente, 'm')],
        [copy.depth, withUnit(surfaceInputs.fondo, 'm')],
        [copy.bedrooms, formData.habitaciones],
        [copy.fullBathrooms, formData.banos],
        [copy.halfBathrooms, formData.mediosBanos],
        [copy.garage, formData.cochera],
        [copy.furnished, formData.amueblado ? amuebladoLabel[formData.amueblado] : ''],
      ],
    },
    {
      title: 'Condiciones',
      rows: [
        [copy.creditType, formData.tipoCredito],
        [copy.age, formData.antiguedad],
        [copy.lien, formData.gravamen ? gravamenLabel[formData.gravamen] : ''],
        ...(usaComisionPorcentual(formData) ? [['Comisión', `${formData.comisionAsesorPct || 4}%`] as [string, string]] : []),
        ...(isRenta ? [
          ['Fecha de apartado', formData.fechaApartado],
          ['Término del contrato', formData.fechaTerminoContrato],
        ] as [string, string | undefined][] : []),
        [copy.bonus, bono.trim()],
      ],
    },
  ]

  const reviewLists: [string, string[]][] = [
    [copy.characteristics, formData.caracteristicas || []],
    [copy.amenities, amenidadesSeleccionadas],
    ['Actividades recreativas', actividadesRecreativasSeleccionadas],
  ]

  const reviewCard = "rounded-[24px] border border-[#17313A]/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] p-5 sm:p-6"
  const reviewTitle = "text-base font-bold text-[#17313A] dark:text-white mb-3"
  const emptyValue = <span className="text-[#4A4F57]/60 dark:text-white/35">Sin capturar</span>

  return (
    <>
    {isReviewing && (
      <div className="space-y-5">
        <div className={`${reviewCard} flex items-start gap-3`}>
          <ShieldCheck className="h-6 w-6 shrink-0 text-[var(--conectia-arcilla)]" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-bold text-[#17313A] dark:text-white">Verifica la información</h3>
            <p className="text-sm text-[#4A4F57] dark:text-white/65">Revisa que todo esté correcto antes de {initialData ? 'actualizar' : 'publicar'}. Si algo falta o está mal, regresa a editar.</p>
          </div>
        </div>

        {reviewSections.map(section => (
          <div key={section.title} className={reviewCard}>
            <h4 className={reviewTitle}>{section.title}</h4>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              {section.rows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-[#17313A]/8 dark:border-white/10 py-2.5 text-sm">
                  <dt className="text-[#4A4F57] dark:text-white/60">{label}</dt>
                  <dd className="text-right font-semibold text-[#17313A] dark:text-white break-words min-w-0">
                    {value === undefined || value === null || value === '' ? emptyValue : value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}

        <div className={reviewCard}>
          {reviewLists.map(([title, items]) => (
            <div key={title} className="mb-4 last:mb-0">
              <h4 className={reviewTitle}>{title} <span className="font-normal text-sm text-[#4A4F57] dark:text-white/50">({items.length})</span></h4>
              {items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {items.map(item => (
                    <span key={item} className="inline-flex items-center gap-1 rounded-full bg-[#17313A] px-3 py-1 text-xs font-semibold text-white">
                      <Check className="h-3 w-3" aria-hidden="true" /> {item}
                    </span>
                  ))}
                </div>
              ) : <p className="text-sm">{emptyValue}</p>}
            </div>
          ))}
        </div>

        <div className={reviewCard}>
          <h4 className={reviewTitle}>{copy.description}</h4>
          <p className="whitespace-pre-line text-sm text-[#17313A] dark:text-white/85">{formData.descripcion || emptyValue}</p>
          <h4 className={`${reviewTitle} mt-5`}>{copy.observations}</h4>
          <p className="whitespace-pre-line text-sm text-[#17313A] dark:text-white/85">{observaciones || emptyValue}</p>
        </div>

        <div className={reviewCard}>
          <h4 className={reviewTitle}>
            Fotos y videos <span className="font-normal text-sm text-[#4A4F57] dark:text-white/50">
              (portada + {galleryPreviews.length - galleryVideoCount} foto(s) y {galleryVideoCount} video(s) en galería)
            </span>
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {imagePreview && (
              <div className="relative aspect-square overflow-hidden rounded-lg ring-2 ring-[var(--conectia-arcilla)]">
                <img src={imagePreview} alt="Portada" className="h-full w-full object-cover" />
                <span className="absolute bottom-1 left-1 rounded bg-[#17313A] px-1.5 py-0.5 text-[10px] font-bold text-white">Portada</span>
              </div>
            )}
            {galleryPreviews.map((preview, index) => (
              <div key={preview.slice(0, 64) + index} className="aspect-square overflow-hidden rounded-lg bg-black">
                {isGalleryVideo(preview)
                  ? <video src={preview} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  : <img src={preview} alt={`Galería ${index + 1}`} className="h-full w-full object-cover" />}
              </div>
            ))}
          </div>
        </div>

        <label className={`${reviewCard} flex cursor-pointer items-start gap-3 ${reviewConfirmed ? 'ring-2 ring-[var(--conectia-arcilla)]' : ''}`}>
          <input
            type="checkbox"
            checked={reviewConfirmed}
            onChange={(e) => setReviewConfirmed(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#17313A]"
          />
          <span className="text-sm text-[#17313A] dark:text-white">
            <strong>✓ Verifiqué que toda la información es correcta.</strong> Al {initialData ? 'actualizar' : 'publicar'} confirmo que la información es veraz, que cuento con autorización y que acepto la{' '}
            <Link href="/legal/publicacion-inmuebles" target="_blank" className="font-bold text-[var(--conectia-arcilla)] hover:underline">Política de Publicación de Inmuebles</Link>.
          </span>
        </label>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => setIsReviewing(false)} disabled={isUploading}>
            <Pencil className="h-4 w-4 mr-2" /> Editar información
          </Button>
          <Button
            type="button"
            onClick={publishProperty}
            disabled={!reviewConfirmed || isUploading}
            className="bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#0F2027] font-semibold sm:min-w-[220px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploadProgress || copy.processing}
              </>
            ) : (
              <><Check className="h-4 w-4 mr-2" />{submitLabel || `${initialData ? copy.update : copy.publish} ${copy.property}`}</>
            )}
          </Button>
        </div>
      </div>
    )}
    <form onSubmit={handleSubmit} className={`property-form space-y-6 ${isReviewing ? 'hidden' : ''}`}>
      <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white">{copy.basicTitle}</h3>
          <p className="text-xs text-[#B0ACA6]">{copy.basicSubtitle}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo" className={labelClass}>{copy.title} *</Label>
              <Input
                id="titulo"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Penthouse Polanco IV"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ubicacion" className={labelClass}>{copy.location} *</Label>
              <Input
                id="ubicacion"
                required
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                placeholder="Ej: Av. Insurgentes 1234, Col. Del Valle"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="colonia" className={labelClass}>{copy.neighborhood} *</Label>
              <Input
                id="colonia"
                value={(formData as any).colonia || ''}
                onChange={(e) => setFormData({ ...formData, colonia: e.target.value } as any)}
                placeholder="Ej: Lomas del Moral"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciudad" className={labelClass}>{copy.city} *</Label>
              <Input
                id="ciudad"
                value={(formData as any).ciudad || ''}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value } as any)}
                placeholder="Ej: León, Guanajuato"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio" className={labelClass}>
                {formData.unidadSuperficie === 'Hectáreas' ? 'Precio por m² (MXN) *' : 'Precio (MXN) *'}
              </Label>
              <Input
                id="precio"
                type="text"
                required
                value={formData.precio ? formData.precio.toLocaleString('es-MX') : ''}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, '')
                  const numValue = parseInt(rawValue) || 0
                  setFormData({ ...formData, precio: numValue })
                }}
                placeholder={formData.unidadSuperficie === 'Hectáreas' ? '150' : '18,500,000'}
                className={inputClass}
              />

            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className={labelClass}>{copy.propertyType} *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({
                  ...formData,
                  tipo: value,
                  ...(value.startsWith('Terreno') ? { amueblado: 'no_aplica', antiguedad: 'No aplica' } : {}),
                } as Partial<Propiedad>)}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="Casa" className={selectItemClass}>Casa</SelectItem>
                  <SelectItem value="Casa en condominio" className={selectItemClass}>Casa en condominio</SelectItem>
                  <SelectItem value="Residencia" className={selectItemClass}>Residencia</SelectItem>
                  <SelectItem value="Departamento" className={selectItemClass}>Departamento</SelectItem>
                  <SelectItem value="Penthouse" className={selectItemClass}>Penthouse</SelectItem>
                  <SelectItem value="Loft" className={selectItemClass}>Loft</SelectItem>
                  <SelectItem value="Dúplex" className={selectItemClass}>Dúplex</SelectItem>
                  <SelectItem value="Villa" className={selectItemClass}>Villa</SelectItem>
                  <SelectItem value="Quinta" className={selectItemClass}>Quinta</SelectItem>
                  <SelectItem value="Cabaña" className={selectItemClass}>Cabaña</SelectItem>
                  <SelectItem value="Rancho" className={selectItemClass}>Rancho</SelectItem>
                  <SelectItem value="Hacienda" className={selectItemClass}>Hacienda</SelectItem>
                  <SelectItem value="Finca" className={selectItemClass}>Finca</SelectItem>
                  <SelectItem value="Condominio" className={selectItemClass}>Condominio</SelectItem>
                  <SelectItem value="Terreno campestre" className={selectItemClass}>Terreno campestre</SelectItem>
                  <SelectItem value="Históricos" className={selectItemClass}>Históricos</SelectItem>
                  <SelectItem value="Terreno habitacional" className={selectItemClass}>Terreno habitacional</SelectItem>
                  <SelectItem value="Terreno comercial" className={selectItemClass}>Terreno comercial</SelectItem>
                  <SelectItem value="Terreno industrial" className={selectItemClass}>Terreno industrial</SelectItem>
                  <SelectItem value="Terreno agrícola" className={selectItemClass}>Terreno agrícola</SelectItem>
                  <SelectItem value="Terreno mixto" className={selectItemClass}>Terreno mixto</SelectItem>
                  <SelectItem value="Local comercial" className={selectItemClass}>Local comercial</SelectItem>
                  <SelectItem value="Plaza comercial" className={selectItemClass}>Plaza comercial</SelectItem>
                  <SelectItem value="Oficina" className={selectItemClass}>Oficina</SelectItem>
                  <SelectItem value="Consultorio" className={selectItemClass}>Consultorio</SelectItem>
                  <SelectItem value="Edificio comercial" className={selectItemClass}>Edificio comercial</SelectItem>
                  <SelectItem value="Edificio mixto" className={selectItemClass}>Edificio mixto</SelectItem>
                  <SelectItem value="Hotel" className={selectItemClass}>Hotel</SelectItem>
                  <SelectItem value="Hospital" className={selectItemClass}>Hospital</SelectItem>
                  <SelectItem value="Clínica" className={selectItemClass}>Clínica</SelectItem>
                  <SelectItem value="Centro médico" className={selectItemClass}>Centro médico</SelectItem>
                  <SelectItem value="Restaurante" className={selectItemClass}>Restaurante</SelectItem>
                  <SelectItem value="Salón de eventos" className={selectItemClass}>Salón de eventos</SelectItem>
                  <SelectItem value="Nave industrial" className={selectItemClass}>Nave industrial</SelectItem>
                  <SelectItem value="Bodega industrial" className={selectItemClass}>Bodega industrial</SelectItem>
                  <SelectItem value="Bodega comercial" className={selectItemClass}>Bodega comercial</SelectItem>
                  <SelectItem value="Parque industrial" className={selectItemClass}>Parque industrial</SelectItem>
                  <SelectItem value="Patio de maniobras" className={selectItemClass}>Patio de maniobras</SelectItem>
                  <SelectItem value="Complejo habitacional" className={selectItemClass}>Complejo habitacional</SelectItem>
                  <SelectItem value="Centro de negocios" className={selectItemClass}>Centro de negocios</SelectItem>
                  <SelectItem value="Granja" className={selectItemClass}>Granja</SelectItem>
                  <SelectItem value="Motel" className={selectItemClass}>Motel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidadSuperficie" className={labelClass}>{copy.surfaceUnit}</Label>
              <Select
                value={formData.unidadSuperficie || 'm²'}
                onValueChange={(value) => setFormData({ ...formData, unidadSuperficie: value as 'm²' | 'Hectáreas' })}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Selecciona unidad" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="m²" className={selectItemClass}>m²</SelectItem>
                  <SelectItem value="Hectáreas" className={selectItemClass}>Hectáreas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>{copy.bedrooms} *</Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    aria-pressed={formData.habitaciones === num}
                    onClick={() => setFormData({ ...formData, habitaciones: num })}
                    className={`
                      h-10 w-10 rounded-lg border flex items-center justify-center transition-all
                      ${formData.habitaciones === num
                        ? 'bg-[#17313A] text-white border-[#17313A] font-bold shadow-md scale-105'
                        : 'bg-white text-[#17313A] border-[#17313A]/20 hover:border-[#17313A]/40 hover:bg-[#17313A]/5'
                      }
                    `}
                  >
                    {num}{num === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>{copy.fullBathrooms} *</Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    aria-pressed={formData.banos === num}
                    onClick={() => setFormData({ ...formData, banos: num })}
                    className={`
                      h-10 w-10 rounded-lg border flex items-center justify-center transition-all
                      ${formData.banos === num
                        ? 'bg-[#17313A] text-white border-[#17313A] font-bold shadow-md scale-105'
                        : 'bg-white text-[#17313A] border-[#17313A]/20 hover:border-[#17313A]/40 hover:bg-[#17313A]/5'
                      }
                    `}
                  >
                    {num}{num === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>{copy.halfBathrooms}</Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    aria-pressed={formData.mediosBanos === num}
                    onClick={() => setFormData({ ...formData, mediosBanos: num })}
                    className={`
                      h-10 w-10 rounded-lg border flex items-center justify-center transition-all
                      ${formData.mediosBanos === num
                        ? 'bg-[#17313A] text-white border-[#17313A] font-bold shadow-md scale-105'
                        : 'bg-white text-[#17313A] border-[#17313A]/20 hover:border-[#17313A]/40 hover:bg-[#17313A]/5'
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className={labelClass}>{copy.landArea} *</Label>
              <Input
                id="area"
                type="text"
                inputMode="decimal"
                pattern={surfacePattern}
                required
                value={surfaceInputs.area}
                onChange={(e) => updateSurface('area', e.target.value)}
                placeholder="450"
                className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amueblado" className={labelClass}>{copy.furnished}</Label>
              <Select
                value={formData.amueblado || ''}
                onValueChange={(value) => setFormData({ ...formData, amueblado: value as any })}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder={copy.selectOption} />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="amueblado" className={selectItemClass}>{copy.furnishedOption}</SelectItem>
                  <SelectItem value="semiamueblado" className={selectItemClass}>{copy.semiFurnished}</SelectItem>
                  <SelectItem value="sin_amueblar" className={selectItemClass}>{copy.unfurnished}</SelectItem>
                  <SelectItem value="no_aplica" className={selectItemClass}>{copy.notApplicable}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaConstruccion" className={labelClass}>{copy.constructionArea}</Label>
              <Input
                id="areaConstruccion"
                type="text"
                inputMode="decimal"
                pattern={surfacePattern}
                value={surfaceInputs.areaConstruccion}
                onChange={(e) => updateSurface('areaConstruccion', e.target.value)}
                placeholder="350"
                className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="frente" className={labelClass}>{copy.frontage}</Label>
                <Input
                  id="frente"
                  type="text"
                  inputMode="decimal"
                  pattern={surfacePattern}
                  value={surfaceInputs.frente}
                  onChange={(e) => updateSurface('frente', e.target.value)}
                  placeholder="Ej: 12"
                  className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fondo" className={labelClass}>{copy.depth}</Label>
                <Input
                  id="fondo"
                  type="text"
                  inputMode="decimal"
                  pattern={surfacePattern}
                  value={surfaceInputs.fondo}
                  onChange={(e) => updateSurface('fondo', e.target.value)}
                  placeholder="Ej: 20"
                  className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>{copy.garage}</Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    aria-pressed={formData.cochera === num}
                    onClick={() => setFormData({ ...formData, cochera: num })}
                    className={`
                      h-10 w-10 rounded-lg border flex items-center justify-center transition-all
                      ${formData.cochera === num
                        ? 'bg-[#17313A] text-white border-[#17313A] font-bold shadow-md scale-105'
                        : 'bg-white text-[#17313A] border-[#17313A]/20 hover:border-[#17313A]/40 hover:bg-[#17313A]/5'
                      }
                    `}
                  >
                    {num}{num === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className={labelClass}>{copy.status} *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="Disponible" className={selectItemClass}>Disponible</SelectItem>
                  <SelectItem value="Reservada" className={selectItemClass}>Reservada</SelectItem>
                  <SelectItem value="Exclusiva" className={selectItemClass}>Exclusiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria" className={labelClass}>{copy.publicCategory} *</Label>
              <Select
                value={formData.categoria === "compra" ? "venta" : formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value as any })}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Selecciona dónde se mostrará" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  {PUBLIC_PROPERTY_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value} className={selectItemClass}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {usaComisionPorcentual(formData) && (
              <div className="space-y-2">
                <Label className={labelClass}>Tu comisión total (1% - 6%) *</Label>
                <Select
                  value={String(formData.comisionAsesorPct || 4)}
                  onValueChange={(value) => setFormData({ ...formData, comisionAsesorPct: Number(value) })}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Selecciona el porcentaje" />
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {[1, 2, 3, 4, 5, 6].map((pct) => (
                      <SelectItem key={pct} value={String(pct)} className={selectItemClass}>
                        {pct}% total — tú recibes {pct / 2}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.precio && formData.precio > 0 && (
                  <div className="p-3 rounded-xl bg-[var(--conectia-arcilla)]/10 border border-[var(--conectia-arcilla)]/20 space-y-1">
                    <p className="text-xs text-[var(--conectia-arcilla)] font-medium">
                      Tu comisión: {getComisionAsesorTexto(formData)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {isRenta && (
            <div className="space-y-3 md:col-span-2 rounded-xl border border-[var(--conectia-arcilla)]/30 p-4">
              <h3 className={labelClass}>Calendario de apartado y contrato</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fechaApartado" className={labelClass}>Fecha de apartado</Label>
                  <Input id="fechaApartado" type="date" className={inputClass} value={formData.fechaApartado || ''}
                    required={formData.status === 'Reservada' || Boolean(formData.fechaTerminoContrato)}
                    onChange={(e) => setFormData({ ...formData, fechaApartado: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaTerminoContrato" className={labelClass}>Fecha de término del contrato</Label>
                  <Input id="fechaTerminoContrato" type="date" className={inputClass} value={formData.fechaTerminoContrato || ''}
                    min={formData.fechaApartado || undefined} required={formData.status === 'Reservada' || Boolean(formData.fechaApartado)}
                    onChange={(e) => setFormData({ ...formData, fechaTerminoContrato: e.target.value })} />
                </div>
              </div>
              <p className="text-sm text-[#4A4F57] dark:text-white/60">Verás avisos en Mis propiedades desde 7 días antes del término, el día del vencimiento y cuando haya vencido.</p>
            </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tipoCredito" className={labelClass}>{copy.creditType}</Label>
              <Select
                value={(formData as any).tipoCredito || ''}
                onValueChange={(value) => setFormData({ ...formData, tipoCredito: value } as any)}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Selecciona tipo de crédito" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="Contado" className={selectItemClass}>Contado</SelectItem>
                  <SelectItem value="Crédito Bancario" className={selectItemClass}>Crédito Bancario</SelectItem>
                  <SelectItem value="Infonavit" className={selectItemClass}>Infonavit</SelectItem>
                  <SelectItem value="Fovissste" className={selectItemClass}>Fovissste</SelectItem>
                  <SelectItem value="Cofinavit" className={selectItemClass}>Cofinavit</SelectItem>
                  <SelectItem value="Crédito Puente" className={selectItemClass}>Crédito Puente</SelectItem>
                  <SelectItem value="Cualquier Crédito" className={selectItemClass}>Cualquier Crédito</SelectItem>
                  <SelectItem value="Otro" className={selectItemClass}>Otro</SelectItem>
                  <SelectItem value="No aplica" className={selectItemClass}>No aplica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="antiguedad" className={labelClass}>{copy.age}</Label>
              <Select
                value={(formData as any).antiguedad || ''}
                onValueChange={(value) => setFormData({ ...formData, antiguedad: value } as any)}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder={copy.selectAge} />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="Nueva" className={selectItemClass}>{copy.newProperty}</SelectItem>
                  <SelectItem value="1-5 años" className={selectItemClass}>1-5 años</SelectItem>
                  <SelectItem value="6-10 años" className={selectItemClass}>6-10 años</SelectItem>
                  <SelectItem value="11-20 años" className={selectItemClass}>11-20 años</SelectItem>
                  <SelectItem value="21-30 años" className={selectItemClass}>21-30 años</SelectItem>
                  <SelectItem value="Más de 30 años" className={selectItemClass}>Más de 30 años</SelectItem>
                  <SelectItem value="No aplica" className={selectItemClass}>{copy.notApplicable}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gravamen" className={labelClass}>{copy.lien}</Label>
              <Select
                value={(formData as any).gravamen || ''}
                onValueChange={(value) => setFormData({ ...formData, gravamen: value } as any)}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder={copy.selectOption} />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="no" className={selectItemClass}>No tiene gravamen</SelectItem>
                  <SelectItem value="si" className={selectItemClass}>Sí tiene gravamen</SelectItem>
                  <SelectItem value="en_proceso" className={selectItemClass}>En proceso de liberación</SelectItem>
                  <SelectItem value="desconocido" className={selectItemClass}>Desconocido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion" className={labelClass}>{copy.description} *</Label>
            <Textarea
              id="descripcion"
              required
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describe la propiedad (ej: Hermosa casa con jardín y alberca)"
              rows={4}
              className={textareaClass}
            />
          </div>

          <div className="space-y-2">
            <Label className={labelClass}>Actividades recreativas (opcional)</Label>
            <p className="text-xs text-gray-500 mb-2">Selecciona las actividades que ofrece el desarrollo</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {actividadesRecreativasDisponibles.map((actividad) => {
                const isSelected = actividadesRecreativasSeleccionadas.includes(actividad)
                return (
                  <button
                    key={actividad}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleActividadRecreativa(actividad)}
                    style={isSelected ? { backgroundColor: '#17313A', borderColor: '#17313A', color: '#FFFFFF' } : undefined}
                    className={isSelected
                      ? 'flex min-h-11 items-center gap-2 rounded-lg border p-2 text-left text-sm font-semibold text-white shadow-md ring-2 ring-[#C78F7B]/50'
                      : 'min-h-11 rounded-lg border border-[#17313A]/20 bg-white p-2 text-left text-sm font-medium text-[#17313A] transition-all hover:border-[#17313A]/40 hover:bg-[#17313A]/5'
                    }
                  >
                    {isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                    <span>{actividad}</span>
                  </button>
                )
              })}
            </div>
            {actividadesRecreativasSeleccionadas.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {actividadesRecreativasSeleccionadas.length} actividad(es) seleccionada(s)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones" className={labelClass}>{copy.observations}</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Agrega observaciones adicionales sobre la propiedad (estado, reparaciones necesarias, etc.)..."
              rows={3}
              className={textareaClass}
            />
          </div>
        </div>
      </div>

      <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white">{copy.characteristics}</h3>
          <p className="text-xs text-[#B0ACA6]">{copy.characteristicsSubtitle}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {caracteristicasDisponibles.map((car) => (
              <button
                key={car}
                type="button"
                aria-pressed={formData.caracteristicas?.includes(car) ?? false}
                onClick={() => toggleCaracteristica(car)}
                className={`
                  p-3 rounded-lg border text-sm font-medium transition-all text-left
                  ${formData.caracteristicas?.includes(car)
                    ? 'bg-[#17313A] !text-white border-[#17313A] shadow-lg ring-2 ring-[#C78F7B]/45 dark:bg-[#C78F7B] dark:!text-[#0F2027] dark:border-[#C78F7B]'
                    : 'bg-white text-[#17313A] border-[#17313A]/20 hover:border-[#17313A]/40 hover:bg-[#17313A]/5'
                  }
                `}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{car}</span>
                  {formData.caracteristicas?.includes(car) && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Input
              value={caracteristicaPersonalizada}
              onChange={(e) => setCaracteristicaPersonalizada(e.target.value)}
              placeholder={copy.addCharacteristic}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCaracteristicaPersonalizada())}
              className={inputClass}
            />
            <Button type="button" onClick={addCaracteristicaPersonalizada}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.caracteristicas && formData.caracteristicas.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                {formData.caracteristicas.length} {copy.selectedCharacteristics}
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.caracteristicas.filter(c => !caracteristicasDisponibles.includes(c)).map((car) => (
                  <div
                    key={car}
                    className="flex items-center gap-2 bg-[var(--conectia-arcilla)]/10 text-[var(--conectia-arcilla)] px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{car}</span>
                    <button
                      type="button"
                      onClick={() => removeCaracteristica(car)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white">{copy.amenities}</h3>
          <p className="text-xs text-[#B0ACA6]">{copy.amenitiesSubtitle}</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amenidadesDisponibles.map((amenidad) => (
              <button
                key={amenidad}
                type="button"
                aria-pressed={amenidadesSeleccionadas.includes(amenidad)}
                onClick={() => toggleAmenidad(amenidad)}
                className={`
                  p-3 rounded-lg border text-sm font-medium transition-all text-left
                  ${amenidadesSeleccionadas.includes(amenidad)
                    ? 'bg-[#17313A] !text-white border-[#17313A] shadow-lg ring-2 ring-[#C78F7B]/45 dark:bg-[#C78F7B] dark:!text-[#0F2027] dark:border-[#C78F7B]'
                    : 'bg-white text-[#17313A] border-[#17313A]/20 hover:border-[#17313A]/40 hover:bg-[#17313A]/5'
                  }
                `}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{amenidad}</span>
                  {amenidadesSeleccionadas.includes(amenidad) && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                </span>
              </button>
            ))}
          </div>
          {amenidadesSeleccionadas.length > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              {amenidadesSeleccionadas.length} {copy.selectedAmenities}
            </p>
          )}
        </div>
      </div>

      <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white">{copy.mainImage}</h3>
          <p className="text-xs text-[#B0ACA6]">{copy.mainImageSubtitle}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imagen" className={labelClass}>{copy.mainImage} *</Label>

            {!imagePreview ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDraggingMain
                    ? 'border-[var(--conectia-arcilla)] bg-[var(--conectia-arcilla)]/20 scale-[1.02]'
                    : 'border-[var(--conectia-arcilla)]/30 bg-[var(--conectia-arcilla)]/5 hover:bg-[var(--conectia-arcilla)]/10'
                }`}
                onDragOver={(e) => handleDragOver(e, setIsDraggingMain)}
                onDragLeave={(e) => handleDragLeave(e, setIsDraggingMain)}
                onDrop={handleDropMain}
              >
                <input
                  type="file"
                  id="imagen"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="imagen" className="cursor-pointer">
                  <Upload className={`h-12 w-12 mx-auto mb-3 transition-transform ${isDraggingMain ? 'text-[var(--conectia-arcilla)] scale-125' : 'text-[var(--conectia-arcilla)]'}`} />
                  <p className="text-sm font-medium text-white mb-1">
                    {isDraggingMain ? '¡Suelta la imagen aquí!' : 'Arrastra una imagen o haz click'}
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG o WEBP (máx. 5MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-[var(--conectia-arcilla)]/20 group">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#0F2027]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label htmlFor="imagen" className="cursor-pointer">
                    <input
                      type="file"
                      id="imagen"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button type="button" size="sm" className="bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#0F2027]" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {copy.change}
                      </span>
                    </Button>
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={removeImage}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {copy.remove}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white">{copy.gallery}</h3>
          <p className="text-xs text-[#B0ACA6]">{copy.gallerySubtitle}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="galeria" className={labelClass}>{copy.gallery}</Label>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDraggingGallery
                  ? 'border-[var(--conectia-arcilla)] bg-[var(--conectia-arcilla)]/20 scale-[1.02]'
                  : 'border-[var(--conectia-arcilla)]/30 bg-[var(--conectia-arcilla)]/5 hover:bg-[var(--conectia-arcilla)]/10'
              }`}
              onDragOver={(e) => handleDragOver(e, setIsDraggingGallery)}
              onDragLeave={(e) => handleDragLeave(e, setIsDraggingGallery)}
              onDrop={handleDropGallery}
            >
              <input
                type="file"
                id="galeria"
                accept="image/*,video/mp4,video/quicktime,video/webm"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
              <label htmlFor="galeria" className="cursor-pointer">
                <div className="flex justify-center gap-2 mb-3">
                  <Upload className={`h-12 w-12 transition-transform ${isDraggingGallery ? 'text-[var(--conectia-arcilla)] scale-125' : 'text-[var(--conectia-arcilla)]'}`} />
                  <Plus className={`h-6 w-6 text-[var(--conectia-arcilla)] mt-6 -ml-4 transition-transform ${isDraggingGallery ? 'scale-125' : ''}`} />
                </div>
                <p className="text-sm font-medium text-white mb-1">
                  {isDraggingGallery ? '¡Suelta los archivos aquí!' : 'Arrastra fotos o videos, o haz click'}
                </p>
                <p className="text-xs text-gray-500">
                  Fotos JPG, PNG o WEBP (máx. 5MB) • Videos MP4, MOV o WEBM (máx. 50MB) • Hasta 30 archivos
                </p>
                {galleryPreviews.length > 0 && (
                  <p className="text-xs text-[var(--conectia-arcilla)] mt-2 font-medium">
                    {galleryPreviews.length}/30 archivos agregados
                  </p>
                )}
              </label>
            </div>

            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--conectia-arcilla)]/20 group">
                    {isGalleryVideo(preview) ? (
                      <video src={preview} className="w-full h-full object-cover bg-black" muted playsInline controls preload="metadata" />
                    ) : (
                      <img
                        src={preview}
                        alt={`Galería ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        size="sm"
                        aria-label="Eliminar de la galería"
                        onClick={() => removeGalleryImage(index)}
                        className="bg-red-500 hover:bg-red-600 text-white h-8 w-8 p-0 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bono / Descuento */}
      <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white">{copy.bonus}</h3>
          <p className="text-xs text-[#B0ACA6]">Opcional — se mostrará como un listón en la esquina de la publicación</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bono" className={labelClass}>Texto del bono</Label>
            <Input
              id="bono"
              value={bono}
              onChange={(e) => setBono(e.target.value)}
              placeholder="Ej: BONO DE $500,000 PESOS"
              maxLength={60}
              className={inputClass}
            />
            <p className="text-xs text-gray-500">Máximo 60 caracteres. Déjalo vacío si no hay bono.</p>
          </div>
          {bono.trim() && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Vista previa del listón:</p>
              <div className="relative inline-block">
                <div className="overflow-hidden w-40 h-40 relative rounded-lg bg-gray-200">
                  <div className="absolute top-0 right-0 z-10 overflow-hidden w-full h-full pointer-events-none">
                    <div
                      className="absolute top-5 -right-8 w-40 text-center py-1.5 text-[10px] font-black tracking-wide shadow-lg"
                      style={{
                        transform: 'rotate(45deg)',
                        background: 'linear-gradient(135deg, #C9A84C, #f0c040, #C9A84C)',
                        color: '#1a1a1a',
                        transformOrigin: 'center',
                      }}
                    >
                      {bono.trim()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {copy.cancel}
          </Button>
        )}
        <Button
          type="submit"
          className="bg-[var(--conectia-arcilla)] hover:bg-[var(--conectia-arcilla-hover)] text-[#0F2027] font-semibold sm:min-w-[200px]"
        >
          <ShieldCheck className="h-4 w-4 mr-2" /> Verificar información
        </Button>
      </div>
    </form>
    </>
  )
}
