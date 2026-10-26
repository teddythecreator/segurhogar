import { Link } from 'react-router-dom';
import { CheckCircle, Package, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function OrderConfirmedPage() {
  const orderNumber = `PED-${Math.floor(Math.random() * 9000 + 1000)}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <CheckCircle className="h-8 w-8 text-[#22C55E]" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-3">
        ¡Pedido confirmado!
      </h1>
      <p className="text-gray-600 mb-2">
        Tu pedido <strong>{orderNumber}</strong> ha sido registrado correctamente.
      </p>
      <p className="text-gray-500 text-sm mb-8">
        Recibirás un email de confirmación con los detalles del pedido y el seguimiento del envío.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 rounded-xl p-4">
          <Package className="h-6 w-6 text-[#2D7FF9] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#0B1F3A]">Envío en 3-7 días</p>
          <p className="text-xs text-gray-500">Te enviaremos el número de seguimiento</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <Phone className="h-6 w-6 text-[#22C55E] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#0B1F3A]">¿Dudas?</p>
          <p className="text-xs text-gray-500">Llámanos al 900 123 456</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/tienda">
          <Button variant="outline">Seguir comprando</Button>
        </Link>
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
