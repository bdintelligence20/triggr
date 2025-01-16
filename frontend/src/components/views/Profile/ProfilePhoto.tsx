import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface ProfilePhotoProps {
  imageUrl?: string;
  initials: string;
  onPhotoChange: (file: File) => void;
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({ imageUrl, initials, onPhotoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onPhotoChange(file);
    }
  };

  return (
    <div className="relative">
      <div className="w-32 h-32 bg-white rounded-full p-1">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-emerald-400">{initials}</span>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-0 right-0 p-2 bg-emerald-400 rounded-full text-white hover:bg-emerald-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
        aria-label="Change profile photo"
      >
        <Camera size={16} />
      </button>
    </div>
  );
};

export default ProfilePhoto;