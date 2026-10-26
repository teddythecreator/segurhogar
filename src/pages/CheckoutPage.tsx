import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import type { Direccion } from '@/types';

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();

  const hasInstallation = items.some((i) => i.producto.tipo === 'instalacion' || i.producto.tipo === 'pack');

  const [direccion, setDireccion] = useState<Direccion>({
    nombre_completo: '',
    telefono: '',
    calle: '',
    codigo_postal: '',
    ciudad: '',
    provincia: '',
  });

  const [fechaInstalacion, setFechaInstalacion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulación de pago con Stripe (en producción se llamaría a la Edge Function)
    setTimeout(() => {
      clearCart();
      navigate('/pedido-confirmado');
      setIsProcessing(false);
    }, 2000);
  };

  if (items.length === 0) {
    navigate('/carrito');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#0B1F3A] mb-6">Finalizar compra</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dirección de envío */}
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
                    value={direccion.nombre_completo}
                    onChange={(e) => setDireccion({ ...direccion, nombre_completo: e.target.value })}
                    required
                  />
                  <Input
                    label="Teléfono"
                    type="tel"
                    value={direccion.telefono}
                    onChange={(e) => setDireccion({ ...direccion, telefono: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Dirección"
                  value={direccion.calle}
                  onChange={(e) => setDireccion({ ...direccion, calle: e.target.value })}
                  placeholder="Calle, número, piso..."
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Código postal"
                    value={direccion.codigo_postal}
                    onChange={(e) => setDireccion({ ...direccion, codigo_postal: e.target.value })}
                    required
                  />
                  <Input
                    label="Ciudad"
                    value={direccion.ciudad}
                    onChange={(e) => setDireccion({ ...direccion, ciudad: e.target.value })}
                    required
                  />
                  <Input
                    label="Provincia"
                    value={direccion.provincia}
                    onChange={(e) => setDireccion({ ...direccion, provincia: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Fecha de instalación */}
            {hasInstallation && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#2D7FF9]" />
                    <h2 className="font-semibold text-[#0B1F3A]">Fecha de instalación</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <Input
                    label="¿Qué día prefieres la instalación?"
                    type="date"
                    value={fechaInstalacion}
                    onChange={(e) => setFechaInstalacion(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Te confirmaremos la hora exacta por email o teléfono.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pago */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#2D7FF9]" />
                  <h2 className="font-semibold text-[#0B1F3A]">Pago seguro</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">
                    Serás redirigido a <strong>Stripe</strong> para completar el pago de forma segura.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Aceptamos Visa, Mastercard, Apple Pay y Google Pay.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen del pedido */}
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
                      <span className="font-medium shrink-0">{formatPrice(price * item.cantidad)}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-[#0B1F3A]">{formatPrice(getTotalPrice())}</span>
                </div>
                <Button type="submit" className="w-full" isLoading={isProcessing} size="lg">
                  Pagar {formatPrice(getTotalPrice())}
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  🔒 Pago cifrado y seguro con Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
