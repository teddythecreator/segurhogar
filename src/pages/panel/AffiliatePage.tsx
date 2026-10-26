import { useState } from 'react';
import { useAffiliateStats, useAffiliateCommissions, useCreateAffiliateCommission } from '@/hooks/useAffiliate';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AffiliatePage() {
  const { data: stats, isLoading: loadingStats } = useAffiliateStats();
  const { data: commissions, isLoading: loadingCommissions } = useAffiliateCommissions();
  const createCommission = useCreateAffiliateCommission();

  const [newCommission, setNewCommission] = useState({
    tienda: '',
    fecha: new Date().toISOString().split('T')[0],
    importe: '',
    notas: '',
  });

  const handleCreateCommission = async () => {
    if (!newCommission.tienda || !newCommission.importe) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    try {
      await createCommission.mutateAsync({
        tienda: newCommission.tienda,
        fecha: newCommission.fecha,
        importe: parseFloat(newCommission.importe),
        notas: newCommission.notas || undefined,
      });
      setNewCommission({ tienda: '', fecha: new Date().toISOString().split('T')[0], importe: '', notas: '' });
      alert('Comisión registrada correctamente');
    } catch (error) {
      alert('Error al registrar comisión');
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Programa de Afiliados</h1>

      {/* Estadísticas de clics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total de clics</h3>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? '...' : stats?.totalClicks || 0}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Productos únicos</h3>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? '...' : stats?.byProduct?.length || 0}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Tiendas</h3>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? '...' : stats?.byStore?.length || 0}
          </p>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clics por tienda</h2>
          {loadingStats ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie
                  data={stats?.byStore || []}
                  dataKey="clicks"
                  nameKey="tienda"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.tienda}
                >
                  {(stats?.byStore || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top productos</h2>
          {loadingStats ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={(stats?.byProduct || []).slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product_name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Registro de comisiones */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Registrar comisión</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input
            label="Tienda"
            value={newCommission.tienda}
            onChange={(e) => setNewCommission({ ...newCommission, tienda: e.target.value })}
            placeholder="Ej: Amazon"
          />
          <Input
            label="Fecha"
            type="date"
            value={newCommission.fecha}
            onChange={(e) => setNewCommission({ ...newCommission, fecha: e.target.value })}
          />
          <Input
            label="Importe (€)"
            type="number"
            value={newCommission.importe}
            onChange={(e) => setNewCommission({ ...newCommission, importe: e.target.value })}
            placeholder="0.00"
          />
          <Input
            label="Notas"
            value={newCommission.notas}
            onChange={(e) => setNewCommission({ ...newCommission, notas: e.target.value })}
            placeholder="Opcional"
          />
        </div>
        <Button onClick={handleCreateCommission} isLoading={createCommission.isPending}>
          Registrar comisión
        </Button>
      </Card>

      {/* Historial de comisiones */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de comisiones</h2>
        {loadingCommissions ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tienda</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Importe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commissions?.map((comm: any) => (
                  <tr key={comm.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(comm.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{comm.tienda}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{comm.importe.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{comm.notas || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {commissions?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No hay comisiones registradas
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
