import React from 'react';
import { Document } from '../context/documents-context';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

// (Optional) Map language codes to full names:
const LANGUAGE_NAME: Record<string, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  de: "German",
  und: "Unknown",
  // …add more if needed
};

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDelete,
  selectMode = false,
  isSelected = false,
  onToggleSelect
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(document.id);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const cardClickHandler = () => {
    if (selectMode && onToggleSelect) {
      onToggleSelect(document.id);
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all ${
        selectMode
          ? (isSelected ? 'border-primary shadow-md' : 'hover:border-gray-300')
          : 'hover:shadow-md'
      }`}
      onClick={cardClickHandler}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <FileText className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <CardTitle className="text-base font-medium">{document.name}</CardTitle>
              <p className="text-sm text-gray-500">
                {formatFileSize(document.size)} • {document.type} •{' '}
                <span className="capitalize">
                  {LANGUAGE_NAME[document.language] ?? document.language}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Uploaded {formatDistanceToNow(document.uploadDate, { addSuffix: true })}
              </p>
            </div>
          </div>
          {!selectMode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 text-gray-500 hover:text-red-500"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {document.content && (
          <p className="text-sm text-gray-600 line-clamp-2 overflow-hidden">
            {document.content.substring(0, 100)}…
          </p>
        )}
        {selectMode && (
          <div className="mt-2">
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleSelect) onToggleSelect(document.id);
              }}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
