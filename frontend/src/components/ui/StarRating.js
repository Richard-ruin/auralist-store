import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 'md', interactive = false, onChange }) => {
  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const renderStar = (index) => {
    const filled = index < rating;
    
    return (
      <button
        key={index}
        onClick={() => interactive && onChange(index + 1)}
        className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        disabled={!interactive}
      >
        <Star 
          className={`${starSizes[size]} ${
            filled ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      </button>
    );
  };

  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, index) => renderStar(index))}
    </div>
  );
};

export default StarRating;