'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Building2, Trash2, ArrowLeft, AlertTriangle, Save, Home, Diamond, Shield, MapPin, Bed, Bath, Ruler } from 'lucide-react'
import { PropertiesStorage } from '@/lib/properties-storage'
import { SocialShareFormats } from '@/components/social-share-formats'
import { Propiedad } from '@/data/propiedades'
import { toast } from 'sonner'
import { logAudit } from '@/lib/audit-log'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function AdminPropiedadesPage() {
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()
    const [propiedades, setPropiedades] = useState<Propiedad[]>([])
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
    const [asesores, setAsesores] = useState<Array<{ id: string; nombre: string; email: string }>>([])
    const [savingOwnerByPropertyId, setSavingOwnerByPropertyId] = useState<Record<number, boolean>>({})
    const [pendingChanges, setPendingChanges] = useState<Record<number, string | null>>({})

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            router.push('/login')
            return
        }

        loadAsesores()
        loadProperties()
    }, [user, isAuthenticated, router])

    const loadAsesores = async () => {
        try {
            const res = await fetch('/api/admin/asesores')

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                console.error('Error loading asesores via API:', body)
                setAsesores([])
                return
            }

            const body = await res.json()
            setAsesores(Array.isArray(body?.asesores) ? body.asesores : [])
        } catch (error) {
            console.error('Error in loadAsesores:', error)
            setAsesores([])
        }
    }

    const loadProperties = async () => {
        try {
            // Usar API del servidor para bypasear RLS
            const res = await fetch('/api/admin/propiedades')
            
            if (!res.ok) {
                console.error('Error loading properties:', await res.text())
                setPropiedades([])
                return
            }

            const data = await res.json()
            console.log('Propiedades cargadas:', data.propiedades?.length)
            setPropiedades(data.propiedades || [])
        } catch (error) {
            console.error('Error in loadProperties:', error)
            setPropiedades([])
        }
    }

    // Map property usuarioId to asesor id for the Select component
    const getSelectValue = (propiedad: Propiedad) => {
        if (pendingChanges[propiedad.id] !== undefined) {
            return pendingChanges[propiedad.id] || '__unassigned__'
        }
        const uid = propiedad.usuarioId
        if (!uid) return '__unassigned__'
        // If it's already a UUID matching an asesor, use it
        const byId = asesores.find(a => a.id === uid)
        if (byId) return byId.id
        // If it's an email, find the asesor by email
        const byEmail = asesores.find(a => a.email.toLowerCase() === uid.toLowerCase())
        if (byEmail) return byEmail.id
        return '__unassigned__'
    }

    const getAsesorName = (asesorIdOrEmail?: string) => {
        if (!asesorIdOrEmail) return 'Sin asignar'
        const byId = asesores.find(a => a.id === asesorIdOrEmail)
        if (byId) return `${byId.nombre} (${byId.email})`
        const byEmail = asesores.find(a => a.email.toLowerCase() === asesorIdOrEmail.toLowerCase())
        if (byEmail) return `${byEmail.nombre} (${byEmail.email})`
        return asesorIdOrEmail
    }

    const handleReassignOwner = async (propertyId: number, asesorId: string | null) => {
        setSavingOwnerByPropertyId(prev => ({ ...prev, [propertyId]: true }))
        try {
            const asesor = asesorId ? asesores.find(a => a.id === asesorId) : null
            const res = await fetch('/api/admin/fix-orphan-properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId,
                    asesorId: asesorId || null,
                    asesorEmail: asesor?.email || null
                })
            })
            if (!res.ok) {
                const data = await res.json()
                toast.error(data.error || 'No se pudo reasignar el asesor')
                return
            }
            toast.success('Asesor reasignado exitosamente')
            setPendingChanges(prev => { const c = { ...prev }; delete c[propertyId]; return c })
            await loadProperties()
        } catch (error: any) {
            console.error('Error reassigning owner:', error)
            toast.error(error?.message || 'No se pudo reasignar el asesor')
        } finally {
            setSavingOwnerByPropertyId(prev => ({ ...prev, [propertyId]: false }))
        }
    }

    const handleDelete = async (id: number) => {
        console.log('🗑️ Intentando eliminar propiedad ID:', id)
        const propiedad = propiedades.find(p => p.id === id)
        try {
            console.log('Llamando a PropertiesStorage.delete...')
            const result = await PropertiesStorage.delete(id)
            console.log('Resultado de eliminación:', result)

            if (result) {
                toast.success('Propiedad eliminada exitosamente')
                
                // Registrar auditoría
                if (user && propiedad) {
                    logAudit(
                        { id: user.id, email: user.email, nombre: user.nombre || user.email },
                        'propiedad_eliminada',
                        'propiedad',
                        String(id),
                        propiedad.titulo,
                        { 
                            ubicacion: propiedad.ubicacion,
                            precio: propiedad.precioTexto,
                            eliminadoPor: user.email,
                            esAri: user.email === 'ari@conectia.mx'
                        }
                    )
                }
                
                await loadProperties()
                setDeleteConfirm(null)
            } else {
                toast.error('No se pudo eliminar la propiedad. Verifica tus permisos.')
            }
        } catch (error: any) {
            console.error('❌ Error eliminando propiedad:', error)
            console.error('Detalles del error:', error.message)
            toast.error(error.message || 'No se pudo eliminar la propiedad')
        }
    }

    if (!user) return null

    const disponibles = propiedades.filter(p => p.status === 'Disponible').length
    const exclusivas = propiedades.filter(p => p.status === 'Exclusiva').length
    const reservadas = propiedades.filter(p => p.status === 'Reservada').length

    return (
        <div className="min-h-screen bg-[#0F2027] text-[#EAE4DD] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Glow orbs */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#C78F7B]/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#17313A]/60 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={() => router.push('/panel-admin')}
                            className="flex items-center gap-2 text-[#B0ACA6] hover:text-white text-sm font-medium mb-3 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver al Panel
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#C78F7B]/10 flex items-center justify-center border border-[#C78F7B]/20">
                                <Building2 className="w-5 h-5 text-[#C78F7B]" />
                            </div>
                            Gestión de Propiedades
                        </h1>
                        <p className="text-sm text-[#B0ACA6] mt-1">Administra todas las propiedades del sistema</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
                    {[
                        { label: 'Total', value: propiedades.length, accent: '#C78F7B', icon: Building2 },
                        { label: 'Disponibles', value: disponibles, accent: '#22c55e', icon: Home },
                        { label: 'Exclusivas', value: exclusivas, accent: '#f59e0b', icon: Diamond },
                        { label: 'Reservadas', value: reservadas, accent: '#3b82f6', icon: Shield },
                    ].map((stat, i) => (
                        <div key={i} className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[20px] p-5 overflow-hidden hover:border-white/20 transition-all">
                            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none opacity-30" style={{ background: `${stat.accent}20` }} />
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.accent}15` }}>
                                    <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
                            <p className="text-xs text-[#8A8F97] mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Lista de Propiedades */}
                {propiedades.length === 0 ? (
                    <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] p-12 text-center">
                        <Building2 className="h-12 w-12 text-[#4A4F57] mx-auto mb-3" />
                        <p className="text-white font-semibold mb-1">No hay propiedades</p>
                        <p className="text-sm text-[#8A8F97]">No se encontraron propiedades en el sistema</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {propiedades.map((propiedad) => (
                            <div
                                key={propiedad.id}
                                className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden hover:border-white/20 transition-all"
                            >
                                <div className="p-5 sm:p-6">
                                    <div className="flex flex-col lg:flex-row gap-5">
                                        {/* Imagen */}
                                        <div className="w-full lg:w-56 h-48 lg:h-44 rounded-[16px] overflow-hidden flex-shrink-0 border border-white/10">
                                            <img
                                                src={propiedad.imagen}
                                                alt={propiedad.titulo}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Información */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="min-w-0">
                                                    <h3 className="text-lg font-bold text-white truncate">{propiedad.titulo}</h3>
                                                    <div className="flex items-center gap-1.5 text-xs text-[#B0ACA6] mt-1">
                                                        <MapPin className="h-3.5 w-3.5 text-[#C78F7B]" />
                                                        {propiedad.ubicacion}
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
                                                    propiedad.status === 'Disponible' ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : propiedad.status === 'Exclusiva' ? 'bg-[#C78F7B]/10 text-[#C78F7B] border-[#C78F7B]/20'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {propiedad.status}
                                                </span>
                                            </div>

                                            {propiedad.agente && (
                                                <div className="mb-3 text-sm text-[#B0ACA6]">
                                                    <span className="font-medium text-[#8A8F97]">Publicado por:</span>{' '}
                                                    {propiedad.agente.nombre} ({propiedad.agente.email})
                                                </div>
                                            )}

                                            <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <div className="text-xs font-medium text-[#8A8F97] mb-1">
                                                        Asesor asignado
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Select
                                                            value={getSelectValue(propiedad)}
                                                            onValueChange={(val) => {
                                                                const next = val === '__unassigned__' ? null : val
                                                                const currentId = getSelectValue(propiedad) === '__unassigned__' ? null : getSelectValue(propiedad)
                                                                if (next === currentId) {
                                                                    setPendingChanges(prev => {
                                                                        const copy = { ...prev }
                                                                        delete copy[propiedad.id]
                                                                        return copy
                                                                    })
                                                                } else {
                                                                    setPendingChanges(prev => ({ ...prev, [propiedad.id]: next }))
                                                                }
                                                            }}
                                                            disabled={!!savingOwnerByPropertyId[propiedad.id]}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Seleccionar asesor" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="__unassigned__">Sin asignar</SelectItem>
                                                                {asesores.map((a) => (
                                                                    <SelectItem key={a.id} value={a.id}>
                                                                        {a.nombre} ({a.email})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {pendingChanges[propiedad.id] !== undefined && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    void handleReassignOwner(propiedad.id, pendingChanges[propiedad.id])
                                                                }}
                                                                disabled={!!savingOwnerByPropertyId[propiedad.id]}
                                                                className="bg-[#C78F7B] hover:bg-[#D4987E] text-[#17313A] flex-shrink-0"
                                                            >
                                                                <Save className="h-4 w-4 mr-1" />
                                                                {savingOwnerByPropertyId[propiedad.id] ? 'Guardando...' : 'Guardar'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="text-xs font-medium text-[#8A8F97] mb-1">Asesor actual</div>
                                                    <div className="h-10 px-3 flex items-center rounded-md border border-white/10 bg-white/[0.03] text-xs text-gray-300 overflow-hidden">
                                                        {getAsesorName(propiedad.usuarioId)}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-2xl font-bold text-[#C78F7B] mb-3">
                                                {propiedad.precioTexto}
                                            </p>

                                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                                <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-[#C78F7B]" /> {propiedad.habitaciones} hab</span>
                                                <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-[#C78F7B]" /> {propiedad.banos} baños</span>
                                                <span className="flex items-center gap-1.5"><Ruler className="h-4 w-4 text-[#C78F7B]" /> {propiedad.areaTexto}</span>
                                            </div>

                                            {/* Botones de acción */}
                                            <div className="flex gap-2 flex-wrap">
                                                <SocialShareFormats
                                                    property={{
                                                        id: propiedad.id,
                                                        titulo: propiedad.titulo,
                                                        ubicacion: propiedad.ubicacion,
                                                        precioTexto: propiedad.precioTexto,
                                                        tipo: propiedad.tipo,
                                                        imagen: propiedad.imagen,
                                                        descripcion: propiedad.descripcion,
                                                        habitaciones: propiedad.habitaciones,
                                                        banos: propiedad.banos,
                                                        areaTexto: propiedad.areaTexto,
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-[#C78F7B] text-[#EAE4DD] hover:bg-[#C78F7B] hover:text-[#17313A]"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setDeleteConfirm(propiedad.id)}
                                                    className="border-white/10 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar Propiedad
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de confirmación de eliminación */}
                {deleteConfirm !== null && (
                    <div className="fixed inset-0 bg-[#0F2027]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="max-w-md w-full bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                                        <AlertTriangle className="h-6 w-6 text-red-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Confirmar Eliminación</h3>
                                </div>
                                <p className="text-sm text-[#B0ACA6]">
                                    ¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede
                                    deshacer.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
