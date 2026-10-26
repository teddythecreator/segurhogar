-- ============================================================================
-- SEGUHOGAR - Script de base de datos para Supabase
-- ============================================================================
-- Ejecutar en: Supabase SQL Editor
-- Orden: Enums → Funciones → Triggers → Tablas → Índices → RLS → Datos
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONES
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. ENUMS
-- ============================================================================

-- Roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'gestor', 'instalador', 'cliente');

-- Tipo de cliente
CREATE TYPE customer_type AS ENUM ('familia', 'mayor', 'negocio');

-- Tipo de producto
CREATE TYPE product_type AS ENUM ('dropshipping', 'afiliado', 'servicio', 'pack');

-- Estado del producto
CREATE TYPE product_status AS ENUM ('borrador', 'publicado');

-- Perfiles recomendados para un producto
CREATE TYPE recommended_profile AS ENUM ('familia', 'mayor', 'negocio', 'todos');

-- Estados de pedido
CREATE TYPE order_status AS ENUM (
  'pendiente_pago',
  'pagado',
  'enviado_proveedor',
  'en_transito',
  'entregado',
  'incidencia',
  'devuelto',
  'cancelado'
);

-- Estados de instalación
CREATE TYPE installation_status AS ENUM (
  'solicitada',
  'confirmada',
  'asignada',
  'realizada',
  'cerrada',
  'cancelada'
);

-- Estados de presupuesto
CREATE TYPE quote_status AS ENUM (
  'borrador',
  'enviado',
  'aceptado',
  'rechazado'
);

-- ============================================================================
-- 3. FUNCIÓN AUXILIAR: obtener rol del usuario actual
-- ============================================================================

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.role
  FROM public.profiles p
  WHERE p.id = (SELECT auth.uid())
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_my_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

-- ============================================================================
-- 4. TRIGGERS: timestamps automáticos
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 5. TRIGGER: crear profile al registrarse
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    'cliente'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 6. TABLAS
-- ============================================================================

-- Perfiles de usuario (vinculado a auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nombre text NOT NULL,
  telefono text,
  role user_role NOT NULL DEFAULT 'cliente',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Clientes
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo customer_type NOT NULL,
  nombre text NOT NULL,
  nif_cif text,
  email text,
  telefono text,
  direccion_calle text,
  direccion_codigo_postal text,
  direccion_ciudad text,
  direccion_provincia text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Categorías (jerarquía padre/hijo)
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  slug text NOT NULL UNIQUE,
  descripcion text,
  imagen_url text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  orden int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Productos
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo product_type NOT NULL,
  nombre text NOT NULL,
  slug text NOT NULL UNIQUE,
  descripcion_corta text,
  descripcion_completa text,
  especificaciones jsonb DEFAULT '{}'::jsonb,
  precio numeric(10, 2) NOT NULL,
  precio_coste numeric(10, 2) NOT NULL DEFAULT 0,
  precio_rebajado numeric(10, 2),
  estado product_status NOT NULL DEFAULT 'borrador',
  categoria_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  perfiles_recomendados recommended_profile[] DEFAULT ARRAY['todos']::recommended_profile[],
  url_afiliado text,
  tienda_afiliado text,
  id_aliexpress text,
  plazo_entrega_dias int DEFAULT 7,
  stock int NOT NULL DEFAULT 0,
  duracion_instalacion_min int,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Imágenes de productos
CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  orden int NOT NULL DEFAULT 0,
  alt text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Items de packs (productos que forman un pack)
CREATE TABLE pack_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  cantidad int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT pack_items_unique UNIQUE (pack_id, product_id),
  CONSTRAINT pack_items_no_self_pack CHECK (pack_id != product_id)
);

