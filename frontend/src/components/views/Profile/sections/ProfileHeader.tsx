import React from 'react';
import { Camera } from 'lucide-react';

interface ProfileHeaderProps {
  name: string;
  email: string;
  accessLevel: string;
  imageUrl?: string;
  onImageChange: (file: File) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  accessLevel,
  imageUrl,
  onImageChange
}) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  return (
    <div className="relative">
      <div className="h-48 bg-gradient-to-r from-emerald-400 to-emerald-500" />
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-end gap-6 -mt-16">
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-full p-1">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-emerald-400">
                    {name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-emerald-400 rounded-full text-white hover:bg-emerald-300 cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <Camera size={16} />
            </label>
          </div>
          
          <div className="flex-1 pb-6">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <div className="mt-1 flex items-center gap-4">
              <span className="text-gray-500">{email}</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm">
                {accessLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;