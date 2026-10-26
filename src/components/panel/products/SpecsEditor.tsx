import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SpecsEditorProps {
  value: Record<string, unknown>;
  onChange: (specs: Record<string, unknown>) => void;
}

interface SpecEntry {
  key: string;
  value: string;
}

export function SpecsEditor({ value, onChange }: SpecsEditorProps) {
  // Convertir objeto a array de entradas
  const [entries, setEntries] = useState<SpecEntry[]>(() => {
    return Object.entries(value || {}).map(([key, val]) => ({
      key,
      value: typeof val === 'string' ? val : JSON.stringify(val),
    }));
  });

  const handleAdd = () => {
    setEntries([...entries, { key: '', value: '' }]);
  };

  const handleRemove = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    updateParent(newEntries);
  };

  const handleChange = (index: number, field: 'key' | 'value', newValue: string) => {
    const newEntries = entries.map((entry, i) =>
      i === index ? { ...entry, [field]: newValue } : entry
    );
    setEntries(newEntries);
    updateParent(newEntries);
  };

  const updateParent = (newEntries: SpecEntry[]) => {
    const specs: Record<string, unknown> = {};
    newEntries.forEach((entry) => {
      if (entry.key.trim()) {
        // Intentar parsear como JSON, si no, usar como string
        try {
          specs[entry.key] = JSON.parse(entry.value);
        } catch {
          specs[entry.key] = entry.value;
        }
      }
    });
    onChange(specs);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          Especificaciones
        </label>
        <Button type="button" variant="ghost" size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Añadir
        </Button>
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No hay especificaciones. Haz clic en "Añadir" para crear pares clave-valor.
        </p>
      )}

      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Clave (ej: resolución)"
              value={entry.key}
              onChange={(e) => handleChange(index, 'key', e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Valor (ej: 1080p)"
              value={entry.value}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
