import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Product, ProductType, RecommendedProfile } from '@/types/database';

export interface PublicProductsFilters {
  search?: string;
  tipo?: ProductType;
  categoria_slug?: string;
  perfil?: RecommendedProfile;
  precio_min?: number;
  precio_max?: number;
  ordenar?: 'recientes' | 'precio_asc' | 'precio_desc' | 'nombre';
  page?: number;
  limit?: number;
}

/**
 * Hook para obtener productos públicos (solo publicados y activos)
 */
export function usePublicProducts(filters: PublicProductsFilters = {}) {
  const {
    search,
    tipo,
    categoria_slug,
    perfil,
    precio_min,
    precio_max,
    ordenar = 'recientes',
    page = 1,
    limit = 12,
  } = filters;

  return useQuery({
    queryKey: ['public-products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categoria:categories(id, nombre, slug),
          imagenes:product_images(url, orden, alt)
        `, { count: 'exact' })
        .eq('estado', 'publicado')
        .eq('activo', true);

      // Filtros
      if (search) {
        query = query.or(`nombre.ilike.%${search}%,descripcion_corta.ilike.%${search}%`);
      }
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      if (categoria_slug) {
        // Buscar productos de la categoría o sus subcategorías
        query = query.or(
          `categoria.slug.eq.${categoria_slug},categoria.parent_id.in.(select id from categories where slug='${categoria_slug}')`
        );
      }
      if (perfil && perfil !== 'todos') {
        // Filtrar por perfil recomendado
        query = query.or(`perfiles_recomendados.cs.{${perfil}},perfiles_recomendados.cs.{todos}`);
      }
      if (precio_min !== undefined) {
        query = query.gte('precio', precio_min);
      }
      if (precio_max !== undefined) {
        query = query.lte('precio', precio_max);
      }

      // Ordenación
      switch (ordenar) {
        case 'precio_asc':
          query = query.order('precio', { ascending: true });
          break;
        case 'precio_desc':
          query = query.order('precio', { ascending: false });
          break;
        case 'nombre':
          query = query.order('nombre', { ascending: true });
          break;
        case 'recientes':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        products: data as (Product & { imagenes?: { url: string; orden: number; alt: string | null }[] })[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
  });
}

/**
 * Hook para obtener un producto público por slug
 */
export function usePublicProduct(slug: string | null) {
  return useQuery({
    queryKey: ['public-product', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categoria:categories(*),
          imagenes:product_images(*),
          pack_items:pack_items(
            *,
            product:products(
              id,
              nombre,
              slug,
              precio,
              tipo,
              imagenes:product_images(url, orden)
            )
          )
        `)
        .eq('slug', slug)
        .eq('estado', 'publicado')
        .eq('activo', true)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
  });
}

/**
 * Hook para obtener productos relacionados (misma categoría)
 */
export function useRelatedProducts(productId: string, categoriaId: string | null, limit = 4) {
  return useQuery({
    queryKey: ['related-products', productId, categoriaId],
    queryFn: async () => {
      if (!categoriaId) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categoria:categories(id, nombre, slug),
          imagenes:product_images(url, orden, alt)
        `)
        .eq('categoria_id', categoriaId)
        .eq('estado', 'publicado')
        .eq('activo', true)
        .neq('id', productId)
        .limit(limit);

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!categoriaId,
  });
}

/**
 * Hook para obtener packs destacados (para la home)
 */
export function useFeaturedPacks(limit = 3) {
  return useQuery({
    queryKey: ['featured-packs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categoria:categories(id, nombre, slug),
          imagenes:product_images(url, orden, alt)
        `)
        .eq('tipo', 'pack')
        .eq('estado', 'publicado')
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Product[];
    },
  });
}
