export interface Propiedad {
  id: number
  usuarioId?: string
  titulo: string
  ubicacion: string
  precio: number
  precioTexto: string
  tipo: string
  habitaciones: number
  banos: number
  mediosBanos?: number
  area: number
  areaConstruccion?: number
  cochera?: number
  amueblado?: "amueblado" | "semiamueblado" | "sin_amueblar"
  areaTexto: string
  imagen: string
  descripcion: string
  caracteristicas: string[]
  status: "Disponible" | "Exclusiva" | "Reservada"
  categoria: "venta" | "renta" | "especial" | "remate" | "exclusivo"
  fechaPublicacion: string
  tourVirtual?: string
  agente?: {
    nombre: string
    especialidad: string
    rating: number
    ventas: number
    telefono: string
    email: string
  }
  detalles?: {
    tipoPropiedad: string
    areaTerreno?: string
    antiguedad: string
    vistas: number
    favoritos: number
    publicado: string
  }
  galeria?: string[]
  bono?: string
}

export const propiedades: Propiedad[] = [
  {
    id: 1,
    titulo: "Penthouse Polanco IV",
    ubicacion: "Polanco, CDMX",
    precio: 18500000,
    precioTexto: "$18,500,000",
    tipo: "Penthouse",
    habitaciones: 4,
    banos: 5,
    area: 450,
    areaTexto: "450 m²",
    imagen: "/luxury-penthouse-polanco-main.png",
    descripcion: "Exclusivo penthouse con vista panorámica de la ciudad, acabados de lujo y terraza privada. Una oportunidad única de vivir en el corazón de Polanco con la más alta calidad, elegancia, funcionalidad y ubicación privilegiada en el corazón de Polanco.",
    caracteristicas: ["Vista panorámica", "Terraza privada", "Acabados premium", "Ubicación exclusiva", "Piscina", "Gimnasio"],
    status: "Disponible",
    categoria: "venta",
    fechaPublicacion: "2024-03-15",
    agente: {
      nombre: "María Elena Vázquez",
      especialidad: "Especialista en Propiedades de Lujo",
      rating: 4.9,
      ventas: 127,
      telefono: "+52 1 477 475 6951",
      email: "maria.vazquez@conectiaselect.mx"
    },
    detalles: {
      tipoPropiedad: "Penthouse",
      areaTerreno: "450 m²",
      antiguedad: "2 años",
      vistas: 1247,
      favoritos: 89,
      publicado: "14/3/2024"
    },
    galeria: [
      "/luxury-penthouse-polanco-main.png",
      "/penthouse-living.jpg",
      "/penthouse-terrace.jpg",
      "/penthouse-bedroom.jpg"
    ]
  },
  {
    id: 2,
    titulo: "Villa Santa Fe",
    ubicacion: "Santa Fe, CDMX",
    precio: 22800000,
    precioTexto: "$22,800,000",
    tipo: "Villa",
    habitaciones: 6,
    banos: 7,
    area: 680,
    areaTexto: "680 m²",
    imagen: "/luxury-villa-santa-fe.png",
    descripcion: "Majestuosa villa con jardín privado, piscina infinity y diseño arquitectónico contemporáneo. Ubicada en la exclusiva zona de Santa Fe con seguridad 24/7 y amenidades de primer nivel.",
    caracteristicas: ["Jardín privado", "Piscina infinity", "Diseño contemporáneo", "Seguridad 24/7", "Gimnasio", "Spa privado"],
    status: "Exclusiva",
    categoria: "exclusivo",
    fechaPublicacion: "2024-02-20",
    agente: {
      nombre: "Carlos Mendoza",
      especialidad: "Especialista en Villas de Lujo",
      rating: 4.8,
      ventas: 95,
      telefono: "+52 1 477 475 6951",
      email: "carlos.mendoza@conectiaselect.mx"
    },
    detalles: {
      tipoPropiedad: "Villa",
      areaTerreno: "680 m²",
      antiguedad: "Nueva",
      vistas: 892,
      favoritos: 156,
      publicado: "20/2/2024"
    }
  },
  {
    id: 3,
    titulo: "Residencia Roma Norte",
    ubicacion: "Roma Norte, CDMX",
    precio: 15200000,
    precioTexto: "$15,200,000",
    tipo: "Residencia",
    habitaciones: 3,
    banos: 4,
    area: 320,
    areaTexto: "320 m²",
    imagen: "/modern-apartment-roma-norte.png",
    descripcion: "Elegante residencia en el corazón de Roma Norte, con diseño moderno y ubicación privilegiada. Cerca de los mejores restaurantes, galerías y vida cultural de la ciudad.",
    caracteristicas: ["Ubicación central", "Diseño moderno", "Balcón privado", "Cerca de restaurantes", "Vida cultural", "Transporte público"],
    status: "Reservada",
    categoria: "especial",
    fechaPublicacion: "2024-01-10",
    agente: {
      nombre: "Ana Sofía Ruiz",
      especialidad: "Especialista en Roma Norte",
      rating: 4.7,
      ventas: 78,
      telefono: "+52 1 477 475 6951",
      email: "ana.ruiz@conectiaselect.mx"
    },
    detalles: {
      tipoPropiedad: "Residencia",
      areaTerreno: "320 m²",
      antiguedad: "5 años",
      vistas: 654,
      favoritos: 43,
      publicado: "10/1/2024"
    }
  },
  {
    id: 4,
    titulo: "Loft Condesa Premium",
    ubicacion: "Condesa, CDMX",
    precio: 12800000,
    precioTexto: "$12,800,000",
    tipo: "Loft",
    habitaciones: 2,
    banos: 2,
    area: 180,
    areaTexto: "180 m²",
    imagen: "/modern-loft-condesa.png",
    descripcion: "Moderno loft en la vibrante Condesa, con techos altos y diseño industrial contemporáneo. Perfecto para profesionales que buscan estilo y ubicación privilegiada.",
    caracteristicas: ["Techos altos", "Diseño industrial", "Ubicación central", "Terraza privada", "Vida nocturna", "Parques cercanos"],
    status: "Disponible",
    categoria: "renta",
    fechaPublicacion: "2024-03-01",
    agente: {
      nombre: "Roberto Silva",
      especialidad: "Especialista en Lofts Modernos",
      rating: 4.6,
      ventas: 62,
      telefono: "+52 1 477 475 6951",
      email: "roberto.silva@conectiaselect.mx"
    },
    detalles: {
      tipoPropiedad: "Loft",
      areaTerreno: "180 m²",
      antiguedad: "3 años",
      vistas: 423,
      favoritos: 67,
      publicado: "1/3/2024"
    }
  },
  {
    id: 6,
    titulo: "Departamento Interlomas",
    ubicacion: "Interlomas, Estado de México",
    precio: 8500000,
    precioTexto: "$8,500,000",
    tipo: "Departamento",
    habitaciones: 3,
    banos: 3,
    area: 220,
    areaTexto: "220 m²",
    imagen: "/apartment-interlomas.png",
    descripcion: "Cómodo departamento en Interlomas con amenidades completas y ubicación estratégica. Ideal para familias que buscan tranquilidad sin alejarse de la ciudad.",
    caracteristicas: ["Amenidades completas", "Ubicación estratégica", "Seguridad", "Áreas verdes", "Club deportivo", "Transporte"],
    status: "Disponible",
    categoria: "remate",
    fechaPublicacion: "2024-01-25",
    agente: {
      nombre: "Luis Fernando García",
      especialidad: "Especialista en Interlomas",
      rating: 4.5,
      ventas: 89,
      telefono: "+52 1 477 475 6951",
      email: "luis.garcia@conectiaselect.mx"
    },
    detalles: {
      tipoPropiedad: "Departamento",
      areaTerreno: "220 m²",
      antiguedad: "7 años",
      vistas: 312,
      favoritos: 28,
      publicado: "25/1/2024"
    }
  }
]

export function getPropiedadById(id: number): Propiedad | undefined {
  return propiedades.find(p => p.id === id)
}
