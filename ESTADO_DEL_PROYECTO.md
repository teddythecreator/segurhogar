# 🛡️ SegurHogar - Estado Completo del Proyecto

> **Documento maestro** con el estado actual, arquitectura, módulos y todo lo necesario para entender y continuar el proyecto.
> 
> Última actualización: Enero 2026

---

## 📋 Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura General](#3-arquitectura-general)
4. [Estado de los 13 Pasos](#4-estado-de-los-13-pasos)
5. [Estructura de Archivos](#5-estructura-de-archivos)
6. [Base de Datos](#6-base-de-datos)
7. [Edge Functions](#7-edge-functions)
8. [Rutas y Páginas](#8-rutas-y-páginas)
9. [Hooks Personalizados](#9-hooks-personalizados)
10. [Stores (Zustand)](#10-stores-zustand)
11. [Integraciones Externas](#11-integraciones-externas)
12. [Seguridad](#12-seguridad)
13. [Variables de Entorno](#13-variables-de-entorno)
14. [Estado Actual y Pendientes](#14-estado-actual-y-pendientes)
15. [Cómo Probar](#15-cómo-probar)
16. [Despliegue](#16-despliegue)

---

## 1. Resumen Ejecutivo

**SegurHogar** es una aplicación web completa para una empresa española que vende productos de seguridad física y digital, con instalación profesional a domicilio. El público objetivo son hogares, personas mayores y pequeños negocios.

### Tipos de producto gestionados:
- **Dropshipping** (AliExpress): se compran en la web
- **Afiliado**: enlaces externos a Amazon y otras tiendas
- **Servicio de instalación**: se reserva con fecha y dirección
- **Packs**: productos + instalación a precio cerrado

### Roles de usuario:
- **Admin**: acceso total
- **Gestor**: pedidos, clientes, instalaciones, presupuestos
- **Instalador**: solo su agenda de instalaciones
- **Cliente**: sus pedidos e instalaciones

### Estado actual:
✅ **Proyecto funcional al 100%** con los 13 pasos completados. Listo para desplegar en producción tras rellenar placeholders legales y configurar variables de entorno.

---

## 2. Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18 | Framework UI |
| TypeScript | 5+ | Tipado estricto |
| Vite | 6 | Build tool |
| Tailwind CSS | 4 | Estilos |
| React Router | 6 | Routing |
| TanStack Query | 5 | Data fetching |
| Zustand | 5 | State management |
| React Hook Form | 5 | Formularios |
| Zod | 3 | Validación |
| Lucide React | - | Iconos |
| Recharts | - | Gráficos |
| FullCalendar | 6 | Calendario instalaciones |
| react-signature-canvas | - | Firma digital |
| @react-pdf/renderer | - | Generación PDFs (preparado) |

### Backend (Supabase)
| Servicio | Uso |
|----------|-----|
| PostgreSQL | Base de datos |
| Supabase Auth | Autenticación |
| Supabase Storage | Imágenes, firmas, fotos |
| Edge Functions (Deno) | Lógica con claves secretas |
| Row Level Security | Políticas de acceso |
| Realtime | (preparado, no usado aún) |

### Servicios Externos
| Servicio | Uso | Estado |
|----------|-----|--------|
| **Stripe** | Pagos | ✅ Integrado |
| **Resend** | Emails transaccionales | ✅ Integrado |
| **Claude API** (Anthropic) | Asistentes IA | ✅ Integrado |
| **AliExpress Open Platform** | Dropshipping | ✅ Integrado |
| **Vercel** | Hosting frontend | ✅ Configurado |

---

## 3. Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vercel)                    │
│  React + TypeScript + Tailwind + Zustand + TanStack Query   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS + JWT (anon key)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │     Auth     │  │     Storage      │  │
│  │  (con RLS)   │  │   (JWT)      │  │  (buckets)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                            │                                │
│                            ▼                                │
│              ┌──────────────────────────┐                   │
│              │    Edge Functions        │                   │
│              │  (service_role_key)      │                   │
│              └──────────┬───────────────┘                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ┌─────────┐      ┌─────────┐      ┌──────────┐
   │ Stripe  │      │ Resend  │      │  Claude  │
   │  API    │      │   API   │      │    API   │
   └─────────┘      └─────────┘      └──────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  AliExpress  │
                   │  Open API    │
                   └──────────────┘
```

### Principios clave:
- ✅ **Ninguna clave secreta en el frontend**
- ✅ **Todo lo sensible va en Edge Functions**
- ✅ **RLS como segunda línea de defensa**
- ✅ **Tipado estricto en TypeScript**
- ✅ **Mobile-first responsive**

---

## 4. Estado de los 13 Pasos

### ✅ Paso 1: Estructura Base
- [x] Carpetas organizadas: `components/`, `pages/`, `lib/`, `hooks/`, `stores/`, `types/`
- [x] Cliente Supabase con `.env`
- [x] React Router con dos layouts (Tienda y Panel)
- [x] TanStack Query configurado
- [x] Página 404

### ✅ Paso 2: Base de Datos
- [x] 15 tablas con tipos enum
- [x] Triggers automáticos (timestamps, creación de perfil)
- [x] Políticas RLS completas
- [x] Datos de ejemplo (5 categorías, 15 productos, 3 packs)
- [x] Tipos TypeScript en `src/types/database.ts`

### ✅ Paso 3: Autenticación
- [x] Login, registro, recuperación de contraseña
- [x] Hook `useAuth` con gestión de sesión
- [x] `ProtectedRoute` con control de roles
- [x] Redirección post-login según rol
- [x] Botón cerrar sesión en ambos layouts

### ✅ Paso 4: Panel de Gestión
- [x] Sidebar filtrado por rol (Admin/Gestor/Instalador)
- [x] Menú móvil desplegable
- [x] Dashboard con stats y gráfico Recharts (30 días)
- [x] Alertas automáticas (pedidos retrasados, instalaciones sin productos)
- [x] Gestión de usuarios con invitación por email
- [x] Edge Functions `invite-user` y `update-user-role`

### ✅ Paso 5: Gestión de Productos
- [x] Tabla con búsqueda, filtros (tipo, categoría, estado) y paginación
- [x] Formulario dinámico según tipo de producto
- [x] Campos específicos: dropshipping (margen auto), afiliado, servicio, pack
- [x] Subida de imágenes a Storage con orden arrastrable
- [x] Editor de especificaciones clave-valor
- [x] Gestión de categorías jerárquicas
- [x] Generación automática de slug

### ✅ Paso 6: Tienda Pública
- [x] Home con hero, perfiles, packs, ventajas, testimonios, FAQ
- [x] Catálogo con filtros en URL (compartibles)
- [x] Ficha de producto con galería, tabs, productos relacionados
- [x] Manejo especial de afiliados (clic tracking + aviso)
- [x] Página de packs con tabla comparativa
- [x] Comprobador de código postal

### ✅ Paso 7: Carrito y Pago con Stripe
- [x] Carrito Zustand persistido en localStorage
- [x] Validación: productos afiliados no se pueden añadir
- [x] Formulario de instalación con verificación de zona
- [x] Checkout con facturación opcional (NIF/CIF)
- [x] Edge Function `create-checkout` (recalcula precios desde BD)
- [x] Edge Function `stripe-webhook` (verifica firma)
- [x] Páginas pago exitoso/cancelado
- [x] `/mi-cuenta` con pedidos e instalaciones

### ✅ Paso 8: Gestión de Pedidos y Emails
- [x] Lista de pedidos con filtros e indicador de retrasos
- [x] Detalle completo con cambio de estado
- [x] Historial de cambios visible
- [x] Campo de número de seguimiento
- [x] Notas internas
- [x] Gestión de incidencias y devoluciones
- [x] Edge Function `send-email` con Resend
- [x] 4 plantillas HTML (confirmado, enviado, instalación confirmada/completada)
- [x] Envío automático al cambiar estado

### ✅ Paso 9: Módulo de Instalaciones
- [x] Calendario FullCalendar (vistas mes/semana)
- [x] Lista con filtros (estado, instalador, fechas)
- [x] Detalle editable con Google Maps
- [x] Crear instalación manual sin pedido
- [x] Agenda móvil para instaladores
- [x] Botón "He llegado" (registra hora)
- [x] Checklist de tareas editable
- [x] Subida de fotos desde cámara
- [x] Firma digital con react-signature-canvas
- [x] Botón "Marcar como realizada" (requiere firma + foto)

### ✅ Paso 10: Clientes, Presupuestos, Facturas, Afiliación e Informes
- [x] CRM de clientes con historial
- [x] Presupuestos con conversión a pedido
- [x] Facturas con numeración correlativa
- [x] Afiliación: estadísticas de clics + registro de comisiones
- [x] Informes con Recharts (ingresos, productos, instaladores)
- [x] Exportación a CSV

### ✅ Paso 11: Asistentes de IA
- [x] Widget flotante en tienda pública
- [x] Asistente del panel con function calling
- [x] Botón "Generar con IA" en productos
- [x] Botón "Redactar respuesta" en pedidos
- [x] Control de límites de uso por usuario
- [x] Edge Function `ai-assistant` con Claude API

### ✅ Paso 12: Integración AliExpress
- [x] Edge Function con cliente API y firma HMAC-MD5
- [x] Gestión de tokens (renovación automática)
- [x] Importar productos desde URL/ID
- [x] Sincronización periódica (cron) de precios/stock
- [x] Alertas de margen mínimo
- [x] Crear pedidos en AliExpress
- [x] Seguimiento automático
- [x] Registro de errores visible en panel

### ✅ Paso 13: Preparación para Publicación
- [x] 6 páginas legales (LSSI, RGPD, cookies, condiciones, devoluciones, garantía)
- [x] Banner de cookies con bloqueo
- [x] SEO: títulos, descripciones, sitemap, robots.txt, datos estructurados
- [x] Revisión de seguridad (RLS, variables, Edge Functions)
- [x] Optimización de rendimiento
- [x] Guía de despliegue en Vercel
- [x] Checklist final pre-lanzamiento

---

## 5. Estructura de Archivos

```
segurhogar/
├── public/
│   ├── robots.txt                          # SEO: robots
│   ├── sitemap.xml                         # SEO: sitemap
│   └── vite.svg
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx          # Protección de rutas por rol
│   │   │
│   │   ├── panel/
│   │   │   ├── PanelLayout.tsx             # Layout del panel
│   │   │   ├── Sidebar.tsx                 # Menú lateral filtrado por rol
│   │   │   ├── PanelAssistantChat.tsx      # Chat IA del panel
│   │   │   ├── installations/
│   │   │   │   └── InstallationCalendar.tsx # Calendario FullCalendar
│   │   │   ├── orders/
│   │   │   │   └── GenerateEmailButton.tsx # Redactar email con IA
│   │   │   └── products/
│   │   │       ├── ProductForm.tsx         # Formulario dinámico
│   │   │       ├── SpecsEditor.tsx         # Editor especificaciones
│   │   │       ├── PackItemsSelector.tsx   # Selector de productos pack
│   │   │       ├── ImageUploader.tsx       # Subida imágenes drag&drop
│   │   │       └── GenerateDescriptionButton.tsx # Generar con IA
│   │   │
│   │   ├── seo/
│   │   │   └── StructuredData.tsx          # JSON-LD (Product, Organization, Breadcrumb)
│   │   │
│   │   ├── tienda/
│   │   │   ├── TiendaLayout.tsx            # Layout público
│   │   │   ├── Header.tsx                  # Header responsive
│   │   │   ├── Footer.tsx                  # Footer con enlaces legales
│   │   │   ├── ShopAssistantWidget.tsx     # Chat IA flotante
│   │   │   ├── CookieBanner.tsx            # Banner de cookies
│   │   │   ├── legal/
│   │   │   │   ├── LegalLayout.tsx         # Layout común legal
│   │   │   │   ├── AvisoLegalPage.tsx      # LSSI
│   │   │   │   ├── PrivacidadPage.tsx      # RGPD
│   │   │   │   ├── CookiesPage.tsx         # Política cookies
│   │   │   │   ├── CondicionesVentaPage.tsx # Condiciones
│   │   │   │   ├── DevolucionesPage.tsx    # 14 días desistimiento
│   │   │   │   └── GarantiaPage.tsx        # 3 años garantía
│   │   │   └── product/
│   │   │       ├── ProductCard.tsx         # Tarjeta reutilizable
│   │   │       └── ProductGallery.tsx      # Galería con miniaturas
│   │   │
│   │   └── ui/
│   │       ├── Accordion.tsx               # FAQ
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Input.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                      # Autenticación
│   │   ├── useSEO.ts                       # SEO dinámico
│   │   ├── useAiAssistant.ts               # IA (4 endpoints)
│   │   ├── useAliexpress.ts                # AliExpress completo
│   │   ├── useCategories.ts                # Categorías CRUD
│   │   ├── useCustomers.ts                 # Clientes CRM
│   │   ├── useDashboard.ts                 # Stats dashboard
│   │   ├── useInstallations.ts             # Instalaciones completo
│   │   ├── useInvoices.ts                  # Facturas
│   │   ├── useOrders.ts                    # Pedidos + incidencias
│   │   ├── useProducts.ts                  # Productos CRUD
│   │   ├── usePublicProducts.ts            # Catálogo público
│   │   ├── useQuotes.ts                    # Presupuestos
│   │   ├── useReports.ts                   # Informes
│   │   ├── useServiceZones.ts              # Zonas instalación
│   │   └── useUsers.ts                     # Gestión usuarios
│   │
│   ├── lib/
│   │   ├── edge-functions.ts               # Helper para Edge Functions
│   │   ├── slug.ts                         # Generador de slugs
│   │   ├── storage.ts                      # Subida a Storage
│   │   ├── supabase.ts                     # Cliente Supabase
│   │   ├── utils.ts                        # Utilidades (cn, formatPrice)
│   │   └── validations.ts                  # Schemas Zod
│   │
│   ├── pages/
│   │   ├── NotFoundPage.tsx                # 404
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── RecoverPasswordPage.tsx
│   │   │   └── NewPasswordPage.tsx
│   │   ├── panel/                          # 18 páginas del panel
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── OrdersPage.tsx
│   │   │   ├── OrderDetailPage.tsx
│   │   │   ├── InstallationsPage.tsx
│   │   │   ├── InstallationDetailPage.tsx
│   │   │   ├── NewInstallationPage.tsx
│   │   │   ├── MyAgendaPage.tsx            # Vista móvil instalador
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ProductNewPage.tsx
│   │   │   ├── ProductEditPage.tsx
│   │   │   ├── CategoriesPage.tsx
│   │   │   ├── CustomersPage.tsx
│   │   │   ├── QuotesPage.tsx
│   │   │   ├── AffiliatePage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── AiAssistantPage.tsx
│   │   │   ├── AliexpressConfigPage.tsx
│   │   │   └── ImportAliexpressProductPage.tsx
│   │   └── tienda/                         # 11 páginas públicas
│   │       ├── HomePage.tsx
│   │       ├── CatalogPage.tsx
│   │       ├── ProductPage.tsx
│   │       ├── CartPage.tsx
│   │       ├── CheckoutPage.tsx
│   │       ├── PaymentSuccessPage.tsx
│   │       ├── PaymentCancelledPage.tsx
│   │       ├── PacksPage.tsx
│   │       ├── ZoneCheckerPage.tsx
│   │       └── MyAccountPage.tsx
│   │
│   ├── stores/
│   │   ├── cart-store.ts                   # Carrito (Zustand + persist)
│   │   └── cookie-consent-store.ts         # Consentimiento cookies
│   │
│   ├── types/
│   │   ├── index.ts                        # Re-exporta database
│   │   └── database.ts                     # Tipos completos de BD
│   │
│   ├── App.tsx                             # Router principal
│   ├── main.tsx                            # Entry point + QueryClient
│   ├── index.css                           # Tailwind + estilos base
│   └── vite-env.d.ts                       # Tipos Vite
│
├── supabase/
│   ├── schema.sql                          # Script principal BD
│   ├── storage.sql                         # Bucket product-images
│   ├── storage-installations.sql           # Buckets instalaciones
│   ├── migrations/
│   │   ├── add_stripe_session_id.sql
│   │   ├── add_installation_tracking_fields.sql
│   │   ├── 010_add_invoicing_and_commissions.sql
│   │   ├── 011_ai_usage_limits.sql
│   │   └── 012_aliexpress_integration.sql
│   └── functions/                          # 10 Edge Functions
│       ├── aliexpress-client/
│       ├── aliexpress-sync/
│       ├── aliexpress-create-order/
│       ├── aliexpress-tracking/
│       ├── ai-assistant/
│       ├── create-checkout/
│       ├── invite-user/
│       ├── send-email/
│       ├── stripe-webhook/
│       └── update-user-role/
│
├── .env.example                            # Plantilla variables
├── .gitignore
├── vercel.json                             # Headers seguridad + cache
├── tsconfig.json
├── vite.config.js
├── package.json
│
└── Documentación:
    ├── README.md                           # Resumen general
    ├── ESTADO_DEL_PROYECTO.md              # Este archivo
    ├── AUTENTICACION.md                    # Paso 3
    ├── PANEL.md                            # Paso 4
    ├── PRODUCTOS.md                        # Paso 5
    ├── TIENDA_PUBLICA.md                   # Paso 6
    ├── CARRITO_PAGO.md                     # Paso 7
    ├── PEDIDOS_EMAILS.md                   # Paso 8
    ├── INSTALACIONES.md                    # Paso 9
    ├── PASO_10.md                          # Clientes/Presupuestos/Informes
    ├── PASO_11.md                          # Asistentes IA
    ├── PASO_12.md                          # AliExpress
    ├── PASO_13.md                          # Preparación publicación
    ├── SECURITY_AUDIT.md                   # Auditoría seguridad
    └── DEPLOYMENT.md                       # Guía despliegue
```

---

## 6. Base de Datos

### Tablas principales

| Tabla | Descripción | RLS |
|-------|-------------|-----|
| `profiles` | Usuarios (vinculado a auth.users) | Admin ve todo, usuario ve el suyo |
| `customers` | Clientes (familia/mayor/negocio) | Admin/Gestor/Instalador según caso |
| `categories` | Categorías jerárquicas | Lectura pública |
| `products` | Productos (4 tipos) | Lectura pública (publicados) |
| `product_images` | Imágenes de productos | Lectura pública |
| `pack_items` | Productos que forman un pack | Lectura pública |
| `orders` | Pedidos | Cliente ve los suyos |
| `order_items` | Items de pedido | Según pedido |
| `order_status_history` | Historial de estados | Admin/Gestor/Cliente |
| `installations` | Instalaciones | Instalador ve las suyas |
| `installation_photos` | Fotos de instalaciones | Instalador/Cliente |
| `quotes` | Presupuestos | Admin/Gestor |
| `quote_items` | Items de presupuesto | Admin/Gestor |
| `affiliate_clicks` | Clics de afiliado | Inserción pública |
| `service_zones` | Códigos postales | Lectura pública |
| `ai_usage` | Uso de IA | Usuario/Admin |
| `ai_usage_limits` | Límites IA | Usuario/Admin |
| `aliexpress_tokens` | Tokens AliExpress | Solo admin |
| `aliexpress_products` | Caché productos AE | Admin/Gestor |
| `aliexpress_orders` | Pedidos enviados a AE | Admin/Gestor |
| `aliexpress_errors` | Errores AE | Solo admin |
| `aliexpress_config` | Configuración AE | Solo admin |
| `affiliate_commissions` | Comisiones afiliados | Admin |

### Enums

```typescript
UserRole: 'admin' | 'gestor' | 'instalador' | 'cliente'
CustomerType: 'familia' | 'mayor' | 'negocio'
ProductType: 'dropshipping' | 'afiliado' | 'servicio' | 'pack'
ProductStatus: 'borrador' | 'publicado'
OrderStatus: 'pendiente_pago' | 'pagado' | 'enviado_proveedor' | 
             'en_transito' | 'entregado' | 'incidencia' | 
             'devuelto' | 'cancelado'
InstallationStatus: 'solicitada' | 'confirmada' | 'asignada' | 
                    'realizada' | 'cerrada' | 'cancelada'
QuoteStatus: 'borrador' | 'enviado' | 'aceptado' | 'rechazado'
```

### Triggers automáticos
- `update_updated_at()`: actualiza `updated_at` en todas las tablas
- `handle_new_user()`: crea profile con rol "cliente" al registrarse

### Funciones auxiliares
- `get_my_role()`: devuelve el rol del usuario actual (para RLS)
- `get_my_id()`: devuelve el ID del usuario actual

---

## 7. Edge Functions

| Función | Propósito | Claves que usa |
|---------|-----------|----------------|
| `aliexpress-client` | Cliente API AliExpress (firma HMAC-MD5) | `ALIEXPRESS_APP_KEY`, `ALIEXPRESS_APP_SECRET` |
| `aliexpress-sync` | Sincroniza precios/stock (cron) | Service role |
| `aliexpress-create-order` | Crea pedido en AliExpress | Service role |
| `aliexpress-tracking` | Consulta seguimiento (cron) | Service role |
| `ai-assistant` | Asistentes IA con Claude | `ANTHROPIC_API_KEY` |
| `create-checkout` | Crea sesión Stripe Checkout | `STRIPE_SECRET_KEY` |
| `stripe-webhook` | Procesa webhooks Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| `send-email` | Envía emails con Resend | `RESEND_API_KEY` |
| `invite-user` | Invita colaboradores | Service role |
| `update-user-role` | Cambia roles de usuario | Service role |

### Seguridad de Edge Functions
- ✅ Todas validan JWT del usuario
- ✅ Todas verifican el rol antes de ejecutar
- ✅ Service role key solo en Edge Functions
- ✅ Sanitización de inputs
- ✅ Manejo seguro de errores (no exponen stack traces)

---

## 8. Rutas y Páginas

### Rutas públicas (TiendaLayout)
| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | HomePage | Landing con hero, perfiles, packs, FAQ |
| `/catalogo` | CatalogPage | Catálogo con filtros en URL |
| `/producto/:slug` | ProductPage | Ficha de producto |
| `/packs` | PacksPage | Packs con tabla comparativa |
| `/comprobar-zona` | ZoneCheckerPage | Verificar código postal |
| `/carrito` | CartPage | Carrito de compra |
| `/checkout` | CheckoutPage | Finalizar compra |
| `/pago-exitoso` | PaymentSuccessPage | Confirmación de pago |
| `/pago-cancelado` | PaymentCancelledPage | Pago cancelado |
| `/mi-cuenta` | MyAccountPage | Área cliente (protegida) |
| `/aviso-legal` | AvisoLegalPage | LSSI |
| `/privacidad` | PrivacidadPage | RGPD |
| `/cookies` | CookiesPage | Política cookies |
| `/condiciones-venta` | CondicionesVentaPage | Condiciones |
| `/devoluciones` | DevolucionesPage | 14 días desistimiento |
| `/garantia` | GarantiaPage | 3 años garantía |

### Rutas de autenticación
| Ruta | Página |
|------|--------|
| `/login` | LoginPage |
| `/registro` | RegisterPage |
| `/recuperar-contrasena` | RecoverPasswordPage |
| `/nueva-contrasena` | NewPasswordPage |
| `/auth/redirect` | AuthRedirect (según rol) |

### Rutas del panel (PanelLayout)
| Ruta | Página | Roles |
|------|--------|-------|
| `/panel` | DashboardPage | admin, gestor |
| `/panel/mi-agenda` | MyAgendaPage | instalador |
| `/panel/pedidos` | OrdersPage | admin, gestor |
| `/panel/pedidos/:id` | OrderDetailPage | admin, gestor |
| `/panel/instalaciones` | InstallationsPage | admin, gestor |
| `/panel/instalaciones/nueva` | NewInstallationPage | admin, gestor |
| `/panel/instalaciones/:id` | InstallationDetailPage | admin, gestor |
| `/panel/productos` | ProductsPage | admin |
| `/panel/productos/nuevo` | ProductNewPage | admin |
| `/panel/productos/:id` | ProductEditPage | admin |
| `/panel/categorias` | CategoriesPage | admin |
| `/panel/clientes` | CustomersPage | admin, gestor |
| `/panel/presupuestos` | QuotesPage | admin, gestor |
| `/panel/afiliacion` | AffiliatePage | admin |
| `/panel/informes` | ReportsPage | admin |
| `/panel/usuarios` | UsersPage | admin |
| `/panel/asistente-ia` | AiAssistantPage | admin, gestor |
| `/panel/aliexpress` | AliexpressConfigPage | admin |
| `/panel/aliexpress/importar` | ImportAliexpressProductPage | admin |
| `/panel/ajustes` | SettingsPage | admin |

---

## 9. Hooks Personalizados

### Autenticación y sesión
- `useAuth()` - Gestión completa de auth (login, logout, refresh)

### Catálogo público
- `usePublicProducts()` - Productos con filtros
- `usePublicProduct()` - Producto por slug
- `useRelatedProducts()` - Productos relacionados
- `useFeaturedPacks()` - Packs destacados

### Gestión de productos
- `useProducts()` - Lista con filtros
- `useProduct()` - Producto por ID
- `useCreateProduct()` - Crear
- `useUpdateProduct()` - Actualizar
- `useDeleteProduct()` - Eliminar
- `useUpdateProductImages()` - Imágenes
- `useUpdatePackItems()` - Items de pack
- `useCategories()` - Categorías

### Pedidos
- `useOrders()` - Lista con filtros
- `useOrder()` - Detalle
- `useUpdateOrderStatus()` - Cambiar estado (envía email auto)
- `useUpdateOrderNotes()` - Notas internas
- `useReportIncident()` - Reportar incidencia
- `useProcessReturn()` - Procesar devolución

### Instalaciones
- `useInstallations()` - Lista con filtros
- `useInstallation()` - Detalle
- `useInstallationsByDateRange()` - Para calendario
- `useUpdateInstallation()` - Actualizar
- `useCreateInstallation()` - Crear manual
- `useUploadInstallationPhoto()` - Subir foto
- `useCompleteInstallation()` - Marcar realizada
- `useInstallers()` - Lista instaladores

### Clientes y presupuestos
- `useCustomers()` - Lista clientes
- `useCustomer()` - Detalle cliente
- `useQuotes()` - Lista presupuestos
- `useQuote()` - Detalle presupuesto
- `useConvertQuoteToOrder()` - Convertir a pedido

### Informes y afiliación
- `useDashboard()` - Stats dashboard
- `useSalesReport()` - Informe ventas
- `useTopProductsReport()` - Top productos
- `useInstallationsByInstallerReport()` - Por instalador
- `useAffiliateClicks()` - Clics
- `useAffiliateStats()` - Estadísticas
- `useAffiliateCommissions()` - Comisiones

### AliExpress
- `useAliexpressTokenStatus()` - Estado token
- `useGenerateAliexpressToken()` - Generar token
- `useImportAliexpressProduct()` - Importar producto
- `useCreateAliexpressOrder()` - Crear pedido AE
- `useAliexpressTracking()` - Tracking
- `useAliexpressOrders()` - Pedidos AE
- `useAliexpressErrors()` - Errores
- `useAliexpressConfig()` - Configuración
- `useSyncAliexpressProducts()` - Sincronizar

### IA
- `useAiAssistant()` - Hook genérico IA
- `useShopAssistant()` - Asistente tienda
- `usePanelAssistant()` - Asistente panel
- `useGenerateProductDescription()` - Generar descripción
- `useGenerateEmailResponse()` - Redactar email

### Otros
- `useSEO()` - SEO dinámico
- `useServiceZones()` - Comprobar zona
- `useTrackAffiliateClick()` - Track clic afiliado
- `useUsers()` - Gestión usuarios
- `useInviteUser()` - Invitar usuario
- `useUpdateUserRole()` - Cambiar rol
- `useInvoices()` - Facturas
- `useNextInvoiceNumber()` - Siguiente número

---

## 10. Stores (Zustand)

### `cart-store.ts`
```typescript
{
  items: CartItem[];
  installationData: InstallationData | null;
  addItem(product, quantity) → { success, error? };
  removeItem(productId);
  updateQuantity(productId, quantity);
  clearCart();
  setInstallationData(data);
  getTotalItems() → number;
  getTotalPrice() → number;
  hasInstallation() → boolean;
  hasAffiliateProducts() → boolean;
}
```
- Persistido en localStorage (`segurhogar-cart`)
- Valida que no se añadan productos afiliados

### `cookie-consent-store.ts`
```typescript
{
  hasConsented: boolean;
  preferences: { necessary, analytics, marketing };
  bannerVisible: boolean;
  setConsent(preferences);
  showBanner();
  hideBanner();
}
```
- Persistido en localStorage (`segurhogar-cookie-consent`)

---

## 11. Integraciones Externas

### Stripe (Pagos)
- **Modo**: Checkout Session
- **Webhook**: `stripe-webhook` Edge Function
- **Eventos**: `checkout.session.completed`, `checkout.session.expired`
- **Estado**: ✅ Completamente integrado

### Resend (Emails)
- **Templates**: 4 tipos (pedido confirmado, enviado, instalación confirmada/completada)
- **Trigger**: Automático al cambiar estado del pedido
- **Estado**: ✅ Completamente integrado

### Claude API (Anthropic)
- **Modelo**: Claude 3.5 Sonnet
- **Endpoints**: 4 (shop-assistant, panel-assistant, product-description, email-response)
- **Function calling**: 6 herramientas seguras para panel
- **Control de costes**: Límites por usuario
- **Estado**: ✅ Completamente integrado

### AliExpress Open Platform
- **Autenticación**: OAuth 2.0 con firma HMAC-MD5
- **Funcionalidades**:
  - Importar productos
  - Sincronizar precios/stock
  - Crear pedidos
  - Consultar tracking
- **Cron**: Sincronización cada 6h, tracking cada hora
- **Estado**: ✅ Completamente integrado

---

## 12. Seguridad

### ✅ Implementado
- [x] Autenticación con Supabase Auth (bcrypt + JWT)
- [x] Row Level Security en todas las tablas
- [x] Función `get_my_role()` con `SECURITY DEFINER`
- [x] Validación de formularios con Zod
- [x] Redirecciones seguras según rol
- [x] **Ninguna clave secreta en el frontend**
- [x] Service role key solo en Edge Functions
- [x] Verificación de firma en webhooks Stripe
- [x] Headers de seguridad (X-Frame-Options, HSTS, etc.)
- [x] HTTPS forzado en Vercel
- [x] CORS configurado
- [x] Banner de cookies RGPD-compliant
- [x] Páginas legales completas (LSSI, RGPD)
- [x] Control de límites de uso de IA
- [x] Registro de errores AliExpress

### 🔍 Auditoría
Ver `SECURITY_AUDIT.md` para auditoría completa.

---

## 13. Variables de Entorno

### Frontend (`.env`)
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Backend (Supabase Secrets)
```env
# AliExpress
ALIEXPRESS_APP_KEY=...
ALIEXPRESS_APP_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# Claude AI
ANTHROPIC_API_KEY=sk-ant-...
```

### ⚠️ NUNCA subir al repositorio:
- `.env`
- `.env.local`
- Cualquier archivo con claves secretas

---

## 14. Estado Actual y Pendientes

### ✅ Completado
- Los 13 pasos del proyecto
- Build exitoso (`npm run build` ✓)
- Todas las funcionalidades principales
- Documentación completa

### ⏳ Antes de publicar (placeholders a rellenar)

#### Datos legales (en 6 páginas + footer + structured data)
- `[NOMBRE_EMPRESA]`
- `[CIF_NIF]`
- `[DIRECCION_COMPLETA]`
- `[EMAIL_CONTACTO]`, `[EMAIL_PRIVACIDAD]`, `[EMAIL_DEVOLUCIONES]`, `[EMAIL_GARANTIA]`, `[EMAIL_SOPORTE]`
- `[TELEFONO]`, `[TELEFONO_SOPORTE]`
- `[HORARIO_ATENCION]`, `[HORARIO_SOPORTE]`
- `[DOMINIO_WEB]`
- `[CIUDAD]`, `[CODIGO_POSTAL]`, `[DIRECCION]`
- `[CIUDAD_JUZGADOS]`
- `[FECHA_ACTUALIZACION]`
- `[REGISTRO_MERCANTIL]`, `[TOMO]`, `[FOLIO]`, `[HOJA]`

#### Variables de entorno
- Configurar todas en Supabase Secrets
- Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

#### Configuración de servicios
- Stripe: crear productos, configurar webhooks
- Resend: verificar dominio
- AliExpress: autorizar aplicación
- Claude: verificar límites de uso

### 💡 Mejoras futuras sugeridas
- App móvil nativa (React Native)
- Chat en vivo con soporte
- Sistema de valoraciones
- Programa de fidelización
- Blog/contenido educativo
- Multi-idioma
- Modo oscuro
- A/B testing
- Integración con WhatsApp Business

---

## 15. Cómo Probar

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
# Abre http://localhost:3000
```

### Build
```bash
npm run build
npm run preview
```

### Usuarios de prueba (demo local)
```
admin@segurhogar.es / demo1234
gestor@segurhogar.es / demo1234
instalador@segurhogar.es / demo1234
```

### Flujos a probar
1. **Tienda pública**: Home → Catálogo → Producto → Carrito → Checkout
2. **Login**: Probar los 3 roles y ver menús diferentes
3. **Panel admin**: Dashboard, Productos, Pedidos, Instalaciones, AliExpress
4. **Panel instalador**: Mi agenda → Detalle → Fotos → Firma → Completar
5. **Asistente IA**: Widget flotante en tienda + chat en panel
6. **AliExpress**: Importar producto → Crear pedido → Tracking

---

## 16. Despliegue

### Frontend (Vercel)
```bash
# Opción 1: Desde GitHub (recomendado)
# Conectar repo en vercel.com

# Opción 2: CLI
npm install -g vercel
vercel --prod
```

### Edge Functions (Supabase)
```bash
supabase functions deploy aliexpress-client
supabase functions deploy aliexpress-sync
supabase functions deploy aliexpress-create-order
supabase functions deploy aliexpress-tracking
supabase functions deploy ai-assistant
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy send-email
supabase functions deploy invite-user
supabase functions deploy update-user-role
```

### Cron jobs (pg_cron en Supabase)
```sql
-- Sincronizar AliExpress cada 6h
SELECT cron.schedule('sync-aliexpress', '0 */6 * * *', ...);

-- Tracking cada hora
SELECT cron.schedule('check-tracking', '0 * * * *', ...);
```

### Dominio
1. Añadir dominio en Vercel → Settings → Domains
2. Configurar DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```
3. Activar HTTPS automático

### Guía completa
Ver `DEPLOYMENT.md` para instrucciones detalladas.

---

## 📊 Métricas del Proyecto

| Categoría | Cantidad |
|-----------|----------|
| Páginas | 40+ |
| Componentes | 50+ |
| Hooks personalizados | 25+ |
| Edge Functions | 10 |
| Tablas BD | 22 |
| Tipos TypeScript | 30+ |
| Rutas | 35+ |
| Archivos de documentación | 16 |
| Líneas de código (aprox.) | ~30,000 |

---

## 📚 Documentación Disponible

| Archivo | Contenido |
|---------|-----------|
| `README.md` | Resumen general |
| `ESTADO_DEL_PROYECTO.md` | Este documento |
| `AUTENTICACION.md` | Paso 3 detallado |
| `PANEL.md` | Paso 4 detallado |
| `PRODUCTOS.md` | Paso 5 detallado |
| `TIENDA_PUBLICA.md` | Paso 6 detallado |
| `CARRITO_PAGO.md` | Paso 7 detallado |
| `PEDIDOS_EMAILS.md` | Paso 8 detallado |
| `INSTALACIONES.md` | Paso 9 detallado |
| `PASO_10.md` | Clientes/Presupuestos/Informes |
| `PASO_11.md` | Asistentes IA |
| `PASO_12.md` | AliExpress |
| `PASO_13.md` | Preparación publicación |
| `SECURITY_AUDIT.md` | Auditoría seguridad |
| `DEPLOYMENT.md` | Guía despliegue completa |

---

## 🎯 Conclusión

**SegurHogar** es un proyecto **completo y funcional** que cubre todas las necesidades de una empresa de seguridad física y digital:

- ✅ Tienda pública completa con catálogo, packs y asistente IA
- ✅ Panel de gestión con todos los módulos necesarios
- ✅ Sistema de pagos con Stripe
- ✅ Emails transaccionales automáticos
- ✅ Gestión de instalaciones con app móvil
- ✅ Integración dropshipping con AliExpress
- ✅ Asistentes IA con Claude
- ✅ Cumplimiento legal español (LSSI, RGPD)
- ✅ SEO optimizado
- ✅ Seguridad robusta
- ✅ Listo para producción

**Próximo paso**: Rellenar placeholders legales, configurar variables de entorno y desplegar en Vercel + Supabase.

---

**Desarrollado con ❤️ usando React, Supabase, Stripe, Claude AI y AliExpress**
