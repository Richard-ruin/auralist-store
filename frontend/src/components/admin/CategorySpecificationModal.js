// components/admin/CategorySpecificationModal
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const CategorySpecificationModal = ({ category, onClose }) => {
  const [specifications, setSpecifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSpec, setNewSpec] = useState({
    name: '',
    displayName: '',
    type: 'text',
    unit: '',
    isRequired: false,
    order: 0,
    options: []
  });

  useEffect(() => {
    const fetchSpecifications = async () => {
      try {
        const response = await api.get(`/specifications/category/${category._id}`);
        setSpecifications(response.data.data);
      } catch (error) {
        toast.error('Failed to load specifications');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecifications();
  }, [category._id]);

  const handleAddSpecification = async () => {
    try {
      const response = await api.post('/specifications', {
        ...newSpec,
        category: category._id
      });
      setSpecifications([...specifications, response.data.data]);
      setNewSpec({
        name: '',
        displayName: '',
        type: 'text',
        unit: '',
        isRequired: false,
        order: specifications.length,
        options: []
      });
      toast.success('Specification added successfully');
    } catch (error) {
      toast.error('Failed to add specification');
    }
  };

  const handleDeleteSpecification = async (id) => {
    try {
      await api.delete(`/specifications/${id}`);
      setSpecifications(specifications.filter(spec => spec._id !== id));
      toast.success('Specification deleted successfully');
    } catch (error) {
      toast.error('Failed to delete specification');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Manage Specifications for {category.name}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Add New Specification Form */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Add New Specification</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name (Internal)</label>
              <input
                type="text"
                value={newSpec.name}
                onChange={(e) => setNewSpec({...newSpec, name: e.target.value})}
                className="w-full border rounded-md p-2"
                placeholder="e.g., frequency_response"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <input
                type="text"
                value={newSpec.displayName}
                onChange={(e) => setNewSpec({...newSpec, displayName: e.target.value})}
                className="w-full border rounded-md p-2"
                placeholder="e.g., Frequency Response"
              />
            </div>
            <div>
  <label className="block text-sm font-medium mb-1">Type</label>
  <select
    value={newSpec.type}
    onChange={(e) => setNewSpec({...newSpec, type: e.target.value})}
    className="w-full border rounded-md p-2"
  >
    <option value="string">String (Single line)</option>
    <option value="textarea">Text Area (Multi line)</option>
    <option value="number">Number</option>
    <option value="select">Select</option>
    <option value="boolean">Boolean</option>
  </select>
  <p className="text-xs text-gray-500 mt-1">
    {newSpec.type === 'string' && 'Single line text input (e.g., "Model Name", "Color")'}
    {newSpec.type === 'textarea' && 'Multi-line text input (e.g., "Features", "Package Contents")'}
    {newSpec.type === 'number' && 'Numeric input with optional unit'}
    {newSpec.type === 'select' && 'Dropdown with predefined options'}
    {newSpec.type === 'boolean' && 'Yes/No choice'}
  </p>
</div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit (optional)</label>
              <input
                type="text"
                value={newSpec.unit}
                onChange={(e) => setNewSpec({...newSpec, unit: e.target.value})}
                className="w-full border rounded-md p-2"
                placeholder="e.g., Hz"
              />
            </div>
          </div>

          {newSpec.type === 'select' && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Options (comma-separated)</label>
              <input
                type="text"
                value={newSpec.options.join(', ')}
                onChange={(e) => setNewSpec({
                  ...newSpec, 
                  options: e.target.value.split(',').map(opt => opt.trim())
                })}
                className="w-full border rounded-md p-2"
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newSpec.isRequired}
                onChange={(e) => setNewSpec({...newSpec, isRequired: e.target.checked})}
                className="rounded border-gray-300 mr-2"
              />
              Required field
            </label>
          </div>

          <button
            onClick={handleAddSpecification}
            className="mt-4 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Specification
          </button>
        </div>

        {/* Existing Specifications List */}
        <div>
          <h3 className="text-lg font-medium mb-4">Existing Specifications</h3>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : specifications.length > 0 ? (
            <div className="space-y-4">
              {specifications.map((spec) => (
                <div key={spec._id} className="flex justify-between items-center p-4 bg-white border rounded-lg">
                  <div>
                    <h4 className="font-medium">{spec.displayName}</h4>
                    <p className="text-sm text-gray-500">
                      Type: {spec.type}
                      {spec.unit && ` | Unit: ${spec.unit}`}
                      {spec.isRequired && ' | Required'}
                    </p>
                    {spec.type === 'select' && (
                      <p className="text-sm text-gray-500">
                        Options: {spec.options.join(', ')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteSpecification(spec._id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">
              No specifications defined for this category
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySpecificationModal;