import { useState } from 'react';
import { Cookie, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCookieConsent, applyCookiePreferences } from '@/stores/cookie-consent-store';
import { Link } from 'react-router-dom';

export function CookieBanner() {
  const { hasConsented, bannerVisible, setConsent, preferences } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [tempPreferences, setTempPreferences] = useState(preferences);

  if (hasConsented && !bannerVisible) {
    return null;
  }

  const handleAcceptAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setConsent(newPreferences);
    applyCookiePreferences(newPreferences);
  };

  const handleRejectAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setConsent(newPreferences);
    applyCookiePreferences(newPreferences);
  };

  const handleSaveSettings = () => {
    setConsent(tempPreferences);
    applyCookiePreferences(tempPreferences);
    setShowSettings(false);
  };

  return (
    <>
      {/* Banner principal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <Cookie className="h-6 w-6 text-[#2D7FF9] mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-[#0B1F3A] mb-1">
                    Utilizamos cookies
                  </h3>
                  <p className="text-sm text-gray-600">
                    Usamos cookies para mejorar tu experiencia, analizar el tráfico y
                    personalizar el contenido. Puedes aceptar todas, rechazar las no esenciales o
                    configurar tus preferencias. Consulta nuestra{' '}
                    <Link to="/cookies" className="text-[#2D7FF9] hover:underline">
                      Política de Cookies
                    </Link>.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="w-full sm:w-auto"
              >
                <Settings className="h-4 w-4 mr-1" />
                Configurar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                className="w-full sm:w-auto"
              >
                Rechazar
              </Button>
              <Button size="sm" onClick={handleAcceptAll} className="w-full sm:w-auto">
                Aceptar todas
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de configuración */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0B1F3A]">Configuración de cookies</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-600">
                Personaliza tus preferencias de cookies. Las cookies necesarias son esenciales
                para el funcionamiento del sitio web y no se pueden desactivar.
              </p>

              {/* Cookies necesarias */}
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0B1F3A] mb-1">
                      Cookies necesarias
                    </h3>
                    <p className="text-sm text-gray-600">
                      Esenciales para el funcionamiento del sitio web. Incluyen cookies de
                      sesión, carrito de compra y preferencias de privacidad.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-[#2D7FF9] rounded-full relative cursor-not-allowed">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">Siempre activas</p>
                  </div>
                </div>
              </div>

              {/* Cookies analíticas */}
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0B1F3A] mb-1">
                      Cookies analíticas
                    </h3>
                    <p className="text-sm text-gray-600">
                      Nos ayudan a entender cómo los visitantes interactúan con el sitio web,
                      recopilando información de forma anónima.
                    </p>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li>• Google Analytics</li>
                      <li>• Métricas de rendimiento</li>
                      <li>• Análisis de tráfico</li>
                    </ul>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempPreferences.analytics}
                        onChange={(e) =>
                          setTempPreferences({
                            ...tempPreferences,
                            analytics: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2D7FF9] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2D7FF9]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Cookies de marketing */}
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0B1F3A] mb-1">
                      Cookies de marketing
                    </h3>
                    <p className="text-sm text-gray-600">
                      Se utilizan para mostrar anuncios relevantes y rastrear la eficacia de las
                      campañas publicitarias.
                    </p>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li>• Facebook Pixel</li>
                      <li>• Google Ads</li>
                      <li>• Publicidad personalizada</li>
                    </ul>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempPreferences.marketing}
                        onChange={(e) =>
                          setTempPreferences({
                            ...tempPreferences,
                            marketing: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2D7FF9] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2D7FF9]"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveSettings} className="flex-1">
                  Guardar preferencias
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
