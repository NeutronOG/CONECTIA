import { supabase } from '@/lib/supabase/client'
import { BROKER_BUCKET } from '@/lib/broker-archivos'

// Pide una URL firmada al endpoint y sube el archivo directo al bucket privado.
export async function subirArchivoBroker(endpoint: string, archivo: File) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upload-url', fileName: archivo.name }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)

  const { error } = await supabase.storage
    .from(BROKER_BUCKET)
    .uploadToSignedUrl(data.path, data.token, archivo, { contentType: archivo.type })
  if (error) throw new Error(error.message)
  return data.path as string
}
