import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PaymentCancelledPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
        <XCircle className="h-8 w-8 text-red-600" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-3">
        Pago cancelado
      </h1>
      
      <p className="text-gray-600 mb-8">
        El pago ha sido cancelado. No se ha realizado ningún cargo.
        <br />
        Tu carrito sigue guardado, puedes intentarlo de nuevo cuando quieras.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
        <Link to="/carrito">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al carrito
          </Button>
        </Link>
        <Link to="/catalogo">
          <Button variant="outline">Seguir comprando</Button>
        </Link>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
        <p className="text-sm text-blue-900 mb-2">
          <strong>¿Problemas con el pago?</strong>
        </p>
        <p className="text-sm text-blue-700">
          Si has tenido problemas para completar el pago, contacta con nosotros y te ayudaremos.
        </p>
        <p className="text-sm text-blue-700 mt-2">
          <Phone className="inline h-4 w-4 mr-1" />
          900 123 456 · info@segurhogar.es
        </p>
      </div>
    </div>
  );
}
