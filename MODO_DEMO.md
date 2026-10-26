# 🎮 Modo Demo - Guía de Uso

## ¿Qué es el Modo Demo?

El Modo Demo te permite probar **toda la aplicación sin necesidad de configurar Supabase**. Incluye:
- ✅ Autenticación simulada con 4 roles diferentes
- ✅ Datos de ejemplo (productos, clientes, pedidos, instalaciones)
- ✅ Todas las funcionalidades del panel funcionando
- ✅ Persistencia en localStorage (no pierdes sesión al recargar)

---

## 🔐 Credenciales de Acceso

### Admin (Acceso completo)
```
Email: admin@segurhogar.es
Contraseña: demo1234
```
**Puede ver:** Todo (Dashboard, Pedidos, Instalaciones, Productos, Clientes, Presupuestos, Afiliación, Informes, Usuarios, Ajustes, AliExpress, Asistente IA)

### Gestor (Gestión operativa)
```
Email: gestor@segurhogar.es
Contraseña: demo1234
```
**Puede ver:** Dashboard, Pedidos, Instalaciones, Clientes, Presupuestos

### Instalador (Solo su agenda)
```
Email: instalador@segurhogar.es
Contraseña: demo1234
```
**Puede ver:** Solo "Mi agenda" con sus instalaciones asignadas

### Cliente (Área de cliente)
```
Email: cliente@segurhogar.es
Contraseña: demo1234
```
**Puede ver:** Solo "Mi cuenta" con sus pedidos e instalaciones

---

## 🚀 Cómo Usar el Modo Demo

### 1. Iniciar la aplicación
```bash
npm install
npm run dev
```

### 2. Acceder al login
Abre tu navegador en: `http://localhost:3000/login`

### 3. Iniciar sesión
Usa cualquiera de las credenciales de arriba.

### 4. Explorar la aplicación
Una vez dentro, puedes:
- Navegar por todas las secciones del panel
- Ver datos de ejemplo (productos, pedidos, clientes)
- Probar filtros, búsqueda y paginación
- Cambiar entre roles cerrando sesión y entrando con otro usuario

---

## 📦 Datos de Ejemplo Incluidos

### Productos (5 productos)
1. **Cámara WiFi Interior 1080p** - Dropshipping, 34.99€
2. **Kit Alarma Hogar GSM+WiFi** - Dropshipping, 74.99€ (oferta)
3. **Cerradura Inteligente Tuya** - Afiliado (Amazon), 129.99€
4. **Instalación de Alarma Básica** - Servicio, 120.00€
5. **Pack Seguridad Hogar Completo** - Pack, 259.99€

### Clientes (3 clientes)
1. **María García López** - Familia, Madrid
2. **Juan Pérez Martínez** - Persona mayor, Madrid
3. **Comercial Rodríguez SL** - Negocio, Alcalá de Henares

### Pedidos (3 pedidos)
1. **PED-2024-0001** - Estado: Pagado (133.08€)
2. **PED-2024-0002** - Estado: En tránsito (314.59€)
3. **PED-2024-0003** - Estado: Pendiente de pago (605.00€)

### Instalaciones (1 instalación)
1. Instalación para Juan Pérez - 10 Feb 2024, 10:00-12:00

### Categorías (2 categorías)
1. Seguridad Física
2. Ciberseguridad

### Zonas de Servicio (12 códigos postales)
Todos los códigos postales de Madrid capital + Alcalá de Henares

---

## 🎯 Flujos para Probar

### Flujo 1: Gestión de Pedidos (como Admin/Gestor)
1. Login como `admin@segurhogar.es`
2. Ir a **Panel → Pedidos**
3. Ver lista de pedidos con filtros
4. Click en "Ver" en un pedido
5. Ver detalle completo del pedido
6. Cambiar estado (ej: de "pagado" a "enviado_proveedor")
7. Añadir número de seguimiento
8. Ver historial de cambios

### Flujo 2: Gestión de Productos (como Admin)
1. Login como `admin@segurhogar.es`
2. Ir a **Panel → Productos**
3. Ver tabla de productos con filtros
4. Click en "Nuevo producto"
5. Rellenar formulario (elige tipo: dropshipping, afiliado, servicio, pack)
6. Guardar como borrador
7. Editar y publicar

### Flujo 3: Agenda de Instalador (como Instalador)
1. Login como `instalador@segurhogar.es`
2. Ir a **Panel → Mi agenda**
3. Ver instalaciones asignadas
4. Click en una instalación
5. Ver detalle con dirección, cliente, productos
6. Botón "He llegado" (registra hora)
7. Añadir tareas al checklist
8. Subir fotos (simulado)
9. Obtener firma del cliente (simulado)
10. Marcar como realizada

