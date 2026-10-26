import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { generateSlug } from '@/lib/slug';
import type { Category } from '@/types/database';

const categorySchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string().min(1, 'El slug es obligatorio'),
  descripcion: z.string().optional(),
  parent_id: z.string().nullable(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombre: '',
      slug: '',
      descripcion: '',
      parent_id: null,
    },
  });

  const nombre = watch('nombre');

  // Generar slug automáticamente
  useState(() => {
    if (autoSlug && nombre && !editingId) {
      setValue('slug', generateSlug(nombre));
    }
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      reset();
      setEditingId(null);
      setAutoSlug(true);
    } catch (error) {
      alert('Error al guardar: ' + (error as Error).message);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setValue('nombre', category.nombre);
    setValue('slug', category.slug);
    setValue('descripcion', category.descripcion || '');
    setValue('parent_id', category.parent_id);
    setAutoSlug(false);
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
    setAutoSlug(true);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) return;
    
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      alert('Error al eliminar: ' + (error as Error).message);
    }
  };

  // Construir jerarquía para mostrar
  const categoryMap = new Map<string, Category & { children: Category[] }>();
  const rootCategories: (Category & { children: Category[] })[] = [];

  categories?.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  categories?.forEach((cat) => {
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Categorías</h1>
        <p className="text-gray-500 text-sm">Gestión de categorías de productos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="font-semibold text-[#0B1F3A]">
              {editingId ? 'Editar categoría' : 'Nueva categoría'}
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nombre"
                error={errors.nombre?.message}
                {...register('nombre')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <div className="flex gap-2">
                  <Input
                    {...register('slug')}
                    error={errors.slug?.message}
                    disabled={!autoSlug}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoSlug(!autoSlug)}
                  >
                    {autoSlug ? 'Auto' : 'Manual'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  {...register('descripcion')}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría padre
                </label>
                <select
                  {...register('parent_id')}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                >
                  <option value="">Sin padre (categoría raíz)</option>
                  {categories
                    ?.filter((cat) => cat.id !== editingId)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" isLoading={isSubmitting} className="flex-1">
                  {editingId ? 'Actualizar' : 'Crear'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de categorías */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-[#2D7FF9]" />
              <h2 className="font-semibold text-[#0B1F3A]">
                Categorías ({categories?.length || 0})
              </h2>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D7FF9] mx-auto"></div>
              </div>
            ) : !categories || categories.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No hay categorías</p>
              </div>
            ) : (
              <div className="divide-y">
                {rootCategories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    categoryMap={categoryMap}
                    level={0}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface CategoryItemProps {
  category: Category;
  categoryMap: Map<string, Category & { children: Category[] }>;
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string, nombre: string) => void;
}

function CategoryItem({ category, categoryMap, level, onEdit, onDelete }: CategoryItemProps) {
  const node = categoryMap.get(category.id);
  const children = node?.children || [];

  return (
    <>
      <div
        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
        style={{ paddingLeft: `${16 + level * 24}px` }}
      >
        <div className="flex-1">
          <p className="font-medium text-[#0B1F3A]">{category.nombre}</p>
          <p className="text-xs text-gray-500">{category.slug}</p>
          {category.descripcion && (
            <p className="text-sm text-gray-600 mt-1">{category.descripcion}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {children.length > 0 && (
            <Badge variant="info">{children.length} hijas</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category.id, category.nombre)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {children.map((child) => (
        <CategoryItem
          key={child.id}
          category={child}
          categoryMap={categoryMap}
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}
