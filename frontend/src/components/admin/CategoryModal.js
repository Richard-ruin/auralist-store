import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CategoryModal = ({ category, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    image: null
  });
  
  const [currentImage, setCurrentImage] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  // Initialize form data when category prop changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        status: category.status || 'Active',
        image: null
      });
      setCurrentImage(category.image || '');
    }
  }, [category]);

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Append basic form data
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('status', formData.status);

    // Append image only if a new one is selected
    if (formData.image) {
      data.append('image', formData.image);
    }

    // If editing, send current image name if no new image is selected
    if (category && !formData.image && currentImage) {
      data.append('currentImage', currentImage);
    }

    onSave(data);
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {category ? 'Edit Category' : 'Add Category'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium mb-1">Image</label>
            {/* Current image preview */}
            {(currentImage || previewImage) && (
              <div className="mb-2">
                <img
                  src={previewImage || `${process.env.REACT_APP_API_URL}/images/categories/${currentImage}`}
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
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;