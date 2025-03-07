import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Check, Building2, Home } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import ShippingAddressForm from './ShippingAddressForm';

const ShippingAddressSelector = ({ selectedAddressId, onSelect }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      setAddresses(response.data.data);
      // If there's a default address and no selection yet, select it
      if (!selectedAddressId) {
        const defaultAddress = response.data.data.find(addr => addr.isDefault);
        if (defaultAddress) {
          onSelect(defaultAddress._id);
        }
      }
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressAdded = (newAddress) => {
    setAddresses([...addresses, newAddress]);
    if (newAddress.isDefault) {
      onSelect(newAddress._id);
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case 'home':
        return <Home className="w-5 h-5" />;
      case 'office':
        return <Building2 className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading addresses...</div>;
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div
          key={address._id}
          onClick={() => onSelect(address._id)}
          className={`relative p-4 border rounded-lg cursor-pointer transition-all
            ${selectedAddressId === address._id 
              ? 'border-indigo-600 bg-indigo-50' 
              : 'border-gray-200 hover:border-gray-300'}`}
        >
          <div className="flex items-start">
            <div className="text-gray-400">
              {getAddressIcon(address.type)}
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {address.name}
                    {address.isDefault && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500">{address.phone}</p>
                </div>
                {selectedAddressId === address._id && (
                  <Check className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                <p>{address.street}</p>
                <p>{`${address.city}, ${address.state} ${address.postalCode}`}</p>
                <p>{address.country}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button 
        onClick={() => setShowAddressForm(true)}
        className="flex items-center justify-center w-full p-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400"
      >
        <Plus className="w-5 h-5 text-gray-400 mr-2" />
        <span className="text-sm font-medium text-gray-900">
          Add New Address
        </span>
      </button>

      <ShippingAddressForm 
        isOpen={showAddressForm}
        onClose={() => setShowAddressForm(false)}
        onAddressAdded={handleAddressAdded}
      />
    </div>
  );
};

export default ShippingAddressSelector;