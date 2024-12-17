export const filterOrders = (orders, filters) => {
  if (!Array.isArray(orders)) return [];
  
  return orders.filter(order => {
    let matches = true;
    
    // Filter by order status
    if (filters.status && filters.status !== 'all') {
      matches = matches && order.status?.toLowerCase() === filters.status.toLowerCase();
    }
    
    // Filter by payment status
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      // Check both paymentStatus and paymentMethod fields
      const orderPaymentStatus = order.paymentStatus || order.paymentMethod;
      matches = matches && orderPaymentStatus?.toLowerCase() === filters.paymentStatus.toLowerCase();
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        order._id?.toString().toLowerCase().includes(searchTerm) ||
        order.user?.name?.toLowerCase().includes(searchTerm) ||
        order.user?.email?.toLowerCase().includes(searchTerm) ||
        order.status?.toLowerCase().includes(searchTerm) ||
        (order.paymentStatus || order.paymentMethod)?.toLowerCase().includes(searchTerm);
      matches = matches && matchesSearch;
    }

    return matches;
  });
};

export const sortOrders = (orders, sortBy) => {
  if (!Array.isArray(orders)) return [];
  
  return [...orders].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'date-asc':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case 'amount-desc':
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      case 'amount-asc':
        return (a.totalAmount || 0) - (b.totalAmount || 0);
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });
};