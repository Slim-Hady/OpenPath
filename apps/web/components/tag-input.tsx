'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export function TagInput({
  value,
  onChange,
  max,
  suggestions,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  max: number;
  suggestions: string[];
}) {
  const [draft, setDraft] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 rounded-sm border border-border bg-canvas p-2">
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-fg"
          >
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              onClick={() => onChange(value.filter((entry) => entry !== item))}
              className="text-fg-subtle hover:text-danger"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        {value.length < max ? (
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ',') return;
              event.preventDefault();
              const cleaned = draft.trim();
              if (!cleaned || value.includes(cleaned)) return;
              onChange([...value, cleaned].slice(0, max));
              setDraft('');
            }}
            placeholder="Add a skill"
            aria-label="Add a skill"
            className="h-6 w-28 border-0 bg-transparent p-0 text-[11px] focus:border-0"
          />
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {suggestions
          .filter((suggestion) => !value.includes(suggestion))
          .slice(0, 8)
          .map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onChange([...value, suggestion].slice(0, max))}
              className="inline-flex items-center gap-0.5 rounded-full border border-border-muted px-2 py-0.5 text-[10px] text-fg-subtle hover:border-border-strong hover:text-fg"
            >
              <Plus size={9} /> {suggestion}
            </button>
          ))}
      </div>
    </div>
  );
}
