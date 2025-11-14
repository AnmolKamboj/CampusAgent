import { FormData } from '../types';
import { FileText, Mail, PlusCircle, Download, AlertCircle, Upload } from 'lucide-react';

interface SidebarProps {
  formData: FormData;
  onStartNew: () => void;
  onDownloadPdf: () => void;
  onGenerateEmail: () => void;
  isLoading: boolean;
  pdfUploaded: boolean;
}

function Sidebar({ formData, onStartNew, onDownloadPdf, onGenerateEmail, isLoading, pdfUploaded }: SidebarProps) {
  const hasData = () => {
    return Object.keys(formData).length > 0;
  };

  const renderFormFields = () => {
    if (!hasData()) {
      return (
        <div className="text-center text-gray-500 text-sm py-8">
          {pdfUploaded ? (
            <p>Answer questions in the chat to fill the form</p>
          ) : (
            <p>Upload a PDF to get started</p>
          )}
        </div>
      );
    }
    
    // Render all fields dynamically
    return Object.entries(formData).map(([key, value]) => (
      <FormField 
        key={key} 
        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
        value={typeof value === 'object' ? JSON.stringify(value) : String(value)} 
      />
    ));
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">PDF Form Assistant</h2>
        <p className="text-sm text-gray-600 mt-1">
          {pdfUploaded ? 'Form Uploaded ✓' : 'Upload PDF to start'}
        </p>
      </div>

      {/* Actions */}
      <div className="p-6 space-y-3">
        <button
          onClick={onStartNew}
          disabled={isLoading}
          className="btn-secondary w-full flex items-center justify-center space-x-2"
        >
          <PlusCircle size={18} />
          <span>Start New Form</span>
        </button>

        <button
          onClick={onDownloadPdf}
          disabled={isLoading || !pdfUploaded || !hasData()}
          className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          <span>Download PDF</span>
        </button>

        <button
          onClick={onGenerateEmail}
          disabled={isLoading || !pdfUploaded || !hasData()}
          className="btn-secondary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail size={18} />
          <span>Generate Email</span>
        </button>

        {!pdfUploaded && (
          <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Upload size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              Upload a PDF form using the 📎 button in the chat to get started!
            </p>
          </div>
        )}
        
        {pdfUploaded && !hasData() && (
          <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800">
              Answer the questions in the chat to fill out your form.
            </p>
          </div>
        )}
      </div>

      {/* Form Progress */}
      <div className="flex-1 p-6 border-t border-gray-200 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <FileText size={16} className="mr-2" />
          Collected Information
        </h3>
        
        <div className="space-y-3">
          {renderFormFields()}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 text-xs text-gray-500">
        <p>Powered by AI</p>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value?: string | boolean;
}

function FormField({ label, value }: FormFieldProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-sm text-gray-900">
        {value !== undefined && value !== '' ? (
          String(value)
        ) : (
          <span className="text-gray-400 italic">Not provided yet</span>
        )}
      </p>
    </div>
  );
}

export default Sidebar;
