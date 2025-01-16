import React, { useState } from 'react';
import { X, Calendar, FileText } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: ReportOptions) => void;
  hubName?: string;
}

interface ReportOptions {
  scope: 'chat' | 'hub' | 'date-range';
  type: 'requests' | 'reports' | 'both';
  dateRange?: {
    start: string;
    end: string;
  };
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onGenerate, hubName }) => {
  const [options, setOptions] = useState<ReportOptions>({
    scope: 'chat',
    type: 'both',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Generate Report</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Scope Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Report Scope</label>
            <select
              value={options.scope}
              onChange={(e) => setOptions({ ...options, scope: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            >
              <option value="chat">This Chat Only</option>
              {hubName && <option value="hub">All Chats in {hubName}</option>}
              <option value="date-range">Specific Time Range</option>
            </select>
          </div>

          {/* Date Range (if selected) */}
          {options.scope === 'date-range' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  onChange={(e) => setOptions({
                    ...options,
                    dateRange: {
                      ...options.dateRange,
                      start: e.target.value
                    }
                  })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                />
                <input
                  type="date"
                  onChange={(e) => setOptions({
                    ...options,
                    dateRange: {
                      ...options.dateRange,
                      end: e.target.value
                    }
                  })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                />
              </div>
            </div>
          )}

          {/* Report Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Include</label>
            <select
              value={options.type}
              onChange={(e) => setOptions({ ...options, type: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            >
              <option value="both">Requests & Reports</option>
              <option value="requests">Requests Only</option>
              <option value="reports">Reports Only</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onGenerate(options);
                onClose();
              }}
              className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300 flex items-center gap-2"
            >
              <FileText size={18} />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;