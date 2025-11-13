import { Message } from '../types';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isAgent = message.role === 'agent';

  return (
    <div className={`flex items-start space-x-3 ${isAgent ? '' : 'flex-row-reverse space-x-reverse'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
        isAgent ? 'bg-primary-100 text-primary-600' : 'bg-primary-600 text-white'
      }`}>
        {isAgent ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className={`chat-bubble ${isAgent ? 'chat-bubble-agent' : 'chat-bubble-user'} shadow-sm`}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-2 opacity-70 ${isAgent ? 'text-gray-500' : 'text-white'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default ChatMessage;
