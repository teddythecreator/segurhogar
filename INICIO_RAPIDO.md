# 🚀 Inicio Rápido - Modo Demo

## Instalación

```bash
npm install
```

## Ejecutar en Modo Demo

```bash
npm run dev
```

Abre tu navegador en: `http://localhost:3000`

---

## 🔐 Acceder como Admin

1. Ve a `http://localhost:3000/login`
2. Usa estas credenciales:

```
Email: admin@segurhogar.es
Contraseña: demo1234
```

3. Serás redirigido al panel de administración

---

## 👥 Otros Roles Disponibles

### Gestor
```
Email: gestor@segurhogar.es
Contraseña: demo1234
```

### Instalador
```
Email: instalador@segurhogar.es
Contraseña: demo1234
```

### Cliente
```
Email: cliente@segurhogar.es
Contraseña: demo1234
```

---

## 📦 ¿Qué Incluye el Modo Demo?

✅ **Autenticación simulada** con 4 roles diferentes  
✅ **Datos de ejemplo**: 5 productos, 3 clientes, 3 pedidos, 1 instalación  
✅ **Todas las funcionalidades** del panel funcionando  
✅ **Persistencia en localStorage** (no pierdes sesión al recargar)  
✅ **Tienda pública** completa con catálogo, carrito, checkout  
✅ **Asistente IA** con respuestas simuladas  

---

## 🎯 Primeros Pasos

### Como Admin:
1. **Ver Dashboard**: Estadísticas y gráficos
2. **Gestionar Pedidos**: Ver lista, cambiar estados, añadir seguimiento
3. **Gestionar Productos**: Crear, editar, publicar productos
4. **Ver Clientes**: CRM completo con historial
5. **Asistente IA**: Preguntar sobre datos del negocio

### Como Instalador:
1. **Ver Mi Agenda**: Instalaciones asignadas
2. **Detalle de Instalación**: Ver cliente, dirección, productos
3. **Registrar Llegada**: Botón "He llegado"
4. **Completar Instalación**: Checklist, fotos, firma

### Como Cliente:
1. **Ver Mis Pedidos**: Historial de compras
2. **Ver Mis Instalaciones**: Estado de instalaciones
3. **Editar Perfil**: Datos personales

---

## 📚 Documentación Completa

- **MODO_DEMO.md** - Guía completa del modo demo
- **ESTADO_DEL_PROYECTO.md** - Estado completo del proyecto
- **DEPLOYMENT.md** - Guía para desplegar en producción con Supabase

---

## ⚠️ Limitaciones del Modo Demo

❌ No persiste datos nuevos (solo datos de ejemplo)  
❌ No procesa pagos reales (Stripe)  
❌ No envía emails reales (Resend)  
❌ No llama a APIs externas (AliExpress, Claude)  
❌ No sube imágenes reales a Storage  

Para funcionalidad completa, configura Supabase (ver DEPLOYMENT.md).

---

## 🆘 Problemas Comunes

### "No puedo hacer login"
- Usa exactamente: `admin@segurhogar.es` / `demo1234`
- Verifica que no haya espacios extra

### "Los datos desaparecen al recargar"
- Normal en modo demo
- Los datos se cargan desde `src/data/demo.ts`

### "No veo todas las secciones del panel"
- Verifica que estás usando el rol correcto
- Admin ve todo, otros roles ven menos

---

## 🎉 ¡Listo!

Ya puedes explorar todas las funcionalidades de SegurHogar en modo demo.

Cuando estés listo para producción, sigue la guía en **DEPLOYMENT.md** para configurar Supabase.
