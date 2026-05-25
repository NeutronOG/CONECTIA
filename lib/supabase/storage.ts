import { createClient } from '@supabase/supabase-js'

const BUCKET_NAME = 'propiedades'

// Crear cliente temporal para storage (evita problemas de múltiples instancias)
const getStorageClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

export interface UploadResult {
  url: string
  path: string
  error?: string
}

/**
 * Sube una imagen a Supabase Storage
 * @param file - Archivo o string base64
 * @param folder - Carpeta dentro del bucket (ej: 'principal', 'galeria')
 * @returns URL pública de la imagen
 */
export async function uploadImage(
  file: File | string,
  folder: string = 'images'
): Promise<UploadResult> {
  try {
    let fileToUpload: File
    let fileName: string

    // Si es base64, convertir a File
    if (typeof file === 'string') {
      // Si ya es una URL, retornarla directamente
      if (file.startsWith('http')) {
        return { url: file, path: file }
      }
      
      // Si es base64, convertir a blob
      if (file.startsWith('data:')) {
        const response = await fetch(file)
        const blob = await response.blob()
        const extension = file.split(';')[0].split('/')[1] || 'jpg'
        fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
        fileToUpload = new File([blob], fileName, { type: blob.type })
      } else {
        return { url: file, path: file, error: 'Formato de imagen no válido' }
      }
    } else {
      fileToUpload = file
      const extension = file.name.split('.').pop() || 'jpg'
      fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
    }

    const filePath = `${folder}/${fileName}`
    const client = getStorageClient()

    // Subir archivo
    const { data, error } = await client.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading image:', error)
      return { url: '', path: '', error: error.message }
    }

    // Obtener URL pública
    const { data: urlData } = client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      url: urlData.publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Error in uploadImage:', error)
    return { url: '', path: '', error: 'Error al subir imagen' }
  }
}

/**
 * Sube múltiples imágenes a Supabase Storage
 * @param files - Array de archivos o strings base64
 * @param folder - Carpeta dentro del bucket
 * @returns Array de URLs públicas
 */
export async function uploadMultipleImages(
  files: (File | string)[],
  folder: string = 'galeria'
): Promise<string[]> {
  const results = await Promise.all(
    files.map(file => uploadImage(file, folder))
  )
  
  return results
    .filter(r => r.url && !r.error)
    .map(r => r.url)
}

/**
 * Elimina una imagen de Supabase Storage
 * @param path - Ruta del archivo en el bucket
 */
export async function deleteImage(path: string): Promise<boolean> {
  try {
    // Si es una URL completa, extraer el path
    if (path.includes(BUCKET_NAME)) {
      const parts = path.split(`${BUCKET_NAME}/`)
      path = parts[parts.length - 1]
    }

    const client = getStorageClient()
    const { error } = await client.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      console.error('Error deleting image:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteImage:', error)
    return false
  }
}

/**
 * Verifica si una imagen es base64
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith('data:image')
}

/**
 * Obtiene la URL del bucket de Supabase Storage
 */
export function getStorageUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}`
}
