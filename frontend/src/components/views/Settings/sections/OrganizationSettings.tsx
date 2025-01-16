import React, { useState } from 'react';
import LogoUpload from './organization/LogoUpload';
import WebsiteInput from './organization/WebsiteInput';
import AddressForm from './organization/AddressForm';

const OrganizationSettings = () => {
  const [orgData, setOrgData] = useState({
    name: 'TriggrHub Inc.',
    logo: undefined as string | undefined,
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const handleLogoChange = (file: File | null) => {
    if (file) {
      // Convert file to base64 or URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrgData(prev => ({
          ...prev,
          logo: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setOrgData(prev => ({
        ...prev,
        logo: undefined
      }));
    }
  };

  const handleWebsiteChange = (website: string) => {
    setOrgData(prev => ({
      ...prev,
      website
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setOrgData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Saving organization settings:', orgData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Organization Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Organization Name
            </label>
            <input
              type="text"
              value={orgData.name}
              onChange={e => setOrgData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          <LogoUpload
            currentLogo={orgData.logo}
            onLogoChange={handleLogoChange}
          />

          <WebsiteInput
            value={orgData.website}
            onChange={handleWebsiteChange}
          />

          <AddressForm
            address={orgData.address}
            onChange={handleAddressChange}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationSettings;