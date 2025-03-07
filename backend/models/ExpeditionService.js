// models/ExpeditionService.js
const mongoose = require('mongoose');

const expeditionServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  logo: {
    type: String
  },
  type: {
    type: String,
    enum: ['international', 'domestic'],
    required: true
  },
  description: {
    type: String
  },
  website: {
    type: String
  },
  estimatedDeliveryTime: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      enum: ['hour', 'day', 'week'],
      default: 'day'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const ExpeditionService = mongoose.model('ExpeditionService', expeditionServiceSchema);

// Create initial expedition services if they don't exist
const createInitialServices = async () => {
  try {
    const count = await ExpeditionService.countDocuments();
    if (count === 0) {
      const services = [
        // International services
        {
          name: 'DHL Express',
          code: 'DHL',
          logo: 'dhl-logo.png',
          type: 'international',
          description: 'Global express shipping service',
          website: 'https://www.dhl.com',
          estimatedDeliveryTime: {
            min: 3,
            max: 7,
            unit: 'day'
          }
        },
        {
          name: 'FedEx',
          code: 'FEDEX',
          logo: 'fedex-logo.png',
          type: 'international',
          description: 'International courier delivery services',
          website: 'https://www.fedex.com',
          estimatedDeliveryTime: {
            min: 2,
            max: 5,
            unit: 'day'
          }
        },
        {
          name: 'UPS',
          code: 'UPS',
          logo: 'ups-logo.png',
          type: 'international',
          description: 'Global package delivery company',
          website: 'https://www.ups.com',
          estimatedDeliveryTime: {
            min: 3,
            max: 6,
            unit: 'day'
          }
        },
        // Domestic services (Indonesia)
        {
          name: 'JNE',
          code: 'JNE',
          logo: 'jne-logo.png',
          type: 'domestic',
          description: 'Jalur Nugraha Ekakurir - Indonesian courier service',
          website: 'https://www.jne.co.id',
          estimatedDeliveryTime: {
            min: 1,
            max: 3,
            unit: 'day'
          }
        },
        {
          name: 'J&T Express',
          code: 'JNT',
          logo: 'jnt-logo.png',
          type: 'domestic',
          description: 'Express delivery service in Indonesia',
          website: 'https://www.jet.co.id',
          estimatedDeliveryTime: {
            min: 1,
            max: 2,
            unit: 'day'
          }
        },
        {
          name: 'SiCepat',
          code: 'SICEPAT',
          logo: 'sicepat-logo.png',
          type: 'domestic',
          description: 'Fast delivery service in Indonesia',
          website: 'https://www.sicepat.com',
          estimatedDeliveryTime: {
            min: 1,
            max: 2,
            unit: 'day'
          }
        }
      ];

      await ExpeditionService.insertMany(services);
      console.log('Initial expedition services created successfully');
    }
  } catch (error) {
    console.error('Error creating initial expedition services:', error);
  }
};

// Export the model and initialization function
module.exports = {
  ExpeditionService,
  createInitialServices
};