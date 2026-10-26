import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/catalogo" className="inline-flex items-center text-sm text-gray-500 hover:text-[#2D7FF9] mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagen placeholder */}
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
          <span className="text-8xl">📷</span>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-4">
            Producto: {slug}
          </h1>

          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="text-gray-600">
                Aquí se mostrará la descripción completa del producto, precio, características
                y opciones de compra.
              </p>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full">
            Añadir al carrito
          </Button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-blue-800">
              🔧 <strong>Paso 1:</strong> Esta página se conectará a Supabase para cargar el producto real por slug.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
