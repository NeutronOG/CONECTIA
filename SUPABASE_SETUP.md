# 🚀 Guía de Implementación de Supabase - ARKIN Platform

## ✅ Completado

He integrado Supabase completamente en tu proyecto. Aquí está lo que se ha hecho:

### 1. **Configuración de Entorno** ✅
- ✅ Archivo `.env.local` creado con tus credenciales de Supabase
- ✅ Variables configuradas correctamente

### 2. **Clientes de Supabase** ✅
- ✅ `lib/supabase/client.ts` - Cliente para el navegador
- ✅ `lib/supabase/server.ts` - Cliente admin para servidor

### 3. **Esquema de Base de Datos** ✅
- ✅ `supabase/schema.sql` - SQL completo con:
  - 5 tablas (propiedades, agentes, usuarios, favoritos, propiedad_detalles)
  - Índices para optimizar consultas
  - Row Level Security (RLS) configurado
  - Triggers para actualizar `updated_at` automáticamente
  - Políticas de acceso por roles (admin, propietario, asesor, cliente)

### 4. **Tipos TypeScript** ✅
- ✅ `lib/supabase/database.types.ts` - Tipos generados para TypeScript

### 5. **Script de Migración** ✅
- ✅ `scripts/seed-supabase.ts` - Para migrar datos mock a Supabase

### 6. **Componentes Actualizados** ✅
- ✅ `contexts/auth-context.tsx` - **Autenticación real con Supabase**
  - Login con email/contraseña
  - Registro de nuevos usuarios
  - Sesiones persistentes
  - Integración con tabla `usuarios`
  
- ✅ `lib/properties-storage.ts` - **CRUD completo con Supabase**
  - Todas las operaciones ahora usan la base de datos
  - Métodos async/await
  - Conversión automática entre formatos
  
- ✅ `app/propiedades/page.tsx` - **Realtime updates**
  - Carga desde Supabase
  - Actualizaciones en tiempo real

---

## 📋 Pasos Finales (Debes Hacer)

### **Paso 1: Crear las Tablas en Supabase**

1. Ve al dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto `jwevnxyvrkqmzlgfzqj`
3. Ve a **SQL Editor** en el menú lateral
4. Copia y pega el contenido completo de `supabase/schema.sql`
5. Click en **Run** para ejecutar el SQL

**Esto creará:**
- Todas las tablas
- Índices
- Row Level Security
- Políticas de acceso
- Triggers automáticos

---

### **Paso 2: Migrar los Datos Mock a Supabase**

**IMPORTANTE**: Solo ejecuta este paso DESPUÉS de completar el Paso 1 (crear las tablas).

Ejecuta el script de migración:

```bash
# Opción 1: Script helper (recomendado)
./scripts/run-seed.sh

# Opción 2: Comando manual
export $(cat .env.local | xargs) && npx tsx scripts/seed-supabase.ts
```

**Esto insertará:**
- 5 propiedades
- 5 agentes
- Relaciones entre propiedades y agentes
- Detalles de las propiedades

---

### **Paso 3: Reiniciar el Servidor de Desarrollo**

```bash
# Detén el servidor actual (Ctrl+C)
# Luego reinicia:
npm run dev
```

El servidor necesita reiniciarse para cargar las nuevas variables de entorno.

---

## 🔐 Autenticación

### **Crear Usuarios de Prueba**

Puedes crear usuarios directamente desde el código o usar la consola de Supabase:

#### Opción 1: Desde la App (recomendado)
La función `signup` ahora está disponible en tu `AuthContext`:

```typescript
const { signup } = useAuth()

await signup('admin@arkin.mx', 'password123', {
  nombre: 'Admin Arkin',
  role: 'admin'
})
```

#### Opción 2: Desde Supabase Dashboard
1. Ve a **Authentication** → **Users**
2. Click en **Add user**
3. Ingresa email y contraseña
4. Luego, en **SQL Editor**, inserta el registro en la tabla `usuarios`:

```sql
INSERT INTO usuarios (id, email, nombre, role)
VALUES (
  'UUID_DEL_USUARIO',  -- Copia el UUID de Authentication
  'admin@arkin.mx',
  'Admin Arkin',
  'admin'
);
```

---

## 🎯 Funcionalidades Implementadas

### **Autenticación Completa**
- ✅ Login con email/contraseña
- ✅ Registro de nuevos usuarios
- ✅ Sesiones persistentes (se mantiene al recargar)
- ✅ Logout
- ✅ Roles de usuario (admin, propietario, asesor, cliente)

### **Gestión de Propiedades**
- ✅ Listar todas las propiedades (desde Supabase)
- ✅ Ver detalles de una propiedad
- ✅ Crear nueva propiedad (solo admin/propietario)
- ✅ Actualizar propiedad (solo admin/propietario)
- ✅ Eliminar propiedad (solo admin)
- ✅ Filtrar por categoría
- ✅ Buscar por asesor

### **Realtime**
- ✅ Actualizaciones en tiempo real cuando hay cambios en la BD

### **Seguridad**
- ✅ Row Level Security (RLS) activado
- ✅ Políticas de acceso por roles
- ✅ Contraseñas hasheadas automáticamente por Supabase
- ✅ Tokens JWT seguros

---

## 🧪 Verificación

### **1. Verificar Conexión**
Abre la consola del navegador y deberías ver:
```
✅ Propiedades cargadas desde Supabase
```

### **2. Probar Autenticación**
1. Ve a `/login`
2. Intenta hacer login (si ya creaste un usuario)
3. Deberías ver tu perfil cargado

### **3. Ver Propiedades**
1. Ve a `/propiedades`
2. Deberías ver las 5 propiedades migradas desde Supabase

---

## 📁 Archivos Creados/Modificados

### **Nuevos Archivos:**
```
.env.local                         # Variables de entorno
lib/supabase/client.ts             # Cliente Supabase (browser)
lib/supabase/server.ts             # Cliente Supabase (servidor)
lib/supabase/database.types.ts     # Tipos TypeScript
supabase/schema.sql                # Esquema SQL completo
scripts/seed-supabase.ts           # Script de migración
```

### **Archivos Modificados:**
```
contexts/auth-context.tsx          # Autenticación real
lib/properties-storage.ts          # CRUD con Supabase
app/propiedades/page.tsx           # Cargar desde Supabase
```

---

## ⚠️ Notas Importantes

> **IMPORTANTE**: Las contraseñas ahora se manejan con Supabase Auth. NO uses contraseñas en texto plano.

> **IMPORTANTE**: El Service Role Key tiene permisos de admin. Solo úsala en el servidor, nunca en el cliente.

> **IMPORTANTE**: Row Level Security está activado. Los usuarios solo pueden ver/editar según sus permisos.

---

## 🐛 Troubleshooting

### Si no ves las propiedades:
1. Verifica que ejecutaste el SQL en Supabase Dashboard
2. Verifica que ejecutaste el script de migración
3. Revisa la consola del navegador para errores

### Si hay errores de autenticación:
1. Verifica las variables de entorno en `.env.local`
2. Reinicia el servidor de desarrollo
3. Verifica que el usuario existe en Supabase

### Si hay errores de permisos:
1. Verifica que RLS está correctamente configurado
2. Verifica el rol del usuario en la tabla `usuarios`

---

## 🚀 Próximos Pasos (Opcional)

1. **Storage de Imágenes**: Implementar upload de imágenes a Supabase Storage
2. **Email Verification**: Activar verificación de email en Supabase
3. **OAuth**: Agregar login con Google/GitHub
4. **Favoritos**: Implementar sistema de favoritos con Supabase
5. **Analytics**: Agregar tracking de vistas/interacciones

---

¿Necesitas ayuda con algún paso? ¡Avísame! 🚀
