import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-[#2D7FF9] mb-4">404</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-2">
          Página no encontrada
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          La página que buscas no existe o ha sido movida. Vuelve al inicio para continuar navegando.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
          <Link to="/catalogo">
            <Button variant="outline">Ir al catálogo</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
