import React from 'react';
import { Camera } from 'lucide-react';

const ProfileHeader = () => {
  return (
    <div className="relative">
      <div className="h-48 bg-gradient-to-r from-emerald-400 to-emerald-500" />
      <div className="absolute -bottom-16 left-6 flex items-end">
        <div className="relative">
          <div className="w-32 h-32 bg-white rounded-full p-1">
            <div className="w-full h-full bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-emerald-400">JD</span>
            </div>
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-emerald-400 rounded-full text-white hover:bg-emerald-300">
            <Camera size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;