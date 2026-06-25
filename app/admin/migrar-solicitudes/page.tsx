'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertCircle, Home } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function MigrarSolicitudesPage() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const router = useRouter()

  const handleMigrar = async () => {
    setLoading(true)
    setResultado(null)
    try {
      const res = await fetch('/api/migrar-solicitudes-completadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      setResultado(data)
      if (res.ok) {
        toast.success(data.mensaje || 'Migración completada')
      } else {
        toast.error(data.error || 'Error en la migración')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al ejecutar migración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F2027] text-[#EAE4DD] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#C78F7B]/20 flex items-center justify-center">
            <Home className="h-6 w-6 text-[#C78F7B]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Migrar Solicitudes Completadas</h1>
            <p className="text-sm text-[#B0ACA6]">
              Convierte automáticamente las solicitudes marcadas como "Completada" en propiedades públicas
            </p>
          </div>
        </div>

        <Card className="bg-[#17313A]/50 border-[#EAE4DD]/10 mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-[#EAE4DD]">¿Qué hace esta herramienta?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#B0ACA6] space-y-2">
            <p>
              Busca todas las solicitudes de fotografía con status <strong>Completada</strong> que aún no tienen una propiedad vinculada (<code>propiedad_id</code> vacío) y las migra a la tabla de propiedades públicas.
            </p>
            <p>
              Esto es útil para corregir solicitudes que quedaron atoradas por el error anterior.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleMigrar}
            disabled={loading}
            className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#0F2027] font-bold px-6"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Migrando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Ejecutar Migración
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/panel-fotografo')}
            className="border-[#EAE4DD]/20 text-[#EAE4DD] hover:bg-[#EAE4DD]/10"
          >
            Volver al Panel
          </Button>
        </div>

        {resultado && (
          <Card className={`border ${resultado.errores > 0 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${resultado.errores > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                {resultado.errores > 0 ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                {resultado.mensaje}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-[#17313A]/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#EAE4DD]">{resultado.total_solicitudes || 0}</p>
                  <p className="text-xs text-[#B0ACA6]">Solicitudes encontradas</p>
                </div>
                <div className="bg-[#17313A]/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{resultado.migradas || 0}</p>
                  <p className="text-xs text-[#B0ACA6]">Propiedades creadas</p>
                </div>
                <div className="bg-[#17313A]/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{resultado.errores || 0}</p>
                  <p className="text-xs text-[#B0ACA6]">Errores</p>
                </div>
              </div>

              {resultado.detalles && resultado.detalles.length > 0 && (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {resultado.detalles.map((detalle: any, idx: number) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        detalle.exito ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#EAE4DD] truncate">
                          {detalle.titulo}
                        </p>
                        <p className="text-xs text-[#B0ACA6]">
                          Solicitud: {detalle.solicitud_id}
                          {detalle.propiedad_id && ` → Propiedad: ${detalle.propiedad_id}`}
                        </p>
                        {detalle.error && (
                          <p className="text-xs text-red-400 mt-1">{detalle.error}</p>
                        )}
                      </div>
                      {detalle.exito ? (
                        <CheckCircle className="h-5 w-5 text-green-400 ml-3" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-400 ml-3" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
