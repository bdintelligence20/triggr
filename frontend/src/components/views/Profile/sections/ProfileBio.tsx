import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';

interface ProfileBioProps {
  bio: string;
  onBioChange: (newBio: string) => void;
}

const ProfileBio: React.FC<ProfileBioProps> = ({ bio, onBioChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(bio);

  const handleSave = () => {
    onBioChange(editedBio);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-medium">About</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-emerald-400 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedBio}
            onChange={(e) => setEditedBio(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            rows={4}
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">{bio}</p>
      )}
    </div>
  );
};

export default ProfileBio;