import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, AlertTriangle, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useOrders, OrdersFilters } from '@/hooks/useOrders';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/types/database';
import type { OrderStatus } from '@/types/database';

export function OrdersPage() {
  const [filters, setFilters] = useState<OrdersFilters>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useOrders(filters);

  const handleFilterChange = (key: keyof OrdersFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Resetear página al cambiar filtros
    }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
  };

  const hasActiveFilters =
    filters.estado || filters.search || filters.fecha_desde || filters.fecha_hasta;

  // Calcular si un pedido está retrasado (más de 10 días sin entregar)
  const isDelayed = (order: any) => {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return (
      daysSinceCreation > 10 &&
      !['entregado', 'devuelto', 'cancelado'].includes(order.estado)
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Pedidos</h1>
        <p className="text-gray-500 text-sm">Gestión de pedidos de clientes</p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#2D7FF9]" />
            <h2 className="font-semibold text-[#0B1F3A]">Filtros</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nº pedido o cliente..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.estado || ''}
                onChange={(e) => handleFilterChange('estado', e.target.value || undefined)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
              >
                <option value="">Todos los estados</option>
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <Input
                type="date"
                value={filters.fecha_desde || ''}
                onChange={(e) => handleFilterChange('fecha_desde', e.target.value || undefined)}
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <Input
                type="date"
                value={filters.fecha_hasta || ''}
                onChange={(e) => handleFilterChange('fecha_hasta', e.target.value || undefined)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de pedidos */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D7FF9] mx-auto"></div>
            </div>
          ) : !data || data.orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No hay pedidos</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Pedido</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">
                        Fecha
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.orders.map((order) => {
                      const delayed = isDelayed(order);
                      return (
                        <tr
                          key={order.id}
                          className={`hover:bg-gray-50 ${delayed ? 'bg-red-50' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#0B1F3A]">{order.numero}</span>
                              {delayed && (
                                <span title="Pedido retrasado">
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {order.envio_nombre || order.user?.nombre || 'Cliente'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                order.estado === 'pagado' || order.estado === 'entregado'
                                  ? 'success'
                                  : order.estado === 'incidencia' || order.estado === 'cancelado'
                                  ? 'danger'
                                  : order.estado === 'en_transito' || order.estado === 'enviado_proveedor'
                                  ? 'warning'
                                  : 'default'
                              }
                            >
                              {ORDER_STATUS_LABELS[order.estado]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatPrice(order.total)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link to={`/panel/pedidos/${order.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Mostrando {(data.page - 1) * data.limit + 1}-
                    {Math.min(data.page * data.limit, data.total)} de {data.total} pedidos
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', data.page - 1)}
                      disabled={data.page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', data.page + 1)}
                      disabled={data.page === data.totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
