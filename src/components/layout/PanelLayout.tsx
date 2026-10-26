import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Calendar, Users, MessageSquare, LogOut, Shield, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

export function PanelLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { href: '/panel', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'gestor_pedidos', 'instalador'] },
    { href: '/panel/pedidos', icon: Package, label: 'Pedidos', roles: ['admin', 'gestor_pedidos'] },
    { href: '/panel/installaciones', icon: Calendar, label: 'Instalaciones', roles: ['admin', 'instalador'] },
    { href: '/panel/productos', icon: Package, label: 'Productos', roles: ['admin'] },
    { href: '/panel/usuarios', icon: Users, label: 'Usuarios', roles: ['admin'] },
    { href: '/panel/asistentes', icon: MessageSquare, label: 'Asistentes IA', roles: ['admin'] },
  ];

  const visibleItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#0B1F3A] text-white">
        <div className="p-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#2D7FF9]" />
            <span className="font-bold">SegurHogar</span>
          </Link>
          <p className="text-xs text-gray-400 mt-1">Panel de gestión</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.href
                  ? 'bg-[#2D7FF9] text-white'
                  : 'text-gray-300 hover:bg-white/10'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-[#2D7FF9] flex items-center justify-center text-sm font-bold">
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.nombre || 'Usuario'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0B1F3A] text-white p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold">Panel</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === item.href
                      ? 'bg-[#2D7FF9] text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-[#0B1F3A]">Panel de gestión</span>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
