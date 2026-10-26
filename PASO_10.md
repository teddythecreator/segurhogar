# Paso 10: Clientes, Presupuestos, Facturas, Afiliación e Informes

## ✅ Implementación completada

### Módulos creados:

#### 1. CRM de Clientes
- **Lista de clientes** con filtros por tipo (particular/empresa/administrador) y búsqueda
- **Ficha de cliente** con datos completos, historial de pedidos, instalaciones y presupuestos
- **Notas** editables por cliente
- **Hooks**: `useCustomers`, `useCustomer`, `useCreateCustomer`, `useUpdateCustomer`, `useUpdateCustomerNotes`

#### 2. Presupuestos
- **Lista de presupuestos** con filtros por estado (borrador/enviado/aceptado/rechazado)
- **Hooks**: `useQuotes`, `useQuote`, `useCreateQuote`, `useUpdateQuote`, `useConvertQuoteToOrder`
- **Funcionalidad "Convertir en pedido"**: transforma un presupuesto aceptado en un pedido automáticamente

#### 3. Facturas
- **Numeración correlativa** automática (FAC-2024-0001, FAC-2024-0002, etc.)
- **Hooks**: `useInvoices`, `useNextInvoiceNumber`
- **Campos añadidos**: `factura_numero` y `factura_fecha` en tabla `orders`

#### 4. Afiliación
- **Estadísticas de clics** por producto y tienda
- **Gráficos** con Recharts (gráfico de barras y circular)
- **Registro manual de comisiones** cobradas
- **Historial de comisiones** con fecha, tienda, importe y notas
- **Hooks**: `useAffiliateClicks`, `useAffiliateStats`, `useAffiliateCommissions`, `useCreateAffiliateCommission`, `useTrackAffiliateClick`

#### 5. Informes
- **Ingresos por tipo de producto** (gráfico circular)
- **Productos más vendidos** (gráfico de barras)
- **Instalaciones por instalador** (gráfico de barras)
- **Filtros por fechas** (desde/hasta)
- **Exportación a CSV** de pedidos pagados
- **Resumen**: ingresos totales, pedidos pagados, ticket medio
- **Hooks**: `useSalesReport`, `useTopProductsReport`, `useInstallationsByInstallerReport`

---

## 📊 Estructura de datos

### Nuevos campos en `orders`:
```sql
factura_numero TEXT    -- Número de factura (FAC-2024-0001)
factura_fecha DATE     -- Fecha de emisión de factura
```

### Nueva tabla `affiliate_commissions`:
```sql
id UUID PRIMARY KEY
tienda TEXT NOT NULL           -- Nombre de la tienda (Amazon, etc.)
fecha DATE NOT NULL            -- Fecha de la comisión
importe DECIMAL(10,2) NOT NULL -- Importe cobrado
notas TEXT                     -- Notas opcionales
created_at TIMESTAMP
```

---

## 🎨 Páginas del panel

### Clientes (`/panel/clientes`)
- Tabla con nombre, email, teléfono, tipo, ciudad
- Filtros por tipo y búsqueda
- Enlace a ficha de cliente

### Presupuestos (`/panel/presupuestos`)
- Tabla con número, cliente, fecha, total, estado
- Filtro por estado
- Badges de colores según estado

### Afiliación (`/panel/afiliacion`)
- 3 tarjetas de resumen (clics totales, productos únicos, tiendas)
- Gráfico circular de clics por tienda
- Gráfico de barras de top 5 productos
- Formulario para registrar comisiones
- Tabla de historial de comisiones

### Informes (`/panel/informes`)
- Filtros de fecha (desde/hasta)
- 3 tarjetas de resumen (ingresos, pedidos, ticket medio)
- Gráfico circular de ingresos por tipo
- Gráfico de barras de productos más vendidos
- Gráfico de barras de instalaciones por instalador
- Botón de exportación a CSV

---

## 🔧 Configuración de base de datos

### Ejecutar migración:
```bash
# En Supabase SQL Editor, ejecutar:
# supabase/migrations/010_add_invoicing_and_commissions.sql
```

**Contenido de la migración:**
- Añade campos `factura_numero` y `factura_fecha` a `orders`
- Crea tabla `affiliate_commissions`
- Habilita RLS con políticas para admin y gestores
- Crea índices para mejorar rendimiento

---

## 📈 Gráficos con Recharts

### Tipos de gráficos utilizados:
- **PieChart**: Ingresos por tipo, clics por tienda
- **BarChart**: Productos más vendidos, instalaciones por instalador
- **LineChart**: Disponible para series temporales (no usado aún)

### Configuración:
- Colores corporativos: `#3B82F6`, `#10B981`, `#F59E0B`, `#EF4444`, `#8B5CF6`
- Tooltips con formato de moneda (€)
- Leyendas en español
- Responsive (se adapta al contenedor)

---

## 📄 Exportación a CSV

