import { User, PropertyProgress, Lead, Activity } from '@/types/internal'

// Usuarios del sistema (en producción esto vendría de una base de datos)
export const users: User[] = [
  {
    id: 'admin-1',
    nombre: 'Carlos Mendoza',
    email: 'admin@conectia.mx',
    role: 'admin',
    telefono: '+52 477 475 6951',
    avatar: '/avatars/admin.jpg'
  },
  {
    id: 'asesor-1',
    nombre: 'Ana García',
    email: 'ana@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 123 4567',
    avatar: '/avatars/ana.jpg',
    password: 'ana_conectia2025',
    plan: 'elite'
  },
  {
    id: 'asesor-2',
    nombre: 'Roberto Silva',
    email: 'roberto@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 234 5678',
    avatar: '/avatars/roberto.jpg',
    password: 'roberto_conectia2025',
    plan: 'elite'
  },
  {
    id: 'asesor-3',
    nombre: 'María López',
    email: 'maria@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 345 6789',
    avatar: '/avatars/maria.jpg',
    password: 'maria_conectia2025',
    plan: 'elite'
  },
  {
    id: 'asesor-4',
    nombre: 'Daniela Belmonte',
    email: 'daniela@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 456 7801',
    avatar: '/avatars/daniela.jpg',
    password: 'daniela_conectia2025',
    plan: 'elite'
  },
  {
    id: 'asesor-5',
    nombre: 'Subje Hamue',
    email: 'subje@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 456 7802',
    avatar: '/avatars/subje.jpg',
    password: 'subje_conectia2025',
    plan: 'elite'
  },
  {
    id: 'asesor-6',
    nombre: 'Gris Ayala',
    email: 'gris@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 456 7803',
    avatar: '/avatars/gris.jpg',
    password: 'gris_conectia2025',
    plan: 'elite'
  },
  {
    id: 'asesor-7',
    nombre: 'Lizzie Lazarini',
    email: 'lizzie@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 456 7804',
    avatar: '/avatars/lizzie.jpg',
    password: 'lizzie_conectia2025',
    plan: 'elite'
  },
  {
    id: 'asesor-8',
    nombre: 'Ingrid Gonzalez',
    email: 'ingrid@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 456 7805',
    avatar: '/avatars/ingrid.jpg',
    password: 'ingrid_conectia2025',
    plan: 'elite'
  },
  {
    id: 'asesor-9',
    nombre: 'Sofía Ayala',
    email: 'sofia.ayala@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 456 7806',
    avatar: '/avatars/sofia.jpg',
    password: 'sofia_conectia2025',
    plan: 'elite'
  },
  {
    id: 'asesor-10',
    nombre: 'Elizabeth',
    email: 'elizabeth@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 456 7807',
    avatar: '/avatars/elizabeth.jpg',
    password: 'elizabeth_conectia2025',
    plan: 'elite'
  },
  {
    id: 'asesor-11',
    nombre: 'Alexandra',
    email: 'alexandra@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 456 7808',
    avatar: '/avatars/alexandra.jpg',
    password: 'alexandra_2025',
    plan: 'elite'
  },
  {
    id: 'asesor-12',
    nombre: 'Claraliz',
    email: 'claraliz@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 456 7809',
    avatar: '/avatars/claraliz.jpg',
    password: 'liz_2025',
    plan: 'elite'
  },
  {
    id: 'asesor-13',
    nombre: 'Pamela',
    email: 'pamela@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 456 7810',
    avatar: '/avatars/pamela.jpg',
    password: 'pamela_conectia2025',
    plan: 'elite'
  },
  {
    id: 'asesor-14',
    nombre: 'Juan Martín Becerra Camacho',
    email: 'juanbecerra@conectia.mx',
    role: 'asesor',
    telefono: '+52 477 456 7811',
    avatar: '/avatars/juanbecerra.jpg',
    password: 'juan_conectia2025',
    plan: 'elite'
  },
  // Empresa Demo
  {
    id: 'empresa-1',
    nombre: 'Grupo Inmobiliario Demo S.A.',
    email: 'empresa@conectia.mx',
    role: 'empresa' as any,
    telefono: '+52 477 800 0001',
    avatar: '/avatars/empresa.jpg',
    password: 'empresa_conectia2025',
    plan: 'team-elite' as any
  },
  // Brokers
  {
    id: 'broker-1',
    nombre: 'Carlos Broker',
    email: 'broker@conectia.mx',
    role: 'broker',
    telefono: '+52 477 600 1234',
    avatar: '/avatars/broker.jpg',
    password: 'broker_conectia2025',
    plan: 'elite'
  },
  // Fotógrafo
  {
    id: 'fotografo-1',
    nombre: 'Santiago Canales',
    email: 'santiago@conectia.mx',
    role: 'fotografo',
    telefono: '+52 477 555 1234',
    avatar: '/avatars/santiago.jpg',
    password: 'santiago_conectia2025'
  },
  // Propietarios
  {
    id: 'propietario-1',
    nombre: 'Eduardo Sánchez',
    email: 'eduardo@propietario.com',
    role: 'propietario',
    telefono: '+52 477 111 0000',
    avatar: '/avatars/propietario1.jpg',
    propiedadId: 1,
    password: 'propietario2025'
  },
  {
    id: 'propietario-2',
    nombre: 'Sofía Hernández',
    email: 'sofia@propietario.com',
    role: 'propietario',
    telefono: '+52 477 222 0000',
    avatar: '/avatars/propietario2.jpg',
    propiedadId: 2,
    password: 'propietario2025'
  },
  {
    id: 'propietario-3',
    nombre: 'Ricardo Morales',
    email: 'ricardo@propietario.com',
    role: 'propietario',
    telefono: '+52 477 333 0000',
    avatar: '/avatars/propietario3.jpg',
    propiedadId: 4,
    password: 'propietario2025'
  }
]

