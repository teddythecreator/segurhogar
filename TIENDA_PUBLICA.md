# Tienda Pública - Paso 6

## ✅ Implementación completada

### Archivos creados/modificados:

**Hooks de datos públicos:**
- `src/hooks/usePublicProducts.ts` — Productos públicos con filtros, producto por slug, relacionados, packs destacados
- `src/hooks/useServiceZones.ts` — Comprobador de código postal
- `src/hooks/useAffiliate.ts` — Tracking de clics de afiliado

**Componentes UI:**
- `src/components/ui/Accordion.tsx` — Acordeón para FAQ

**Componentes de producto:**
- `src/components/tienda/product/ProductCard.tsx` — Tarjeta reutilizable con imagen, precio y acción según tipo
- `src/components/tienda/product/ProductGallery.tsx` — Galería con miniaturas y navegación

**Páginas:**
- `src/pages/tienda/HomePage.tsx` — Inicio completo con hero, perfiles, packs, ventajas, testimonios, FAQ
- `src/pages/tienda/CatalogPage.tsx` — Catálogo con filtros en URL
- `src/pages/tienda/ProductPage.tsx` — Ficha completa con tabs, afiliado, carrito
- `src/pages/tienda/PacksPage.tsx` — Packs con tabla comparativa por perfil
- `src/pages/tienda/ZoneCheckerPage.tsx` — Comprobador de código postal

**Navegación:**
- `src/App.tsx` — Nuevas rutas `/packs`, `/comprobar-zona`
- `src/components/tienda/Header.tsx` — Enlaces a Packs y Zonas
- `src/components/tienda/Footer.tsx` — Enlaces con filtros pre-aplicados

---

## 🏠 Página de inicio

### Hero
- Titular: "Protege tu hogar y tu negocio, dentro y fuera de la red"
- Gradiente azul oscuro con efectos de blur
- CTAs: Ver catálogo / Ver packs

### Accesos por perfil
- **Familias**: productos para el día a día
- **Personas mayores**: tecnología sencilla con soporte
- **Negocios**: seguridad integral

### Packs destacados
- 3 packs más recientes desde Supabase
- Grid responsive

### Ventajas
- Instalación profesional
- Garantía de 3 años
- Soporte cercano

### Testimonios
- 3 testimonios con nombre, ubicación y valoración

### FAQ (acordeón)
- 6 preguntas frecuentes con respuestas desplegables
- Envíos, instalación, garantía, zonas, facilidad de uso, servicio

### CTA final
- Invitación a explorar catálogo

---

## 🛍️ Catálogo con filtros en URL

### Filtros disponibles
- **Búsqueda** por nombre o descripción
- **Perfil**: familia, mayor, negocio, todos
- **Tipo**: dropshipping, afiliado, servicio, pack
- **Categoría**: todas las categorías de la BD
- **Rango de precio**: mínimo y máximo
- **Ordenación**: recientes, precio asc/desc, nombre

### URL compartible
Todos los filtros se guardan en la URL con `useSearchParams`:
```
/catalogo?perfil=familia&categoria=camaras&precio_max=100&ordenar=precio_asc
```

### Paginación
- 12 productos por página
- Navegación Anterior/Siguiente
- Contador de resultados

### Estados
- Loading con skeletons
- Empty state con botón para limpiar filtros

---

## 📄 Ficha de producto

### Galería
- Imagen principal con navegación (anterior/siguiente)
- Miniaturas clicables
- Indicador de posición (1/5)
- Fallback con emoji si no hay imágenes

### Información
- Badges (tipo, categoría, oferta)
- Título y precio con IVA incluido
- Descripción corta
- Plazo de entrega estimado
- Garantías (3 años, soporte)

### Acciones según tipo

**Productos comprables (dropshipping/pack):**
- Botón "Añadir al carrito"
- Checkbox "Añadir instalación profesional" (opcional)

**Afiliado:**
- Botón "Ver en [tienda]" que:
  - Registra el clic en `affiliate_clicks`
  - Abre enlace en pestaña nueva
  - Muestra aviso "Enlace de afiliado"

**Servicio:**
- Enlace a la ficha para reservar

### Pestañas de información
- **Descripción**: texto completo del producto
- **Especificaciones**: tabla clave-valor desde JSON
- **Envío e instalación**: plazos, devoluciones

