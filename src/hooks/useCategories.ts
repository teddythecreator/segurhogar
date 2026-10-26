import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types/database';

/**
 * Hook para obtener todas las categorías (jerárquicas)
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('orden', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });
}

/**
 * Hook para obtener categorías jerárquicas (con hijos)
 */
export function useCategoriesHierarchical() {
  return useQuery({
    queryKey: ['categories', 'hierarchical'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('orden', { ascending: true });

      if (error) throw error;

      // Construir jerarquía
      const categories = data as Category[];
      const categoryMap = new Map<string, Category & { children: Category[] }>();
      const rootCategories: (Category & { children: Category[] })[] = [];

      // Inicializar mapa
      categories.forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      // Construir jerarquía
      categories.forEach((cat) => {
        const node = categoryMap.get(cat.id)!;
        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.children.push(node);
          }
        } else {
          rootCategories.push(node);
        }
      });

      return rootCategories;
    },
  });
}

/**
 * Hook para crear una categoría
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Partial<Category>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

/**
 * Hook para actualizar una categoría
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

/**
 * Hook para eliminar una categoría
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
