import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProductCard } from '@/components/tienda/product/ProductCard';
import { usePublicProducts } from '@/hooks/usePublicProducts';
import { useCategories } from '@/hooks/useCategories';
import { PRODUCT_TYPE_LABELS } from '@/types/database';
import { useSEO } from '@/hooks/useSEO';
import type { ProductType, RecommendedProfile } from '@/types/database';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  useSEO({
    title: 'Catálogo de productos de seguridad - SegurHogar',
    description:
      'Explora nuestro catálogo de productos de seguridad física y digital. Cámaras, alarmas, cerraduras inteligentes, VPN y más. Envío a toda España.',
    keywords: 'catálogo seguridad, productos seguridad, cámaras, alarmas, cerraduras',
    canonical: 'https://[DOMINIO_WEB]/catalogo',
  });
  
  // Leer filtros de la URL
  const search = searchParams.get('search') || '';
  const categoria = searchParams.get('categoria') || '';
  const perfil = searchParams.get('perfil') || '';
  const tipo = searchParams.get('tipo') || '';
  const precioMin = searchParams.get('precio_min') || '';
  const precioMax = searchParams.get('precio_max') || '';
  const ordenar = searchParams.get('ordenar') || 'recientes';
  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading } = usePublicProducts({
    search: search || undefined,
    categoria_slug: categoria || undefined,
    perfil: (perfil as RecommendedProfile) || undefined,
    tipo: (tipo as ProductType) || undefined,
    precio_min: precioMin ? parseFloat(precioMin) : undefined,
    precio_max: precioMax ? parseFloat(precioMax) : undefined,
    ordenar: ordenar as any,
    page,
    limit: 12,
  });

  const { data: categories } = useCategories();

  // Actualizar filtros en la URL
  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Resetear página al cambiar filtros
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = search || categoria || perfil || tipo || precioMin || precioMax;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-2">Catálogo</h1>
        <p className="text-gray-500">
          {data ? `${data.total} productos encontrados` : 'Cargando...'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de filtros */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0B1F3A] flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#2D7FF9] hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nombre del producto..."
                    value={search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Perfil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perfil
                </label>
                <select
                  value={perfil}
                  onChange={(e) => updateFilter('perfil', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                >
                  <option value="">Todos los perfiles</option>
                  <option value="familia">Familias</option>
                  <option value="mayor">Personas mayores</option>
                  <option value="negocio">Negocios</option>
                  <option value="todos">Todos</option>
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de producto
                </label>
                <select
                  value={tipo}
                  onChange={(e) => updateFilter('tipo', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                >
                  <option value="">Todos los tipos</option>
                  {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(e) => updateFilter('categoria', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                >
                  <option value="">Todas las categorías</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rango de precio
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={precioMin}
                    onChange={(e) => updateFilter('precio_min', e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={precioMax}
                    onChange={(e) => updateFilter('precio_max', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid de productos */}
        <div className="lg:col-span-3">
          {/* Ordenación */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-lg border p-3">
            <p className="text-sm text-gray-600">
              {data ? `Mostrando ${data.products.length} de ${data.total} productos` : ''}
            </p>
            <select
              value={ordenar}
              onChange={(e) => updateFilter('ordenar', e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
            >
              <option value="recientes">Más recientes</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
          </div>

          {/* Productos */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-6 bg-gray-200 rounded w-1/3 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data || data.products.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <p className="text-gray-500 mb-4">No se encontraron productos con estos filtros</p>
              <Button variant="outline" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginación */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter('page', String(page - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600 px-3">
                    Página {page} de {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter('page', String(page + 1))}
                    disabled={page === data.totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
