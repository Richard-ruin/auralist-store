// utils/formatters.js
export const formatters = {
    // Currency formatter
    currency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(amount);
      },
    // Date formatter
    date: (date, format = 'full') => {
      const options = {
        full: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        },
        short: {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        },
        time: {
          hour: '2-digit',
          minute: '2-digit'
        }
      };
  
      return new Intl.DateTimeFormat('id-ID', options[format]).format(new Date(date));
    },
  
    // Phone number formatter
    phoneNumber: (number) => {
      if (!number) return '';
      const cleaned = number.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{2,3})(\d{3,4})(\d{4})$/);
      if (match) {
        return `+${match[1]}-${match[2]}-${match[3]}`;
      }
      return number;
    }
  };
  