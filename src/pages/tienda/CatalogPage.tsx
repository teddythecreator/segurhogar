import { Card, CardContent } from '@/components/ui/Card';

export function CatalogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-2">Catálogo</h1>
      <p className="text-gray-500 mb-8">
        Explora nuestros productos de seguridad física y digital.
      </p>

      {/* Placeholder: aquí irá el catálogo real conectado a Supabase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <CardContent className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-6 bg-gray-200 rounded w-1/3 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
        <p className="text-sm text-blue-800">
          🔧 <strong>Paso 1 completado:</strong> Esta página se conectará a Supabase en los siguientes pasos para mostrar productos reales.
        </p>
      </div>
    </div>
  );
}
