# Gestión de Productos - Paso 5

## ✅ Implementación completada

### Archivos creados/modificados:

**Hooks de datos:**
- `src/hooks/useProducts.ts` — CRUD completo de productos con filtros y paginación
- `src/hooks/useCategories.ts` — CRUD de categorías con jerarquía

**Librerías:**
- `src/lib/slug.ts` — Generador de slugs con normalización de acentos
- `src/lib/storage.ts` — Subida/eliminación de imágenes a Supabase Storage

**Componentes del formulario:**
- `src/components/panel/products/ProductForm.tsx` — Formulario principal con campos dinámicos
- `src/components/panel/products/SpecsEditor.tsx` — Editor de especificaciones clave-valor
- `src/components/panel/products/PackItemsSelector.tsx` — Selector de productos para packs
- `src/components/panel/products/ImageUploader.tsx` — Subida de imágenes con drag & drop

**Páginas:**
- `src/pages/panel/ProductsPage.tsx` — Tabla con búsqueda, filtros y paginación
- `src/pages/panel/ProductNewPage.tsx` — Crear producto
- `src/pages/panel/ProductEditPage.tsx` — Editar producto
- `src/pages/panel/CategoriesPage.tsx` — Gestión de categorías jerárquicas

**Rutas:**
- `src/App.tsx` — Nuevas rutas `/panel/productos/nuevo`, `/panel/productos/:id`, `/panel/categorias`

**Sidebar:**
- `src/components/panel/Sidebar.tsx` — Añadido enlace a Categorías

**Storage:**
- `supabase/storage.sql` — Script para crear bucket y políticas RLS

---

## 📋 Tabla de productos

### Filtros disponibles
- **Búsqueda** por nombre o slug
- **Tipo**: dropshipping, afiliado, servicio, pack
- **Categoría**: todas las categorías del sistema
- **Estado**: borrador, publicado

### Paginación
- 20 productos por página
- Navegación Anterior/Siguiente
- Contador de total de productos

### Acciones por producto
- 👁️ Ver en tienda pública
- ✏️ Editar
- 🗑️ Eliminar (con confirmación)

---

## 📝 Formulario de producto

### Campos comunes
- Nombre
- Slug (auto-generado o manual)
- Descripción corta
- Descripción completa
- Tipo (dropshipping, afiliado, servicio, pack)
- Categoría
- Estado (borrador/publicado)

### Campos según tipo

#### 🛒 Dropshipping
- Precio de coste
- Precio de venta
- Precio rebajado (opcional)
- **Margen calculado automáticamente** (% y €)
- ID de AliExpress
- Plazo de entrega (días)

#### 🔗 Afiliado
- Precio de venta
- URL de afiliado
- Tienda (Amazon, PcComponentes, AliExpress, Otra)

#### 🔧 Servicio
- Precio
- Duración estimada (minutos)

#### 📦 Pack
- Precio del pack
- **Selector de productos incluidos** con búsqueda
- **Precio total sugerido** calculado automáticamente
- Cantidad por producto

### Editor de especificaciones
- Pares clave-valor
- Añadir/eliminar dinámicamente
- Soporta JSON para valores complejos
- Ejemplos: `resolución: 1080p`, `wifi: true`, `sensores: 4`

### Subida de imágenes
- Drag & drop o selector de archivos
- Múltiples imágenes
- **Orden arrastrable** (la primera es la principal)
- Validación: imágenes hasta 5MB
- Formatos: JPG, PNG, WebP, GIF
- Badge numérico para ver el orden

---

## 🏷️ Gestión de categorías

### Características
- **Jerarquía padre/hijo** (hasta N niveles)
- Vista en árbol con indentación
- Crear/editar/eliminar categorías
- Slug auto-generado
- Categoría padre opcional
- Badge con número de categorías hijas

### Formulario
- Nombre
- Slug (auto/manual)
- Descripción
- Categoría padre (selector)

---

## 🔧 Generación de slug

