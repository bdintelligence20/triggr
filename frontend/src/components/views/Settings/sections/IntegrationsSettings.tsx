import React, { useState } from 'react';
import IntegrationCard from './integrations/IntegrationCard';
import IntegrationSetupModal from './integrations/IntegrationSetupModal';
import { integrations } from './integrations/data';

const IntegrationsSettings = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);

  const handleConnect = (integrationId: string) => {
    if (connectedIntegrations.includes(integrationId)) {
      // Handle disconnection
      setConnectedIntegrations(prev => prev.filter(id => id !== integrationId));
    } else {
      // Open setup modal
      setSelectedIntegration(integrationId);
    }
  };

  const handleSetupComplete = (integrationId: string) => {
    setConnectedIntegrations(prev => [...prev, integrationId]);
    setSelectedIntegration(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Integrations</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              {...integration}
              isConnected={connectedIntegrations.includes(integration.id)}
              onConnect={() => handleConnect(integration.id)}
            />
          ))}
        </div>
      </div>

      {selectedIntegration && (
        <IntegrationSetupModal
          integration={integrations.find(i => i.id === selectedIntegration)!}
          onClose={() => setSelectedIntegration(null)}
          onComplete={() => handleSetupComplete(selectedIntegration)}
        />
      )}
    </div>
  );
}

export default IntegrationsSettings;