import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, Package, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useInstallation, useUpdateInstallation, useInstallers } from '@/hooks/useInstallations';
import { INSTALLATION_STATUS_LABELS } from '@/types/database';
import type { InstallationStatus } from '@/types/database';

export function InstallationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: installation, isLoading } = useInstallation(id || null);
  const { data: installers } = useInstallers();
  const updateInstallation = useUpdateInstallation();

  const [editMode, setEditMode] = useState(false);
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [instaladorId, setInstaladorId] = useState('');
  const [estado, setEstado] = useState<InstallationStatus>('solicitada');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7FF9]"></div>
      </div>
    );
  }

  if (!installation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Instalación no encontrada</p>
        <Button onClick={() => navigate('/panel/instalaciones')}>Volver</Button>
      </div>
    );
  }

  const handleEdit = () => {
    setFecha(installation.fecha);
    setHoraInicio(installation.hora_inicio || '');
    setHoraFin(installation.hora_fin || '');
    setInstaladorId(installation.instalador_id || '');
    setEstado(installation.estado);
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      await updateInstallation.mutateAsync({
        id: installation.id,
        fecha,
        hora_inicio: horaInicio || null,
        hora_fin: horaFin || null,
        instalador_id: instaladorId || null,
        estado,
      });
      setEditMode(false);
    } catch (error) {
      alert('Error al actualizar: ' + (error as Error).message);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${installation.direccion_calle}, ${installation.direccion_codigo_postal} ${installation.direccion_ciudad}`
  )}`;

  // Verificar si los productos del pedido están entregados
  const orderDelivered = installation.order?.estado === 'entregado';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/panel/instalaciones"
          className="inline-flex items-center text-sm text-gray-500 hover:text-[#2D7FF9] mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a instalaciones
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">
              Instalación {installation.order ? `#${installation.order.numero}` : 'Manual'}
            </h1>
            <p className="text-gray-500 text-sm">
              {new Date(installation.fecha).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <Badge
            variant={
              installation.estado === 'realizada' || installation.estado === 'cerrada'
                ? 'success'
                : installation.estado === 'cancelada'
                ? 'danger'
                : 'warning'
            }
            className="text-base px-4 py-2"
          >
            {INSTALLATION_STATUS_LABELS[installation.estado]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalles de la instalación */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-[#0B1F3A]">Detalles de la instalación</h2>
                {!editMode && (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha
                      </label>
                      <Input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value as InstallationStatus)}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                      >
                        {Object.entries(INSTALLATION_STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora inicio
                      </label>
                      <Input
                        type="time"
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora fin
                      </label>
                      <Input
                        type="time"
                        value={horaFin}
                        onChange={(e) => setHoraFin(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instalador asignado
                    </label>
                    <select
                      value={instaladorId}
                      onChange={(e) => setInstaladorId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                    >
                      <option value="">Sin asignar</option>
                      {installers?.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} isLoading={updateInstallation.isPending}>
                      Guardar cambios
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-[#2D7FF9] mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-medium">
                        {new Date(installation.fecha).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  {(installation.hora_inicio || installation.hora_fin) && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-[#2D7FF9] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Horario</p>
                        <p className="font-medium">
                          {installation.hora_inicio && `${installation.hora_inicio} - `}
                          {installation.hora_fin || 'Por confirmar'}
                        </p>
                      </div>
                    </div>
                  )}
                  {installation.instalador && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-[#2D7FF9] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Instalador asignado</p>
                        <p className="font-medium">{installation.instalador.nombre}</p>
                        {installation.instalador.telefono && (
                          <a
                            href={`tel:${installation.instalador.telefono}`}
                            className="text-sm text-[#2D7FF9] hover:underline"
                          >
                            {installation.instalador.telefono}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dirección */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#2D7FF9]" />
                <h2 className="font-semibold text-[#0B1F3A]">Dirección</h2>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-[#0B1F3A] mb-2">
                {installation.direccion_calle}
              </p>
              <p className="text-gray-600 mb-4">
                {installation.direccion_codigo_postal} {installation.direccion_ciudad}
                {installation.direccion_provincia && `, ${installation.direccion_provincia}`}
              </p>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#2D7FF9] hover:underline"
              >
                <MapPin className="h-4 w-4" />
                Ver en Google Maps
              </a>
            </CardContent>
          </Card>

          {/* Productos del pedido */}
          {installation.order && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#2D7FF9]" />
                    <h2 className="font-semibold text-[#0B1F3A]">Productos a instalar</h2>
                  </div>
                  <Badge variant={orderDelivered ? 'success' : 'warning'}>
                    {orderDelivered ? 'Productos entregados' : 'Productos pendientes'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {installation.order.items?.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#0B1F3A]">{item.nombre_snapshot}</p>
                        <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                      </div>
                      {orderDelivered && (
                        <CheckCircle className="h-5 w-5 text-[#22C55E]" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#2D7FF9]" />
                <h2 className="font-semibold text-[#0B1F3A]">Cliente</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500">Nombre</p>
                <p className="font-medium">{installation.customer?.nombre}</p>
              </div>
              {installation.customer?.email && (
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{installation.customer.email}</p>
                </div>
              )}
              {installation.customer?.telefono && (
                <div>
                  <p className="text-gray-500">Teléfono</p>
                  <a
                    href={`tel:${installation.customer.telefono}`}
                    className="font-medium text-[#2D7FF9] hover:underline flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    {installation.customer.telefono}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notas */}
          {installation.notas && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-[#0B1F3A]">Notas</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {installation.notas}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Fotos */}
          {installation.photos && installation.photos.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-[#0B1F3A]">
                  Fotos ({installation.photos.length})
                </h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {installation.photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={photo.url}
                        alt={photo.descripcion || 'Foto de instalación'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Firma */}
          {installation.firma_url && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-[#0B1F3A]">Firma del cliente</h2>
              </CardHeader>
              <CardContent>
                <a
                  href={installation.firma_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={installation.firma_url}
                    alt="Firma del cliente"
                    className="w-full rounded-lg border"
                  />
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
