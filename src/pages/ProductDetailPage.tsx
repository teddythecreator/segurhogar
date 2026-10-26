import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ExternalLink, Wrench, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { mockProducts, productTypeLabels, categoryLabels } from '@/data/mock-products';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);
  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-4">Producto no encontrado</h1>
        <Link to="/tienda">
          <Button>Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  const price = product.precio_rebajado ?? product.precio;
  const hasDiscount = product.precio_rebajado !== undefined;
  const includedProducts = product.productos_incluidos
    ?.map((pid) => mockProducts.find((p) => p.id === pid))
    .filter(Boolean) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/tienda" className="inline-flex items-center text-sm text-gray-500 hover:text-[#2D7FF9] mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver a la tienda
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagen */}
        <div>
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
            <span className="text-8xl">
              {product.categoria === 'camaras' && '📷'}
              {product.categoria === 'alarmas' && '🚨'}
              {product.categoria === 'cerraduras' && '🔐'}
              {product.categoria === 'detectores' && '🔔'}
              {product.categoria === 'routers' && '📡'}
              {product.categoria === 'vpn' && '🛡️'}
              {product.categoria === 'antivirus' && '💻'}
              {product.categoria === 'llaves_seguridad' && '🔑'}
              {product.categoria === 'packs' && '📦'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="info">{categoryLabels[product.categoria]}</Badge>
            <Badge>{productTypeLabels[product.tipo]}</Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-4">
            {product.nombre}
          </h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-[#0B1F3A]">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.precio)}</span>
            )}
            {hasDiscount && (
              <Badge variant="danger">
                -{Math.round((1 - product.precio_rebajado! / product.precio) * 100)}%
              </Badge>
            )}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.descripcion}</p>

          {/* Características específicas por tipo */}
          {product.tipo === 'instalacion' && product.duracion_instalacion_min && (
            <Card className="mb-6">
              <CardContent className="p-4 flex items-center gap-3">
                <Wrench className="h-5 w-5 text-[#2D7FF9]" />
                <div>
                  <p className="font-medium text-sm">Duración estimada</p>
                  <p className="text-gray-500 text-sm">{product.duracion_instalacion_min} minutos</p>
                </div>
              </CardContent>
            </Card>
          )}

          {product.tipo === 'pack' && includedProducts.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-5 w-5 text-[#2D7FF9]" />
                  <p className="font-medium text-sm">Incluye:</p>
                </div>
                <ul className="space-y-2">
                  {includedProducts.map((p) => (
                    <li key={p!.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-[#22C55E] shrink-0" />
                      {p!.nombre}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Acciones */}
          <div className="space-y-3">
            {product.tipo === 'dropshipping' && (
              <Button size="lg" className="w-full" onClick={() => addItem(product)}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Añadir al carrito
              </Button>
            )}
            {product.tipo === 'afiliado' && (
              <a href={product.url_afiliado} target="_blank" rel="noopener noreferrer" className="block">
                <Button size="lg" variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Ver en {product.nombre_tienda_afiliado}
                </Button>
              </a>
            )}
            {product.tipo === 'instalacion' && (
              <Button size="lg" variant="secondary" className="w-full">
                <Wrench className="mr-2 h-5 w-5" />
                Reservar instalación
              </Button>
            )}
            {product.tipo === 'pack' && (
              <Button size="lg" className="w-full" onClick={() => addItem(product)}>
                <Package className="mr-2 h-5 w-5" />
                Añadir pack al carrito
              </Button>
            )}
          </div>

          {/* Stock */}
          {product.tipo === 'dropshipping' && (
            <p className="mt-4 text-sm text-gray-500">
              {product.stock > 10 ? (
                <span className="text-[#22C55E]">✓ En stock</span>
              ) : product.stock > 0 ? (
                <span className="text-yellow-600">⚠️ Últimas {product.stock} unidades</span>
              ) : (
                <span className="text-red-600">✗ Sin stock</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
