import { z } from 'zod';

// Schema de login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Introduce un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema de registro
export const registerSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Introduce un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Schema de recuperación de contraseña
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Introduce un email válido'),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Schema de nueva contraseña (tras recuperación)
export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

// Schema de actualización de perfil
export const updateProfileSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  telefono: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[0-9\s\-]{9,15}$/.test(val),
      'Introduce un teléfono válido'
    ),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
