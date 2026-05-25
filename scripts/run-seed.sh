#!/bin/bash

# Script helper para ejecutar la migración de datos a Supabase
# Este script carga las variables de entorno y ejecuta el seed

echo "🔄 Cargando variables de entorno..."
export $(cat .env.local | xargs)

echo "🌱 Ejecutando migración a Supabase..."
npx tsx scripts/seed-supabase.ts
