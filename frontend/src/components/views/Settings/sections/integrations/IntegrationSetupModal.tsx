import React, { useState } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

interface IntegrationSetupModalProps {
  integration: {
    name: string;
    icon: React.ReactNode;
    setupSteps: string[];
  };
  onClose: () => void;
  onComplete: () => void;
}

const IntegrationSetupModal: React.FC<IntegrationSetupModalProps> = ({
  integration,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep === integration.setupSteps.length - 1) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-3">
            {integration.icon}
            <h2 className="text-xl font-semibold">Connect {integration.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {integration.setupSteps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  index === currentStep ? 'bg-emerald-50 border border-emerald-200' :
                  index < currentStep ? 'bg-gray-50' : ''
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  index < currentStep ? 'bg-emerald-400' :
                  index === currentStep ? 'bg-emerald-400' : 'bg-gray-200'
                }`}>
                  {index < currentStep ? (
                    <Check size={14} className="text-white" />
                  ) : (
                    <span className="text-sm text-white">{index + 1}</span>
                  )}
                </div>
                <span className={index < currentStep ? 'text-gray-500' : 'text-gray-900'}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300 flex items-center gap-2"
          >
            {currentStep === integration.setupSteps.length - 1 ? 'Complete' : 'Next'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSetupModal;