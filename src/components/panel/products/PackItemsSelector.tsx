import { useState, useEffect } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types/database';

interface PackItemsSelectorProps {
  value: { product_id: string; cantidad: number }[];
  onChange: (items: { product_id: string; cantidad: number }[]) => void;
  currentProductId?: string; // Para excluir el pack actual
}

interface PackItemWithProduct {
  product_id: string;
  cantidad: number;
  product?: Product;
}

export function PackItemsSelector({ 
  value, 
  onChange,
  currentProductId 
}: PackItemsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Obtener productos disponibles (excluyendo packs y el pack actual)
  const { data: productsData } = useProducts({ 
    limit: 100,
    tipo: undefined // Mostrar todos los tipos excepto el actual
  });

  // Filtrar productos disponibles
  const availableProducts = (productsData?.products || [])
    .filter((p) => p.tipo !== 'pack') // No incluir packs en packs
    .filter((p) => p.id !== currentProductId) // No incluir el pack actual
    .filter((p) => 
      !searchTerm || 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Enriquecer items con datos del producto
  const itemsWithProducts: PackItemWithProduct[] = value.map((item) => ({
    ...item,
    product: productsData?.products.find((p) => p.id === item.product_id),
  }));

  // Calcular precio total sugerido
  const precioSugerido = itemsWithProducts.reduce((total, item) => {
    const productPrice = item.product?.precio || 0;
    return total + (productPrice * item.cantidad);
  }, 0);

  const handleAddProduct = (productId: string) => {
    const existing = value.find((item) => item.product_id === productId);
    if (existing) {
      // Incrementar cantidad
      onChange(
        value.map((item) =>
          item.product_id === productId
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      // Añadir nuevo item
      onChange([...value, { product_id: productId, cantidad: 1 }]);
    }
    setSearchTerm('');
  };

  const handleRemoveProduct = (productId: string) => {
    onChange(value.filter((item) => item.product_id !== productId));
  };

  const handleUpdateCantidad = (productId: string, cantidad: number) => {
    if (cantidad <= 0) {
      handleRemoveProduct(productId);
    } else {
      onChange(
        value.map((item) =>
          item.product_id === productId ? { ...item, cantidad } : item
        )
      );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Productos del pack
        </label>
        
        {/* Buscador de productos */}
        <div className="relative mb-3">
          <Input
            placeholder="Buscar producto para añadir..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Lista desplegable de resultados */}
          {searchTerm && availableProducts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {availableProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleAddProduct(product.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <p className="text-sm font-medium text-gray-900">{product.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {product.tipo} • {product.precio}€
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de productos seleccionados */}
        {itemsWithProducts.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No hay productos en el pack. Busca y añade productos arriba.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {itemsWithProducts.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.product?.nombre || 'Producto eliminado'}
                  </p>
                  {item.product && (
                    <p className="text-xs text-gray-500">
                      {item.product.tipo} • {item.product.precio}€ c/u
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => handleUpdateCantidad(item.product_id, parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProduct(item.product_id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Precio total sugerido */}
        {itemsWithProducts.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-medium">Precio total sugerido:</span>{' '}
              <span className="font-bold">{precioSugerido.toFixed(2)}€</span>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Puedes ajustar el precio del pack en el campo principal
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
