import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, ExternalLink, Wrench, 
  Package, Truck, Shield, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { ProductGallery } from '@/components/tienda/product/ProductGallery';
import { ProductCard } from '@/components/tienda/product/ProductCard';
import { usePublicProduct, useRelatedProducts } from '@/hooks/usePublicProducts';
import { useCartStore } from '@/stores/cart-store';
import { useTrackAffiliateClick } from '@/hooks/useAffiliate';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_TYPE_LABELS } from '@/types/database';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = usePublicProduct(slug || null);
  const addItem = useCartStore((s) => s.addItem);
  const trackClick = useTrackAffiliateClick();
  
  const [addInstallation, setAddInstallation] = useState(false);
  const [activeTab, setActiveTab] = useState<'descripcion' | 'especificaciones' | 'envio'>('descripcion');

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-4">Producto no encontrado</h1>
        <Link to="/catalogo">
          <Button>Volver al catálogo</Button>
        </Link>
      </div>
    );
  }

  const price = product.precio_rebajado ?? product.precio;
  const hasDiscount = product.precio_rebajado !== undefined;
  const emoji = {
    camaras: '📷', alarmas: '🚨', cerraduras: '🔐', detectores: '🔔',
    routers: '📡', vpn: '🛡️', antivirus: '💻', llaves_seguridad: '🔑', packs: '📦',
  };
  const fallbackEmoji = product.categoria ? emoji[product.categoria.slug as keyof typeof emoji] || '📦' : '📦';

  // Productos relacionados
  const { data: relatedProducts } = useRelatedProducts(
    product.id,
    product.categoria_id,
    4
  );

  const handleAffiliateClick = () => {
    trackClick.mutate({ productId: product.id });
    // La navegación se hace con el enlace <a>
  };

  const handleAddToCart = () => {
    addItem(product);
    // TODO: Si addInstallation es true, añadir también el servicio de instalación
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link to="/catalogo" className="inline-flex items-center text-sm text-gray-500 hover:text-[#2D7FF9] mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Galería */}
        <ProductGallery
          images={product.imagenes || []}
          productName={product.nombre}
          fallbackEmoji={fallbackEmoji}
        />

        {/* Info */}
        <div>
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="info">{PRODUCT_TYPE_LABELS[product.tipo]}</Badge>
            {product.categoria && (
              <Badge variant="default">{product.categoria.nombre}</Badge>
            )}
            {hasDiscount && <Badge variant="danger">Oferta</Badge>}
          </div>

          {/* Título */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-4">
            {product.nombre}
          </h1>

          {/* Precio */}
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-bold text-[#0B1F3A]">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.precio)}</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-6">IVA incluido</p>

          {/* Descripción corta */}
          {product.descripcion_corta && (
            <p className="text-gray-600 mb-6 leading-relaxed">{product.descripcion_corta}</p>
          )}

          {/* Plazo de entrega */}
          {product.plazo_entrega_dias && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg">
              <Truck className="h-5 w-5 text-[#2D7FF9]" />
              <div>
                <p className="text-sm font-medium text-[#0B1F3A]">Plazo de entrega estimado</p>
                <p className="text-xs text-gray-600">{product.plazo_entrega_dias} días laborables</p>
              </div>
            </div>
          )}

          {/* Acciones según tipo */}
          <div className="space-y-3 mb-6">
            {product.tipo === 'afiliado' ? (
              <>
                <a
                  href={product.url_afiliado || '#'}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  onClick={handleAffiliateClick}
                  className="block"
                >
                  <Button size="lg" variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Ver en {product.tienda_afiliado || 'tienda externa'}
                  </Button>
                </a>
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0" />
                  <p className="text-yellow-800">
                    <strong>Enlace de afiliado:</strong> Serás redirigido a {product.tienda_afiliado || 'la tienda externa'} para completar la compra.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Button size="lg" className="w-full" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Añadir al carrito
                </Button>

                {/* Opción de instalación (solo para productos comprables) */}
                {(product.tipo === 'dropshipping' || product.tipo === 'pack') && (
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={addInstallation}
                      onChange={(e) => setAddInstallation(e.target.checked)}
                      className="mt-1 h-4 w-4 text-[#2D7FF9] rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-[#2D7FF9]" />
                        <span className="font-medium text-sm text-[#0B1F3A]">
                          Añadir instalación profesional
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Un técnico instalará y configurará el producto en tu domicilio
                      </p>
                    </div>
                  </label>
                )}
              </>
            )}
          </div>

          {/* Garantías */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-[#22C55E]" />
              <span>Garantía 3 años</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-[#22C55E]" />
              <span>Soporte en español</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de información */}
      <div className="mb-12">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('descripcion')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'descripcion'
                  ? 'border-[#2D7FF9] text-[#2D7FF9]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Descripción
            </button>
            <button
              onClick={() => setActiveTab('especificaciones')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'especificaciones'
                  ? 'border-[#2D7FF9] text-[#2D7FF9]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Especificaciones
            </button>
            <button
              onClick={() => setActiveTab('envio')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'envio'
                  ? 'border-[#2D7FF9] text-[#2D7FF9]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Envío e instalación
            </button>
          </nav>
        </div>

        <div className="bg-white rounded-xl border p-6">
          {activeTab === 'descripcion' && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.descripcion_completa || product.descripcion_corta || 'Sin descripción adicional.'}
              </p>
            </div>
          )}

          {activeTab === 'especificaciones' && (
            <div>
              {product.especificaciones && Object.keys(product.especificaciones).length > 0 ? (
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    {Object.entries(product.especificaciones).map(([key, value]) => (
                      <tr key={key}>
                        <td className="py-2 pr-4 font-medium text-gray-700 capitalize w-1/3">
                          {key.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2 text-gray-600">
                          {typeof value === 'boolean' 
                            ? (value ? 'Sí' : 'No')
                            : Array.isArray(value) 
                              ? value.join(', ')
                              : String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay especificaciones disponibles para este producto.
                </p>
              )}
            </div>
          )}

          {activeTab === 'envio' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-[#2D7FF9] mt-0.5" />
                <div>
                  <p className="font-medium text-[#0B1F3A]">Envío</p>
                  <p className="text-sm text-gray-600">
                    {product.plazo_entrega_dias
                      ? `Plazo estimado: ${product.plazo_entrega_dias} días laborables`
                      : 'Plazo estándar: 3-7 días laborables'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wrench className="h-5 w-5 text-[#2D7FF9] mt-0.5" />
                <div>
                  <p className="font-medium text-[#0B1F3A]">Instalación profesional</p>
                  <p className="text-sm text-gray-600">
                    Servicio opcional de instalación a domicilio. Nuestros técnicos certificados se encargan de todo.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-[#2D7FF9] mt-0.5" />
                <div>
                  <p className="font-medium text-[#0B1F3A]">Devoluciones</p>
                  <p className="text-sm text-gray-600">
                    30 días para devoluciones sin preguntas. Contacta con nuestro soporte para gestionar la devolución.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Productos relacionados */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] mb-4">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
