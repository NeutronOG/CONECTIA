'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Building2, Users, TrendingUp, DollarSign, Eye, LogOut, UserCircle, BarChart3, Phone, Mail, Clock, CheckCircle2, Award, Star, Activity, Target, Briefcase, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DesarrollosManager } from '@/components/desarrollos-manager'

const ASESORES = [
  { id:'a1', nombre:'Ana García', email:'ana@conectia.mx', telefono:'+52 477 123 4567', especialidad:'Residencial Premium', propActivas:8, propVendidas:12, leads:42, visitas:28, ofertas:9, ventas:3, cartera:'$24,500,000', comisiones:'$490,000', rating:4.9, ultimaAct:'Hace 2 horas' },
  { id:'a2', nombre:'Roberto Silva', email:'roberto@conectia.mx', telefono:'+52 477 234 5678', especialidad:'Comercial e Industrial', propActivas:5, propVendidas:7, leads:31, visitas:18, ofertas:6, ventas:2, cartera:'$15,200,000', comisiones:'$304,000', rating:4.7, ultimaAct:'Hace 5 horas' },
  { id:'a3', nombre:'María López', email:'maria@conectia.mx', telefono:'+52 477 345 6789', especialidad:'Renta Residencial', propActivas:6, propVendidas:9, leads:27, visitas:15, ofertas:4, ventas:1, cartera:'$18,900,000', comisiones:'$378,000', rating:4.8, ultimaAct:'Hace 1 día' },
  { id:'a4', nombre:'Daniela Belmonte', email:'daniela@conectia.mx', telefono:'+52 477 456 7801', especialidad:'Desarrollos Nuevos', propActivas:4, propVendidas:5, leads:19, visitas:11, ofertas:3, ventas:1, cartera:'$9,800,000', comisiones:'$196,000', rating:4.6, ultimaAct:'Hace 3 horas' },
  { id:'a5', nombre:'Subje Hamue', email:'subje@conectia.mx', telefono:'+52 477 456 7802', especialidad:'Residencial Medio', propActivas:3, propVendidas:4, leads:14, visitas:8, ofertas:2, ventas:0, cartera:'$7,400,000', comisiones:'$148,000', rating:4.5, ultimaAct:'Hace 6 horas' },
]
const PROPIEDADES = [
  { id:1, titulo:'Residencia Argentum', ubicacion:'La Valenciana, León', precio:'$12,398,000', asesor:'Ana García', status:'Disponible', tipo:'Residencia', leads:15, visitas:8 },
  { id:2, titulo:'Preventa Mod. Nogal Villa Valbuena', ubicacion:'Zona Norte, León', precio:'$3,974,610', asesor:'Ana García', status:'Disponible', tipo:'Casa', leads:12, visitas:6 },
  { id:3, titulo:'Casa en La Cañada', ubicacion:'La Cañada, León', precio:'$8,500,000', asesor:'Roberto Silva', status:'En negociación', tipo:'Casa', leads:9, visitas:5 },
  { id:4, titulo:'Penthouse Lomas del Campestre', ubicacion:'Lomas del Campestre, León', precio:'$6,200,000', asesor:'María López', status:'Disponible', tipo:'Penthouse', leads:7, visitas:4 },
  { id:5, titulo:'Local Comercial Torres Landa', ubicacion:'Torres Landa, León', precio:'$4,800,000', asesor:'Roberto Silva', status:'Disponible', tipo:'Local', leads:11, visitas:6 },
  { id:6, titulo:'Casa Jardines del Moral', ubicacion:'Jardines del Moral, León', precio:'$5,100,000', asesor:'Daniela Belmonte', status:'Vendida', tipo:'Casa', leads:22, visitas:14 },
]
const ACTIVIDADES = [
  { id:1, asesor:'Ana García', descripcion:'Nuevo lead: Carlos Ramírez interesado en Residencia Argentum', fecha:'Hace 2 horas', color:'bg-blue-500' },
  { id:2, asesor:'Roberto Silva', descripcion:'Visita realizada en Casa La Cañada con familia Hernández', fecha:'Hace 4 horas', color:'bg-green-500' },
  { id:3, asesor:'Ana García', descripcion:'Oferta recibida $11,800,000 para Residencia Argentum', fecha:'Hace 5 horas', color:'bg-yellow-500' },
  { id:4, asesor:'Daniela Belmonte', descripcion:'¡Venta cerrada! Casa Jardines del Moral — $5,100,000', fecha:'Hace 1 día', color:'bg-purple-500' },
  { id:5, asesor:'María López', descripcion:'Nuevo lead: Sofía Torres interesada en Penthouse Lomas', fecha:'Hace 1 día', color:'bg-blue-500' },
  { id:6, asesor:'Daniela Belmonte', descripcion:'Visita programada Preventa Nogal con inversionista', fecha:'Hace 2 días', color:'bg-green-500' },
  { id:7, asesor:'Subje Hamue', descripcion:'Lead calificado: Inversionista interesado en portafolio', fecha:'Hace 2 días', color:'bg-blue-500' },
  { id:8, asesor:'Roberto Silva', descripcion:'Oferta formal presentada en Local Torres Landa', fecha:'Hace 3 días', color:'bg-yellow-500' },
]
const LEADS = [
  { id:1, nombre:'Carlos Ramírez', email:'carlos.r@email.com', telefono:'+52 477 111 2222', propiedad:'Residencia Argentum', asesor:'Ana García', status:'Calificado', fecha:'Hoy' },
  { id:2, nombre:'Sofía Torres', email:'sofia.t@email.com', telefono:'+52 477 222 3333', propiedad:'Penthouse Lomas', asesor:'María López', status:'Nuevo', fecha:'Hoy' },
  { id:3, nombre:'Familia Hernández', email:'hernandez@email.com', telefono:'+52 477 333 4444', propiedad:'Casa La Cañada', asesor:'Roberto Silva', status:'Contactado', fecha:'Ayer' },
  { id:4, nombre:'Inversionista Anónimo', email:'inv@email.com', telefono:'+52 477 444 5555', propiedad:'Preventa Nogal', asesor:'Daniela Belmonte', status:'Calificado', fecha:'Ayer' },
  { id:5, nombre:'Pedro Gutiérrez', email:'pedro.g@email.com', telefono:'+52 477 555 6666', propiedad:'Local Torres Landa', asesor:'Roberto Silva', status:'Nuevo', fecha:'Hace 2 días' },
  { id:6, nombre:'Lucía Morales', email:'lucia.m@email.com', telefono:'+52 477 666 7777', propiedad:'Residencia Argentum', asesor:'Ana García', status:'Contactado', fecha:'Hace 2 días' },
]
const SC: Record<string,string> = {
  'Nuevo':'bg-blue-100 text-blue-700','Contactado':'bg-yellow-100 text-gray-900',
  'Calificado':'bg-green-100 text-green-700','Disponible':'bg-green-100 text-green-700',
  'En negociación':'bg-yellow-100 text-gray-900','Vendida':'bg-gray-100 text-gray-600',
}
type Tab = 'overview'|'asesores'|'propiedades'|'leads'|'actividad'|'desarrollos'
type Asesor = typeof ASESORES[0]