// Progreso de propiedades por asesor
export const propertyProgress: PropertyProgress[] = [
  {
    propiedadId: 1,
    asesorId: 'asesor-1',
    leads: 15,
    visitas: 8,
    ofertas: 2,
    status: 'en_negociacion',
    ultimaActividad: '2025-01-21T10:30:00',
    notas: 'Cliente interesado en negociar precio'
  },
  {
    propiedadId: 2,
    asesorId: 'asesor-1',
    leads: 23,
    visitas: 12,
    ofertas: 4,
    status: 'activa',
    ultimaActividad: '2025-01-20T15:45:00'
  },
  {
    propiedadId: 3,
    asesorId: 'asesor-2',
    leads: 18,
    visitas: 10,
    ofertas: 3,
    status: 'activa',
    ultimaActividad: '2025-01-21T09:15:00'
  },
  {
    propiedadId: 4,
    asesorId: 'asesor-2',
    leads: 31,
    visitas: 15,
    ofertas: 5,
    status: 'en_negociacion',
    ultimaActividad: '2025-01-21T14:20:00',
    notas: 'Oferta fuerte, pendiente de documentación'
  },
  {
    propiedadId: 6,
    asesorId: 'asesor-3',
    leads: 12,
    visitas: 6,
    ofertas: 1,
    status: 'activa',
    ultimaActividad: '2025-01-19T11:00:00'
  },
  {
    propiedadId: 5,
    asesorId: 'asesor-1',
    leads: 28,
    visitas: 14,
    ofertas: 6,
    status: 'vendida',
    ultimaActividad: '2025-01-18T16:30:00',
    notas: '¡Venta cerrada exitosamente!'
  },
  {
    propiedadId: 7,
    asesorId: 'asesor-1',
    leads: 19,
    visitas: 9,
    ofertas: 3,
    status: 'rentada',
    ultimaActividad: '2025-01-15T12:00:00',
    notas: 'Contrato de renta firmado por 2 años'
  },
  {
    propiedadId: 8,
    asesorId: 'asesor-1',
    leads: 34,
    visitas: 18,
    ofertas: 7,
    status: 'vendida',
    ultimaActividad: '2025-01-22T11:00:00',
    notas: 'Cierre exitoso con crédito hipotecario'
  },
  {
    propiedadId: 9,
    asesorId: 'asesor-1',
    leads: 11,
    visitas: 5,
    ofertas: 1,
    status: 'activa',
    ultimaActividad: '2025-01-23T09:30:00',
    notas: 'Propiedad recién listada, buen interés inicial'
  },
  {
    propiedadId: 10,
    asesorId: 'asesor-1',
    leads: 42,
    visitas: 22,
    ofertas: 8,
    status: 'en_negociacion',
    ultimaActividad: '2025-01-24T14:00:00',
    notas: 'Dos ofertas competitivas, propietario evaluando'
  }
]

