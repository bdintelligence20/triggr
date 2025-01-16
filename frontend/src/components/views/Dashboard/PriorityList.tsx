import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

const priorityItems = [
  {
    id: 1,
    type: 'Request',
    category: 'HR',
    title: 'Employee Onboarding Documentation',
    date: '2024-02-10',
    priority: 'High',
    progress: 75,
  },
  {
    id: 2,
    type: 'Report',
    category: 'Safety',
    title: 'Monthly Safety Inspection',
    date: '2024-02-09',
    priority: 'Medium',
    progress: 30,
  },
  {
    id: 3,
    type: 'Request',
    category: 'IT',
    title: 'Software License Renewal',
    date: '2024-02-08',
    priority: 'Low',
    progress: 90,
  },
];

const PriorityList = () => {
  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Priority Items</h2>
      </div>
      <div className="divide-y max-h-[300px] overflow-y-auto">
        {priorityItems.map((item) => (
          <div key={item.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs
                    ${item.priority === 'High' ? 'bg-red-100 text-red-600' :
                      item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'}
                  `}>
                    {item.priority}
                  </span>
                  <span className="text-xs text-gray-500">{item.category}</span>
                </div>
                <h3 className="font-medium mt-1 truncate">{item.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <span>{item.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-20 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-emerald-400 h-1.5 rounded-full"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">{item.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityList;