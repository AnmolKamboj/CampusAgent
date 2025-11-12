import { FormData, FormType, ChangeOfMajorData, GraduationApplicationData, AddDropCourseData } from '../types';
import { FileText, Mail, PlusCircle, Download, AlertCircle } from 'lucide-react';

interface SidebarProps {
  formData: FormData;
  formType: FormType | string | null; // Supports both FormType enum and template ID (string)
  onStartNew: () => void;
  onDownloadPdf: () => void;
  onGenerateEmail: () => void;
  isLoading: boolean;
}

function Sidebar({ formData, formType, onStartNew, onDownloadPdf, onGenerateEmail, isLoading }: SidebarProps) {
  const getFormName = () => {
    if (!formType) return 'Academic Form';
    // Check if it's a template ID (UUID format)
    if (typeof formType === 'string' && formType.length === 36 && formType.includes('-')) {
      return 'Custom Form';
    }
    switch (formType) {
      case FormType.CHANGE_OF_MAJOR:
        return 'Change of Major';
      case FormType.GRADUATION_APPLICATION:
        return 'Graduation Application';
      case FormType.ADD_DROP_COURSE:
        return 'Add/Drop Course';
      default:
        return 'Academic Form';
    }
  };

  const hasRequiredData = () => {
    if (!formType) return false;
    
    // For template-based forms (string IDs), we can't easily check required fields
    // So we'll just check if there's any data
    if (typeof formType === 'string' && formType.length === 36 && formType.includes('-')) {
      return Object.keys(formData).length > 0;
    }

    switch (formType) {
      case FormType.CHANGE_OF_MAJOR:
        const changeMajor = formData as ChangeOfMajorData;
        return !!(changeMajor.studentName && changeMajor.studentId && changeMajor.currentMajor && 
                 changeMajor.desiredMajor && changeMajor.advisorName && changeMajor.email);
      
      case FormType.GRADUATION_APPLICATION:
        const grad = formData as GraduationApplicationData;
        return !!(grad.studentName && grad.studentId && grad.expectedGraduationDate && 
                 grad.degreeType && grad.major && grad.email);
      
      case FormType.ADD_DROP_COURSE:
        const addDrop = formData as AddDropCourseData;
        return !!(addDrop.studentName && addDrop.studentId && addDrop.semester && 
                 addDrop.year && addDrop.email);
      
      default:
        return false;
    }
  };

  const renderFormFields = () => {
    if (!formType) return null;
    
    // For template-based forms (string IDs), render all fields dynamically
    if (typeof formType === 'string' && formType.length === 36 && formType.includes('-')) {
      return Object.entries(formData).map(([key, value]) => (
        <FormField 
          key={key} 
          label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
          value={typeof value === 'object' ? JSON.stringify(value) : String(value)} 
        />
      ));
    }

    switch (formType) {
      case FormType.CHANGE_OF_MAJOR:
        const changeMajor = formData as ChangeOfMajorData;
        return (
          <>
            <FormField label="Student Name" value={changeMajor.studentName} />
            <FormField label="Student ID" value={changeMajor.studentId} />
            <FormField label="Current Major" value={changeMajor.currentMajor} />
            <FormField label="Desired Major" value={changeMajor.desiredMajor} />
            <FormField label="Advisor Name" value={changeMajor.advisorName} />
            <FormField label="Department" value={changeMajor.department} />
            <FormField label="Email" value={changeMajor.email} />
            <FormField label="Phone" value={changeMajor.phone} />
            <FormField label="Reason" value={changeMajor.reason} />
          </>
        );

      case FormType.GRADUATION_APPLICATION:
        const grad = formData as GraduationApplicationData;
        return (
          <>
            <FormField label="Student Name" value={grad.studentName} />
            <FormField label="Student ID" value={grad.studentId} />
            <FormField label="Expected Graduation Date" value={grad.expectedGraduationDate} />
            <FormField label="Degree Type" value={grad.degreeType} />
            <FormField label="Major" value={grad.major} />
            <FormField label="Minor" value={grad.minor} />
            <FormField label="Honors Program" value={grad.honorsProgram ? 'Yes' : undefined} />
            <FormField label="Thesis Title" value={grad.thesisTitle} />
            <FormField label="Advisor Name" value={grad.advisorName} />
            <FormField label="Department" value={grad.department} />
            <FormField label="Email" value={grad.email} />
            <FormField label="Phone" value={grad.phone} />
          </>
        );

      case FormType.ADD_DROP_COURSE:
        const addDrop = formData as AddDropCourseData;
        return (
          <>
            <FormField label="Student Name" value={addDrop.studentName} />
            <FormField label="Student ID" value={addDrop.studentId} />
            <FormField label="Semester" value={addDrop.semester} />
            <FormField label="Year" value={addDrop.year} />
            <FormField 
              label="Courses to Add" 
              value={addDrop.coursesToAdd?.map(c => `${c.courseCode} - ${c.courseName}`).join(', ')} 
            />
            <FormField 
              label="Courses to Drop" 
              value={addDrop.coursesToDrop?.map(c => `${c.courseCode} - ${c.courseName}`).join(', ')} 
            />
            <FormField label="Advisor Name" value={addDrop.advisorName} />
            <FormField label="Email" value={addDrop.email} />
            <FormField label="Phone" value={addDrop.phone} />
            <FormField label="Reason" value={addDrop.reason} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Form Assistant</h2>
        <p className="text-sm text-gray-600 mt-1">{getFormName()}</p>
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
          disabled={isLoading || !hasRequiredData()}
          className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          <span>Download PDF</span>
        </button>

        <button
          onClick={onGenerateEmail}
          disabled={isLoading || !hasRequiredData()}
          className="btn-secondary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail size={18} />
          <span>Generate Email</span>
        </button>

        {!hasRequiredData() && (
          <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800">
              Please complete all required fields before generating PDF or email.
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