### Productos relacionados
- 4 productos de la misma categoría
- Grid responsive

---

## 📦 Página de packs

### Tabla comparativa por perfil
- 3 columnas: Familias, Personas mayores, Negocios
- Cada columna muestra packs recomendados para ese perfil
- Precio y botón de añadir al carrito

### Todos los packs
- Grid de todos los packs disponibles
- Cada card muestra:
  - Badge "Pack"
  - Nombre y descripción
  - Productos incluidos (con check)
  - Beneficios (instalación, garantía, soporte)
  - Precio y CTAs

---

## 📍 Comprobador de código postal

### Formulario
- Input de 5 dígitos (solo números)
- Validación en tiempo real
- Botón "Comprobar"

### Resultados
- **Disponible**: mensaje verde con ciudad/provincia
- **No disponible**: mensaje rojo con información sobre zonas cubiertas

### Funcionamiento
- Consulta la tabla `service_zones` de Supabase
- Respuesta inmediata

---

## 🎨 Diseño de confianza

### Principios aplicados
- **Limpio**: mucho espacio en blanco
- **Iconos lineales**: de lucide-react
- **Paleta consistente**: azul oscuro #0B1F3A, azul #2D7FF9, verde #22C55E
- **Tipografía clara**: jerarquía con pesos y tamaños
- **Mobile-first**: responsive en todos los breakpoints

### Elementos de confianza
- Badges de garantía (3 años)
- Testimonios con valoración
- FAQ transparente
- Plazos de entrega claros
- Aviso de IVA incluido
- Comprobador de zonas

---

## 🔒 Seguridad y rendimiento

### Seguridad
- ✅ Solo se muestran productos publicados y activos
- ✅ RLS de Supabase filtra automáticamente
- ✅ Tracking de afiliado no bloquea la navegación
- ✅ Enlaces de afiliado con `rel="noopener noreferrer nofollow"`

### Rendimiento
- ✅ TanStack Query con cache de 5 minutos
- ✅ Paginación para limitar datos por petición
- ✅ Lazy loading de imágenes (nativo del navegador)
- ✅ Skeletons para mejor UX durante carga

---

## 🧪 Cómo probar

### 1. Asegurar datos en Supabase
- Productos publicados con imágenes
- Categorías creadas
- Zonas de servicio con códigos postales
- Packs con items

### 2. Probar la home
- Ir a `/`
- Ver hero, perfiles, packs, ventajas, testimonios, FAQ
- Probar acordeón de FAQ

### 3. Probar catálogo
- Ir a `/catalogo`
- Probar cada filtro
- Ver URL actualizarse
- Compartir URL con filtros
- Probar paginación

### 4. Probar ficha de producto
- Ir a `/producto/[slug]`
- Ver galería con navegación
- Probar tabs
- Añadir al carrito
- Probar checkbox de instalación

### 5. Probar afiliado
- Ir a ficha de producto de tipo afiliado
- Clic en "Ver en [tienda]"
- Verificar que se abre en nueva pestaña
- Verificar aviso de afiliado

### 6. Probar packs
- Ir a `/packs`
- Ver tabla comparativa por perfil
- Añadir pack al carrito

### 7. Probar zonas
- Ir a `/comprobar-zona`
- Introducir CP válido (ej: 28001)
- Introducir CP inválido (ej: 08001)

---

## 📊 Estructura de datos

### Producto público
```typescript
{
  id, nombre, slug, tipo, precio, precio_rebajado,
  descripcion_corta, descripcion_completa,
  especificaciones, plazo_entrega_dias,
  url_afiliado, tienda_afiliado,
  perfiles_recomendados,
  categoria: { id, nombre, slug },
  imagenes: [{ url, orden, alt }],
  pack_items: [{ product_id, product: {...} }]
}
```

### Filtros en URL
```
?search=camara
&perfil=familia
&tipo=dropshipping
&categoria=camaras
&precio_min=20
&precio_max=100
&ordenar=precio_asc
&page=2
```

---

## 🚀 Próximos pasos

- Implementar carrito con persistencia en BD
- Implementar checkout con Stripe
- Añadir búsqueda con debounce
- Implementar wishlist/favoritos
- Añadir reseñas de productos
- Implementar cupones de descuento
- Añadir comparador de productos
- Implementar vista rápida (quick view)
