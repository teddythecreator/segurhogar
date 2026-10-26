import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  Users, 
  ShoppingBag, 
  FileText, 
  Link2, 
  BarChart3, 
  Settings,
  UserCog,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    href: '/panel',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'gestor'],
  },
  {
    href: '/panel/pedidos',
    label: 'Pedidos',
    icon: Package,
    roles: ['admin', 'gestor'],
  },
  {
    href: '/panel/instalaciones',
    label: 'Instalaciones',
    icon: Calendar,
    roles: ['admin', 'gestor'],
  },
  {
    href: '/panel/productos',
    label: 'Productos',
    icon: ShoppingBag,
    roles: ['admin'],
  },
  {
    href: '/panel/categorias',
    label: 'Categorías',
    icon: ShoppingBag,
    roles: ['admin'],
  },
  {
    href: '/panel/aliexpress',
    label: 'AliExpress',
    icon: ShoppingBag,
    roles: ['admin'],
  },
  {
    href: '/panel/aliexpress/importar',
    label: 'Importar AE',
    icon: ShoppingBag,
    roles: ['admin'],
  },
  {
    href: '/panel/clientes',
    label: 'Clientes',
    icon: Users,
    roles: ['admin', 'gestor'],
  },
  {
    href: '/panel/presupuestos',
    label: 'Presupuestos',
    icon: FileText,
    roles: ['admin', 'gestor'],
  },
  {
    href: '/panel/afiliacion',
    label: 'Afiliación',
    icon: Link2,
    roles: ['admin'],
  },
  {
    href: '/panel/informes',
    label: 'Informes',
    icon: BarChart3,
    roles: ['admin'],
  },
  {
    href: '/panel/usuarios',
    label: 'Usuarios',
    icon: UserCog,
    roles: ['admin'],
  },
  {
    href: '/panel/asistente-ia',
    label: 'Asistente IA',
    icon: MessageSquare,
    roles: ['admin', 'gestor'],
  },
  {
    href: '/panel/ajustes',
    label: 'Ajustes',
    icon: Settings,
    roles: ['admin'],
  },
  {
    href: '/panel/mi-agenda',
    label: 'Mi agenda',
    icon: Calendar,
    roles: ['instalador'],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  // Filtrar items según el rol del usuario
  const visibleItems = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <nav className="space-y-1">
      {visibleItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#2D7FF9] text-white'
                : 'text-gray-300 hover:bg-white/10'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
