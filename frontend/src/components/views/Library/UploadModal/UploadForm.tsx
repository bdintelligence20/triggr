import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import DropZone from './DropZone';
import FilePreview from './FilePreview';

interface UploadFormProps {
  onClose: () => void;
}

const UploadForm = ({ onClose }: UploadFormProps) => {
  const [files, setFiles] = React.useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) return;

    const formData = new FormData();
    formData.append('vector_store_id', 'vs_R5HLAebBXbIv8MX7bsE9Gjzk'); // Replace with the correct ID
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('https://triggr.onrender.com/upload-files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Upload failed:', error);
        alert(`Error: ${error.error}`);
        return;
      }

      const result = await response.json();
      console.log('Files uploaded successfully:', result);
      alert('Files uploaded successfully!');
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <input {...getInputProps()} />
      <DropZone {...getRootProps()} isDragActive={isDragActive} />
      <FilePreview files={files} />

      <div className="flex justify-end gap-4 pt-4 border-t">
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
          disabled={files.length === 0}
        >
          Upload Files
        </button>
      </div>
    </form>
  );
};

export default UploadForm;
