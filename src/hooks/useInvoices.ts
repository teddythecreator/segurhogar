import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface InvoicesFilters {
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
}

export function useInvoices(filters: InvoicesFilters = {}) {
  const { fecha_desde, fecha_hasta, page = 1, limit = 20 } = filters;

  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*)
        `, { count: 'exact' })
        .eq('estado', 'pagado')
        .not('factura_numero', 'is', null)
        .order('factura_numero', { ascending: false });

      if (fecha_desde) {
        query = query.gte('pagado_en', fecha_desde);
      }

      if (fecha_hasta) {
        query = query.lte('pagado_en', fecha_hasta);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        invoices: data,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
  });
}

export function useNextInvoiceNumber() {
  return useQuery({
    queryKey: ['next-invoice-number'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('factura_numero')
        .not('factura_numero', 'is', null)
        .order('factura_numero', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return 'FAC-2024-0001';
      }

      const currentNumber = data.factura_numero;
      const match = currentNumber.match(/FAC-(\d{4})-(\d+)/);
      
      if (!match) {
        return 'FAC-2024-0001';
      }

      const year = parseInt(match[1]);
      const number = parseInt(match[2]);
      
      const currentYear = new Date().getFullYear();
      
      if (year !== currentYear) {
        return `FAC-${currentYear}-0001`;
      }

      return `FAC-${year}-${String(number + 1).padStart(4, '0')}`;
    },
  });
}
