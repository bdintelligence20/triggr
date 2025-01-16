import React from 'react';
import SettingsSidebar from './SettingsSidebar';
import SettingsContent from './SettingsContent';

const Settings = () => {
  const [currentSection, setCurrentSection] = React.useState('organization');

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <SettingsSidebar currentSection={currentSection} onSectionChange={setCurrentSection} />
      <SettingsContent currentSection={currentSection} />
    </div>
  );
};

export default Settings;