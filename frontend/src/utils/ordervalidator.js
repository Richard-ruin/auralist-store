// utils/validation.js
export const validateOrderData = (orderData) => {
    const errors = [];
  
    // Check items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      errors.push('Order must have at least one item');
    }
  
    // Validate each item
    orderData.items?.forEach((item, index) => {
      if (!item.product) {
        errors.push(`Item ${index + 1}: Product ID is required`);
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        errors.push(`Item ${index + 1}: Quantity must be a positive integer`);
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        errors.push(`Item ${index + 1}: Price must be a positive number`);
      }
    });
  
    // Validate shipping address
    if (!orderData.shippingAddress) {
      errors.push('Shipping address is required');
    } else {
      const requiredFields = ['street', 'city', 'state', 'postalCode', 'country'];
      requiredFields.forEach(field => {
        if (!orderData.shippingAddress[field]) {
          errors.push(`Shipping address ${field} is required`);
        }
      });
    }
  
    // Validate total amount
    if (typeof orderData.totalAmount !== 'number' || orderData.totalAmount <= 0) {
      errors.push('Total amount must be a positive number');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };