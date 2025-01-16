import React from 'react';
import { Calendar } from 'lucide-react';
import { demoHubs } from '../../data/demo-data';

interface WelcomeBannerProps {
  userName?: string;
  role?: string;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ 
  userName = 'Ricki',
  role = 'Admin'
}) => {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-emerald-400 px-6 py-6 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome {userName}</h1>
          <div className="flex items-center gap-2 text-white/90">
            <Calendar size={16} />
            <span>{today}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select className="bg-white/10 text-white border-white/20 rounded-lg px-3 py-1.5">
            <option value="all">All Departments</option>
            <option value="hr">HR</option>
            <option value="ops">Operations</option>
          </select>
          <select className="bg-white/10 text-white border-white/20 rounded-lg px-3 py-1.5">
            <option value="all">All Hubs</option>
            {demoHubs.map(hub => (
              <option key={hub.id} value={hub.id}>{hub.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;