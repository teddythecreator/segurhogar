import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Image {
  url: string;
  orden: number;
  alt: string | null;
}

interface ProductGalleryProps {
  images: Image[];
  productName: string;
  fallbackEmoji?: string;
}

export function ProductGallery({ images, productName, fallbackEmoji = '📦' }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.orden - b.orden);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasImages = sorted.length > 0;
  const currentImage = hasImages ? sorted[currentIndex] : null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? sorted.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === sorted.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      {/* Imagen principal */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
        {hasImages && currentImage ? (
          <>
            <img
              src={currentImage.url}
              alt={currentImage.alt || productName}
              className="w-full h-full object-cover"
            />
            
            {/* Controles de navegación */}
            {sorted.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                {/* Indicador */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {currentIndex + 1} / {sorted.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl">{fallbackEmoji}</span>
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {hasImages && sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sorted.map((image, index) => (
            <button
              key={image.url}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-16 w-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all',
                index === currentIndex
                  ? 'border-[#2D7FF9] ring-2 ring-[#2D7FF9]/20'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <img
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
