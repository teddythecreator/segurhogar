# Paso 13: Preparación para Publicación

## ✅ Implementación completada

### 📄 Páginas Legales

Se han creado 6 páginas legales adaptadas a la legislación española:

1. **Aviso Legal (LSSI)** - `/aviso-legal`
   - Datos identificativos del titular
   - Objeto del sitio web
   - Legislación aplicable
   - Condiciones de uso
   - Propiedad intelectual
   - Responsabilidad

2. **Política de Privacidad (RGPD)** - `/privacidad`
   - Responsable del tratamiento
   - Finalidad del tratamiento
   - Base legal
   - Categorías de datos
   - Destinatarios
   - Transferencias internacionales
   - Plazos de conservación
   - Derechos del interesado (ARCO+)
   - Medidas de seguridad

3. **Política de Cookies** - `/cookies`
   - Tipos de cookies utilizadas
   - Cookies técnicas (esenciales)
   - Cookies analíticas
   - Cookies de marketing
   - Cómo gestionar cookies
   - Cookies de terceros

4. **Condiciones Generales de Venta** - `/condiciones-venta`
   - Identificación del vendedor
   - Productos y servicios
   - Precios e IVA
   - Proceso de compra
   - Métodos de pago
   - Entrega y plazos
   - Derecho de desistimiento (14 días)
   - Garantía (3 años)
   - Legislación aplicable

5. **Política de Devoluciones** - `/devoluciones`
   - Derecho de desistimiento (14 días)
   - Cómo ejercer el derecho
   - Efectos del desistimiento
   - Devolución de bienes
   - Excepciones
   - Productos defectuosos
   - Proceso de reembolso
   - Formulario de desistimiento

6. **Política de Garantía** - `/garantia`
   - Garantía legal (3 años)
   - Cobertura
   - Derechos del consumidor
   - Plazos para reclamar
   - Cómo reclamar
   - Servicios de instalación (1 año)
   - Exclusiones
   - Garantías comerciales adicionales
   - Soporte técnico

### 🎯 Placeholders a Rellenar

Todos los documentos legales contienen placeholders marcados con `[COMO_ESTO]` que debes rellenar:

**Datos de la empresa:**
- `[NOMBRE_EMPRESA]` → Nombre legal
- `[CIF_NIF]` → CIF o NIF
- `[DIRECCION_COMPLETA]` → Dirección fiscal
- `[EMAIL_CONTACTO]` → Email general
- `[EMAIL_PRIVACIDAD]` → Email privacidad (ej: privacidad@...)
- `[EMAIL_DEVOLUCIONES]` → Email devoluciones
- `[EMAIL_GARANTIA]` → Email garantías
- `[EMAIL_SOPORTE]` → Email soporte
- `[TELEFONO]` → Teléfono contacto
- `[TELEFONO_SOPORTE]` → Teléfono soporte
- `[HORARIO_ATENCION]` → Horario atención
- `[HORARIO_SOPORTE]` → Horario soporte
- `[DOMINIO_WEB]` → Tu dominio (ej: segurhogar.es)
- `[CIUDAD]` → Ciudad
- `[CODIGO_POSTAL]` → Código postal
- `[DIRECCION]` → Dirección (sin ciudad ni CP)
- `[CIUDAD_JUZGADOS]` → Ciudad juzgados competentes
- `[FECHA_ACTUALIZACION]` → Fecha actualización
- `[REGISTRO_MERCANTIL]` → Registro mercantil
- `[TOMO]`, `[FOLIO]`, `[HOJA]` → Datos registro

**Archivos a editar:**
- `src/components/tienda/legal/AvisoLegalPage.tsx`
- `src/components/tienda/legal/PrivacidadPage.tsx`
- `src/components/tienda/legal/CookiesPage.tsx`
- `src/components/tienda/legal/CondicionesVentaPage.tsx`
- `src/components/tienda/legal/DevolucionesPage.tsx`
- `src/components/tienda/legal/GarantiaPage.tsx`
- `src/components/tienda/Footer.tsx`
- `src/components/seo/StructuredData.tsx`
- `public/sitemap.xml`
- `public/robots.txt`

