import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isAgent = message.role === 'agent';

  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
      <div className={`flex flex-col min-w-0 ${isAgent ? 'items-start' : 'items-end'} max-w-[80%]`}>
        <div className={`chat-bubble ${isAgent ? 'chat-bubble-agent' : 'chat-bubble-user'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p className={`text-xs mt-1.5 ${isAgent ? 'text-gray-600' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default ChatMessage;
