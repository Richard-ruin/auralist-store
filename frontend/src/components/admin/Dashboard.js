import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Loader,
  AlertTriangle
} from 'lucide-react';
import orderService from '../../services/orderService';
import { productService } from '../../services/productService';
import { getUserStats } from '../../services/users';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentOrders: [],
    lowStockProducts: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        const [orderStats, userStats, productsResponse, ordersResponse] = await Promise.all([
          orderService.getOrderStats(),
          getUserStats(),
          productService.getAll(),
          orderService.getAllOrders()
        ]);

        // Calculate total revenue from orders
        const totalRevenue = ordersResponse.data.orders.reduce((sum, order) => 
          sum + (order.status !== 'cancelled' ? order.totalAmount : 0), 0);

        // Calculate this month's revenue
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const thisMonthRevenue = ordersResponse.data.orders
          .filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === thisMonth && 
                   orderDate.getFullYear() === thisYear &&
                   order.status !== 'cancelled';
          })
          .reduce((sum, order) => sum + order.totalAmount, 0);

        // Calculate revenue change
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastMonthRevenue = ordersResponse.data.orders
          .filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === lastMonth &&
                   (lastMonth === 11 ? orderDate.getFullYear() === thisYear - 1 : orderDate.getFullYear() === thisYear) &&
                   order.status !== 'cancelled';
          })
          .reduce((sum, order) => sum + order.totalAmount, 0);

        const revenueChange = lastMonthRevenue ? 
          ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 
          100;

        // Get low stock products
        const lowStockProducts = productsResponse.data.data.filter(
          product => product.stock <= product.lowStockThreshold
        );

        // Prepare stats data
        // Replace the stats preparation block with this safer version
const stats = [
  {
    title: 'Total Revenue',
    value: `$${totalRevenue.toLocaleString()}`,
    change: `${revenueChange}%`,
    isIncrease: revenueChange > 0,
    icon: <DollarSign className="w-6 h-6" />
  },
  {
    title: 'Total Orders',
    value: (orderStats.data?.total || 0).toString(),
    change: `${((orderStats.data?.thisMonth || 0) / (orderStats.data?.total || 1) * 100).toFixed(1)}%`,
    isIncrease: (orderStats.data?.thisMonth || 0) > 0,
    icon: <ShoppingBag className="w-6 h-6" />
  },
  {
    title: 'Total Customers',
    value: (userStats.data?.totalUsers || 0).toString(),
    change: `${((userStats.data?.activeUsers || 0) / (userStats.data?.totalUsers || 1) * 100).toFixed(1)}%`,
    isIncrease: true,
    icon: <Users className="w-6 h-6" />
  },
  {
    title: 'Low Stock Items',
    value: lowStockProducts.length.toString(),
    change: `${((lowStockProducts.length / (productsResponse.data?.data?.length || 1)) * 100).toFixed(1)}%`,
    isIncrease: false,
    icon: <Package className="w-6 h-6" />
  }
];

        // Get recent orders
        const recentOrders = ordersResponse.data.orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setDashboardData({
          stats,
          recentOrders,
          lowStockProducts: lowStockProducts.slice(0, 5)
        });

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message || 'Failed to fetch dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  const getStatusClass = (status) => {
    const statusClasses = {
      'processing': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardData.stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gray-100 rounded-lg">
                {stat.icon}
              </div>
              <div
                className={`flex items-center ${
                  stat.isIncrease ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.isIncrease ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="ml-1 text-sm font-medium">{stat.change}</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threshold
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.lowStockProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.lowStockThreshold} units
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;