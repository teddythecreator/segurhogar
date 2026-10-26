# Módulo de Instalaciones - Paso 9

## ✅ Implementación completada

### Archivos creados/modificados:

**Dependencias instaladas:**
- `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`
- `react-signature-canvas`

**Hooks:**
- `src/hooks/useInstallations.ts` — Hooks completos para gestión de instalaciones

**Componentes:**
- `src/components/panel/installations/InstallationCalendar.tsx` — Calendario con FullCalendar

**Páginas admin/gestor:**
- `src/pages/panel/InstallationsPage.tsx` — Vista con calendario y lista
- `src/pages/panel/InstallationDetailPage.tsx` — Detalle completo de instalación
- `src/pages/panel/NewInstallationPage.tsx` — Crear instalación manual

**Páginas instalador:**
- `src/pages/panel/MyAgendaPage.tsx` — Agenda móvil completa con todas las funcionalidades

**Migraciones:**
- `supabase/migrations/add_installation_tracking_fields.sql` — Campos fecha_llegada y fecha_realizacion

**Storage:**
- `supabase/storage-installations.sql` — Buckets para fotos y firmas

**Tipos:**
- `src/types/database.ts` — Actualizado con nuevos campos

**Rutas:**
- `src/App.tsx` — Nuevas rutas `/panel/instalaciones/nueva` y `/panel/instalaciones/:id`

---

## 📅 Vista Admin/Gestor

### Calendario con FullCalendar

**Características:**
- Vistas de mes y semana
- Instalaciones coloreadas por estado:
  - 🟡 Solicitada (amarillo)
  - 🔵 Confirmada (azul)
  - 🟣 Asignada (púrpura)
  - 🟢 Realizada (verde)
  - ⚫ Cerrada (gris)
  - 🔴 Cancelada (rojo)
- Click en evento → detalle de instalación
- Locale español
- Responsive

