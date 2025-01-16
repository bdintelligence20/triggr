import React from 'react';
import { Bell, Globe } from 'lucide-react';

interface ProfileSettingsProps {
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    language: string;
  };
  onSettingChange: (key: string, value: any) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ settings, onSettingChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium mb-4">Preferences</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => onSettingChange('emailNotifications', e.target.checked)}
                className="w-4 h-4 text-emerald-400 border-gray-300 rounded focus:ring-emerald-400"
              />
              <span className="text-sm text-gray-600">Email notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => onSettingChange('pushNotifications', e.target.checked)}
                className="w-4 h-4 text-emerald-400 border-gray-300 rounded focus:ring-emerald-400"
              />
              <span className="text-sm text-gray-600">Push notifications</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Language</h3>
          <div className="relative">
            <select
              value={settings.language}
              onChange={(e) => onSettingChange('language', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;