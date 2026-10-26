import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { SpecsEditor } from '@/components/panel/products/SpecsEditor';
import { PackItemsSelector } from '@/components/panel/products/PackItemsSelector';
import { ImageUploader } from '@/components/panel/products/ImageUploader';
import { useCreateProduct, useUpdateProduct, useUpdateProductImages, useUpdatePackItems, useProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { generateSlug } from '@/lib/slug';
import type { Product, ProductType } from '@/types/database';

const productSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string().min(1, 'El slug es obligatorio'),
  descripcion_corta: z.string().optional(),
  descripcion_completa: z.string().optional(),
  tipo: z.enum(['dropshipping', 'afiliado', 'servicio', 'pack']),
  categoria_id: z.string().nullable(),
  precio: z.number().min(0, 'El precio debe ser positivo'),
  precio_coste: z.number().min(0).optional(),
  precio_rebajado: z.number().min(0).nullable().optional(),
  estado: z.enum(['borrador', 'publicado']),
  especificaciones: z.record(z.string(), z.unknown()).optional(),
  // Campos específicos por tipo
  id_aliexpress: z.string().optional(),
  plazo_entrega_dias: z.number().optional(),
  url_afiliado: z.string().optional(),
  tienda_afiliado: z.string().optional(),
  duracion_instalacion_min: z.number().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const navigate = useNavigate();
  const { data: product, isLoading: isLoadingProduct } = useProduct(productId || null);
  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const updateImagesMutation = useUpdateProductImages();
  const updatePackItemsMutation = useUpdatePackItems();

  const [images, setImages] = useState<{ url: string; orden: number; alt?: string }[]>([]);
  const [packItems, setPackItems] = useState<{ product_id: string; cantidad: number }[]>([]);
  const [autoSlug, setAutoSlug] = useState(!productId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      tipo: 'dropshipping',
      estado: 'borrador',
      precio: 0,
      precio_coste: 0,
      especificaciones: {},
    },
  });

  const tipo = watch('tipo');
  const nombre = watch('nombre');
  const precio = watch('precio');
  const precioCoste = watch('precio_coste') || 0;

  // Generar slug automáticamente
  useEffect(() => {
    if (autoSlug && nombre) {
      setValue('slug', generateSlug(nombre));
    }
  }, [nombre, autoSlug, setValue]);

  // Cargar datos del producto si estamos editando
  useEffect(() => {
    if (product) {
      setValue('nombre', product.nombre);
      setValue('slug', product.slug);
      setValue('descripcion_corta', product.descripcion_corta || '');
      setValue('descripcion_completa', product.descripcion_completa || '');
      setValue('tipo', product.tipo);
      setValue('categoria_id', product.categoria_id);
      setValue('precio', product.precio);
      setValue('precio_coste', product.precio_coste);
      setValue('precio_rebajado', product.precio_rebajado);
      setValue('estado', product.estado);
      setValue('especificaciones', product.especificaciones);
      setValue('id_aliexpress', product.id_aliexpress || '');
      setValue('plazo_entrega_dias', product.plazo_entrega_dias || 7);
      setValue('url_afiliado', product.url_afiliado || '');
      setValue('tienda_afiliado', product.tienda_afiliado || '');
      setValue('duracion_instalacion_min', product.duracion_instalacion_min || 0);

      if (product.imagenes) {
        setImages(product.imagenes.map((img) => ({
          url: img.url,
          orden: img.orden,
          alt: img.alt || undefined,
        })));
      }

      if (product.pack_items) {
        setPackItems(product.pack_items.map((item) => ({
          product_id: item.product_id,
          cantidad: item.cantidad,
        })));
      }
    }
  }, [product, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      let savedProductId = productId;

      if (productId) {
        // Actualizar producto existente
        await updateMutation.mutateAsync({ id: productId, ...data });
      } else {
        // Crear nuevo producto
        const newProduct = await createMutation.mutateAsync(data);
        savedProductId = newProduct.id;
      }

      // Actualizar imágenes
      if (savedProductId) {
        await updateImagesMutation.mutateAsync({
          productId: savedProductId,
          images,
        });

        // Actualizar items del pack si es tipo pack
        if (data.tipo === 'pack') {
          await updatePackItemsMutation.mutateAsync({
            packId: savedProductId,
            items: packItems,
          });
        }
      }

      navigate('/panel/productos');
    } catch (error) {
      alert('Error al guardar: ' + (error as Error).message);
    }
  };

  // Calcular margen
  const margen = precioCoste > 0 ? ((precio - precioCoste) / precio) * 100 : 0;

  if (isLoadingProduct && productId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7FF9]"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">
            {productId ? 'Editar producto' : 'Nuevo producto'}
          </h1>
          <p className="text-gray-500 text-sm">
            {productId ? 'Modifica los datos del producto' : 'Completa los datos del nuevo producto'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/panel/productos')}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Guardar
          </Button>
        </div>
      </div>

      {/* Información básica */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[#0B1F3A]">Información básica</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nombre del producto"
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
            <p className="text-xs text-gray-500 mt-1">
              URL amigable del producto (ej: camara-wifi-1080p)
            </p>
          </div>

          <Input
            label="Descripción corta"
            error={errors.descripcion_corta?.message}
            {...register('descripcion_corta')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción completa
            </label>
            <textarea
              {...register('descripcion_completa')}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                {...register('tipo')}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
              >
                <option value="dropshipping">Dropshipping</option>
                <option value="afiliado">Afiliado</option>
                <option value="servicio">Servicio</option>
                <option value="pack">Pack</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                {...register('categoria_id')}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
              >
                <option value="">Sin categoría</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              {...register('estado')}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
            >
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Campos específicos por tipo */}
      {tipo === 'dropshipping' && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[#0B1F3A]">Dropshipping</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Precio de coste (€)"
                type="number"
                step="0.01"
                error={errors.precio_coste?.message}
                {...register('precio_coste', { valueAsNumber: true })}
              />
              <Input
                label="Precio de venta (€)"
                type="number"
                step="0.01"
                error={errors.precio?.message}
                {...register('precio', { valueAsNumber: true })}
              />
              <Input
                label="Precio rebajado (€)"
                type="number"
                step="0.01"
                error={errors.precio_rebajado?.message}
                {...register('precio_rebajado', { valueAsNumber: true })}
              />
            </div>

            {precioCoste > 0 && precio > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-900">
                  <span className="font-medium">Margen:</span>{' '}
                  <span className="font-bold">{margen.toFixed(2)}%</span>
                  <span className="ml-2">
                    (Beneficio: {(precio - precioCoste).toFixed(2)}€)
                  </span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="ID de AliExpress"
                error={errors.id_aliexpress?.message}
                {...register('id_aliexpress')}
              />
              <Input
                label="Plazo de entrega (días)"
                type="number"
                error={errors.plazo_entrega_dias?.message}
                {...register('plazo_entrega_dias', { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {tipo === 'afiliado' && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[#0B1F3A]">Afiliado</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Precio de venta (€)"
              type="number"
              step="0.01"
              error={errors.precio?.message}
              {...register('precio', { valueAsNumber: true })}
            />

            <Input
              label="URL de afiliado"
              error={errors.url_afiliado?.message}
              {...register('url_afiliado')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tienda
              </label>
              <select
                {...register('tienda_afiliado')}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
              >
                <option value="">Seleccionar tienda</option>
                <option value="Amazon">Amazon</option>
                <option value="PcComponentes">PcComponentes</option>
                <option value="AliExpress">AliExpress</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {tipo === 'servicio' && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[#0B1F3A]">Servicio de instalación</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Precio (€)"
                type="number"
                step="0.01"
                error={errors.precio?.message}
                {...register('precio', { valueAsNumber: true })}
              />
              <Input
                label="Duración estimada (minutos)"
                type="number"
                error={errors.duracion_instalacion_min?.message}
                {...register('duracion_instalacion_min', { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {tipo === 'pack' && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[#0B1F3A]">Pack</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Precio del pack (€)"
              type="number"
              step="0.01"
              error={errors.precio?.message}
              {...register('precio', { valueAsNumber: true })}
            />

            <PackItemsSelector
              value={packItems}
              onChange={setPackItems}
              currentProductId={productId}
            />
          </CardContent>
        </Card>
      )}

      {/* Especificaciones */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[#0B1F3A]">Especificaciones</h2>
        </CardHeader>
        <CardContent>
          <SpecsEditor
            value={watch('especificaciones') || {}}
            onChange={(specs) => setValue('especificaciones', specs)}
          />
        </CardContent>
      </Card>

      {/* Imágenes */}
      {productId && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[#0B1F3A]">Imágenes</h2>
          </CardHeader>
          <CardContent>
            <ImageUploader
              productId={productId}
              images={images}
              onChange={setImages}
            />
          </CardContent>
        </Card>
      )}
    </form>
  );
}
