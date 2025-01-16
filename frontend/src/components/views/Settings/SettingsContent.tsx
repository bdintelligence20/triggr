import * as React from "react";

import OrganizationSettings from './sections/OrganizationSettings';
import AccountsSettings from './sections/AccountsSettings';
import BillingSettings from './sections/BillingSettings';
import PermissionsSettings from './sections/PermissionsSettings';
import IntegrationsSettings from './sections/IntegrationsSettings';

interface SettingsContentProps {
  currentSection: string;
}

const SettingsContent = ({ currentSection }: SettingsContentProps) => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {currentSection === 'organization' && <OrganizationSettings />}
        {currentSection === 'accounts' && <AccountsSettings />}
        {currentSection === 'billing' && <BillingSettings />}
        {currentSection === 'permissions' && <PermissionsSettings />}
        {currentSection === 'integrations' && <IntegrationsSettings />}
      </div>
    </div>
  );
};

export default SettingsContent;