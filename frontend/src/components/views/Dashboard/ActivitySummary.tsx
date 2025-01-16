import * as React from "react";

import { Activity, FileText, MessageSquare, Users } from 'lucide-react';

const metrics = [
  { 
    label: 'Total Activity',
    value: '1,615',
    change: '+12.5%',
    icon: Activity,
    color: 'emerald',
    trend: 'up'
  },
  {
    label: 'Reports',
    value: '637',
    change: '+5.2%',
    icon: FileText,
    color: 'blue',
    trend: 'up'
  },
  {
    label: 'Requests',
    value: '978',
    change: '+8.1%',
    icon: MessageSquare,
    color: 'purple',
    trend: 'up'
  },
  {
    label: 'Active Users',
    value: '376',
    change: '+3.7%',
    icon: Users,
    color: 'orange',
    trend: 'up'
  }
];

const ActivitySummary = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const bgColor = `bg-${metric.color}-50`;
        const textColor = `text-${metric.color}-600`;
        
        return (
          <div key={metric.label} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{metric.label}</p>
                <p className="text-2xl font-bold mt-1">{metric.value}</p>
              </div>
              <div className={`p-2 ${bgColor} rounded-lg`}>
                <Icon className={textColor} size={20} />
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-sm ${textColor} font-medium`}>
                {metric.change}
                <span className="text-gray-500 font-normal ml-1">vs last period</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivitySummary;