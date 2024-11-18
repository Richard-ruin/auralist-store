import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategorySection = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'headphones',
      name: 'Headphones',
      image: '/images/categories/headphones.jpg',
      description: 'Premium sound isolation'
    },
    {
      id: 'speakers',
      name: 'Speakers',
      image: '/images/categories/speakers.jpg',
      description: 'Room-filling acoustics'
    },
    {
      id: 'amplifiers',
      name: 'Amplifiers',
      image: '/images/categories/amplifiers.jpg',
      description: 'Pure audio power'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">
          Shop by Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(`/category/${category.id}`)}
              className="relative h-64 bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${category.image})` }}
              />
              <div className="absolute inset-0 bg-gray-900 opacity-40 group-hover:opacity-50 transition-opacity" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h4 className="text-xl font-bold mb-2">{category.name}</h4>
                <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;