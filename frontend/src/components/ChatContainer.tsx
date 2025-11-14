import { useEffect, useRef } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

function ChatContainer({ messages, onSendMessage, onFileUpload, isLoading }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="header-glass px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100 tracking-tight">CampusAgent</h1>
        <p className="text-sm text-gray-400">AI-powered form assistant</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="glass-card p-8 mb-6">
                <h2 className="text-2xl font-light text-gray-200 mb-3">Welcome to CampusAgent</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Upload a PDF form and I'll help you fill it out through natural conversation
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-4 hover:scale-105 transition-transform cursor-pointer">
                  <p className="text-sm text-gray-300">Upload PDF</p>
                  <p className="text-xs text-gray-500 mt-1">Start with a document</p>
                </div>
                <div className="glass-card p-4 hover:scale-105 transition-transform cursor-pointer">
                  <p className="text-sm text-gray-300">Quick Fill</p>
                  <p className="text-xs text-gray-500 mt-1">Fast completion</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex items-start space-x-3 animate-fadeIn">
            <div className="flex-shrink-0 w-8 h-8 rounded-full glass flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="chat-bubble chat-bubble-agent">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce loading-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce loading-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce loading-pulse" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} onFileUpload={onFileUpload} isLoading={isLoading} />
    </div>
  );
}

export default ChatContainer;
