'use client'

import { useState, type ReactNode } from 'react'
import { ClipboardList, FileWarning, Plus, Trash2, Users, Wrench } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { fechaHoy, leerPrevia, pesos, resumenPrevia, type PreviaAutorizacion } from '@/lib/broker-previa'

const campoClass = 'w-full min-w-0 rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-sm text-white placeholder:text-gray-500 focus:border-conectia-gold/60 focus:outline-none [color-scheme:dark]'
const etiquetaClass = 'text-[11px] text-gray-400'

interface Props {
  nombre: string
  guardada: Partial<PreviaAutorizacion> | null | undefined
  onCerrar: () => void
  onGuardar: (previa: PreviaAutorizacion) => void
}

// Las filas sin dato principal se descartan al guardar.
const depurar = (previa: PreviaAutorizacion): PreviaAutorizacion => ({
  ...previa,
  observaciones: previa.observaciones.trim(),
  ingreso_titular: previa.ingreso_titular.trim(),
  coacreditados: previa.coacreditados.filter(c => c.nombre.trim()),
  faltantes: previa.faltantes.filter(f => f.documento.trim()),
  subsanaciones: previa.subsanaciones.filter(s => s.detalle.trim()),
})

export function BrokerPreviaAutorizacion({ nombre, guardada, onCerrar, onGuardar }: Props) {
  const [previa, setPrevia] = useState(() => leerPrevia(guardada))
  const resumen = resumenPrevia(previa)

  const cambiarFila = <K extends 'coacreditados' | 'faltantes' | 'subsanaciones'>(
    lista: K, id: string, cambios: Partial<PreviaAutorizacion[K][number]>,
  ) => setPrevia(prev => ({ ...prev, [lista]: prev[lista].map(fila => fila.id === id ? { ...fila, ...cambios } : fila) }))

  const quitarFila = (lista: 'coacreditados' | 'faltantes' | 'subsanaciones', id: string) =>
    setPrevia(prev => ({ ...prev, [lista]: prev[lista].filter(fila => fila.id !== id) }))

  return (
    <Sheet open onOpenChange={abierto => { if (!abierto) onCerrar() }}>
      {/* El portal queda fuera de PanelShell: dashboard-shell adapta los colores al tema */}
      <SheetContent className="dashboard-shell w-full sm:max-w-2xl gap-0 border-gray-700/60 bg-[#F6F2EE] dark:bg-[#17313A]">
        <SheetHeader className="border-b border-gray-700/60 pr-12">
          <SheetTitle className="text-white">Previa a la autorización</SheetTitle>
          <SheetDescription className="text-gray-400">{nombre}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <Seccion icono={Users} titulo="Capacidad de pago y coacreditados" onAgregar={() => setPrevia(prev => ({
            ...prev,
            coacreditados: [...prev.coacreditados, { id: crypto.randomUUID(), nombre: '', relacion: '', ingreso_mensual: '', fuente_ingreso: '' }],
          }))} agregar="Agregar coacreditado">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className={etiquetaClass}>Ingreso mensual del titular</span>
                <input
                  value={previa.ingreso_titular}
                  onChange={e => setPrevia(prev => ({ ...prev, ingreso_titular: e.target.value }))}
                  placeholder="$0"
                  className={campoClass}
                />
              </label>
              <div className="rounded-lg bg-conectia-gold/10 px-3 py-2">
                <p className={etiquetaClass}>Ingreso conjunto</p>
                <p className="text-lg font-bold text-conectia-gold dark:text-[#EAE4DD]">{pesos(resumen.ingresoConjunto)}</p>
              </div>
            </div>
            {previa.coacreditados.map(coacreditado => (
              <Fila key={coacreditado.id} etiqueta={`Quitar a ${coacreditado.nombre || 'coacreditado'}`} onQuitar={() => quitarFila('coacreditados', coacreditado.id)}>
                <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 gap-2">
                  <input aria-label="Nombre del coacreditado" placeholder="Nombre" value={coacreditado.nombre} onChange={e => cambiarFila('coacreditados', coacreditado.id, { nombre: e.target.value })} className={campoClass} />
                  <input aria-label="Relación con el titular" placeholder="Relación (cónyuge, familiar...)" value={coacreditado.relacion} onChange={e => cambiarFila('coacreditados', coacreditado.id, { relacion: e.target.value })} className={campoClass} />
                  <input aria-label="Ingreso mensual del coacreditado" placeholder="Ingreso mensual" value={coacreditado.ingreso_mensual} onChange={e => cambiarFila('coacreditados', coacreditado.id, { ingreso_mensual: e.target.value })} className={campoClass} />
                  <input aria-label="Fuente de ingreso" placeholder="Fuente (nómina, negocio...)" value={coacreditado.fuente_ingreso} onChange={e => cambiarFila('coacreditados', coacreditado.id, { fuente_ingreso: e.target.value })} className={campoClass} />
                </div>
              </Fila>
            ))}
          </Seccion>

          <Seccion icono={FileWarning} titulo="Documentación faltante" contador={resumen.faltantes} onAgregar={() => setPrevia(prev => ({
            ...prev,
            faltantes: [...prev.faltantes, { id: crypto.randomUUID(), documento: '', solicitado: fechaHoy(), recibido: '' }],
          }))} agregar="Agregar documento">
            {previa.faltantes.map(faltante => (
              <Fila key={faltante.id} etiqueta={`Quitar ${faltante.documento || 'documento'}`} onQuitar={() => quitarFila('faltantes', faltante.id)}>
                <Atendida
                  marcada={Boolean(faltante.recibido)}
                  etiqueta={`Marcar ${faltante.documento || 'documento'} como recibido`}
                  onCambio={marcada => cambiarFila('faltantes', faltante.id, { recibido: marcada ? fechaHoy() : '' })}
                />
                <input aria-label="Documento faltante" placeholder="Documento" value={faltante.documento} onChange={e => cambiarFila('faltantes', faltante.id, { documento: e.target.value })} className={`${campoClass} flex-1 ${faltante.recibido ? 'line-through opacity-60' : ''}`} />
                <input aria-label="Fecha de solicitud" type="date" value={faltante.solicitado} onChange={e => cambiarFila('faltantes', faltante.id, { solicitado: e.target.value })} className={`${campoClass} sm:w-36 sm:flex-none`} />
              </Fila>
            ))}
          </Seccion>

          <Seccion icono={Wrench} titulo="Subsanaciones" contador={resumen.subsanaciones} onAgregar={() => setPrevia(prev => ({
            ...prev,
            subsanaciones: [...prev.subsanaciones, { id: crypto.randomUUID(), detalle: '', fecha_limite: '', resuelta: '' }],
          }))} agregar="Agregar subsanación">
            {previa.subsanaciones.map(subsanacion => (
              <Fila key={subsanacion.id} etiqueta={`Quitar ${subsanacion.detalle || 'subsanación'}`} onQuitar={() => quitarFila('subsanaciones', subsanacion.id)}>
                <Atendida
                  marcada={Boolean(subsanacion.resuelta)}
                  etiqueta={`Marcar ${subsanacion.detalle || 'subsanación'} como resuelta`}
                  onCambio={marcada => cambiarFila('subsanaciones', subsanacion.id, { resuelta: marcada ? fechaHoy() : '' })}
                />
                <input aria-label="Qué se debe subsanar" placeholder="Qué pidió corregir el banco" value={subsanacion.detalle} onChange={e => cambiarFila('subsanaciones', subsanacion.id, { detalle: e.target.value })} className={`${campoClass} flex-1 ${subsanacion.resuelta ? 'line-through opacity-60' : ''}`} />
                <input aria-label="Fecha límite" type="date" value={subsanacion.fecha_limite} onChange={e => cambiarFila('subsanaciones', subsanacion.id, { fecha_limite: e.target.value })} className={`${campoClass} sm:w-36 sm:flex-none`} />
              </Fila>
            ))}
          </Seccion>

          <Seccion icono={ClipboardList} titulo="Observaciones">
            <textarea
              rows={4}
              aria-label="Observaciones"
              value={previa.observaciones}
              onChange={e => setPrevia(prev => ({ ...prev, observaciones: e.target.value }))}
              placeholder="Acuerdos con el banco, situación del cliente, próximos pasos..."
              className={campoClass}
            />
          </Seccion>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-700/60 p-4">
          <button type="button" onClick={onCerrar} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 transition-colors hover:bg-white/10">
            Cancelar
          </button>
          <button type="button" onClick={() => onGuardar(depurar(previa))} className="rounded-xl bg-conectia-gold dark:bg-white/15 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-conectia-gold/80">
            Guardar
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Seccion({ icono: Icono, titulo, contador, agregar, onAgregar, children }: {
  icono: typeof Users
  titulo: string
  contador?: number
  agregar?: string
  onAgregar?: () => void
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <Icono className="h-4 w-4 text-conectia-gold dark:text-[#EAE4DD]" />
          {titulo}
          {Boolean(contador) && <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[11px] font-semibold text-orange-400">{contador} abierto{contador === 1 ? '' : 's'}</span>}
        </h3>
        {onAgregar && (
          <button type="button" onClick={onAgregar} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-conectia-gold dark:text-[#EAE4DD] transition-colors hover:bg-conectia-gold/10">
            <Plus className="h-3.5 w-3.5" /> {agregar}
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function Fila({ etiqueta, onQuitar, children }: { etiqueta: string; onQuitar: () => void; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap [&>input[type=text]]:min-w-[60%]">
      {children}
      <button type="button" onClick={onQuitar} aria-label={etiqueta} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function Atendida({ marcada, etiqueta, onCambio }: { marcada: boolean; etiqueta: string; onCambio: (marcada: boolean) => void }) {
  return (
    <input
      type="checkbox"
      checked={marcada}
      aria-label={etiqueta}
      onChange={e => onCambio(e.target.checked)}
      className="mt-2.5 h-4 w-4 shrink-0 accent-[#16a34a]"
    />
  )
}
