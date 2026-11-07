// Archivos privados de los brokers: formatos, tabuladores y foto de perfil.
export const BROKER_BUCKET = 'broker-recursos'
export const MAX_ARCHIVO_MB = 15

function nombreSeguro(nombre: string) {
  const limpio = nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-')
  return limpio.slice(-80) || 'archivo'
}

const carpetaBroker = (email: string) => email.replace(/[^a-z0-9.-]/g, '_')

// Cada archivo vive bajo la carpeta del broker; la API rechaza rutas de otra carpeta.
export const rutaArchivo = (email: string, carpeta: string, nombre: string) =>
  `${carpetaBroker(email)}/${carpeta}/${Date.now()}-${nombreSeguro(nombre)}`

export const esRutaDelBroker = (email: string, ruta: string) => ruta.startsWith(`${carpetaBroker(email)}/`) && !ruta.includes('..')
