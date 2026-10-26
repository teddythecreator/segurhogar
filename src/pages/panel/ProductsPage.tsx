import { Card, CardContent } from '@/components/ui/Card';

export function ProductsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Productos</h1>
        <p className="text-gray-500 text-sm">Gestión del catálogo de productos</p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">🛍️</div>
          <p className="text-gray-600 mb-2">
            Esta sección se implementará en el siguiente paso del proyecto.
          </p>
          <p className="text-sm text-gray-400">
            Incluirá: lista de productos, crear/editar producto, categorías, imágenes, estados, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