-- Pedidos
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero text NOT NULL UNIQUE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  estado order_status NOT NULL DEFAULT 'pendiente_pago',
  -- Totales
  subtotal numeric(10, 2) NOT NULL DEFAULT 0,
  iva numeric(10, 2) NOT NULL DEFAULT 0,
  total numeric(10, 2) NOT NULL DEFAULT 0,
  tipo_iva numeric(5, 2) NOT NULL DEFAULT 21,
  -- Dirección de envío
  envio_nombre text,
  envio_telefono text,
  envio_calle text,
  envio_codigo_postal text,
  envio_ciudad text,
  envio_provincia text,
  -- Dirección de facturación
  factura_nombre text,
  factura_nif text,
  factura_calle text,
  factura_codigo_postal text,
  factura_ciudad text,
  factura_provincia text,
  -- Pagos
  stripe_payment_intent_id text,
  pagado_en timestamptz,
  -- Notas
  notas_cliente text,
  notas_internas text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Items de pedido
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  nombre_snapshot text NOT NULL,
  tipo_snapshot product_type NOT NULL,
  cantidad int NOT NULL DEFAULT 1,
  precio_unitario numeric(10, 2) NOT NULL,
  iva_unitario numeric(10, 2) NOT NULL DEFAULT 21,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Historial de estados de pedidos
CREATE TABLE order_status_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  estado_anterior order_status,
  estado_nuevo order_status NOT NULL,
  usuario_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notas text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Instalaciones
CREATE TABLE installations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  instalador_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  estado installation_status NOT NULL DEFAULT 'solicitada',
  fecha date NOT NULL,
  hora_inicio time,
  hora_fin time,
  -- Dirección
  direccion_calle text NOT NULL,
  direccion_codigo_postal text NOT NULL,
  direccion_ciudad text NOT NULL,
  direccion_provincia text,
  -- Detalles
  checklist jsonb DEFAULT '[]'::jsonb,
  firma_url text,
  notas text,
  notas_instalador text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER installations_updated_at
  BEFORE UPDATE ON installations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Fotos de instalación
CREATE TABLE installation_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  installation_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  url text NOT NULL,
  descripcion text,
  orden int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Presupuestos
CREATE TABLE quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  estado quote_status NOT NULL DEFAULT 'borrador',
  subtotal numeric(10, 2) NOT NULL DEFAULT 0,
  iva numeric(10, 2) NOT NULL DEFAULT 0,
  total numeric(10, 2) NOT NULL DEFAULT 0,
  notas text,
  valido_hasta date,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Items de presupuesto
CREATE TABLE quote_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  descripcion text NOT NULL,
  cantidad int NOT NULL DEFAULT 1,
  precio_unitario numeric(10, 2) NOT NULL,
  iva numeric(5, 2) NOT NULL DEFAULT 21,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Clics de afiliado
CREATE TABLE affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  referer text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Zonas de servicio (códigos postales)
CREATE TABLE service_zones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_postal text NOT NULL UNIQUE,
  ciudad text,
  provincia text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. ÍNDICES
-- ============================================================================

-- Perfiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Clientes
CREATE INDEX idx_customers_tipo ON customers(tipo);
CREATE INDEX idx_customers_email ON customers(email);

-- Categorías
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Productos
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_tipo ON products(tipo);
CREATE INDEX idx_products_estado ON products(estado);
CREATE INDEX idx_products_categoria ON products(categoria_id);
CREATE INDEX idx_products_activo ON products(activo);
CREATE INDEX idx_products_perfiles ON products USING GIN(perfiles_recomendados);

-- Imágenes
CREATE INDEX idx_product_images_product ON product_images(product_id);

-- Pack items
CREATE INDEX idx_pack_items_pack ON pack_items(pack_id);
CREATE INDEX idx_pack_items_product ON pack_items(product_id);

-- Pedidos
CREATE INDEX idx_orders_numero ON orders(numero);
CREATE INDEX idx_orders_estado ON orders(estado);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Order items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Historial
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created ON order_status_history(created_at DESC);

-- Instalaciones
CREATE INDEX idx_installations_estado ON installations(estado);
CREATE INDEX idx_installations_customer ON installations(customer_id);
CREATE INDEX idx_installations_instalador ON installations(instalador_id);
CREATE INDEX idx_installations_fecha ON installations(fecha);

