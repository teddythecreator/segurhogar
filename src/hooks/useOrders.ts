import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { callEdgeFunction } from '@/lib/edge-functions';
import type { Order, OrderStatus } from '@/types/database';

export interface OrdersFilters {
  estado?: OrderStatus;
  search?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
}

/**
 * Hook para obtener pedidos con filtros avanzados
 */
export function useOrders(filters: OrdersFilters = {}) {
  const { estado, search, fecha_desde, fecha_hasta, page = 1, limit = 20 } = filters;

  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          user:profiles!user_id(id, nombre, email),
          items:order_items(*)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Filtro por estado
      if (estado) {
        query = query.eq('estado', estado);
      }

      // Búsqueda por número de pedido o nombre de usuario
      if (search) {
        query = query.or(`numero.ilike.%${search}%,user.nombre.ilike.%${search}%,envio_nombre.ilike.%${search}%`);
      }

      // Filtro por rango de fechas
      if (fecha_desde) {
        query = query.gte('created_at', new Date(fecha_desde).toISOString());
      }
      if (fecha_hasta) {
        query = query.lte('created_at', new Date(fecha_hasta + 'T23:59:59').toISOString());
      }

      // Paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        orders: data as Order[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
  });
}

/**
 * Hook para obtener un pedido específico con todos los detalles
 */
export function useOrder(id: string | null) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles!user_id(id, nombre, email, telefono),
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

/**
 * Hook para actualizar el estado de un pedido
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
      notas,
      tracking_number,
    }: {
      orderId: string;
      newStatus: OrderStatus;
      notas?: string;
      tracking_number?: string;
    }) => {
      // 1. Obtener pedido actual
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;
      if (!currentOrder) throw new Error('Pedido no encontrado');

      const oldStatus = currentOrder.estado as OrderStatus;

      // 2. Actualizar pedido
      const updateData: Record<string, unknown> = {
        estado: newStatus,
      };

      if (newStatus === 'pagado' && !currentOrder.pagado_en) {
        updateData.pagado_en = new Date().toISOString();
      }

      if (tracking_number) {
        updateData.notas_internas = [
          currentOrder.notas_internas || '',
          `[${new Date().toLocaleString('es-ES')}] Nº seguimiento: ${tracking_number}`,
        ].join('\n');
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) throw updateError;

      // 3. Registrar en historial
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          estado_anterior: oldStatus,
          estado_nuevo: newStatus,
          notas: notas || null,
        });

      if (historyError) throw historyError;

      // 4. Enviar email automático (no bloquear si falla)
      try {
        await callEdgeFunction('send-email', {
          method: 'POST',
          body: {
            order_id: orderId,
            event: getStatusEvent(newStatus),
          },
        });
      } catch (emailError) {
        console.warn('Error enviando email:', emailError);
        // No fallar si el email falla
      }

      return { orderId, oldStatus, newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

/**
 * Hook para actualizar notas internas del pedido
 */
export function useUpdateOrderNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, notas }: { orderId: string; notas: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ notas_internas: notas })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

/**
 * Hook para gestionar incidencias
 */
export function useReportIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      motivo,
      descripcion,
    }: {
      orderId: string;
      motivo: string;
      descripcion: string;
    }) => {
      // Cambiar estado a incidencia
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('estado, notas_internas')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;
      if (!currentOrder) throw new Error('Pedido no encontrado');

      const oldStatus = currentOrder.estado as OrderStatus;

      // Actualizar estado
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          estado: 'incidencia',
          notas_internas: [
            currentOrder.notas_internas || '',
            `\n[INCIDENCIA - ${new Date().toLocaleString('es-ES')}]\nMotivo: ${motivo}\nDescripción: ${descripcion}`,
          ].join('\n'),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Registrar en historial
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        estado_anterior: oldStatus,
        estado_nuevo: 'incidencia',
        notas: `Incidencia reportada: ${motivo} - ${descripcion}`,
      });

      return { orderId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

/**
 * Hook para gestionar devoluciones
 */
export function useProcessReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      motivo,
    }: {
      orderId: string;
      motivo: string;
    }) => {
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('estado, notas_internas')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;
      if (!currentOrder) throw new Error('Pedido no encontrado');

      const oldStatus = currentOrder.estado as OrderStatus;

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          estado: 'devuelto',
          notas_internas: [
            currentOrder.notas_internas || '',
            `\n[DEVOLUCIÓN - ${new Date().toLocaleString('es-ES')}]\nMotivo: ${motivo}`,
          ].join('\n'),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      await supabase.from('order_status_history').insert({
        order_id: orderId,
        estado_anterior: oldStatus,
        estado_nuevo: 'devuelto',
        notas: `Devolución procesada: ${motivo}`,
      });

      return { orderId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

/**
 * Mapea estado del pedido a evento de email
 */
function getStatusEvent(status: OrderStatus): string {
  const eventMap: Record<OrderStatus, string> = {
    pendiente_pago: 'order_pending',
    pagado: 'order_confirmed',
    enviado_proveedor: 'order_processing',
    en_transito: 'order_shipped',
    entregado: 'order_delivered',
    incidencia: 'order_incident',
    devuelto: 'order_returned',
    cancelado: 'order_cancelled',
  };
  return eventMap[status] || 'order_updated';
}

/**
 * Hook para obtener estadísticas de pedidos
 */
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
      const { count: pendingCount, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['pendiente_pago', 'pagado', 'enviado_proveedor']);

      if (pendingError) throw pendingError;

      // Pedidos con incidencias
      const { count: incidentCount, error: incidentError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'incidencia');

      if (incidentError) throw incidentError;

      const todayTotal = todayOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
      const monthTotal = monthOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

      return {
        todayOrders: todayOrders?.length || 0,
        todayTotal,
        monthOrders: monthOrders?.length || 0,
        monthTotal,
        pendingOrders: pendingCount || 0,
        incidentOrders: incidentCount || 0,
      };
    },
  });
}
