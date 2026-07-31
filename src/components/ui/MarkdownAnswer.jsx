import { useMemo, useRef, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.use({ breaks: true, gfm: true });

const CITE_RE = /\[(\d+)\]/g;

export default function MarkdownAnswer({ text, className = '', citations, onCitationClick }) {
  const containerRef = useRef(null);

  const html = useMemo(() => {
    if (!text) return '';
    const rendered = DOMPurify.sanitize(marked.parse(text));
    if (!citations || citations.length === 0) return rendered;
    return rendered.replace(CITE_RE, (match, n) => {
      const ref = Number(n);
      const cite = citations.find((c) => c.ref === ref);
      if (!cite) return match;
      return `<button type="button" data-cite-ref="${ref}" class="inline-flex items-center justify-center text-[10px] font-bold text-brand bg-brand/10 dark:bg-brand/20 hover:bg-brand hover:text-white px-1.5 py-0.5 rounded leading-none align-super mx-0.5 cursor-pointer transition-colors" title="${(cite.doc_name || '').replace(/"/g, '&quot;')} · pág. ${cite.page}">${ref}</button>`;
    });
  }, [text, citations]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onCitationClick) return;
    const handler = (e) => {
      const target = e.target.closest('[data-cite-ref]');
      if (!target) return;
      const ref = Number(target.getAttribute('data-cite-ref'));
      const cite = (citations || []).find((c) => c.ref === ref);
      if (cite) onCitationClick(cite);
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [citations, onCitationClick]);

  return (
    <div
      ref={containerRef}
      className={`prose-answer ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
