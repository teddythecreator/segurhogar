# Panel de Gestión - Paso 4

## ✅ Implementación completada

### Archivos creados/modificados:

**Componentes del panel:**
- `src/components/panel/Sidebar.tsx` — Menú lateral con secciones filtradas por rol
- `src/components/panel/PanelLayout.tsx` — Layout actualizado con Sidebar

**Hooks de datos (TanStack Query):**
- `src/hooks/useDashboard.ts` — Datos del dashboard (ventas, pedidos, alertas, gráfico)
- `src/hooks/useOrders.ts` — Pedidos y estadísticas
- `src/hooks/useUsers.ts` — Gestión de usuarios (invitar, cambiar rol)

**Librerías:**
- `src/lib/edge-functions.ts` — Helper para llamar Edge Functions

**Páginas del panel:**
- `src/pages/panel/DashboardPage.tsx` — Dashboard con stats y gráfico Recharts
- `src/pages/panel/UsersPage.tsx` — Gestión de usuarios con invitación
- `src/pages/panel/OrdersPage.tsx` — Placeholder pedidos
- `src/pages/panel/InstallationsPage.tsx` — Placeholder instalaciones
- `src/pages/panel/ProductsPage.tsx` — Placeholder productos
- `src/pages/panel/CustomersPage.tsx` — Placeholder clientes
- `src/pages/panel/QuotesPage.tsx` — Placeholder presupuestos
- `src/pages/panel/AffiliatePage.tsx` — Placeholder afiliación
- `src/pages/panel/ReportsPage.tsx` — Placeholder informes
- `src/pages/panel/SettingsPage.tsx` — Placeholder ajustes

**Edge Functions:**
- `supabase/functions/invite-user/index.ts` — Invitar usuarios (requiere service_role_key)
- `supabase/functions/update-user-role/index.ts` — Cambiar rol de usuario

**Rutas:**
- `src/App.tsx` — Todas las rutas del panel con protección por rol

---

## 📋 Menú del panel por rol

### Admin (acceso completo)
- ✅ Dashboard
- ✅ Pedidos
- ✅ Instalaciones
- ✅ Productos
- ✅ Clientes
- ✅ Presupuestos
- ✅ Afiliación
- ✅ Informes
- ✅ Usuarios
- ✅ Ajustes

### Gestor (gestión operativa)
- ✅ Dashboard
- ✅ Pedidos
- ✅ Instalaciones
- ✅ Clientes
- ✅ Presupuestos

### Instalador (solo su agenda)
- ✅ Mi agenda

---

## 📊 Dashboard con datos reales

El dashboard muestra:

1. **Stats principales:**
   - Ventas del día
   - Ventas del mes
   - Pedidos pendientes
   - Instalaciones pendientes

2. **Gráfico de ventas:**
   - Últimos 30 días
   - Área chart con Recharts
   - Ventas totales por día

3. **Alertas:**
   - Pedidos con más de 10 días sin entregar
   - Instalaciones en próximos 3 días con productos no entregados

---

## 👥 Gestión de usuarios (solo admin)

### Invitar colaboradores
1. Formulario con email, nombre (opcional) y rol
2. Se llama a la Edge Function `invite-user`
3. La Edge Function:
   - Verifica que el usuario que invita es admin
   - Crea el usuario en Supabase Auth con contraseña temporal
   - Actualiza el perfil con el rol asignado
   - Envía email de recuperación para establecer contraseña

### Cambiar rol
1. Dropdown en la tabla de usuarios
2. Se llama a la Edge Function `update-user-role`
3. La Edge Function:
   - Verifica que el usuario es admin
   - Previene que un admin se quite a sí mismo el rol
   - Actualiza el perfil con el nuevo rol

---

## 🔐 Edge Functions

### invite-user
**Ubicación:** `supabase/functions/invite-user/index.ts`

**Requiere:** `SUPABASE_SERVICE_ROLE_KEY` (secreta)

**Flujo:**
1. Verifica JWT del usuario que hace la petición
2. Verifica que es admin en la tabla `profiles`
3. Crea usuario en `auth.users` con contraseña temporal
4. Actualiza `profiles` con el rol asignado
5. Envía email de recuperación para establecer contraseña

