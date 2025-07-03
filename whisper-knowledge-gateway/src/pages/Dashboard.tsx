
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, FileText, Plus } from 'lucide-react';
import { useChat } from '../context/chat-context';
import { useDocuments } from '../context/documents-context';

const Dashboard = () => {
  const navigate = useNavigate();
  const { chats, createChat } = useChat();
  const { documents } = useDocuments();
  
  const handleNewChat = () => {
    createChat();
    navigate('/chat');
  };
  
  const handleUploadDocument = () => {
    navigate('/documents');
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" /> Chats
              </CardTitle>
              <CardDescription>
                Start new conversations or continue existing ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{chats.length}</p>
              <p className="text-sm text-gray-500">Active conversations</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNewChat} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> New Chat
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" /> Documents
              </CardTitle>
              <CardDescription>
                Manage your knowledge base documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{documents.length}</p>
              <p className="text-sm text-gray-500">Uploaded documents</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUploadDocument} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            </CardFooter>
          </Card>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              {chats.length > 0 || documents.length > 0 ? (
                <ul className="space-y-4">
                  {[...chats].sort((a, b) => 
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                  ).slice(0, 3).map(chat => (
                    <li key={chat.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer" onClick={() => {
                      navigate('/chat');
                    }}>
                      <div className="p-2 rounded-full bg-blue-100 mr-3">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{chat.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(chat.updatedAt).toLocaleDateString()} • {chat.messages.length - 1} messages
                        </p>
                      </div>
                    </li>
                  ))}
                  
                  {[...documents].sort((a, b) => 
                    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
                  ).slice(0, 3).map(doc => (
                    <li key={doc.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer" onClick={() => {
                      navigate('/documents');
                    }}>
                      <div className="p-2 rounded-full bg-green-100 mr-3">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(doc.uploadDate).toLocaleDateString()} • {(doc.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No activity yet</p>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={handleNewChat}>
                      <Plus className="mr-2 h-4 w-4" /> New Chat
                    </Button>
                    <Button onClick={handleUploadDocument} variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Upload Document
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">AWS Bedrock Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>DeepSeek Model</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  DeepSeek is a state-of-the-art large language model that excels at natural language processing tasks.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Document Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Upload documents to build your custom knowledge base for the AI to use when answering questions.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Secure Cloud Infrastructure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All processing happens on AWS Bedrock, ensuring enterprise-grade security and scalability.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
