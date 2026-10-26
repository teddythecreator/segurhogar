import { useState } from 'react';
import { Mail, Loader2, Copy, Check } from 'lucide-react';
import { useGenerateEmailResponse } from '@/hooks/useAiAssistant';
import { Button } from '@/components/ui/Button';

interface GenerateEmailButtonProps {
  orderStatus: string;
  orderData: Record<string, any>;
}

export function GenerateEmailButton({ orderStatus, orderData }: GenerateEmailButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const { generate, isLoading } = useGenerateEmailResponse();

  const handleGenerate = async () => {
    try {
      const response = await generate(orderStatus, orderData);
      setGeneratedEmail(response.message);
    } catch (error) {
      alert('Error al generar el email. Por favor, intenta de nuevo.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusLabels: Record<string, string> = {
    pendiente_pago: 'Pendiente de pago',
    pagado: 'Pagado',
    enviado_proveedor: 'Enviado a proveedor',
    en_transito: 'En tránsito',
    entregado: 'Entregado',
    incidencia: 'Incidencia',
    devuelto: 'Devuelto',
    cancelado: 'Cancelado',
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
        <Mail className="h-4 w-4" />
        Redactar respuesta
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#2D7FF9]" />
              Redactar email para el cliente
            </h3>

            <div className="mb-4 bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <strong>Pedido:</strong> {orderData.numero || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Estado:</strong> {statusLabels[orderStatus] || orderStatus}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Cliente:</strong> {orderData.cliente || 'N/A'}
              </p>
            </div>

            {!generatedEmail ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  La IA redactará un email profesional y cercano para informar al cliente sobre el estado del pedido.
                </p>
                <Button onClick={handleGenerate} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Redactando...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Generar email
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email generado:
                </label>
                <textarea
                  value={generatedEmail}
                  onChange={(e) => setGeneratedEmail(e.target.value)}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
                />
                <div className="flex gap-2 justify-end mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setGeneratedEmail('');
                      setShowModal(false);
                    }}
                  >
                    Cerrar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar al portapapeles
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Regenerando...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Regenerar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
