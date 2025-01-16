import React from 'react';

interface Activity {
  id: number;
  text: string;
  time: string;
}

interface ActivityCardProps {
  title: string;
  activities: Activity[];
  icon?: React.ReactNode;
}

const ActivityCard = ({ title, activities, icon }: ActivityCardProps) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    <div className="space-y-3">
      {activities.map((item) => (
        <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
          {icon || <div className="w-2 h-2 bg-emerald-400 rounded-full" />}
          <div>
            <p className="text-sm font-medium">{item.text}</p>
            <p className="text-xs text-gray-500">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ActivityCard;