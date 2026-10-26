import { Link } from 'react-router-dom';
import { Check, ShoppingCart, ArrowRight, Users, Home, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePublicProducts } from '@/hooks/usePublicProducts';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/database';

export function PacksPage() {
  const { data, isLoading } = usePublicProducts({ tipo: 'pack', limit: 20 });
  const addItem = useCartStore((s) => s.addItem);

  // Agrupar packs por perfil recomendado
  const packsPorPerfil = {
    familia: data?.products.filter((p) => p.perfiles_recomendados.includes('familia') || p.perfiles_recomendados.includes('todos')) || [],
    mayor: data?.products.filter((p) => p.perfiles_recomendados.includes('mayor') || p.perfiles_recomendados.includes('todos')) || [],
    negocio: data?.products.filter((p) => p.perfiles_recomendados.includes('negocio') || p.perfiles_recomendados.includes('todos')) || [],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <Badge variant="info" className="mb-3">Todo incluido</Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] mb-4">
          Packs de seguridad
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Productos + instalación profesional a precio cerrado. La forma más fácil de proteger lo que importa.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7FF9] mx-auto"></div>
        </div>
      ) : !data || data.products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">Aún no hay packs disponibles</p>
            <Link to="/catalogo">
              <Button variant="outline">Ver catálogo completo</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tabla comparativa por perfil */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-6 text-center">
              Compara nuestros packs
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProfileColumn
                icon={<Home className="h-6 w-6" />}
                title="Familias"
                color="bg-blue-50 text-[#2D7FF9]"
                packs={packsPorPerfil.familia}
                onAddToCart={addItem}
              />
              <ProfileColumn
                icon={<Users className="h-6 w-6" />}
                title="Personas mayores"
                color="bg-pink-50 text-pink-600"
                packs={packsPorPerfil.mayor}
                onAddToCart={addItem}
              />
              <ProfileColumn
                icon={<Building2 className="h-6 w-6" />}
                title="Negocios"
                color="bg-green-50 text-[#22C55E]"
                packs={packsPorPerfil.negocio}
                onAddToCart={addItem}
              />
            </div>
          </div>

          {/* Todos los packs */}
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F3A] mb-6">
              Todos los packs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.products.map((pack) => (
                <PackCard key={pack.id} pack={pack} onAddToCart={addItem} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ProfileColumn({ icon, title, color, packs, onAddToCart }: {
  icon: React.ReactNode;
  title: string;
  color: string;
  packs: Product[];
  onAddToCart: (product: Product) => void;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
          {icon}
        </div>
        <h3 className="font-bold text-[#0B1F3A] text-lg mb-4">{title}</h3>
        
        {packs.length === 0 ? (
          <p className="text-sm text-gray-500">Próximamente</p>
        ) : (
          <div className="space-y-3">
            {packs.slice(0, 3).map((pack) => {
              const price = pack.precio_rebajado ?? pack.precio;
              return (
                <div key={pack.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <Link to={`/producto/${pack.slug}`} className="block">
                    <p className="font-medium text-[#0B1F3A] text-sm hover:text-[#2D7FF9]">
                      {pack.nombre}
                    </p>
                  </Link>
                  <p className="text-lg font-bold text-[#2D7FF9] mt-1">
                    {formatPrice(price)}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => onAddToCart(pack)}
                  >
                    <ShoppingCart className="mr-1 h-3 w-3" />
                    Añadir
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PackCard({ pack, onAddToCart }: {
  pack: Product;
  onAddToCart: (product: Product) => void;
}) {
  const price = pack.precio_rebajado ?? pack.precio;
  const hasDiscount = pack.precio_rebajado !== undefined;

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <Badge variant="success" className="mb-3 self-start">Pack</Badge>
        
        <h3 className="font-bold text-[#0B1F3A] text-lg mb-2">{pack.nombre}</h3>
        
        {pack.descripcion_corta && (
          <p className="text-sm text-gray-600 mb-4 flex-1">{pack.descripcion_corta}</p>
        )}

        {/* Productos incluidos */}
        {pack.pack_items && pack.pack_items.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Incluye:</p>
            <ul className="space-y-1">
              {pack.pack_items.slice(0, 4).map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="h-3.5 w-3.5 text-[#22C55E] shrink-0" />
                  <span className="truncate">{item.product?.nombre || 'Producto'}</span>
                </li>
              ))}
              {pack.pack_items.length > 4 && (
                <li className="text-xs text-gray-500">
                  +{pack.pack_items.length - 4} productos más
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Beneficios */}
        <div className="space-y-1 mb-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Check className="h-3 w-3 text-[#22C55E]" />
            <span>Instalación profesional incluida</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3 w-3 text-[#22C55E]" />
            <span>Garantía de 3 años</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3 w-3 text-[#22C55E]" />
            <span>Soporte técnico</span>
          </div>
        </div>

        {/* Precio y CTA */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-[#0B1F3A]">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(pack.precio)}</span>
            )}
          </div>
          <Button className="w-full" onClick={() => onAddToCart(pack)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Añadir al carrito
          </Button>
          <Link to={`/producto/${pack.slug}`} className="block mt-2">
            <Button variant="ghost" size="sm" className="w-full">
              Ver detalles <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
