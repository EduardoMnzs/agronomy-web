import { useState } from 'react';
import { X } from 'lucide-react';

const MAX_TAGS = 12;
const MAX_LEN = 64;

/**
 * Chips de tag editáveis. Digitar + Enter (ou vírgula) adiciona; Backspace com
 * o input vazio remove a última; × remove uma específica. Dedup case-insensitive.
 *
 * Os limites (12 tags × 64 chars) espelham `_MAX_TAGS` / `_MAX_TAG_LEN` do
 * backend em `api/routes/knowledge.py` — o servidor trunca de novo, então isto
 * é só feedback imediato, não validação de confiança.
 *
 * Props:
 *   value: string[]
 *   onChange: (string[]) => void
 *   placeholder?: string
 */
export default function TagInput({ value, onChange, placeholder }) {
  const tags = Array.isArray(value) ? value : [];
  const [draft, setDraft] = useState('');

  const commit = (raw) => {
    const tag = (raw ?? draft).trim().slice(0, MAX_LEN);
    setDraft('');
    if (!tag) return;
    if (tags.some((x) => x.toLowerCase() === tag.toLowerCase())) return;
    if (tags.length >= MAX_TAGS) return;
    onChange([...tags, tag]);
  };

  const removeAt = (idx) => onChange(tags.filter((_, i) => i !== idx));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      removeAt(tags.length - 1);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus-within:bg-white dark:focus-within:bg-[#323639] focus-within:border-brand rounded-xl transition-all">
      {tags.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-brand/10 text-brand text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeAt(idx)}
            title="Remover tag"
            className="cursor-pointer hover:bg-brand/20 rounded p-0.5 transition-colors"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => commit()}
        placeholder={tags.length >= MAX_TAGS ? '' : (placeholder ?? 'Adicionar tag…')}
        disabled={tags.length >= MAX_TAGS}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-[#131E29] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none py-0.5"
      />
    </div>
  );
}
