/**
 * Genera un slug a partir de un texto.
 * - Convierte a minúsculas
 * - Reemplaza espacios y caracteres especiales por guiones
 * - Elimina caracteres no alfanuméricos (excepto guiones)
 * - Elimina guiones duplicados
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Eliminar guiones duplicados
    .replace(/^-|-$/g, ''); // Eliminar guiones al inicio/final
}
