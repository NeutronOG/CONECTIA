-- Script para habilitar a todos los asesores a subir y actualizar propiedades

-- 1. Crear función para auto-registrar usuarios en la tabla usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    'asesor'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear trigger para auto-registro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Registrar usuarios existentes que no estén en la tabla usuarios
INSERT INTO public.usuarios (id, email, nombre, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'nombre', email) as nombre,
  'asesor' as role
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios WHERE usuarios.id = auth.users.id
);

-- 4. Eliminar políticas restrictivas antiguas
DROP POLICY IF EXISTS "Solo admins y propietarios pueden insertar propiedades" ON propiedades;
DROP POLICY IF EXISTS "Solo admins y propietarios pueden actualizar propiedades" ON propiedades;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias propiedades" ON propiedades;
DROP POLICY IF EXISTS "Solo admins pueden eliminar propiedades" ON propiedades;

-- 5. Crear políticas PERMISIVAS para todos los usuarios autenticados

-- Política INSERT: Cualquier usuario autenticado puede insertar propiedades
CREATE POLICY "Usuarios autenticados pueden insertar propiedades"
ON propiedades
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

-- Política UPDATE: Los usuarios pueden actualizar sus propias propiedades
CREATE POLICY "Usuarios pueden actualizar sus propias propiedades"
ON propiedades
FOR UPDATE
TO authenticated
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- Política DELETE: Los usuarios pueden eliminar sus propias propiedades
CREATE POLICY "Usuarios pueden eliminar sus propias propiedades"
ON propiedades
FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id);

-- La política SELECT ya existe y permite a todos ver todas las propiedades
-- Si no existe, la creamos:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'propiedades' 
    AND policyname = 'Propiedades son visibles para todos'
  ) THEN
    CREATE POLICY "Propiedades son visibles para todos" 
    ON propiedades
    FOR SELECT 
    USING (true);
  END IF;
END $$;

-- 6. Verificar que RLS está habilitado
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 7. Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Políticas actualizadas correctamente. Todos los usuarios autenticados pueden ahora gestionar sus propiedades.';
END $$;
