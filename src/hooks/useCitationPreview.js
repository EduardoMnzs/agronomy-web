import { useState, useCallback } from 'react';
import { documents, myDocuments } from '../api/api';

function resolveApi(docId) {
  if (typeof docId === 'string' && docId.startsWith('user_')) {
    return { api: myDocuments, id: Number(docId.slice(5)) };
  }
  if (typeof docId === 'string' && docId.startsWith('session_')) {
    return null;
  }
  const id = typeof docId === 'number' ? docId : Number(docId);
  if (!Number.isFinite(id)) return null;
  return { api: documents, id };
}

export default function useCitationPreview() {
  const [activeCitation, setActiveCitation] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const openCitation = useCallback(async (source) => {
    if (!source) return;
    const resolved = resolveApi(source.doc_id);
    setActiveCitation(source);
    if (!resolved) {
      setPreviewDoc({ name: source.doc_name, file_type: '', category: '' });
      setPreviewError('Este documento não possui pré-visualização.');
      setPreviewContent({});
      return;
    }
    setPreviewContent(null);
    setPreviewError('');
    setPreviewLoading(true);
    try {
      const data = await resolved.api.get(resolved.id);
      setPreviewDoc({
        id: resolved.id,
        name: data.name || source.doc_name,
        file_type: data.file_type,
        category: data.category,
      });
      setPreviewContent(data);
    } catch (err) {
      setPreviewDoc({ name: source.doc_name, file_type: '', category: '' });
      setPreviewError(err.message || 'Não foi possível carregar o documento.');
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const closePreview = useCallback(() => {
    setPreviewDoc(null);
    setPreviewContent(null);
    setPreviewError('');
    setActiveCitation(null);
  }, []);

  return {
    activeCitation,
    previewDoc,
    previewContent,
    previewLoading,
    previewError,
    openCitation,
    closePreview,
  };
}
