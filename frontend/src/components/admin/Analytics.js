import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader
} from 'lucide-react';
import { useOrder } from '../../hooks/useOrder';
import { useProducts } from '../../hooks/useProducts';
import { useUsers } from '../../hooks/useUsers';
import api from '../../services/api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    orderStats: null,
    userStats: null,
    productStats: null,
    recentOrders: []
  });

  const { getOrder } = useOrder();
  const { fetchProducts } = useProducts();
  const { fetchStats: fetchUserStats } = useUsers();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        const [orderResponse, productResponse, userResponse, recentOrdersResponse] = await Promise.all([
          api.get('/orders/stats'),
          api.get('/products/stats'),
          api.get('/users/stats'),
          api.get('/orders', { params: { limit: 5, sort: '-createdAt' } })
        ]);

        setAnalyticsData({
          orderStats: orderResponse.data.data,
          productStats: productResponse.data,
          userStats: userResponse.data.data,
          recentOrders: recentOrdersResponse.data.data.orders
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
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
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error loading analytics: {error}
      </div>
    );
  }

  const { orderStats, userStats, productStats, recentOrders } = analyticsData;

  const stats = [
    {
      title: 'Total Orders',
      value: orderStats?.total || 0,
      change: `${((orderStats?.thisMonth / orderStats?.total) * 100).toFixed(1)}%`,
      isIncrease: orderStats?.thisMonth > 0,
      icon: <ShoppingBag className="w-6 h-6" />
    },
    {
      title: 'Total Users',
      value: userStats?.totalUsers || 0,
      change: `${((userStats?.newThisMonth / userStats?.totalUsers) * 100).toFixed(1)}%`,
      isIncrease: userStats?.newThisMonth > 0,
      icon: <Users className="w-6 h-6" />
    },
    {
      title: 'Active Users',
      value: userStats?.activeUsers || 0,
      change: `${((userStats?.activeUsers / userStats?.totalUsers) * 100).toFixed(1)}%`,
      isIncrease: true,
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: 'Pending Orders',
      value: orderStats?.pending || 0,
      change: `${((orderStats?.pending / orderStats?.total) * 100).toFixed(1)}%`,
      isIncrease: false,
      icon: <DollarSign className="w-6 h-6" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Real-time performance metrics and insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: orderStats?.pending || 0 },
                    { name: 'Processing', value: orderStats?.processing || 0 },
                    { name: 'Completed', value: (orderStats?.total - (orderStats?.pending + orderStats?.processing)) || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    '#4F46E5',
                    '#10B981',
                    '#F59E0B'
                  ].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between border-b border-gray-200 pb-4"
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order._id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                  <p className={`text-sm ${
                    order.status === 'completed' ? 'text-green-600' :
                    order.status === 'processing' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;