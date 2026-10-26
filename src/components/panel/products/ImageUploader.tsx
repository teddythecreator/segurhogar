import { useState, useRef } from 'react';
import { Upload, X, GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { uploadProductImage } from '@/lib/storage';

interface ImageUploaderProps {
  productId: string;
  images: { url: string; orden: number; alt?: string }[];
  onChange: (images: { url: string; orden: number; alt?: string }[]) => void;
}

export function ImageUploader({ productId, images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newImages: { url: string; orden: number; alt?: string }[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { url } = await uploadProductImage(file, productId);
        newImages.push({
          url,
          orden: images.length + i,
        });
      }

      onChange([...images, ...newImages]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al subir imágenes');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, orden: i }));
    onChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    
    // Reordenar
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    
    // Actualizar órdenes
    const reordered = newImages.map((img, i) => ({ ...img, orden: i }));
    onChange(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Imágenes del producto
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Subir imágenes
            </>
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#2D7FF9] transition-colors"
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            Haz clic para subir imágenes o arrastra archivos aquí
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG hasta 5MB. Máximo recomendado: 5 imágenes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images
            .sort((a, b) => a.orden - b.orden)
            .map((image, index) => (
              <div
                key={image.url}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                  draggedIndex === index ? 'border-[#2D7FF9] opacity-50' : 'border-transparent'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay con controles */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div className="cursor-move text-white">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1 bg-red-600 rounded text-white hover:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Badge de orden */}
                <div className="absolute top-1 left-1 bg-[#2D7FF9] text-white text-xs px-2 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-500">
          💡 Arrastra las imágenes para reordenarlas. La primera será la imagen principal.
        </p>
      )}
    </div>
  );
}
