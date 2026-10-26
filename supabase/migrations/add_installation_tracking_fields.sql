-- ============================================================================
-- SEGUHOGAR - Añadir campos de fecha_llegada y fecha_realizacion a installations
-- ============================================================================
-- Ejecutar en: Supabase SQL Editor
-- ============================================================================

-- Añadir columnas para tracking de tiempos
ALTER TABLE installations
ADD COLUMN IF NOT EXISTS fecha_llegada timestamptz,
ADD COLUMN IF NOT EXISTS fecha_realizacion timestamptz;

-- Crear índices para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_installations_fecha_llegada 
ON installations(fecha_llegada);

CREATE INDEX IF NOT EXISTS idx_installations_fecha_realizacion 
ON installations(fecha_realizacion);
