-- ============================================================================
-- SEGUHOGAR - Integración AliExpress Dropshipping
-- ============================================================================

-- Tabla para almacenar tokens de AliExpress
CREATE TABLE IF NOT EXISTS aliexpress_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  refresh_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  seller_id TEXT,
  user_id TEXT,
  account TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para productos importados de AliExpress
CREATE TABLE IF NOT EXISTS aliexpress_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE, -- ID de AliExpress
  product_data JSONB NOT NULL, -- Datos completos del producto
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_price NUMERIC(10, 2),
  last_stock INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para pedidos enviados a AliExpress
CREATE TABLE IF NOT EXISTS aliexpress_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  aliexpress_order_id TEXT, -- ID del pedido en AliExpress
  status TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  last_tracking_check TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id)
);

-- Tabla para registro de errores de AliExpress
CREATE TABLE IF NOT EXISTS aliexpress_errors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para configuración de márgenes
CREATE TABLE IF NOT EXISTS aliexpress_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_aliexpress_products_product_id ON aliexpress_products(product_id);
CREATE INDEX IF NOT EXISTS idx_aliexpress_orders_order_id ON aliexpress_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_aliexpress_orders_ae_order_id ON aliexpress_orders(aliexpress_order_id);
CREATE INDEX IF NOT EXISTS idx_aliexpress_errors_created ON aliexpress_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aliexpress_products_sync ON aliexpress_products(last_sync_at);

-- Habilitar RLS
ALTER TABLE aliexpress_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliexpress_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliexpress_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliexpress_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliexpress_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admin gestiona tokens" ON aliexpress_tokens
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin y gestor ven productos AE" ON aliexpress_products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor'))
  );

CREATE POLICY "Admin gestiona productos AE" ON aliexpress_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin y gestor ven pedidos AE" ON aliexpress_orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor'))
  );

CREATE POLICY "Admin gestiona pedidos AE" ON aliexpress_orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin ve errores" ON aliexpress_errors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin gestiona configuración" ON aliexpress_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Configuración por defecto
INSERT INTO aliexpress_config (key, value) VALUES
  ('default_margin_percent', '30'),
  ('min_margin_percent', '15'),
  ('auto_sync_enabled', 'true'),
  ('auto_create_orders', 'false'),
  ('sync_interval_hours', '6')
ON CONFLICT (key) DO NOTHING;

-- Añadir campos a products para vincular con AliExpress
ALTER TABLE products ADD COLUMN IF NOT EXISTS aliexpress_product_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS aliexpress_last_price NUMERIC(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS aliexpress_last_sync TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS margin_alert_sent BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_aliexpress_id ON products(aliexpress_product_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER aliexpress_tokens_updated_at
  BEFORE UPDATE ON aliexpress_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER aliexpress_products_updated_at
  BEFORE UPDATE ON aliexpress_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER aliexpress_orders_updated_at
  BEFORE UPDATE ON aliexpress_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER aliexpress_config_updated_at
  BEFORE UPDATE ON aliexpress_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
