import { Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { INSTALLATION_STATUS_LABELS } from '@/types/database';
import type { InstallationStatus } from '@/types/database';

export function MyAgendaPage() {
  const { user } = useAuth();

  // Datos de ejemplo (en producción vendrán de Supabase)
  const mockInstallations = [
    {
      id: '1',
      fecha: '2024-01-25',
      hora_inicio: '10:00',
      hora_fin: '12:00',
      estado: 'asignada' as InstallationStatus,
      cliente_nombre: 'María García',
      direccion: 'Calle Mayor 15, 3ºA',
      ciudad: 'Madrid',
      notas: 'Instalación de alarma básica',
    },
    {
      id: '2',
      fecha: '2024-01-26',
      hora_inicio: '16:00',
      hora_fin: '17:30',
      estado: 'confirmada' as InstallationStatus,
      cliente_nombre: 'Juan López',
      direccion: 'Av. de la Constitución 42',
      ciudad: 'Madrid',
      notas: 'Cerradura inteligente + configuración',
    },
    {
      id: '3',
      fecha: '2024-01-22',
      hora_inicio: '09:00',
      hora_fin: '10:30',
      estado: 'realizada' as InstallationStatus,
      cliente_nombre: 'Ana Martínez',
      direccion: 'Calle Serrano 88, 2ºB',
      ciudad: 'Madrid',
      notas: 'Cámara WiFi interior',
    },
  ];

  const statusColors: Record<InstallationStatus, 'default' | 'success' | 'warning' | 'info'> = {
    solicitada: 'default',
    confirmada: 'info',
    asignada: 'warning',
    realizada: 'success',
    cerrada: 'success',
    cancelada: 'default',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Mi agenda</h1>
        <p className="text-gray-500 text-sm">
          Bienvenido, {user?.nombre}. Estas son tus instalaciones asignadas.
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-[#2D7FF9] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#0B1F3A]">2</p>
            <p className="text-sm text-gray-500">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-[#22C55E] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#0B1F3A]">1</p>
            <p className="text-sm text-gray-500">Realizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#0B1F3A]">3</p>
            <p className="text-sm text-gray-500">Esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de instalaciones */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[#0B1F3A]">Próximas instalaciones</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {mockInstallations.map((inst) => (
              <div key={inst.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-[#0B1F3A]">{inst.cliente_nombre}</p>
                      <Badge variant={statusColors[inst.estado]}>
                        {INSTALLATION_STATUS_LABELS[inst.estado]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(inst.fecha).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {inst.hora_inicio} - {inst.hora_fin}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {inst.direccion}, {inst.ciudad}
                      </span>
                    </div>
                    {inst.notas && (
                      <p className="text-xs text-gray-500 mt-1">{inst.notas}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
        <p className="text-sm text-blue-800">
          🔧 <strong>Paso 3:</strong> Esta página se conectará a Supabase para mostrar instalaciones reales asignadas al instalador.
        </p>
      </div>
    </div>
  );
}
