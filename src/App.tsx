import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TiendaLayout } from '@/components/tienda/TiendaLayout';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { HomePage } from '@/pages/tienda/HomePage';
import { CatalogPage } from '@/pages/tienda/CatalogPage';
import { ProductPage } from '@/pages/tienda/ProductPage';
import { CartPage } from '@/pages/tienda/CartPage';
import { CheckoutPage } from '@/pages/tienda/CheckoutPage';
import { PaymentSuccessPage } from '@/pages/tienda/PaymentSuccessPage';
import { PaymentCancelledPage } from '@/pages/tienda/PaymentCancelledPage';
import { PacksPage } from '@/pages/tienda/PacksPage';
import { ZoneCheckerPage } from '@/pages/tienda/ZoneCheckerPage';
import { MyAccountPage } from '@/pages/tienda/MyAccountPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { RecoverPasswordPage } from '@/pages/auth/RecoverPasswordPage';
import { NewPasswordPage } from '@/pages/auth/NewPasswordPage';
import { DashboardPage } from '@/pages/panel/DashboardPage';
import { MyAgendaPage } from '@/pages/panel/MyAgendaPage';
import { OrdersPage } from '@/pages/panel/OrdersPage';
import { InstallationsPage } from '@/pages/panel/InstallationsPage';
import { ProductsPage } from '@/pages/panel/ProductsPage';
import { ProductNewPage } from '@/pages/panel/ProductNewPage';
import { ProductEditPage } from '@/pages/panel/ProductEditPage';
import { CategoriesPage } from '@/pages/panel/CategoriesPage';
import { CustomersPage } from '@/pages/panel/CustomersPage';
import { QuotesPage } from '@/pages/panel/QuotesPage';
import { AffiliatePage } from '@/pages/panel/AffiliatePage';
import { ReportsPage } from '@/pages/panel/ReportsPage';
import { UsersPage } from '@/pages/panel/UsersPage';
import { SettingsPage } from '@/pages/panel/SettingsPage';
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
          <Route path="/packs" element={<PacksPage />} />
          <Route path="/comprobar-zona" element={<ZoneCheckerPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pago-exitoso" element={<PaymentSuccessPage />} />
          <Route path="/pago-cancelado" element={<PaymentCancelledPage />} />

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

        {/* Panel protegido */}
        <Route
          path="/panel"
          element={
            <ProtectedRoute allowedRoles={['admin', 'gestor', 'instalador']}>
              <PanelLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard (admin y gestor) */}
          <Route 
            index 
            element={
              <ProtectedRoute allowedRoles={['admin', 'gestor']}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Mi agenda (instalador) */}
          <Route 
            path="mi-agenda" 
            element={
              <ProtectedRoute allowedRoles={['instalador']}>
                <MyAgendaPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Pedidos (admin y gestor) */}
          <Route 
            path="pedidos" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'gestor']}>
                <OrdersPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Instalaciones (admin y gestor) */}
          <Route 
            path="instalaciones" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'gestor']}>
                <InstallationsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Productos (solo admin) */}
          <Route 
            path="productos" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProductsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="productos/nuevo" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProductNewPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="productos/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProductEditPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Categorías (solo admin) */}
          <Route 
            path="categorias" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CategoriesPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Clientes (admin y gestor) */}
          <Route 
            path="clientes" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'gestor']}>
                <CustomersPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Presupuestos (admin y gestor) */}
          <Route 
            path="presupuestos" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'gestor']}>
                <QuotesPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Afiliación (solo admin) */}
          <Route 
            path="afiliacion" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AffiliatePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Informes (solo admin) */}
          <Route 
            path="informes" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Usuarios (solo admin) */}
          <Route 
            path="usuarios" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Ajustes (solo admin) */}
          <Route 
            path="ajustes" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
