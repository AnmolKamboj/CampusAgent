import { FormData } from '../types';
import { FileText, Mail, Download, Plus, X } from 'lucide-react';

interface SidebarProps {
  formData: FormData;
  onStartNew: () => void;
  onDownloadPdf: () => void;
  onGenerateEmail: () => void;
  isLoading: boolean;
  pdfUploaded: boolean;
  onClose: () => void;
}

function Sidebar({ formData, onStartNew, onDownloadPdf, onGenerateEmail, isLoading, pdfUploaded, onClose }: SidebarProps) {
  const hasData = () => {
    return Object.keys(formData).length > 0;
  };

  const renderFormFields = () => {
    if (!hasData()) {
      return (
        <div className="text-center text-gray-500 text-sm py-12 px-4">
          <div className="glass-card p-6">
            <p className="text-gray-400">
              {pdfUploaded ? 'Answer questions to populate fields' : 'Upload a PDF document to begin'}
            </p>
          </div>
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
    <div className="w-72 sidebar-glass flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-100 tracking-tight">Form Assistant</h2>
          <p className="text-sm text-gray-400 mt-1">
            {pdfUploaded ? (
              <span className="text-blue-400">Document loaded</span>
            ) : (
              'No document'
            )}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={onStartNew}
          disabled={isLoading}
          className="btn-secondary w-full flex items-center justify-center space-x-2 glow-on-hover"
        >
          <Plus size={18} />
          <span>New Session</span>
        </button>

        <button
          onClick={onDownloadPdf}
          disabled={isLoading || !pdfUploaded || !hasData()}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <Download size={18} />
          <span>Download PDF</span>
        </button>

        <button
          onClick={onGenerateEmail}
          disabled={isLoading || !pdfUploaded || !hasData()}
          className="btn-secondary w-full flex items-center justify-center space-x-2"
        >
          <Mail size={18} />
          <span>Generate Email</span>
        </button>
      </div>

      {/* Form Progress */}
      <div className="flex-1 p-4 border-t border-white/5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300 flex items-center">
            <FileText size={16} className="mr-2" />
            Form Data
          </h3>
          {hasData() && (
            <span className="text-xs text-blue-400">{Object.keys(formData).length} fields</span>
          )}
        </div>
        
        <div className="space-y-2">
          {renderFormFields()}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <p className="text-xs text-gray-500 text-center">Powered by AI</p>
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
    <div className="glass-card p-3 transition-all duration-300 hover:scale-[1.02]">
      <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-200">
        {value !== undefined && value !== '' ? (
          String(value)
        ) : (
          <span className="text-gray-500 italic">Not provided</span>
        )}
      </p>
    </div>
  );
}

export default Sidebar;