### Flujo 4: Área de Cliente (como Cliente)
1. Login como `cliente@segurhogar.es`
2. Ir a **Mi cuenta**
3. Ver pestaña "Mis pedidos"
4. Ver pestaña "Mis instalaciones"
5. Ver pestaña "Mi perfil"

### Flujo 5: Tienda Pública (sin login)
1. Ir a `http://localhost:3000/`
2. Explorar home con hero, perfiles, packs
3. Ir a **Catálogo**
4. Probar filtros (tipo, categoría, perfil, precio)
5. Ver URL actualizarse con filtros
6. Click en un producto
7. Ver ficha completa con galería, tabs, productos relacionados
8. Añadir al carrito
9. Ir al carrito
10. Ver resumen y botón de checkout

### Flujo 6: Asistente IA
1. En la tienda pública, ver botón flotante azul (esquina inferior derecha)
2. Click para abrir chat
3. Preguntar: "¿Qué cámara me recomiendas?"
4. Ver respuesta con productos recomendados
5. En el panel (como admin/gestor), ir a **Asistente IA**
6. Preguntar: "¿Qué pedidos están retrasados?"
7. Ver respuesta con datos reales

---

## ⚠️ Limitaciones del Modo Demo

### Lo que SÍ funciona:
- ✅ Autenticación y roles
- ✅ Navegación entre páginas
- ✅ Visualización de datos de ejemplo
- ✅ Filtros y búsqueda
- ✅ Cambio de estado de pedidos
- ✅ Creación de productos (en memoria)
- ✅ Carrito de compra (localStorage)
- ✅ Asistente IA (respuestas simuladas)

### Lo que NO funciona (requiere Supabase):
- ❌ Persistencia real de datos (se pierden al recargar)
- ❌ Pagos con Stripe
- ❌ Envío de emails reales
- ❌ Llamadas a APIs externas (AliExpress, Claude)
- ❌ Subida real de imágenes a Storage
- ❌ Webhooks de Stripe
- ❌ Sincronización con AliExpress
- ❌ MFA (autenticación en dos pasos)

---

## 🔄 Cambiar entre Roles

Para cambiar de rol:
1. Click en tu nombre/avatar (esquina superior derecha)
2. Click en "Cerrar sesión"
3. Vuelve a `/login`
4. Inicia sesión con otro usuario

---

## 📊 Datos en el Dashboard

El Dashboard muestra datos calculados de los pedidos de ejemplo:
- **Ventas de hoy**: Suma de pedidos creados hoy
- **Ventas del mes**: Suma de pedidos del mes actual
- **Pedidos pendientes**: Pedidos en estados "pendiente_pago", "pagado", "enviado_proveedor"
- **Instalaciones pendientes**: Instalaciones en estados "solicitada", "confirmada", "asignada"

---

## 🎨 Personalizar Datos Demo

Si quieres modificar los datos de ejemplo:

1. Edita el archivo `src/data/demo.ts`
2. Cambia productos, clientes, pedidos, etc.
3. Guarda el archivo
4. Recarga la página

**Ejemplo: Añadir un nuevo producto**
```typescript
export const demoProducts: Product[] = [
  // ... productos existentes
  {
    id: 'prod-006',
    tipo: 'dropshipping',
    nombre: 'Mi Nuevo Producto',
    slug: 'mi-nuevo-producto',
    // ... resto de campos
  }
]
```

---

## 🚀 Siguiente Paso: Migrar a Supabase

Cuando estés listo para producción o quieras probar con datos reales:

1. **Crear proyecto en Supabase** (gratis)
2. **Configurar variables de entorno** en `.env`
3. **Ejecutar el esquema SQL** (`supabase/schema.sql`)
4. **Insertar datos de ejemplo** si quieres
5. **Desactivar el modo demo** (eliminar `src/data/demo.ts`)

Ver `DEPLOYMENT.md` para guía completa de despliegue.

---

## 🐛 Solución de Problemas

### "No puedo hacer login"
- Asegúrate de usar exactamente las credenciales indicadas
- Verifica que no haya espacios extra
- La contraseña es `demo1234` para todos los usuarios

### "Los datos desaparecen al recargar"
- Esto es normal en modo demo
- Los datos se cargan desde `src/data/demo.ts` en cada carga
- Para persistencia real, necesitas Supabase

### "No veo todas las secciones del panel"
- Verifica que estás usando el rol correcto
- Admin ve todo, Gestor ve menos, Instalador solo ve su agenda
- Cierra sesión y entra con `admin@segurhogar.es`

### "El asistente IA no responde"
- En modo demo, el asistente da respuestas simuladas
- Para respuestas reales con Claude API, necesitas Supabase

---

## 📞 Soporte

Si tienes problemas con el modo demo:
1. Revisa la consola del navegador (F12)
2. Verifica que no haya errores en `npm run dev`
3. Asegúrate de tener todas las dependencias instaladas (`npm install`)

---

**¡Disfruta probando SegurHogar en modo demo!** 🎉
