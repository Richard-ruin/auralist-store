import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
      <div 
        onClick={handleCardClick}
        className="cursor-pointer"
      >
        <div className="relative aspect-w-1 aspect-h-1">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-6 w-6 text-gray-700 hover:text-red-500 cursor-pointer" />
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h4>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
          <div className="flex justify-between items-center">
            <p className="text-gray-900 font-bold">${product.price.toFixed(2)}</p>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;