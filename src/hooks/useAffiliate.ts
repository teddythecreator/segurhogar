import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AffiliateClicksFilters {
  product_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export function useAffiliateClicks(filters: AffiliateClicksFilters = {}) {
  const { product_id, fecha_desde, fecha_hasta } = filters;

  return useQuery({
    queryKey: ['affiliate-clicks', filters],
    queryFn: async () => {
      let query = supabase
        .from('affiliate_clicks')
        .select(`
          *,
          product:products(nombre, tienda_afiliado)
        `)
        .order('created_at', { ascending: false });

      if (product_id) {
        query = query.eq('product_id', product_id);
      }

      if (fecha_desde) {
        query = query.gte('created_at', fecha_desde);
      }

      if (fecha_hasta) {
        query = query.lte('created_at', fecha_hasta);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    },
  });
}

export function useAffiliateStats() {
  return useQuery({
    queryKey: ['affiliate-stats'],
    queryFn: async () => {
      // Obtener todos los clics
      const { data: clicks, error: clicksError } = await supabase
        .from('affiliate_clicks')
        .select(`
          *,
          product:products(nombre, tienda_afiliado)
        `);

      if (clicksError) throw clicksError;

      // Agrupar por producto
      const byProduct = clicks?.reduce((acc, click) => {
        const productId = click.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            product_id: productId,
            product_name: click.product?.nombre || 'Producto',
            tienda: click.product?.tienda_afiliado || 'Tienda',
            clicks: 0,
          };
        }
        acc[productId].clicks++;
        return acc;
      }, {} as Record<string, any>);

      // Agrupar por tienda
      const byStore = clicks?.reduce((acc, click) => {
        const store = click.product?.tienda_afiliado || 'Otras';
        if (!acc[store]) {
          acc[store] = {
            tienda: store,
            clicks: 0,
          };
        }
        acc[store].clicks++;
        return acc;
      }, {} as Record<string, any>);

      return {
        totalClicks: clicks?.length || 0,
        byProduct: Object.values(byProduct || {}),
        byStore: Object.values(byStore || {}),
      };
    },
  });
}

export function useAffiliateCommissions() {
  return useQuery({
    queryKey: ['affiliate-commissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_commissions')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAffiliateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commission: {
      tienda: string;
      fecha: string;
      importe: number;
      notas?: string;
    }) => {
      const { data, error } = await supabase
        .from('affiliate_commissions')
        .insert([commission])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-commissions'] });
    },
  });
}

export function useTrackAffiliateClick() {
  return useMutation({
    mutationFn: async (productId: string) => {
      const { data, error } = await supabase
        .from('affiliate_clicks')
        .insert([{ product_id: productId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}
