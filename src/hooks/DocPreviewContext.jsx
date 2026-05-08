import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { documents as docsApi, myDocuments as myDocsApi } from '../api/api';
import DocumentPreviewModal from '../components/ui/DocumentPreview';

const DocPreviewContext = createContext({ openDocument: () => {} });

export function DocPreviewProvider({ children }) {
  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openDocument = useCallback(async (docMeta, kind) => {
    setDoc({
      id: docMeta.id,
      name: docMeta.name,
      file_type: docMeta.file_type,
      category: docMeta.category,
    });
    setContent(null);
    setError('');
    setLoading(true);
    try {
      const api = kind === 'mine' ? myDocsApi : docsApi;
      const data = await api.get(docMeta.id);
      setContent(data);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar o documento.');
    } finally {
      setLoading(false);
    }
  }, []);

  const close = useCallback(() => {
    setDoc(null);
    setContent(null);
    setError('');
  }, []);

  return (
    <DocPreviewContext.Provider value={{ openDocument }}>
      {children}
      <AnimatePresence>
        {doc && (
          <DocumentPreviewModal
            doc={doc}
            loading={loading}
            error={error}
            content={content}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </DocPreviewContext.Provider>
  );
}

export function useDocPreview() {
  return useContext(DocPreviewContext);
}
