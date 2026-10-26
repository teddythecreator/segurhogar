import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Sparkles } from 'lucide-react';
import { usePanelAssistant } from '@/hooks/useAiAssistant';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function PanelAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de IA para el panel de gestión. Puedo ayudarte a analizar datos, responder preguntas sobre pedidos, instalaciones, clientes y más.\n\nAlgunos ejemplos de lo que puedo hacer:\n- "¿Qué pedidos llevan más de 10 días sin entregar?"\n- "Resume las instalaciones de mañana"\n- "¿Cuáles son los productos más vendidos este mes?"\n- "Dame un resumen de la actividad de hoy"\n\n¿En qué puedo ayudarte?',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { askQuestion, isLoading } = usePanelAssistant();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await askQuestion(input, conversationHistory);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error al procesar tu solicitud. ¿Podrías intentar de nuevo?',
        },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="flex-shrink-0 bg-gradient-to-r from-[#2D7FF9] to-[#1e6fd9] text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">Asistente IA del Panel</h3>
        </div>
        <p className="text-xs text-white/80 mt-1">
          Analiza datos y obtén respuestas sobre tu negocio
        </p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index}>
            <div
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-[#2D7FF9] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#2D7FF9]" />
              <span className="text-sm text-gray-600">Analizando datos...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <div className="flex-shrink-0 border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregunta sobre pedidos, instalaciones, clientes..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 El asistente tiene acceso a datos reales de tu negocio según tus permisos
        </p>
      </div>
    </Card>
  );
}
