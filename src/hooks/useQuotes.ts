import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Quote, QuoteStatus } from '@/types/database';

export interface QuotesFilters {
  estado?: QuoteStatus;
  customer_id?: string;
  page?: number;
  limit?: number;
}

export function useQuotes(filters: QuotesFilters = {}) {
  const { estado, customer_id, page = 1, limit = 20 } = filters;

  return useQuery({
    queryKey: ['quotes', filters],
    queryFn: async () => {
      let query = supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(nombre, email, telefono)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (estado) {
        query = query.eq('estado', estado);
      }

      if (customer_id) {
        query = query.eq('customer_id', customer_id);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        quotes: data as Quote[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
  });
}

export function useQuote(id: string | null) {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(*),
          items:quote_items(*, product:products(nombre, tipo))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Quote;
    },
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quote, items }: { quote: Partial<Quote>; items: any[] }) => {
      // Crear presupuesto
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert([quote])
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Crear items
      if (items.length > 0) {
        const itemsWithQuoteId = items.map((item) => ({
          ...item,
          quote_id: quoteData.id,
        }));

        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(itemsWithQuoteId);

        if (itemsError) throw itemsError;
      }

      return quoteData as Quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Quote> & { id: string }) => {
      const { data, error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Quote;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.id] });
    },
  });
}

export function useConvertQuoteToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      // Obtener presupuesto con items
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(*),
          items:quote_items(*, product:products(*))
        `)
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;
      if (!quote) throw new Error('Presupuesto no encontrado');

      // Crear pedido
      const numero = `PED-${Date.now()}`;
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          numero,
          customer_id: quote.customer_id,
          estado: 'pendiente_pago',
          subtotal: quote.subtotal,
          iva: quote.iva,
          total: quote.total,
          tipo_iva: 21,
          envio_nombre: quote.customer.nombre,
          envio_telefono: quote.customer.telefono,
          envio_calle: quote.customer.direccion_calle,
          envio_codigo_postal: quote.customer.direccion_codigo_postal,
          envio_ciudad: quote.customer.direccion_ciudad,
          envio_provincia: quote.customer.direccion_provincia,
          notas_cliente: `Creado desde presupuesto ${quote.numero}`,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Crear items del pedido
      if (quote.items && quote.items.length > 0) {
        const orderItems = quote.items.map((item: any) => ({
          order_id: order.id,
          product_id: item.product_id,
          nombre_snapshot: item.descripcion,
          tipo_snapshot: item.product?.tipo || 'servicio',
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          iva_unitario: item.iva,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      // Actualizar estado del presupuesto
      await supabase
        .from('quotes')
        .update({ estado: 'aceptado' })
        .eq('id', quoteId);

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
