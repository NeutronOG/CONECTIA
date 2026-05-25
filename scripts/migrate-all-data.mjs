/**
 * MIGRACIÓN COMPLETA DE DATOS
 * Migra: auth users, todas las tablas, imágenes de storage
 * Uso: node scripts/migrate-all-data.mjs
 *
 * ANTES de correr este script:
 *   1. Ejecutar MIGRATION-COMPLETA.sql en la nueva BD (Supabase SQL Editor)
 *   2. Asegurarse que OLD_ y NEW_ keys estén en .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── Leer .env.local ──────────────────────────────────────────
function parseEnv(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const env = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
  }
  return env
}

const env = parseEnv(join(ROOT, '.env.local'))

const OLD_URL = env.OLD_SUPABASE_URL
const OLD_KEY = env.OLD_SUPABASE_SERVICE_ROLE_KEY
const NEW_URL = env.NEXT_PUBLIC_SUPABASE_URL
const NEW_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!OLD_URL || !OLD_KEY || !NEW_URL || !NEW_KEY) {
  console.error('❌ Faltan variables en .env.local:')
  console.error('   OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_ROLE_KEY')
  console.error('   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const oldDB = createClient(OLD_URL, OLD_KEY, { auth: { persistSession: false } })
const newDB = createClient(NEW_URL, NEW_KEY, { auth: { persistSession: false } })

// ── Helpers ──────────────────────────────────────────────────
async function fetchAll(client, table) {
  const rows = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await client.from(table).select('*').range(from, from + PAGE - 1)
    if (error) throw new Error(`Error leyendo ${table}: ${error.message}`)
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return rows
}

async function upsertBatch(client, table, rows, conflictCol = 'id', batchSize = 100) {
  if (rows.length === 0) { console.log(`  ⏭  ${table}: vacía`); return }
  let inserted = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await client.from(table).upsert(batch, { onConflict: conflictCol, ignoreDuplicates: false })
    if (error) throw new Error(`Error insertando en ${table}: ${error.message}`)
    inserted += batch.length
  }
  console.log(`  ✅ ${table}: ${inserted} filas migradas`)
}

// ── 1. AUTH USERS ────────────────────────────────────────────
async function migrateAuthUsers() {
  console.log('\n👤 Migrando usuarios de Auth...')

  let allUsers = []
  let page = 1
  while (true) {
    const { data, error } = await oldDB.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) { console.warn('  ⚠️  No se pudo leer auth.users:', error.message); return }
    if (!data.users || data.users.length === 0) break
    allUsers.push(...data.users)
    if (data.users.length < 1000) break
    page++
  }

  console.log(`  Encontrados ${allUsers.length} usuarios en BD vieja`)

  let ok = 0, skip = 0, fail = 0
  for (const user of allUsers) {
    const { error } = await newDB.auth.admin.createUser({
      id: user.id,                              // Preservar el mismo UUID
      email: user.email,
      phone: user.phone || undefined,
      email_confirm: true,
      phone_confirm: !!user.phone_confirmed_at,
      user_metadata: user.user_metadata || {},
      app_metadata: user.app_metadata || {},
    })

    if (error) {
      if (error.message.toLowerCase().includes('already') || error.code === '23505') {
        skip++
      } else {
        console.warn(`  ⚠️  ${user.email}: ${error.message}`)
        fail++
      }
    } else {
      ok++
    }
  }
  console.log(`  ✅ Auth users: ${ok} creados, ${skip} ya existían, ${fail} errores`)
  console.log('  ℹ️  Las contraseñas NO se pueden migrar. Los usuarios deben usar "Olvidé mi contraseña".')
}

// ── 2. TABLAS (en orden por FK) ──────────────────────────────
async function migrateTables() {
  console.log('\n🗄️  Migrando tablas...')

  // Orden importa: respetar foreign keys
  const tables = [
    { name: 'propiedades',           conflict: 'id' },
    { name: 'agentes',               conflict: 'id' },
    { name: 'usuarios',              conflict: 'id' },
    { name: 'propiedad_detalles',    conflict: 'propiedad_id' },
    { name: 'propiedad_agente',      conflict: 'propiedad_id,agente_id' },
    { name: 'favoritos',             conflict: 'id' },
    { name: 'anuncios',              conflict: 'id' },
    { name: 'solicitudes_fotografo', conflict: 'id' },
  ]

  for (const { name, conflict } of tables) {
    try {
      const rows = await fetchAll(oldDB, name)
      await upsertBatch(newDB, name, rows, conflict)
    } catch (err) {
      console.warn(`  ⚠️  ${name}: ${err.message}`)
    }
  }
}

// ── 3. STORAGE ───────────────────────────────────────────────
async function migrateStorage() {
  console.log('\n🖼️  Migrando imágenes de Storage...')

  async function listAllFiles(bucket, prefix = '') {
    const { data, error } = await oldDB.storage.from(bucket).list(prefix, { limit: 1000, offset: 0 })
    if (error) { console.warn(`  ⚠️  Error listando "${prefix}":`, error.message); return [] }

    const files = []
    for (const item of data || []) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id === null) {
        // Es carpeta — entrar recursivamente
        const nested = await listAllFiles(bucket, fullPath)
        files.push(...nested)
      } else {
        files.push(fullPath)
      }
    }
    return files
  }

  const files = await listAllFiles('propiedades')
  console.log(`  Encontrados ${files.length} archivos`)

  let ok = 0, fail = 0
  for (const filePath of files) {
    try {
      // Descargar de BD vieja
      const { data: blob, error: dlErr } = await oldDB.storage.from('propiedades').download(filePath)
      if (dlErr) throw dlErr

      const buffer = await blob.arrayBuffer()
      const ext = filePath.split('.').pop()?.toLowerCase() || 'jpg'
      const mime = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }[ext] || 'image/jpeg'

      // Subir a BD nueva
      const { error: ulErr } = await newDB.storage.from('propiedades').upload(filePath, buffer, {
        contentType: mime,
        upsert: true,
      })
      if (ulErr) throw ulErr

      ok++
      if (ok % 10 === 0) console.log(`    ... ${ok}/${files.length}`)
    } catch (err) {
      console.warn(`  ⚠️  ${filePath}: ${err.message}`)
      fail++
    }
  }
  console.log(`  ✅ Storage: ${ok} migradas, ${fail} fallidas`)
}

// ── 4. RESETEAR SEQUENCES ────────────────────────────────────
async function printSequenceReset() {
  console.log('\n⚠️  Último paso — Pega esto en Supabase SQL Editor de la BD nueva:')
  console.log(`
SELECT setval('propiedades_id_seq', COALESCE((SELECT MAX(id) FROM propiedades), 1));
SELECT setval('agentes_id_seq',     COALESCE((SELECT MAX(id) FROM agentes), 1));
SELECT setval('favoritos_id_seq',   COALESCE((SELECT MAX(id) FROM favoritos), 1));
`)
}

// ── MAIN ─────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Iniciando migración completa de datos')
  console.log(`   Origen:  ${OLD_URL}`)
  console.log(`   Destino: ${NEW_URL}`)
  console.log('─'.repeat(50))

  await migrateAuthUsers()
  await migrateTables()
  await migrateStorage()
  await printSequenceReset()

  console.log('\n' + '─'.repeat(50))
  console.log('✅ Migración de datos completada')
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message)
  process.exit(1)
})
