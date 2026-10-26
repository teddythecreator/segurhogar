import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        to="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-[#2D7FF9] mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver al inicio
      </Link>

      <article className="prose prose-sm max-w-none">
        <h1 className="text-3xl font-bold text-[#0B1F3A] mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-8">
          Última actualización: {lastUpdated}
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ IMPORTANTE:</strong> Los campos marcados con{' '}
            <code className="bg-yellow-100 px-1 rounded">[COMO_ESTO]</code> deben ser
            rellenados con tus datos reales antes de publicar la web.
          </p>
        </div>

        <div className="space-y-6 text-gray-700 leading-relaxed">{children}</div>
      </article>
    </div>
  );
}
