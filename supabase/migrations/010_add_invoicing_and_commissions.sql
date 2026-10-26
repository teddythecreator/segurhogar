-- Añadir campos para facturación
ALTER TABLE orders ADD COLUMN IF NOT EXISTS factura_numero TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS factura_fecha DATE;

-- Crear tabla de comisiones de afiliados
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tienda TEXT NOT NULL,
  fecha DATE NOT NULL,
  importe DECIMAL(10, 2) NOT NULL,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admin puede gestionar comisiones" ON affiliate_commissions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Gestores pueden ver comisiones" ON affiliate_commissions
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'gestor'));

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_factura_numero ON orders(factura_numero);
CREATE INDEX IF NOT EXISTS idx_orders_factura_fecha ON orders(factura_fecha);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_fecha ON affiliate_commissions(fecha);
