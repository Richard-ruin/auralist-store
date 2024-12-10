
  // utils/validators.js
  export const validators = {
    required: (value) => {
      return value ? undefined : 'Bidang ini wajib diisi';
    },
  
    email: (value) => {
      if (!value) return;
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      return emailRegex.test(value) ? undefined : 'Format email tidak valid';
    },
  
    password: (value) => {
      if (!value) return;
      const hasMinLength = value.length >= 8;
      const hasNumber = /\d/.test(value);
      const hasLetter = /[a-zA-Z]/.test(value);
      
      if (!hasMinLength) return 'Password minimal 8 karakter';
      if (!hasNumber || !hasLetter) return 'Password harus mengandung huruf dan angka';
      return undefined;
    },
  
    phoneNumber: (value) => {
      if (!value) return;
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
      return phoneRegex.test(value) ? undefined : 'Nomor telepon tidak valid';
    },
  
    creditCard: (value) => {
      if (!value) return;
      // Test card numbers support
      const testCards = [
        '4242424242424242', // Visa
        '5555555555554444', // Mastercard
        '378282246310005',  // American Express
        '6011111111111117'  // Discover
      ];
      
      const cleaned = value.replace(/\s/g, '');
      return testCards.includes(cleaned) ? undefined : 'Nomor kartu kredit tidak valid (gunakan nomor test)';
    }
  };
  