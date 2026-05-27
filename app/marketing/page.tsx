"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Video, Target, Brain, Camera, Languages } from "lucide-react"

export default function MarketingPage() {
  const [selectedCampaign, setSelectedCampaign] = useState("")
  const [aiInsights, setAiInsights] = useState(false)

  const campaigns = [
    {
      id: "1",
      name: "Luxury Condos Madrid",
      platform: "Meta Ads",
      status: "active",
      budget: "€5,000",
      performance: 85,
    },
    {
      id: "2",
      name: "Premium Villas Barcelona",
      platform: "Google Ads",
      status: "active",
      budget: "€8,000",
      performance: 92,
    },
    {
      id: "3",
      name: "International Properties",
      platform: "LinkedIn",
      status: "paused",
      budget: "€3,000",
      performance: 67,
    },
  ]

  const marketInsights = [
    { zone: "Salamanca, Madrid", demand: "Alta", prediction: "+15%", confidence: 94 },
    { zone: "Eixample, Barcelona", demand: "Media-Alta", prediction: "+8%", confidence: 87 },
    { zone: "Centro, Valencia", demand: "Emergente", prediction: "+22%", confidence: 91 },
  ]

  return (
    <div className="min-h-screen bg-[#17313A]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-gray-900 mb-2">Marketing Intelligence</h1>
          <p className="text-gray-600">Gestión avanzada de campañas y análisis predictivo</p>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Campañas</TabsTrigger>
            <TabsTrigger value="insights">IA Insights</TabsTrigger>
            <TabsTrigger value="tours">Tours Virtuales</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-yellow-600" />
                    Campañas Activas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">
                            {campaign.platform} • {campaign.budget}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{campaign.performance}%</p>
                            <Progress value={campaign.performance} className="w-20" />
                          </div>
                          <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nueva Campaña</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-name">Nombre de Campaña</Label>
                    <Input id="campaign-name" placeholder="Ej: Luxury Penthouses..." />
                  </div>
                  <div>
                    <Label htmlFor="platform">Plataforma</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plataforma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meta">Meta Ads</SelectItem>
                        <SelectItem value="google">Google Ads</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget">Presupuesto</Label>
                    <Input id="budget" placeholder="€5,000" />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" placeholder="Describe tu campaña..." />
                  </div>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">Crear Campaña</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-yellow-600" />
                    Predicción de Demanda IA
                  </CardTitle>
                  <CardDescription>Análisis predictivo basado en datos de mercado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketInsights.map((insight, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{insight.zone}</h3>
                          <Badge variant="outline">{insight.demand}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Predicción 6 meses:</span>
                          <span className="font-semibold text-green-600">{insight.prediction}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Confianza:</span>
                          <span className="text-sm font-medium">{insight.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                    Tendencias de Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-800">Oportunidad Detectada</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Incremento del 25% en búsquedas de propiedades de lujo en Chamberí
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-800">Tendencia Internacional</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Aumento de interés de compradores franceses en propiedades españolas
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h3 className="font-semibold text-yellow-800">Recomendación IA</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Enfocar marketing en propiedades con terrazas y espacios exteriores
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Virtual Tours Tab */}
          <TabsContent value="tours" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-yellow-600" />
                    Tours Virtuales 360°
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-conectia-secondary rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Vista previa del tour virtual</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property-select">Seleccionar Propiedad</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Elegir propiedad..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prop1">Penthouse Salamanca - Madrid</SelectItem>
                        <SelectItem value="prop2">Villa Moderna - Barcelona</SelectItem>
                        <SelectItem value="prop3">Apartamento Centro - Valencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">Crear Tour Virtual</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-yellow-600" />
                    Traducción Automática
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="source-text">Texto Original (Español)</Label>
                    <Textarea
                      id="source-text"
                      placeholder="Introduce el texto de la descripción de la propiedad..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="target-language">Idioma Destino</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">Inglés</SelectItem>
                        <SelectItem value="fr">Francés</SelectItem>
                        <SelectItem value="de">Alemán</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                        <SelectItem value="pt">Portugués</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">Traducir Contenido</Button>
                  <div className="p-4 bg-conectia-secondary/70 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700">Traducción:</Label>
                    <p className="text-sm text-gray-600 mt-1">La traducción aparecerá aquí...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Impresiones Totales</p>
                      <p className="text-2xl font-bold text-gray-900">2.4M</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-yellow-600" />
                  </div>
                  <p className="text-sm text-green-600 mt-2">+12% vs mes anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Leads Generados</p>
                      <p className="text-2xl font-bold text-gray-900">847</p>
                    </div>
                    <Target className="h-8 w-8 text-yellow-600" />
                  </div>
                  <p className="text-sm text-green-600 mt-2">+8% vs mes anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Conversión</p>
                      <p className="text-2xl font-bold text-gray-900">3.2%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-yellow-600" />
                  </div>
                  <p className="text-sm text-green-600 mt-2">+0.5% vs mes anterior</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Campaña</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.platform}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">CTR</p>
                          <p className="font-semibold">2.4%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">CPC</p>
                          <p className="font-semibold">€1.20</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Conversiones</p>
                          <p className="font-semibold">127</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
