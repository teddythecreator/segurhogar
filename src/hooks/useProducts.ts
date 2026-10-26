import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Product, ProductType, ProductStatus } from '@/types/database';

interface UseProductsFilters {
  search?: string;
  tipo?: ProductType;
  categoria_id?: string;
  estado?: ProductStatus;
  page?: number;
  limit?: number;
}

/**
 * Hook para obtener productos con filtros y paginación
 */
export function useProducts(filters: UseProductsFilters = {}) {
  const { search, tipo, categoria_id, estado, page = 1, limit = 20 } = filters;

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categoria:categories(id, nombre, slug)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Filtros
      if (search) {
        query = query.or(`nombre.ilike.%${search}%,slug.ilike.%${search}%`);
      }
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      if (categoria_id) {
        query = query.eq('categoria_id', categoria_id);
      }
      if (estado) {
        query = query.eq('estado', estado);
      }

      // Paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        products: data as Product[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
  });
}

/**
 * Hook para obtener un producto por ID
 */
export function useProduct(id: string | null) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categoria:categories(*),
          imagenes:product_images(*),
          pack_items:pack_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener un producto por slug
 */
export function useProductBySlug(slug: string | null) {
  return useQuery({
    queryKey: ['product', 'slug', slug],
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
            product:products(*)
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
  });
}

/**
 * Hook para crear un producto
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Hook para actualizar un producto
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
}

/**
 * Hook para eliminar un producto
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Hook para actualizar imágenes de un producto
 */
export function useUpdateProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, images }: { 
      productId: string; 
      images: { url: string; orden: number; alt?: string }[] 
    }) => {
      // Eliminar imágenes existentes
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      // Insertar nuevas imágenes
      if (images.length > 0) {
        const { error } = await supabase
          .from('product_images')
          .insert(
            images.map((img) => ({
              product_id: productId,
              url: img.url,
              orden: img.orden,
              alt: img.alt || null,
            }))
          );

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
  });
}

/**
 * Hook para actualizar items de un pack
 */
export function useUpdatePackItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ packId, items }: { 
      packId: string; 
      items: { product_id: string; cantidad: number }[] 
    }) => {
      // Eliminar items existentes
      await supabase
        .from('pack_items')
        .delete()
        .eq('pack_id', packId);

      // Insertar nuevos items
      if (items.length > 0) {
        const { error } = await supabase
          .from('pack_items')
          .insert(
            items.map((item) => ({
              pack_id: packId,
              product_id: item.product_id,
              cantidad: item.cantidad,
            }))
          );

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.packId] });
    },
  });
}
