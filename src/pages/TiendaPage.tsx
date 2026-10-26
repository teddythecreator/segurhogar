import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, ExternalLink, Wrench, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockProducts, categoryLabels, productTypeLabels } from '@/data/mock-products';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import type { ProductCategory, ProductType } from '@/types';

export function TiendaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('cat') || 'todas';
  const [activeType, setActiveType] = useState<string>('todos');
  const addItem = useCartStore((s) => s.addItem);

  const categories: { value: string; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
  ];

  const types: { value: string; label: string }[] = [
    { value: 'todos', label: 'Todos los tipos' },
    { value: 'dropshipping', label: '🛒 Compra directa' },
    { value: 'afiliado', label: '🔗 Enlace externo' },
    { value: 'instalacion', label: '🔧 Instalación' },
    { value: 'pack', label: '📦 Packs' },
  ];

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((p) => {
      const matchCategory = activeCategory === 'todas' || p.categoria === activeCategory;
      const matchType = activeType === 'todos' || p.tipo === activeType;
      return p.activo && matchCategory && matchType;
    });
  }, [activeCategory, activeType]);

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    addItem(product);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-6">Tienda</h1>

      {/* Filtros */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSearchParams(cat.value === 'todas' ? {} : { cat: cat.value })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.value
                  ? 'bg-[#2D7FF9] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type.value}
              onClick={() => setActiveType(type.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeType === type.value
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay productos en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAddToCart }: {
  product: typeof mockProducts[0];
  onAddToCart: (product: typeof mockProducts[0]) => void;
}) {
  const price = product.precio_rebajado ?? product.precio;
  const hasDiscount = product.precio_rebajado !== undefined;

  const typeIcons: Record<ProductType, React.ReactNode> = {
    dropshipping: <ShoppingCart className="h-3.5 w-3.5" />,
    afiliado: <ExternalLink className="h-3.5 w-3.5" />,
    instalacion: <Wrench className="h-3.5 w-3.5" />,
    pack: <Package className="h-3.5 w-3.5" />,
  };

  const typeBadgeVariant: Record<ProductType, 'default' | 'success' | 'warning' | 'info'> = {
    dropshipping: 'info',
    afiliado: 'default',
    instalacion: 'warning',
    pack: 'success',
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      {/* Imagen placeholder */}
      <Link to={`/producto/${product.id}`} className="block">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-4xl">
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
      </Link>

      <CardContent className="flex-1 flex flex-col p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={typeBadgeVariant[product.tipo]}>
            <span className="flex items-center gap-1">
              {typeIcons[product.tipo]}
              {productTypeLabels[product.tipo]}
            </span>
          </Badge>
          {hasDiscount && (
            <Badge variant="danger">Oferta</Badge>
          )}
        </div>

        <Link to={`/producto/${product.id}`} className="block mb-2">
          <h3 className="font-semibold text-[#0B1F3A] text-sm leading-tight hover:text-[#2D7FF9] transition-colors">
            {product.nombre}
          </h3>
        </Link>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">
          {product.descripcion_corta}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-lg font-bold text-[#0B1F3A]">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through ml-2">
                {formatPrice(product.precio)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3">
          {product.tipo === 'dropshipping' && (
            <Button size="sm" className="w-full" onClick={() => onAddToCart(product)}>
              Añadir al carrito
            </Button>
          )}
          {product.tipo === 'afiliado' && (
            <a href={product.url_afiliado} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="w-full">
                Ver en {product.nombre_tienda_afiliado}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </a>
          )}
          {product.tipo === 'instalacion' && (
            <Link to={`/producto/${product.id}`}>
              <Button size="sm" variant="secondary" className="w-full">
                Reservar instalación
              </Button>
            </Link>
          )}
          {product.tipo === 'pack' && (
            <Button size="sm" className="w-full" onClick={() => onAddToCart(product)}>
              Añadir pack
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
