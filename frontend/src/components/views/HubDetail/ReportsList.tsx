import React from 'react';
import { FileText } from 'lucide-react';

const demoReports = [
  {
    id: 1,
    title: 'Monthly Safety Report',
    type: 'safety',
    date: '2024-02-10',
    author: 'Sarah Chen'
  },
  {
    id: 2,
    title: 'Equipment Maintenance Log',
    type: 'maintenance',
    date: '2024-02-09',
    author: 'Mike Johnson'
  },
  {
    id: 3,
    title: 'Training Completion Report',
    type: 'training',
    date: '2024-02-08',
    author: 'John Smith'
  }
];

interface ReportsListProps {
  hubId: number;
}

const ReportsList = ({ hubId }: ReportsListProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Reports</h2>
        <button className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300">
          New Report
        </button>
      </div>
      
      <div className="space-y-4">
        {demoReports.map(report => (
          <div key={report.id} className="p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileText className="text-emerald-400" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{report.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>{report.author}</span>
                  <span>{new Date(report.date).toLocaleDateString()}</span>
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs">
                {report.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportsList;