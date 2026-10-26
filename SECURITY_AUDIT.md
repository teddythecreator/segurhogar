# Auditoría de Seguridad y Rendimiento

## 🔒 Seguridad

### 1. Variables de Entorno

#### ✅ Frontend (Variables Públicas)
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Verificación:**
```bash
# Buscar claves secretas en el código
grep -r "sk_live_" src/
grep -r "sk_test_" src/
grep -r "re_" src/
grep -r "sk-ant-" src/
grep -r "whsec_" src/
```

**Resultado esperado:** No debe haber resultados.

#### ❌ Backend (Variables Secretas)
Estas variables NUNCA deben estar en el frontend:
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `ANTHROPIC_API_KEY`
- `ALIEXPRESS_APP_SECRET`

**Dónde deben estar:**
- Supabase Edge Functions → Settings → Secrets
- Variables de entorno del servidor (nunca en el repositorio)

### 2. Row Level Security (RLS)

#### Tablas con RLS habilitado
```sql
-- Verificar que todas las tablas tienen RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**Resultado esperado:** Todas las tablas deben tener `rowsecurity = true`.

#### Políticas RLS por tabla

##### profiles
```sql
-- Admin ve todos los perfiles
-- Usuario ve su propio perfil
-- Usuario actualiza su propio perfil
```

##### customers
```sql
-- Admin ve todos los clientes
-- Gestor ve todos los clientes
-- Instalador ve clientes de sus instalaciones
```

##### products
```sql
-- Productos publicados visibles para todos
-- Admin ve todos los productos (incluyendo borradores)
-- Gestor ve todos los productos
```

##### orders
```sql
-- Admin ve todos los pedidos
-- Gestor ve todos los pedidos
-- Cliente ve solo sus propios pedidos
```

##### installations
```sql
-- Admin ve todas las instalaciones
-- Gestor ve todas las instalaciones
-- Instalador ve solo sus instalaciones asignadas
```

##### ai_usage
```sql
-- Usuario ve su propio uso
-- Admin ve todo el uso
```

##### aliexpress_tokens
```sql
-- Solo admin gestiona tokens
```

**Verificación:**
```sql
-- Listar todas las políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';
```

### 3. Edge Functions

#### Validación de Autenticación
Todas las Edge Functions deben validar el JWT del usuario:

```typescript
// ✅ CORRECTO
const authHeader = req.headers.get('Authorization')
if (!authHeader) {
  throw new Error('No autorizado')
}

const {  { user } } = await supabase.auth.getUser(
  authHeader.replace('Bearer ', '')
)
if (!user) {
  throw new Error('No autorizado')
}
```

```typescript
// ❌ INCORRECTO
// No validar autenticación
const { action } = await req.json()
```

#### Validación de Permisos
Verificar que el usuario tiene permisos para la acción:

```typescript
// ✅ CORRECTO
const {  profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile?.role !== 'admin') {
  throw new Error('Permisos insuficientes')
}
```

#### Sanitización de Inputs
Validar y sanitizar todos los inputs del usuario:

```typescript
// ✅ CORRECTO
const { orderId } = await req.json()
if (!orderId || typeof orderId !== 'string') {
  throw new Error('orderId inválido')
}
```

```typescript
// ❌ INCORRECTO
// Usar inputs sin validar
const { orderId } = await req.json()
await supabase.from('orders').select('*').eq('id', orderId)
```

#### Manejo de Errores
No exponer información sensible en los errores:

```typescript
// ✅ CORRECTO
catch (error) {
  console.error('Error detallado:', error) // Solo en logs
  return new Response(
    JSON.stringify({ error: 'Error al procesar la solicitud' }),
    { status: 400 }
  )
}
```

```typescript
// ❌ INCORRECTO
catch (error) {
  return new Response(
    JSON.stringify({ error: error.message, stack: error.stack }),
    { status: 400 }
  )
}
```

### 4. Rate Limiting

#### Implementar límites de peticiones
Para prevenir abuso, implementar rate limiting en Edge Functions críticas:

```typescript
// Ejemplo: Limitar a 100 peticiones por hora por usuario
const {  count } = await supabase
  .from('api_requests')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .gte('created_at', new Date(Date.now() - 3600000).toISOString())

