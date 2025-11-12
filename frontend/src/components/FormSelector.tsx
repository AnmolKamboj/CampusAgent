import { FormType, FormConfig } from '../types';
import { FileText, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';

interface FormSelectorProps {
  forms: FormConfig[];
  onSelectForm: (formType: FormType) => void;
}

function FormSelector({ forms, onSelectForm }: FormSelectorProps) {
  const getFormIcon = (formType: FormType) => {
    switch (formType) {
      case FormType.CHANGE_OF_MAJOR:
        return <FileText size={32} className="text-blue-600" />;
      case FormType.GRADUATION_APPLICATION:
        return <GraduationCap size={32} className="text-green-600" />;
      case FormType.ADD_DROP_COURSE:
        return <BookOpen size={32} className="text-purple-600" />;
      default:
        return <FileText size={32} />;
    }
  };

  const getFormColor = (formType: FormType) => {
    switch (formType) {
      case FormType.CHANGE_OF_MAJOR:
        return 'border-blue-200 hover:border-blue-500 hover:bg-blue-50';
      case FormType.GRADUATION_APPLICATION:
        return 'border-green-200 hover:border-green-500 hover:bg-green-50';
      case FormType.ADD_DROP_COURSE:
        return 'border-purple-200 hover:border-purple-500 hover:bg-purple-50';
      default:
        return 'border-gray-200 hover:border-gray-500';
    }
  };

  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🏫 Smart Academic Form Assistant</h1>
          <p className="text-gray-600 mb-8">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 w-full">
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🏫 Smart Academic Form Assistant</h1>
        <p className="text-lg text-gray-600 mb-2">Select a form to get started</p>
        <p className="text-sm text-gray-500">
          I'll guide you through the process step by step and help you complete your form
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {forms.map((form) => (
          <button
            key={form.type}
            onClick={() => onSelectForm(form.type)}
            className={`bg-white border-2 rounded-xl p-6 hover:shadow-xl transition-all text-left group ${getFormColor(form.type)}`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">{getFormIcon(form.type)}</div>
                <ArrowRight 
                  size={20} 
                  className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform" 
                />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {form.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 flex-grow">
                {form.description}
              </p>
              
              {form.deadline && (
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Deadline:</span> {new Date(form.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          Powered by AI • Step-by-step guidance • Auto-fill capabilities
        </p>
      </div>
    </div>
  );
}

export default FormSelector;
