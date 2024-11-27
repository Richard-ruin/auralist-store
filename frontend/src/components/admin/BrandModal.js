// components/admin/BrandModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const BrandModal = ({ brand, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    website: '',
    logo: null
  });
  
  const [currentLogo, setCurrentLogo] = useState('');
  const [previewLogo, setPreviewLogo] = useState('');

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        status: brand.status || 'Active',
        website: brand.website || '',
        logo: null
      });
      setCurrentLogo(brand.logo || '');
    }
  }, [brand]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('status', formData.status);
    data.append('website', formData.website);

    if (formData.logo) {
      data.append('logo', formData.logo);
    }

    if (brand && !formData.logo && currentLogo) {
      data.append('currentLogo', currentLogo);
    }

    onSave(data);
  };

  useEffect(() => {
    return () => {
      if (previewLogo) {
        URL.revokeObjectURL(previewLogo);
      }
    };
  }, [previewLogo]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {brand ? 'Edit Brand' : 'Add Brand'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4">
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Logo</label>
              {(currentLogo || previewLogo) && (
                <div className="mb-2">
                  <img
                    src={previewLogo || `${process.env.REACT_APP_API_URL}/images/brands/${currentLogo}`}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full border rounded-md p-2"
                accept="image/*"
              />
            </div>
          </div>
        </form>
        
        {/* Footer - Fixed */}
        <div className="border-t p-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandModal;