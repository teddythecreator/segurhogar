import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/auth-store';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulación de login (en producción se usará Supabase Auth)
    setTimeout(() => {
      const demoUsers: Record<string, { nombre: string; role: 'admin' | 'gestor_pedidos' | 'instalador' }> = {
        'admin@segurhogar.es': { nombre: 'Admin SegurHogar', role: 'admin' },
        'gestor@segurhogar.es': { nombre: 'Gestor Pedidos', role: 'gestor_pedidos' },
        'instalador@segurhogar.es': { nombre: 'Técnico Instalador', role: 'instalador' },
      };

      const demoUser = demoUsers[email.toLowerCase()];
      if (demoUser && password === 'demo1234') {
        setUser({
          id: 'user-' + Date.now(),
          email,
          nombre: demoUser.nombre,
          role: demoUser.role,
          creado_en: new Date().toISOString(),
        });
        navigate('/panel');
      } else {
        setError('Email o contraseña incorrectos. Prueba con admin@segurhogar.es / demo1234');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] to-[#152d4f] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-[#2D7FF9]" />
              <span className="text-xl font-bold text-[#0B1F3A]">SegurHogar</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Acceder al panel</h1>
            <p className="text-gray-500 text-sm mt-1">Introduce tus credenciales</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-10 h-4 w-4 text-gray-400" />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-10 h-4 w-4 text-gray-400" />
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Acceder
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p><span className="font-mono">admin@segurhogar.es</span> / demo1234</p>
              <p><span className="font-mono">gestor@segurhogar.es</span> / demo1234</p>
              <p><span className="font-mono">instalador@segurhogar.es</span> / demo1234</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