La función `generateSlug()` en `src/lib/slug.ts`:
- Convierte a minúsculas
- Elimina acentos (normalización NFD)
- Reemplaza espacios por guiones
- Elimina caracteres especiales
- Elimina guiones duplicados

**Ejemplos:**
- "Cámara WiFi Interior 1080p" → `camara-wifi-interior-1080p`
- "Pack Seguridad Hogar" → `pack-seguridad-hogar`
- "Cerradura Inteligente Tuya" → `cerradura-inteligente-tuya`

---

## 📦 Supabase Storage

### Configuración del bucket

Ejecutar `supabase/storage.sql` en el SQL Editor de Supabase:

```sql
-- Crea bucket 'product-images' con:
- Público (lectura sin autenticación)
- Límite 5MB por archivo
- Solo imágenes (JPG, PNG, WebP, GIF)
```

### Políticas RLS
- **Lectura**: cualquier usuario (público)
- **Subida**: solo admin
- **Actualización**: solo admin
- **Eliminación**: solo admin

### Estructura de archivos
```
product-images/
  {product-id}/
    {timestamp}-{random}.{ext}
```

---

## 🧪 Cómo probar

### 1. Configurar Storage
```bash
# Ejecutar en Supabase SQL Editor
# Contenido de supabase/storage.sql
```

### 2. Probar tabla de productos
- Ir a `/panel/productos`
- Ver productos cargados desde la BD
- Probar filtros (tipo, categoría, estado)
- Probar búsqueda
- Probar paginación

### 3. Probar creación de producto
- Clic en "Nuevo producto"
- Rellenar campos básicos
- Cambiar tipo y ver campos dinámicos
- Añadir especificaciones
- Guardar como borrador
- Publicar

### 4. Probar cada tipo de producto

**Dropshipping:**
- Introducir precio coste y venta
- Ver margen calculado automáticamente
- Añadir ID de AliExpress

**Afiliado:**
- Introducir URL de afiliado
- Seleccionar tienda

**Servicio:**
- Introducir duración en minutos

**Pack:**
- Buscar productos en el selector
- Añadir varios productos
- Ver precio total sugerido
- Ajustar cantidades

### 5. Probar imágenes
- Subir varias imágenes
- Arrastrar para reordenar
- Ver badge de orden
- Eliminar imágenes

### 6. Probar categorías
- Ir a `/panel/categorias`
- Crear categoría raíz
- Crear subcategoría
- Ver árbol jerárquico
- Editar y eliminar

---

## 🔒 Seguridad

- ✅ Solo admin puede acceder a gestión de productos
- ✅ Solo admin puede subir/eliminar imágenes
- ✅ RLS en storage bucket
- ✅ Validación de tipos de archivo
- ✅ Validación de tamaño (5MB)
- ✅ Validación de formularios con Zod

---

## 📊 Estructura de datos

### Producto
```typescript
{
  id: string;
  nombre: string;
  slug: string;
  tipo: 'dropshipping' | 'afiliado' | 'servicio' | 'pack';
  precio: number;
  precio_coste?: number;
  precio_rebajado?: number;
  categoria_id?: string;
  estado: 'borrador' | 'publicado';
  especificaciones: Record<string, unknown>;
  // Campos específicos por tipo
  id_aliexpress?: string;
  plazo_entrega_dias?: number;
  url_afiliado?: string;
  tienda_afiliado?: string;
  duracion_instalacion_min?: number;
}
```

### Imagen
```typescript
{
  id: string;
  product_id: string;
  url: string;
  orden: number;
  alt?: string;
}
```

### Pack Item
```typescript
{
  id: string;
  pack_id: string;
  product_id: string;
  cantidad: number;
}
```

---

## 🚀 Próximos pasos

- Conectar catálogo público a productos de la BD
- Implementar página de detalle de producto público
- Implementar filtros en catálogo público
- Implementar búsqueda con debounce
- Añadir vista de galería/grid en tabla de productos
- Implementar importación/exportación masiva de productos
- Añadir SEO metadata por producto
