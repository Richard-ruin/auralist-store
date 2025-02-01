// controllers/reportController.js
const Order = require('../models/Order');

exports.getProductReport = async (req, res) => {
  try {
    // Log initial counts
    const orderCount = await Order.countDocuments();
    console.log('Total orders in database:', orderCount);

    // Sesuaikan dengan enum status yang benar
    const completedOrders = await Order.find({ 
      status: 'delivered' // menggunakan 'delivered' sebagai status selesai
    }).populate('items.product');
    console.log('Completed orders:', completedOrders.length);

    const report = await Order.aggregate([
      // Match orders yang sudah delivered
      {
        $match: {
          status: 'delivered',
          paymentConfirmedAt: { $exists: true, $ne: null } // memastikan pembayaran sudah dikonfirmasi
        }
      },
      // Unwind items array
      { $unwind: '$items' },
      // Lookup untuk mendapatkan informasi produk
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      // Unwind product info
      { $unwind: '$productInfo' },
      // Group by product
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$productInfo.name' },
          sku: { $first: '$productInfo.sku' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { 
            $sum: { 
              $multiply: ['$items.price', '$items.quantity'] 
            } 
          },
          lastPurchased: { $max: '$createdAt' }
        }
      },
      // Format output
      {
        $project: {
          productId: '$_id',
          name: 1,
          sku: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          lastPurchased: 1,
          _id: 0
        }
      },
      // Sort by total quantity sold
      {
        $sort: {
          totalQuantity: -1
        }
      }
    ]);

    console.log('Report generated with', report.length, 'products');
    if (report.length > 0) {
      console.log('Sample report item:', report[0]);
    }

    res.json(report);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: []
    });
  }
};