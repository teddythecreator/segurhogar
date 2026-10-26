-- ============================================================================
-- SEGUHOGAR - Configuración de Storage para instalaciones
-- ============================================================================
-- Ejecutar en: Supabase SQL Editor
-- ============================================================================

-- Crear bucket para fotos de instalación
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'installation-photos',
  'installation-photos',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Crear bucket para firmas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'installation-signatures',
  'installation-signatures',
  true,
  1048576, -- 1MB
  ARRAY['image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas para installation-photos
CREATE POLICY "Fotos de instalación visibles para todos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'installation-photos');

CREATE POLICY "Instaladores suben fotos de sus instalaciones"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'installation-photos'
    AND (
      SELECT p.role 
      FROM public.profiles p 
      WHERE p.id = auth.uid()
    ) IN ('admin', 'instalador')
  );

CREATE POLICY "Admin y gestor gestionan fotos"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'installation-photos'
    AND (
      SELECT p.role 
      FROM public.profiles p 
      WHERE p.id = auth.uid()
    ) IN ('admin', 'gestor')
  );

-- Políticas para installation-signatures
CREATE POLICY "Firmas visibles para todos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'installation-signatures');

CREATE POLICY "Instaladores suben firmas"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'installation-signatures'
    AND (
      SELECT p.role 
      FROM public.profiles p 
      WHERE p.id = auth.uid()
    ) IN ('admin', 'instalador')
  );

CREATE POLICY "Admin y gestor gestionan firmas"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'installation-signatures'
    AND (
      SELECT p.role 
      FROM public.profiles p 
      WHERE p.id = auth.uid()
    ) IN ('admin', 'gestor')
  );
