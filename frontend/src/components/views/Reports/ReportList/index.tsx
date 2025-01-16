import React from 'react';
import { Download } from 'lucide-react';

const demoReports = [
  {
    id: 1,
    date: '13/07/2024',
    hub: 'Operations Hub',
    owner: 'Sarah Chen',
    requests: 12,
    reports: 16,
    tags: ['Operations', 'H&S']
  },
  {
    id: 2,
    date: '12/07/2024',
    hub: 'Manufacturing Hub',
    owner: 'Michael Rodriguez',
    requests: 15,
    reports: 22,
    tags: ['Operations', 'Damage']
  },
  {
    id: 3,
    date: '11/07/2024',
    hub: 'Retail Hub',
    owner: 'Emma Williams',
    requests: 8,
    reports: 14,
    tags: ['HR', 'Operations']
  },
  {
    id: 4,
    date: '11/07/2024',
    hub: 'Distribution Hub',
    owner: 'James Thompson',
    requests: 18,
    reports: 25,
    tags: ['Operations', 'H&S']
  }
];

const ReportList = () => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="flex justify-end p-4 border-b border-gray-200">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          console.log('Downloading reports...');
        }}
        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <Download size={16} />
        <span className="text-sm">Download</span>
      </a>
    </div>
    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2 text-sm font-medium text-gray-500">Date</div>
        <div className="col-span-3 text-sm font-medium text-gray-500">Hub</div>
        <div className="col-span-2 text-sm font-medium text-gray-500">Owner</div>
        <div className="col-span-1 text-sm font-medium text-gray-500">Requests</div>
        <div className="col-span-1 text-sm font-medium text-gray-500">Reports</div>
        <div className="col-span-3 text-sm font-medium text-gray-500">Tags</div>
      </div>
    </div>
    <div className="divide-y divide-gray-200">
      {demoReports.map((report) => (
        <div key={report.id} className="hover:bg-gray-50">
          <div className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-2 text-sm text-gray-900">{report.date}</div>
            <div className="col-span-3 text-sm text-gray-900">{report.hub}</div>
            <div className="col-span-2 text-sm text-gray-900">{report.owner}</div>
            <div className="col-span-1 text-sm text-gray-900">{report.requests}</div>
            <div className="col-span-1 text-sm text-gray-900">{report.reports}</div>
            <div className="col-span-3">
              <div className="flex items-center gap-2">
                {report.tags.slice(0, 2).map((tag, index) => {
                  const tagColors = {
                    'HR': 'bg-blue-100 text-blue-600',
                    'Operations': 'bg-emerald-100 text-emerald-600',
                    'H&S': 'bg-red-100 text-red-600',
                    'Damage': 'bg-orange-100 text-orange-600',
                    'Training': 'bg-purple-100 text-purple-600'
                  };
                  return (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${tagColors[tag as keyof typeof tagColors]}`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ReportList;