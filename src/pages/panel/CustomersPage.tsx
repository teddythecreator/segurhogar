import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers } from '@/hooks/useCustomers';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { CustomerType } from '@/types/database';

export function CustomersPage() {
  const [filters, setFilters] = useState({
    search: '',
    tipo: '' as CustomerType | '',
  });

  const { data, isLoading } = useCustomers({
    search: filters.search || undefined,
    tipo: filters.tipo || undefined,
  });

  const getTipoBadge = (tipo: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'info' | 'success' }> = {
      particular: { label: 'Particular', variant: 'default' },
      empresa: { label: 'Empresa', variant: 'info' },
      administrador: { label: 'Admin', variant: 'success' },
    };
    return config[tipo] || config.particular;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Link to="/panel/clientes/nuevo">
          <Button>Nuevo cliente</Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="Buscar"
            placeholder="Nombre, email o teléfono..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value as CustomerType | '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="particular">Particular</option>
              <option value="empresa">Empresa</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Teléfono
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ciudad
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.customers.map((customer) => {
                  const badge = getTipoBadge(customer.tipo);
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {customer.nombre}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {customer.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {customer.telefono || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {customer.direccion_ciudad || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/panel/clientes/${customer.id}`}>
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {data?.customers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No se encontraron clientes
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
