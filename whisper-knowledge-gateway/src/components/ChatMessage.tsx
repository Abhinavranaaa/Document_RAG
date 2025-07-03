import React from 'react';
import { Message } from '../context/chat-context';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // System notices (e.g. the initial prompt) can still be plain
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted px-4 py-2 rounded-lg text-sm text-muted-foreground max-w-[80%] whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex flex-col max-w-[80%] md:max-w-[70%] lg:max-w-[60%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div className="flex items-center mb-1 space-x-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isUser ? "bg-primary text-primary-foreground" : "bg-ai text-ai-foreground"
            )}
          >
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
          <span className="text-sm font-medium">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <span className="text-xs text-gray-500">
            {format(message.timestamp, 'HH:mm')}
          </span>
        </div>

        <div
      className={cn(
        "rounded-lg px-4 py-3",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}
    >
      {/* Wrapper div gets the styling */}
      <div className="whitespace-pre-wrap break-words prose prose-sm max-w-full">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
      </div>
    </div>
  );
};

export default ChatMessage;