---

### 🍪 Banner de Cookies

**Componente:** `src/components/tienda/CookieBanner.tsx`

**Características:**
- ✅ Bloquea cookies no esenciales hasta aceptación
- ✅ Tres opciones: Aceptar todas, Rechazar, Configurar
- ✅ Modal de configuración detallada
- ✅ Categorías: Necesarias, Analíticas, Marketing
- ✅ Cookies necesarias siempre activas (no se pueden desactivar)
- ✅ Preferencias guardadas en localStorage
- ✅ Enlace a política de cookies
- ✅ Diseño responsive y accesible

**Store:** `src/stores/cookie-consent-store.ts`
- Zustand con persistencia
- Gestión de preferencias
- Función `applyCookiePreferences()` para integrar con Analytics/Marketing

**Integración:**
- Añadido a `TiendaLayout.tsx`
- Visible en todas las páginas públicas
- No aparece hasta que el usuario interactúe

**Para integrar Google Analytics:**
```typescript
// En src/stores/cookie-consent-store.ts
export function applyCookiePreferences(preferences: CookiePreferences) {
  if (preferences.analytics) {
    // Cargar Google Analytics
    const script = document.createElement('script');
    script.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    `;
    document.head.appendChild(script);
  }
}
```

---

### 🔍 SEO

#### 1. Títulos y Descripciones

**Hook:** `src/hooks/useSEO.ts`

**Funcionalidades:**
- Establece título de página
- Meta description
- Meta keywords
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card tags
- Canonical URL
- Noindex para páginas privadas

**Uso:**
```typescript
useSEO({
  title: 'Mi Página - SegurHogar',
  description: 'Descripción de la página',
  keywords: 'palabra1, palabra2',
  ogImage: 'https://...',
  canonical: 'https://...',
});
```

**Páginas con SEO configurado:**
- ✅ HomePage
- ✅ CatalogPage
- ✅ ProductPage (con datos del producto)

#### 2. Sitemap.xml

**Archivo:** `public/sitemap.xml`

**Páginas incluidas:**
- Página principal
- Catálogo
- Packs
- Comprobar zona
- Páginas legales (6)

**Nota:** Los productos individuales deben añadirse dinámicamente. Para generar automáticamente:
```bash
# Script para generar sitemap con productos
node scripts/generate-sitemap.js
```

#### 3. Robots.txt

**Archivo:** `public/robots.txt`

**Configuración:**
- Permitir acceso a páginas públicas
- Bloquear `/panel/`, `/mi-cuenta/`, `/login`, `/registro`
- Referencia al sitemap
- Crawl-delay: 1

#### 4. Datos Estructurados (JSON-LD)

**Componente:** `src/components/seo/StructuredData.tsx`

**Tipos implementados:**
- `ProductStructuredData` - Para fichas de producto
- `OrganizationStructuredData` - Para la organización
- `BreadcrumbStructuredData` - Para breadcrumbs

**Uso en ProductPage:**
```tsx
<ProductStructuredData
  name={product.nombre}
  description={product.descripcion_corta}
  image={product.imagenes?.map(img => img.url)}
  sku={product.slug}
  price={product.precio}
  availability={product.stock > 0 ? 'InStock' : 'OutOfStock'}
