"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Propiedad } from "@/data/propiedades"
import { Upload, X, Plus, Loader2 } from "lucide-react"
import { uploadImage, uploadMultipleImages } from "@/lib/supabase/storage"

interface PropertyFormProps {
  initialData?: Propiedad
  asesorEmail: string
  asesorNombre: string
  onSubmit: (data: Omit<Propiedad, 'id'>) => void
  onCancel?: () => void
  submitLabel?: string
}

export function PropertyForm({ initialData, asesorEmail, asesorNombre, onSubmit, onCancel, submitLabel }: PropertyFormProps) {
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
    unidadSuperficie: "m²"
  })

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
    (initialData?.detalles as any)?.amenidades || []
  )
  const [caracteristicaPersonalizada, setCaracteristicaPersonalizada] = useState("")
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imagen || "")
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initialData?.galeria || [])
  const [observaciones, setObservaciones] = useState<string>((initialData as any)?.observaciones || "")
  const [bono, setBono] = useState<string>((initialData as any)?.bono || "")
  const [isDraggingMain, setIsDraggingMain] = useState(false)
  const [isDraggingGallery, setIsDraggingGallery] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

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

    // Validar imagen principal si no hay datos iniciales
    if (!initialData && !imagePreview) {
      alert('Por favor sube una imagen principal')
      return
    }

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

      // Subir galería a Storage si hay imágenes base64
      let galeriaUrls = galleryPreviews
      const base64Images = galleryPreviews.filter(img => img.startsWith('data:'))
      const urlImages = galleryPreviews.filter(img => !img.startsWith('data:'))
      
      if (base64Images.length > 0) {
        setUploadProgress(`Subiendo galería (0/${base64Images.length})...`)
        const uploadedUrls: string[] = []
        
        for (let i = 0; i < base64Images.length; i++) {
          setUploadProgress(`Subiendo galería (${i + 1}/${base64Images.length})...`)
          const result = await uploadImage(base64Images[i], 'galeria')
          if (result.url) {
            uploadedUrls.push(result.url)
          }
        }
        
        galeriaUrls = [...urlImages, ...uploadedUrls]
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
        imagen: imagenUrl || "/placeholder-property.jpg",
        descripcion: (() => {
          const base = String(formData.descripcion || '').trim()
          const act = actividadesRecreativasSeleccionadas.join(', ')
          if (!act) return base
          if (!base) return `Actividades recreativas: ${act}`
          return `${base}\n\nActividades recreativas: ${act}`
        })(),
        caracteristicas: formData.caracteristicas || [],
        status: formData.status as any,
        categoria: (formData.categoria as any) || "venta",
        fechaPublicacion: new Date().toISOString().split('T')[0],
        agente: {
          nombre: asesorNombre,
          especialidad: "Asesor Inmobiliario",
          rating: 4.5,
          ventas: 0,
          telefono: "+52 1 477 475 6951",
          email: asesorEmail
        },
        detalles: {
          tipoPropiedad: formData.tipo || "Departamento",
          areaTerreno: `${formData.area ?? 0} m²`,
          antiguedad: "Nueva",
          vistas: 0,
          favoritos: 0,
          publicado: new Date().toLocaleDateString('es-MX'),
          amenidades: amenidadesSeleccionadas
        } as any,
        galeria: galeriaUrls,
        tourVirtual: undefined,
        unidadSuperficie: formData.unidadSuperficie || "m²",
        tipoCredito: (formData as any).tipoCredito || undefined,
        observaciones: observaciones || undefined,
        bono: bono.trim() || undefined,
        frente: (formData as any).frente ? Number((formData as any).frente) : undefined,
        fondo: (formData as any).fondo ? Number((formData as any).fondo) : undefined,
        colonia: (formData as any).colonia || undefined,
        ciudad: (formData as any).ciudad || undefined
      } as any

      console.log('Enviando propiedad:', propertyData)
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
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files)

    // Validar que no sean más de 10 imágenes en total
    if (galleryPreviews.length + fileArray.length > 30) {
      alert('Máximo 30 imágenes en la galería')
      return
    }

    fileArray.forEach(file => {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es una imagen válida`)
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} no debe superar 5MB`)
        return
      }

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setGalleryPreviews(prev => [...prev, base64String])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = () => {
    setImagePreview("")
    setFormData({ ...formData, imagen: "" })
  }

  const removeGalleryImage = (index: number) => {
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
      alert('Máximo 30 imágenes en la galería')
      return
    }
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es una imagen válida`)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} no debe superar 5MB`)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white">Información Básica</h3>
          <p className="text-xs text-[#B0ACA6]">Datos principales de la propiedad</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Penthouse Polanco IV"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación / Dirección *</Label>
              <Input
                id="ubicacion"
                required
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                placeholder="Ej: Av. Insurgentes 1234, Col. Del Valle"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="colonia">Colonia / Zona *</Label>
              <Input
                id="colonia"
                value={(formData as any).colonia || ''}
                onChange={(e) => setFormData({ ...formData, colonia: e.target.value } as any)}
                placeholder="Ej: Lomas del Moral"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Input
                id="ciudad"
                value={(formData as any).ciudad || ''}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value } as any)}
                placeholder="Ej: León, Guanajuato"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">
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
              />
              {formData.precio && formData.precio > 0 && (
                <p className="text-xs text-[#C78F7B] font-medium">
                  ${formData.precio.toLocaleString('es-MX')} MXN{formData.unidadSuperficie === 'Hectáreas' ? '/m²' : ''}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Propiedad *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
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
              <Label htmlFor="unidadSuperficie">Unidad de Superficie</Label>
              <Select
                value={formData.unidadSuperficie || 'm²'}
                onValueChange={(value) => setFormData({ ...formData, unidadSuperficie: value as 'm²' | 'Hectáreas' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m²">m²</SelectItem>
                  <SelectItem value="Hectáreas">Hectáreas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Habitaciones *</Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ ...formData, habitaciones: num })}
                    className={`
                      h-10 w-10 rounded-lg border flex items-center justify-center transition-all
                      ${formData.habitaciones === num
                        ? 'bg-[#C78F7B] text-[#0F2027] border-[#C78F7B] font-bold shadow-md scale-105'
                        : 'bg-blue-500/10 text-white border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/15'
                      }
                    `}
                  >
                    {num}{num === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Baños Completos *</Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ ...formData, banos: num })}
                    className={`
                      h-10 w-10 rounded-lg border flex items-center justify-center transition-all
                      ${formData.banos === num
                        ? 'bg-[#C78F7B] text-[#0F2027] border-[#C78F7B] font-bold shadow-md scale-105'
                        : 'bg-blue-500/10 text-white border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/15'
                      }
                    `}
                  >
                    {num}{num === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Medios Baños</Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ ...formData, mediosBanos: num })}
                    className={`
                      h-10 w-10 rounded-lg border flex items-center justify-center transition-all
                      ${formData.mediosBanos === num
                        ? 'bg-[#C78F7B] text-[#0F2027] border-[#C78F7B] font-bold shadow-md scale-105'
                        : 'bg-blue-500/10 text-white border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/15'
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área Terreno (m²) *</Label>
              <Input
                id="area"
                type="number"
                required
                value={formData.area ?? ''}
                onChange={(e) => {
                  const raw = e.target.value
                  setFormData({ ...formData, area: raw === '' ? undefined : Number(raw) })
                }}
                placeholder="450"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amueblado">Amueblado</Label>
              <Select
                value={formData.amueblado || ''}
                onValueChange={(value) => setFormData({ ...formData, amueblado: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amueblado">Amueblado</SelectItem>
                  <SelectItem value="semiamueblado">Semiamueblado</SelectItem>
                  <SelectItem value="sin_amueblar">Sin amueblar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaConstruccion">Área Construcción (m²)</Label>
              <Input
                id="areaConstruccion"
                type="number"
                value={formData.areaConstruccion === undefined ? '' : formData.areaConstruccion}
                onChange={(e) => setFormData({ ...formData, areaConstruccion: e.target.value === '' ? undefined : Number(e.target.value) })}
                placeholder="350"
                min="0"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="frente">Frente (m)</Label>
                <Input
                  id="frente"
                  type="number"
                  value={(formData as any).frente ?? ''}
                  onChange={(e) => setFormData({ ...formData, frente: e.target.value === '' ? undefined : Number(e.target.value) } as any)}
                  placeholder="Ej: 12"
                  min="0"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fondo">Fondo (m)</Label>
                <Input
                  id="fondo"
                  type="number"
                  value={(formData as any).fondo ?? ''}
                  onChange={(e) => setFormData({ ...formData, fondo: e.target.value === '' ? undefined : Number(e.target.value) } as any)}
                  placeholder="Ej: 20"
                  min="0"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cochera (Coches)</Label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ ...formData, cochera: num })}
                    className={`
                      h-10 w-10 rounded-lg border flex items-center justify-center transition-all
                      ${formData.cochera === num
                        ? 'bg-[#C78F7B] text-[#0F2027] border-[#C78F7B] font-bold shadow-md scale-105'
                        : 'bg-blue-500/10 text-white border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/15'
                      }
                    `}
                  >
                    {num}{num === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Exclusiva">Exclusiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Tipo de Operación *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo de operación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="renta">Renta</SelectItem>
                  <SelectItem value="oferta">Oferta</SelectItem>
                  <SelectItem value="especiales">Especiales</SelectItem>
                  <SelectItem value="preventa">Preventa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoCredito">Tipo de Crédito</Label>
              <Select
                value={(formData as any).tipoCredito || ''}
                onValueChange={(value) => setFormData({ ...formData, tipoCredito: value } as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo de crédito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contado">Contado</SelectItem>
                  <SelectItem value="Crédito Bancario">Crédito Bancario</SelectItem>
                  <SelectItem value="Infonavit">Infonavit</SelectItem>
                  <SelectItem value="Fovissste">Fovissste</SelectItem>
                  <SelectItem value="Cofinavit">Cofinavit</SelectItem>
                  <SelectItem value="Crédito Puente">Crédito Puente</SelectItem>
                  <SelectItem value="Cualquier Crédito">Cualquier Crédito</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                  <SelectItem value="No aplica">No aplica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="antiguedad">Antigüedad</Label>
              <Select
                value={(formData as any).antiguedad || ''}
                onValueChange={(value) => setFormData({ ...formData, antiguedad: value } as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona antigüedad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nueva">Nueva (Estrenar)</SelectItem>
                  <SelectItem value="1-5 años">1-5 años</SelectItem>
                  <SelectItem value="6-10 años">6-10 años</SelectItem>
                  <SelectItem value="11-20 años">11-20 años</SelectItem>
                  <SelectItem value="21-30 años">21-30 años</SelectItem>
                  <SelectItem value="Más de 30 años">Más de 30 años</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gravamen">¿Tiene Gravamen?</Label>
              <Select
                value={(formData as any).gravamen || ''}
                onValueChange={(value) => setFormData({ ...formData, gravamen: value } as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No tiene gravamen</SelectItem>
                  <SelectItem value="si">Sí tiene gravamen</SelectItem>
                  <SelectItem value="en_proceso">En proceso de liberación</SelectItem>
                  <SelectItem value="desconocido">Desconocido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea
              id="descripcion"
              required
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describe la propiedad..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Actividades recreativas (opcional)</Label>
            <p className="text-xs text-gray-500 mb-2">Selecciona las actividades que ofrece el desarrollo</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {actividadesRecreativasDisponibles.map((actividad) => (
                <button
                  key={actividad}
                  type="button"
                  onClick={() => toggleActividadRecreativa(actividad)}
                  className={`
                    p-2 rounded-lg border text-sm font-medium transition-all text-left
                    ${actividadesRecreativasSeleccionadas.includes(actividad)
                      ? 'bg-[#C78F7B] text-[#0F2027] border-[#C78F7B] shadow-md'
                      : 'bg-blue-500/10 text-white border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/15'
                    }
                  `}
                >
                  {actividad}
                </button>
              ))}
            </div>
            {actividadesRecreativasSeleccionadas.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {actividadesRecreativasSeleccionadas.length} actividad(es) seleccionada(s)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones de la Propiedad</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Agrega observaciones adicionales sobre la propiedad (estado, reparaciones necesarias, etc.)..."
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white">Características</h3>
          <p className="text-xs text-[#B0ACA6]">Agrega las características destacadas</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {caracteristicasDisponibles.map((car) => (
              <button
                key={car}
                type="button"
                onClick={() => toggleCaracteristica(car)}
                className={`
                  p-3 rounded-lg border text-sm font-medium transition-all text-left
                  ${formData.caracteristicas?.includes(car)
                    ? 'bg-[#C78F7B] text-[#0F2027] border-[#C78F7B] shadow-md'
                    : 'bg-blue-500/10 text-white border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/15'
                  }
                `}
              >
                {car}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Input
              value={caracteristicaPersonalizada}
              onChange={(e) => setCaracteristicaPersonalizada(e.target.value)}
              placeholder="Agregar otra característica..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCaracteristicaPersonalizada())}
            />
            <Button type="button" onClick={addCaracteristicaPersonalizada}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.caracteristicas && formData.caracteristicas.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                {formData.caracteristicas.length} característica(s) seleccionada(s)
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.caracteristicas.filter(c => !caracteristicasDisponibles.includes(c)).map((car) => (
                  <div
                    key={car}
                    className="flex items-center gap-2 bg-[#C78F7B]/10 text-[#C78F7B] px-3 py-1 rounded-full"
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
          <h3 className="text-lg font-bold text-white">Amenidades</h3>
          <p className="text-xs text-[#B0ACA6]">Selecciona las amenidades disponibles en la propiedad</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amenidadesDisponibles.map((amenidad) => (
              <button
                key={amenidad}
                type="button"
                onClick={() => toggleAmenidad(amenidad)}
                className={`
                  p-3 rounded-lg border text-sm font-medium transition-all text-left
                  ${amenidadesSeleccionadas.includes(amenidad)
                    ? 'bg-[#C78F7B] text-[#0F2027] border-[#C78F7B] shadow-md'
                    : 'bg-blue-500/10 text-white border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/15'
                  }
                `}
              >
                {amenidad}
              </button>
            ))}
          </div>
          {amenidadesSeleccionadas.length > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              {amenidadesSeleccionadas.length} amenidad(es) seleccionada(s)
            </p>
          )}
        </div>
      </div>

      <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white">Imagen Principal</h3>
          <p className="text-xs text-[#B0ACA6]">Sube la imagen principal de la propiedad</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imagen">Imagen Principal *</Label>

            {!imagePreview ? (
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDraggingMain 
                    ? 'border-[#C78F7B] bg-[#C78F7B]/20 scale-[1.02]' 
                    : 'border-[#C78F7B]/30 bg-[#C78F7B]/5 hover:bg-[#C78F7B]/10'
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
                  <Upload className={`h-12 w-12 mx-auto mb-3 transition-transform ${isDraggingMain ? 'text-[#C78F7B] scale-125' : 'text-[#C78F7B]'}`} />
                  <p className="text-sm font-medium text-white mb-1">
                    {isDraggingMain ? '¡Suelta la imagen aquí!' : 'Arrastra una imagen o haz click'}
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG o WEBP (máx. 5MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-[#C78F7B]/20 group">
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
                    <Button type="button" size="sm" className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027]" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Cambiar
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
                    Eliminar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white">Galería de Imágenes</h3>
          <p className="text-xs text-[#B0ACA6]">Sube hasta 30 imágenes adicionales</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="galeria">Imágenes de la Galería</Label>

            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDraggingGallery 
                  ? 'border-[#C78F7B] bg-[#C78F7B]/20 scale-[1.02]' 
                  : 'border-[#C78F7B]/30 bg-[#C78F7B]/5 hover:bg-[#C78F7B]/10'
              }`}
              onDragOver={(e) => handleDragOver(e, setIsDraggingGallery)}
              onDragLeave={(e) => handleDragLeave(e, setIsDraggingGallery)}
              onDrop={handleDropGallery}
            >
              <input
                type="file"
                id="galeria"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
              <label htmlFor="galeria" className="cursor-pointer">
                <div className="flex justify-center gap-2 mb-3">
                  <Upload className={`h-12 w-12 transition-transform ${isDraggingGallery ? 'text-[#C78F7B] scale-125' : 'text-[#C78F7B]'}`} />
                  <Plus className={`h-6 w-6 text-[#C78F7B] mt-6 -ml-4 transition-transform ${isDraggingGallery ? 'scale-125' : ''}`} />
                </div>
                <p className="text-sm font-medium text-white mb-1">
                  {isDraggingGallery ? '¡Suelta las imágenes aquí!' : 'Arrastra imágenes o haz click'}
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG o WEBP (máx. 5MB cada una) • Hasta 30 imágenes
                </p>
                {galleryPreviews.length > 0 && (
                  <p className="text-xs text-[#C78F7B] mt-2 font-medium">
                    {galleryPreviews.length}/30 imágenes subidas
                  </p>
                )}
              </label>
            </div>

            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[#C78F7B]/20 group">
                    <img
                      src={preview}
                      alt={`Galería ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#0F2027]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        size="sm"
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
          <h3 className="text-lg font-bold text-white">Bono o Descuento</h3>
          <p className="text-xs text-[#B0ACA6]">Opcional — se mostrará como un listón en la esquina de la publicación</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bono">Texto del bono</Label>
            <Input
              id="bono"
              value={bono}
              onChange={(e) => setBono(e.target.value)}
              placeholder="Ej: BONO DE $500,000 PESOS"
              maxLength={60}
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

      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button 
          type="submit" 
          className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] font-semibold min-w-[200px]"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {uploadProgress || 'Procesando...'}
            </>
          ) : (
            <>{submitLabel || `${initialData ? 'Actualizar' : 'Publicar'} Propiedad`}</>
          )}
        </Button>
      </div>
    </form>
  )
}
