
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { useChat } from '../context/chat-context';
import { useDocuments, Document } from '../context/documents-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, FileText, Trash2, Settings } from 'lucide-react';

const ChatPage = () => {
  const navigate = useNavigate();
  const { chats, activeChat, isLoading, createChat, sendMessage, deleteChat, updateChatDocuments, getDocumentsForActiveChat } = useChat();
  const { documents } = useDocuments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create a new chat if there are no chats or no active chat
  useEffect(() => {
    if (chats.length === 0 || !activeChat) {
      createChat();
    }
  }, [chats, activeChat, createChat]);

  // Initialize selected documents when opening dialog
  useEffect(() => {
    if (isDialogOpen && activeChat) {
      setSelectedDocumentIds(activeChat.documentIds);
    }
  }, [isDialogOpen, activeChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages]);

  const handleNewChat = () => {
    createChat();
  };

  const handleChatSelect = (chatId: string) => {
    navigate(`?chat=${chatId}`);
  };

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  const handleSaveDocuments = () => {
    if (activeChat) {
      updateChatDocuments(activeChat.id, selectedDocumentIds);
      setIsDialogOpen(false);
    }
  };

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocumentIds(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  const activeDocuments = getDocumentsForActiveChat();

  return (
    <AppLayout>
      <div className="flex h-screen overflow-hidden">
        {/* Chat list sidebar */}
        <div className="hidden md:block w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <Button onClick={handleNewChat} className="w-full mb-4">
              <Plus className="mr-2 h-4 w-4" /> New Chat
            </Button>
            
            <div className="space-y-1">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    activeChat?.id === chat.id ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <div className="truncate flex-1">
                    <span>{chat.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 ${
                      activeChat?.id === chat.id ? 'text-primary-foreground hover:text-primary-foreground hover:bg-primary/80' : 'text-gray-500 hover:text-red-500'
                    }`}
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
            <div>
              <h2 className="font-semibold">{activeChat?.title}</h2>
              {activeDocuments.length > 0 && (
                <p className="text-xs text-gray-500">
                  Using {activeDocuments.length} document(s)
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center"
              >
                <FileText className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Documents</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={handleNewChat}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {activeChat?.messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
            
            {isLoading && (
              <div className="flex justify-center my-4">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse animation-delay-150" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse animation-delay-300" />
                  <span className="text-sm text-gray-500 ml-1">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
      
      {/* Document selection dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Knowledge Base Documents</DialogTitle>
            <DialogDescription>
              Select documents to use as context for this chat
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto py-4 flex-1">
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map(document => (
                  <div
                    key={document.id}
                    className={`border rounded p-3 cursor-pointer ${
                      selectedDocumentIds.includes(document.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleDocumentSelection(document.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded mr-2 ${
                        selectedDocumentIds.includes(document.id) 
                          ? 'bg-primary' 
                          : 'border border-gray-400'
                      }`}>
                        {selectedDocumentIds.includes(document.id) && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <span className="truncate font-medium">{document.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      {(document.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No documents uploaded yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setIsDialogOpen(false);
                    navigate('/documents');
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Upload Documents
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDocuments}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ChatPage;
