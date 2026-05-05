import { useMemo } from 'react';
import { marked } from 'marked';

marked.use({
  breaks: true,
  gfm: true,
});

export default function MarkdownAnswer({ text, className = '' }) {
  const html = useMemo(() => {
    if (!text) return '';
    return marked.parse(text);
  }, [text]);

  return (
    <div
      className={`prose-answer ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
