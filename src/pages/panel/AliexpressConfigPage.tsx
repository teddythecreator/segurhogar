import { useState } from 'react';
import { useAliexpressTokenStatus, useGenerateAliexpressToken, useSyncAliexpressProducts, useAliexpressConfig, useUpdateAliexpressConfig, useAliexpressErrors, useClearAliexpressErrors } from '@/hooks/useAliexpress';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Trash2, ExternalLink } from 'lucide-react';

export function AliexpressConfigPage() {
  const { data: tokenStatus, isLoading: loadingToken } = useAliexpressTokenStatus();
  const { data: config } = useAliexpressConfig();
  const { data: errors } = useAliexpressErrors(20);
  const generateToken = useGenerateAliexpressToken();
  const syncProducts = useSyncAliexpressProducts();
  const updateConfig = useUpdateAliexpressConfig();
  const clearErrors = useClearAliexpressErrors();

  const [authCode, setAuthCode] = useState('');
  const [syncResult, setSyncResult] = useState<any>(null);

  const isTokenValid = tokenStatus && new Date((tokenStatus as any).expires_at) > new Date();
  const tokenExpiresIn = tokenStatus 
    ? Math.max(0, Math.floor((new Date((tokenStatus as any).expires_at).getTime() - Date.now()) / 1000 / 60))
    : 0;

  const handleGenerateToken = async () => {
    if (!authCode.trim()) {
      alert('Introduce el código de autorización');
      return;
    }
    try {
      await generateToken.mutateAsync(authCode);
      setAuthCode('');
      alert('Token generado correctamente');
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  };

  const handleSync = async () => {
    try {
      const result = await syncProducts.mutateAsync() as any;
      setSyncResult(result);
      alert(`Sincronización completada: ${result.synced} productos actualizados, ${result.errors} errores`);
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  };

  const handleUpdateConfig = async (key: string, value: any) => {
    try {
      await updateConfig.mutateAsync({ key, value });
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F3A]">AliExpress Dropshipping</h1>
        <p className="text-gray-500 text-sm">Configuración y gestión de la integración</p>
      </div>

      {/* Estado del token */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#0B1F3A]">Estado de conexión</h2>
            {isTokenValid ? (
              <Badge variant="success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="danger">
                <AlertCircle className="h-3 w-3 mr-1" />
                Desconectado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingToken ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : tokenStatus ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Cuenta</p>
                  <p className="font-medium">{(tokenStatus as any).account || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Seller ID</p>
                  <p className="font-medium">{(tokenStatus as any).seller_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Expira en</p>
                  <p className="font-medium">
                    {tokenExpiresIn > 60 
                      ? `${Math.floor(tokenExpiresIn / 60)}h ${tokenExpiresIn % 60}m`
                      : `${tokenExpiresIn}m`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Refresh token válido hasta</p>
                  <p className="font-medium">
                    {new Date((tokenStatus as any).refresh_expires_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">No hay token configurado</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Para autorizar la aplicación, visita el portal de AliExpress y obtén un código de autorización:
            </p>
            <a
              href="https://openservice.aliexpress.com/doc/doc.htm?nodeId=27493&docId=118729#/?docId=1364"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#2D7FF9] hover:underline inline-flex items-center gap-1 mb-3"
            >
              <ExternalLink className="h-3 w-3" />
              Guía de autorización
            </a>
            <div className="flex gap-2">
              <Input
                placeholder="Código de autorización"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
              />
              <Button
                onClick={handleGenerateToken}
                isLoading={generateToken.isPending}
              >
                Autorizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[#0B1F3A]">Configuración</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margen por defecto (%)
              </label>
              <Input
                type="number"
                value={config?.default_margin_percent || 30}
                onChange={(e) => handleUpdateConfig('default_margin_percent', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margen mínimo para alertas (%)
              </label>
              <Input
                type="number"
                value={config?.min_margin_percent || 15}
                onChange={(e) => handleUpdateConfig('min_margin_percent', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervalo de sincronización (horas)
              </label>
              <Input
                type="number"
                value={config?.sync_interval_hours || 6}
                onChange={(e) => handleUpdateConfig('sync_interval_hours', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config?.auto_sync_enabled === 'true'}
                onChange={(e) => handleUpdateConfig('auto_sync_enabled', e.target.checked ? 'true' : 'false')}
                className="h-4 w-4 text-[#2D7FF9] rounded"
              />
              <div>
                <p className="font-medium text-sm">Sincronización automática</p>
                <p className="text-xs text-gray-500">Actualiza precios y stock periódicamente</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config?.auto_create_orders === 'true'}
                onChange={(e) => handleUpdateConfig('auto_create_orders', e.target.checked ? 'true' : 'false')}
                className="h-4 w-4 text-[#2D7FF9] rounded"
              />
              <div>
                <p className="font-medium text-sm">Crear pedidos automáticamente</p>
                <p className="text-xs text-gray-500">Envía pedidos a AliExpress al pagar</p>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleSync}
              isLoading={syncProducts.isPending}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar productos ahora
            </Button>
            {syncResult && (
              <p className="text-sm text-gray-600 mt-2">
                Última sincronización: {syncResult.synced} actualizados, {syncResult.errors} errores, {syncResult.alerts?.length || 0} alertas
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Errores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#0B1F3A]">
              Registro de errores ({errors?.length || 0})
            </h2>
            {errors && errors.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearErrors.mutate()}
                disabled={clearErrors.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!errors || errors.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <CheckCircle className="h-8 w-8 text-[#22C55E] mx-auto mb-2" />
              No hay errores registrados
            </div>
          ) : (
            <div className="divide-y max-h-96 overflow-y-auto">
              {errors.map((error: any) => (
                <div key={error.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="danger">{error.endpoint}</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(error.created_at).toLocaleString('es-ES')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#0B1F3A]">
                        {error.error_code}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {error.error_message}
                      </p>
                      {error.request_data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">
                            Ver datos de la petición
                          </summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(error.request_data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
