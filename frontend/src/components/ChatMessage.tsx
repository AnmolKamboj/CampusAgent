import { Message } from '../types';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isAgent = message.role === 'agent';

  return (
    <div className={`flex items-start gap-3 ${isAgent ? '' : 'flex-row-reverse'} animate-fadeIn`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isAgent 
          ? 'glass' 
          : 'bg-gradient-to-br from-blue-600 to-blue-700'
      }`}>
        {isAgent ? <Bot size={16} className="text-blue-400" /> : <User size={16} className="text-white" />}
      </div>
      <div className={`flex flex-col min-w-0 ${isAgent ? 'items-start' : 'items-end'}`}>
        <div className={`chat-bubble ${isAgent ? 'chat-bubble-agent' : 'chat-bubble-user'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p className={`text-xs mt-1 ${isAgent ? 'text-gray-600' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default ChatMessage;
