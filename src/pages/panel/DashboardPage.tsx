import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/auth-store';
import { Package, Calendar, Users, TrendingUp } from 'lucide-react';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const stats = [
    { label: 'Pedidos hoy', value: '—', icon: Package, color: 'text-[#2D7FF9]' },
    { label: 'Instalaciones pendientes', value: '—', icon: Calendar, color: 'text-yellow-600' },
    { label: 'Usuarios activos', value: '—', icon: Users, color: 'text-[#22C55E]' },
    { label: 'Ingresos del mes', value: '—', icon: TrendingUp, color: 'text-purple-600' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">
          Buenos días, {user?.nombre || 'Usuario'} 👋
        </h1>
        <p className="text-gray-500 text-sm">Resumen de actividad</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-[#0B1F3A]">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">
              🔧 <strong>Paso 1:</strong> El dashboard se conectará a Supabase en los siguientes pasos para mostrar datos reales.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
