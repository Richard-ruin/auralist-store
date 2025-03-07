// components/ui/StatusBadge.js
import React from 'react';
import { Badge } from './badge';

const StatusBadge = ({ status }) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'return_requested':
        return 'warning';
      case 'return_approved':
        return 'success';
      case 'return_rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatStatus = (status) => {
    return status
      .replace('return_', '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Badge variant={getStatusVariant(status)}>
      {formatStatus(status)}
    </Badge>
  );
};

export default StatusBadge;