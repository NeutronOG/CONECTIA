-- Blindaje de la base. Ejecutar DESPUÉS de desplegar el código: la app escribe mediante
-- la API (service role), que no se ve afectada por estas restricciones.

-- Propiedades: el público lee; solo la API escribe. Antes cualquier cuenta registrada podía editar o borrar.
REVOKE INSERT, UPDATE, DELETE ON propiedades FROM anon, authenticated;

-- Solicitudes con datos de contacto: solo mediante la API.
ALTER TABLE solicitudes_propiedad ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON solicitudes_propiedad FROM anon, authenticated;

-- usuarios: la política "Admins pueden ver todos los usuarios" consultaba la misma tabla
-- (recursión infinita, error 42P17) y nadie podía leer su perfil: los asesores con cuenta
-- de Supabase entraban como "cliente". Se reemplazan por reglas simples; el admin lee mediante la API.
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'usuarios' LOOP
    EXECUTE format('DROP POLICY %I ON public.usuarios', p.policyname);
  END LOOP;
END $$;

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY usuarios_ver_propio ON usuarios FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY usuarios_crear_propio ON usuarios FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY usuarios_editar_propio ON usuarios FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Nadie puede asignarse un rol desde el navegador. El editor SQL y el service role no pasan por esta regla.
CREATE OR REPLACE FUNCTION proteger_rol_usuario() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  IF auth.role() IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role := 'cliente';
    ELSE
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proteger_rol_usuario ON usuarios;
CREATE TRIGGER trg_proteger_rol_usuario
  BEFORE INSERT OR UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION proteger_rol_usuario();

-- Bucket público de imágenes: se sigue viendo, pero solo se sube con URL firmada por la API.
DROP POLICY IF EXISTS "allow_all_storage_operations" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus archivos" ON storage.objects;

NOTIFY pgrst, 'reload schema';
