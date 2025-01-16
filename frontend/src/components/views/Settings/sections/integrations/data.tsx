import React from 'react';
import { MessageSquare, Cloud, Mail, Building, BarChart3, Users, Database, FolderGit2 } from 'lucide-react';

export const integrations = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Real-time messaging and notifications',
    icon: <MessageSquare size={24} className="text-[#E01E5A]" />,
    setupSteps: [
      'Authorize triggrHub in your Slack workspace',
      'Select channels for notifications',
      'Configure notification preferences'
    ]
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Business messaging and customer communication',
    icon: <MessageSquare size={24} className="text-[#25D366]" />,
    setupSteps: [
      'Connect WhatsApp Business account',
      'Configure message templates',
      'Set up automated responses'
    ]
  },
  {
    id: 'wechat',
    name: 'WeChat',
    description: 'Chinese market communication and engagement',
    icon: <MessageSquare size={24} className="text-[#7BB32E]" />,
    setupSteps: [
      'Link WeChat Official Account',
      'Set up WeChat Mini Program',
      'Configure message handling'
    ]
  },
  {
    id: 'ms-teams',
    name: 'Microsoft Teams',
    description: 'Team collaboration and communication',
    icon: <MessageSquare size={24} className="text-[#6264A7]" />,
    setupSteps: [
      'Sign in with your Microsoft account',
      'Grant necessary permissions',
      'Choose teams and channels'
    ]
  },
  // ... rest of the existing integrations remain unchanged
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Document and calendar integration',
    icon: <Mail size={24} className="text-[#4285F4]" />,
    setupSteps: [
      'Sign in with Google',
      'Select Google Workspace services',
      'Configure sync settings'
    ]
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    description: 'Document management and collaboration',
    icon: <Cloud size={24} className="text-[#038387]" />,
    setupSteps: [
      'Connect with Microsoft account',
      'Select SharePoint sites',
      'Configure document sync'
    ]
  },
  {
    id: 'sap',
    name: 'SAP',
    description: 'Enterprise resource planning integration',
    icon: <Building size={24} className="text-[#003976]" />,
    setupSteps: [
      'Enter SAP system details',
      'Configure API credentials',
      'Test connection'
    ]
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'CRM and customer data integration',
    icon: <BarChart3 size={24} className="text-[#00A1E0]" />,
    setupSteps: [
      'Connect Salesforce account',
      'Select data sync options',
      'Configure webhooks'
    ]
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Marketing and CRM automation',
    icon: <Users size={24} className="text-[#FF7A59]" />,
    setupSteps: [
      'Authorize HubSpot account',
      'Choose integration features',
      'Set up data mapping'
    ]
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Cloud storage and file sharing',
    icon: <FolderGit2 size={24} className="text-[#0061FF]" />,
    setupSteps: [
      'Sign in to Dropbox',
      'Select folders to sync',
      'Configure sync settings'
    ]
  }
];