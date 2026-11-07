'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Camera, UserRound } from 'lucide-react'
import { subirArchivoBroker } from '@/lib/broker-archivos-cliente'

export interface PerfilBroker {
  nombre_completo: string
  cargo: string
  empresa: string
  telefono: string
  whatsapp: string
  correo_contacto: string
  semblanza: string
  foto_url: string | null
}

export const PERFIL_VACIO: PerfilBroker = {
  nombre_completo: '', cargo: '', empresa: '', telefono: '', whatsapp: '', correo_contacto: '', semblanza: '', foto_url: null,
}

const MAX_FOTO_MB = 5
const inputClass = 'w-full rounded-xl bg-[#17313A] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-conectia-gold/50'

const CAMPOS = [
  ['nombre_completo', 'Nombre completo', 'Armando Araiza'],
  ['cargo', 'Cargo', 'Ej: Broker hipotecario'],
  ['empresa', 'Empresa', 'Ej: Ara Brokers'],
  ['telefono', 'Teléfono', '477 000 0000'],
  ['whatsapp', 'WhatsApp', '477 000 0000'],
  ['correo_contacto', 'Correo de contacto', 'nombre@correo.com'],
] as const

export function BrokerPerfil({ perfil, onGuardado }: { perfil: PerfilBroker; onGuardado: (perfil: PerfilBroker) => void }) {
  const [borrador, setBorrador] = useState(perfil)
  const [foto, setFoto] = useState<File | null>(null)
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const elegirFoto = (file: File | undefined) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast.error('Sube la foto en JPG, PNG o WebP'); return }
    if (file.size > MAX_FOTO_MB * 1024 * 1024) { toast.error(`La foto no debe pesar más de ${MAX_FOTO_MB} MB`); return }
    if (vistaPrevia) URL.revokeObjectURL(vistaPrevia)
    setFoto(file)
    setVistaPrevia(URL.createObjectURL(file))
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      const foto_path = foto ? await subirArchivoBroker('/api/broker/perfil', foto) : undefined
      const res = await fetch('/api/broker/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...borrador, foto_path }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFoto(null)
      onGuardado(data.perfil)
      toast.success('Perfil actualizado')
    } catch (error) {
      toast.error(error instanceof Error ? `No se pudo guardar: ${error.message}` : 'No se pudo guardar el perfil')
    } finally {
      setGuardando(false)
    }
  }

  const imagen = vistaPrevia || borrador.foto_url

  return (
    <div className="bg-[#1A3540] rounded-2xl border border-gray-700/60 p-5 sm:p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center gap-5">
        <div className="w-24 h-24 shrink-0 rounded-2xl bg-conectia-gold/15 overflow-hidden flex items-center justify-center">
          {imagen
            ? <img src={imagen} alt="Fotografía de perfil" className="w-full h-full object-cover" />
            : <UserRound className="h-10 w-10 text-conectia-gold dark:text-[#EAE4DD]" />}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Mi perfil profesional</h2>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-200 hover:bg-white/10 focus-within:ring-2 focus-within:ring-conectia-gold/60 transition-colors">
            <Camera className="h-4 w-4" />
            {imagen ? 'Cambiar fotografía' : 'Subir fotografía'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => elegirFoto(e.target.files?.[0])} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAMPOS.map(([campo, etiqueta, placeholder]) => (
          <label key={campo} className="space-y-1.5">
            <span className="text-xs text-gray-400">{etiqueta}</span>
            <input
              value={borrador[campo]}
              onChange={e => setBorrador(prev => ({ ...prev, [campo]: e.target.value }))}
              placeholder={placeholder}
              className={inputClass}
            />
          </label>
        ))}
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs text-gray-400">Semblanza</span>
        <textarea
          rows={4}
          value={borrador.semblanza}
          onChange={e => setBorrador(prev => ({ ...prev, semblanza: e.target.value }))}
          placeholder="Experiencia, bancos con los que trabajas, especialidad..."
          className={inputClass}
        />
      </label>
      <div className="flex justify-end">
        <button type="button" onClick={guardar} disabled={guardando} className="px-5 py-2 rounded-xl text-sm font-semibold bg-conectia-gold dark:bg-white/15 text-white hover:bg-conectia-gold/80 disabled:opacity-50 transition-all">
          {guardando ? 'Guardando...' : 'Guardar perfil'}
        </button>
      </div>
    </div>
  )
}
