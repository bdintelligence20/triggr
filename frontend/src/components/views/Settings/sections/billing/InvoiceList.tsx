import React from 'react';
import { Download } from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

interface InvoiceListProps {
  invoices: Invoice[];
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Invoice History</h3>
      <div className="border rounded-lg divide-y">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">Invoice #{invoice.number}</div>
              <div className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium">${invoice.amount.toFixed(2)}</span>
              <span className={`px-2 py-1 rounded-full text-xs
                ${invoice.status === 'paid' ? 'bg-green-100 text-green-600' :
                  invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'}`}
              >
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Download size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceList;