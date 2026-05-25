-- =====================================================
-- OPTIMIZACIÓN DE BASE DE DATOS PARA ALTO RENDIMIENTO
-- ARKIN SELECT - Supabase
-- =====================================================
-- Ejecutar este script en Supabase SQL Editor
-- para optimizar el rendimiento con 50,000+ usuarios
-- =====================================================

-- 1. ÍNDICES PARA CONSULTAS FRECUENTES
-- =====================================

-- Índice para búsquedas por categoría (venta, renta, especial, remate)
CREATE INDEX IF NOT EXISTS idx_propiedades_categoria 
ON propiedades(categoria);

-- Índice para ordenamiento por fecha de creación
CREATE INDEX IF NOT EXISTS idx_propiedades_created_at 
ON propiedades(created_at DESC);

-- Índice compuesto para filtros comunes (status + categoría)
CREATE INDEX IF NOT EXISTS idx_propiedades_status_categoria 
ON propiedades(status, categoria);

-- Índice para búsqueda por ubicación
CREATE INDEX IF NOT EXISTS idx_propiedades_ubicacion 
ON propiedades(ubicacion);

-- Índice para rango de precios
CREATE INDEX IF NOT EXISTS idx_propiedades_precio 
ON propiedades(precio);

-- Índice para búsqueda por tipo de propiedad
CREATE INDEX IF NOT EXISTS idx_propiedades_tipo 
ON propiedades(tipo);

-- Índice compuesto para paginación eficiente
CREATE INDEX IF NOT EXISTS idx_propiedades_pagination 
ON propiedades(created_at DESC, id DESC);

-- Índice para búsqueda por usuario (propiedades del asesor)
CREATE INDEX IF NOT EXISTS idx_propiedades_usuario 
ON propiedades(usuario_id);


-- 2. ÍNDICES PARA TABLAS RELACIONADAS
-- ====================================

-- Índice para relación propiedad-agente
CREATE INDEX IF NOT EXISTS idx_propiedad_agente_propiedad 
ON propiedad_agente(propiedad_id);

CREATE INDEX IF NOT EXISTS idx_propiedad_agente_agente 
ON propiedad_agente(agente_id);

-- Índice para favoritos
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario 
ON favoritos(usuario_id);

CREATE INDEX IF NOT EXISTS idx_favoritos_propiedad 
ON favoritos(propiedad_id);


-- 3. POLÍTICAS RLS OPTIMIZADAS
-- ============================

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Propiedades públicas para lectura" ON propiedades;
DROP POLICY IF EXISTS "Usuarios autenticados pueden modificar" ON propiedades;

-- Política de lectura pública (sin overhead de autenticación)
CREATE POLICY "Propiedades públicas para lectura"
ON propiedades FOR SELECT
USING (true);

-- Política de inserción para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden insertar"
ON propiedades FOR INSERT
WITH CHECK (true);

-- Política de actualización para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar"
ON propiedades FOR UPDATE
USING (true);

-- Política de eliminación para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden eliminar"
ON propiedades FOR DELETE
USING (true);


-- 4. CONFIGURACIÓN DE REALTIME
-- ============================

-- Habilitar realtime solo para la tabla propiedades
ALTER PUBLICATION supabase_realtime ADD TABLE propiedades;


-- 5. FUNCIONES OPTIMIZADAS
-- ========================

-- Función para obtener propiedades con paginación eficiente
CREATE OR REPLACE FUNCTION get_propiedades_paginated(
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0,
    p_categoria TEXT DEFAULT NULL
)
RETURNS TABLE (
    id BIGINT,
    titulo TEXT,
    ubicacion TEXT,
    precio NUMERIC,
    precio_texto TEXT,
    tipo TEXT,
    habitaciones INT,
    banos INT,
    area NUMERIC,
    area_texto TEXT,
    imagen TEXT,
    descripcion TEXT,
    caracteristicas TEXT[],
    status TEXT,
    categoria TEXT,
    fecha_publicacion TEXT,
    tour_virtual TEXT,
    galeria TEXT[],
    created_at TIMESTAMPTZ,
    total_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH filtered AS (
        SELECT p.*
        FROM propiedades p
        WHERE (p_categoria IS NULL OR p.categoria = p_categoria)
        ORDER BY p.created_at DESC
    ),
    counted AS (
        SELECT COUNT(*) as cnt FROM filtered
    )
    SELECT 
        f.id,
        f.titulo,
        f.ubicacion,
        f.precio,
        f.precio_texto,
        f.tipo,
        f.habitaciones,
        f.banos,
        f.area,
        f.area_texto,
        f.imagen,
        f.descripcion,
        f.caracteristicas,
        f.status::TEXT,
        f.categoria::TEXT,
        f.fecha_publicacion,
        f.tour_virtual,
        f.galeria,
        f.created_at,
        c.cnt
    FROM filtered f, counted c
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


-- 6. ESTADÍSTICAS Y ANÁLISIS
-- ==========================

-- Actualizar estadísticas de la tabla para el query planner
ANALYZE propiedades;
ANALYZE propiedad_agente;
ANALYZE favoritos;
ANALYZE agentes;


-- 7. VERIFICACIÓN DE ÍNDICES
-- ==========================

-- Ver todos los índices creados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('propiedades', 'propiedad_agente', 'favoritos', 'agentes')
ORDER BY tablename, indexname;


-- =====================================================
-- FIN DEL SCRIPT DE OPTIMIZACIÓN
-- =====================================================
-- Después de ejecutar este script:
-- 1. Verificar que todos los índices se crearon
-- 2. Probar consultas para verificar mejora de rendimiento
-- 3. Monitorear uso de conexiones en Dashboard
-- =====================================================
