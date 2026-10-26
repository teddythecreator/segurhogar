# Despliegue en Producción - Guía Completa

## ✅ Checklist Final antes del Lanzamiento

### 1. Configuración de Variables de Entorno

#### Frontend (Vite)
Crear archivo `.env.production`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

#### Backend (Supabase Edge Functions)
En Supabase → Settings → Secrets, añadir:
```env
# AliExpress
ALIEXPRESS_APP_KEY=tu-app-key
ALIEXPRESS_APP_SECRET=tu-app-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (emails)
RESEND_API_KEY=re_...

# Claude AI
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Páginas Legales - Datos a Rellenar

Buscar y reemplazar en todos los archivos de `/src/components/tienda/legal/`:

- `[NOMBRE_EMPRESA]` → Nombre legal de tu empresa
- `[CIF_NIF]` → CIF o NIF de la empresa
- `[DIRECCION_COMPLETA]` → Dirección fiscal completa
- `[EMAIL_CONTACTO]` → Email de contacto general
- `[EMAIL_PRIVACIDAD]` → Email para temas de privacidad (ej: privacidad@...)
- `[EMAIL_DEVOLUCIONES]` → Email para devoluciones
- `[EMAIL_GARANTIA]` → Email para garantías
- `[EMAIL_SOPORTE]` → Email de soporte técnico
- `[TELEFONO]` → Teléfono de contacto
- `[TELEFONO_SOPORTE]` → Teléfono de soporte
- `[HORARIO_ATENCION]` → Horario de atención al cliente
- `[HORARIO_SOPORTE]` → Horario de soporte técnico
- `[DOMINIO_WEB]` → Tu dominio (ej: segurhogar.es)
- `[CIUDAD]` → Ciudad de la empresa
- `[CODIGO_POSTAL]` → Código postal
- `[DIRECCION]` → Dirección (sin ciudad ni CP)
- `[CIUDAD_JUZGADOS]` → Ciudad de los juzgados competentes
- `[FECHA_ACTUALIZACION]` → Fecha de última actualización
- `[REGISTRO_MERCANTIL]` → Registro mercantil donde está inscrita
- `[TOMO]`, `[FOLIO]`, `[HOJA]` → Datos del registro mercantil

### 3. SEO - Configuración

#### Actualizar sitemap.xml
Reemplazar `[DOMINIO_WEB]` en `/public/sitemap.xml` con tu dominio real.

#### Actualizar robots.txt
Reemplazar `[DOMINIO_WEB]` en `/public/robots.txt` con tu dominio real.

#### Actualizar datos estructurados
En `/src/components/seo/StructuredData.tsx`, reemplazar:
- `[NOMBRE_EMPRESA]`
- `[DOMINIO_WEB]`
- `[TELEFONO]`
- `[EMAIL_CONTACTO]`
- `[DIRECCION]`
- `[CIUDAD]`
- `[CODIGO_POSTAL]`

#### Actualizar hooks de SEO
En los archivos que usan `useSEO`, reemplazar `[DOMINIO_WEB]` con tu dominio.

### 4. Configuración de Supabase

#### Habilitar pg_cron para tareas programadas
```sql
-- Sincronización de productos AliExpress cada 6 horas
SELECT cron.schedule(
  'sync-aliexpress-products',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://TU_PROYECTO.supabase.co/functions/v1/aliexpress-sync',
    headers := '{"Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Seguimiento de pedidos AliExpress cada hora
SELECT cron.schedule(
  'check-aliexpress-tracking',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://TU_PROYECTO.supabase.co/functions/v1/aliexpress-tracking',
    headers := '{"Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

#### Configurar buckets de Storage
Asegúrate de que los buckets existen y tienen las políticas correctas:
- `product-images`
- `installation-photos`
- `installation-signatures`

#### Configurar webhooks de Stripe
En Stripe Dashboard → Developers → Webhooks:
- Endpoint: `https://TU_PROYECTO.supabase.co/functions/v1/stripe-webhook`
- Eventos: `checkout.session.completed`, `checkout.session.expired`

### 5. Desplegar Edge Functions

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Login
supabase login

# Vincular proyecto
supabase link --project-ref TU_PROJECT_REF

# Desplegar todas las funciones
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

### 6. Desplegar en Vercel

#### Opción A: Despliegue desde GitHub (Recomendado)

1. **Subir código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

2. **Conectar con Vercel**
   - Ir a [vercel.com](https://vercel.com)
   - Click en "New Project"
   - Importar repositorio de GitHub
   - Seleccionar el repositorio

3. **Configurar el proyecto**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Añadir variables de entorno**
   En Vercel → Settings → Environment Variables:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

5. **Desplegar**
   - Click en "Deploy"
   - Esperar a que termine el despliegue

6. **Configurar dominio personalizado**
   - Ir a Settings → Domains
   - Añadir tu dominio (ej: `segurhogar.es`)
   - Seguir las instrucciones para configurar DNS:
     - Type: `A`
     - Name: `@`
     - Value: `76.76.21.21`
     - O usar CNAME: `cname.vercel-dns.com`

#### Opción B: Despliegue desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar
vercel

# Seguir las instrucciones interactivas

# Para desplegar en producción
vercel --prod
```

### 7. Configuración del Dominio

#### DNS Configuration
En tu proveedor de dominio, configura:

**Para dominio raíz (ej: segurhogar.es):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Para subdominio www:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**O alternativamente:**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

#### SSL/TLS
Vercel proporciona certificados SSL gratuitos automáticamente. Asegúrate de que:
- "Force HTTPS" está activado
- "Minimum TLS Version" es 1.2 o superior

### 8. Pruebas Finales

#### Funcionalidad
- [ ] Registro de nuevos usuarios
- [ ] Login con diferentes roles (admin, gestor, instalador, cliente)
- [ ] Navegación por el catálogo
- [ ] Filtros de búsqueda funcionan
- [ ] Añadir productos al carrito
- [ ] Proceso de checkout completo
- [ ] Pago con Stripe (modo test)
- [ ] Webhook de Stripe funciona
- [ ] Emails automáticos se envían
- [ ] Panel de administración funciona
- [ ] Gestión de pedidos
- [ ] Gestión de instalaciones
- [ ] Asistente IA responde
- [ ] Importación de productos AliExpress
- [ ] Sincronización de precios AliExpress

#### SEO
- [ ] Títulos y descripciones correctos en todas las páginas
- [ ] Sitemap.xml accesible en `/sitemap.xml`
- [ ] Robots.txt accesible en `/robots.txt`
- [ ] Datos estructurados validados con [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] URLs amigables funcionan
- [ ] Canonical URLs correctas
- [ ] Open Graph tags funcionan (probar con [Facebook Debugger](https://developers.facebook.com/tools/debug/))

#### Rendimiento
- [ ] Lighthouse score > 90 en Performance
- [ ] Lighthouse score > 90 en SEO
- [ ] Lighthouse score > 90 en Accessibility
- [ ] Lighthouse score > 90 en Best Practices
- [ ] Imágenes optimizadas (WebP cuando sea posible)
- [ ] Lazy loading de imágenes funciona
- [ ] Code splitting funciona (chunks separados)

#### Seguridad
- [ ] No hay claves secretas en el frontend
- [ ] Todas las Edge Functions validan autenticación
- [ ] RLS habilitado en todas las tablas
- [ ] HTTPS forzado
- [ ] Headers de seguridad configurados
- [ ] Banner de cookies funciona
- [ ] Páginas legales completas y correctas

#### Legal
- [ ] Aviso legal completo y correcto
- [ ] Política de privacidad cumple RGPD
- [ ] Política de cookies cumple LSSI
- [ ] Condiciones de venta claras
- [ ] Política de devoluciones (14 días)
- [ ] Política de garantía (3 años)
- [ ] Todos los placeholders rellenados

#### Responsive
- [ ] Funciona en móvil (320px+)
- [ ] Funciona en tablet (768px+)
- [ ] Funciona en desktop (1024px+)
- [ ] Funciona en pantallas grandes (1920px+)

#### Navegadores
- [ ] Chrome (última versión)
- [ ] Firefox (última versión)
- [ ] Safari (última versión)
- [ ] Edge (última versión)

### 9. Monitorización Post-Lanzamiento

#### Herramientas recomendadas
- **Google Analytics**: Analítica de tráfico
- **Google Search Console**: SEO y rendimiento en búsqueda
- **Sentry**: Monitorización de errores
- **Vercel Analytics**: Métricas de rendimiento

#### Alertas
Configurar alertas para:
- Errores 5xx
- Tiempo de respuesta > 3s
- Tasa de error > 1%
- Uso de Edge Functions接近 límites

### 10. Mantenimiento

#### Tareas diarias
- Revisar errores en logs
- Monitorizar pedidos pendientes
- Revisar alertas de margen AliExpress

#### Tareas semanales
- Revisar métricas de rendimiento
- Actualizar contenido si es necesario
- Revisar feedback de usuarios

#### Tareas mensuales
- Actualizar dependencias (`npm update`)
- Revisar y optimizar queries de BD
- Analizar métricas de conversión
- Revisar costes de APIs (Stripe, Resend, Claude, AliExpress)

---

## 🚀 Comandos Útiles

### Desarrollo local
```bash
npm install
npm run dev
```

### Build de producción
```bash
npm run build
npm run preview
```

### Desplegar en Vercel
```bash
vercel --prod
```

### Desplegar Edge Functions
```bash
supabase functions deploy NOMBRE_FUNCION
```

### Ver logs de Edge Functions
```bash
supabase functions logs NOMBRE_FUNCION
```

---

## 📞 Soporte

Si tienes problemas durante el despliegue:

1. **Vercel**: [vercel.com/support](https://vercel.com/support)
2. **Supabase**: [supabase.com/support](https://supabase.com/support)
3. **Stripe**: [stripe.com/help](https://stripe.com/help)

---

## ✅ Checklist Rápido Pre-Lanzamiento

- [ ] Todas las variables de entorno configuradas
- [ ] Todos los placeholders legales rellenados
- [ ] Dominio personalizado configurado
- [ ] SSL/TLS activado
- [ ] Edge Functions desplegadas
- [ ] Webhooks de Stripe configurados
- [ ] Cron jobs configurados en Supabase
- [ ] Pruebas funcionales completadas
- [ ] Pruebas de SEO completadas
- [ ] Pruebas de rendimiento completadas
- [ ] Pruebas de seguridad completadas
- [ ] Monitorización configurada
- [ ] Backups configurados
- [ ] Plan de contingencia documentado

---

**¡Listo para lanzar!** 🎉

Una vez completado este checklist, tu aplicación estará lista para producción. Recuerda monitorizar el rendimiento y los errores durante las primeras semanas después del lanzamiento.
