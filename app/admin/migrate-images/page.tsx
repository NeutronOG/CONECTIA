"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { Loader2, CheckCircle, XCircle, SkipForward, ImageIcon } from "lucide-react"

const BUCKET_NAME = 'propiedades'

interface MigrationLog {
  id: number
  titulo: string
  status: 'pending' | 'migrating' | 'success' | 'failed' | 'skipped'
  message?: string
}

export default function MigrateImagesPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<MigrationLog[]>([])
  const [summary, setSummary] = useState<{ success: number; failed: number; skipped: number } | null>(null)

  const uploadBase64ToStorage = async (base64: string, folder: string, propertyId: number): Promise<string | null> => {
    try {
      if (!base64 || !base64.startsWith('data:')) {
        return base64
      }

      const response = await fetch(base64)
      const blob = await response.blob()
      
      const extension = base64.split(';')[0].split('/')[1] || 'jpg'
      const fileName = `${folder}/${propertyId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error(`Error uploading:`, error)
        return null
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error:', error)
      return null
    }
  }

  const migrateProperty = async (property: any): Promise<boolean> => {
    try {
      let updated = false
      let newImageUrl = property.imagen
      let newGaleria = property.galeria || []

      // Migrar imagen principal
      if (property.imagen && property.imagen.startsWith('data:')) {
        const url = await uploadBase64ToStorage(property.imagen, 'principal', property.id)
        if (url) {
          newImageUrl = url
          updated = true
        }
      }

      // Migrar galería
      if (property.galeria && Array.isArray(property.galeria)) {
        const newGaleriaUrls: string[] = []
        
        for (const img of property.galeria) {
          if (img && img.startsWith('data:')) {
            const url = await uploadBase64ToStorage(img, 'galeria', property.id)
            if (url) {
              newGaleriaUrls.push(url)
              updated = true
            }
          } else if (img) {
            newGaleriaUrls.push(img)
          }
        }
        
        newGaleria = newGaleriaUrls
      }

      if (updated) {
        const { error } = await supabase
          .from('propiedades')
          .update({
            imagen: newImageUrl,
            galeria: newGaleria
          })
          .eq('id', property.id)

        if (error) {
          console.error(`Error updating:`, error)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error:', error)
      return false
    }
  }

  const runMigration = async () => {
    setIsRunning(true)
    setLogs([])
    setSummary(null)

    try {
      // Obtener propiedades
      const { data: properties, error } = await supabase
        .from('propiedades')
        .select('id, titulo, imagen, galeria')
        .order('id')

      if (error) {
        alert('Error obteniendo propiedades: ' + error.message)
        setIsRunning(false)
        return
      }

      // Inicializar logs
      const initialLogs: MigrationLog[] = (properties || []).map(p => ({
        id: p.id,
        titulo: p.titulo,
        status: 'pending'
      }))
      setLogs(initialLogs)

      let success = 0
      let failed = 0
      let skipped = 0

      for (let i = 0; i < (properties || []).length; i++) {
        const property = properties![i]
        
        // Verificar si necesita migración
        const needsMigration = 
          (property.imagen && property.imagen.startsWith('data:')) ||
          (property.galeria && property.galeria.some((img: string) => img && img.startsWith('data:')))

        if (!needsMigration) {
          setLogs(prev => prev.map(l => 
            l.id === property.id 
              ? { ...l, status: 'skipped', message: 'Ya migrada' }
              : l
          ))
          skipped++
          continue
        }

        // Actualizar estado a migrando
        setLogs(prev => prev.map(l => 
          l.id === property.id 
            ? { ...l, status: 'migrating', message: 'Subiendo imágenes...' }
            : l
        ))

        const result = await migrateProperty(property)
        
        if (result) {
          setLogs(prev => prev.map(l => 
            l.id === property.id 
              ? { ...l, status: 'success', message: 'Migración completada' }
              : l
          ))
          success++
        } else {
          setLogs(prev => prev.map(l => 
            l.id === property.id 
              ? { ...l, status: 'failed', message: 'Error en migración' }
              : l
          ))
          failed++
        }

        // Pequeña pausa para no saturar
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setSummary({ success, failed, skipped })
    } catch (error) {
      console.error('Error:', error)
      alert('Error durante la migración')
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: MigrationLog['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-5 h-5 rounded-full bg-gray-300" />
      case 'migrating':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'skipped':
        return <SkipForward className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-6 w-6" />
              Migrar Imágenes a Supabase Storage
            </CardTitle>
            <CardDescription>
              Este proceso migrará todas las imágenes base64 existentes a Supabase Storage para mejorar el rendimiento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Importante</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Este proceso puede tardar varios minutos dependiendo de la cantidad de imágenes</li>
                <li>• No cierres esta página mientras se ejecuta</li>
                <li>• Las imágenes ya migradas serán omitidas automáticamente</li>
              </ul>
            </div>

            <Button 
              onClick={runMigration} 
              disabled={isRunning}
              className="w-full bg-conectia-gold hover:bg-conectia-gold/90 text-black"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Migrando...
                </>
              ) : (
                'Iniciar Migración'
              )}
            </Button>

            {summary && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-100 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{summary.success}</div>
                  <div className="text-sm text-green-700">Exitosas</div>
                </div>
                <div className="bg-red-100 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">{summary.failed}</div>
                  <div className="text-sm text-red-700">Fallidas</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-gray-600">{summary.skipped}</div>
                  <div className="text-sm text-gray-700">Omitidas</div>
                </div>
              </div>
            )}

            {logs.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b font-medium">
                  Progreso de Migración
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {logs.map(log => (
                    <div 
                      key={log.id} 
                      className={`flex items-center gap-3 px-4 py-3 border-b last:border-b-0 ${
                        log.status === 'migrating' ? 'bg-blue-50' : ''
                      }`}
                    >
                      {getStatusIcon(log.status)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{log.titulo}</div>
                        <div className="text-xs text-gray-500">ID: {log.id}</div>
                      </div>
                      {log.message && (
                        <div className="text-xs text-gray-500">{log.message}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
