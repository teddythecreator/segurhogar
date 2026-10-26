import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, List, Filter, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { InstallationCalendar } from '@/components/panel/installations/InstallationCalendar';
import { useInstallations, useInstallers } from '@/hooks/useInstallations';
import { INSTALLATION_STATUS_LABELS } from '@/types/database';
import type { InstallationStatus } from '@/types/database';

export function InstallationsPage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filters, setFilters] = useState<{
    estado?: InstallationStatus;
    instalador_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }>({});

  const { data, isLoading } = useInstallations({ ...filters, limit: 100 });
  const { data: installers } = useInstallers();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">Instalaciones</h1>
          <p className="text-gray-500 text-sm">Gestión de instalaciones a domicilio</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-[#2D7FF9] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              Calendario
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors border-l ${
                viewMode === 'list'
                  ? 'bg-[#2D7FF9] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4" />
              Lista
            </button>
          </div>
          <Link to="/panel/instalaciones/nueva">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva instalación
            </Button>
          </Link>
        </div>
      </div>

      {/* Vista de calendario */}
      {viewMode === 'calendar' && <InstallationCalendar />}

      {/* Vista de lista */}
      {viewMode === 'list' && (
        <>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filters.estado || ''}
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                  >
                    <option value="">Todos los estados</option>
                    {Object.entries(INSTALLATION_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instalador
                  </label>
                  <select
                    value={filters.instalador_id || ''}
                    onChange={(e) => handleFilterChange('instalador_id', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                  >
                    <option value="">Todos los instaladores</option>
                    {installers?.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha desde
                  </label>
                  <Input
                    type="date"
                    value={filters.fecha_desde || ''}
                    onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha hasta
                  </label>
                  <Input
                    type="date"
                    value={filters.fecha_hasta || ''}
                    onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
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

          {/* Lista de instalaciones */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D7FF9] mx-auto"></div>
                </div>
              ) : !data || data.installations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No hay instalaciones</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Dirección</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Instalador</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.installations.map((installation) => (
                        <tr key={installation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-[#0B1F3A]">
                                {new Date(installation.fecha).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                              {installation.hora_inicio && (
                                <p className="text-xs text-gray-500">
                                  {installation.hora_inicio}
                                  {installation.hora_fin && ` - ${installation.hora_fin}`}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {installation.customer?.nombre || 'Cliente'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <p className="truncate max-w-xs">
                              {installation.direccion_calle}
                            </p>
                            <p className="text-xs text-gray-500">
                              {installation.direccion_ciudad}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {installation.instalador?.nombre || 'Sin asignar'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                installation.estado === 'realizada' || installation.estado === 'cerrada'
                                  ? 'success'
                                  : installation.estado === 'cancelada'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {INSTALLATION_STATUS_LABELS[installation.estado]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link to={`/panel/instalaciones/${installation.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
