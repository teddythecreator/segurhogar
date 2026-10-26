import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ReportsFilters {
  fecha_desde?: string;
  fecha_hasta?: string;
}

export function useSalesReport(filters: ReportsFilters = {}) {
  const { fecha_desde, fecha_hasta } = filters;

  return useQuery({
    queryKey: ['sales-report', filters],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*, product:products(tipo))
        `)
        .eq('estado', 'pagado');

      if (fecha_desde) {
        query = query.gte('pagado_en', fecha_desde);
      }

      if (fecha_hasta) {
        query = query.lte('pagado_en', fecha_hasta);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Agrupar por tipo de producto
      const byType = data?.reduce((acc: any, order: any) => {
        order.items?.forEach((item: any) => {
          const tipo = item.product?.tipo || 'servicio';
          if (!acc[tipo]) {
            acc[tipo] = {
              tipo,
              cantidad: 0,
              ingresos: 0,
            };
          }
          acc[tipo].cantidad += item.cantidad;
          acc[tipo].ingresos += item.precio_unitario * item.cantidad;
        });
        return acc;
      }, {} as Record<string, any>);

      // Total general
      const totalIngresos = data?.reduce((sum, order) => sum + order.total, 0) || 0;
      const totalPedidos = data?.length || 0;

      return {
        totalIngresos,
        totalPedidos,
        byType: Object.values(byType || {}),
        orders: data,
      };
    },
  });
}

export function useTopProductsReport(filters: ReportsFilters = {}) {
  const { fecha_desde, fecha_hasta } = filters;

  return useQuery({
    queryKey: ['top-products-report', filters],
    queryFn: async () => {
      let query = supabase
        .from('order_items')
        .select(`
          *,
          product:products(id, nombre, tipo)
        `)
        .order('cantidad', { ascending: false });

      if (fecha_desde || fecha_hasta) {
        // Necesitamos filtrar por orders.pagado_en
        const ordersQuery = supabase
          .from('orders')
          .select('id')
          .eq('estado', 'pagado');

        if (fecha_desde) {
          ordersQuery.gte('pagado_en', fecha_desde);
        }
        if (fecha_hasta) {
          ordersQuery.lte('pagado_en', fecha_hasta);
        }

        const { data: orderIds } = await ordersQuery;
        const ids = orderIds?.map((o) => o.id) || [];

        if (ids.length > 0) {
          query = query.in('order_id', ids);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      // Agrupar por producto
      const byProduct = data?.reduce((acc, item) => {
        const productId = item.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            product_id: productId,
            nombre: item.product?.nombre || 'Producto',
            tipo: item.product?.tipo || 'servicio',
            cantidad: 0,
            ingresos: 0,
          };
        }
        acc[productId].cantidad += item.cantidad;
        acc[productId].ingresos += item.precio_unitario * item.cantidad;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(byProduct || {}).sort((a: any, b: any) => b.cantidad - a.cantidad);
    },
  });
}

export function useInstallationsByInstallerReport(filters: ReportsFilters = {}) {
  const { fecha_desde, fecha_hasta } = filters;

  return useQuery({
    queryKey: ['installations-by-installer-report', filters],
    queryFn: async () => {
      let query = supabase
        .from('installations')
        .select(`
          *,
          instalador:profiles!instalador_id(id, nombre)
        `)
        .eq('estado', 'realizada');

      if (fecha_desde) {
        query = query.gte('fecha_realizacion', fecha_desde);
      }

      if (fecha_hasta) {
        query = query.lte('fecha_realizacion', fecha_hasta);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Agrupar por instalador
      const byInstaller = data?.reduce((acc, installation) => {
        const installerId = installation.instalador_id;
        if (!installerId) return acc;

        if (!acc[installerId]) {
          acc[installerId] = {
            instalador_id: installerId,
            nombre: installation.instalador?.nombre || 'Instalador',
            cantidad: 0,
          };
        }
        acc[installerId].cantidad++;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(byInstaller || {}).sort((a: any, b: any) => b.cantidad - a.cantidad);
    },
  });
}
