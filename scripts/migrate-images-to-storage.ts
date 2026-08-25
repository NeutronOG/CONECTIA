/**
 * Script para migrar imágenes base64 existentes a Supabase Storage
 * Ejecutar con: npx ts-node scripts/migrate-images-to-storage.ts
 * O desde la página de admin
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const BUCKET_NAME = 'propiedades'

async function uploadBase64ToStorage(base64: string, folder: string, propertyId: number): Promise<string | null> {
  try {
    if (!base64 || !base64.startsWith('data:')) {
      return base64 // Ya es URL o está vacío
    }

    // Convertir base64 a blob
    const response = await fetch(base64)
    const blob = await response.blob()
    
    // Generar nombre único
    const extension = base64.split(';')[0].split('/')[1] || 'jpg'
    const fileName = `${folder}/${propertyId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`

    // Subir a Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error(`Error uploading ${fileName}:`, error)
      return null
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error in uploadBase64ToStorage:', error)
    return null
  }
}

async function migrateProperty(property: any): Promise<boolean> {
  try {
    let updated = false
    let newImageUrl = property.imagen
    let newGaleria = property.galeria

    // Migrar imagen principal
    if (property.imagen && property.imagen.startsWith('data:')) {
      console.log(`  Migrando imagen principal...`)
      const url = await uploadBase64ToStorage(property.imagen, 'principal', property.id)
      if (url) {
        newImageUrl = url
        updated = true
        console.log(`  ✓ Imagen principal migrada`)
      }
    }

    // Migrar galería
    if (property.galeria && Array.isArray(property.galeria)) {
      const base64Images = property.galeria.filter((img: string) => img && img.startsWith('data:'))
      
      if (base64Images.length > 0) {
        console.log(`  Migrando ${base64Images.length} imágenes de galería...`)
        const newGaleriaUrls: string[] = []
        
        for (let i = 0; i < property.galeria.length; i++) {
          const img = property.galeria[i]
          if (img && img.startsWith('data:')) {
            const url = await uploadBase64ToStorage(img, 'galeria', property.id)
            if (url) {
              newGaleriaUrls.push(url)
              console.log(`  ✓ Galería ${i + 1}/${property.galeria.length}`)
            }
          } else if (img) {
            newGaleriaUrls.push(img) // Mantener URLs existentes
          }
        }
        
        newGaleria = newGaleriaUrls
        updated = true
      }
    }

    // Actualizar en la base de datos
    if (updated) {
      const { error } = await supabase
        .from('propiedades')
        .update({
          imagen: newImageUrl,
          galeria: newGaleria
        })
        .eq('id', property.id)

      if (error) {
        console.error(`  ✗ Error actualizando propiedad ${property.id}:`, error)
        return false
      }
      
      console.log(`  ✓ Propiedad ${property.id} actualizada en DB`)
    }

    return true
  } catch (error) {
    console.error(`Error migrando propiedad ${property.id}:`, error)
    return false
  }
}

export async function migrateAllImages(): Promise<{ success: number; failed: number; skipped: number }> {
  console.log('🚀 Iniciando migración de imágenes a Supabase Storage...\n')
  
  // Obtener todas las propiedades
  const { data: properties, error } = await supabase
    .from('propiedades')
    .select('id, titulo, imagen, galeria')
    .order('id')

  if (error) {
    console.error('Error obteniendo propiedades:', error)
    return { success: 0, failed: 0, skipped: 0 }
  }

  let success = 0
  let failed = 0
  let skipped = 0

  for (const property of properties || []) {
    console.log(`\n📦 Procesando: ${property.titulo} (ID: ${property.id})`)
    
    // Verificar si necesita migración
    const needsMigration = 
      (property.imagen && property.imagen.startsWith('data:')) ||
      (property.galeria && property.galeria.some((img: string) => img && img.startsWith('data:')))

    if (!needsMigration) {
      console.log('  ⏭ Ya migrada o sin imágenes base64')
      skipped++
      continue
    }

    const result = await migrateProperty(property)
    if (result) {
      success++
    } else {
      failed++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMEN DE MIGRACIÓN')
  console.log('='.repeat(50))
  console.log(`✅ Exitosas: ${success}`)
  console.log(`❌ Fallidas: ${failed}`)
  console.log(`⏭ Omitidas: ${skipped}`)
  console.log('='.repeat(50))

  return { success, failed, skipped }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateAllImages()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error fatal:', error)
      process.exit(1)
    })
}
