import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/hooks/useAuth';
import { callEdgeFunction } from '@/lib/edge-functions';
import { formatPrice } from '@/lib/utils';

const checkoutSchema = z.object({
  // Datos de envío
  envio_nombre: z.string().min(1, 'El nombre es obligatorio'),
  envio_telefono: z.string().min(9, 'Teléfono inválido'),
  envio_calle: z.string().min(1, 'La dirección es obligatoria'),
  envio_codigo_postal: z.string().length(5, 'Código postal inválido'),
  envio_ciudad: z.string().min(1, 'La ciudad es obligatoria'),
  envio_provincia: z.string().min(1, 'La provincia es obligatoria'),
  
  // Facturación
  necesita_factura: z.boolean(),
  factura_razon_social: z.string().optional(),
  factura_nif: z.string().optional(),
  factura_calle: z.string().optional(),
  factura_codigo_postal: z.string().optional(),
  factura_ciudad: z.string().optional(),
  factura_provincia: z.string().optional(),
  
  // Notas
  notas: z.string().optional(),
}).refine(
  (data) => {
    if (data.necesita_factura) {
      return data.factura_razon_social && data.factura_nif && data.factura_calle;
    }
    return true;
  },
  {
    message: 'Si necesitas factura, completa todos los datos de facturación',
    path: ['factura_razon_social'],
  }
);

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const items = useCartStore((s) => s.items);
  const installationData = useCartStore((s) => s.installationData);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      necesita_factura: false,
      envio_nombre: user?.nombre || '',
    },
  });

  const necesitaFactura = watch('necesita_factura');

  if (items.length === 0) {
    navigate('/carrito');
    return null;
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    setError('');

    try {
      // Preparar datos del pedido
      const orderData = {
        items: items.map((item) => ({
          product_id: item.producto.id,
          cantidad: item.cantidad,
        })),
        envio: {
          nombre: data.envio_nombre,
          telefono: data.envio_telefono,
          calle: data.envio_calle,
          codigo_postal: data.envio_codigo_postal,
          ciudad: data.envio_ciudad,
          provincia: data.envio_provincia,
        },
        factura: data.necesita_factura
          ? {
              razon_social: data.factura_razon_social,
              nif: data.factura_nif,
              calle: data.factura_calle,
              codigo_postal: data.factura_codigo_postal,
              ciudad: data.factura_ciudad,
              provincia: data.factura_provincia,
            }
          : null,
        notas: data.notas || null,
        installation: installationData || null,
      };

      // Llamar a la Edge Function para crear el checkout
      const { data: checkoutData, error: checkoutError } = await callEdgeFunction<{
        sessionId: string;
        url: string;
      }>('create-checkout', {
        method: 'POST',
        body: orderData,
      });

      if (checkoutError) {
        throw new Error(checkoutError.message || 'Error al crear el pedido');
      }

      if (!checkoutData?.url) {
        throw new Error('No se pudo generar la sesión de pago');
      }

      // Redirigir a Stripe Checkout
      window.location.href = checkoutData.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#0B1F3A] mb-6">Finalizar compra</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formularios */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos de envío */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#2D7FF9]" />
                  <h2 className="font-semibold text-[#0B1F3A]">Dirección de envío</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nombre completo"
                    error={errors.envio_nombre?.message}
                    {...register('envio_nombre')}
                  />
                  <Input
                    label="Teléfono"
                    type="tel"
                    error={errors.envio_telefono?.message}
                    {...register('envio_telefono')}
                  />
                </div>
                <Input
                  label="Dirección"
                  error={errors.envio_calle?.message}
                  {...register('envio_calle')}
                  placeholder="Calle, número, piso, puerta..."
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Código postal"
                    error={errors.envio_codigo_postal?.message}
                    {...register('envio_codigo_postal')}
                  />
                  <Input
                    label="Ciudad"
                    error={errors.envio_ciudad?.message}
                    {...register('envio_ciudad')}
                  />
                  <Input
                    label="Provincia"
                    error={errors.envio_provincia?.message}
                    {...register('envio_provincia')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Datos de facturación */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#2D7FF9]" />
                  <h2 className="font-semibold text-[#0B1F3A]">Facturación</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('necesita_factura')}
                    className="mt-1 h-4 w-4 text-[#2D7FF9] rounded"
                  />
                  <div>
                    <p className="font-medium text-sm text-[#0B1F3A]">Necesito factura</p>
                    <p className="text-xs text-gray-500">
                      Marca esta opción si necesitas factura con datos de empresa
                    </p>
                  </div>
                </label>

                {necesitaFactura && (
                  <div className="space-y-4 pl-7">
                    <Input
                      label="Razón social"
                      error={errors.factura_razon_social?.message}
                      {...register('factura_razon_social')}
                    />
                    <Input
                      label="NIF/CIF"
                      error={errors.factura_nif?.message}
                      {...register('factura_nif')}
                    />
                    <Input
                      label="Dirección fiscal"
                      error={errors.factura_calle?.message}
                      {...register('factura_calle')}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Código postal"
                        error={errors.factura_codigo_postal?.message}
                        {...register('factura_codigo_postal')}
                      />
                      <Input
                        label="Ciudad"
                        error={errors.factura_ciudad?.message}
                        {...register('factura_ciudad')}
                      />
                      <Input
                        label="Provincia"
                        error={errors.factura_provincia?.message}
                        {...register('factura_provincia')}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notas */}
            <Card>
              <CardContent className="p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del pedido (opcional)
                </label>
                <textarea
                  {...register('notas')}
                  rows={3}
                  placeholder="Instrucciones especiales, horarios preferidos, etc."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Resumen */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <h2 className="font-semibold text-[#0B1F3A]">Resumen del pedido</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => {
                  const price = item.producto.precio_rebajado ?? item.producto.precio;
                  return (
                    <div key={item.producto.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate mr-2">
                        {item.producto.nombre} × {item.cantidad}
                      </span>
                      <span className="font-medium shrink-0">
                        {formatPrice(price * item.cantidad)}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-[#0B1F3A]">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                <p className="text-xs text-gray-500">IVA incluido</p>

                {error && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" isLoading={isProcessing}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagar con Stripe
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  🔒 Pago seguro con Stripe. Tus datos están protegidos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
