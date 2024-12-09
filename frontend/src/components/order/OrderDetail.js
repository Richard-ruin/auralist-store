// components/order/OrderDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderService } from '../../services/order';
import { formatters } from '../../utils/formatters';
import { toast } from 'react-hot-toast';
import {
  Truck,
  Package,
  CreditCard,
  Calendar,
  MapPin,
  AlertTriangle
} from 'lucide-react';

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderService.getOrderDetails(orderId);
        setOrder(response.data);
      } catch (error) {
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    try {
      await orderService.cancelOrder(orderId, 'Customer requested cancellation');
      toast.success('Order cancelled successfully');
      // Refresh order data
      const response = await orderService.getOrderDetails(orderId);
      setOrder(response.data);
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Order Header */}
      <div className="border-b pb-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Order #{order._id}</h2>
            <p className="text-gray-600">
              Placed on {formatters.date(order.createdAt)}
            </p>
          </div>
          <div>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${order.status === 'processing' && 'bg-blue-100 text-blue-800'}
              ${order.status === 'confirmed' && 'bg-green-100 text-green-800'}
              ${order.status === 'shipped' && 'bg-purple-100 text-purple-800'}
              ${order.status === 'delivered' && 'bg-green-100 text-green-800'}
              ${order.status === 'cancelled' && 'bg-red-100 text-red-800'}
            `}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center">
              <img
                src={`${process.env.REACT_APP_API_URL}/images/products/${item.product.images[0]}`}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="ml-4 flex-grow">
                <h4 className="font-medium">{item.product.name}</h4>
                <p className="text-gray-600">
                  Quantity: {item.quantity} × {formatters.currency(item.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {formatters.currency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded p-4 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatters.currency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatters.currency(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between font-medium text-lg pt-2 border-t">
            <span>Total</span>
            <span>{formatters.currency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Details */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Shipping Details</h3>
        <div className="bg-gray-50 rounded p-4">
          <p className="font-medium">{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.street}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
          {order.shippingAddress.phoneNumber && (
            <p className="mt-2">Phone: {order.shippingAddress.phoneNumber}</p>
          )}
        </div>
      </div>

      {/* Cancel Button */}
      {['processing', 'confirmed'].includes(order.status) && (
        <button
          onClick={handleCancelOrder}
          className="w-full mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          Cancel Order
        </button>
      )}
    </div>
  );
};

export default OrderDetail;