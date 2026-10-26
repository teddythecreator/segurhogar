import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { productTypeLabels } from '@/data/mock-products';

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">Añade productos para empezar</p>
        <Link to="/tienda">
          <Button>Ir a la tienda</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Carrito de compra</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => {
          const price = item.producto.precio_rebajado ?? item.producto.precio;
          return (
            <Card key={item.producto.id}>
              <CardContent className="p-4 flex gap-4">
                {/* Imagen mini */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-2xl">
                    {item.producto.categoria === 'camaras' && '📷'}
                    {item.producto.categoria === 'alarmas' && '🚨'}
                    {item.producto.categoria === 'cerraduras' && '🔐'}
                    {item.producto.categoria === 'detectores' && '🔔'}
                    {item.producto.categoria === 'routers' && '📡'}
                    {item.producto.categoria === 'vpn' && '🛡️'}
                    {item.producto.categoria === 'antivirus' && '💻'}
                    {item.producto.categoria === 'llaves_seguridad' && '🔑'}
                    {item.producto.categoria === 'packs' && '📦'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/producto/${item.producto.id}`}
                    className="font-medium text-[#0B1F3A] hover:text-[#2D7FF9] text-sm"
                  >
                    {item.producto.nombre}
                  </Link>
                  <p className="text-xs text-gray-500">{productTypeLabels[item.producto.tipo]}</p>
                  <p className="font-bold text-[#0B1F3A] mt-1">{formatPrice(price)}</p>
                </div>

                {/* Cantidad */}
                {item.producto.tipo !== 'afiliado' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Subtotal + eliminar */}
                <div className="text-right">
                  <p className="font-bold text-[#0B1F3A]">{formatPrice(price * item.cantidad)}</p>
                  <button
                    onClick={() => removeItem(item.producto.id)}
                    className="mt-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumen */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-gray-600">Total</span>
            <span className="text-2xl font-bold text-[#0B1F3A]">{formatPrice(getTotalPrice())}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/tienda" className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Seguir comprando
              </Button>
            </Link>
            <Link to="/checkout" className="flex-1">
              <Button className="w-full">
                Finalizar compra
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Pago seguro con Stripe. Envío en 3-7 días laborables.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
