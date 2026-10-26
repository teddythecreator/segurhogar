import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TiendaLayout } from '@/components/tienda/TiendaLayout';
import { PanelLayout } from '@/components/panel/PanelLayout';
import { HomePage } from '@/pages/tienda/HomePage';
import { CatalogPage } from '@/pages/tienda/CatalogPage';
import { ProductPage } from '@/pages/tienda/ProductPage';
import { CartPage } from '@/pages/tienda/CartPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/panel/DashboardPage';
import { PlaceholderPage } from '@/pages/panel/PlaceholderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

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
        </Route>

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Panel protegido (la protección se añadirá en pasos posteriores) */}
        <Route path="/panel" element={<PanelLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="pedidos" element={<PlaceholderPage title="Pedidos" description="Gestión de pedidos de clientes" />} />
          <Route path="installaciones" element={<PlaceholderPage title="Instalaciones" description="Calendario de instalaciones a domicilio" />} />
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