// Leads recientes
export const leads: Lead[] = [
  // Leads para propiedad 1 (Eduardo Sánchez)
  {
    id: 'lead-1',
    propiedadId: 1,
    nombre: 'Juan Pérez',
    email: 'juan.perez@email.com',
    telefono: '+52 477 111 2222',
    mensaje: 'Me interesa agendar una visita para este fin de semana',
    fecha: '2025-01-21T10:30:00',
    status: 'nuevo',
    asesorId: 'asesor-1'
  },
  {
    id: 'lead-6',
    propiedadId: 1,
    nombre: 'Andrea López',
    email: 'andrea.lopez@email.com',
    telefono: '+52 477 666 7777',
    mensaje: 'Busco casa para mi familia, me interesa mucho esta propiedad',
    fecha: '2025-01-20T14:00:00',
    status: 'contactado',
    asesorId: 'asesor-1'
  },
  {
    id: 'lead-7',
    propiedadId: 1,
    nombre: 'Roberto Díaz',
    email: 'roberto.diaz@email.com',
    telefono: '+52 477 777 8888',
    mensaje: '¿Cuál es el precio final? Estoy listo para hacer oferta',
    fecha: '2025-01-19T11:30:00',
    status: 'calificado',
    asesorId: 'asesor-1'
  },
  {
    id: 'lead-8',
    propiedadId: 1,
    nombre: 'Carmen Ruiz',
    email: 'carmen.r@email.com',
    telefono: '+52 477 888 9999',
    mensaje: 'Me gustaría conocer las amenidades del fraccionamiento',
    fecha: '2025-01-18T16:45:00',
    status: 'descartado',
    asesorId: 'asesor-1'
  },
  // Leads para propiedad 2 (Sofía Hernández)
  {
    id: 'lead-2',
    propiedadId: 2,
    nombre: 'Laura Martínez',
    email: 'laura.m@email.com',
    telefono: '+52 477 222 3333',
    mensaje: '¿Está disponible para renta a largo plazo?',
    fecha: '2025-01-20T15:45:00',
    status: 'contactado',
    asesorId: 'asesor-1'
  },
  {
    id: 'lead-9',
    propiedadId: 2,
    nombre: 'Fernando García',
    email: 'fernando.g@email.com',
    telefono: '+52 477 999 0000',
    mensaje: 'Excelente ubicación, quiero agendar visita',
    fecha: '2025-01-21T09:00:00',
    status: 'nuevo',
    asesorId: 'asesor-1'
  },
  {
    id: 'lead-10',
    propiedadId: 2,
    nombre: 'Mariana Vega',
    email: 'mariana.v@email.com',
    telefono: '+52 477 000 1111',
    mensaje: '¿Tiene estacionamiento techado?',
    fecha: '2025-01-19T13:20:00',
    status: 'contactado',
    asesorId: 'asesor-1'
  },
  // Leads para propiedad 4 (Ricardo Morales)
  {
    id: 'lead-4',
    propiedadId: 4,
    nombre: 'Patricia Gómez',
    email: 'patricia.g@email.com',
    telefono: '+52 477 444 5555',
    mensaje: 'Necesito más información sobre el financiamiento',
    fecha: '2025-01-21T14:20:00',
    status: 'nuevo',
    asesorId: 'asesor-2'
  },
  {
    id: 'lead-11',
    propiedadId: 4,
    nombre: 'Alejandro Mendoza',
    email: 'alejandro.m@email.com',
    telefono: '+52 477 111 0001',
    mensaje: 'Quiero hacer una oferta formal',
    fecha: '2025-01-20T10:00:00',
    status: 'calificado',
    asesorId: 'asesor-2'
  },
  {
    id: 'lead-12',
    propiedadId: 4,
    nombre: 'Gabriela Soto',
    email: 'gabriela.s@email.com',
    telefono: '+52 477 222 0002',
    mensaje: '¿Acepta crédito Infonavit?',
    fecha: '2025-01-19T15:30:00',
    status: 'contactado',
    asesorId: 'asesor-2'
  },
  {
    id: 'lead-13',
    propiedadId: 4,
    nombre: 'Luis Hernández',
    email: 'luis.h@email.com',
    telefono: '+52 477 333 0003',
    mensaje: 'Me interesa para inversión, ¿cuál es el ROI esperado?',
    fecha: '2025-01-18T09:15:00',
    status: 'calificado',
    asesorId: 'asesor-2'
  },
  // Leads para propiedad 8 (Ana - vendida)
  {
    id: 'lead-14',
    propiedadId: 8,
    nombre: 'Ricardo Fuentes',
    email: 'ricardo.f@email.com',
    telefono: '+52 477 444 1111',
    mensaje: 'Cerré la compra, excelente servicio',
    fecha: '2025-01-22T10:00:00',
    status: 'calificado',
    asesorId: 'asesor-1'
  },
  {
    id: 'lead-15',
    propiedadId: 8,
    nombre: 'Diana Castillo',
    email: 'diana.c@email.com',
    telefono: '+52 477 444 2222',
    mensaje: 'Me interesa mucho, ¿aún está disponible?',
    fecha: '2025-01-21T16:30:00',
    status: 'descartado',
    asesorId: 'asesor-1'
  },
  // Leads para propiedad 9 (Ana - activa)
  {
    id: 'lead-16',
    propiedadId: 9,
    nombre: 'Valeria Ortíz',
    email: 'valeria.o@email.com',
    telefono: '+52 477 555 3333',
    mensaje: '¿Tiene jardín trasero? Busco espacio para mis hijos',
    fecha: '2025-01-23T08:45:00',
    status: 'nuevo',
    asesorId: 'asesor-1'
  },
  {
    id: 'lead-17',
    propiedadId: 9,
    nombre: 'Emilio Vargas',
    email: 'emilio.v@email.com',
    telefono: '+52 477 555 4444',
    mensaje: 'Quiero agendar visita para el sábado',
    fecha: '2025-01-23T11:20:00',
    status: 'contactado',
    asesorId: 'asesor-1'
  },
  // Leads para propiedad 10 (Ana - en negociación)
  {
    id: 'lead-18',
    propiedadId: 10,
    nombre: 'Santiago Reyes',
    email: 'santiago.r@email.com',
    telefono: '+52 477 666 5555',
    mensaje: 'Ofrezco $6,500,000 al contado',
    fecha: '2025-01-24T13:00:00',
    status: 'calificado',
    asesorId: 'asesor-1'
  },
  {
    id: 'lead-19',
    propiedadId: 10,
    nombre: 'Paulina Méndez',
    email: 'paulina.m@email.com',
    telefono: '+52 477 666 6666',
    mensaje: 'Oferta de $6,200,000 con crédito bancario aprobado',
    fecha: '2025-01-24T10:15:00',
    status: 'calificado',
    asesorId: 'asesor-1'
  },
  {
    id: 'lead-20',
    propiedadId: 10,
    nombre: 'Iván Delgado',
    email: 'ivan.d@email.com',
    telefono: '+52 477 666 7777',
    mensaje: 'Me interesa para inversión, ¿cuál es la plusvalía de la zona?',
    fecha: '2025-01-23T17:00:00',
    status: 'contactado',
    asesorId: 'asesor-1'
  },
  // Otros leads
  {
    id: 'lead-3',
    propiedadId: 3,
    nombre: 'Carlos Ramírez',
    email: 'carlos.r@email.com',
    telefono: '+52 477 333 4444',
    mensaje: 'Quiero hacer una oferta',
    fecha: '2025-01-21T09:15:00',
    status: 'calificado',
    asesorId: 'asesor-2'
  },
  {
    id: 'lead-5',
    propiedadId: 6,
    nombre: 'Miguel Torres',
    email: 'miguel.t@email.com',
    telefono: '+52 477 555 6666',
    mensaje: '¿Acepta mascotas?',
    fecha: '2025-01-19T11:00:00',
    status: 'contactado',
    asesorId: 'asesor-3'
  }
]

