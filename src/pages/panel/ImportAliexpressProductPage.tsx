import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImportAliexpressProduct, useAliexpressConfig } from '@/hooks/useAliexpress';
import { useCreateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Search, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { generateSlug } from '@/lib/slug';
import type { AliexpressProductData } from '@/hooks/useAliexpress';

export function ImportAliexpressProductPage() {
  const navigate = useNavigate();
  const [productId, setProductId] = useState('');
  const [importedProduct, setImportedProduct] = useState<AliexpressProductData | null>(null);
  const [marginPercent, setMarginPercent] = useState(30);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const importProduct = useImportAliexpressProduct();
  const createProduct = useCreateProduct();
  const { data: categories } = useCategories();
  const { data: config } = useAliexpressConfig();

  // Extraer ID de producto de URL o texto
  const extractProductId = (input: string): string => {
    // URL: https://www.aliexpress.com/item/1005006789012345.html
    const urlMatch = input.match(/item\/(\d+)/);
    if (urlMatch) return urlMatch[1];
    
    // Solo número
    const numMatch = input.match(/^(\d+)$/);
    if (numMatch) return numMatch[1];
    
    return input.trim();
  };

  const handleImport = async () => {
    const id = extractProductId(productId);
    if (!id) {
      alert('Introduce un ID o URL de AliExpress válido');
      return;
    }

    try {
      const data = await importProduct.mutateAsync(id);
      setImportedProduct(data as AliexpressProductData);
      
      // Establecer margen por defecto de la config
      const defaultMargin = Number((config as any)?.default_margin_percent || 30);
      setMarginPercent(defaultMargin);
    } catch (error) {
      alert('Error al importar: ' + (error as Error).message);
    }
  };

  const handleSave = async () => {
    if (!importedProduct) return;

    try {
      const costPrice = parseFloat(importedProduct.product_price || '0');
      const salePrice = costPrice * (1 + marginPercent / 100);

      // Crear producto en nuestra BD
      const newProduct = await createProduct.mutateAsync({
        nombre: importedProduct.product_title,
        slug: generateSlug(importedProduct.product_title),
        descripcion_corta: importedProduct.product_description?.substring(0, 200) || '',
        descripcion_completa: importedProduct.product_description || '',
        tipo: 'dropshipping',
        categoria_id: selectedCategory || null,
        precio: salePrice,
        precio_coste: costPrice,
        estado: 'borrador',
        id_aliexpress: importedProduct.product_id,
        aliexpress_product_id: importedProduct.product_id,
        aliexpress_last_price: costPrice,
        aliexpress_last_sync: new Date().toISOString(),
        plazo_entrega_dias: 15,
        stock: parseInt(importedProduct.product_stock || '0'),
        activo: true,
        especificaciones: {
          source: 'aliexpress',
          sku_attributes: importedProduct.sku_attributes || [],
        },
      });

      alert('Producto importado correctamente como borrador');
      navigate(`/panel/productos/${newProduct.id}`);
    } catch (error) {
      alert('Error al guardar: ' + (error as Error).message);
    }
  };

  const costPrice = importedProduct ? parseFloat(importedProduct.product_price || '0') : 0;
  const salePrice = costPrice * (1 + marginPercent / 100);
  const margin = salePrice - costPrice;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Importar producto de AliExpress</h1>
        <p className="text-gray-500 text-sm">Pega la URL o ID de un producto de AliExpress para importarlo</p>
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[#0B1F3A]">Buscar producto</h2>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="https://www.aliexpress.com/item/1005006789012345.html o ID del producto"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleImport()}
            />
            <Button
              onClick={handleImport}
              disabled={!productId.trim()}
              isLoading={importProduct.isPending}
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Producto importado */}
      {importedProduct && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-[#0B1F3A]">Producto encontrado</h2>
                <CheckCircle className="h-5 w-5 text-[#22C55E]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Imágenes */}
                <div>
                  {importedProduct.product_images && importedProduct.product_images.length > 0 ? (
                    <div className="space-y-2">
                      <img
                        src={importedProduct.product_images[0]}
                        alt={importedProduct.product_title}
                        className="w-full aspect-square object-cover rounded-lg bg-gray-100"
                      />
                      {importedProduct.product_images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {importedProduct.product_images.slice(1, 5).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt=""
                              className="h-16 w-16 object-cover rounded flex-shrink-0"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">ID AliExpress</p>
                    <p className="font-mono text-sm">{importedProduct.product_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium">{importedProduct.product_title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Precio AliExpress</p>
                    <p className="font-bold text-lg">{costPrice.toFixed(2)} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stock disponible</p>
                    <p className="font-medium">{importedProduct.product_stock || 'N/A'}</p>
                  </div>
                  {importedProduct.category_name && (
                    <div>
                      <p className="text-sm text-gray-500">Categoría AE</p>
                      <p className="text-sm">{importedProduct.category_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de importación */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-[#0B1F3A]">Configurar importación</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Margen de beneficio (%)
                  </label>
                  <Input
                    type="number"
                    value={marginPercent}
                    onChange={(e) => setMarginPercent(parseFloat(e.target.value) || 0)}
                    min={0}
                    max={500}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                  >
                    <option value="">Sin categoría</option>
                    {(categories || []).map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cálculo de precio */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-[#0B1F3A] mb-3">Cálculo de precio</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio de coste:</span>
                    <span className="font-medium">{costPrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Margen ({marginPercent}%):</span>
                    <span className="font-medium text-[#22C55E]">+{margin.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Precio de venta:</span>
                    <span className="font-bold text-lg">{salePrice.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-sm text-yellow-900">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  El producto se guardará como <strong>borrador</strong>. Podrás editarlo antes de publicarlo.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  isLoading={createProduct.isPending}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Importar como borrador
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportedProduct(null);
                    setProductId('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
