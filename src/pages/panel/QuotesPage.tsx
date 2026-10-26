import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuotes } from '@/hooks/useQuotes';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { QuoteStatus } from '@/types/database';

export function QuotesPage() {
  const [filters, setFilters] = useState({
    estado: '' as QuoteStatus | '',
  });

  const { data, isLoading } = useQuotes({
    estado: filters.estado || undefined,
  });

  const getStatusBadge = (estado: QuoteStatus) => {
    const config = {
      borrador: { label: 'Borrador', variant: 'default' as const },
      enviado: { label: 'Enviado', variant: 'info' as const },
      aceptado: { label: 'Aceptado', variant: 'success' as const },
      rechazado: { label: 'Rechazado', variant: 'danger' as const },
    };
    return config[estado] || config.borrador;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Presupuestos</h1>
        <Link to="/panel/presupuestos/nuevo">
          <Button>Nuevo presupuesto</Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filters.estado}
            onChange={(e) => setFilters({ estado: e.target.value as QuoteStatus | '' })}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="borrador">Borrador</option>
            <option value="enviado">Enviado</option>
            <option value="aceptado">Aceptado</option>
            <option value="rechazado">Rechazado</option>
          </select>
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
                    Número
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.quotes.map((quote) => {
                  const badge = getStatusBadge(quote.estado);
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {quote.numero}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {quote.customer?.nombre || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(quote.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {quote.total.toFixed(2)} €
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/panel/presupuestos/${quote.id}`}>
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
            {data?.quotes.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No se encontraron presupuestos
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
