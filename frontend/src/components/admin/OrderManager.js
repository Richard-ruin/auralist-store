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
import * as XLSX from 'xlsx';
import ExportModal from './ExportModal';

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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters when orders or filters change
  useEffect(() => {
    if (Array.isArray(orders)) {
      let result = filterOrders(orders, filters);
      result = sortOrders(result, filters.sortBy);
      setFilteredOrders(result);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(result.length / prev.itemsPerPage) || 1
      }));
    }
  }, [orders, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get all orders first
      const ordersResponse = await orderService.getAllOrders();
      
      // Set orders with safety checks
      if (ordersResponse?.data?.orders) {
        setOrders(ordersResponse.data.orders);
      } else {
        setOrders([]);
        console.warn('Unexpected order response format:', ordersResponse);
      }
      
      try {
        // Get stats separately
        const statsResponse = await orderService.getOrderStats();
        
        if (statsResponse?.data) {
          // Extract and process stats data
          const statsData = statsResponse.data;
          
          // Process stats data for the new order flow
          const statsSummary = {
            total: 0,
            thisMonth: 0,
            pending: 0,
            processing: 0
          };
          
          // If stats is an array of status groups
          if (Array.isArray(statsData.stats)) {
            statsData.stats.forEach(item => {
              // Add to total count
              statsSummary.total += item.count || 0;
              
              // Count by status
              if (item._id === 'processing') {
                statsSummary.processing += item.count || 0;
              } else if (item._id === 'pending' || item._id === 'confirmed') {
                statsSummary.pending += item.count || 0;
              }
            });
          }
          
          // Get this month count from totals or calculate it
          if (statsData.totals) {
            statsSummary.thisMonth = statsData.totals.totalOrders || 0;
          } else {
            // Filter orders from this month
            const now = new Date();
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();
            
            statsSummary.thisMonth = orders.filter(order => {
              const orderDate = new Date(order.createdAt);
              return orderDate.getMonth() === thisMonth && 
                     orderDate.getFullYear() === thisYear;
            }).length;
          }
          
          setStats(statsSummary);
        }
      } catch (statsError) {
        console.error('Error fetching stats:', statsError);
        // Continue without stats, don't show error to user
      }
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // In OrderManager.js
const handleStatusUpdate = async (status, notes, expeditionData = null) => {
  if (!selectedOrder) {
    toast.error('No order selected');
    return;
  }

  try {
    // Create a properly structured update object
    const updateData = { 
      status, 
      notes 
    };
    
    // Include expedition data if provided
    if (expeditionData) {
      updateData.expedition = expeditionData;
    }
    
    console.log('OrderManager - sending update data:', updateData);
    
    // Pass the update data as a single object
    await orderService.updateOrderStatus(selectedOrder._id, updateData);
    await fetchData(); // Refresh data
    setIsModalOpen(false);
    toast.success(`Order status updated to ${status}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    toast.error(error.response?.data?.message || 'Failed to update order status');
  }
};

  // Helper function to get status color based on new status system
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'being_packed':
        return 'bg-indigo-100 text-indigo-800';
      case 'managed_by_expedition':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-teal-100 text-teal-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'return_requested':
        return 'bg-orange-100 text-orange-800';
      case 'return_approved':
        return 'bg-blue-100 text-blue-800';
      case 'return_shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'return_received':
        return 'bg-teal-100 text-teal-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get readable status
  const getStatusDisplayName = (status) => {
    if (!status) return 'Unknown';
    
    const statusMap = {
      'processing': 'Processing',
      'confirmed': 'Confirmed',
      'being_packed': 'Being Packed',
      'managed_by_expedition': 'With Expedition',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'accepted': 'Accepted',
      'cancelled': 'Cancelled',
      'return_requested': 'Return Requested',
      'return_approved': 'Return Approved',
      'return_shipped': 'Return Shipped',
      'return_received': 'Return Received'
    };
    
    return statusMap[status.toLowerCase()] || status;
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

  const handleExport = (filters) => {
    // Get data to export
    let dataToExport = filteredOrders;
    
    // Apply additional filters if provided
    if (filters) {
      dataToExport = dataToExport.filter(order => {
        if (!order.createdAt) return false;
        
        const orderDate = new Date(order.createdAt);
        const matchesDate = orderDate.getFullYear() == filters.year && 
                         (orderDate.getMonth() + 1) == filters.month;
        const matchesStatus = filters.status === 'all' || order.status === filters.status;
        return matchesDate && matchesStatus;
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Order ID', 'Customer', 'Email', 'Date', 'Amount', 'Status', 'Payment Method', 'Tracking Number'],
      ...dataToExport.map(order => [
        order._id || '',
        order.user?.name || 'N/A',
        order.user?.email || 'N/A',
        order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
        order.totalAmount ? order.totalAmount.toFixed(2) : '0.00',
        getStatusDisplayName(order.status) || 'Unknown',
        order.paymentMethod || 'Unknown',
        order.expedition?.trackingNumber || 'N/A'
      ])
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    
    const fileName = filters 
      ? `orders_${filters.year}_${filters.month}.xlsx` 
      : `orders_${new Date().toISOString().slice(0, 10)}.xlsx`;
      
    XLSX.writeFile(workbook, fileName);
  };

  const getCurrentPageOrders = () => {
    if (!Array.isArray(filteredOrders)) return [];
    
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
            onClick={() => setIsExportModalOpen(true)}
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
                Tracking
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
                  {order._id ? order._id.substring(order._id.length - 8).toUpperCase() : 'N/A'}
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
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${order.totalAmount?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="capitalize">{order.paymentMethod || 'Not specified'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusDisplayName(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.expedition?.trackingNumber || '-'}
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
            
            {getCurrentPageOrders().length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                  No orders found matching your criteria
                </td>
              </tr>
            )}
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
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
};

export default OrderManager;