if (count && count >= 100) {
  throw new Error('Límite de peticiones excedido')
}
```

### 5. CORS

#### Configuración correcta
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // O tu dominio específico
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}
```

**Recomendación:** En producción, restringir `Access-Control-Allow-Origin` a tu dominio.

### 6. HTTPS

#### Forzar HTTPS
En Vercel:
- Settings → Domains → Force HTTPS: ✅ Activado

En Supabase:
- HTTPS está habilitado por defecto

### 7. Headers de Seguridad

#### Configurar headers en Vercel
Crear archivo `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### 8. Dependencias

#### Mantener dependencias actualizadas
```bash
# Verificar vulnerabilidades
npm audit

# Actualizar dependencias
npm update

# Actualizar paquetes específicos
npm install package@latest
```

#### Revisar dependencias periódicamente
```bash
# Ver dependencias desactualizadas
npm outdated

# Ver árbol de dependencias
npm ls
```

---

## ⚡ Rendimiento

### 1. Optimización de Imágenes

#### Usar formatos modernos
- **WebP**: 25-35% más pequeño que JPEG
- **AVIF**: 50% más pequeño que JPEG (soporte limitado)

#### Lazy loading
```tsx
<img 
  src={imageUrl} 
  loading="lazy" 
  alt="Descripción"
/>
```

#### Dimensiones correctas
```tsx
<img 
  src={imageUrl} 
  width={800} 
  height={600} 
  alt="Descripción"
/>
```

### 2. Code Splitting

#### Lazy loading de componentes
```tsx
import { lazy, Suspense } from 'react';

const ProductPage = lazy(() => import('./pages/ProductPage'));

function App() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ProductPage />
    </Suspense>
  );
}
```

#### Configuración de Vite
En `vite.config.js`:
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
        },
      },
    },
  },
});
```

### 3. Caching

#### Cache de queries de TanStack
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 30, // 30 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

#### Cache de Edge Functions
```typescript
// Cache de 1 hora
return new Response(JSON.stringify(data), {
  headers: {
    'Cache-Control': 'public, max-age=3600',
  },
});
```

### 4. Optimización de Base de Datos

#### Índices
```sql
-- Crear índices en columnas frecuentemente consultadas
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

#### Queries eficientes
```typescript
// ✅ CORRECTO: Seleccionar solo columnas necesarias
const { data } = await supabase
  .from('products')
  .select('id, nombre, precio, slug')
  .eq('estado', 'publicado');

// ❌ INCORRECTO: Seleccionar todas las columnas
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('estado', 'publicado');
```

#### Paginación
```typescript
// ✅ CORRECTO: Usar paginación
const { data } = await supabase
  .from('orders')
  .select('*')
  .range(0, 19); // Primeros 20 resultados

// ❌ INCORRECTO: Cargar todos los resultados
const { data } = await supabase
  .from('orders')
  .select('*');
```

### 5. Compresión

#### Gzip/Brotli
Vercel comprime automáticamente las respuestas con Brotli/Gzip.

Verificar:
```bash
curl -H "Accept-Encoding: br" -I https://tu-dominio.com
# Debe incluir: content-encoding: br
```

### 6. CDN

#### Vercel Edge Network
Vercel distribuye automáticamente tu contenido a través de su CDN global.

#### Cache de assets estáticos
```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 7. Medición de Rendimiento

#### Lighthouse
```bash
# Instalar Lighthouse CLI
npm install -g lighthouse

# Auditar sitio
lighthouse https://tu-dominio.com --view
```

**Objetivos:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

