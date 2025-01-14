// frontend/src/components/admin/CommunityChannelManager.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';

const CommunityChannelManager = () => {
  const [channels, setChannels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [formData, setFormData] = useState({
    channel: '',
    description: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await api.get('/community/channels');
      setChannels(response.data.data.channels);
      setError(null);
    } catch (err) {
      console.error('Error fetching channels:', err);
      setError('Failed to fetch channels');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingChannel) {
        await api.patch(`/community/channels/${editingChannel._id}`, formData);
      } else {
        await api.post('/community/channels', formData);
      }
      
      setIsModalOpen(false);
      setEditingChannel(null);
      setFormData({ channel: '', description: '' });
      fetchChannels();
      setError(null);
    } catch (err) {
      console.error('Error saving channel:', err);
      setError(err.response?.data?.message || 'Failed to save channel');
    }
  };

  const handleDelete = async (channelId) => {
    if (window.confirm('Are you sure you want to delete this channel?')) {
      try {
        await api.delete(`/community/channels/${channelId}`);
        fetchChannels();
        setError(null);
      } catch (err) {
        console.error('Error deleting channel:', err);
        setError('Failed to delete channel');
      }
    }
  };

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Community Channels</h2>
        <button
          onClick={() => {
            setEditingChannel(null);
            setFormData({ channel: '', description: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" />
          Add Channel
        </button>
      </div>

      {/* Channels List */}
      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {channels.map(channel => (
              <tr key={channel._id}>
                <td className="px-6 py-4">#{channel.channel}</td>
                <td className="px-6 py-4">{channel.description}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingChannel(channel);
                        setFormData({
                          channel: channel.channel,
                          description: channel.description
                        });
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(channel._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">
              {editingChannel ? 'Edit Channel' : 'New Channel'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingChannel ? 'Save Changes' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityChannelManager;