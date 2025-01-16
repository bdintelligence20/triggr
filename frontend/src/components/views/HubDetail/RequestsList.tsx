import React from 'react';
import { MessageSquare } from 'lucide-react';

const demoRequests = [
  {
    id: 1,
    title: 'Equipment maintenance request',
    status: 'pending',
    date: '2024-02-10',
    requester: 'John Smith'
  },
  {
    id: 2,
    title: 'Safety inspection needed',
    status: 'in-progress',
    date: '2024-02-09',
    requester: 'Sarah Chen'
  },
  {
    id: 3,
    title: 'Training documentation request',
    status: 'completed',
    date: '2024-02-08',
    requester: 'Mike Johnson'
  }
];

interface RequestsListProps {
  hubId: number;
}

const RequestsList = ({ hubId }: RequestsListProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Requests</h2>
        <button className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300">
          New Request
        </button>
      </div>
      
      <div className="space-y-4">
        {demoRequests.map(request => (
          <div key={request.id} className="p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MessageSquare className="text-emerald-400" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{request.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>{request.requester}</span>
                  <span>{new Date(request.date).toLocaleDateString()}</span>
                </div>
              </div>
              <span className={`
                px-2 py-1 rounded-full text-xs
                ${request.status === 'completed' ? 'bg-green-100 text-green-600' :
                  request.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                  'bg-yellow-100 text-yellow-600'}
              `}>
                {request.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RequestsList;