#### Web Vitals
Monitorear:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

#### Vercel Analytics
Activar en Vercel → Analytics para ver métricas reales de usuarios.

---

## 📊 Herramientas de Auditoría

### Seguridad
- [Mozilla Observatory](https://observatory.mozilla.org/) - Análisis de headers de seguridad
- [SSL Labs](https://www.ssllabs.com/ssltest/) - Análisis de SSL/TLS
- [Security Headers](https://securityheaders.com/) - Verificar headers de seguridad

### Rendimiento
- [PageSpeed Insights](https://pagespeed.web.dev/) - Análisis de rendimiento
- [GTmetrix](https://gtmetrix.com/) - Análisis detallado de rendimiento
- [WebPageTest](https://www.webpagetest.org/) - Pruebas de rendimiento avanzadas

### SEO
- [Google Search Console](https://search.google.com/search-console) - Monitorización SEO
- [Google Rich Results Test](https://search.google.com/test/rich-results) - Datos estructurados
- [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/) - Auditoría SEO completa

### Accesibilidad
- [WAVE](https://wave.webaim.org/) - Auditoría de accesibilidad
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Auditoría completa
- [axe DevTools](https://www.deque.com/axe/devtools/) - Extensiones de navegador

---

## ✅ Checklist de Auditoría

### Seguridad
- [ ] No hay claves secretas en el frontend
- [ ] RLS habilitado en todas las tablas
- [ ] Todas las Edge Functions validan autenticación
- [ ] Todas las Edge Functions validan permisos
- [ ] Inputs sanitizados en todas las Edge Functions
- [ ] Rate limiting implementado en funciones críticas
- [ ] CORS configurado correctamente
- [ ] HTTPS forzado
- [ ] Headers de seguridad configurados
- [ ] Dependencias actualizadas y sin vulnerabilidades

### Rendimiento
- [ ] Imágenes optimizadas (WebP, lazy loading)
- [ ] Code splitting implementado
- [ ] Cache configurado correctamente
- [ ] Queries de BD optimizadas con índices
- [ ] Paginación en listas largas
- [ ] Compresión Gzip/Brotli activada
- [ ] CDN configurado
- [ ] Lighthouse score > 90 en todas las categorías
- [ ] Web Vitals dentro de los objetivos
- [ ] Bundle size < 500KB (gzipped)

### Legal
- [ ] Aviso legal completo y correcto
- [ ] Política de privacidad cumple RGPD
- [ ] Política de cookies cumple LSSI
- [ ] Condiciones de venta claras
- [ ] Política de devoluciones (14 días)
- [ ] Política de garantía (3 años)
- [ ] Banner de cookies funcional
- [ ] Todos los placeholders rellenados

---

## 🚨 Plan de Contingencia

### En caso de incidente de seguridad

1. **Identificar el incidente**
   - Revisar logs de Supabase
   - Revisar logs de Edge Functions
   - Identificar usuarios afectados

2. **Contener el incidente**
   - Rotar claves comprometidas
   - Deshabilitar funciones afectadas
   - Notificar a usuarios si es necesario

3. **Erradicar la amenaza**
   - Parchear vulnerabilidades
   - Actualizar dependencias
   - Reforzar políticas de seguridad

4. **Recuperar**
   - Restaurar desde backup si es necesario
   - Verificar integridad de datos
   - Reactivar servicios

5. **Lecciones aprendidas**
   - Documentar el incidente
   - Actualizar procedimientos
   - Implementar mejoras

### Backups

#### Supabase
- Backups automáticos diarios (plan Pro)
- Retención de 7 días (plan Pro)
- Exportar datos manualmente regularmente:
  ```bash
  supabase db dump --data-only > backup.sql
  ```

#### Vercel
- Despliegues anteriores disponibles
- Rollback instantáneo si es necesario

---

**Última auditoría:** [FECHA]
**Próxima auditoría programada:** [FECHA + 3 MESES]
