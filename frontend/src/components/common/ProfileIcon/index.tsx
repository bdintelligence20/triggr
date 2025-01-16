import * as React from "react";

import { User } from 'lucide-react';

interface ProfileIconProps {
  imageUrl?: string;
  initials?: string;
  onClick: () => void;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ imageUrl, initials, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full overflow-hidden transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
      aria-label="View Profile"
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <div className="w-full h-full bg-emerald-400 text-white flex items-center justify-center text-sm font-medium">
          {initials}
        </div>
      ) : (
        <div className="w-full h-full bg-emerald-400 text-white flex items-center justify-center">
          <User size={16} />
        </div>
      )}
    </button>
  );
};

export default ProfileIcon;