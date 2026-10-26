import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send, Loader2 } from 'lucide-react';
import { useShopAssistant } from '@/hooks/useAiAssistant';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Link } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
}

export function ShopAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente de SegurHogar. Estoy aquí para ayudarte a encontrar los productos de seguridad perfectos para tu hogar o negocio.\n\nPara empezar, ¿podrías contarme qué tipo de vivienda o negocio tienes? (casa, piso, local, oficina...)',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { askQuestion, isLoading } = useShopAssistant();

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
        products: response.products,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error. ¿Podrías intentar de nuevo?',
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#2D7FF9] text-white rounded-full p-4 shadow-lg hover:bg-[#1e6fd9] transition-all hover:scale-105 z-50"
        aria-label="Abrir asistente"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] shadow-2xl z-50 flex flex-col">
      <CardHeader className="flex-shrink-0 flex items-center justify-between bg-[#2D7FF9] text-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-semibold">Asistente SegurHogar</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded p-1 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
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
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-[#2D7FF9] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>

            {/* Mostrar productos recomendados */}
            {message.products && message.products.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/producto/${product.slug}`}
                    className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-[#2D7FF9] hover:shadow-md transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {product.tipo === 'pack' ? '📦' : '🛡️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                          {product.nombre}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.tipo === 'pack' ? 'Pack completo' : product.tipo}
                        </p>
                        <p className="text-sm font-bold text-[#2D7FF9] mt-1">
                          {product.precio.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <div className="flex-shrink-0 border-t p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
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
      </div>
    </Card>
  );
}
