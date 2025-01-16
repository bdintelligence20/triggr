import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface LogoUploadProps {
  currentLogo?: string;
  onLogoChange: (file: File | null) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogo, onLogoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Organization Logo</label>
      <div className="flex items-start gap-4">
        {currentLogo ? (
          <div className="relative">
            <img
              src={currentLogo}
              alt="Organization Logo"
              className="w-32 h-32 object-contain border rounded-lg"
            />
            <button
              onClick={() => onLogoChange(null)}
              className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-emerald-400 transition-colors"
          >
            <Upload className="text-gray-400" size={24} />
            <span className="text-sm text-gray-500">Upload Logo</span>
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onLogoChange(file);
          }}
        />
      </div>
    </div>
  );
};

export default LogoUpload;