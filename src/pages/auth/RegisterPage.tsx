import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/lib/validations';

export function RegisterPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setIsLoading(true);

    const { error } = await signUp(data.email, data.password, data.nombre);

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este email ya está registrado');
      } else {
        setError(error.message || 'Error al registrarse');
      }
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] to-[#152d4f] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-[#22C55E]" />
            </div>
            <h2 className="text-xl font-bold text-[#0B1F3A] mb-2">¡Registro completado!</h2>
            <p className="text-gray-600 mb-6">
              Hemos enviado un email de confirmación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            </p>
            <Button onClick={() => navigate('/login')}>
              Ir al login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] to-[#152d4f] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-[#2D7FF9]" />
              <span className="text-xl font-bold text-[#0B1F3A]">SegurHogar</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Crear una cuenta</h1>
            <p className="text-gray-500 text-sm mt-1">Regístrate para empezar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-10 h-4 w-4 text-gray-400" />
              <Input
                label="Nombre"
                placeholder="Tu nombre"
                className="pl-10"
                error={errors.nombre?.message}
                {...register('nombre')}
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
                className="pl-10"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-10 h-4 w-4 text-gray-400" />
              <Input
                label="Confirmar contraseña"
                type="password"
                placeholder="Repite la contraseña"
                className="pl-10"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Crear cuenta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#2D7FF9] hover:underline font-medium">
                Acceder
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
