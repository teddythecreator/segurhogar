import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Hook para registrar un clic de afiliado
 * No bloquea la navegación si falla
 */
export function useTrackAffiliateClick() {
  return useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      try {
        await supabase.from('affiliate_clicks').insert({
          product_id: productId,
          ip_address: null, // Se gestiona en el backend por seguridad
          user_agent: navigator.userAgent,
          referer: document.referrer || null,
        });
      } catch (error) {
        // No fallar si el tracking falla
        console.warn('Error tracking affiliate click:', error);
      }
    },
  });
}
