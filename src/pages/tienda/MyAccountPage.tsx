import { Link } from 'react-router-dom';
import { User, Package, Calendar, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLE_LABELS } from '@/types/database';

export function MyAccountPage() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Mi cuenta</h1>
        <p className="text-gray-500 text-sm">Gestiona tu información personal y tus pedidos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Perfil */}
        <Card className="md:col-span-1">
          <CardHeader>
            <h2 className="font-semibold text-[#0B1F3A]">Perfil</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#2D7FF9] flex items-center justify-center text-white font-bold text-lg">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[#0B1F3A]">{user.nombre}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info">{USER_ROLE_LABELS[user.role]}</Badge>
            </div>
            {user.telefono && (
              <p className="text-sm text-gray-600">📞 {user.telefono}</p>
            )}
            <Link to="/mi-cuenta/editar">
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Editar perfil
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Accesos rápidos */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/mi-cuenta/pedidos" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-[#2D7FF9] hover:bg-blue-50 transition-colors">
                    <Package className="h-8 w-8 text-[#2D7FF9]" />
                    <div>
                      <p className="font-medium text-[#0B1F3A]">Mis pedidos</p>
                      <p className="text-xs text-gray-500">Ver historial y estado</p>
                    </div>
                  </div>
                </Link>
                <Link to="/mi-cuenta/instalaciones" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-[#2D7FF9] hover:bg-blue-50 transition-colors">
                    <Calendar className="h-8 w-8 text-[#2D7FF9]" />
                    <div>
                      <p className="font-medium text-[#0B1F3A]">Mis instalaciones</p>
                      <p className="text-xs text-gray-500">Ver instalaciones programadas</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">
                Esta sección se completará en los siguientes pasos del proyecto.
              </p>
              <p className="text-xs text-gray-400">
                Aquí podrás ver tus pedidos, instalaciones y datos personales.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cerrar sesión */}
      <div className="mt-8 text-center">
        <Button variant="ghost" onClick={handleSignOut} className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
