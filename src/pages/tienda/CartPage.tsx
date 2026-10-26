import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useCartStore } from '@/stores/cart-store';

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">Añade productos para empezar</p>
        <Link to="/catalogo">
          <Button>Ir al catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#0B1F3A] mb-6">Carrito de compra</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <Card key={item.producto.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#0B1F3A]">{item.producto.nombre}</p>
                <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
              </div>
              <p className="font-bold text-[#0B1F3A]">{item.producto.precio}€</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-gray-600">Total</span>
            <span className="text-2xl font-bold text-[#0B1F3A]">{getTotalPrice().toFixed(2)}€</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/catalogo" className="flex-1">
              <Button variant="outline" className="w-full">Seguir comprando</Button>
            </Link>
            <Button className="flex-1" disabled>
              Finalizar compra (pendiente)
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
        <p className="text-sm text-blue-800">
          🔧 <strong>Paso 1:</strong> El checkout se implementará en pasos posteriores con Stripe.
        </p>
      </div>
    </div>
  );
}