### Funcionalidad:
- Botón "Exportar a CSV" en página de informes
- Genera archivo con todos los pedidos pagados
- Columnas: Número, Fecha, Cliente, Total, Estado
- Nombre de archivo: `informe-ventas-YYYY-MM-DD.csv`

### Implementación:
```typescript
const exportToCSV = () => {
  const csv = [
    ['Número', 'Fecha', 'Cliente', 'Total', 'Estado'],
    ...orders.map(order => [...])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `informe-ventas-${fecha}.csv`;
  a.click();
};
```

---

## 🔄 Conversión de presupuesto a pedido

### Flujo:
1. Usuario crea presupuesto con productos y líneas libres
2. Presupuesto se envía al cliente (estado: "enviado")
3. Cliente acepta el presupuesto
4. Admin cambia estado a "aceptado"
5. Admin hace clic en "Convertir en pedido"
6. Sistema crea automáticamente:
   - Nuevo pedido con estado "pendiente_pago"
   - Items del pedido copiados del presupuesto
   - Datos del cliente copiados
   - Nota indicando origen (presupuesto)
7. Presupuesto cambia a estado "aceptado"

### Hook `useConvertQuoteToOrder`:
```typescript
const convertToOrder = useConvertQuoteToOrder();

const handleConvert = async () => {
  await convertToOrder.mutateAsync(quoteId);
  // Pedido creado automáticamente
};
```

---

## 💰 Registro de comisiones de afiliados

### Formulario:
- **Tienda**: Nombre de la tienda (Amazon, PcComponentes, etc.)
- **Fecha**: Date picker
- **Importe**: Campo numérico (€)
- **Notas**: Campo de texto opcional

### Validaciones:
- Tienda e importe obligatorios
- Importe debe ser número válido
- Fecha por defecto: hoy

### Historial:
- Tabla con todas las comisiones registradas
- Ordenadas por fecha (más recientes primero)
- Columnas: Fecha, Tienda, Importe, Notas

---

## 🎯 Métricas e informes

### Resumen de ventas:
- **Ingresos totales**: Suma de todos los pedidos pagados
- **Pedidos pagados**: Contador de pedidos con estado "pagado"
- **Ticket medio**: Ingresos totales / número de pedidos

### Ingresos por tipo:
- Agrupa ingresos por tipo de producto (dropshipping, afiliado, servicio, pack)
- Muestra cantidad vendida e ingresos por tipo
- Gráfico circular con porcentajes

### Productos más vendidos:
- Top 10 productos por cantidad vendida
- Muestra nombre, tipo, cantidad e ingresos
- Gráfico de barras horizontal

### Instalaciones por instalador:
- Agrupa instalaciones realizadas por instalador
- Muestra nombre del instalador y número de instalaciones
- Gráfico de barras vertical

---

## 🔒 Seguridad y permisos

### Clientes:
- **Admin y gestor**: Pueden ver y gestionar clientes
- **Instalador**: No tiene acceso

### Presupuestos:
- **Admin y gestor**: Pueden ver y gestionar presupuestos
- **Instalador**: No tiene acceso

### Afiliación:
- **Solo admin**: Acceso completo (estadísticas + registro de comisiones)
- **Gestor**: Solo puede ver estadísticas (política RLS)

### Informes:
- **Solo admin**: Acceso completo a todos los informes
- **Gestor**: No tiene acceso

---

## 🧪 Cómo probar

### 1. Ejecutar migración SQL
```sql
-- En Supabase SQL Editor
-- Copiar y ejecutar contenido de:
-- supabase/migrations/010_add_invoicing_and_commissions.sql
```

### 2. Probar CRM de clientes
- Ir a `/panel/clientes`
- Ver lista de clientes
- Probar filtros por tipo
- Probar búsqueda
- Ver ficha de cliente

### 3. Probar presupuestos
- Ir a `/panel/presupuestos`
- Ver lista de presupuestos
- Probar filtro por estado
- Ver detalle de presupuesto
- Probar "Convertir en pedido" (si hay presupuesto aceptado)

### 4. Probar afiliación
- Ir a `/panel/afiliacion`
- Ver estadísticas de clics
- Ver gráficos
- Registrar nueva comisión
- Ver historial de comisiones

### 5. Probar informes
- Ir a `/panel/informes`
- Probar filtros de fecha
- Ver gráficos de ingresos por tipo
- Ver productos más vendidos
- Ver instalaciones por instalador
- Probar exportación a CSV

---

## 📝 Notas técnicas

### Dependencias añadidas:
- `@react-pdf/renderer`: Para generar PDFs (preparado para futuro uso)
- `recharts`: Ya instalado, usado para gráficos

### Rendimiento:
- Índices creados en campos de búsqueda frecuente
- Queries optimizadas con selects específicos
- Paginación en listas largas

### Próximos pasos sugeridos:
- Implementar generación de PDFs para presupuestos
- Implementar generación de PDFs para facturas
- Añadir envío automático de presupuestos por email
- Añadir firma digital de presupuestos
- Implementar recordatorios de presupuestos pendientes
- Añadir dashboard personalizado por rol