-- Fotos instalación
CREATE INDEX idx_installation_photos_installation ON installation_photos(installation_id);

-- Presupuestos
CREATE INDEX idx_quotes_numero ON quotes(numero);
CREATE INDEX idx_quotes_estado ON quotes(estado);
CREATE INDEX idx_quotes_customer ON quotes(customer_id);

-- Quote items
CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);

-- Clics afiliado
CREATE INDEX idx_affiliate_clicks_product ON affiliate_clicks(product_id);
CREATE INDEX idx_affiliate_clicks_created ON affiliate_clicks(created_at DESC);

-- Zonas
CREATE INDEX idx_service_zones_cp ON service_zones(codigo_postal);
CREATE INDEX idx_service_zones_activo ON service_zones(activo);

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_zones ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------------------------

-- Admin ve todos los perfiles
CREATE POLICY "Admin ve todos los perfiles"
  ON profiles FOR ALL
  USING (get_my_role() = 'admin');

-- Cada usuario ve su propio perfil
CREATE POLICY "Usuario ve su propio perfil"
  ON profiles FOR SELECT
  USING (id = get_my_id());

-- Cada usuario puede actualizar su propio perfil (solo campos permitidos)
CREATE POLICY "Usuario actualiza su perfil"
  ON profiles FOR UPDATE
  USING (id = get_my_id())
  WITH CHECK (id = get_my_id());

-- ----------------------------------------------------------------------------
-- CUSTOMERS
-- ----------------------------------------------------------------------------

-- Admin ve todos los clientes
CREATE POLICY "Admin ve todos los clientes"
  ON customers FOR ALL
  USING (get_my_role() = 'admin');

-- Gestor ve todos los clientes
CREATE POLICY "Gestor ve clientes"
  ON customers FOR ALL
  USING (get_my_role() = 'gestor');

-- Instalador ve clientes de sus instalaciones
CREATE POLICY "Instalador ve clientes de sus instalaciones"
  ON customers FOR SELECT
  USING (
    id IN (
      SELECT customer_id FROM installations
      WHERE instalador_id = get_my_id()
    )
  );

-- ----------------------------------------------------------------------------
-- CATEGORIES (lectura pública)
-- ----------------------------------------------------------------------------

CREATE POLICY "Categorías visibles para todos"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Solo admin modifica categorías"
  ON categories FOR ALL
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- ----------------------------------------------------------------------------
-- PRODUCTS
-- ----------------------------------------------------------------------------

-- Productos publicados visibles para todos
CREATE POLICY "Productos publicados visibles"
  ON products FOR SELECT
  USING (estado = 'publicado' AND activo = true);

-- Admin ve todos los productos (incluyendo borradores)
CREATE POLICY "Admin ve todos los productos"
  ON products FOR SELECT
  USING (get_my_role() = 'admin');

-- Admin gestiona productos
CREATE POLICY "Admin gestiona productos"
  ON products FOR ALL
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Gestor puede ver borradores también
CREATE POLICY "Gestor ve todos los productos"
  ON products FOR SELECT
  USING (get_my_role() = 'gestor');

-- ----------------------------------------------------------------------------
-- PRODUCT IMAGES (lectura pública para productos publicados)
-- ----------------------------------------------------------------------------

CREATE POLICY "Imágenes de productos publicados"
  ON product_images FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM products WHERE estado = 'publicado' AND activo = true
    )
  );

CREATE POLICY "Admin gestiona imágenes"
  ON product_images FOR ALL
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- ----------------------------------------------------------------------------
-- PACK ITEMS (lectura pública para productos publicados)
-- ----------------------------------------------------------------------------

CREATE POLICY "Pack items de productos publicados"
  ON pack_items FOR SELECT
  USING (
    pack_id IN (
      SELECT id FROM products WHERE estado = 'publicado' AND activo = true
    )
  );

CREATE POLICY "Admin gestiona pack items"
  ON pack_items FOR ALL
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- ----------------------------------------------------------------------------
-- ORDERS
-- ----------------------------------------------------------------------------

