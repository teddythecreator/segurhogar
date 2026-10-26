import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { callEdgeFunction } from '@/lib/edge-functions';
import type { Installation, InstallationStatus } from '@/types/database';

export interface InstallationsFilters {
  estado?: InstallationStatus;
  instalador_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
}

/**
 * Hook para obtener instalaciones con filtros
 */
export function useInstallations(filters: InstallationsFilters = {}) {
  const { estado, instalador_id, fecha_desde, fecha_hasta, page = 1, limit = 20 } = filters;

  return useQuery({
    queryKey: ['installations', filters],
    queryFn: async () => {
      let query = supabase
        .from('installations')
        .select(`
          *,
          customer:customers(*),
          instalador:profiles!instalador_id(id, nombre, email, telefono),
          order:orders(numero, estado)
        `, { count: 'exact' })
        .order('fecha', { ascending: true });

      if (estado) {
        query = query.eq('estado', estado);
      }
      if (instalador_id) {
        query = query.eq('instalador_id', instalador_id);
      }
      if (fecha_desde) {
        query = query.gte('fecha', fecha_desde);
      }
      if (fecha_hasta) {
        query = query.lte('fecha', fecha_hasta);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        installations: data as Installation[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
  });
}

/**
 * Hook para obtener una instalación específica
 */
export function useInstallation(id: string | null) {
  return useQuery({
    queryKey: ['installation', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('installations')
        .select(`
          *,
          customer:customers(*),
          instalador:profiles!instalador_id(id, nombre, email, telefono),
          order:orders(
            numero,
            estado,
            items:order_items(
              *,
              product:products(id, nombre, tipo, especificaciones)
            )
          ),
          photos:installation_photos(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Installation;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener instalaciones de un rango de fechas (para calendario)
 */
export function useInstallationsByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['installations', 'calendar', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installations')
        .select(`
          *,
          customer:customers(nombre, telefono),
          instalador:profiles!instalador_id(id, nombre)
        `)
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .order('fecha', { ascending: true });

      if (error) throw error;
      return data as Installation[];
    },
  });
}

/**
 * Hook para actualizar una instalación
 */
export function useUpdateInstallation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Installation> & { id: string }) => {
      const { data, error } = await supabase
        .from('installations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Installation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installations'] });
      queryClient.invalidateQueries({ queryKey: ['installation'] });
    },
  });
}

/**
 * Hook para crear una instalación manual (sin pedido)
 */
export function useCreateInstallation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (installation: Partial<Installation>) => {
      const { data, error } = await supabase
        .from('installations')
        .insert([installation])
        .select()
        .single();

      if (error) throw error;
      return data as Installation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installations'] });
    },
  });
}

/**
 * Hook para subir foto de instalación
 */
export function useUploadInstallationPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      installationId,
      file,
      descripcion,
    }: {
      installationId: string;
      file: File;
      descripcion?: string;
    }) => {
      // Subir archivo a Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${installationId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('installation-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('installation-photos')
        .getPublicUrl(fileName);

      // Crear registro en BD
      const { data: photo, error: photoError } = await supabase
        .from('installation_photos')
        .insert([
          {
            installation_id: installationId,
            url: urlData.publicUrl,
            descripcion: descripcion || null,
          },
        ])
        .select()
        .single();

      if (photoError) throw photoError;
      return photo;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['installation', variables.installationId] });
    },
  });
}

/**
 * Hook para marcar instalación como realizada
 */
export function useCompleteInstallation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      firmaUrl,
      notas,
    }: {
      id: string;
      firmaUrl: string;
      notas?: string;
    }) => {
      const { data, error } = await supabase
        .from('installations')
        .update({
          estado: 'realizada',
          firma_url: firmaUrl,
          notas_instalador: notas || null,
          fecha_realizacion: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Enviar email de confirmación
      try {
        await callEdgeFunction('send-email', {
          method: 'POST',
          body: {
            installation_id: id,
            event: 'installation_completed',
          },
        });
      } catch (emailError) {
        console.warn('Error enviando email:', emailError);
      }

      return data as Installation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installations'] });
      queryClient.invalidateQueries({ queryKey: ['installation'] });
    },
  });
}

/**
 * Hook para obtener instaladores disponibles
 */
export function useInstallers() {
  return useQuery({
    queryKey: ['installers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre, email, telefono')
        .eq('role', 'instalador')
        .order('nombre');

      if (error) throw error;
      return data;
    },
  });
}