// Actividad reciente
export const activities: Activity[] = [
  // Actividades para propiedad 1 (Eduardo Sánchez)
  {
    id: 'act-1',
    tipo: 'lead',
    propiedadId: 1,
    asesorId: 'asesor-1',
    descripcion: 'Nuevo lead recibido: Juan Pérez',
    fecha: '2025-01-21T10:30:00'
  },
  {
    id: 'act-5',
    tipo: 'visita',
    propiedadId: 1,
    asesorId: 'asesor-1',
    descripcion: 'Visita realizada con Andrea López - muy interesada',
    fecha: '2025-01-20T16:00:00'
  },
  {
    id: 'act-6',
    tipo: 'oferta',
    propiedadId: 1,
    asesorId: 'asesor-1',
    descripcion: 'Oferta recibida de Roberto Díaz: $4,300,000',
    fecha: '2025-01-19T14:00:00'
  },
  {
    id: 'act-7',
    tipo: 'nota',
    propiedadId: 1,
    asesorId: 'asesor-1',
    descripcion: 'Propietario acepta negociar precio, mínimo $4,200,000',
    fecha: '2025-01-18T10:00:00'
  },
  {
    id: 'act-8',
    tipo: 'lead',
    propiedadId: 1,
    asesorId: 'asesor-1',
    descripcion: 'Lead descartado: Carmen Ruiz - busca otra zona',
    fecha: '2025-01-17T15:30:00'
  },
  // Actividades para propiedad 2 (Sofía Hernández)
  {
    id: 'act-4',
    tipo: 'nota',
    propiedadId: 2,
    asesorId: 'asesor-1',
    descripcion: 'Cliente solicita información adicional sobre amenidades',
    fecha: '2025-01-20T15:45:00'
  },
  {
    id: 'act-9',
    tipo: 'lead',
    propiedadId: 2,
    asesorId: 'asesor-1',
    descripcion: 'Nuevo lead: Fernando García interesado en visita',
    fecha: '2025-01-21T09:00:00'
  },
  {
    id: 'act-10',
    tipo: 'visita',
    propiedadId: 2,
    asesorId: 'asesor-1',
    descripcion: 'Visita programada con Laura Martínez para el 23 de enero',
    fecha: '2025-01-19T11:00:00'
  },
  // Actividades para propiedad 4 (Ricardo Morales)
  {
    id: 'act-2',
    tipo: 'visita',
    propiedadId: 4,
    asesorId: 'asesor-2',
    descripcion: 'Visita programada para el 25 de enero',
    fecha: '2025-01-21T14:20:00'
  },
  {
    id: 'act-11',
    tipo: 'oferta',
    propiedadId: 4,
    asesorId: 'asesor-2',
    descripcion: 'Oferta formal de Alejandro Mendoza: $5,800,000',
    fecha: '2025-01-20T12:00:00'
  },
  {
    id: 'act-12',
    tipo: 'lead',
    propiedadId: 4,
    asesorId: 'asesor-2',
    descripcion: 'Lead calificado: Luis Hernández - inversionista serio',
    fecha: '2025-01-18T10:30:00'
  },
  {
    id: 'act-13',
    tipo: 'nota',
    propiedadId: 4,
    asesorId: 'asesor-2',
    descripcion: 'Documentación lista para cierre, pendiente firma',
    fecha: '2025-01-17T16:00:00'
  },
  // Actividades para propiedad 8 (Ana - vendida)
  {
    id: 'act-14',
    tipo: 'oferta',
    propiedadId: 8,
    asesorId: 'asesor-1',
    descripcion: 'Oferta aceptada de Ricardo Fuentes: $5,100,000',
    fecha: '2025-01-22T11:00:00'
  },
  {
    id: 'act-15',
    tipo: 'visita',
    propiedadId: 8,
    asesorId: 'asesor-1',
    descripcion: 'Visita final con perito valuador - todo en orden',
    fecha: '2025-01-21T15:00:00'
  },
  {
    id: 'act-16',
    tipo: 'nota',
    propiedadId: 8,
    asesorId: 'asesor-1',
    descripcion: 'Documentación completa, firma en notaría programada',
    fecha: '2025-01-22T09:00:00'
  },
  // Actividades para propiedad 9 (Ana - activa)
  {
    id: 'act-17',
    tipo: 'lead',
    propiedadId: 9,
    asesorId: 'asesor-1',
    descripcion: 'Nuevo lead: Valeria Ortíz interesada en visita',
    fecha: '2025-01-23T08:45:00'
  },
  {
    id: 'act-18',
    tipo: 'visita',
    propiedadId: 9,
    asesorId: 'asesor-1',
    descripcion: 'Visita programada con Emilio Vargas para el sábado',
    fecha: '2025-01-23T11:30:00'
  },
  // Actividades para propiedad 10 (Ana - en negociación)
  {
    id: 'act-19',
    tipo: 'oferta',
    propiedadId: 10,
    asesorId: 'asesor-1',
    descripcion: 'Oferta de Santiago Reyes: $6,500,000 al contado',
    fecha: '2025-01-24T13:00:00'
  },
  {
    id: 'act-20',
    tipo: 'oferta',
    propiedadId: 10,
    asesorId: 'asesor-1',
    descripcion: 'Segunda oferta de Paulina Méndez: $6,200,000 con crédito',
    fecha: '2025-01-24T10:15:00'
  },
  {
    id: 'act-21',
    tipo: 'nota',
    propiedadId: 10,
    asesorId: 'asesor-1',
    descripcion: 'Propietario evaluando ambas ofertas, decisión esta semana',
    fecha: '2025-01-24T16:00:00'
  },
  {
    id: 'act-22',
    tipo: 'lead',
    propiedadId: 10,
    asesorId: 'asesor-1',
    descripcion: 'Iván Delgado contactado - inversionista serio',
    fecha: '2025-01-23T17:30:00'
  },
  // Otras actividades
  {
    id: 'act-3',
    tipo: 'oferta',
    propiedadId: 3,
    asesorId: 'asesor-2',
    descripcion: 'Nueva oferta recibida: $8,200,000',
    fecha: '2025-01-21T09:15:00'
  }
]