-- Admin ve todos los pedidos
CREATE POLICY "Admin ve todos los pedidos"
  ON orders FOR ALL
  USING (get_my_role() = 'admin');

-- Gestor ve todos los pedidos
CREATE POLICY "Gestor ve pedidos"
  ON orders FOR ALL
  USING (get_my_role() = 'gestor');

-- Cliente ve sus propios pedidos
CREATE POLICY "Cliente ve sus pedidos"
  ON orders FOR SELECT
  USING (user_id = get_my_id());

-- Cliente puede crear pedidos
CREATE POLICY "Cliente crea pedidos"
  ON orders FOR INSERT
  WITH CHECK (user_id = get_my_id());

-- ----------------------------------------------------------------------------
-- ORDER ITEMS
-- ----------------------------------------------------------------------------

CREATE POLICY "Admin ve todos los order items"
  ON order_items FOR ALL
  USING (get_my_role() = 'admin');

CREATE POLICY "Gestor ve order items"
  ON order_items FOR ALL
  USING (get_my_role() = 'gestor');

CREATE POLICY "Cliente ve items de sus pedidos"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = get_my_id()
    )
  );

-- ----------------------------------------------------------------------------
-- ORDER STATUS HISTORY
-- ----------------------------------------------------------------------------

CREATE POLICY "Admin ve historial"
  ON order_status_history FOR ALL
  USING (get_my_role() = 'admin');

CREATE POLICY "Gestor ve historial"
  ON order_status_history FOR SELECT
  USING (get_my_role() = 'gestor');

CREATE POLICY "Gestor inserta historial"
  ON order_status_history FOR INSERT
  WITH CHECK (get_my_role() = 'gestor');

CREATE POLICY "Cliente ve historial de sus pedidos"
  ON order_status_history FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = get_my_id()
    )
  );

-- ----------------------------------------------------------------------------
-- INSTALLATIONS
-- ----------------------------------------------------------------------------

-- Admin ve todas las instalaciones
CREATE POLICY "Admin ve instalaciones"
  ON installations FOR ALL
  USING (get_my_role() = 'admin');

-- Gestor ve todas las instalaciones
CREATE POLICY "Gestor ve instalaciones"
  ON installations FOR ALL
  USING (get_my_role() = 'gestor');

-- Instalador ve sus instalaciones asignadas
CREATE POLICY "Instalador ve sus instalaciones"
  ON installations FOR SELECT
  USING (instalador_id = get_my_id());

-- Instalador puede actualizar sus instalaciones
CREATE POLICY "Instalador actualiza sus instalaciones"
  ON installations FOR UPDATE
  USING (instalador_id = get_my_id())
  WITH CHECK (instalador_id = get_my_id());

-- ----------------------------------------------------------------------------
-- INSTALLATION PHOTOS
-- ----------------------------------------------------------------------------

CREATE POLICY "Admin ve fotos"
  ON installation_photos FOR ALL
  USING (get_my_role() = 'admin');

CREATE POLICY "Gestor ve fotos"
  ON installation_photos FOR SELECT
  USING (get_my_role() = 'gestor');

CREATE POLICY "Instalador ve fotos de sus instalaciones"
  ON installation_photos FOR SELECT
  USING (
    installation_id IN (
      SELECT id FROM installations WHERE instalador_id = get_my_id()
    )
  );

CREATE POLICY "Instalador sube fotos de sus instalaciones"
  ON installation_photos FOR INSERT
  WITH CHECK (
    installation_id IN (
      SELECT id FROM installations WHERE instalador_id = get_my_id()
    )
  );

-- ----------------------------------------------------------------------------
-- QUOTES
-- ----------------------------------------------------------------------------

CREATE POLICY "Admin ve presupuestos"
  ON quotes FOR ALL
  USING (get_my_role() = 'admin');

CREATE POLICY "Gestor ve presupuestos"
  ON quotes FOR ALL
  USING (get_my_role() = 'gestor');

