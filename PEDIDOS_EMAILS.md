# Gestión de Pedidos y Emails Automáticos - Paso 8

## ✅ Implementación completada

### Archivos creados/modificados:

**Hooks actualizados:**
- `src/hooks/useOrders.ts` — Hooks completos para gestión de pedidos:
  - `useOrders()` — Lista con filtros avanzados
  - `useOrder()` — Detalle completo
  - `useUpdateOrderStatus()` — Cambio de estado con email automático
  - `useUpdateOrderNotes()` — Notas internas
  - `useReportIncident()` — Reportar incidencias
  - `useProcessReturn()` — Procesar devoluciones
  - `useOrderStats()` — Estadísticas

**Páginas del panel:**
- `src/pages/panel/OrdersPage.tsx` — Lista de pedidos con filtros y búsqueda
- `src/pages/panel/OrderDetailPage.tsx` — Detalle completo del pedido

**Edge Function:**
- `supabase/functions/send-email/index.ts` — Envío de emails con Resend

**Rutas:**
- `src/App.tsx` — Nueva ruta `/panel/pedidos/:id`

---

## 📋 Lista de pedidos

### Filtros disponibles
- **Búsqueda**: por número de pedido o nombre de cliente
- **Estado**: filtro por cualquier estado del pedido
- **Rango de fechas**: desde/hasta
- **Paginación**: 20 pedidos por página

### Indicador visual de retrasos
- Pedidos con más de 10 días sin entregar se muestran con:
  - Fondo rojo claro (`bg-red-50`)
  - Icono de alerta ⚠️ junto al número de pedido

### Acciones rápidas
- Botón "Ver" para acceder al detalle del pedido

---

## 📄 Detalle del pedido

### Información mostrada
- **Productos**: lista completa con cantidades y precios
- **Totales**: subtotal, IVA, total
- **Cliente**: nombre, email, teléfono
- **Dirección de envío**: dirección completa
- **Facturación**: datos fiscales si aplica
- **Historial**: todos los cambios de estado con fechas y notas

### Cambio de estado
- Selector con todos los estados disponibles
- Campo de notas opcional para el cambio
- Campo de número de seguimiento (solo para estado "en_transito")
- **Envío automático de email** al cambiar el estado

### Notas internas
- Textarea para notas del equipo (solo visibles para admin/gestor)
- Se guardan en el campo `notas_internas` del pedido

### Acciones especiales
- **Reportar incidencia**: cambia estado a "incidencia" con motivo y descripción
- **Procesar devolución**: cambia estado a "devuelto" con motivo

---

## 📧 Emails automáticos con Resend

### Edge Function: send-email

**Eventos soportados:**
- `order_confirmed` — Pedido confirmado (estado: pagado)
- `order_shipped` — Pedido enviado (estado: en_transito)
- `installation_confirmed` — Instalación confirmada
- `installation_completed` — Instalación completada

**Plantillas HTML:**
- Diseño responsive con marca SegurHogar
- Colores corporativos: azul oscuro #0B1F3A, azul #2D7FF9
- Header con logo
- Footer con contacto
- Contenido específico para cada evento

### Flujo de envío automático

1. Admin/gestor cambia estado del pedido
2. Hook `useUpdateOrderStatus` ejecuta:
   - Actualiza estado en BD
   - Registra cambio en historial
   - Llama a Edge Function `send-email`
3. Edge Function:
   - Obtiene pedido completo con items
   - Genera HTML según el evento
   - Envía email con Resend
   - No bloquea si el email falla

### Configuración de Resend

1. Crear cuenta en [resend.com](https://resend.com)
2. Verificar dominio (ej: segurhogar.es)
3. Obtener API Key
4. Configurar en Supabase → Settings → Secrets:
   ```
   RESEND_API_KEY=re_tu_api_key
   ```

### Desplegar Edge Function

```bash
supabase functions deploy send-email
```

---

## 🔧 Gestión de incidencias y devoluciones

### Reportar incidencia
1. Click en "Reportar incidencia"
2. Introducir motivo y descripción
3. Estado cambia a "incidencia"
4. Se registra en historial con detalles
5. Se añade a notas internas

### Procesar devolución
1. Click en "Procesar devolución"
2. Introducir motivo
3. Estado cambia a "devuelto"
4. Se registra en historial
5. Se añade a notas internas

---

## 🎨 Diseño visual

### Indicadores de estado
- **Pagado/Entregado**: badge verde
- **Incidencia/Cancelado**: badge rojo
- **En tránsito/Enviado**: badge amarillo
- **Otros**: badge gris

### Pedidos retrasados
- Fondo rojo claro en la fila
- Icono de alerta ⚠️
- Título "Pedido retrasado" al pasar el ratón

### Historial de cambios
- Timeline visual con puntos azules
- Badges de estado anterior y nuevo
- Fecha y hora del cambio
- Notas del cambio si existen

---

## 🧪 Cómo probar

### 1. Configurar Resend
- Crear cuenta en resend.com
- Verificar dominio
- Añadir `RESEND_API_KEY` en Supabase Secrets

### 2. Desplegar Edge Function
```bash
supabase functions deploy send-email
```

### 3. Probar lista de pedidos
- Ir a `/panel/pedidos`
- Probar filtros (estado, búsqueda, fechas)
- Ver pedidos retrasados con indicador visual
- Probar paginación

### 4. Probar detalle de pedido
- Click en "Ver" en cualquier pedido
- Ver productos, cliente, dirección, totales
- Ver historial de cambios

### 5. Probar cambio de estado
- Seleccionar nuevo estado
- Añadir notas (opcional)
- Si es "en_transito", añadir número de seguimiento
- Click en "Actualizar estado"
- Verificar que:
  - Estado cambia
  - Se registra en historial
  - Se envía email automático (revisar bandeja de entrada)

### 6. Probar incidencias
- Click en "Reportar incidencia"
- Introducir motivo y descripción
- Verificar que estado cambia a "incidencia"
- Verificar que se registra en historial

### 7. Probar devoluciones
- Click en "Procesar devolución"
- Introducir motivo
- Verificar que estado cambia a "devuelto"

---

## 🔒 Seguridad

- ✅ Solo admin y gestor pueden ver pedidos
- ✅ Solo admin y gestor pueden cambiar estados
- ✅ Emails se envían desde Edge Function (no expone API keys)
- ✅ Historial de cambios auditado
- ✅ Notas internas solo visibles para el equipo

---

## 📊 Estructura de datos

### Pedido
```typescript
{
  id: string;
  numero: string;
  estado: OrderStatus;
  subtotal: number;
  iva: number;
  total: number;
  // Envío
  envio_nombre: string;
  envio_telefono: string;
  envio_calle: string;
  envio_codigo_postal: string;
  envio_ciudad: string;
  envio_provincia: string;
  // Facturación
  factura_nombre?: string;
  factura_nif?: string;
  // Notas
  notas_cliente?: string;
  notas_internas?: string;
  // Pagos
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  pagado_en?: string;
  // Timestamps
  created_at: string;
  updated_at: string;
}
```

### Historial de estado
```typescript
{
  id: string;
  order_id: string;
  estado_anterior: OrderStatus | null;
  estado_nuevo: OrderStatus;
  notas?: string;
  created_at: string;
}
```

---

## 🚀 Próximos pasos

- Implementar emails de instalación con fecha/hora específicas
- Añadir plantillas para otros eventos (cancelado, incidencia)
- Implementar seguimiento de envíos con API externa
- Añadir sistema de notificaciones push
- Implementar facturas en PDF
- Añadir sistema de valoraciones post-entrega
- Implementar chat con clientes
