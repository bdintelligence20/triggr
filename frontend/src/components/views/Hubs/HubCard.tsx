import React from 'react';

interface HubCardProps {
  id: number;
  name: string;
  createdDate: string;
  owner: string;
  requests: number;
  reports: number;
  image: string;
  onClick: (id: number) => void;
}

const HubCard = ({ id, name, createdDate, owner, requests, reports, image, onClick }: HubCardProps) => (
  <div 
    onClick={() => onClick(id)}
    className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
  >
    <div className="relative h-52">
      <img 
        src={image} 
        alt={name}
        className="w-full h-full object-cover transform transition-transform duration-200 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <h3 className="absolute bottom-4 left-4 font-medium text-lg text-white">{name}</h3>
    </div>
    <div className="p-4">
      <div className="space-y-2">
        <p className="text-sm text-gray-500">
          Created {new Date(createdDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-500">Owner: {owner}</p>
        <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
          <span className="text-emerald-400 font-medium">{requests} Requests</span>
          <span className="text-emerald-400 font-medium">{reports} Reports</span>
        </div>
      </div>
    </div>
  </div>
);

export default HubCard;