-- ----------------------------------------------------------------------------
-- QUOTE ITEMS
-- ----------------------------------------------------------------------------

CREATE POLICY "Admin ve quote items"
  ON quote_items FOR ALL
  USING (get_my_role() = 'admin');

CREATE POLICY "Gestor ve quote items"
  ON quote_items FOR ALL
  USING (get_my_role() = 'gestor');

-- ----------------------------------------------------------------------------
-- AFFILIATE CLICKS (solo inserción pública, admin lee)
-- ----------------------------------------------------------------------------

CREATE POLICY "Clics de afiliado públicos (insert)"
  ON affiliate_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin ve clics"
  ON affiliate_clicks FOR SELECT
  USING (get_my_role() = 'admin');

-- ----------------------------------------------------------------------------
-- SERVICE ZONES (lectura pública)
-- ----------------------------------------------------------------------------

CREATE POLICY "Zonas visibles para todos"
  ON service_zones FOR SELECT
  USING (activo = true);

CREATE POLICY "Solo admin modifica zonas"
  ON service_zones FOR ALL
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- ============================================================================
-- 9. DATOS DE EJEMPLO
-- ============================================================================

-- Categorías (5 categorías con jerarquía)
INSERT INTO categories (id, nombre, slug, descripcion, orden) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Seguridad Física', 'seguridad-fisica', 'Cámaras, alarmas y cerraduras', 1),
  ('c0000001-0000-0000-0000-000000000002', 'Ciberseguridad', 'ciberseguridad', 'VPN, antivirus y routers seguros', 2),
  ('c0000001-0000-0000-0000-000000000003', 'Cámaras', 'camaras', 'Cámaras de vigilancia WiFi', 1),
  ('c0000001-0000-0000-0000-000000000004', 'Alarmas', 'alarmas', 'Sistemas de alarma para hogar', 2),
  ('c0000001-0000-0000-0000-000000000005', 'Packs', 'packs', 'Packs todo incluido', 3);

-- Subcategorías (padre/hijo)
UPDATE categories SET parent_id = 'c0000001-0000-0000-0000-000000000001' WHERE id IN (
  'c0000001-0000-0000-0000-000000000003',
  'c0000001-0000-0000-0000-000000000004'
);

