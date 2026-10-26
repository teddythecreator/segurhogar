import { useState } from 'react';
import { MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useCheckServiceZone } from '@/hooks/useServiceZones';

export function ZoneCheckerPage() {
  const [codigoPostal, setCodigoPostal] = useState('');
  const checkZone = useCheckServiceZone();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigoPostal.trim()) {
      checkZone.mutate(codigoPostal.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 rounded-2xl bg-blue-50 text-[#2D7FF9] mb-4">
          <MapPin className="h-8 w-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-3">
          ¿Instalamos en tu zona?
        </h1>
        <p className="text-gray-600">
          Introduce tu código postal para comprobar si ofrecemos servicio de instalación en tu zona
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código postal
              </label>
              <Input
                type="text"
                placeholder="Ej: 28001"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                pattern="[0-9]{5}"
                className="text-center text-lg"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={codigoPostal.length !== 5}
              isLoading={checkZone.isPending}
            >
              {checkZone.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comprobando...
                </>
              ) : (
                'Comprobar'
              )}
            </Button>
          </form>

          {/* Resultado */}
          {checkZone.data && (
            <div className="mt-6">
              {checkZone.data.disponible ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-[#22C55E] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900 mb-1">
                        ¡Sí! Instalamos en tu zona
                      </p>
                      {checkZone.data.zona && (
                        <p className="text-sm text-green-700">
                          {checkZone.data.zona.ciudad && `${checkZone.data.zona.ciudad}, `}
                          {checkZone.data.zona.provincia}
                        </p>
                      )}
                      <p className="text-sm text-green-700 mt-2">
                        Puedes contratar nuestros productos con instalación profesional.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 mb-1">
                        Aún no llegamos a tu zona
                      </p>
                      <p className="text-sm text-red-700">
                        Actualmente ofrecemos servicio de instalación en la Comunidad de Madrid y zonas limítrofes.
                      </p>
                      <p className="text-sm text-red-700 mt-2">
                        Puedes seguir comprando productos sin instalación o contactarnos para más información.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error de formato */}
          {codigoPostal.length > 0 && codigoPostal.length !== 5 && (
            <p className="mt-2 text-sm text-red-600 text-center">
              El código postal debe tener 5 dígitos
            </p>
          )}
        </CardContent>
      </Card>

      {/* Info adicional */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-2">
          ¿Tienes dudas? Contáctanos
        </p>
        <p className="text-sm text-gray-600">
          📞 900 123 456 · ✉️ info@segurhogar.es
        </p>
      </div>
    </div>
  );
}
