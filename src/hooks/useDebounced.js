import { useState, useEffect } from 'react';

/**
 * Retorna `value` com atraso de `delay` ms — só atualiza depois que o valor
 * para de mudar. Útil para campos de busca que disparam requisições, evitando
 * uma chamada (e flicker de loading) por tecla.
 */
export default function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