/>
```

**Validar con:** [Google Rich Results Test](https://search.google.com/test/rich-results)

#### 5. URLs Amigables

Ya implementadas desde pasos anteriores:
- Productos: `/producto/[slug]`
- Categorías: `/catalogo?categoria=[slug]`
- Packs: `/packs`
- Páginas legales: `/aviso-legal`, `/privacidad`, etc.

---

### 🔒 Revisión de Seguridad

**Documento:** `SECURITY_AUDIT.md`

#### 1. Variables de Entorno

**✅ Frontend (Públicas):**
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**❌ Backend (Secretas - NO en frontend):**
```env
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
RESEND_API_KEY=...
ANTHROPIC_API_KEY=...
ALIEXPRESS_APP_SECRET=...
```

**Verificación:**
```bash
grep -r "sk_live_" src/
grep -r "sk_test_" src/
# No debe haber resultados
```

#### 2. Row Level Security (RLS)

**Verificar que todas las tablas tienen RLS:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- Todas deben tener rowsecurity = true
```

**Políticas implementadas:**
- ✅ profiles: Admin ve todo, usuario ve el suyo
- ✅ customers: Admin/Gestor ven todo, Instalador ve sus clientes
- ✅ products: Público ve publicados, Admin ve todo
- ✅ orders: Admin/Gestor ven todo, Cliente ve los suyos
- ✅ installations: Admin/Gestor ven todo, Instalador ve las suyas
- ✅ aliexpress_tokens: Solo admin
- ✅ ai_usage: Usuario ve el suyo, Admin ve todo

#### 3. Edge Functions

**Validación implementada en todas:**
- ✅ Autenticación JWT
- ✅ Verificación de roles
- ✅ Sanitización de inputs
- ✅ Manejo seguro de errores
- ✅ CORS configurado

#### 4. Headers de Seguridad

**Archivo:** `vercel.json`

**Headers configurados:**
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- ✅ `Strict-Transport-Security: max-age=31536000`

#### 5. Rate Limiting

**Recomendación:** Implementar en Edge Functions críticas:
```typescript
// Limitar a 100 peticiones/hora por usuario
const {  count } = await supabase
  .from('api_requests')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .gte('created_at', new Date(Date.now() - 3600000).toISOString());

if (count >= 100) {
  throw new Error('Límite excedido');
}
```

---

### ⚡ Rendimiento

#### 1. Optimización de Imágenes

**Lazy loading:**
```tsx
<img src={url} loading="lazy" alt="..." />
```

**Dimensiones explícitas:**
```tsx
<img src={url} width={800} height={600} alt="..." />
```

**Formatos recomendados:**
- WebP (25-35% más pequeño que JPEG)
- AVIF (50% más pequeño, soporte limitado)

#### 2. Code Splitting

**Lazy loading de rutas:**
```typescript
const ProductPage = lazy(() => import('./pages/ProductPage'));
```

**Configuración Vite:**
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        router: ['react-router-dom'],
      },
    },
  },
}
```

#### 3. Cache

**TanStack Query:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      cacheTime: 1000 * 60 * 30, // 30 min
    },
  },
});
```

**Assets estáticos (vercel.json):**
```json
{
  "source": "/assets/(.*)",
  "headers": [{
    "key": "Cache-Control",
    "value": "public, max-age=31536000, immutable"
  }]
}
```

#### 4. Optimización de BD

**Índices creados:**
```sql
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

**Queries eficientes:**
```typescript
// ✅ Seleccionar solo columnas necesarias
.select('id, nombre, precio')

// ❌ No seleccionar todo
.select('*')
```

#### 5. Compresión

Vercel comprime automáticamente con Brotli/Gzip.

**Verificar:**
```bash
curl -H "Accept-Encoding: br" -I https://tu-dominio.com
# Debe incluir: content-encoding: br
```

#### 6. CDN

Vercel distribuye automáticamente tu contenido globalmente.

---

### 🚀 Despliegue en Vercel

**Documento completo:** `DEPLOYMENT.md`

#### Pasos rápidos:

1. **Subir código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Conectar con Vercel**
   - Ir a [vercel.com](https://vercel.com)
   - Importar repositorio
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`

