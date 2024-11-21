import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Truck, Shield, ArrowLeft, Plus, Minus } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  // Dummy product data - replace with real data from API
  const product = {
    id: 1,
    name: 'HD 660S',
    brand: 'Sennheiser',
    price: 499.99,
    rating: 4.8,
    reviews: 124,
    description: 'High-end open-back headphones for audiophiles. Features exceptional detail and natural, spatial sound reproduction.',
    longDescription: `The HD 660S continues the legacy of Sennheiser's HD 600 series, delivering high-fidelity sound in a comfortable, open-back design. Key features include:
    
    - High-quality open-back design
    - 150-ohm impedance for optimal performance
    - Improved transducer design for detailed, accurate sound
    - Detachable cable with 6.35mm and 4.4mm connections
    - Comfortable, adjustable headband
    - Durable construction for long-term use`,
    specifications: [
      { name: 'Impedance', value: '150 ohm' },
      { name: 'Frequency Response', value: '10 - 41,000 Hz' },
      { name: 'Sound Pressure Level', value: '104 dB' },
      { name: 'Weight', value: '260g' }
    ],
    images: [
      '/images/products/hd660s.jpg',
      '/images/products/hd660s-2.jpg',
      '/images/products/hd660s-3.jpg'
    ],
    stock: 10,
    inWishlist: false
  };

  const [selectedImage, setSelectedImage] = useState(0);

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log('Added to cart:', { productId: id, quantity });
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Shop
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 w-full">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                  selectedImage === index ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-lg text-gray-600 mt-1">{product.brand}</p>
          </div>

          <div className="flex items-center mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-5 h-5 ${
                    index < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="ml-2 text-sm text-gray-600">
              {product.rating} ({product.reviews} reviews)
            </p>
          </div>

          <div className="mb-6">
            <p className="text-3xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Free shipping on orders over $500
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex items-center text-gray-600">
              <Truck className="w-5 h-5 mr-2" />
              <span>Free shipping worldwide</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Shield className="w-5 h-5 mr-2" />
              <span>2-year warranty included</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {product.stock} units available
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
            <button className="px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-50">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Specifications */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              {product.specifications.map((spec) => (
                <div key={spec.name} className="border-b border-gray-200 pb-2">
                  <p className="text-sm text-gray-600">{spec.name}</p>
                  <p className="font-medium">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Product Details</h2>
            <div className="prose prose-sm text-gray-600">
              {product.longDescription.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;