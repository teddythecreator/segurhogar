import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { formatPrice } from '@/lib/utils';
import { Package, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7FF9]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error al cargar datos del dashboard</p>
          <p className="text-sm text-gray-500 mt-2">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!dashboard) return null;

  // Formatear datos para el gráfico
  const chartData = dashboard.ventas30Dias.map((item) => ({
    fecha: new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    ventas: item.ventas,
    pedidos: item.pedidos,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">
          Buenos días, {user?.nombre || 'Usuario'} 👋
        </h1>
        <p className="text-gray-500 text-sm">Resumen de actividad</p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-[#22C55E]" />
              <span className="text-xs text-gray-500">Hoy</span>
            </div>
            <p className="text-2xl font-bold text-[#0B1F3A]">{formatPrice(dashboard.ventasHoy)}</p>
            <p className="text-sm text-gray-500">{dashboard.pedidosHoy} pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-[#2D7FF9]" />
              <span className="text-xs text-gray-500">Este mes</span>
            </div>
            <p className="text-2xl font-bold text-[#0B1F3A]">{formatPrice(dashboard.ventasMes)}</p>
            <p className="text-sm text-gray-500">{dashboard.pedidosMes} pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-5 w-5 text-yellow-600" />
              <span className="text-xs text-gray-500">Pendientes</span>
            </div>
            <p className="text-2xl font-bold text-[#0B1F3A]">{dashboard.pedidosPendientes}</p>
            <p className="text-sm text-gray-500">pedidos en proceso</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="text-xs text-gray-500">Instalaciones</span>
            </div>
            <p className="text-2xl font-bold text-[#0B1F3A]">{dashboard.instalacionesPendientes}</p>
            <p className="text-sm text-gray-500">pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de ventas */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-[#0B1F3A]">Ventas últimos 30 días</h2>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D7FF9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2D7FF9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="fecha" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), 'Ventas']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#2D7FF9" 
                  fillOpacity={1} 
                  fill="url(#colorVentas)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {dashboard.alertas.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[#0B1F3A] flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Alertas ({dashboard.alertas.length})
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {dashboard.alertas.map((alerta) => (
                <div key={alerta.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {alerta.tipo === 'pedido_retrasado' ? (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0B1F3A] text-sm">{alerta.titulo}</p>
                      <p className="text-sm text-gray-600 mt-1">{alerta.descripcion}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alerta.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {dashboard.alertas.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-[#22C55E] mx-auto mb-3" />
            <p className="text-gray-600">No hay alertas pendientes</p>
            <p className="text-sm text-gray-400 mt-1">Todo está en orden</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
