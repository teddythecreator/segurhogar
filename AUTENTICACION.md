# Autenticación con Supabase Auth - Paso 3

## ✅ Implementación completada

### Archivos creados/modificados:

**Hooks:**
- `src/hooks/useAuth.ts` — Hook principal de autenticación que expone:
  - `user` (Profile), `authUser` (Supabase User), `role`
  - `isLoading`, `isAuthenticated`
  - `signIn()`, `signUp()`, `signOut()`
  - `resetPassword()`, `updatePassword()`
  - `refreshProfile()`

**Páginas de autenticación:**
- `src/pages/auth/LoginPage.tsx` — Login con validación Zod
- `src/pages/auth/RegisterPage.tsx` — Registro con confirmación de email
- `src/pages/auth/RecoverPasswordPage.tsx` — Recuperación de contraseña
- `src/pages/auth/NewPasswordPage.tsx` — Establecer nueva contraseña

**Componentes:**
- `src/components/auth/ProtectedRoute.tsx` — Protección de rutas con control de roles

**Páginas protegidas:**
- `src/pages/tienda/MyAccountPage.tsx` — Área de cliente (`/mi-cuenta`)
- `src/pages/panel/MyAgendaPage.tsx` — Agenda del instalador (`/panel/mi-agenda`)

**Validaciones:**
- `src/lib/validations.ts` — Schemas Zod para todos los formularios

**Layouts actualizados:**
- `src/components/tienda/Header.tsx` — Botón de logout + enlace a mi-cuenta/panel
- `src/components/panel/PanelLayout.tsx` — Usa useAuth en lugar del store

**Rutas:**
- `src/App.tsx` — Rutas protegidas con redirección según rol

---

## 🔐 Cómo configurar Supabase Auth

### 1. Configurar URLs de redirección

En Supabase → Authentication → URL configuration:
- **Site URL**: `http://localhost:3000` (o tu dominio en producción)
- **Redirect URLs**: 
  - `http://localhost:3000/**`
  - `https://tudominio.com/**`

### 2. Configurar templates de email (opcional)

En Supabase → Authentication → Email Templates:
- Personaliza los emails de confirmación, recuperación, etc.
- Usa variables como `{{ .ConfirmationUrl }}`, `{{ .Email }}`, etc.

### 3. Desactivar confirmación de email (opcional para desarrollo)

En Supabase → Authentication → Providers → Email:
- Desmarca "Confirm email" para desarrollo
- **En producción, déjalo activado por seguridad**

---

## 👑 Cómo convertir tu primer usuario en admin

### Opción 1: Desde el SQL Editor de Supabase

1. Regístrate normalmente desde la app (o crea un usuario en Supabase → Authentication → Users)
2. Ve a Supabase → SQL Editor
3. Ejecuta:

```sql
-- Convertir un usuario en admin por email
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'tu-email@ejemplo.com';

-- Verificar que se actualizó
SELECT id, email, nombre, role FROM profiles WHERE email = 'tu-email@ejemplo.com';
```

### Opción 2: Desde la tabla profiles

1. Ve a Supabase → Table Editor
2. Abre la tabla `profiles`
3. Busca tu usuario por email
4. Cambia el valor de `role` de `cliente` a `admin`
5. Guarda los cambios

### Opción 3: Crear un usuario admin directamente

```sql
-- Crear un usuario admin directamente (sin pasar por registro)
-- Primero crea el usuario en Supabase → Authentication → Users
-- Luego ejecuta:

INSERT INTO profiles (id, email, nombre, role)
VALUES (
  'ID_DEL_USUARIO_DE_AUTH',  -- Copia el UUID de Authentication → Users
  'admin@segurhogar.es',
  'Administrador',
  'admin'
);
```

---

## 🎯 Flujo de autenticación

