// Cargar variables de entorno desde .env.local
import { config } from 'dotenv'
import { join } from 'path'
config({ path: join(process.cwd(), '.env.local') })

import { supabaseAdmin } from '../lib/supabase/server'
import { propiedades } from '../data/propiedades'

async function seedDatabase() {
    console.log('🌱 Iniciando migración de datos a Supabase...')

    try {
        // 1. Insertar agentes únicos
        console.log('📝 Insertando agentes...')
        const agentesUnicos = new Map()

        propiedades.forEach(prop => {
            if (prop.agente && !agentesUnicos.has(prop.agente.email)) {
                agentesUnicos.set(prop.agente.email, prop.agente)
            }
        })

        const agentesData = Array.from(agentesUnicos.values()).map(agente => ({
            nombre: agente.nombre,
            especialidad: agente.especialidad,
            rating: agente.rating,
            ventas: agente.ventas,
            telefono: agente.telefono,
            email: agente.email,
        }))

        const { data: agentesInsertados, error: errorAgentes } = await supabaseAdmin
            .from('agentes')
            .upsert(agentesData, { onConflict: 'email' })
            .select()

        if (errorAgentes) {
            console.error('❌ Error insertando agentes:', errorAgentes)
            throw errorAgentes
        }
        console.log(`✅ ${agentesInsertados?.length || 0} agentes insertados`)

        // 2. Insertar propiedades
        console.log('🏠 Insertando propiedades...')
        const propiedadesData = propiedades.map(prop => ({
            id: prop.id,
            titulo: prop.titulo,
            ubicacion: prop.ubicacion,
            precio: prop.precio,
            precio_texto: prop.precioTexto,
            tipo: prop.tipo,
            habitaciones: prop.habitaciones,
            banos: prop.banos,
            area: prop.area,
            area_texto: prop.areaTexto,
            imagen: prop.imagen,
            descripcion: prop.descripcion,
            caracteristicas: prop.caracteristicas,
            status: prop.status,
            categoria: prop.categoria,
            fecha_publicacion: prop.fechaPublicacion,
            tour_virtual: prop.tourVirtual,
            galeria: prop.galeria || [],
        }))

        const { data: propiedadesInsertadas, error: errorPropiedades } = await supabaseAdmin
            .from('propiedades')
            .upsert(propiedadesData, { onConflict: 'id' })
            .select()

        if (errorPropiedades) {
            console.error('❌ Error insertando propiedades:', errorPropiedades)
            throw errorPropiedades
        }
        console.log(`✅ ${propiedadesInsertadas?.length || 0} propiedades insertadas`)

        // 3. Crear relaciones propiedad-agente
        console.log('🔗 Creando relaciones propiedad-agente...')
        const relaciones = []

        for (const prop of propiedades) {
            if (prop.agente) {
                const agente = agentesInsertados?.find(a => a.email === prop.agente!.email)
                if (agente) {
                    relaciones.push({
                        propiedad_id: prop.id,
                        agente_id: agente.id,
                    })
                }
            }
        }

        if (relaciones.length > 0) {
            const { error: errorRelaciones } = await supabaseAdmin
                .from('propiedad_agente')
                .upsert(relaciones, { onConflict: 'propiedad_id,agente_id' })

            if (errorRelaciones) {
                console.error('❌ Error creando relaciones:', errorRelaciones)
                throw errorRelaciones
            }
            console.log(`✅ ${relaciones.length} relaciones creadas`)
        }

        // 4. Insertar detalles de propiedades
        console.log('📋 Insertando detalles de propiedades...')
        const detallesData = propiedades
            .filter(prop => prop.detalles)
            .map(prop => ({
                propiedad_id: prop.id,
                tipo_propiedad: prop.detalles!.tipoPropiedad,
                area_terreno: prop.detalles!.areaTerreno,
                antiguedad: prop.detalles!.antiguedad,
                vistas: prop.detalles!.vistas,
                favoritos: prop.detalles!.favoritos,
                publicado: prop.detalles!.publicado,
            }))

        if (detallesData.length > 0) {
            const { error: errorDetalles } = await supabaseAdmin
                .from('propiedad_detalles')
                .upsert(detallesData, { onConflict: 'propiedad_id' })

            if (errorDetalles) {
                console.error('❌ Error insertando detalles:', errorDetalles)
                throw errorDetalles
            }
            console.log(`✅ ${detallesData.length} detalles insertados`)
        }

        console.log('🎉 ¡Migración completada exitosamente!')
    } catch (error) {
        console.error('💥 Error durante la migración:', error)
        process.exit(1)
    }
}

// Ejecutar migración
seedDatabase()
