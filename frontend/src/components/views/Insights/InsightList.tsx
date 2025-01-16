import React from 'react';
import { Download, FileText, MessageSquare } from 'lucide-react';

const demoInsights = [
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
  }
];

const InsightList = () => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="flex justify-end p-3 border-b border-gray-100">
      <button className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50">
        <Download size={16} />
        <span className="text-sm font-medium">Download</span>
      </button>
    </div>
    
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Date</th>
          <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Hub</th>
          <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Owner</th>
          <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Activity</th>
          <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Tags</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {demoInsights.map((insight) => (
          <tr key={insight.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm text-gray-900">{insight.date}</td>
            <td className="px-4 py-3 text-sm text-gray-900">{insight.hub}</td>
            <td className="px-4 py-3 text-sm text-gray-900">{insight.owner}</td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1 text-emerald-400">
                  <MessageSquare size={16} />
                  <span className="text-sm">{insight.requests}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <FileText size={16} />
                  <span className="text-sm">{insight.reports}</span>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                {insight.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default InsightList;