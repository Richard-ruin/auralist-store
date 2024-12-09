import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

const statusConfig = {
  pending: {
    icon: Clock,
    class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconClass: 'text-yellow-500'
  },
  confirmed: {
    icon: CheckCircle,
    class: 'bg-green-100 text-green-800 border-green-200',
    iconClass: 'text-green-500'
  },
  expired: {
    icon: XCircle,
    class: 'bg-red-100 text-red-800 border-red-200',
    iconClass: 'text-red-500'
  },
  rejected: {
    icon: AlertCircle,
    class: 'bg-red-100 text-red-800 border-red-200',
    iconClass: 'text-red-500'
  }
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${config.class}`}>
      <Icon className={`w-4 h-4 mr-2 ${config.iconClass}`} />
      <span className="text-sm font-medium">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

export default StatusBadge;