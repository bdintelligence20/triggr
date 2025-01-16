import React from 'react';
import { Building, Users, CreditCard, Lock, Cable } from 'lucide-react';

const settingsSections = [
  { id: 'organization', label: 'Organization Profile', icon: Building },
  { id: 'accounts', label: 'Accounts', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'permissions', label: 'Permissions', icon: Lock },
  { id: 'integrations', label: 'Integrations', icon: Cable },
];

interface SettingsSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const SettingsSidebar = ({ currentSection, onSectionChange }: SettingsSidebarProps) => {
  return (
    <div className="w-64 border-r border-gray-200 bg-white">
      <nav className="p-4 space-y-1">
        {settingsSections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={`
              w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm
              ${currentSection === id 
                ? 'bg-emerald-100 text-emerald-400' 
                : 'text-gray-700 hover:bg-gray-50'}
            `}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SettingsSidebar;