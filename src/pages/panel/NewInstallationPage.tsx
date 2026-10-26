import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useCreateInstallation, useInstallers } from '@/hooks/useInstallations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function NewInstallationPage() {
  const navigate = useNavigate();
  const { data: installers } = useInstallers();
  const createInstallation = useCreateInstallation();

  // Obtener clientes
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, nombre, email, telefono')
        .order('nombre');
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    customer_id: '',
    instalador_id: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    direccion_calle: '',
    direccion_codigo_postal: '',
    direccion_ciudad: '',
    direccion_provincia: '',
    notas: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.customer_id || !formData.fecha || !formData.direccion_calle) {
      alert('Por favor, completa los campos obligatorios');
      return;
    }

    try {
      const newInstallation = await createInstallation.mutateAsync({
        customer_id: formData.customer_id,
        instalador_id: formData.instalador_id || null,
        fecha: formData.fecha,
        hora_inicio: formData.hora_inicio || null,
        hora_fin: formData.hora_fin || null,
        direccion_calle: formData.direccion_calle,
        direccion_codigo_postal: formData.direccion_codigo_postal,
        direccion_ciudad: formData.direccion_ciudad,
        direccion_provincia: formData.direccion_provincia || null,
        notas: formData.notas || null,
        estado: 'solicitada',
        checklist: [],
      });

      navigate(`/panel/instalaciones/${newInstallation.id}`);
    } catch (error) {
      alert('Error al crear instalación: ' + (error as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/panel/instalaciones"
          className="inline-flex items-center text-sm text-gray-500 hover:text-[#2D7FF9] mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a instalaciones
        </Link>
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Nueva instalación manual</h1>
        <p className="text-gray-500 text-sm">Crear instalación sin pedido asociado</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos de la instalación */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[#0B1F3A]">Datos de la instalación</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => handleChange('customer_id', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
              >
                <option value="">Seleccionar cliente...</option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.nombre} {customer.email && `(${customer.email})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instalador asignado
              </label>
              <select
                value={formData.instalador_id}
                onChange={(e) => handleChange('instalador_id', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
              >
                <option value="">Sin asignar</option>
                {installers?.map((installer) => (
                  <option key={installer.id} value={installer.id}>
                    {installer.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <Input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleChange('fecha', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora inicio
                </label>
                <Input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => handleChange('hora_inicio', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora fin
                </label>
                <Input
                  type="time"
                  value={formData.hora_fin}
                  onChange={(e) => handleChange('hora_fin', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => handleChange('notas', e.target.value)}
                rows={3}
                placeholder="Notas adicionales sobre la instalación..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dirección */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[#0B1F3A]">Dirección de instalación</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección completa *
              </label>
              <Input
                value={formData.direccion_calle}
                onChange={(e) => handleChange('direccion_calle', e.target.value)}
                placeholder="Calle, número, piso, puerta..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código postal *
                </label>
                <Input
                  value={formData.direccion_codigo_postal}
                  onChange={(e) => handleChange('direccion_codigo_postal', e.target.value)}
                  placeholder="28001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <Input
                  value={formData.direccion_ciudad}
                  onChange={(e) => handleChange('direccion_ciudad', e.target.value)}
                  placeholder="Madrid"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provincia
                </label>
                <Input
                  value={formData.direccion_provincia}
                  onChange={(e) => handleChange('direccion_provincia', e.target.value)}
                  placeholder="Madrid"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones */}
      <div className="mt-6 flex gap-3">
        <Button onClick={handleSubmit} isLoading={createInstallation.isPending}>
          Crear instalación
        </Button>
        <Button variant="outline" onClick={() => navigate('/panel/instalaciones')}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
