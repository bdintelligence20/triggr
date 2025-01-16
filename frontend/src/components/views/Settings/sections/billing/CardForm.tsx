import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';

interface CardFormProps {
  onSubmit: (cardData: any) => void;
  onCancel: () => void;
}

const CardForm: React.FC<CardFormProps> = ({ onSubmit, onCancel }) => {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(cardData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Card Number</label>
        <div className="mt-1 relative">
          <input
            type="text"
            value={cardData.number}
            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
            placeholder="1234 5678 9012 3456"
            className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            maxLength={19}
          />
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
          <input
            type="text"
            value={cardData.expiry}
            onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
            placeholder="MM/YY"
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            maxLength={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CVC</label>
          <input
            type="text"
            value={cardData.cvc}
            onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
            placeholder="123"
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            maxLength={4}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
        <input
          type="text"
          value={cardData.name}
          onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
          placeholder="John Doe"
          className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
        />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300"
        >
          Save Card
        </button>
      </div>
    </form>
  );
};

export default CardForm;