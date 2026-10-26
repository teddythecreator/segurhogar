import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { PRODUCT_TYPE_LABELS } from '@/types/database';
import type { ProductType, ProductStatus } from '@/types/database';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState<ProductType | ''>('');
  const [categoriaId, setCategoriaId] = useState('');
  const [estado, setEstado] = useState<ProductStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({
    search: search || undefined,
    tipo: tipo || undefined,
    categoria_id: categoriaId || undefined,
    estado: estado || undefined,
    page,
    limit: 20,
  });

  const { data: categories } = useCategories();
  const deleteMutation = useDeleteProduct();

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar el producto "${nombre}"?`)) return;
    
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      alert('Error al eliminar: ' + (error as Error).message);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setTipo('');
    setCategoriaId('');
    setEstado('');
    setPage(1);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">Productos</h1>
          <p className="text-gray-500 text-sm">Gestión del catálogo de productos</p>
        </div>
        <Link to="/panel/productos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo producto
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#2D7FF9]" />
            <h2 className="font-semibold text-[#0B1F3A]">Filtros</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nombre o slug..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value as ProductType | '');
                  setPage(1);
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
              >
                <option value="">Todos los tipos</option>
                <option value="dropshipping">Dropshipping</option>
                <option value="afiliado">Afiliado</option>
                <option value="servicio">Servicio</option>
                <option value="pack">Pack</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={categoriaId}
                onChange={(e) => {
                  setCategoriaId(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
              >
                <option value="">Todas las categorías</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => {
                  setEstado(e.target.value as ProductStatus | '');
                  setPage(1);
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
              >
                <option value="">Todos los estados</option>
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>
          </div>

          {(search || tipo || categoriaId || estado) && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de productos */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D7FF9] mx-auto"></div>
            </div>
          ) : !data || data.products.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No hay productos</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Tipo</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Categoría</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-[#0B1F3A]">{product.nombre}</p>
                            <p className="text-xs text-gray-500">{product.slug}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge variant="info">
                            {PRODUCT_TYPE_LABELS[product.tipo]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                          {product.categoria?.nombre || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{product.precio}€</p>
                            {product.precio_rebajado && (
                              <p className="text-xs text-green-600">
                                Rebajado: {product.precio_rebajado}€
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={product.estado === 'publicado' ? 'success' : 'default'}>
                            {product.estado === 'publicado' ? 'Publicado' : 'Borrador'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/producto/${product.slug}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/panel/productos/${product.id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product.id, product.nombre)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Mostrando {(page - 1) * 20 + 1}-{Math.min(page * 20, data.total)} de {data.total} productos
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
