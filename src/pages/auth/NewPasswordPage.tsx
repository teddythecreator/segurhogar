import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { newPasswordSchema, type NewPasswordFormData } from '@/lib/validations';
import { supabase } from '@/lib/supabase';

export function NewPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  // Verificar que hay una sesión de recuperación válida
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        setError('Enlace de recuperación inválido o expirado');
      }
    };
    checkSession();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  });

  const onSubmit = async (data: NewPasswordFormData) => {
    setError('');
    setIsLoading(true);

    const { error } = await updatePassword(data.password);

    if (error) {
      setError('Error al actualizar la contraseña');
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (!isValidSession && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] to-[#152d4f] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D7FF9] mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando enlace...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] to-[#152d4f] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-[#22C55E]" />
            </div>
            <h2 className="text-xl font-bold text-[#0B1F3A] mb-2">Contraseña actualizada</h2>
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido actualizada correctamente. Ya puedes acceder con tu nueva contraseña.
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
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Nueva contraseña</h1>
            <p className="text-gray-500 text-sm mt-1">
              Introduce tu nueva contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-10 h-4 w-4 text-gray-400" />
              <Input
                label="Nueva contraseña"
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
              Actualizar contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