3. **Configurar variables de entorno**
   ```env
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

4. **Desplegar**
   ```bash
   vercel --prod
   ```

5. **Configurar dominio personalizado**
   - Settings → Domains
   - Añadir dominio (ej: segurhogar.es)
   - Configurar DNS:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     ```

6. **Activar HTTPS**
   - Automático con Vercel
   - Forzar HTTPS en Settings

#### Desplegar Edge Functions

```bash
supabase functions deploy aliexpress-client
supabase functions deploy aliexpress-sync
supabase functions deploy aliexpress-create-order
supabase functions deploy aliexpress-tracking
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout
supabase functions deploy send-email
supabase functions deploy invite-user
supabase functions deploy update-user-role
supabase functions deploy ai-assistant
```

#### Configurar Cron Jobs

```sql
-- Sincronizar productos AliExpress cada 6h
SELECT cron.schedule(
  'sync-aliexpress',
  '0 */6 * * *',
  $$ SELECT net.http_post(...) $$
);

-- Seguimiento pedidos cada hora
SELECT cron.schedule(
  'check-tracking',
  '0 * * * *',
  $$ SELECT net.http_post(...) $$
);
```

---

### ✅ Checklist Final Pre-Lanzamiento

#### Funcionalidad
- [ ] Registro y login funcionan
- [ ] Todos los roles tienen acceso correcto
- [ ] Catálogo y filtros funcionan
- [ ] Carrito y checkout funcionan
- [ ] Pagos con Stripe funcionan (modo test)
- [ ] Webhooks de Stripe funcionan
- [ ] Emails automáticos se envían
- [ ] Panel admin funciona
- [ ] Gestión de pedidos funciona
- [ ] Gestión de instalaciones funciona
- [ ] Asistente IA responde
- [ ] Importación AliExpress funciona
- [ ] Sincronización AliExpress funciona

#### SEO
- [ ] Títulos y descripciones correctos
- [ ] Sitemap.xml accesible
- [ ] Robots.txt accesible
- [ ] Datos estructurados validados
- [ ] URLs amigables funcionan
- [ ] Canonical URLs correctas
- [ ] Open Graph tags funcionan

#### Rendimiento
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse SEO > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Imágenes optimizadas
- [ ] Lazy loading funciona
- [ ] Code splitting funciona
- [ ] Bundle size < 500KB (gzipped)

#### Seguridad
- [ ] No hay claves secretas en frontend
- [ ] RLS en todas las tablas
- [ ] Edge Functions validan auth
- [ ] Edge Functions validan permisos
- [ ] Inputs sanitizados
- [ ] HTTPS forzado
- [ ] Headers de seguridad configurados
- [ ] Dependencias actualizadas

#### Legal
- [ ] Aviso legal completo
- [ ] Política privacidad cumple RGPD
- [ ] Política cookies cumple LSSI
- [ ] Condiciones de venta claras
- [ ] Política devoluciones (14 días)
- [ ] Política garantía (3 años)
- [ ] Banner cookies funcional
- [ ] **Todos los placeholders rellenados**

#### Responsive
- [ ] Móvil (320px+)
- [ ] Tablet (768px+)
- [ ] Desktop (1024px+)
- [ ] Pantallas grandes (1920px+)

#### Navegadores
- [ ] Chrome (última)
- [ ] Firefox (última)
- [ ] Safari (última)
- [ ] Edge (última)

---

### 📊 Monitorización Post-Lanzamiento

#### Herramientas recomendadas
- **Google Analytics**: Analítica de tráfico
- **Google Search Console**: SEO
- **Sentry**: Errores
- **Vercel Analytics**: Rendimiento

#### Alertas
Configurar alertas para:
- Errores 5xx
- Tiempo respuesta > 3s
- Tasa error > 1%
- Uso APIs cerca de límites

---

### 🔄 Mantenimiento

#### Diario
- Revisar errores en logs
- Monitorizar pedidos pendientes
- Revisar alertas AliExpress

#### Semanal
- Métricas de rendimiento
- Actualizar contenido
- Revisar feedback usuarios

