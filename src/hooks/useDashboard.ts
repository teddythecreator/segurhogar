import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface DashboardData {
  // Ventas
  ventasHoy: number;
  pedidosHoy: number;
  ventasMes: number;
  pedidosMes: number;
  
  // Pendientes
  pedidosPendientes: number;
  instalacionesPendientes: number;
  
  // Alertas
  alertas: Alerta[];
  
  // Gráfico de ventas (últimos 30 días)
  ventas30Dias: { fecha: string; ventas: number; pedidos: number }[];
}

export interface Alerta {
  id: string;
  tipo: 'pedido_retrasado' | 'instalacion_sin_productos';
  titulo: string;
  descripcion: string;
  fecha: string;
  pedidoId?: string;
  instalacionId?: string;
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const mesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const hace30Dias = new Date(hoy);
      hace30Dias.setDate(hoy.getDate() - 30);
      
      const en3Dias = new Date(hoy);
      en3Dias.setDate(hoy.getDate() + 3);

      // 1. Ventas y pedidos de hoy
      const { data: datosHoy } = await supabase
        .from('orders')
        .select('total, estado')
        .gte('created_at', hoy.toISOString())
        .neq('estado', 'cancelado');

      const ventasHoy = datosHoy?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
      const pedidosHoy = datosHoy?.length || 0;

      // 2. Ventas y pedidos del mes
      const { data: datosMes } = await supabase
        .from('orders')
        .select('total, estado')
        .gte('created_at', mesActual.toISOString())
        .neq('estado', 'cancelado');

      const ventasMes = datosMes?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
      const pedidosMes = datosMes?.length || 0;

      // 3. Pedidos pendientes
      const { count: pedidosPendientes } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['pendiente_pago', 'pagado', 'enviado_proveedor', 'en_transito']);

      // 4. Instalaciones pendientes
      const { count: instalacionesPendientes } = await supabase
        .from('installations')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['solicitada', 'confirmada', 'asignada']);

      // 5. Alertas
      const alertas: Alerta[] = [];

      // 5a. Pedidos con más de 10 días sin entregar
      const { data: pedidosRetrasados } = await supabase
        .from('orders')
        .select('id, numero, created_at, customer_id')
        .in('estado', ['pagado', 'enviado_proveedor', 'en_transito'])
        .lt('created_at', new Date(hoy.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString());

      for (const pedido of pedidosRetrasados || []) {
        const dias = Math.floor((hoy.getTime() - new Date(pedido.created_at).getTime()) / (1000 * 60 * 60 * 24));
        
        // Obtener nombre del cliente
        let clienteNombre = 'cliente';
        if (pedido.customer_id) {
          const { data: customer } = await supabase
            .from('customers')
            .select('nombre')
            .eq('id', pedido.customer_id)
            .single();
          clienteNombre = customer?.nombre || 'cliente';
        }
        
        alertas.push({
          id: `pedido-${pedido.id}`,
          tipo: 'pedido_retrasado',
          titulo: `Pedido ${pedido.numero} retrasado`,
          descripcion: `Pedido de ${clienteNombre} con ${dias} días sin entregar`,
          fecha: pedido.created_at,
          pedidoId: pedido.id,
        });
      }

      // 5b. Instalaciones en próximos 3 días con productos no entregados
      const { data: instalacionesProximas } = await supabase
        .from('installations')
        .select('id, fecha, customer_id, order_id')
        .gte('fecha', hoy.toISOString())
        .lte('fecha', en3Dias.toISOString())
        .in('estado', ['solicitada', 'confirmada', 'asignada']);

      for (const inst of instalacionesProximas || []) {
        // Verificar estado del pedido
        let pedidoEntregado = false;
        if (inst.order_id) {
          const { data: order } = await supabase
            .from('orders')
            .select('estado')
            .eq('id', inst.order_id)
            .single();
          pedidoEntregado = order?.estado === 'entregado';
        }
        
        if (!pedidoEntregado) {
          // Obtener nombre del cliente
          let clienteNombre = 'cliente';
          if (inst.customer_id) {
            const { data: customer } = await supabase
              .from('customers')
              .select('nombre')
              .eq('id', inst.customer_id)
              .single();
            clienteNombre = customer?.nombre || 'cliente';
          }
          
          alertas.push({
            id: `instalacion-${inst.id}`,
            tipo: 'instalacion_sin_productos',
            titulo: `Instalación sin productos`,
            descripcion: `Instalación de ${clienteNombre} el ${new Date(inst.fecha).toLocaleDateString('es-ES')} con productos no entregados`,
            fecha: inst.fecha,
            instalacionId: inst.id,
          });
        }
      }

      // 6. Gráfico de ventas últimos 30 días
      const { data: ventas30DiasData } = await supabase
        .from('orders')
        .select('created_at, total, estado')
        .gte('created_at', hace30Dias.toISOString())
        .neq('estado', 'cancelado')
        .order('created_at', { ascending: true });

      // Agrupar por día
      const ventasPorDia: Record<string, { ventas: number; pedidos: number }> = {};
      
      // Inicializar los 30 días
      for (let i = 30; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        const key = fecha.toISOString().split('T')[0];
        ventasPorDia[key] = { ventas: 0, pedidos: 0 };
      }

      // Sumar ventas por día
      ventas30DiasData?.forEach((order) => {
        const fecha = new Date(order.created_at).toISOString().split('T')[0];
        if (ventasPorDia[fecha]) {
          ventasPorDia[fecha].ventas += Number(order.total);
          ventasPorDia[fecha].pedidos += 1;
        }
      });

      // Convertir a array para el gráfico
      const ventas30Dias = Object.entries(ventasPorDia).map(([fecha, datos]) => ({
        fecha,
        ventas: datos.ventas,
        pedidos: datos.pedidos,
      }));

      return {
        ventasHoy,
        pedidosHoy,
        ventasMes,
        pedidosMes,
        pedidosPendientes: pedidosPendientes || 0,
        instalacionesPendientes: instalacionesPendientes || 0,
        alertas,
        ventas30Dias,
      };
    },
  });
}
