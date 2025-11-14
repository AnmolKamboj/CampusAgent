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
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    startNewSession();
  }, []);

  const startNewSession = async () => {
    try {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      setMessages([]);
      setFormData({});
      setPdfUploaded(false);

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
        formData
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

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    try {
      setIsLoading(true);
      const response = await chatApi.uploadPdf(sessionId, file);
      
      setPdfUploaded(true);
      
      const uploadMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: response.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, uploadMessage]);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: 'Sorry, I encountered an error uploading your PDF. Please make sure it has fillable fields.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfUploaded) {
      alert('Please upload a PDF form first.');
      return;
    }

    try {
      setIsLoading(true);
      const pdfBlob = await chatApi.generatePdf(sessionId, formData);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `filled-form-${Date.now()}.pdf`;
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
    if (!pdfUploaded) {
      alert('Please upload a PDF form first.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await chatApi.generateEmail(sessionId, formData);
      
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

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Sidebar - Collapsible */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          formData={formData}
          onStartNew={handleStartNew}
          onDownloadPdf={handleDownloadPdf}
          onGenerateEmail={handleGenerateEmail}
          isLoading={isLoading}
          pdfUploaded={pdfUploaded}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      {/* Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <ChatContainer
          messages={messages}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
    </div>
  );
}

export default App;
