export interface LegalDocument {
  slug: string
  title: string
  shortTitle: string
  description: string
  file: string
  category: 'privacidad' | 'uso' | 'seguridad' | 'tecnologia'
  updatedAt: string
}

export const LEGAL_LAST_UPDATED = '25 de agosto de 2026'

export const legalDocuments: LegalDocument[] = [
  {
    slug: 'aviso-privacidad-integral',
    title: 'Aviso de Privacidad Integral',
    shortTitle: 'Privacidad integral',
    description: 'Información completa sobre los datos personales que recabamos, sus finalidades, transferencias y el ejercicio de derechos ARCO.',
    file: 'legal-aviso-privacidad-integral.txt',
    category: 'privacidad',
    updatedAt: LEGAL_LAST_UPDATED,
  },
  {
    slug: 'aviso-privacidad-simplificado',
    title: 'Aviso de Privacidad Simplificado',
    shortTitle: 'Aviso simplificado',
    description: 'Resumen de las categorías de datos, finalidades principales y derechos de las personas titulares.',
    file: 'legal-aviso-privacidad-simplificado.txt',
    category: 'privacidad',
    updatedAt: LEGAL_LAST_UPDATED,
  },
  {
    slug: 'proteccion-datos-personales',
    title: 'Política de Protección de Datos Personales',
    shortTitle: 'Protección de datos',
    description: 'Principios, responsabilidades, medidas de seguridad y gobierno interno aplicables al ciclo de vida de los datos personales.',
    file: 'legal-proteccion-datos.txt',
    category: 'privacidad',
    updatedAt: LEGAL_LAST_UPDATED,
  },
  {
    slug: 'terminos-condiciones',
    title: 'Términos y Condiciones de Uso',
    shortTitle: 'Términos y condiciones',
    description: 'Reglas que regulan el acceso, registro, navegación, contratación y uso de los servicios del ecosistema CONECTIA.',
    file: 'legal-terminos-condiciones.txt',
    category: 'uso',
    updatedAt: LEGAL_LAST_UPDATED,
  },
  {
    slug: 'reglamento-usuarios',
    title: 'Reglamento de Usuarios',
    shortTitle: 'Reglamento de usuarios',
    description: 'Derechos, obligaciones, normas de conducta y medidas aplicables a quienes utilizan la plataforma.',
    file: 'legal-reglamento-usuarios.txt',
    category: 'uso',
    updatedAt: LEGAL_LAST_UPDATED,
  },
  {
    slug: 'publicacion-inmuebles',
    title: 'Política de Publicación de Inmuebles',
    shortTitle: 'Publicación de inmuebles',
    description: 'Requisitos de veracidad, documentación, actualización y responsabilidad para publicar propiedades.',
    file: 'legal-publicacion-inmuebles.txt',
    category: 'uso',
    updatedAt: LEGAL_LAST_UPDATED,
  },
  {
    slug: 'politica-antifraude',
    title: 'Política Antifraude',
    shortTitle: 'Política antifraude',
    description: 'Medidas de prevención, detección, investigación y respuesta ante fraude, suplantación y operaciones ilícitas.',
    file: 'legal-politica-antifraude.txt',
    category: 'seguridad',
    updatedAt: LEGAL_LAST_UPDATED,
  },
  {
    slug: 'politica-cookies',
    title: 'Política de Cookies',
    shortTitle: 'Política de cookies',
    description: 'Tipos de cookies y tecnologías similares, finalidades, proveedores y opciones para administrar el consentimiento.',
    file: 'legal-politica-cookies.txt',
    category: 'tecnologia',
    updatedAt: LEGAL_LAST_UPDATED,
  },
  {
    slug: 'uso-responsable-ia',
    title: 'Política de Uso Responsable de la Inteligencia Artificial',
    shortTitle: 'Uso responsable de IA',
    description: 'Principios, usos autorizados, prohibiciones y responsabilidades para utilizar herramientas de IA de forma segura.',
    file: 'legal-uso-ia.txt',
    category: 'tecnologia',
    updatedAt: LEGAL_LAST_UPDATED,
  },
]

export function getLegalDocument(slug: string): LegalDocument | undefined {
  return legalDocuments.find((document) => document.slug === slug)
}
