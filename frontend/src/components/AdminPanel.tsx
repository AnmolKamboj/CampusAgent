import { useState, useEffect } from 'react';
import { adminApi } from '../api/client';
import { Upload, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  uploadedAt: Date;
  isActive: boolean;
}

function AdminPanel() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getForms();
      setTemplates(response.templates);
    } catch (error) {
      console.error('Error loading templates:', error);
      alert('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formName) {
      alert('Please select a file and provide a form name');
      return;
    }

    try {
      setUploading(true);
      await adminApi.uploadForm(selectedFile, formName, formDescription);
      alert('Template uploaded successfully!');
      setSelectedFile(null);
      setFormName('');
      setFormDescription('');
      loadTemplates();
    } catch (error) {
      console.error('Error uploading template:', error);
      alert('Failed to upload template');
    } finally {
      setUploading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await adminApi.toggleForm(id);
      loadTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
      alert('Failed to toggle template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await adminApi.deleteForm(id);
      alert('Template deleted successfully');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Form Template Management</h2>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Upload New Template</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Scholarship Application"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Brief description of the form"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF File *
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="w-full"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile.name}</p>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !formName}
            className="btn-primary flex items-center space-x-2"
          >
            <Upload size={18} />
            <span>{uploading ? 'Uploading...' : 'Upload Template'}</span>
          </button>
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Existing Templates</h3>

        {loading ? (
          <p className="text-gray-500">Loading templates...</p>
        ) : templates.length === 0 ? (
          <p className="text-gray-500">No templates uploaded yet</p>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{template.name}</h4>
                    {template.description && (
                      <p className="text-gray-600 text-sm mt-1">{template.description}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      File: {template.fileName}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Uploaded: {new Date(template.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggle(template.id)}
                      className={`p-2 rounded-lg ${
                        template.isActive
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={template.isActive ? 'Active' : 'Inactive'}
                    >
                      {template.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>

                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      template.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
