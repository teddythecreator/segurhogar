import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types/database';

// Hook para obtener pedidos
export function useOrders(filters?: {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('estado', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Order[];
    },
  });
}

// Hook para obtener un pedido específico
export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          items:order_items(*),
          status_history:order_status_history(*),
          installation:installations(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!id,
  });
}

// Hook para estadísticas de pedidos
export function useOrderStats() {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // Pedidos de hoy
      const { data: todayOrders, error: todayError } = await supabase
        .from('orders')
        .select('total, estado')
        .gte('created_at', today.toISOString())
        .neq('estado', 'cancelado');

      if (todayError) throw todayError;

      // Pedidos del mes
      const { data: monthOrders, error: monthError } = await supabase
        .from('orders')
        .select('total, estado')
        .gte('created_at', monthStart.toISOString())
        .neq('estado', 'cancelado');

      if (monthError) throw monthError;

      // Pedidos pendientes
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('id')
        .in('estado', ['pendiente_pago', 'pagado', 'enviado_proveedor']);

      if (pendingError) throw pendingError;

      const todayTotal = todayOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
      const monthTotal = monthOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

      return {
        todayOrders: todayOrders?.length || 0,
        todayTotal,
        monthOrders: monthOrders?.length || 0,
        monthTotal,
        pendingOrders: pendingOrders?.length || 0,
      };
    },
  });
}
