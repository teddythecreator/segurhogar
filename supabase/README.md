# Base de datos SegurHogar - Supabase

## Script SQL

El archivo `supabase/schema.sql` contiene el script completo para configurar la base de datos en Supabase.

### Qué incluye

**Tablas:**
- `profiles` - Perfiles de usuario vinculados a auth.users
- `customers` - Datos de clientes (familia, mayor, negocio)
- `categories` - Categorías con jerarquía padre/hijo
- `products` - Productos (dropshipping, afiliado, servicio, pack)
- `product_images` - Imágenes de productos
- `pack_items` - Productos que forman un pack
- `orders` - Pedidos con totales e IVA desglosado
- `order_items` - Items de pedido
- `order_status_history` - Historial de cambios de estado
- `installations` - Instalaciones a domicilio
- `installation_photos` - Fotos de instalaciones
- `quotes` - Presupuestos
- `quote_items` - Items de presupuesto
- `affiliate_clicks` - Registro de clics de afiliado
- `service_zones` - Códigos postales donde se instala

**Enums:**
- `user_role`: admin, gestor, instalador, cliente
- `customer_type`: familia, mayor, negocio
- `product_type`: dropshipping, afiliado, servicio, pack
- `product_status`: borrador, publicado
- `order_status`: pendiente_pago, pagado, enviado_proveedor, en_transito, entregado, incidencia, devuelto, cancelado
- `installation_status`: solicitada, confirmada, asignada, realizada, cerrada, cancelada
- `quote_status`: borrador, enviado, aceptado, rechazado

**Funciones:**
- `get_my_role()` - Obtiene el rol del usuario autenticado
- `get_my_id()` - Obtiene el ID del usuario autenticado
- `update_updated_at()` - Trigger para actualizar timestamps

**Triggers:**
- `on_auth_user_created` - Crea un profile con rol "cliente" al registrarse
- Triggers de `updated_at` en todas las tablas

**Row Level Security (RLS):**
- Admin: ve todo
- Gestor: ve pedidos, clientes e instalaciones
- Instalador: solo sus instalaciones asignadas y datos de clientes de esas instalaciones
- Cliente: solo sus propios pedidos
- Productos publicados: visibles para todos

**Datos de ejemplo:**
- 5 categorías (seguridad física, ciberseguridad, cámaras, alarmas, packs)
- 15 productos variados de los 4 tipos
- 3 packs con sus items
- 20 zonas de servicio (códigos postales de Madrid)

## Cómo ejecutar

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor** (menú lateral)
3. Haz clic en **New query**
4. Copia y pega todo el contenido de `supabase/schema.sql`
5. Haz clic en **Run** (o Ctrl+Enter)

El script es idempotente en cuanto a datos, pero las tablas se crearán solo si no existen. Si ya tienes datos, considera hacer backup antes.

## Verificar que funciona

Después de ejecutar el script:

```sql
-- Ver tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Ver productos de ejemplo
SELECT id, nombre, tipo, precio, estado FROM products LIMIT 5;

-- Ver categorías
SELECT id, nombre, slug, parent_id FROM categories;

-- Ver zonas de servicio
SELECT codigo_postal, ciudad FROM service_zones LIMIT 5;
```

## Tipos TypeScript

Los tipos correspondientes están en `src/types/database.ts`.

Incluyen:
- Interfaces para todas las tablas
- Enums como uniones de literales
- Tipos para inserts/updates (campos opcionales)
- Labels para mostrar en la UI

## Próximos pasos

- Conectar el cliente de Supabase en `src/lib/supabase.ts`
- Crear hooks con TanStack Query para consultas
- Implementar el catálogo con filtros
- Implementar el carrito y checkout con Stripe
- Implementar el panel de gestión con RLS
