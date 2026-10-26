import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'product-images';

/**
 * Sube una imagen a Supabase Storage
 * @param file Archivo de imagen
 * @param productId ID del producto (para organizar en carpetas)
 * @returns URL pública de la imagen
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<{ url: string; path: string }> {
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no puede superar los 5MB');
  }

  // Generar nombre único
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${fileName}`;

  // Subir archivo
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Error al subir la imagen: ${uploadError.message}`);
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

/**
 * Elimina una imagen de Supabase Storage
 * @param path Ruta del archivo en el bucket
 */
export async function deleteProductImage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw new Error(`Error al eliminar la imagen: ${error.message}`);
  }
}

/**
 * Obtiene las URLs públicas de las imágenes de un producto
 */
export function getPublicImageUrl(path: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  
  return data.publicUrl;
}
