-- ============================================================================
-- SEGUHOGAR - Añadir campo stripe_session_id a orders
-- ============================================================================
-- Ejecutar en: Supabase SQL Editor
-- ============================================================================

-- Añadir columna para almacenar el ID de sesión de Stripe
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS stripe_session_id text;

-- Crear índice para búsquedas rápidas por session_id
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session 
ON orders(stripe_session_id);
