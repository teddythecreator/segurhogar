import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PanelLayout } from '@/components/layout/PanelLayout';
import { HomePage } from '@/pages/HomePage';
import { TiendaPage } from '@/pages/TiendaPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderConfirmedPage } from '@/pages/OrderConfirmedPage';
import { AsistenteIAPage } from '@/pages/AsistenteIAPage';
import { LoginPage } from '@/pages/LoginPage';
import { PanelDashboard } from '@/pages/panel/PanelDashboard';
import { useAuthStore } from '@/stores/auth-store';

// Componente para rutas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Página de packs (redirige a tienda con filtro)
function PacksPage() {
  return <Navigate to="/tienda?cat=packs" replace />;
}

// Página de instalación (redirige a tienda con filtro)
function InstalacionPage() {
  return <Navigate to="/tienda?cat=alarmas" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tienda" element={<TiendaPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pedido-confirmado" element={<OrderConfirmedPage />} />
          <Route path="/asistente-ia" element={<AsistenteIAPage />} />
          <Route path="/packs" element={<PacksPage />} />
          <Route path="/instalacion" element={<InstalacionPage />} />
        </Route>

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Panel protegido */}
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <PanelLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PanelDashboard />} />
          <Route path="pedidos" element={<PanelDashboard />} />
          <Route path="installaciones" element={<PanelDashboard />} />
          <Route path="productos" element={<PanelDashboard />} />
          <Route path="usuarios" element={<PanelDashboard />} />
          <Route path="asistentes" element={<PanelDashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
