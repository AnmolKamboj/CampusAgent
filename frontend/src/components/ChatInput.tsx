import { useState, KeyboardEvent, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

function ChatInput({ onSendMessage, onFileUpload, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    } else if (file) {
      alert('Please select a PDF file');
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="px-4 py-4">
      <div className="glass rounded-2xl p-2 flex items-end space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={handleAttachClick}
          disabled={isLoading}
          className="flex items-center justify-center p-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-gray-400 hover:text-gray-200 glow-on-hover flex-shrink-0"
          title="Upload PDF"
        >
          <Paperclip size={20} />
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Message CampusAgent..."
          className="flex-1 resize-none bg-transparent text-gray-100 placeholder-gray-500 px-3 py-2.5 focus:outline-none max-h-32 overflow-y-auto"
          style={{ minHeight: '44px' }}
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          className="flex items-center justify-center p-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-white glow-on-hover flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
      <p className="text-xs text-gray-600 text-center mt-2">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
}

export default ChatInput;

