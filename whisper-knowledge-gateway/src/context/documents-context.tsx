import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  language: string;
  content?: string;  // ← make content optional
}

interface DocumentsContextType {
  documents: Document[];
  isLoading: boolean;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (id: string) => void;
  getDocumentById: (id: string) => Document | undefined;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);
export const useDocuments = () => {
  const context = useContext(DocumentsContext);
  if (!context) throw new Error('useDocuments must be used within a DocumentsProvider');
  return context;
};

const LIST_URL = import.meta.env.VITE_LIST_URL as string;
const PRESIGN_URL = import.meta.env.VITE_PRESIGN_URL as string;

export const DocumentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1) Fetch existing documents (with language) from S3 on mount
  useEffect(() => {
    const loadFromS3 = async () => {
      try {
        const res = await fetch(LIST_URL);
        if (!res.ok) throw new Error(`List failed (${res.status})`);

        // Backend returns: [{ id, name, size, type, uploadDate (ISO string), language }, …]
        const data: (Omit<Document, 'uploadDate' | 'content'> & { uploadDate: string })[] = await res.json();

        // Convert uploadDate back to Date objects
        const parsed: Document[] = data.map(d => ({
          id: d.id,
          name: d.name,
          size: d.size,
          type: d.type,
          uploadDate: new Date(d.uploadDate),
          language: d.language || 'und',
          // content remains undefined (we only store metadata here)
        }));

        setDocuments(parsed);

        // Also seed localStorage (in case your UI still reads from it on reload)
        localStorage.setItem(
          'deepchat_documents',
          JSON.stringify(parsed.map(doc => ({ ...doc, uploadDate: doc.uploadDate.toISOString() })))
        );
      } catch (err) {
        console.error('ListDocuments error: ', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFromS3();
  }, []);

  // 2) Persist metadata whenever documents change (optional, for offline reload)
  useEffect(() => {
    if (documents.length) {
      localStorage.setItem(
        'deepchat_documents',
        JSON.stringify(
          documents.map(d => ({ ...d, uploadDate: d.uploadDate.toISOString() }))
        )
      );
    }
  }, [documents]);

  // 3) uploadDocument (same as before, except we rely on the Language-Detect Lambda to tag it)
  const uploadDocument = async (file: File): Promise<void> => {
    setIsLoading(true);
    try {
      // 3.1) Presign request
      const presignRes = await fetch(PRESIGN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      });
      if (!presignRes.ok) {
        const text = await presignRes.text();
        throw new Error(`Presign failed (${presignRes.status}): ${text}`);
      }
      const { url, fields }: { url?: string; fields?: Record<string, string> } = await presignRes.json();
      if (!url || !fields) throw new Error('Invalid presign response');

      // 3.2) Upload to S3 via presigned POST
      const form = new FormData();
      Object.entries(fields).forEach(([k, v]) => form.append(k, v));
      form.append('file', file);

      const uploadRes = await fetch(url, { method: 'POST', body: form });
      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(`S3 upload failed (${uploadRes.status}): ${text}`);
      }

      // 3.3) Immediately add a "placeholder" document to state with unknown language;
      //      the Language-Detect Lambda will tag it shortly in S3, and next time ListDocuments runs,
      //      you’ll see the correct language.
      const newDoc: Document = {
        id: fields.key,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        language: 'und', // unknown until Lambda tags it
        content: undefined
      };
      setDocuments(prev => [...prev, newDoc]);
      toast.success(`Uploaded "${file.name}" – language detection in progress…`);
    } catch (err: any) {
      console.error('uploadDocument error:', err);
      toast.error(`Upload error: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 4) deleteDocument (local UI only – does NOT remove from S3)
  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    toast.info('Document removed');
  };

  const getDocumentById = (id: string) => documents.find(d => d.id === id);

  return (
    <DocumentsContext.Provider value={{ documents, isLoading, uploadDocument, deleteDocument, getDocumentById }}>
      {children}
    </DocumentsContext.Provider>
  );
};
