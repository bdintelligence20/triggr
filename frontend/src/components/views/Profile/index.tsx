import React, { useState } from 'react';
import ProfileHeader from './sections/ProfileHeader';
import ProfileBio from './sections/ProfileBio';
import ProfileStats from './sections/ProfileStats';
import ProfileSettings from './sections/ProfileSettings';

// Demo data
const initialProfile = {
  name: 'John Doe',
  email: 'john.doe@company.com',
  accessLevel: 'Manager',
  bio: 'Experienced operations manager with a passion for safety and efficiency.',
  imageUrl: undefined,
  stats: {
    requests: 15,
    reports: 8
  },
  settings: {
    emailNotifications: true,
    pushNotifications: false,
    language: 'en'
  }
};

const Profile = () => {
  const [profile, setProfile] = useState(initialProfile);

  const handleImageChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({
        ...prev,
        imageUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleBioChange = (newBio: string) => {
    setProfile(prev => ({
      ...prev,
      bio: newBio
    }));
  };

  const handleSettingChange = (key: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader
        name={profile.name}
        email={profile.email}
        accessLevel={profile.accessLevel}
        imageUrl={profile.imageUrl}
        onImageChange={handleImageChange}
      />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileBio
              bio={profile.bio}
              onBioChange={handleBioChange}
            />
            <ProfileStats stats={profile.stats} />
          </div>
          <div>
            <ProfileSettings
              settings={profile.settings}
              onSettingChange={handleSettingChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;