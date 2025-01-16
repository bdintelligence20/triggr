import React, { useState } from 'react';
import { X, Plus, Trash } from 'lucide-react';

interface EditHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  hub: {
    name: string;
    description?: string;
    relevantDates?: { label: string; date: string }[];
    links?: { label: string; url: string }[];
    customFields?: { label: string; value: string }[];
  };
}

const EditHubModal = ({ isOpen, onClose, onSave, hub }: EditHubModalProps) => {
  const [formData, setFormData] = useState({
    name: hub.name,
    description: hub.description || '',
    relevantDates: hub.relevantDates || [],
    links: hub.links || [],
    customFields: hub.customFields || []
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addRelevantDate = () => {
    setFormData(prev => ({
      ...prev,
      relevantDates: [...prev.relevantDates, { label: '', date: '' }]
    }));
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { label: '', url: '' }]
    }));
  };

  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { label: '', value: '' }]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Edit Hub Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hub Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                rows={3}
              />
            </div>

            {/* Relevant Dates */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Important Dates
                </label>
                <button
                  type="button"
                  onClick={addRelevantDate}
                  className="text-sm text-emerald-400 hover:text-emerald-500 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Date
                </button>
              </div>
              <div className="space-y-2">
                {formData.relevantDates.map((date, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Label"
                      value={date.label}
                      onChange={e => {
                        const newDates = [...formData.relevantDates];
                        newDates[index].label = e.target.value;
                        setFormData({ ...formData, relevantDates: newDates });
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    />
                    <input
                      type="date"
                      value={date.date}
                      onChange={e => {
                        const newDates = [...formData.relevantDates];
                        newDates[index].date = e.target.value;
                        setFormData({ ...formData, relevantDates: newDates });
                      }}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newDates = formData.relevantDates.filter((_, i) => i !== index);
                        setFormData({ ...formData, relevantDates: newDates });
                      }}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Related Links
                </label>
                <button
                  type="button"
                  onClick={addLink}
                  className="text-sm text-emerald-400 hover:text-emerald-500 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Link
                </button>
              </div>
              <div className="space-y-2">
                {formData.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Label"
                      value={link.label}
                      onChange={e => {
                        const newLinks = [...formData.links];
                        newLinks[index].label = e.target.value;
                        setFormData({ ...formData, links: newLinks });
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    />
                    <input
                      type="url"
                      placeholder="URL"
                      value={link.url}
                      onChange={e => {
                        const newLinks = [...formData.links];
                        newLinks[index].url = e.target.value;
                        setFormData({ ...formData, links: newLinks });
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newLinks = formData.links.filter((_, i) => i !== index);
                        setFormData({ ...formData, links: newLinks });
                      }}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Fields */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Information
                </label>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="text-sm text-emerald-400 hover:text-emerald-500 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Field
                </button>
              </div>
              <div className="space-y-2">
                {formData.customFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Label"
                      value={field.label}
                      onChange={e => {
                        const newFields = [...formData.customFields];
                        newFields[index].label = e.target.value;
                        setFormData({ ...formData, customFields: newFields });
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={field.value}
                      onChange={e => {
                        const newFields = [...formData.customFields];
                        newFields[index].value = e.target.value;
                        setFormData({ ...formData, customFields: newFields });
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newFields = formData.customFields.filter((_, i) => i !== index);
                        setFormData({ ...formData, customFields: newFields });
                      }}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHubModal;