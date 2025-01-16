import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PaymentMethodCard from './billing/PaymentMethodCard';
import AddCardModal from './billing/AddCardModal';
import InvoiceList from './billing/InvoiceList';

// Demo data
const demoCard = {
  last4: '4242',
  expMonth: '12',
  expYear: '24',
  brand: 'Visa'
};

const demoInvoices = [
  {
    id: '1',
    number: 'INV-2024-001',
    date: '2024-02-10',
    amount: 299.99,
    status: 'paid' as const
  },
  {
    id: '2',
    number: 'INV-2024-002',
    date: '2024-02-01',
    amount: 299.99,
    status: 'paid' as const
  },
  {
    id: '3',
    number: 'INV-2024-003',
    date: '2024-03-01',
    amount: 299.99,
    status: 'pending' as const
  }
];

const BillingSettings = () => {
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  const handleAddCard = (cardData: any) => {
    console.log('Adding new card:', cardData);
    setIsAddCardModalOpen(false);
  };

  const handleEditCard = () => {
    // Re-use the add card modal for editing
    setIsAddCardModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Billing</h2>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Current Plan</h3>
            <p className="text-sm text-gray-500">Professional Plan</p>
          </div>
          <button className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300">
            Upgrade Plan
          </button>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Payment Methods</h3>
            <button
              onClick={() => setIsAddCardModalOpen(true)}
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
            >
              <Plus size={16} />
              <span>Add New Card</span>
            </button>
          </div>
          
          <PaymentMethodCard
            card={demoCard}
            onEdit={handleEditCard}
          />
        </div>

        <InvoiceList invoices={demoInvoices} />
      </div>

      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onSubmit={handleAddCard}
      />
    </div>
  );
};

export default BillingSettings;