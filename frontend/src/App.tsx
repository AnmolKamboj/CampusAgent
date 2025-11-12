import { useState, useEffect } from 'react';
import { Message, FormData, FormType } from './types';
import ChatContainer from './components/ChatContainer';
import Sidebar from './components/Sidebar';
import AdminPanel from './components/AdminPanel';
import { chatApi } from './api/client';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [formType, setFormType] = useState<FormType | string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    startNewSession();
  }, []);

  const startNewSession = async () => {
    try {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      setMessages([]);
      setFormData({});
      setFormType(null);

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
      const response = await chatApi.sendMessage(
        sessionId,
        content,
        formData,
        formType || undefined,
        false // useAutoFill - can be enhanced later
      );

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

      if (response.formType && !formType) {
        setFormType(response.formType);
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
    if (!formType) {
      alert('Please complete the form first.');
      return;
    }

    try {
      setIsLoading(true);
      const pdfBlob = await chatApi.generatePdf(formData, formType);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formType}-${Date.now()}.pdf`;
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
    if (!formType) {
      alert('Please complete the form first.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await chatApi.generateEmail(formData, formType);
      
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

  const handleStartNew = () => {
    startNewSession();
  };

  // Show admin panel if requested
  if (showAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">CampusAgent Admin</h1>
          <button
            onClick={() => setShowAdmin(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Forms
          </button>
        </div>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Access Button */}
      <button
        onClick={() => setShowAdmin(true)}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900 shadow-lg"
        title="Admin Panel"
      >
        ⚙️ Admin
      </button>
      <Sidebar
        formData={formData}
        formType={formType}
        onStartNew={handleStartNew}
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
