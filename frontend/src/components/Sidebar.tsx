import { FormData } from '../types';
import { FileText, Mail, PlusCircle, Download } from 'lucide-react';

interface SidebarProps {
  formData: FormData;
  onStartNew: () => void;
  onDownloadPdf: () => void;
  onGenerateEmail: () => void;
  isLoading: boolean;
}

function Sidebar({ formData, onStartNew, onDownloadPdf, onGenerateEmail, isLoading }: SidebarProps) {
  const hasRequiredData = formData.studentName && formData.studentId && formData.currentMajor && formData.desiredMajor;

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Form Assistant</h2>
        <p className="text-sm text-gray-600 mt-1">Change of Major</p>
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
          disabled={isLoading || !hasRequiredData}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <Download size={18} />
          <span>Download PDF</span>
        </button>

        <button
          onClick={onGenerateEmail}
          disabled={isLoading || !hasRequiredData}
          className="btn-secondary w-full flex items-center justify-center space-x-2"
        >
          <Mail size={18} />
          <span>Generate Email</span>
        </button>
      </div>

      {/* Form Progress */}
      <div className="flex-1 p-6 border-t border-gray-200 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <FileText size={16} className="mr-2" />
          Collected Information
        </h3>
        
        <div className="space-y-3">
          <FormField label="Student Name" value={formData.studentName} />
          <FormField label="Student ID" value={formData.studentId} />
          <FormField label="Current Major" value={formData.currentMajor} />
          <FormField label="Desired Major" value={formData.desiredMajor} />
          <FormField label="Advisor Name" value={formData.advisorName} />
          <FormField label="Department" value={formData.department} />
          <FormField label="Email" value={formData.email} />
          <FormField label="Phone" value={formData.phone} />
          <FormField label="Reason" value={formData.reason} />
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 text-xs text-gray-500">
        <p>Powered by Google Gemini AI</p>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value?: string;
}

function FormField({ label, value }: FormFieldProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-sm text-gray-900">
        {value || <span className="text-gray-400 italic">Not provided yet</span>}
      </p>
    </div>
  );
}

export default Sidebar;