export default function PanelEmpresaPage() {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Asesor|null>(null)

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || user?.role !== 'empresa') router.push('/login')
  }, [user, isAuthenticated, loading, router])

  if (loading || !user) return null

  const tL = ASESORES.reduce((s,a)=>s+a.leads,0)
  const tV = ASESORES.reduce((s,a)=>s+a.visitas,0)
  const tO = ASESORES.reduce((s,a)=>s+a.ofertas,0)
  const tVt = ASESORES.reduce((s,a)=>s+a.ventas,0)
  const tP = ASESORES.reduce((s,a)=>s+a.propActivas,0)
  const go = (t:Tab) => { setTab(t); setSelected(null) }

  return (
    <div className="min-h-screen bg-[#17313A]">
      <header className="bg-[#17313A] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-conectia-gold flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-5 w-5 text-[#17313A]"/>
            </div>
            <div>
              <p className="font-bold text-sm text-white">{user.nombre}</p>
              <p className="text-xs text-conectia-gold">Panel Empresa · Team Elite</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-conectia-gold text-[#17313A] text-xs px-2 py-0.5 hidden sm:flex items-center gap-1"><Award className="h-3 w-3"/> Team Elite</Badge>
            <Button variant="ghost" size="sm" onClick={()=>{logout();router.push('/')}} className="text-white hover:text-conectia-gold hover:bg-white/10 text-xs">
              <LogOut className="h-4 w-4 mr-1"/> Salir
            </Button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto border-t border-white/10">
          {([['overview','Resumen',BarChart3],['asesores','Asesores',Users],['propiedades','Propiedades',Building2],['leads','Leads',Target],['actividad','Actividad',Activity],['desarrollos','Desarrollos',TrendingUp]] as [Tab,string,any][]).map(([k,l,I])=>(
            <button key={k} onClick={()=>go(k)} className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${tab===k?'border-conectia-gold text-white font-bold':'border-transparent text-white/60 hover:text-white'}`}>
              <I className="h-3.5 w-3.5"/>{l}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {tab==='overview'&&<>
          <div><h2 className="text-2xl font-bold text-gray-900">Resumen del Equipo</h2><p className="text-gray-500 text-sm mt-1">Vista consolidada de todos tus asesores y operaciones</p></div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {([{l:'Asesores Activos',v:ASESORES.length,I:Users,c:'text-blue-600',b:'bg-blue-50'},{l:'Propiedades Activas',v:tP,I:Building2,c:'text-green-600',b:'bg-green-50'},{l:'Leads Totales',v:tL,I:Target,c:'text-yellow-600',b:'bg-yellow-50'},{l:'Ventas del Mes',v:tVt,I:TrendingUp,c:'text-purple-600',b:'bg-purple-50'}] as any[]).map(({l,v,I,c,b})=>(
              <Card key={l} className="border-0 shadow-sm"><CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${b} flex items-center justify-center flex-shrink-0`}><I className={`h-6 w-6 ${c}`}/></div>
                <div><p className="text-2xl font-bold text-gray-900">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
              </CardContent></Card>
            ))}
            <Card className="border-0 shadow-sm col-span-2 lg:col-span-1"><CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-conectia-gold/15 flex items-center justify-center flex-shrink-0"><DollarSign className="h-6 w-6 text-conectia-primary"/></div>
              <div><p className="text-lg font-bold text-green-700">${(ASESORES.reduce((s,a)=>s+parseInt(a.cartera.replace(/[$,]/g,'')),0)/1000000).toFixed(1)}M</p><p className="text-xs text-gray-500">Valor Total Cartera</p></div>
            </CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4 text-conectia-gold"/>Ranking de Asesores</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {[...ASESORES].sort((a,b)=>b.ventas-a.ventas).map((a,i)=>(
                  <div key={a.id} onClick={()=>{setSelected(a);setTab('asesores')}} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i===0?'bg-conectia-gold text-[#17313A]':i===1?'bg-gray-300 text-gray-700':i===2?'bg-amber-600 text-white':'bg-gray-100 text-gray-500'}`}>{i+1}</span>
                    <UserCircle className="h-7 w-7 text-conectia-primary flex-shrink-0"/>
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{a.nombre}</p><p className="text-xs text-gray-500">{a.especialidad}</p></div>
                    <div className="text-right flex-shrink-0"><p className="text-sm font-bold text-green-600">{a.ventas} ventas</p><p className="text-xs text-gray-400">{a.leads} leads</p></div>
                    <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0"/>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-conectia-primary"/>Actividad Reciente</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {ACTIVIDADES.slice(0,6).map(a=>(
                  <div key={a.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.color}`}/>
                    <div><p className="text-sm text-gray-800 leading-snug">{a.descripcion}</p>
                      <div className="flex items-center gap-2 mt-0.5"><span className="text-xs text-conectia-primary font-medium">{a.asesor}</span><span className="text-xs text-gray-400">· {a.fecha}</span></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-conectia-primary"/>Embudo de Ventas del Equipo</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[{l:'Leads',v:tL,p:'100%',c:'bg-blue-500'},{l:'Visitas',v:tV,p:`${Math.round(tV/tL*100)}%`,c:'bg-yellow-500'},{l:'Ofertas',v:tO,p:`${Math.round(tO/tL*100)}%`,c:'bg-orange-500'},{l:'Ventas',v:tVt,p:`${Math.round(tVt/tL*100)}%`,c:'bg-green-500'}].map(({l,v,p,c})=>(
                <div key={l} className="text-center p-4 rounded-xl bg-gray-50">
                  <div className={`w-12 h-12 rounded-full ${c} flex items-center justify-center mx-auto mb-2`}><span className="text-white font-bold text-sm">{p}</span></div>
                  <p className="text-2xl font-bold text-gray-900">{v}</p><p className="text-xs text-gray-500">{l}</p>
                </div>
              ))}
            </div></CardContent>
          </Card>
        </>}

        {tab==='asesores'&&!selected&&<>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div><h2 className="text-2xl font-bold text-gray-900">Equipo de Asesores</h2><p className="text-gray-500 text-sm">{ASESORES.length} asesores activos</p></div>
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/><Input placeholder="Buscar asesor..." className="pl-9" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {ASESORES.filter(a=>a.nombre.toLowerCase().includes(search.toLowerCase())||a.especialidad.toLowerCase().includes(search.toLowerCase())).map(a=>(
              <Card key={a.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={()=>setSelected(a)}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-conectia-primary/10 flex items-center justify-center flex-shrink-0"><UserCircle className="h-8 w-8 text-conectia-primary"/></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{a.nombre}</p>
                      <p className="text-xs text-gray-500">{a.especialidad}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">{[...Array(5)].map((_,i)=><Star key={i} className={`h-3 w-3 ${i<Math.floor(a.rating)?'text-conectia-gold fill-conectia-gold':'text-gray-200'}`}/>)}<span className="text-xs text-gray-500 ml-1">{a.rating}</span></div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0">Activo</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[{l:'Leads',v:a.leads},{l:'Visitas',v:a.visitas},{l:'Ventas',v:a.ventas}].map(({l,v})=>(
                      <div key={l} className="text-center p-2 rounded-lg bg-gray-50"><p className="text-lg font-bold text-gray-900">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
                    ))}
                  </div>
                  {/* Barra progreso ventas */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progreso de ventas</span>
                      <span className="font-semibold text-gray-700">{a.propVendidas} vendidas / {a.propActivas + a.propVendidas} total</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-conectia-gold rounded-full transition-all" style={{width:`${Math.round(a.propVendidas/(a.propActivas+a.propVendidas)*100)}%`}}/>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{a.ultimaAct}</span>
                    <span className="text-conectia-primary font-semibold">{a.propActivas} activas</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>}

        {tab==='asesores'&&selected&&<>
          <Button variant="ghost" size="sm" onClick={()=>setSelected(null)} className="text-gray-500">← Volver al equipo</Button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-conectia-primary/10 flex items-center justify-center mx-auto mb-4"><UserCircle className="h-12 w-12 text-conectia-primary"/></div>
                <h3 className="text-xl font-bold text-gray-900">{selected.nombre}</h3>
                <p className="text-sm text-gray-500 mb-2">{selected.especialidad}</p>
                <div className="flex items-center justify-center gap-0.5 mb-4">{[...Array(5)].map((_,i)=><Star key={i} className={`h-4 w-4 ${i<Math.floor(selected.rating)?'text-conectia-gold fill-conectia-gold':'text-gray-200'}`}/>)}<span className="text-sm font-semibold ml-1">{selected.rating}</span></div>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2 text-gray-600"><Mail className="h-4 w-4 flex-shrink-0"/>{selected.email}</div>
                  <div className="flex items-center gap-2 text-gray-600"><Phone className="h-4 w-4 flex-shrink-0"/>{selected.telefono}</div>
                  <div className="flex items-center gap-2 text-gray-500"><Clock className="h-4 w-4 flex-shrink-0"/>Activo {selected.ultimaAct}</div>
                </div>
              </CardContent>
            </Card>
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {([{l:'Propiedades Activas',v:selected.propActivas,I:Building2,c:'text-blue-600',b:'bg-blue-50'},{l:'Propiedades Vendidas',v:selected.propVendidas,I:CheckCircle2,c:'text-green-600',b:'bg-green-50'},{l:'Leads Totales',v:selected.leads,I:Target,c:'text-yellow-600',b:'bg-yellow-50'},{l:'Visitas',v:selected.visitas,I:Eye,c:'text-purple-600',b:'bg-purple-50'},{l:'Ofertas',v:selected.ofertas,I:DollarSign,c:'text-orange-600',b:'bg-orange-50'},{l:'Ventas Cerradas',v:selected.ventas,I:Award,c:'text-conectia-primary',b:'bg-conectia-primary/10'}] as any[]).map(({l,v,I,c,b})=>(
                  <Card key={l} className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${b} flex items-center justify-center flex-shrink-0`}><I className={`h-5 w-5 ${c}`}/></div>
                    <div><p className="text-xl font-bold text-gray-900">{v}</p><p className="text-xs text-gray-500 leading-tight">{l}</p></div>
                  </CardContent></Card>
                ))}
              </div>
              <Card className="border-0 shadow-sm"><CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm font-semibold text-gray-700">Valor de Cartera</span><span className="text-lg font-bold text-green-600">{selected.cartera}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm font-semibold text-gray-700">Comisiones Generadas</span><span className="text-lg font-bold text-conectia-primary">{selected.comisiones}</span></div>
              </CardContent></Card>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Propiedades Asignadas</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {PROPIEDADES.filter(p=>p.asesor===selected.nombre).map(p=>(
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{p.titulo}</p><p className="text-xs text-gray-500">{p.ubicacion}</p></div>
                      <div className="text-right ml-3 flex-shrink-0"><p className="text-sm font-bold text-green-600">{p.precio}</p><Badge className={`text-xs ${SC[p.status]||'bg-gray-100 text-gray-600'}`}>{p.status}</Badge></div>
                    </div>
                  ))}
                  {PROPIEDADES.filter(p=>p.asesor===selected.nombre).length===0&&<p className="text-sm text-gray-400 text-center py-4">Sin propiedades asignadas</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </>}

        {tab==='propiedades'&&<>
          <div><h2 className="text-2xl font-bold text-gray-900">Propiedades del Equipo</h2><p className="text-gray-500 text-sm">{PROPIEDADES.length} propiedades registradas</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {PROPIEDADES.map(p=>(
              <Card key={p.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0"><p className="font-bold text-gray-900 leading-tight">{p.titulo}</p><p className="text-xs text-gray-500 mt-0.5">{p.ubicacion}</p></div>
                    <Badge className={`text-xs ml-2 flex-shrink-0 ${SC[p.status]||'bg-gray-100 text-gray-600'}`}>{p.status}</Badge>
                  </div>
                  <p className="text-xl font-bold text-green-600 mb-3">{p.precio}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[{l:'Tipo',v:p.tipo},{l:'Leads',v:String(p.leads)},{l:'Visitas',v:String(p.visitas)}].map(({l,v})=>(
                      <div key={l} className="text-center p-2 rounded-lg bg-gray-50"><p className="text-sm font-bold text-gray-900">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <UserCircle className="h-4 w-4 text-conectia-primary flex-shrink-0"/>
                    <span className="text-xs text-gray-600">{p.asesor}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>}

        {tab==='leads'&&<>
          <div><h2 className="text-2xl font-bold text-gray-900">Leads del Equipo</h2><p className="text-gray-500 text-sm">{LEADS.length} leads registrados</p></div>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Nombre','Propiedad','Asesor','Estado','Fecha','Contacto'].map(h=>(
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {LEADS.map(l=>(
                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{l.nombre}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[160px]"><p className="truncate">{l.propiedad}</p></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5"><UserCircle className="h-4 w-4 text-conectia-primary flex-shrink-0"/><span className="text-gray-700">{l.asesor}</span></div>
                      </td>
                      <td className="px-4 py-3"><Badge className={`text-xs ${SC[l.status]||'bg-gray-100 text-gray-600'}`}>{l.status}</Badge></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{l.fecha}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-gray-600 flex items-center gap-1"><Mail className="h-3 w-3"/>{l.email}</span>
                          <span className="text-xs text-gray-600 flex items-center gap-1"><Phone className="h-3 w-3"/>{l.telefono}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {l:'Nuevos',v:LEADS.filter(l=>l.status==='Nuevo').length,c:'bg-blue-100 text-blue-700'},
              {l:'Contactados',v:LEADS.filter(l=>l.status==='Contactado').length,c:'bg-yellow-100 text-yellow-700'},
              {l:'Calificados',v:LEADS.filter(l=>l.status==='Calificado').length,c:'bg-green-100 text-green-700'},
              {l:'Total',v:LEADS.length,c:'bg-gray-100 text-gray-700'},
            ].map(({l,v,c})=>(
              <Card key={l} className="border-0 shadow-sm"><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{v}</p>
                <Badge className={`text-xs mt-1 ${c}`}>{l}</Badge>
              </CardContent></Card>
            ))}
          </div>
        </>}

        {tab==='desarrollos'&&(
          <DesarrollosManager userRole="empresa" />
        )}

        {tab==='actividad'&&<>
          <div><h2 className="text-2xl font-bold text-gray-900">Registro de Actividad</h2><p className="text-gray-500 text-sm">Todas las acciones recientes del equipo</p></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {ACTIVIDADES.map((a,i)=>(
                <Card key={a.id} className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${a.color}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">{a.descripcion}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-conectia-primary font-semibold flex items-center gap-1"><UserCircle className="h-3 w-3"/>{a.asesor}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3"/>{a.fecha}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">#{i+1}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Actividad por Tipo</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {l:'Leads',v:ACTIVIDADES.filter(a=>a.color==='bg-blue-500').length,c:'bg-blue-500'},
                    {l:'Visitas',v:ACTIVIDADES.filter(a=>a.color==='bg-green-500').length,c:'bg-green-500'},
                    {l:'Ofertas',v:ACTIVIDADES.filter(a=>a.color==='bg-yellow-500').length,c:'bg-yellow-500'},
                    {l:'Ventas',v:ACTIVIDADES.filter(a=>a.color==='bg-purple-500').length,c:'bg-purple-500'},
                  ].map(({l,v,c})=>(
                    <div key={l} className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${c}`}/><span className="text-sm text-gray-700">{l}</span></div>
                      <span className="text-sm font-bold text-gray-900">{v}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Asesor más Activo</CardTitle></CardHeader>
                <CardContent>
                  {(()=>{
                    const counts: Record<string,number> = {}
                    ACTIVIDADES.forEach(a=>{counts[a.asesor]=(counts[a.asesor]||0)+1})
                    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]
                    return top ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-conectia-gold/20 flex items-center justify-center"><UserCircle className="h-6 w-6 text-conectia-primary"/></div>
                        <div><p className="font-bold text-gray-900">{top[0]}</p><p className="text-xs text-gray-500">{top[1]} acciones recientes</p></div>
                      </div>
                    ) : null
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        </>}

      </main>
      </div>
    </div>
  )
}
