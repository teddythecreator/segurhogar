import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useGenerateProductDescription } from '@/hooks/useAiAssistant';
import { Button } from '@/components/ui/Button';

interface GenerateDescriptionButtonProps {
  productName: string;
  productData: Record<string, any>;
  onGenerated: (description: string, specs: Record<string, any>) => void;
}

export function GenerateDescriptionButton({
  productName,
  productData,
  onGenerated,
}: GenerateDescriptionButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { generate, isLoading } = useGenerateProductDescription();

  const handleGenerate = async () => {
    try {
      const response = await generate(productName, productData);
      
      // Parsear la respuesta para extraer descripción y especificaciones
      // La respuesta debería venir en formato JSON
      try {
        const parsed = JSON.parse(response.message);
        onGenerated(parsed.description, parsed.specifications);
        setShowModal(false);
      } catch {
        // Si no es JSON, mostrar el texto completo como descripción
        onGenerated(response.message, {});
        setShowModal(false);
      }
    } catch (error) {
      alert('Error al generar la descripción. Por favor, intenta de nuevo.');
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Generar con IA
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#2D7FF9]" />
              Generar descripción con IA
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                La IA generará una descripción atractiva y especificaciones técnicas basadas en:
              </p>
              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>Nombre del producto: <strong>{productName}</strong></li>
                <li>Tipo: <strong>{productData.tipo || 'No especificado'}</strong></li>
                <li>Categoría: <strong>{productData.categoria || 'No especificada'}</strong></li>
                <li>Precio: <strong>{productData.precio || 'No especificado'} €</strong></li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-900">
                💡 <strong>Consejo:</strong> Cuantos más detalles proporciones en el nombre y datos del producto, mejor será la descripción generada.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generar descripción
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
