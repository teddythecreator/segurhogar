import { useMutation } from '@tanstack/react-query';
import { callEdgeFunction } from '@/lib/edge-functions';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AiRequest {
  endpoint: 'shop-assistant' | 'panel-assistant' | 'product-description' | 'email-response';
  messages: ChatMessage[];
  context?: Record<string, any>;
}

interface AiResponse {
  message: string;
  tokens_used: {
    input: number;
    output: number;
  };
  products?: any[];
}

export function useAiAssistant() {
  const mutation = useMutation({
    mutationFn: async (request: AiRequest): Promise<AiResponse> => {
      const response = await callEdgeFunction('ai-assistant', {
        method: 'POST',
        body: request,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error al procesar la solicitud de IA');
      }

      return response.data as AiResponse;
    },
  });

  return {
    sendMessage: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// Hook específico para el asistente de tienda
export function useShopAssistant() {
  const { sendMessage, isLoading, error, reset } = useAiAssistant();

  const askQuestion = async (question: string, conversationHistory: ChatMessage[] = []) => {
    const messages: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: question },
    ];

    return sendMessage({
      endpoint: 'shop-assistant',
      messages,
    });
  };

  return {
    askQuestion,
    isLoading,
    error,
    reset,
  };
}

// Hook específico para el asistente del panel
export function usePanelAssistant() {
  const { sendMessage, isLoading, error, reset } = useAiAssistant();

  const askQuestion = async (question: string, conversationHistory: ChatMessage[] = []) => {
    const messages: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: question },
    ];

    return sendMessage({
      endpoint: 'panel-assistant',
      messages,
    });
  };

  return {
    askQuestion,
    isLoading,
    error,
    reset,
  };
}

// Hook para generar descripción de producto
export function useGenerateProductDescription() {
  const { sendMessage, isLoading, error, reset } = useAiAssistant();

  const generate = async (productName: string, productData: Record<string, any>) => {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Genera una descripción atractiva y especificaciones técnicas para el producto "${productName}" con estos datos: ${JSON.stringify(productData)}`,
      },
    ];

    return sendMessage({
      endpoint: 'product-description',
      messages,
      context: { productName, productData },
    });
  };

  return {
    generate,
    isLoading,
    error,
    reset,
  };
}

// Hook para generar respuesta de email
export function useGenerateEmailResponse() {
  const { sendMessage, isLoading, error, reset } = useAiAssistant();

  const generate = async (orderStatus: string, orderData: Record<string, any>) => {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Redacta un email profesional y cercano para informar al cliente sobre el estado "${orderStatus}" del pedido. Datos del pedido: ${JSON.stringify(orderData)}`,
      },
    ];

    return sendMessage({
      endpoint: 'email-response',
      messages,
      context: { orderStatus, orderData },
    });
  };

  return {
    generate,
    isLoading,
    error,
    reset,
  };
}
