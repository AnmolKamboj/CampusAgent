import { useState, useEffect } from 'react';
import { Message, FormData } from './types';
import ChatContainer from './components/ChatContainer';
import Sidebar from './components/Sidebar';
import { chatApi } from './api/client';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);

  useEffect(() => {
    startNewSession();
  }, []);

  const startNewSession = async () => {
    try {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      setMessages([]);
      setFormData({});
      setPdfUrl(null);
      setEmailDraft(null);

      const response = await chatApi.startNewSession();
      
      const welcomeMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: response.message,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error starting session:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: 'Sorry, I encountered an error starting a new session. Please try again.',
        timestamp: new Date(),
      };
      setMessages([errorMessage]);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(sessionId, content, formData);

      const agentMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);

      if (response.formData) {
        setFormData((prev) => ({ ...prev, ...response.formData }));
      }

      if (response.pdfUrl) {
        setPdfUrl(response.pdfUrl);
      }

      if (response.emailDraft) {
        setEmailDraft(response.emailDraft);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsLoading(true);
      const pdfBlob = await chatApi.generatePdf(sessionId, formData);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `change-of-major-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please ensure all required fields are filled.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateEmail = async () => {
    try {
      setIsLoading(true);
      const response = await chatApi.generateEmail(sessionId, formData);
      setEmailDraft(response.emailDraft);
      
      const emailMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: `Here's your email draft:\n\n${response.emailDraft}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, emailMessage]);
    } catch (error) {
      console.error('Error generating email:', error);
      alert('Failed to generate email. Please ensure all required fields are filled.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        formData={formData}
        onStartNew={startNewSession}
        onDownloadPdf={handleDownloadPdf}
        onGenerateEmail={handleGenerateEmail}
        isLoading={isLoading}
      />
      <ChatContainer
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;

