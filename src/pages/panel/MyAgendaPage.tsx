import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Camera, CheckSquare, Square, Upload, PenTool, CheckCircle, Clock } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useInstallations, useUpdateInstallation, useUploadInstallationPhoto, useCompleteInstallation } from '@/hooks/useInstallations';
import { supabase } from '@/lib/supabase';
import { INSTALLATION_STATUS_LABELS } from '@/types/database';
import type { Installation, InstallationChecklistItem } from '@/types/database';

export function MyAgendaPage() {
  const { user } = useAuth();
  const updateInstallation = useUpdateInstallation();
  const uploadPhoto = useUploadInstallationPhoto();
  const completeInstallation = useCompleteInstallation();

  // Obtener instalaciones del instalador
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const { data: installations, isLoading } = useInstallations({
    instalador_id: user?.id,
    fecha_desde: today,
    fecha_hasta: nextWeekStr,
    limit: 50,
  });

  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [checklist, setChecklist] = useState<InstallationChecklistItem[]>([]);
  const [notasInstalador, setNotasInstalador] = useState('');
  const signatureRef = useRef<SignatureCanvas>(null);

  // Separar instalaciones por día
  const todayInstallations = installations?.installations.filter((inst: Installation) => inst.fecha === today) || [];
  const upcomingInstallations = installations?.installations.filter((inst: Installation) => inst.fecha > today) || [];

  const handleArrival = async (installation: Installation) => {
    try {
      await updateInstallation.mutateAsync({
        id: installation.id,
        fecha_llegada: new Date().toISOString(),
      });
      alert('Hora de llegada registrada');
    } catch (error) {
      alert('Error al registrar llegada: ' + (error as Error).message);
    }
  };

  const handleChecklistToggle = (index: number) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item))
    );
  };

  const handlePhotoUpload = async (file: File) => {
    if (!selectedInstallation) return;

    try {
      await uploadPhoto.mutateAsync({
        installationId: selectedInstallation.id,
        file,
      });
      alert('Foto subida correctamente');
    } catch (error) {
      alert('Error al subir foto: ' + (error as Error).message);
    }
  };

  const handleSignatureSave = async () => {
    if (!signatureRef.current || !selectedInstallation) return;

    try {
      // Convertir firma a blob
      const dataUrl = signatureRef.current.toDataURL();
      const blob = await fetch(dataUrl).then((res) => res.blob());

      // Subir a Storage
      const fileName = `${selectedInstallation.id}/firma-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('installation-signatures')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('installation-signatures')
        .getPublicUrl(fileName);

      // Actualizar instalación con firma y checklist
      await updateInstallation.mutateAsync({
        id: selectedInstallation.id,
        firma_url: urlData.publicUrl,
        checklist: checklist as any,
        notas_instalador: notasInstalador || null,
      });

      setShowSignature(false);
      alert('Firma guardada correctamente');
    } catch (error) {
      alert('Error al guardar firma: ' + (error as Error).message);
    }
  };

  const handleComplete = async () => {
    if (!selectedInstallation) return;

    // Verificar que hay firma y al menos una foto
    if (!selectedInstallation.firma_url) {
      alert('Primero debes obtener la firma del cliente');
      return;
    }

    if (!selectedInstallation.photos || selectedInstallation.photos.length === 0) {
      alert('Debes subir al menos una foto del trabajo');
      return;
    }

    try {
      await completeInstallation.mutateAsync({
        id: selectedInstallation.id,
        firmaUrl: selectedInstallation.firma_url,
        notas: notasInstalador,
      });

      setSelectedInstallation(null);
      alert('Instalación marcada como realizada');
    } catch (error) {
      alert('Error al completar instalación: ' + (error as Error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7FF9]"></div>
      </div>
    );
  }

  // Vista de detalle de instalación
  if (selectedInstallation) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => setSelectedInstallation(null)}
          className="text-sm text-[#2D7FF9] hover:underline mb-4"
        >
          ← Volver a la agenda
        </button>

        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#0B1F3A]">
                  {selectedInstallation.customer?.nombre}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(selectedInstallation.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                  {selectedInstallation.hora_inicio && ` a las ${selectedInstallation.hora_inicio}`}
                </p>
              </div>
              <Badge
                variant={
                  selectedInstallation.estado === 'realizada'
                    ? 'success'
                    : selectedInstallation.estado === 'cancelada'
                    ? 'danger'
                    : 'warning'
                }
              >
                {INSTALLATION_STATUS_LABELS[selectedInstallation.estado]}
              </Badge>
            </div>

            {/* Botones de acción rápida */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <a
                href={`tel:${selectedInstallation.customer?.telefono}`}
                className="block"
              >
                <Button variant="outline" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Llamar
                </Button>
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${selectedInstallation.direccion_calle}, ${selectedInstallation.direccion_codigo_postal} ${selectedInstallation.direccion_ciudad}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Cómo llegar
                </Button>
              </a>
            </div>

            {/* Dirección */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Dirección</p>
              <p className="text-sm text-gray-600">
                {selectedInstallation.direccion_calle}
                <br />
                {selectedInstallation.direccion_codigo_postal} {selectedInstallation.direccion_ciudad}
              </p>
            </div>

            {/* Productos a instalar */}
            {selectedInstallation.order?.items && selectedInstallation.order.items.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Productos a instalar</p>
                <div className="space-y-2">
                  {selectedInstallation.order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-[#22C55E]" />
                      <span>{item.nombre_snapshot}</span>
                      <span className="text-gray-500">×{item.cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botón "He llegado" */}
            {selectedInstallation.estado === 'asignada' && !selectedInstallation.fecha_llegada && (
              <Button
                className="w-full mb-4"
                onClick={() => handleArrival(selectedInstallation)}
                isLoading={updateInstallation.isPending}
              >
                <Clock className="mr-2 h-4 w-4" />
                He llegado
              </Button>
            )}

            {selectedInstallation.fecha_llegada && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Llegada registrada a las{' '}
                  {new Date(selectedInstallation.fecha_llegada).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#0B1F3A] mb-3 flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Checklist de tareas
            </h3>
            <div className="space-y-2">
              {checklist.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay tareas definidas. Añade tareas según los productos a instalar.
                </p>
              ) : (
                checklist.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleChecklistToggle(index)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 text-left"
                  >
                    {item.checked ? (
                      <CheckSquare className="h-5 w-5 text-[#22C55E]" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={item.checked ? 'line-through text-gray-500' : ''}>
                      {item.label}
                    </span>
                  </button>
                ))
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() =>
                setChecklist([...checklist, { id: Date.now().toString(), label: 'Nueva tarea', checked: false }])
              }
            >
              + Añadir tarea
            </Button>
          </CardContent>
        </Card>

        {/* Subida de fotos */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#0B1F3A] mb-3 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Fotos del trabajo
            </h3>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload">
              <Button variant="outline" className="w-full cursor-pointer">
                <Camera className="mr-2 h-4 w-4" />
                Tomar foto
              </Button>
            </label>
            {selectedInstallation.photos && selectedInstallation.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {selectedInstallation.photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt={photo.descripcion || 'Foto'}
                    className="aspect-square object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notas del instalador */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#0B1F3A] mb-3">Notas de la instalación</h3>
            <textarea
              value={notasInstalador}
              onChange={(e) => setNotasInstalador(e.target.value)}
              rows={3}
              placeholder="Observaciones, incidencias, etc."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
            />
          </CardContent>
        </Card>

        {/* Firma y completar */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#0B1F3A] mb-3 flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Firma del cliente
            </h3>
            {!showSignature ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowSignature(true)}
              >
                <PenTool className="mr-2 h-4 w-4" />
                Obtener firma
              </Button>
            ) : (
              <div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg mb-3">
                  <SignatureCanvas
                    ref={signatureRef}
                    penColor="black"
                    canvasProps={{
                      className: 'w-full h-48',
                      style: { width: '100%', height: '192px' },
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSignatureSave}
                    isLoading={updateInstallation.isPending}
                  >
                    Guardar firma
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      signatureRef.current?.clear();
                      setShowSignature(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botón marcar como realizada */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleComplete}
          disabled={!selectedInstallation.firma_url || !selectedInstallation.photos?.length}
          isLoading={completeInstallation.isPending}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Marcar como realizada
        </Button>
        {(!selectedInstallation.firma_url || !selectedInstallation.photos?.length) && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Debes obtener la firma del cliente y subir al menos una foto
          </p>
        )}
      </div>
    );
  }

  // Vista de agenda
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Mi agenda</h1>
        <p className="text-gray-500 text-sm">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Instalaciones de hoy */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#0B1F3A] mb-3">Hoy</h2>
        {todayInstallations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No tienes instalaciones para hoy</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayInstallations.map((installation) => (
              <InstallationCard
                key={installation.id}
                installation={installation}
                onClick={() => setSelectedInstallation(installation)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Próximas instalaciones */}
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F3A] mb-3">Próximos días</h2>
        {upcomingInstallations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No tienes instalaciones programadas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingInstallations.map((installation) => (
              <InstallationCard
                key={installation.id}
                installation={installation}
                onClick={() => setSelectedInstallation(installation)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InstallationCard({
  installation,
  onClick,
}: {
  installation: Installation;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-[#0B1F3A]">
              {installation.customer?.nombre}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(installation.fecha).toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
              {installation.hora_inicio && ` · ${installation.hora_inicio}`}
            </p>
          </div>
          <Badge
            variant={
              installation.estado === 'realizada'
                ? 'success'
                : installation.estado === 'cancelada'
                ? 'danger'
                : 'warning'
            }
          >
            {INSTALLATION_STATUS_LABELS[installation.estado]}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {installation.direccion_ciudad}
        </p>
      </CardContent>
    </Card>
  );
}
