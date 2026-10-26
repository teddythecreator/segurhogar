import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import type { ChatMessage } from '@/types';

export function AsistenteIAPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy el asistente de SegurHogar. Puedo ayudarte a elegir los productos de seguridad que mejor se adapten a tu hogar o negocio. ¿Qué necesitas proteger?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickQuestions = [
    '¿Qué cámara me recomiendas para vigilar a mi madre mayor?',
    'Necesito proteger mi pequeño negocio',
    '¿Qué pack me conviene más?',
    '¿Cómo funciona la instalación a domicilio?',
  ];

  const handleSend = async (message?: string) => {
    const text = message || input;
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulación de respuesta (en producción se llamaría a la Edge Function con Claude API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        default: `Entiendo tu consulta sobre "${text}". En un entorno real, aquí se conectaría con la API de Claude a través de una Supabase Edge Function para darte una respuesta personalizada.\n\nMientras tanto, te recomiendo:\n\n1. **Explorar nuestra tienda** para ver los productos disponibles\n2. **Consultar nuestros packs** si buscas una solución completa\n3. **Llamarnos al 900 123 456** para asesoramiento personalizado\n\n¿Puedo ayudarte con algo más?`,
      };

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses.default,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-[#2D7FF9]/10 px-4 py-2 rounded-full mb-3">
          <Sparkles className="h-4 w-4 text-[#2D7FF9]" />
          <span className="text-sm font-medium text-[#2D7FF9]">Asistente IA</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F3A]">
          ¿En qué puedo ayudarte?
        </h1>
        <p className="text-gray-500 mt-2">
          Pregúntame sobre productos, packs o qué solución de seguridad necesitas
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-[#2D7FF9] flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-[#2D7FF9] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-[#0B1F3A] flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-[#2D7FF9] flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-500 mb-2">Preguntas frecuentes:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7FF9]"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              size="sm"
              className="rounded-full px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400 text-center">
        El asistente utiliza inteligencia artificial. Las respuestas son orientativas.
        Para asesoramiento profesional, llámanos al 900 123 456.
      </p>
    </div>
  );
}