### Login
1. Usuario introduce email y contraseña
2. `useAuth.signIn()` llama a `supabase.auth.signInWithPassword()`
3. Supabase valida y devuelve la sesión
4. El trigger `onAuthStateChange` detecta `SIGNED_IN`
5. Se carga el profile desde la tabla `profiles`
6. Se redirige a `/auth/redirect`
7. `AuthRedirect` component decide según el rol:
   - `cliente` → `/mi-cuenta`
   - `instalador` → `/panel/mi-agenda`
   - `admin` o `gestor` → `/panel`

### Registro
1. Usuario introduce nombre, email y contraseña
2. `useAuth.signUp()` llama a `supabase.auth.signUp()`
3. Supabase crea el usuario en `auth.users`
4. El trigger `on_auth_user_created` crea automáticamente un profile con rol `cliente`
5. Si la confirmación de email está activada, se envía un email
6. Tras confirmar, el usuario puede hacer login

### Recuperación de contraseña
1. Usuario introduce email en `/recuperar-contrasena`
2. `useAuth.resetPassword()` llama a `supabase.auth.resetPasswordForEmail()`
3. Supabase envía un email con enlace a `/nueva-contrasena`
4. Usuario hace clic en el enlace (la URL incluye tokens)
5. `NewPasswordPage` verifica que hay una sesión válida
6. Usuario introduce nueva contraseña
7. `useAuth.updatePassword()` llama a `supabase.auth.updateUser()`
8. Contraseña actualizada, usuario puede hacer login

---

## 🛡️ Rutas protegidas

### `/panel` (admin, gestor, instalador)
```tsx
<ProtectedRoute allowedRoles={['admin', 'gestor', 'instalador']}>
  <PanelLayout />
</ProtectedRoute>
```

### `/mi-cuenta` (solo clientes)
```tsx
<ProtectedRoute allowedRoles={['cliente']}>
  <MyAccountPage />
</ProtectedRoute>
```

### Comportamiento de ProtectedRoute:
1. Si no está autenticado → redirige a `/login`
2. Si está autenticado pero no tiene el rol permitido:
   - Cliente sin acceso a `/panel` → redirige a `/mi-cuenta`
   - No-cliente sin acceso a `/mi-cuenta` → redirige a `/panel`
3. Si tiene el rol permitido → muestra el contenido

---

## 🧪 Probar la autenticación

### 1. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### 2. Ejecutar el script SQL
Pega `supabase/schema.sql` en el SQL Editor de Supabase

### 3. Registrarse
- Ve a `/registro`
- Crea una cuenta con tu email
- Confirma el email (si está activado)

### 4. Convertirte en admin
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu@email.com';
```

### 5. Hacer login
- Ve a `/login`
- Introduce tus credenciales
- Deberías ser redirigido a `/panel`

### 6. Probar otros roles
```sql
-- Convertir en gestor
UPDATE profiles SET role = 'gestor' WHERE email = 'tu@email.com';

-- Convertir en instalador
UPDATE profiles SET role = 'instalador' WHERE email = 'tu@email.com';

-- Volver a cliente
UPDATE profiles SET role = 'cliente' WHERE email = 'tu@email.com';
```

---

## 🔒 Seguridad

### Lo que está implementado:
- ✅ Contraseñas hasheadas con bcrypt (Supabase Auth)
- ✅ Tokens JWT en cada petición a Supabase
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Función `get_my_role()` con `SECURITY DEFINER` para políticas RLS
- ✅ Validación de formularios con Zod
- ✅ Redirecciones seguras según rol

### Buenas prácticas:
- ✅ No guardar contraseñas en el frontend
- ✅ Usar variables de entorno para claves
- ✅ Validar tanto en frontend como en backend (RLS)
- ✅ Confirmación de email para nuevos registros
- ✅ Recuperación de contraseña con tokens de un solo uso

---

## 📝 Próximos pasos

- Conectar el catálogo a Supabase (productos reales)
- Implementar el carrito con persistencia en BD
- Implementar el checkout con Stripe
- Implementar la gestión de pedidos en el panel
- Implementar la agenda de instalaciones
- Subir imágenes a Supabase Storage
