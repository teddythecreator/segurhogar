import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations';

export function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();

  const redirectTo = searchParams.get('redirect') || null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setIsLoading(true);

    // MODO DEMO: Autenticación simulada
    const { demoUsers } = await import('@/data/demo');
    const demoUser = demoUsers.find(
      (u) => u.email === data.email && data.password === 'demo1234'
    );

    if (demoUser) {
      // Login exitoso en modo demo
      const { useAuthStore } = await import('@/stores/auth-store');
      useAuthStore.getState().setUser(demoUser);
      
      setIsLoading(false);
      
      // Redirigir según el rol
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/auth/redirect');
      }
      return;
    }

    // Si no es demo, intentar con Supabase
    const { error } = await signIn(data.email, data.password);

    if (error) {
      setError('Email o contraseña incorrectos. En modo demo usa: admin@segurhogar.es / demo1234');
      setIsLoading(false);
      return;
    }

    // Redirigir según el rol del usuario
    if (redirectTo) {
      navigate(redirectTo);
    } else {
      navigate('/auth/redirect');
    }
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
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Acceder a tu cuenta</h1>
            <p className="text-gray-500 text-sm mt-1">Introduce tus credenciales</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-10 h-4 w-4 text-gray-400" />
              <Input
                label="Email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-10 h-4 w-4 text-gray-400" />
              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Acceder
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/recuperar-contrasena"
              className="text-sm text-[#2D7FF9] hover:underline block"
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-[#2D7FF9] hover:underline font-medium">
                Regístrate
              </Link>
            </p>
          </div>

          {/* Credenciales Demo */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">🎮 MODO DEMO - Credenciales de prueba:</p>
            <div className="space-y-1 text-xs text-blue-800">
              <p><strong>Admin:</strong> admin@segurhogar.es / demo1234</p>
              <p><strong>Gestor:</strong> gestor@segurhogar.es / demo1234</p>
              <p><strong>Instalador:</strong> instalador@segurhogar.es / demo1234</p>
              <p><strong>Cliente:</strong> cliente@segurhogar.es / demo1234</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
