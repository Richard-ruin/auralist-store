import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

const ItemCard = ({ 
  image, 
  name, 
  status, 
  description, 
  itemCount,
  type = 'brand', // 'brand' or 'category'
  onEdit,
  onDelete,
  onSettings,
  website
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Image Container with Fixed Aspect Ratio */}
      <div className="relative w-full pt-[60%] bg-gray-50">
        {image ? (
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-contain p-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder.jpg';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {name}
          </h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 flex-grow line-clamp-2">
          {description}
        </p>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {itemCount} {type === 'brand' ? 'products' : 'items'}
            </span>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="p-2 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              {type === 'category' && onSettings && (
                <button
                  onClick={onSettings}
                  className="p-2 text-blue-600 hover:text-blue-900 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}

              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
            >
              Visit Website
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;