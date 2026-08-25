#!/bin/bash
# Script para agregar variables de entorno a Vercel via CLI
# Ejecutar: bash scripts/set-env-vars.sh

echo "Agregando variables de entorno de IA a Vercel..."

# Instalar Vercel CLI si no está instalado
if ! command -v vercel &> /dev/null; then
  echo "Instalando Vercel CLI..."
  npm install -g vercel
fi

# Agregar variables de entorno a producción
# Las keys se leen desde .env.local para no exponerlas en el código
source .env.local 2>/dev/null || true

echo "$ANTHROPIC_API_KEY" | vercel env add ANTHROPIC_API_KEY production --yes
echo "$TELEGRAM_BOT_TOKEN" | vercel env add TELEGRAM_BOT_TOKEN production --yes
echo "$TELEGRAM_WEBHOOK_URL" | vercel env add TELEGRAM_WEBHOOK_URL production --yes

echo ""
echo "✅ Variables agregadas. Ahora redespliega con: vercel --prod"
