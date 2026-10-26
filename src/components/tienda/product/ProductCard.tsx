import { Link } from 'react-router-dom';
import { ShoppingCart, ExternalLink, Wrench, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_TYPE_LABELS } from '@/types/database';
import type { Product } from '@/types/database';

interface ProductCardProps {
  product: Product & { imagenes?: { url: string; orden: number; alt: string | null }[] };
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const price = product.precio_rebajado ?? product.precio;
  const hasDiscount = product.precio_rebajado !== undefined;
  
  // Imagen principal (la de orden 0 o la primera)
  const mainImage = product.imagenes?.sort((a, b) => a.orden - b.orden)[0]?.url;

  const typeIcons = {
    dropshipping: <ShoppingCart className="h-3.5 w-3.5" />,
    afiliado: <ExternalLink className="h-3.5 w-3.5" />,
    servicio: <Wrench className="h-3.5 w-3.5" />,
    pack: <Package className="h-3.5 w-3.5" />,
  };

  const typeBadgeVariant = {
    dropshipping: 'info' as const,
    afiliado: 'default' as const,
    servicio: 'warning' as const,
    pack: 'success' as const,
  };

  const emoji = {
    camaras: '📷',
    alarmas: '🚨',
    cerraduras: '🔐',
    detectores: '🔔',
    routers: '📡',
    vpn: '🛡️',
    antivirus: '💻',
    llaves_seguridad: '🔑',
    packs: '📦',
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow group">
      {/* Imagen */}
      <Link to={`/producto/${product.slug}`} className="block">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <span className="text-5xl">
              {product.categoria ? emoji[product.categoria.slug as keyof typeof emoji] || '📦' : '📦'}
            </span>
          )}
        </div>
      </Link>

      <CardContent className="flex-1 flex flex-col p-4">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant={typeBadgeVariant[product.tipo]}>
            <span className="flex items-center gap-1">
              {typeIcons[product.tipo]}
              {PRODUCT_TYPE_LABELS[product.tipo]}
            </span>
          </Badge>
          {hasDiscount && <Badge variant="danger">Oferta</Badge>}
        </div>

        {/* Título */}
        <Link to={`/producto/${product.slug}`} className="block mb-2">
          <h3 className="font-semibold text-[#0B1F3A] text-sm leading-tight hover:text-[#2D7FF9] transition-colors line-clamp-2">
            {product.nombre}
          </h3>
        </Link>

        {/* Descripción corta */}
        {product.descripcion_corta && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">
            {product.descripcion_corta}
          </p>
        )}

        {/* Precio */}
        <div className="flex items-baseline gap-2 mt-auto mb-3">
          <span className="text-lg font-bold text-[#0B1F3A]">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.precio)}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto">IVA incl.</span>
        </div>

        {/* Acción */}
        <div>
          {product.tipo === 'dropshipping' || product.tipo === 'pack' ? (
            <Button
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                const result = addItem(product);
                if (!result.success && result.error) {
                  alert(result.error);
                }
              }}
            >
              <ShoppingCart className="mr-1 h-3.5 w-3.5" />
              Añadir al carrito
            </Button>
          ) : product.tipo === 'afiliado' ? (
            <a
              href={product.url_afiliado || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="sm" variant="outline" className="w-full">
                Ver en {product.tienda_afiliado || 'tienda'}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </a>
          ) : (
            <Link to={`/producto/${product.slug}`}>
              <Button size="sm" variant="secondary" className="w-full">
                <Wrench className="mr-1 h-3.5 w-3.5" />
                Reservar
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
