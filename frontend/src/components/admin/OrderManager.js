import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Eye,
  Calendar,
  Package,
  Clock,
  MoreVertical
} from 'lucide-react';
import orderService from '../../services/orderService';
import OrderConfirmationModal from './OrderConfirmationModal';
import OrderFilter from './OrderFilter';
import Pagination from './Pagination';
import { filterOrders, sortOrders } from '../../utils/orderHelpers';
import { toast } from 'react-hot-toast';

const OrderManager = () => {
  // States
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0,
    processing: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    search: '',
    sortBy: 'date-desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters when orders or filters change
  useEffect(() => {
    let result = filterOrders(orders, filters);
    result = sortOrders(result, filters.sortBy);
    setFilteredOrders(result);
    setPagination(prev => ({
      ...prev,
      totalPages: Math.ceil(result.length / prev.itemsPerPage)
    }));
  }, [orders, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, statsResponse] = await Promise.all([
        orderService.getAllOrders(),
        orderService.getOrderStats()
      ]);
      
      // Set orders dengan null check
      setOrders(ordersResponse?.data?.orders || []);
      
      // Set stats dengan struktur yang benar
      const statsData = statsResponse?.data?.data || statsResponse?.data || {
        total: 0,
        thisMonth: 0,
        pending: 0,
        processing: 0
      };
      
      setStats(statsData);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };
  const handleStatusUpdate = async (status, notes) => {
    if (!selectedOrder) {
      toast.error('No order selected');
      return;
    }
  
    try {
      await orderService.updateOrderStatus(selectedOrder._id, {
        status,
        notes
      });
      await fetchData(); // Refresh data
      setIsModalOpen(false);
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      paymentStatus: 'all',
      search: '',
      sortBy: 'date-desc'
    });
  };

  const handleConfirmPayment = async (status, notes) => {
    if (!selectedOrder) {
      toast.error('No order selected');
      return;
    }
  
    try {
      await orderService.confirmPayment(selectedOrder._id, {
        status,
        notes
      });
      await fetchData(); // Refresh data
      setIsModalOpen(false);
      toast.success(`Payment ${status === 'confirmed' ? 'confirmed' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    }
  };

  const handleExport = () => {
    const csv = filteredOrders.map(order => ({
      'Order ID': order._id,
      'Customer': order.user.name,
      'Email': order.user.email,
      'Date': new Date(order.createdAt).toLocaleDateString(),
      'Amount': order.totalAmount,
      'Status': order.status,
      'Payment Status': order.paymentStatus
    }));

    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(csv[0]).join(",") + "\n" +
      csv.map(row => Object.values(row).join(",")).join("\n");
    
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "orders.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCurrentPageOrders = () => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filteredOrders.slice(start, end);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view order details
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats?.thisMonth || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats?.pending || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Processing</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats?.processing || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <OrderFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      {/* Orders Table */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Order ID
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Customer
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Date
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Amount
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Payment Method
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Payment Status
        </th>
        <th scope="col" className="relative px-6 py-3">
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {getCurrentPageOrders().map((order) => (
        <tr key={order._id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {order._id}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex flex-col">
              <div className="text-sm font-medium text-gray-900">
                {order.user?.name || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                {order.user?.email || 'N/A'}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            ${order.totalAmount?.toFixed(2) || '0.00'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            <span className="capitalize">{order.paymentMethod || 'Not specified'}</span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
              {order.status || 'Unknown'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus || order.paymentMethod)}`}>
              {order.paymentStatus || order.paymentMethod || 'Unknown'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => {
                  setSelectedOrder(order);
                  setIsModalOpen(true);
                }}
                className="text-indigo-600 hover:text-indigo-900"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-500">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  
  <Pagination
    currentPage={pagination.currentPage}
    totalPages={pagination.totalPages}
    onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
  />
</div>

<OrderConfirmationModal
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  }}
  onConfirm={handleConfirmPayment}
  onStatusUpdate={handleStatusUpdate}
  order={selectedOrder}
/>
    </div>
  );
};

export default OrderManager;