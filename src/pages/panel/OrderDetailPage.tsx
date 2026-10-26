import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, FileText, History, AlertTriangle, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useOrder, useUpdateOrderStatus, useUpdateOrderNotes, useReportIncident, useProcessReturn } from '@/hooks/useOrders';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/types/database';
import type { OrderStatus } from '@/types/database';
import { GenerateEmailButton } from '@/components/panel/orders/GenerateEmailButton';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(id || null);
  const updateStatus = useUpdateOrderStatus();
  const updateNotes = useUpdateOrderNotes();
  const reportIncident = useReportIncident();
  const processReturn = useProcessReturn();

  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [statusNotes, setStatusNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentMotivo, setIncidentMotivo] = useState('');
  const [incidentDescripcion, setIncidentDescripcion] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnMotivo, setReturnMotivo] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7FF9]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Pedido no encontrado</p>
        <Button onClick={() => navigate('/panel/pedidos')}>Volver a pedidos</Button>
      </div>
    );
  }

  const handleStatusChange = async () => {
    if (!newStatus) return;

    try {
      await updateStatus.mutateAsync({
        orderId: order.id,
        newStatus,
        notas: statusNotes || undefined,
        tracking_number: trackingNumber || undefined,
      });
      setNewStatus('');
      setStatusNotes('');
      setTrackingNumber('');
      alert('Estado actualizado correctamente');
    } catch (error) {
      alert('Error al actualizar estado: ' + (error as Error).message);
    }
  };

  const handleNotesSave = async () => {
    try {
      await updateNotes.mutateAsync({
        orderId: order.id,
        notas: internalNotes,
      });
      alert('Notas guardadas');
    } catch (error) {
      alert('Error al guardar notas: ' + (error as Error).message);
    }
  };

  const handleIncident = async () => {
    if (!incidentMotivo || !incidentDescripcion) {
      alert('Completa todos los campos');
      return;
    }

    try {
      await reportIncident.mutateAsync({
        orderId: order.id,
        motivo: incidentMotivo,
        descripcion: incidentDescripcion,
      });
      setShowIncidentForm(false);
      setIncidentMotivo('');
      setIncidentDescripcion('');
      alert('Incidencia reportada');
    } catch (error) {
      alert('Error al reportar incidencia: ' + (error as Error).message);
    }
  };

  const handleReturn = async () => {
    if (!returnMotivo) {
      alert('Indica el motivo de la devolución');
      return;
    }

    try {
      await processReturn.mutateAsync({
        orderId: order.id,
        motivo: returnMotivo,
      });
      setShowReturnForm(false);
      setReturnMotivo('');
      alert('Devolución procesada');
    } catch (error) {
      alert('Error al procesar devolución: ' + (error as Error).message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/panel/pedidos"
          className="inline-flex items-center text-sm text-gray-500 hover:text-[#2D7FF9] mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a pedidos
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Pedido {order.numero}</h1>
            <p className="text-gray-500 text-sm">{formatDateTime(order.created_at)}</p>
          </div>
          <Badge
            variant={
              order.estado === 'pagado' || order.estado === 'entregado'
                ? 'success'
                : order.estado === 'incidencia' || order.estado === 'cancelado'
                ? 'danger'
                : 'warning'
            }
            className="text-base px-4 py-2"
          >
            {ORDER_STATUS_LABELS[order.estado]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#2D7FF9]" />
                <h2 className="font-semibold text-[#0B1F3A]">Productos</h2>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.items?.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#0B1F3A]">{item.nombre_snapshot}</p>
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.cantidad} × {formatPrice(item.precio_unitario)}
                      </p>
                    </div>
                    <p className="font-bold text-[#0B1F3A]">
                      {formatPrice(item.precio_unitario * item.cantidad)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA ({order.tipo_iva}%):</span>
                    <span>{formatPrice(order.iva)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cambio de estado */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-[#0B1F3A]">Cambiar estado</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo estado
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                >
                  <option value="">Seleccionar estado...</option>
                  {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value} disabled={value === order.estado}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {newStatus === 'en_transito' && (
                <Input
                  label="Número de seguimiento"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ej: 1Z999AA10123456784"
                />
              )}

              <Input
                label="Notas del cambio (opcional)"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Motivo del cambio, información adicional..."
              />

              <Button
                onClick={handleStatusChange}
                disabled={!newStatus}
                isLoading={updateStatus.isPending}
              >
                Actualizar estado
              </Button>
            </CardContent>
          </Card>

          {/* Historial */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-[#2D7FF9]" />
                <h2 className="font-semibold text-[#0B1F3A]">Historial de cambios</h2>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.status_history?.map((history) => (
                  <div key={history.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#2D7FF9] mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="default">
                            {history.estado_anterior
                              ? ORDER_STATUS_LABELS[history.estado_anterior]
                              : 'Inicio'}
                          </Badge>
                          <span className="text-gray-400">→</span>
                          <Badge variant="info">
                            {ORDER_STATUS_LABELS[history.estado_nuevo]}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(history.created_at)}
                        </p>
                        {history.notas && (
                          <p className="text-sm text-gray-600 mt-2">{history.notas}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                <p className="font-medium">{order.envio_nombre || order.user?.nombre}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium">{order.user?.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Teléfono</p>
                <p className="font-medium">{order.envio_telefono || order.user?.telefono}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dirección de envío */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#2D7FF9]" />
                <h2 className="font-semibold text-[#0B1F3A]">Dirección de envío</h2>
              </div>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{order.envio_calle}</p>
              <p className="text-gray-600">
                {order.envio_codigo_postal} {order.envio_ciudad}
              </p>
              <p className="text-gray-600">{order.envio_provincia}</p>
            </CardContent>
          </Card>

          {/* Facturación */}
          {order.factura_nif && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#2D7FF9]" />
                  <h2 className="font-semibold text-[#0B1F3A]">Facturación</h2>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.factura_nombre}</p>
                <p className="text-gray-600">NIF: {order.factura_nif}</p>
                <p className="text-gray-600">{order.factura_calle}</p>
                <p className="text-gray-600">
                  {order.factura_codigo_postal} {order.factura_ciudad}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notas internas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-[#2D7FF9]" />
                <h2 className="font-semibold text-[#0B1F3A]">Notas internas</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={4}
                placeholder="Notas internas del pedido (solo visibles para el equipo)..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
              />
              <Button
                onClick={handleNotesSave}
                size="sm"
                isLoading={updateNotes.isPending}
              >
                Guardar notas
              </Button>
            </CardContent>
          </Card>

          {/* Redactar email con IA */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-[#0B1F3A]">Comunicación</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <GenerateEmailButton
                orderStatus={order.estado}
                orderData={{
                  numero: order.numero,
                  cliente: order.envio_nombre || order.user?.nombre,
                  total: order.total,
                }}
              />
            </CardContent>
          </Card>

          {/* Acciones especiales */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-[#0B1F3A]">Acciones especiales</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowIncidentForm(!showIncidentForm)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Reportar incidencia
              </Button>

              {showIncidentForm && (
                <div className="space-y-3 p-3 bg-yellow-50 rounded-lg">
                  <Input
                    label="Motivo"
                    value={incidentMotivo}
                    onChange={(e) => setIncidentMotivo(e.target.value)}
                    placeholder="Ej: Producto dañado"
                  />
                  <textarea
                    value={incidentDescripcion}
                    onChange={(e) => setIncidentDescripcion(e.target.value)}
                    rows={3}
                    placeholder="Descripción detallada..."
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={handleIncident}
                    isLoading={reportIncident.isPending}
                  >
                    Confirmar incidencia
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowReturnForm(!showReturnForm)}
              >
                Procesar devolución
              </Button>

              {showReturnForm && (
                <div className="space-y-3 p-3 bg-red-50 rounded-lg">
                  <Input
                    label="Motivo de devolución"
                    value={returnMotivo}
                    onChange={(e) => setReturnMotivo(e.target.value)}
                    placeholder="Ej: Cliente no satisfecho"
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleReturn}
                    isLoading={processReturn.isPending}
                  >
                    Confirmar devolución
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
