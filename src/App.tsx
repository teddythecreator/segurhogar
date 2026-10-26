import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TiendaLayout } from '@/components/tienda/TiendaLayout';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { HomePage } from '@/pages/tienda/HomePage';
import { CatalogPage } from '@/pages/tienda/CatalogPage';
import { ProductPage } from '@/pages/tienda/ProductPage';
import { CartPage } from '@/pages/tienda/CartPage';
import { MyAccountPage } from '@/pages/tienda/MyAccountPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { RecoverPasswordPage } from '@/pages/auth/RecoverPasswordPage';
import { NewPasswordPage } from '@/pages/auth/NewPasswordPage';
import { DashboardPage } from '@/pages/panel/DashboardPage';
import { MyAgendaPage } from '@/pages/panel/MyAgendaPage';
import { PlaceholderPage } from '@/pages/panel/PlaceholderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

// Componente para redirigir según el rol después del login
function AuthRedirect() {
  const { isAuthenticated, isLoading, role } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // La redirección se maneja en el componente que usa este hook
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7FF9]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol
  if (role === 'cliente') {
    return <Navigate to="/mi-cuenta" replace />;
  } else if (role === 'instalador') {
    return <Navigate to="/panel/mi-agenda" replace />;
  } else {
    // admin o gestor
    return <Navigate to="/panel" replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas de la tienda */}
        <Route element={<TiendaLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/producto/:slug" element={<ProductPage />} />
          <Route path="/carrito" element={<CartPage />} />

          {/* Mi cuenta (solo clientes) */}
          <Route
            path="/mi-cuenta"
            element={
              <ProtectedRoute allowedRoles={['cliente']}>
                <MyAccountPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Rutas de autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar-contrasena" element={<RecoverPasswordPage />} />
        <Route path="/nueva-contrasena" element={<NewPasswordPage />} />

        {/* Redirección después del login según rol */}
        <Route path="/auth/redirect" element={<AuthRedirect />} />

        {/* Panel protegido (admin, gestor, instalador) */}
        <Route
          path="/panel"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gestor', 'instalador']}>
              <PanelLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="mi-agenda" element={<MyAgendaPage />} />
          <Route path="pedidos" element={<PlaceholderPage title="Pedidos" description="Gestión de pedidos de clientes" />} />
          <Route path="instalaciones" element={<PlaceholderPage title="Instalaciones" description="Calendario de instalaciones a domicilio" />} />
          <Route path="productos" element={<PlaceholderPage title="Productos" description="Gestión del catálogo de productos" />} />
          <Route path="usuarios" element={<PlaceholderPage title="Usuarios" description="Gestión de usuarios y roles" />} />
          <Route path="asistentes" element={<PlaceholderPage title="Asistentes IA" description="Configuración de asistentes de IA" />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
