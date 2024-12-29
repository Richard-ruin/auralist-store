// components/admin/StatusHistory.js
import React from 'react';
import { Clock, User } from 'lucide-react';

const StatusHistory = ({ history }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Status History</h3>
      <div className="flow-root">
        <ul className="-mb-8">
          {history.map((item, index) => (
            <li key={index}>
              <div className="relative pb-8">
                {index !== history.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      getStatusColor(item.status)}`}
                    >
                      <Clock className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">
                        Status changed to{' '}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </p>
                      {item.reason && (
                        <p className="mt-1 text-sm text-gray-700">{item.reason}</p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500">{item.changedBy?.name}</span>
                      </div>
                      <time className="text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StatusHistory;