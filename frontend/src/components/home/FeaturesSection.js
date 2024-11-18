import React from 'react';
import { Truck, HeadphonesIcon, Award } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Free Shipping',
      description: 'On orders over $500'
    },
    {
      icon: <HeadphonesIcon className="h-8 w-8" />,
      title: 'Expert Support',
      description: '24/7 audio specialist assistance'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Premium Quality',
      description: 'Guaranteed authentic products'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.title} 
              className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors duration-300"
            >
              <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4 text-gray-800">
                {feature.icon}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;