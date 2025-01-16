import React from 'react';
import { File } from 'lucide-react';

interface FilePreviewProps {
  files: File[];
}

const FilePreview = ({ files }: FilePreviewProps) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Selected Files</h3>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <File size={20} className="text-emerald-400" />
            <span className="text-sm">{file.name}</span>
            <span className="text-xs text-gray-500">
              ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilePreview;