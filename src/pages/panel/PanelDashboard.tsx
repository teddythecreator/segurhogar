import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/auth-store';
import { Package, Calendar, Users, TrendingUp } from 'lucide-react';

export function PanelDashboard() {
  const user = useAuthStore((s) => s.user);

  // Datos de ejemplo (en producción vendrían de Supabase)
  const stats = [
    { label: 'Pedidos hoy', value: '12', icon: Package, change: '+3 vs ayer', color: 'text-[#2D7FF9]' },
    { label: 'Instalaciones pendientes', value: '5', icon: Calendar, change: '2 para hoy', color: 'text-yellow-600' },
    { label: 'Usuarios activos', value: '234', icon: Users, change: '+12 esta semana', color: 'text-[#22C55E]' },
    { label: 'Ingresos del mes', value: '4.820€', icon: TrendingUp, change: '+18% vs mes anterior', color: 'text-purple-600' },
  ];

  const recentOrders = [
    { id: 'PED-001', cliente: 'María García', estado: 'pagado', total: '89.99€', fecha: 'Hoy 10:30' },
    { id: 'PED-002', cliente: 'Juan López', estado: 'en_preparacion', total: '259.99€', fecha: 'Hoy 09:15' },
    { id: 'PED-003', cliente: 'Ana Martínez', estado: 'instalacion_programada', total: '120.00€', fecha: 'Ayer 16:45' },
    { id: 'PED-004', cliente: 'Pedro Sánchez', estado: 'pendiente_pago', total: '34.99€', fecha: 'Ayer 14:20' },
    { id: 'PED-005', cliente: 'Laura Fernández', estado: 'completado', total: '219.99€', fecha: '22/01/2024' },
  ];

  const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
    pendiente_pago: { label: 'Pendiente de pago', variant: 'warning' },
    pagado: { label: 'Pagado', variant: 'info' },
    en_preparacion: { label: 'En preparación', variant: 'default' },
    enviado: { label: 'Enviado', variant: 'info' },
    instalacion_programada: { label: 'Instalación programada', variant: 'warning' },
    instalacion_completada: { label: 'Instalación completada', variant: 'success' },
    completado: { label: 'Completado', variant: 'success' },
    cancelado: { label: 'Cancelado', variant: 'danger' },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">
          Buenos días, {user?.nombre || 'Usuario'} 👋
        </h1>
        <p className="text-gray-500 text-sm">Resumen de actividad de hoy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-xs text-gray-500">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-[#0B1F3A]">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pedidos recientes */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[#0B1F3A]">Pedidos recientes</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Pedido</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#0B1F3A]">{order.id}</td>
                    <td className="px-4 py-3 text-gray-600">{order.cliente}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={statusLabels[order.estado]?.variant || 'default'}>
                        {statusLabels[order.estado]?.label || order.estado}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{order.total}</td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">{order.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
