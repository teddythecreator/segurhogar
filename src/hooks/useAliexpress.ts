import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callEdgeFunction } from '@/lib/edge-functions';

// ============================================================================
// TOKENS
// ============================================================================

export function useAliexpressTokenStatus() {
  return useQuery({
    queryKey: ['aliexpress-token'],
    queryFn: async () => {
      const response = await callEdgeFunction('aliexpress-client', {
        method: 'POST',
        body: { action: 'get_token_status' },
      });
      if (response.error) throw response.error;
      return response.data;
    },
  });
}

export function useGenerateAliexpressToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await callEdgeFunction('aliexpress-client', {
        method: 'POST',
        body: { action: 'generate_token', payload: { code } },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aliexpress-token'] });
    },
  });
}

// ============================================================================
// IMPORTAR PRODUCTO
// ============================================================================

export interface AliexpressProductData {
  product_id: string;
  product_title: string;
  product_price: string;
  product_stock: string;
  product_images: string[];
  product_description: string;
  category_name?: string;
  sku_attributes?: any[];
  logistics_info?: any;
}

export function useImportAliexpressProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await callEdgeFunction('aliexpress-client', {
        method: 'POST',
        body: { 
          action: 'get_product', 
          payload: { 
            productId,
            options: { shipToCountry: 'ES', targetCurrency: 'EUR', targetLanguage: 'es' }
          } 
        },
      });
      if (response.error) throw response.error;
      return response.data as AliexpressProductData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aliexpress-products'] });
    },
  });
}

// ============================================================================
// CREAR PEDIDO EN ALIEXPRESS
// ============================================================================

export function useCreateAliexpressOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await callEdgeFunction('aliexpress-create-order', {
        method: 'POST',
        body: { orderId },
      });
      if (response.error) throw response.error;
      return response.data as { ae_order_id: string; ae_order_status: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['aliexpress-orders'] });
    },
  });
}

// ============================================================================
// CONSULTAR TRACKING
// ============================================================================

export function useAliexpressTracking(aeOrderId: string | null) {
  return useQuery({
    queryKey: ['aliexpress-tracking', aeOrderId],
    queryFn: async () => {
      if (!aeOrderId) return null;
      const response = await callEdgeFunction('aliexpress-client', {
        method: 'POST',
        body: { action: 'get_tracking', payload: { aeOrderId } },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    enabled: !!aeOrderId,
  });
}

// ============================================================================
// LISTA DE PEDIDOS DE ALIEXPRESS
// ============================================================================

export function useAliexpressOrders() {
  return useQuery({
    queryKey: ['aliexpress-orders'],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('aliexpress_orders')
        .select(`
          *,
          order:orders(numero, estado, envio_nombre, total)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// ============================================================================
// REGISTRO DE ERRORES
// ============================================================================

export function useAliexpressErrors(limit = 50) {
  return useQuery({
    queryKey: ['aliexpress-errors', limit],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('aliexpress_errors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

export function useClearAliexpressErrors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from('aliexpress_errors')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Borrar todos
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aliexpress-errors'] });
    },
  });
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

export function useAliexpressConfig() {
  return useQuery({
    queryKey: ['aliexpress-config'],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('aliexpress_config')
        .select('*');

      if (error) throw error;

      const config: Record<string, any> = {};
      data?.forEach((item) => {
        config[item.key] = item.value;
      });
      return config;
    },
  });
}

export function useUpdateAliexpressConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from('aliexpress_config')
        .upsert({ key, value });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aliexpress-config'] });
    },
  });
}

// ============================================================================
// SINCRONIZACIÓN MANUAL
// ============================================================================

export function useSyncAliexpressProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await callEdgeFunction('aliexpress-sync', {
        method: 'POST',
        body: {},
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['aliexpress-errors'] });
    },
  });
}
