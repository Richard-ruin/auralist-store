import React, { useState } from 'react';
import { X, Home, Building2, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const ShippingAddressForm = ({ isOpen, onClose, onAddressAdded }) => {
  const [formData, setFormData] = useState({
    type: 'home',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/addresses', formData);
      toast.success('Address added successfully');
      onAddressAdded(response.data.data);
      onClose();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      name: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Add New Address</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'home', icon: Home, label: 'Home' },
                  { id: 'office', icon: Building2, label: 'Office' },
                  { id: 'other', icon: MapPin, label: 'Other' }
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: id })}
                    className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                      formData.type === id 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">State/Province</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">Set as default shipping address</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Add Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingAddressForm;