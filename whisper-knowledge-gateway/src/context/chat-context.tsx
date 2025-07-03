import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDocuments, Document } from './documents-context';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  isLoading: boolean;
  createChat: (title?: string) => void;
  setActiveChat: (chatId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  deleteChat: (chatId: string) => void;
  updateChatDocuments: (chatId: string, documentIds: string[]) => void;
  getDocumentsForActiveChat: () => Document[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
};

const CHAT_URL = import.meta.env.VITE_CHAT_URL as string;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChatState] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getDocumentById } = useDocuments();

  // load chats
  useEffect(() => {
    const stored = localStorage.getItem('deepchat_chats');
    if (stored) {
      try {
        const parsed: any[] = JSON.parse(stored);
        const hydrated = parsed.map(c => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
        setChats(hydrated);
        if (hydrated.length) setActiveChatState(hydrated[0]);
      } catch {
        localStorage.removeItem('deepchat_chats');
      }
    }
  }, []);

  // persist chats
  useEffect(() => {
    if (chats.length) {
      localStorage.setItem(
        'deepchat_chats',
        JSON.stringify(chats.map(c => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          messages: c.messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() })),
        })))
      );
    }
  }, [chats]);

  const createChat = (title?: string) => {
    const now = new Date();
    const newChat: Chat = {
      id: `chat_${now.getTime()}`,
      title: title ?? `New Chat ${chats.length + 1}`,
      messages: [{
        id: `msg_${now.getTime()}`,
        role: 'system',
        content: 'I am your DeepSeek AI assistant. How can I help?',
        timestamp: now,
      }],
      documentIds: [],
      createdAt: now,
      updatedAt: now,
    };
    setChats(prev => [...prev, newChat]);
    setActiveChatState(newChat);
  };

  const setActiveChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId) ?? null;
    setActiveChatState(chat);
  };

  const updateActiveChat = (mutator: (c: Chat) => Chat) => {
    if (!activeChat) return;
    const updated = mutator(activeChat);
    setChats(cs => cs.map(c => (c.id === updated.id ? updated : c)));
    setActiveChatState(updated);
  };

  const sendMessage = async (content: string) => {
    if (!activeChat) {
      toast.error('No active chat');
      return;
    }
    setIsLoading(true);
    try {
      // 1️⃣ append user message
      const userMsg: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      updateActiveChat(chat => ({
        ...chat,
        messages: [...chat.messages, userMsg],
        updatedAt: new Date(),
      }));

      // 2️⃣ call backend
      const payload = {
        chatId: activeChat.id,
        history: [...activeChat.messages, userMsg],
        documentIds: activeChat.documentIds,
        question: content,
      };
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Chat API error (${res.status})`);
      const { answer }: { answer: string } = await res.json();

      // 3️⃣ append assistant message
      const assistantMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      };
      updateActiveChat(chat => ({
        ...chat,
        messages: [...chat.messages, assistantMsg],
        updatedAt: new Date(),
      }));
    } catch (err: any) {
      toast.error(`Chat error: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = (chatId: string) => {
    const filtered = chats.filter(c => c.id !== chatId);
    setChats(filtered);
    if (activeChat?.id === chatId) {
      setActiveChatState(filtered[0] ?? null);
    }
    if (!filtered.length) localStorage.removeItem('deepchat_chats');
    toast.info('Chat deleted');
  };

  const updateChatDocuments = (chatId: string, documentIds: string[]) => {
    setChats(cs =>
      cs.map(c => c.id === chatId ? { ...c, documentIds, updatedAt: new Date() } : c)
    );
    if (activeChat?.id === chatId) {
      setActiveChatState({ ...activeChat, documentIds, updatedAt: new Date() });
    }
    toast.success('Chat documents updated');
  };

  const getDocumentsForActiveChat = () => {
    if (!activeChat) return [];
    return activeChat.documentIds
      .map(id => getDocumentById(id))
      .filter((d): d is Document => !!d);
  };

  return (
    <ChatContext.Provider value={{
      chats,
      activeChat,
      isLoading,
      createChat,
      setActiveChat,
      sendMessage,
      deleteChat,
      updateChatDocuments,
      getDocumentsForActiveChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};
