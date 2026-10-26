import { Card, CardContent } from '@/components/ui/Card';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1F3A]">{title}</h1>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">🔧</div>
          <p className="text-gray-600">
            Esta sección se implementará en los siguientes pasos del proyecto.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Se conectará a Supabase para gestionar datos reales.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