**Estilos personalizados:**
- Colores corporativos (#0B1F3A, #2D7FF9)
- Botones con hover y estados activos
- Eventos con cursor pointer y bordes redondeados

### Lista con filtros

**Filtros disponibles:**
- Estado de la instalación
- Instalador asignado
- Rango de fechas (desde/hasta)

**Columnas:**
- Fecha y hora
- Cliente
- Dirección (ciudad)
- Instalador
- Estado (badge)
- Acciones (ver detalle)

### Detalle de instalación

**Información mostrada:**
- Fecha, hora y estado
- Instalador asignado con teléfono
- Dirección con enlace a Google Maps
- Productos del pedido (si existe)
- Indicador de si los productos están entregados
- Cliente con teléfono clickeable
- Notas
- Fotos (galería)
- Firma del cliente

**Acciones:**
- Editar fecha, hora, estado e instalador
- Ver en Google Maps
- Llamar al cliente
- Ver fotos en tamaño completo
- Ver firma en tamaño completo

### Crear instalación manual

**Formulario:**
- Selector de cliente
- Selector de instalador
- Fecha y horas
- Dirección completa
- Notas

**Validaciones:**
- Cliente obligatorio
- Fecha obligatoria
- Dirección obligatoria

---

## 📱 Vista Instalador (Móvil)

### Agenda del día

**Tarjetas grandes y fáciles de pulsar:**
- Nombre del cliente
- Fecha y hora
- Estado (badge)
- Ciudad

**Separadas por:**
- Instalaciones de hoy
- Próximos días

### Detalle de instalación

**Acciones rápidas:**
- 📞 **Botón Llamar**: abre app de teléfono con número del cliente
- 🗺️ **Botón Cómo llegar**: abre Google Maps con la dirección

**Información:**
- Nombre del cliente
- Fecha y hora
- Estado
- Dirección completa
- Productos a instalar (con cantidades)

### Botón "He llegado"

- Solo visible si la instalación está en estado "asignada"
- Registra la hora de llegada en `fecha_llegada`
- Muestra confirmación con hora registrada
- Se oculta después de registrar

### Checklist de tareas

- Lista de tareas personalizables
- Checkbox para marcar como completada
- Botón "+ Añadir tarea" para crear nuevas
- Las tareas se guardan en el campo `checklist` (jsonb)
- Se pueden editar las etiquetas

### Subida de fotos

- Botón "Tomar foto" que abre la cámara del móvil
- Usa `capture="environment"` para cámara trasera
- Sube automáticamente a Supabase Storage
- Galería de fotos subidas en grid 3x3
- Validación: solo imágenes (JPG, PNG, WebP)
- Tamaño máximo: 10MB por foto

### Firma del cliente

- Canvas de firma con `react-signature-canvas`
- Área de firma con borde punteado
- Tinta negra
- Botón "Guardar firma" que:
  - Convierte a PNG
  - Sube a Storage bucket `installation-signatures`
  - Guarda URL en `firma_url`
- Botón "Cancelar" para limpiar y cerrar

### Notas del instalador

- Textarea para observaciones
- Incidencias encontradas
- Comentarios sobre el trabajo
- Se guardan en `notas_instalador`

### Botón "Marcar como realizada"

**Condiciones para activarse:**
- ✅ Firma del cliente obtenida
- ✅ Al menos una foto subida

**Al hacer click:**
1. Cambia estado a "realizada"
2. Registra `fecha_realizacion`
3. Envía email de confirmación al cliente
4. Limpia la vista y vuelve a la agenda

**Si faltan requisitos:**
- Muestra mensaje: "Debes obtener la firma del cliente y subir al menos una foto"
- Botón deshabilitado

---

## 🗄️ Base de datos

### Nuevos campos en installations

```sql
fecha_llegada timestamptz      -- Hora de llegada del instalador
fecha_realizacion timestamptz  -- Hora de finalización
```

### Buckets de Storage

**installation-photos:**
- Público (lectura)
- Tamaño máximo: 10MB
- Tipos: JPG, PNG, WebP
- Política: instaladores pueden subir fotos de sus instalaciones

**installation-signatures:**
- Público (lectura)
- Tamaño máximo: 1MB
- Tipos: PNG
- Política: instaladores pueden subir firmas

---

## 🔧 Configuración

### 1. Ejecutar migraciones

```sql
-- En Supabase SQL Editor

-- 1. Campos de tracking
-- Contenido de supabase/migrations/add_installation_tracking_fields.sql

-- 2. Buckets de storage
-- Contenido de supabase/storage-installations.sql
```

### 2. Verificar buckets

En Supabase → Storage:
- `installation-photos` debe existir
- `installation-signatures` debe existir

---

## 🧪 Cómo probar

### Vista Admin/Gestor

1. **Ir a `/panel/instalaciones`**
2. **Vista calendario:**
   - Navegar entre meses
   - Cambiar a vista semana
   - Click en una instalación → ver detalle
3. **Vista lista:**
   - Probar filtros (estado, instalador, fechas)
   - Click en "Ver" → ver detalle
4. **Detalle de instalación:**
   - Editar fecha/hora/estado/instalador
   - Ver dirección en Google Maps
   - Ver productos del pedido
   - Ver fotos y firma
5. **Crear instalación manual:**
   - Click en "Nueva instalación"
   - Seleccionar cliente
   - Completar formulario
   - Guardar

### Vista Instalador (móvil)

1. **Login como instalador**
2. **Ir a `/panel/mi-agenda`**
3. **Ver agenda:**
   - Tarjetas de hoy
   - Tarjetas de próximos días
4. **Click en una instalación:**
   - Ver detalle completo
   - Botón "Llamar" → abre teléfono
   - Botón "Cómo llegar" → abre Google Maps
5. **Botón "He llegado":**
   - Click para registrar hora
   - Ver confirmación
6. **Checklist:**
   - Añadir tareas
   - Marcar como completadas
7. **Subir fotos:**
   - Click en "Tomar foto"
   - Tomar foto con cámara
   - Ver galería
8. **Firma:**
   - Click en "Obtener firma"
   - Firmar en el canvas
   - Guardar firma
9. **Completar instalación:**
   - Añadir notas (opcional)
   - Click en "Marcar como realizada"
   - Verificar que cambia estado
   - Verificar email enviado

---

## 🎨 Diseño mobile-first

### Principios aplicados:
- **Tarjetas grandes** con padding generoso
- **Botones grandes** fáciles de pulsar con el dedo
- **Iconos claros** con etiquetas
- **Espaciado generoso** entre elementos
- **Tipografía legible** en pantallas pequeñas
- **Acciones contextuales** en cada paso del flujo

### Flujo del instalador:
1. Ver agenda → 2. Seleccionar instalación → 3. Llamar/Cómo llegar → 4. "He llegado" → 5. Checklist → 6. Fotos → 7. Firma → 8. Completar

---

## 🔒 Seguridad

- ✅ Solo admin/gestor pueden ver todas las instalaciones
- ✅ Instaladores solo ven sus instalaciones asignadas
- ✅ RLS en buckets de Storage
- ✅ Fotos y firmas públicas (para que el cliente pueda verlas)
- ✅ Solo instaladores pueden subir fotos/firmas
- ✅ Admin/gestor pueden gestionar todo

---

## 📊 Estructura de datos

### Installation (actualizada)
```typescript
{
  id: string;
  order_id: string | null;
  customer_id: string;
  instalador_id: string | null;
  estado: InstallationStatus;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  // Dirección
  direccion_calle: string;
  direccion_codigo_postal: string;
  direccion_ciudad: string;
  direccion_provincia: string | null;
  // Detalles
  checklist: InstallationChecklistItem[];
  firma_url: string | null;
  notas: string | null;
  notas_instalador: string | null;
  // Tracking
  fecha_llegada: string | null;
  fecha_realizacion: string | null;
  // Timestamps
  created_at: string;
  updated_at: string;
  // Relaciones
  customer?: Customer;
  instalador?: Profile;
  order?: Order;
  photos?: InstallationPhoto[];
}
```

---

## 🚀 Próximos pasos

- Implementar geolocalización del instalador
- Añadir mapa con ruta óptima
- Implementar chat entre instalador y cliente
- Añadir sistema de valoraciones post-instalación
- Implementar firma digital con validación biométrica
- Añadir modo offline para zonas sin cobertura
- Implementar sincronización automática de fotos
- Añadir sistema de incidencias en tiempo real
