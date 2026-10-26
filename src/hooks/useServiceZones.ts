import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ServiceZone } from '@/types/database';

interface CheckZoneResult {
  disponible: boolean;
  zona: ServiceZone | null;
}

/**
 * Hook para comprobar si un código postal está en zona de servicio
 */
export function useCheckServiceZone() {
  return useMutation({
    mutationFn: async (codigoPostal: string): Promise<CheckZoneResult> => {
      const cp = codigoPostal.trim();
      
      if (!/^\d{5}$/.test(cp)) {
        return { disponible: false, zona: null };
      }

      const { data, error } = await supabase
        .from('service_zones')
        .select('*')
        .eq('codigo_postal', cp)
        .eq('activo', true)
        .maybeSingle();

      if (error) throw error;

      return {
        disponible: !!data,
        zona: data as ServiceZone | null,
      };
    },
  });
}
