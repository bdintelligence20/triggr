import React from 'react';
import { CreditCard, Edit2 } from 'lucide-react';

interface PaymentMethodCardProps {
  card: {
    last4: string;
    expMonth: string;
    expYear: string;
    brand: string;
  };
  onEdit: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ card, onEdit }) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <CreditCard className="text-gray-400" />
        <div>
          <div className="font-medium">
            {card.brand} •••• {card.last4}
          </div>
          <div className="text-sm text-gray-500">
            Expires {card.expMonth}/{card.expYear}
          </div>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="p-2 hover:bg-gray-100 rounded-lg"
        aria-label="Edit card"
      >
        <Edit2 size={16} className="text-gray-500" />
      </button>
    </div>
  );
};

export default PaymentMethodCard;