// Función de autenticación simple (en producción usar un sistema real)
export function authenticateUser(email: string, password: string): User | null {
  const user = users.find(u => u.email === email)
  if (!user) return null
  // Prioriza contraseña personalizada si existe; mantiene compatibilidad con la global
  if (user.password) {
    return user.password === password ? user : null
  }
  return password === 'conectia2025' ? user : null
}

// Resolver ID real (UUID de Supabase) al mock ID del asesor usando email
function resolveMockAsesorId(idOrEmail: string, email?: string): string {
  // Si ya es un mock ID (asesor-X), devolverlo
  if (idOrEmail.startsWith('asesor-')) return idOrEmail
  // Buscar por email
  const emailToSearch = email || idOrEmail
  const mockUser = users.find(u => u.email === emailToSearch)
  return mockUser?.id || idOrEmail
}

// Obtener progreso por asesor
export function getProgressByAsesor(asesorId: string, email?: string): PropertyProgress[] {
  const mockId = resolveMockAsesorId(asesorId, email)
  return propertyProgress.filter(p => p.asesorId === mockId)
}

// Obtener leads por asesor
export function getLeadsByAsesor(asesorId: string, email?: string): Lead[] {
  const mockId = resolveMockAsesorId(asesorId, email)
  return leads.filter(l => l.asesorId === mockId)
}

// Obtener actividades por asesor
export function getActivitiesByAsesor(asesorId: string, email?: string): Activity[] {
  const mockId = resolveMockAsesorId(asesorId, email)
  return activities.filter(a => a.asesorId === mockId)
}
