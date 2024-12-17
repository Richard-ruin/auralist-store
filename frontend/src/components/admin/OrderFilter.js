import React from 'react';
import { Filter as FilterIcon, X } from 'lucide-react';

const OrderFilter = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <FilterIcon className="w-5 h-5 text-gray-500" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      <select
        value={filters.status}
        onChange={(e) => onFilterChange('status', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <select
        value={filters.paymentStatus}
        onChange={(e) => onFilterChange('paymentStatus', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="all">All Payments</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </select>

      <select
        value={filters.sortBy}
        onChange={(e) => onFilterChange('sortBy', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="date-desc">Latest First</option>
        <option value="date-asc">Oldest First</option>
        <option value="amount-desc">Highest Amount</option>
        <option value="amount-asc">Lowest Amount</option>
      </select>

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <X className="w-4 h-4" />
        Reset Filters
      </button>
    </div>
  );
};

export default OrderFilter;