#### Mensual
- Actualizar dependencias (`npm update`)
- Optimizar queries BD
- Analizar métricas conversión
- Revisar costes APIs

---

## 📁 Archivos Creados/Modificados

### Páginas Legales
- `src/components/tienda/legal/LegalLayout.tsx`
- `src/components/tienda/legal/AvisoLegalPage.tsx`
- `src/components/tienda/legal/PrivacidadPage.tsx`
- `src/components/tienda/legal/CookiesPage.tsx`
- `src/components/tienda/legal/CondicionesVentaPage.tsx`
- `src/components/tienda/legal/DevolucionesPage.tsx`
- `src/components/tienda/legal/GarantiaPage.tsx`

### Banner de Cookies
- `src/components/tienda/CookieBanner.tsx`
- `src/stores/cookie-consent-store.ts`

### SEO
- `src/hooks/useSEO.ts`
- `src/components/seo/StructuredData.tsx`
- `public/sitemap.xml`
- `public/robots.txt`

### Seguridad y Rendimiento
- `vercel.json` (headers de seguridad)
- `SECURITY_AUDIT.md` (auditoría completa)
- `DEPLOYMENT.md` (guía de despliegue)

### Rutas
- Actualizado `src/App.tsx` con rutas legales
- Actualizado `src/components/tienda/Footer.tsx` con enlaces legales
- Actualizado `src/components/tienda/TiendaLayout.tsx` con banner cookies

### Páginas con SEO
- Actualizado `src/pages/tienda/HomePage.tsx`
- Actualizado `src/pages/tienda/CatalogPage.tsx`
- Actualizado `src/pages/tienda/ProductPage.tsx`

---

## 🧪 Cómo Probar

### 1. Páginas Legales
```bash
npm run dev
```
Visitar:
- http://localhost:3000/aviso-legal
- http://localhost:3000/privacidad
- http://localhost:3000/cookies
- http://localhost:3000/condiciones-venta
- http://localhost:3000/devoluciones
- http://localhost:3000/garantia

Verificar que todos los placeholders están marcados claramente.

### 2. Banner de Cookies
1. Abrir sitio en navegador
2. Ver banner en la parte inferior
3. Probar "Aceptar todas"
4. Probar "Rechazar"
5. Probar "Configurar" y personalizar
6. Recargar página → banner no aparece
7. Borrar localStorage → banner reaparece

### 3. SEO
1. Abrir DevTools → Elements
2. Verificar `<title>` cambia entre páginas
3. Verificar `<meta name="description">`
4. Verificar Open Graph tags
5. Verificar canonical URL
6. En página de producto, ver JSON-LD en `<head>`
7. Validar con [Google Rich Results Test](https://search.google.com/test/rich-results)

### 4. Seguridad
```bash
# Buscar claves secretas
grep -r "sk_live_" src/
grep -r "sk_test_" src/
# No debe haber resultados
```

Verificar RLS en Supabase:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

### 5. Rendimiento
```bash
npm run build
npm run preview
```
Abrir Lighthouse en DevTools y auditar.

### 6. Despliegue
Seguir guía en `DEPLOYMENT.md`.

---

## 📚 Documentación Completa

- **`DEPLOYMENT.md`** - Guía completa de despliegue en Vercel
- **`SECURITY_AUDIT.md`** - Auditoría de seguridad y rendimiento
- **`PASO_13.md`** - Este documento

---

**Paso 13 completado**: Aplicación lista para producción con páginas legales completas (LSSI, RGPD, cookies, condiciones de venta, devoluciones 14 días, garantía 3 años), banner de cookies funcional, SEO optimizado (títulos, descripciones, sitemap, robots.txt, datos estructurados), revisión de seguridad (RLS, variables de entorno, headers), optimización de rendimiento (lazy loading, code splitting, cache), y guía completa de despliegue en Vercel.
