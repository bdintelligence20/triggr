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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle file upload here
    console.log('Uploading files:', files);
    onClose();
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