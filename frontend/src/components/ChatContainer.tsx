import { useEffect, useRef } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Menu } from 'lucide-react';

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  onToggleSidebar: () => void;
}

function ChatContainer({ messages, onSendMessage, onFileUpload, isLoading, onToggleSidebar }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="header-glass-blur px-4 py-4 flex items-center space-x-4 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors glow-subtle"
        >
          <Menu size={20} className="text-gray-400" />
        </button>
        <h1 className="text-xl font-semibold text-gray-100 tracking-tight">CampusAgent</h1>
      </div>

      {/* Messages - Centered like ChatGPT */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
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
          <div className="flex justify-start animate-fadeIn">
            <div className="chat-bubble chat-bubble-agent">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce loading-pulse" style={{ boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce loading-pulse" style={{ animationDelay: '150ms', boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce loading-pulse" style={{ animationDelay: '300ms', boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - Centered */}
      <div className="flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSendMessage={onSendMessage} onFileUpload={onFileUpload} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;
