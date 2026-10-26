import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useUsers, useInviteUser, useUpdateUserRole } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLE_LABELS } from '@/types/database';
import type { UserRole } from '@/types/database';
import { UserPlus, Mail, AlertCircle, CheckCircle } from 'lucide-react';

const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
  nombre: z.string().optional(),
  role: z.enum(['admin', 'gestor', 'instalador']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const inviteMutation = useInviteUser();
  const updateRoleMutation = useUpdateUserRole();
  
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'gestor',
    },
  });

  const onInviteSubmit = async (data: InviteFormData) => {
    setInviteError('');
    setInviteSuccess(false);

    try {
      await inviteMutation.mutateAsync({
        email: data.email,
        role: data.role,
        nombre: data.nombre,
      });
      setInviteSuccess(true);
      reset();
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (err) {
      setInviteError((err as Error).message || 'Error al invitar usuario');
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    if (!confirm(`¿Cambiar el rol a "${USER_ROLE_LABELS[newRole]}"?`)) return;
    
    try {
      await updateRoleMutation.mutateAsync({ userId, newRole });
    } catch (err) {
      alert('Error al cambiar el rol: ' + (err as Error).message);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">No tienes permisos para acceder a esta sección</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Usuarios</h1>
        <p className="text-gray-500 text-sm">Gestiona los usuarios del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de invitación */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="font-semibold text-[#0B1F3A] flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#2D7FF9]" />
              Invitar colaborador
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onInviteSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="colaborador@email.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Nombre (opcional)"
                placeholder="Nombre del colaborador"
                error={errors.nombre?.message}
                {...register('nombre')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  {...register('role')}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                >
                  <option value="gestor">Gestor de pedidos</option>
                  <option value="instalador">Instalador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {inviteSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-sm text-green-600">Invitación enviada correctamente</p>
                </div>
              )}

              {inviteError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <p className="text-sm text-red-600">{inviteError}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                isLoading={isSubmitting || inviteMutation.isPending}
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar invitación
              </Button>

              <p className="text-xs text-gray-500">
                Se enviará un email con instrucciones para establecer la contraseña.
                La invitación se procesa mediante una Edge Function con la service role key.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Lista de usuarios */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-[#0B1F3A]">
              Usuarios del sistema ({users?.length || 0})
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingUsers ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D7FF9] mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Usuario</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Registro</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users?.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[#2D7FF9] flex items-center justify-center text-white text-xs font-bold">
                              {u.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-[#0B1F3A]">{u.nombre}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'cliente' ? 'default' : 'info'}>
                            {USER_ROLE_LABELS[u.role]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                          {new Date(u.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.id !== currentUser.id && u.role !== 'cliente' && (
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                              className="text-xs px-2 py-1 border rounded"
                              disabled={updateRoleMutation.isPending}
                            >
                              <option value="admin">Admin</option>
                              <option value="gestor">Gestor</option>
                              <option value="instalador">Instalador</option>
                              <option value="cliente">Cliente</option>
                            </select>
                          )}
                          {u.id === currentUser.id && (
                            <span className="text-xs text-gray-400">Tú</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
