
  // utils/constants.js
  export const constants = {
    ORDER_STATUS: {
      PENDING: 'pending',
      PROCESSING: 'processing',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled'
    },
  
    PAYMENT_STATUS: {
      PENDING: 'pending',
      COMPLETED: 'completed',
      FAILED: 'failed',
      REFUNDED: 'refunded'
    },
  
    PAYMENT_METHODS: {
      CREDIT_CARD: 'credit_card',
      BANK_TRANSFER: 'bank_transfer'
    },
  
    USER_ROLES: {
      ADMIN: 'admin',
      CUSTOMER: 'customer'
    },
  
    API_ENDPOINTS: {
      AUTH: '/auth',
      USERS: '/users',
      PRODUCTS: '/products',
      ORDERS: '/orders',
      PAYMENTS: '/payments'
    }
  };

  