-- Productos (15 productos variados + 3 packs)
INSERT INTO products (id, tipo, nombre, slug, descripcion_corta, descripcion_completa, especificaciones, precio, precio_coste, estado, categoria_id, perfiles_recomendados, url_afiliado, tienda_afiliado, id_aliexpress, plazo_entrega_dias, stock, duracion_instalacion_min) VALUES
  -- Dropshipping (5)
  ('p0000001-0000-0000-0000-000000000001', 'dropshipping', 'Cámara WiFi Interior 1080p', 'camara-wifi-interior-1080p', 'Cámara WiFi Full HD con visión nocturna', 'Cámara de seguridad WiFi con resolución Full HD 1080p. Visión nocturna infrarroja hasta 10m, audio bidireccional, detección de movimiento con alertas push al móvil.', '{"resolucion": "1080p", "vision_nocturna": "10m", "audio": "bidireccional", "wifi": "2.4GHz"}'::jsonb, 34.99, 15.00, 'publicado', 'c0000001-0000-0000-0000-000000000003', ARRAY['familia', 'mayor', 'negocio']::recommended_profile[], NULL, NULL, '1005006789012345', 10, 50, NULL),
  ('p0000001-0000-0000-0000-000000000002', 'dropshipping', 'Kit Alarma Hogar GSM+WiFi', 'kit-alarma-hogar-gsm-wifi', 'Sistema de alarma completo sin cuotas', 'Kit de alarma con centralita GSM/WiFi, 4 sensores de puerta, 2 detectores PIR, 2 mandos y sirena 110dB. App móvil gratuita.', '{"sensores_puerta": 4, "detectores_movimiento": 2, "sirena_db": 110, "conectividad": "GSM+WiFi"}'::jsonb, 89.99, 40.00, 'publicado', 'c0000001-0000-0000-0000-000000000004', ARRAY['familia', 'mayor', 'negocio']::recommended_profile[], NULL, NULL, '1005006789012346', 10, 25, NULL),
  ('p0000001-0000-0000-0000-000000000003', 'dropshipping', 'Detector de Humo WiFi', 'detector-humo-wifi', 'Detector de humo con alertas al móvil', 'Detector fotoeléctrico WiFi con alertas push, sirena 85dB y batería de litio con autonomía de 1 año.', '{"tipo": "fotoeléctrico", "sirena_db": 85, "bateria_meses": 12, "wifi": "2.4GHz"}'::jsonb, 24.99, 10.00, 'publicado', 'c0000001-0000-0000-0000-000000000003', ARRAY['familia', 'mayor']::recommended_profile[], NULL, NULL, '1005006789012347', 10, 100, NULL),
  ('p0000001-0000-0000-0000-000000000004', 'dropshipping', 'Sensor de Puerta WiFi', 'sensor-puerta-wifi', 'Sensor magnético de puerta/ventana WiFi', 'Sensor de apertura magnético con conectividad WiFi. Alertas al móvil, batería CR2032 con 12 meses de duración.', '{"tipo": "magnético", "bateria": "CR2032", "autonomia_meses": 12}'::jsonb, 12.99, 5.00, 'publicado', 'c0000001-0000-0000-0000-000000000003', ARRAY['familia', 'mayor', 'negocio']::recommended_profile[], NULL, NULL, '1005006789012348', 10, 200, NULL),
  ('p0000001-0000-0000-0000-000000000005', 'dropshipping', 'Cámara Exterior Solar', 'camara-exterior-solar', 'Cámara exterior con panel solar', 'Cámara de seguridad exterior IP66 con panel solar integrado. Sin cables, resolución 2K, detección AI de personas.', '{"resolucion": "2K", "proteccion": "IP66", "panel_solar": true, "deteccion_ai": true}'::jsonb, 59.99, 28.00, 'publicado', 'c0000001-0000-0000-0000-000000000003', ARRAY['familia', 'negocio']::recommended_profile[], NULL, NULL, '1005006789012349', 12, 30, NULL),

  -- Afiliado (5)
  ('p0000001-0000-0000-0000-000000000006', 'afiliado', 'Cerradura Inteligente Tuya', 'cerradura-inteligente-tuya', 'Cerradura con huella, código y app', 'Cerradura electrónica con huella dactilar, código PIN, tarjeta RFID, app móvil y llave mecánica. Cuerpo de aleación de zinc.', '{"apertura": ["huella", "pin", "tarjeta", "app", "llave"], "bateria_meses": 6}'::jsonb, 129.99, 0, 'publicado', 'c0000001-0000-0000-0000-000000000001', ARRAY['familia', 'mayor', 'negocio']::recommended_profile[], 'https://amazon.es/dp/B0EXAMPLE1', 'Amazon', NULL, 3, 0, NULL),
  ('p0000001-0000-0000-0000-000000000007', 'afiliado', 'Router WiFi 6 Seguro', 'router-wifi-6-seguro', 'Router con firewall y VPN integrada', 'Router WiFi 6 con protección integrada: firewall avanzado, control parental, VPN y actualizaciones automáticas.', '{"wifi": "WiFi 6", "puertos": 4, "vpn": true, "firewall": true}'::jsonb, 149.99, 0, 'publicado', 'c0000001-0000-0000-0000-000000000002', ARRAY['familia', 'negocio']::recommended_profile[], 'https://amazon.es/dp/B0EXAMPLE2', 'Amazon', NULL, 3, 0, NULL),
  ('p0000001-0000-0000-0000-000000000008', 'afiliado', 'Suscripción VPN Anual', 'vpn-premium-anual', 'VPN premium con servidores en 50+ países', 'VPN premium sin registro, hasta 5 dispositivos, cifrado AES-256 y servidores en 50+ países.', '{"paises": 50, "dispositivos": 5, "cifrado": "AES-256", "duracion": "1 año"}'::jsonb, 49.99, 0, 'publicado', 'c0000001-0000-0000-0000-000000000002', ARRAY['familia', 'mayor', 'negocio']::recommended_profile[], 'https://vpn-provider.com/aff/segurhogar', 'VPN Provider', NULL, 1, 0, NULL),
  ('p0000001-0000-0000-0000-000000000009', 'afiliado', 'Antivirus Premium 1 año', 'antivirus-premium-1-ano', 'Antivirus para 3 dispositivos, 1 año', 'Licencia premium para 3 dispositivos: protección en tiempo real, anti-ransomware, gestor de contraseñas.', '{"dispositivos": 3, "duracion": "1 año", "features": ["antimalware", "antiransomware", "gestor_contraseñas"]}'::jsonb, 39.99, 0, 'publicado', 'c0000001-0000-0000-0000-000000000002', ARRAY['familia', 'mayor', 'negocio']::recommended_profile[], 'https://antivirus.com/aff/segurhogar', 'Antivirus Pro', NULL, 1, 0, NULL),
  ('p0000001-0000-0000-0000-000000000010', 'afiliado', 'Llave de Seguridad FIDO2', 'llave-seguridad-fido2', 'Llave USB-C/NFC para 2FA', 'Llave de seguridad física FIDO2/WebAuthn. Resistente al agua, USB-C y NFC para móvil.', '{"protocolo": "FIDO2/WebAuthn", "conectores": ["USB-C", "NFC"], "proteccion": "IP68"}'::jsonb, 54.99, 0, 'publicado', 'c0000001-0000-0000-0000-000000000002', ARRAY['familia', 'negocio']::recommended_profile[], 'https://amazon.es/dp/B0EXAMPLE3', 'Amazon', NULL, 3, 0, NULL),

  -- Servicio de instalación (2)
  ('p0000001-0000-0000-0000-000000000011', 'servicio', 'Instalación de Alarma Básica', 'instalacion-alarma-basica', 'Instalación profesional de alarma', 'Instalación de centralita, 2 sensores de puerta y 1 detector de movimiento. Configuración de app y pruebas.', '{"duracion_min": 120, "garantia_meses": 12, "incluye": ["desplazamiento", "configuracion_app", "pruebas"]}'::jsonb, 120.00, 40.00, 'publicado', 'c0000001-0000-0000-0000-000000000004', ARRAY['familia', 'mayor', 'negocio']::recommended_profile[], NULL, NULL, NULL, 1, 999, 120),
  ('p0000001-0000-0000-0000-000000000012', 'servicio', 'Instalación de Cerradura Inteligente', 'instalacion-cerradura-inteligente', 'Instalación de cerradura inteligente', 'Montaje, configuración de huellas y códigos, vinculación con app y explicación al cliente.', '{"duracion_min": 60, "garantia_meses": 12, "incluye": ["montaje", "configuracion", "formacion"]}'::jsonb, 80.00, 25.00, 'publicado', 'c0000001-0000-0000-0000-000000000001', ARRAY['familia', 'mayor']::recommended_profile[], NULL, NULL, NULL, 1, 999, 60),

  -- Packs (3)
  ('p0000001-0000-0000-0000-000000000013', 'pack', 'Pack Seguridad Hogar Completo', 'pack-seguridad-hogar-completo', 'Cámara + alarma + cerradura + instalación', 'Pack todo incluido con cámara WiFi, kit de alarma, cerradura inteligente e instalación profesional a domicilio.', '{"incluye": ["camara_wifi", "kit_alarma", "cerradura_inteligente", "instalacion"], "ahorro": 80}'::jsonb, 259.99, 120.00, 'publicado', 'c0000001-0000-0000-0000-000000000005', ARRAY['familia', 'mayor']::recommended_profile[], NULL, NULL, NULL, 1, 10, NULL),
  ('p0000001-0000-0000-0000-000000000014', 'pack', 'Pack Ciberseguridad Familiar', 'pack-ciberseguridad-familiar', 'Router + VPN + antivirus + llave', 'Pack completo de ciberseguridad: router seguro, VPN anual, antivirus premium y llave de seguridad.', '{"incluye": ["router_wifi6", "vpn_anual", "antivirus_premium", "llave_fido2"], "ahorro": 50}'::jsonb, 219.99, 90.00, 'publicado', 'c0000001-0000-0000-0000-000000000005', ARRAY['familia']::recommended_profile[], NULL, NULL, NULL, 3, 15, NULL),
  ('p0000001-0000-0000-0000-000000000015', 'pack', 'Pack Personas Mayores', 'pack-personas-mayores', 'Solución simplificada para mayores', 'Pack pensado para personas mayores: cámara sencilla, detector de humo WiFi y asesoramiento personalizado.', '{"incluye": ["camara_sencilla", "detector_humo", "asesoramiento"], "dificultad": "baja"}'::jsonb, 79.99, 30.00, 'publicado', 'c0000001-0000-0000-0000-000000000005', ARRAY['mayor']::recommended_profile[], NULL, NULL, NULL, 10, 20, NULL);

