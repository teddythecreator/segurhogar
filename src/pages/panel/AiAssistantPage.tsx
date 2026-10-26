import { PanelAssistantChat } from '@/components/panel/PanelAssistantChat';

export function AiAssistantPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Asistente IA</h1>
        <p className="text-gray-600 mt-1">
          Analiza datos y obtén respuestas sobre tu negocio con inteligencia artificial
        </p>
      </div>

      <PanelAssistantChat />
    </div>
  );
}
