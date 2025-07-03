
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height dynamically based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "56px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    onSendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter without shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="border-t border-gray-200 bg-white p-4"
    >
      <div className="flex items-end space-x-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 min-h-[56px] max-h-[200px] resize-none py-3 px-4"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="rounded-full h-[56px] w-[56px] flex-shrink-0" 
          disabled={!message.trim() || isLoading}
        >
          <Send size={20} />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
