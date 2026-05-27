import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  MapPin,
  Home,
  Phone,
  Mail,
  Download,
  Upload,
  Star,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-conectia-light-gray">
      {/* Navigation */}
      <nav className="bg-conectia-secondary/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <div className="font-serif text-2xl font-bold text-conectia-graphite">CONECTIA</div>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-conectia-gold text-[#17313A]">
                Propietario Exclusivo
              </Badge>
              <Button variant="outline" size="sm">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-light text-conectia-graphite mb-2">Panel de Control Exclusivo</h1>
          <p className="text-gray-600">Seguimiento en tiempo real de tu propiedad premium</p>
        </div>

        {/* Property Overview */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-6 border-0 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-conectia-graphite mb-2">
                    Penthouse en Polanco IV Sección
                  </h2>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>Polanco, CDMX</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Home className="h-4 w-4" />
                      <span>4 rec • 4 baños • 350 m²</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">Activa</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src="/luxury-penthouse-polanco-main.png"
                      alt="Penthouse Polanco - Vista Principal"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-conectia-gold text-conectia-graphite">
                        <Star className="h-3 w-3 mr-1" />
                        Principal
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <img src="/penthouse-living-room.png" alt="Sala" className="w-full h-16 object-cover rounded" />
                    <img src="/penthouse-kitchen.png" alt="Cocina" className="w-full h-16 object-cover rounded" />
                    <img src="/penthouse-bedroom.png" alt="Recámara" className="w-full h-16 object-cover rounded" />
                    <div className="w-full h-16 bg-conectia-secondary rounded flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-conectia-gold transition-colors cursor-pointer">
                      <Upload className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">4/10 fotos subidas</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Precio Solicitado</p>
                    <p className="font-serif text-2xl font-semibold text-conectia-graphite">$18,500,000 MXN</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Días en el Mercado</p>
                    <p className="text-lg font-semibold">23 días</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Progreso de Venta</p>
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">65% completado</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="font-serif text-lg font-semibold text-conectia-graphite mb-4">Tu Especialista CONECTIA</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-conectia-gold rounded-full flex items-center justify-center">
                  <span className="text-conectia-graphite font-semibold">MR</span>
                </div>
                <div>
                  <p className="font-semibold text-conectia-graphite">María Rodríguez</p>
                  <p className="text-sm text-gray-600">Especialista Senior</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Cita
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-lg">
              <h3 className="font-serif text-lg font-semibold text-conectia-graphite mb-4">Próximas Actividades</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-conectia-light-gray rounded-lg">
                  <Calendar className="h-5 w-5 text-conectia-gold" />
                  <div>
                    <p className="text-sm font-medium">Visita Programada</p>
                    <p className="text-xs text-gray-600">Mañana 11:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-conectia-light-gray rounded-lg">
                  <TrendingUp className="h-5 w-5 text-conectia-gold" />
                  <div>
                    <p className="text-sm font-medium">ánalisis de mercado</p>
                    <p className="text-xs text-gray-600">Viernes 3:00 PM</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-conectia-graphite">Visualizaciones</h3>
              <BarChart3 className="h-5 w-5 text-conectia-gold" />
            </div>
            <div className="h-32 bg-gradient-to-r from-conectia-gold/20 to-conectia-gold/5 rounded-lg flex items-end justify-between p-4">
              <div className="bg-conectia-gold h-16 w-4 rounded-t"></div>
              <div className="bg-conectia-gold h-20 w-4 rounded-t"></div>
              <div className="bg-conectia-gold h-24 w-4 rounded-t"></div>
              <div className="bg-conectia-gold h-28 w-4 rounded-t"></div>
              <div className="bg-conectia-gold h-20 w-4 rounded-t"></div>
              <div className="bg-conectia-gold h-32 w-4 rounded-t"></div>
              <div className="bg-conectia-gold h-24 w-4 rounded-t"></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Últimos 7 días</p>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-conectia-graphite">Interés por Zona</h3>
              <PieChart className="h-5 w-5 text-conectia-gold" />
            </div>
            <div className="h-32 flex items-center justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-8 border-conectia-gold"></div>
                <div className="absolute inset-2 rounded-full border-4 border-conectia-gold/50"></div>
                <div className="absolute inset-4 rounded-full border-2 border-conectia-gold/25"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-conectia-graphite">89%</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Polanco IV Sección</p>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-conectia-graphite">Tendencia de Precio</h3>
              <LineChart className="h-5 w-5 text-conectia-gold" />
            </div>
            <div className="h-32 bg-gradient-to-br from-green-50 to-conectia-gold/10 rounded-lg flex items-end justify-between p-4">
              <div className="w-full h-full relative">
                <svg className="w-full h-full" viewBox="0 0 100 50">
                  <polyline fill="none" stroke="#D4AF37" strokeWidth="2" points="0,40 20,35 40,30 60,25 80,20 100,15" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">+5.2% vs mercado</p>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center border-0 shadow-lg">
            <Eye className="h-8 w-8 text-conectia-gold mx-auto mb-3" />
            <p className="text-2xl font-bold text-conectia-graphite">1,247</p>
            <p className="text-sm text-gray-600">Visualizaciones</p>
            <p className="text-xs text-green-600 mt-1">+12% esta semana</p>
          </Card>
          <Card className="p-6 text-center border-0 shadow-lg">
            <Heart className="h-8 w-8 text-conectia-gold mx-auto mb-3" />
            <p className="text-2xl font-bold text-conectia-graphite">89</p>
            <p className="text-sm text-gray-600">Favoritos</p>
            <p className="text-xs text-green-600 mt-1">+8% esta semana</p>
          </Card>
          <Card className="p-6 text-center border-0 shadow-lg">
            <Users className="h-8 w-8 text-conectia-gold mx-auto mb-3" />
            <p className="text-2xl font-bold text-conectia-graphite">23</p>
            <p className="text-sm text-gray-600">Interesados Calificados</p>
            <p className="text-xs text-green-600 mt-1">+5 nuevos</p>
          </Card>
          <Card className="p-6 text-center border-0 shadow-lg">
            <MessageSquare className="h-8 w-8 text-conectia-gold mx-auto mb-3" />
            <p className="text-2xl font-bold text-conectia-graphite">7</p>
            <p className="text-sm text-gray-600">Consultas Serias</p>
            <p className="text-xs text-green-600 mt-1">3 pendientes</p>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="font-serif text-xl font-semibold text-conectia-graphite mb-6">Actividad Reciente</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-conectia-light-gray rounded-lg">
                <div className="w-2 h-2 bg-conectia-gold rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Nueva consulta de comprador calificado</p>
                  <p className="text-xs text-gray-600">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-conectia-light-gray rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Visita completada - Feedback positivo</p>
                  <p className="text-xs text-gray-600">Ayer 4:30 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-conectia-light-gray rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Actualización de fotos profesionales</p>
                  <p className="text-xs text-gray-600">Hace 3 días</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-conectia-light-gray rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Análisis de mercado actualizado</p>
                  <p className="text-xs text-gray-600">Hace 5 días</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <h3 className="font-serif text-xl font-semibold text-conectia-graphite mb-6">Documentos y Reportes</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Contrato de Exclusividad</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Reporte de Marketing Semanal</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Análisis Comparativo de Mercado</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Estadísticas de Visualizaciones</span>
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 p-4 bg-conectia-gold/10 rounded-lg">
              <h4 className="font-semibold text-conectia-graphite mb-2">Transparencia Total</h4>
              <p className="text-sm text-gray-600">
                Accede a todos los reportes y métricas de tu propiedad. Mantente informado de cada paso del proceso de
                venta.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
