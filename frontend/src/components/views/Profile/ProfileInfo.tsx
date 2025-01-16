import React from 'react';
import { Mail, Phone, MapPin, Building } from 'lucide-react';

const ProfileInfo = () => {
  return (
    <div className="px-6 pt-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">John Doe</h1>
        <p className="text-gray-500">Senior Operations Manager</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={18} />
            <span>john.doe@company.com</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={18} />
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} />
            <span>San Francisco, CA</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Building size={18} />
            <span>Operations Department</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium mb-3">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-emerald-400">127</div>
              <p className="text-sm text-gray-500">Reports Created</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">89</div>
              <p className="text-sm text-gray-500">Requests Handled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;