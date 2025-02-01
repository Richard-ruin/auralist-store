import React, { useState, useEffect } from 'react';
import AddressSection from './AddressSection';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Package, 
  Heart, 
  LogOut,
  Camera,
  Edit
} from 'lucide-react';
import { userService } from '../../services/userService';
import { toast } from 'react-hot-toast';
// In Profile.js, add this import at the top
import { generateDefaultAvatar } from '../../utils/avatarUtils';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  // Add formData state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const loadUserData = () => {
      setLoading(true);
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setFormData({
            name: parsedUser.name || '',
            email: parsedUser.email || '',
            phoneNumber: parsedUser.phoneNumber || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Replace the separate ProfileAvatar component with direct avatar rendering
  const renderAvatar = () => {
    if (avatarLoading) {
      return (
        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      );
    }

    const avatarSrc = user.avatar?.startsWith('data:') 
      ? user.avatar 
      : user.avatar 
      ? `${process.env.REACT_APP_IMAGE_BASE_URL}/profiles/${user.avatar}`
      : generateDefaultAvatar(user.name);

    return (
      <img
        src={avatarSrc}
        alt="Profile"
        className="h-24 w-24 rounded-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = generateDefaultAvatar(user.name);
        }}
      />
    );
  };


  const ProductImage = ({ image, name }) => {
    return (
      <img
        src={image ? `${process.env.REACT_APP_API_URL}/images/products/${image}` : '/api/placeholder/300/300'}
        alt={name}
        className="w-full h-full object-cover rounded-md"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/api/placeholder/300/300';
        }}
      />
    );
  };
  

// Then update the img tag:

  const ProfileAvatar = ({ user, avatarLoading }) => {
    if (avatarLoading) {
      return (
        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      );
    }
  
    // If avatar is a data URL (SVG)
    if (user.avatar?.startsWith('data:')) {
      return (
        <img
          src={user.avatar}
          alt="Profile"
          className="h-24 w-24 rounded-full object-cover"
        />
      );
    }
  
    // If avatar is an uploaded image
    if (user.avatar) {
      return (
        <img
          src={`${process.env.REACT_APP_API_URL}/uploads/profiles/${user.avatar}`}
          alt="Profile"
          className="h-24 w-24 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            if (user.generatedAvatar) {
              e.target.src = user.generatedAvatar;
            } else {
              e.target.src = `data:image/svg+xml,${encodeURIComponent(generateDefaultAvatar(user.name))}`;
            }
          }}
        />
      );
    }
  
    // Default case - show user icon
    return (
      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
        <User className="h-12 w-12 text-gray-400" />
      </div>
    );
  };
  const ProfileOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
  
        const response = await fetch('http://localhost:5000/api/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
  
        if (response.ok) {
          const data = await response.json();
          setOrders(data.data.orders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchOrders();
    }, []);
  
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      );
    }
  
    if (orders.length === 0) {
      return (
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start shopping to see your orders here.</p>
        </div>
      );
    }
  
    return (
      <div className="space-y-4">
        {orders.map((order) => (  // Changed from order.items to orders.map
          <div key={order._id} className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">Order #{order._id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-16 h-16">
                      <ProductImage 
                        image={item.product?.mainImage} 
                        name={item.product?.name} 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.product?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${item.price?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900">Total</p>
                  <p className="text-sm font-medium text-gray-900">
                    ${order.totalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('avatar', file);
  
    setAvatarLoading(true);
    try {
      const result = await userService.updateAvatar(user._id, formData);
      const updatedUser = { ...user, avatar: result.data.avatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setAvatarLoading(false);
    }
  };
  
  const handleResetAvatar = async () => {
    try {
      const result = await userService.resetAvatar(user._id);
      const updatedUser = { ...user, avatar: result.data.avatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profile picture reset successfully');
    } catch (error) {
      console.error('Error resetting avatar:', error);
      toast.error(error.message || 'Failed to reset profile picture');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/update-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser.data));
        setUser(updatedUser.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        alert('Password updated successfully');
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'address', name: 'Addresses', icon: MapPin }
  ];

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-1/4 border-r border-gray-200">
              <div className="p-4">
              <div className="text-center mb-6">
              <div className="relative inline-block group">
              {renderAvatar()}
  {avatarLoading ? (
    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  ) : user.avatar ? (
    <img
      src={`${process.env.REACT_APP_API_URL}/images/profiles/${user.avatar}`}
      alt="Profile"
      className="h-24 w-24 rounded-full object-cover"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `data:image/svg+xml,${encodeURIComponent(user.generatedAvatar || '')}`;
      }}
    />
  ) : (
    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
      <User className="h-12 w-12 text-gray-400" />
    </div>
  )}
  
  <div className="absolute bottom-0 right-0 flex space-x-1">
    <label className="cursor-pointer bg-white rounded-full p-2 shadow-sm border border-gray-200 hover:bg-gray-50">
      <Camera className="h-4 w-4 text-gray-500" />
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleAvatarUpload}
      />
    </label>
    {user.avatar && (
      <button
        onClick={handleResetAvatar}
        className="bg-white rounded-full p-2 shadow-sm border border-gray-200 hover:bg-gray-50"
        title="Reset to default avatar"
      >
        <svg
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    )}
  </div>
</div>
  <h2 className="mt-4 text-xl font-semibold text-gray-900">{user.name}</h2>
  <p className="text-sm text-gray-500">{user.email}</p>
</div>

                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full ${
                          activeTab === tab.id
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {tab.name}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }}
                    className="flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg w-full"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:w-3/4 p-6">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center text-indigo-600 hover:text-indigo-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Name</p>
                          <p className="text-sm text-gray-900">{user.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-sm text-gray-900">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone Number</p>
                          <p className="text-sm text-gray-900">{user.phoneNumber || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              
              {activeTab === 'address' && (
  <div>
    <AddressSection />
  </div>
)}

{activeTab === 'orders' && (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Order History</h3>
      <ProfileOrders />
    </div>
  )}

              {activeTab === 'wishlist' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">My Wishlist</h3>
                  {/* Wishlist component will go here */}
                  <p className="text-gray-500">Your wishlist is empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;