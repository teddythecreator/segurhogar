-- ============================================================================
-- SEGUHOGAR - Configuración de Storage para imágenes de productos
-- ============================================================================
-- Ejecutar en: Supabase SQL Editor (después de haber ejecutado schema.sql)
-- ============================================================================

-- Crear el bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Política: cualquier usuario autenticado puede leer imágenes
CREATE POLICY "Imágenes de productos visibles para todos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Política: solo admin puede subir imágenes
CREATE POLICY "Solo admin sube imágenes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (
      SELECT p.role 
      FROM public.profiles p 
      WHERE p.id = auth.uid()
    ) = 'admin'
  );

-- Política: solo admin puede actualizar imágenes
CREATE POLICY "Solo admin actualiza imágenes"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND (
      SELECT p.role 
      FROM public.profiles p 
      WHERE p.id = auth.uid()
    ) = 'admin'
  );

-- Política: solo admin puede eliminar imágenes
CREATE POLICY "Solo admin elimina imágenes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (
      SELECT p.role 
      FROM public.profiles p 
      WHERE p.id = auth.uid()
    ) = 'admin'
  );
