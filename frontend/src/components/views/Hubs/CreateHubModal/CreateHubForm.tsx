import React, { useState } from 'react';
import { Upload, Plus, Trash } from 'lucide-react';

interface CreateHubFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreateHubForm: React.FC<CreateHubFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null,
    relevantDates: [] as { label: string; date: string }[],
    links: [] as { label: string; url: string }[],
    customFields: [] as { label: string; value: string }[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
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
    <form onSubmit={handleSubmit} className="overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hub Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            placeholder="Enter hub name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            placeholder="Enter a description of the hub"
            rows={3}
          />
        </div>

        {/* Hub Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hub Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="space-y-1 text-center">
              <div className="flex flex-col items-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-emerald-400 hover:text-emerald-300">
                    <span>Upload an image</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Important Dates */}
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

        {/* Related Links */}
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

        {/* Additional Information */}
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
          Create Hub
        </button>
      </div>
    </form>
  );
};

export default CreateHubForm;