
import React, { useState, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import DocumentCard from '../components/DocumentCard';
import { useDocuments } from '../context/documents-context';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const DocumentsPage = () => {
  const { documents, uploadDocument, deleteDocument, isLoading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadDocument(files[i]);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };
  
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Documents</h1>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Document
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        {!isLoading && documents.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center ${
              isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-medium text-gray-900">No documents yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload documents to create your knowledge base
            </p>
            <div className="mt-6">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mx-auto"
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              or drag and drop files here
            </p>
          </div>
        ) : (
          <div
            className={`min-h-[300px] ${isDragging ? 'border-2 border-dashed border-primary bg-primary/5 rounded-lg p-4' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onDelete={deleteDocument}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-xl font-medium text-gray-900">No matching documents</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DocumentsPage;