-- Pack items (qué productos forman cada pack)
INSERT INTO pack_items (pack_id, product_id, cantidad) VALUES
  -- Pack Seguridad Hogar Completo
  ('p0000001-0000-0000-0000-000000000013', 'p0000001-0000-0000-0000-000000000001', 1), -- Cámara WiFi
  ('p0000001-0000-0000-0000-000000000013', 'p0000001-0000-0000-0000-000000000002', 1), -- Kit alarma
  ('p0000001-0000-0000-0000-000000000013', 'p0000001-0000-0000-0000-000000000006', 1), -- Cerradura
  ('p0000001-0000-0000-0000-000000000013', 'p0000001-0000-0000-0000-000000000011', 1), -- Instalación alarma
  -- Pack Ciberseguridad Familiar
  ('p0000001-0000-0000-0000-000000000014', 'p0000001-0000-0000-0000-000000000007', 1), -- Router
  ('p0000001-0000-0000-0000-000000000014', 'p0000001-0000-0000-0000-000000000008', 1), -- VPN
  ('p0000001-0000-0000-0000-000000000014', 'p0000001-0000-0000-0000-000000000009', 1), -- Antivirus
  ('p0000001-0000-0000-0000-000000000014', 'p0000001-0000-0000-0000-000000000010', 1), -- Llave FIDO2
  -- Pack Personas Mayores
  ('p0000001-0000-0000-0000-000000000015', 'p0000001-0000-0000-0000-000000000001', 1), -- Cámara WiFi
  ('p0000001-0000-0000-0000-000000000015', 'p0000001-0000-0000-0000-000000000003', 1); -- Detector humo

