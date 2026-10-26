-- ============================================================================
-- SEGUHOGAR - Límites de uso de IA
-- ============================================================================

-- Tabla para registrar uso de IA
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  tokens_input INTEGER NOT NULL DEFAULT 0,
  tokens_output INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de límites por usuario
CREATE TABLE IF NOT EXISTS ai_usage_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_limit_usd DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  current_month_start DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage(created_at);

-- Habilitar RLS
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_limits ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Usuarios ven su propio uso" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin ve todo el uso" ON ai_usage
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Usuarios ven sus límites" ON ai_usage_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin gestiona límites" ON ai_usage_limits
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger para actualizar updated_at
CREATE TRIGGER ai_usage_limits_updated_at
  BEFORE UPDATE ON ai_usage_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insertar límites por defecto para roles
-- Admin: 50€/mes, Gestor: 20€/mes, Cliente: 5€/mes
-- Esto se hace manualmente o vía Edge Function al crear usuarios
