import { useState } from 'react';
import { useSalesReport, useTopProductsReport, useInstallationsByInstallerReport } from '@/hooks/useReports';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

export function ReportsPage() {
  const [filters, setFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
  });

  const { data: salesData, isLoading: loadingSales } = useSalesReport(filters);
  const { data: topProducts, isLoading: loadingProducts } = useTopProductsReport(filters);
  const { data: installationsByInstaller, isLoading: loadingInstallations } = useInstallationsByInstallerReport(filters);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const exportToCSV = () => {
    if (!salesData?.orders) return;

    const csv = [
      ['Número', 'Fecha', 'Cliente', 'Total', 'Estado'],
      ...salesData.orders.map((order: any) => [
        order.numero,
        new Date(order.pagado_en).toLocaleDateString('es-ES'),
        order.customer?.nombre || '-',
        order.total.toFixed(2),
        order.estado,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-ventas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Informes</h1>
        <Button onClick={exportToCSV} variant="outline">
          Exportar a CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha desde"
            type="date"
            value={filters.fecha_desde}
            onChange={(e) => setFilters({ ...filters, fecha_desde: e.target.value })}
          />
          <Input
            label="Fecha hasta"
            type="date"
            value={filters.fecha_hasta}
            onChange={(e) => setFilters({ ...filters, fecha_hasta: e.target.value })}
          />
        </div>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ingresos totales</h3>
          <p className="text-3xl font-bold text-gray-900">
            {loadingSales ? '...' : `${(salesData?.totalIngresos || 0).toFixed(2)} €`}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pedidos pagados</h3>
          <p className="text-3xl font-bold text-gray-900">
            {loadingSales ? '...' : salesData?.totalPedidos || 0}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ticket medio</h3>
          <p className="text-3xl font-bold text-gray-900">
            {loadingSales
              ? '...'
              : `${((salesData?.totalIngresos || 0) / (salesData?.totalPedidos || 1)).toFixed(2)} €`}
          </p>
        </Card>
      </div>

      {/* Ingresos por tipo */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ingresos por tipo de producto</h2>
        {loadingSales ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesData?.byType || []}
                dataKey="ingresos"
                nameKey="tipo"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.tipo}: ${entry.ingresos.toFixed(0)}€`}
              >
                {(salesData?.byType || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Top productos */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos más vendidos</h2>
        {loadingProducts ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(topProducts || []).slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" fill="#3B82F6" name="Cantidad vendida" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Instalaciones por instalador */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Instalaciones por instalador</h2>
        {loadingInstallations ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={installationsByInstaller || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#10B981" name="Instalaciones realizadas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