**Uso desde el frontend:**
```typescript
import { inviteUser } from '@/lib/edge-functions';

const { data, error } = await inviteUser({
  email: 'colaborador@email.com',
  role: 'gestor',
  nombre: 'Juan García',
});
```

### update-user-role
**Ubicación:** `supabase/functions/update-user-role/index.ts`

**Requiere:** `SUPABASE_SERVICE_ROLE_KEY` (secreta)

**Flujo:**
1. Verifica JWT del usuario que hace la petición
2. Verifica que es admin
3. Previene auto-degradación de admin
4. Actualiza el rol en `profiles`

**Uso desde el frontend:**
```typescript
import { updateUserRole } from '@/lib/edge-functions';

const { data, error } = await updateUserRole({
  userId: 'uuid-del-usuario',
  newRole: 'instalador',
});
```

---

## 🚀 Desplegar Edge Functions

### 1. Configurar variables de entorno en Supabase

En Supabase → Settings → Secrets:
- `SUPABASE_SERVICE_ROLE_KEY` (ya existe por defecto)

### 2. Desplegar las funciones

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Login
supabase login

# Vincular proyecto
supabase link --project-ref TU_PROJECT_REF

# Desplegar funciones
supabase functions deploy invite-user
supabase functions deploy update-user-role
```

### 3. Verificar que funcionan

```bash
# Probar invite-user
curl -X POST https://TU_PROJECT_REF.supabase.co/functions/v1/invite-user \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","role":"gestor","nombre":"Test User"}'
```

---

## 🧪 Probar el panel

### 1. Configurar Supabase
- Ejecutar `supabase/schema.sql` si no lo has hecho
- Desplegar las Edge Functions

### 2. Crear usuarios de prueba
```sql
-- Admin
INSERT INTO profiles (id, email, nombre, role)
VALUES ('UUID_1', 'admin@segurhogar.es', 'Admin', 'admin');

-- Gestor
INSERT INTO profiles (id, email, nombre, role)
VALUES ('UUID_2', 'gestor@segurhogar.es', 'Gestor', 'gestor');

-- Instalador
INSERT INTO profiles (id, email, nombre, role)
VALUES ('UUID_3', 'instalador@segurhogar.es', 'Instalador', 'instalador');
```

### 3. Hacer login y navegar
- Login como admin → ver menú completo
- Login como gestor → ver solo sus secciones
- Login como instalador → ver solo "Mi agenda"

### 4. Probar invitación de usuarios
- Ir a `/panel/usuarios` (como admin)
- Invitar un nuevo colaborador
- Verificar que recibe el email
- Verificar que puede hacer login

---

## 📈 Gráfico de ventas

El gráfico usa **Recharts** con los datos de los últimos 30 días:

```typescript
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height="100%">
  <AreaChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="fecha" />
    <YAxis />
    <Tooltip />
    <Area type="monotone" dataKey="ventas" stroke="#2D7FF9" fill="url(#colorVentas)" />
  </AreaChart>
</ResponsiveContainer>
```

---

## 🔒 Seguridad

### Lo que está implementado:
- ✅ Menú filtrado por rol en el frontend
- ✅ Rutas protegidas con `ProtectedRoute`
- ✅ Edge Functions verifican JWT y rol antes de ejecutar
- ✅ Service role key solo en Edge Functions (nunca en frontend)
- ✅ Prevención de auto-degradación de admin

### Buenas prácticas:
- ✅ Validación en frontend Y backend (RLS + Edge Functions)
- ✅ No exponer service_role_key al cliente
- ✅ Verificar permisos en cada operación sensible
- ✅ Logs de auditoría (se pueden añadir en Edge Functions)

---

## 📝 Próximos pasos

- Implementar catálogo de productos con Supabase
- Implementar carrito y checkout con Stripe
- Implementar gestión completa de pedidos
- Implementar calendario de instalaciones
- Implementar presupuestos
- Implementar informes avanzados
- Subir imágenes a Supabase Storage
- Integrar asistente IA con Claude API
