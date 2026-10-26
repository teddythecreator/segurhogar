import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Calendar, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useCartStore } from '@/stores/cart-store';
import { supabase } from '@/lib/supabase';

interface OrderData {
  numero: string;
  total: number;
  estado: string;
}

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const clearCart = useCartStore((s) => s.clearCart);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Buscar pedido por stripe_session_id
        const { data, error } = await supabase
          .from('orders')
          .select('numero, total, estado')
          .eq('stripe_session_id', sessionId)
          .single();

        if (!error && data) {
          setOrder(data as OrderData);
          // Limpiar carrito después de pago exitoso
          clearCart();
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7FF9] mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando tu pago...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <CheckCircle className="h-8 w-8 text-[#22C55E]" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-3">
        ¡Pago completado!
      </h1>
      
      {order ? (
        <>
          <p className="text-gray-600 mb-2">
            Tu pedido <strong>{order.numero}</strong> ha sido procesado correctamente.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Total: {order.total}€
          </p>
        </>
      ) : (
        <p className="text-gray-600 mb-8">
          Tu pago ha sido procesado correctamente. Recibirás un email con los detalles del pedido.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <Package className="h-6 w-6 text-[#2D7FF9] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#0B1F3A]">Envío en 3-7 días</p>
            <p className="text-xs text-gray-500">Te enviaremos el número de seguimiento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Calendar className="h-6 w-6 text-[#22C55E] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#0B1F3A]">Seguimiento</p>
            <p className="text-xs text-gray-500">Consulta el estado en tu cuenta</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/mi-cuenta">
          <Button>Ver mis pedidos</Button>
        </Link>
        <Link to="/catalogo">
          <Button variant="outline">Seguir comprando</Button>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-2">¿Tienes dudas?</p>
        <p className="text-sm text-gray-600">
          <Phone className="inline h-4 w-4 mr-1" />
          900 123 456 · info@segurhogar.es
        </p>
      </div>
    </div>
  );
}
