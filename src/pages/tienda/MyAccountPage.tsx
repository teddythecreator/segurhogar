import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Calendar, LogOut, Settings, ShoppingBag, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS, INSTALLATION_STATUS_LABELS } from '@/types/database';
import type { Order, Installation, OrderStatus, InstallationStatus } from '@/types/database';

export function MyAccountPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'pedidos' | 'instalaciones' | 'perfil'>('pedidos');

  // Obtener pedidos del usuario
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user?.id,
  });

  // Obtener instalaciones del usuario
  const { data: installations, isLoading: loadingInstallations } = useQuery({
    queryKey: ['my-installations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Obtener IDs de pedidos del usuario
      const { data: orderIdsData } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id);

      if (!orderIdsData || orderIdsData.length === 0) return [];

      const ids = orderIdsData.map((o: { id: string }) => o.id);
      
      const { data, error } = await supabase
        .from('installations')
        .select('*')
        .in('order_id', ids)
        .order('fecha', { ascending: true });

      if (error) throw error;
      return data as Installation[];
    },
    enabled: !!user?.id,
  });

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  const getStatusBadgeVariant = (status: OrderStatus | InstallationStatus) => {
    const successStates = ['pagado', 'entregado', 'completado', 'realizada', 'cerrada'];
    const warningStates = ['pendiente_pago', 'en_transito', 'enviado_proveedor', 'confirmada', 'asignada'];
    const dangerStates = ['incidencia', 'devuelto', 'cancelado'];

    if (successStates.includes(status)) return 'success';
    if (warningStates.includes(status)) return 'warning';
    if (dangerStates.includes(status)) return 'danger';
    return 'default';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Mi cuenta</h1>
        <p className="text-gray-500 text-sm">Gestiona tus pedidos e información personal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="h-12 w-12 rounded-full bg-[#2D7FF9] flex items-center justify-center text-white font-bold text-lg">
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-[#0B1F3A]">{user.nombre}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('pedidos')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'pedidos'
                      ? 'bg-[#2D7FF9] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  Mis pedidos
                  {orders && orders.length > 0 && (
                    <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {orders.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('instalaciones')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'instalaciones'
                      ? 'bg-[#2D7FF9] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Mis instalaciones
                  {installations && installations.length > 0 && (
                    <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {installations.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('perfil')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'perfil'
                      ? 'bg-[#2D7FF9] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Mi perfil
                </button>
              </nav>

              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-3">
          {activeTab === 'pedidos' && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-[#0B1F3A]">Mis pedidos</h2>
              </CardHeader>
              <CardContent className="p-0">
                {loadingOrders ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D7FF9] mx-auto"></div>
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="p-8 text-center">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Aún no tienes pedidos</p>
                    <Link to="/catalogo">
                      <Button>Ir al catálogo</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y">
                    {orders?.map((order: Order) => (
                      <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-[#0B1F3A]">{order.numero}</p>
                              <Badge variant={getStatusBadgeVariant(order.estado)}>
                                {ORDER_STATUS_LABELS[order.estado]}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#0B1F3A]">{formatPrice(order.total)}</p>
                            <p className="text-xs text-gray-500">IVA incluido</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'instalaciones' && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-[#0B1F3A]">Mis instalaciones</h2>
              </CardHeader>
              <CardContent className="p-0">
                {loadingInstallations ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D7FF9] mx-auto"></div>
                  </div>
                ) : !installations || installations.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No tienes instalaciones programadas</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {installations?.map((installation: Installation) => (
                      <div key={installation.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4 text-[#2D7FF9]" />
                              <p className="font-medium text-[#0B1F3A]">
                                {new Date(installation.fecha).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                              <Badge variant={getStatusBadgeVariant(installation.estado)}>
                                {INSTALLATION_STATUS_LABELS[installation.estado]}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {installation.direccion_calle}, {installation.direccion_ciudad}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'perfil' && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-[#0B1F3A]">Mi perfil</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <p className="text-[#0B1F3A]">{user.nombre}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-[#0B1F3A]">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <p className="text-[#0B1F3A]">{user.telefono || 'No especificado'}</p>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline">Editar perfil</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
