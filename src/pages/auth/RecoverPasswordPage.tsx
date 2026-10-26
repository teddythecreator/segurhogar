import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations';

export function RecoverPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError('');
    setIsLoading(true);

    const { error } = await resetPassword(data.email);

    if (error) {
      setError('Error al enviar el email de recuperación');
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
            <h2 className="text-xl font-bold text-[#0B1F3A] mb-2">Email enviado</h2>
            <p className="text-gray-600 mb-6">
              Si existe una cuenta con ese email, recibirás un enlace para recuperar tu contraseña. Revisa tu bandeja de entrada y la carpeta de spam.
            </p>
            <Link to="/login">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al login
              </Button>
            </Link>
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
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Recuperar contraseña</h1>
            <p className="text-gray-500 text-sm mt-1">
              Introduce tu email y te enviaremos un enlace para recuperar tu contraseña
            </p>
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

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Enviar enlace de recuperación
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-[#2D7FF9] hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Volver al login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