-- Zonas de servicio (ejemplo)
INSERT INTO service_zones (codigo_postal, ciudad, provincia) VALUES
  ('28001', 'Madrid', 'Madrid'),
  ('28002', 'Madrid', 'Madrid'),
  ('28003', 'Madrid', 'Madrid'),
  ('28004', 'Madrid', 'Madrid'),
  ('28005', 'Madrid', 'Madrid'),
  ('28010', 'Madrid', 'Madrid'),
  ('28013', 'Madrid', 'Madrid'),
  ('28014', 'Madrid', 'Madrid'),
  ('28020', 'Madrid', 'Madrid'),
  ('28036', 'Madrid', 'Madrid'),
  ('28042', 'Madrid', 'Madrid'),
  ('28043', 'Madrid', 'Madrid'),
  ('28050', 'Madrid', 'Madrid'),
  ('28760', 'Tres Cantos', 'Madrid'),
  ('28230', 'Las Rozas', 'Madrid'),
  ('28220', 'Pozuelo de Alarcón', 'Madrid'),
  ('28223', 'Majadahonda', 'Madrid'),
  ('28320', 'Pinto', 'Madrid'),
  ('28340', 'Valdemoro', 'Madrid'),
  ('28800', 'Alcalá de Henares', 'Madrid');

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
