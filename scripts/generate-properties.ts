import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function generatePropertiesJSON() {
  try {
    console.log('📥 Fetching properties from Supabase...')
    
    const { data, error } = await supabase
      .from('propiedades')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching properties:', error)
      process.exit(1)
    }

    if (!data || data.length === 0) {
      console.warn('⚠️  No properties found in Supabase')
      // Create empty file anyway
      const emptyData = { properties: [], lastUpdated: new Date().toISOString() }
      const outputPath = path.join(process.cwd(), 'public', 'properties-data.json')
      fs.writeFileSync(outputPath, JSON.stringify(emptyData, null, 2))
      console.log('✅ Created empty properties-data.json')
      return
    }

    // Format data
    const properties = data.map((prop: any) => ({
      id: prop.id,
      titulo: prop.titulo,
      ubicacion: prop.ubicacion,
      precio: prop.precio,
      precioTexto: prop.precio_texto,
      tipo: prop.tipo,
      habitaciones: prop.habitaciones,
      banos: prop.banos,
      area: prop.area,
      areaTexto: prop.area_texto,
      imagen: prop.imagen,
      descripcion: prop.descripcion,
      caracteristicas: prop.caracteristicas,
      status: prop.status,
      categoria: prop.categoria,
      fechaPublicacion: prop.fecha_publicacion,
      tourVirtual: prop.tour_virtual,
      galeria: prop.galeria,
      createdAt: prop.created_at,
      updatedAt: prop.updated_at,
    }))

    const output = {
      properties,
      lastUpdated: new Date().toISOString(),
      count: properties.length,
    }

    // Write to public folder
    const outputPath = path.join(process.cwd(), 'public', 'properties-data.json')
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

    console.log(`✅ Generated properties-data.json with ${properties.length} properties`)
    console.log(`📍 File saved to: ${outputPath}`)
  } catch (error) {
    console.error('Error generating properties JSON:', error)
    process.exit(1)
  }
}

generatePropertiesJSON()
