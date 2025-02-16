import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import DropZone from './DropZone';
import FilePreview from './FilePreview';
import { useFileStore, LibraryItem } from '../store/useFileStore';

interface UploadFormProps {
  onClose: () => void;
}

const UploadForm = ({ onClose }: UploadFormProps) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const addFiles = useFileStore(state => state.addFiles);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
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
      
      // Store metadata with GCS URLs
      const newLibraryItems: LibraryItem[] = result.files
        .filter((file: any) => file.status === 'success')
        .map((file: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: file.filename,
          type: 'file',
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          owner: 'You',
          lastModified: file.uploaded_at,
          url: file.url
        }));

      // Add the new files metadata to the store
      addFiles(newLibraryItems);
      
      console.log('Files uploaded successfully:', result);
      
      if (result.status === 'partial_success') {
        alert('Some files were uploaded successfully, but others failed. Please check the console for details.');
      } else {
        alert('Files uploaded successfully!');
      }
      
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <input {...getInputProps()} />
      <DropZone {...getRootProps()} isDragActive={isDragActive} />
      <FilePreview files={files} />

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

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
          disabled={files.length === 0 || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>
    </form>
  );
};

export default UploadForm;