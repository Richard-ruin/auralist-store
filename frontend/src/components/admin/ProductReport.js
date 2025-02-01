import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import Pagination from '../admin/Pagination';
import * as XLSX from 'xlsx';
import reportService from '../../services/reportService';
import { toast } from 'react-hot-toast';

// ... kode lainnya ...

const ProductReport = () => {
  // States
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    dateRange: 'all', // all, today, week, month, year
    sortBy: 'quantity-desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1
  });

  // Fetch Data
  useEffect(() => {
    fetchReportData();
  }, []);

  

const fetchReportData = async () => {
    try {
      setLoading(true);
      const data = await reportService.getProductReport();
      
      // Pastikan data adalah array
      const reportData = Array.isArray(data) ? data : 
                        Array.isArray(data.data) ? data.data : [];
      
      console.log('Fetched data:', reportData);
      
      setProducts(reportData);
      setFilteredProducts(reportData);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch report data');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter handling
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let result = products;

    // Apply search filter
    if (filters.search) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.sku.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch(filters.dateRange) {
        case 'today':
          filterDate.setHours(0,0,0,0);
          break;
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(filterDate.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(filterDate.getFullYear() - 1);
          break;
      }

      result = result.filter(product => 
        new Date(product.lastPurchased) >= filterDate
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch(filters.sortBy) {
        case 'quantity-desc':
          return b.totalQuantity - a.totalQuantity;
        case 'quantity-asc':
          return a.totalQuantity - b.totalQuantity;
        case 'revenue-desc':
          return b.totalRevenue - a.totalRevenue;
        case 'revenue-asc':
          return a.totalRevenue - b.totalRevenue;
        default:
          return 0;
      }
    });

    setFilteredProducts(result);
    setPagination(prev => ({
      ...prev,
      totalPages: Math.ceil(result.length / prev.itemsPerPage)
    }));
  }, [products, filters]);

  // Export to Excel
  const handleExport = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Product Name', 'SKU', 'Total Quantity Sold', 'Total Revenue', 'Last Purchased'],
      ...filteredProducts.map(product => [
        product.name,
        product.sku,
        product.totalQuantity,
        product.totalRevenue.toFixed(2),
        new Date(product.lastPurchased).toLocaleDateString()
      ])
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Report');
    XLSX.writeFile(workbook, `product_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Get current page data
  const getCurrentPageProducts = () => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filteredProducts.slice(start, end);
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
          <h1 className="text-2xl font-semibold text-gray-900">Product Sales Report</h1>
          <p className="mt-1 text-sm text-gray-500">
            View detailed report of product sales
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            />
          </div>

          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="quantity-desc">Quantity (High to Low)</option>
            <option value="quantity-asc">Quantity (Low to High)</option>
            <option value="revenue-desc">Revenue (High to Low)</option>
            <option value="revenue-asc">Revenue (Low to High)</option>
          </select>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Download className="w-5 h-5 mr-2" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Purchased
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getCurrentPageProducts().map((product) => (
              <tr key={product.productId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.totalQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${product.totalRevenue.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(product.lastPurchased).toLocaleDateString()}
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
    </div>
  );
};

export default ProductReport;