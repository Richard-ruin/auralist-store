import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../product/ProductCard';
import { useAuth } from '../../hooks/useAuth';

const RecommendationsSection = () => {
  const [recommendations, setRecommendations] = useState({
    forYou: [],
    topRated: [],
    trending: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        console.log('Fetching recommendations, user:', user); // Debug log

        // Parallel fetching for better performance
        const [topRatedResponse, trendingResponse] = await Promise.all([
          api.get('/products', {
            params: {
              sort: '-averageRating',
              limit: 4
            }
          }),
          api.get('/products', {
            params: {
              sort: '-totalReviews',
              limit: 4
            }
          })
        ]);

        let forYouProducts = [];
        
        // Fetch For You products if user is logged in
        if (user) {
          try {
            console.log('Fetching for-you products'); // Debug log
            const forYouResponse = await api.get('/products/for-you');
            console.log('For You Response:', forYouResponse.data); // Debug log
            forYouProducts = forYouResponse.data.data;
          } catch (error) {
            console.error('Error fetching for-you products:', error);
          }
        }

        console.log('Setting recommendations with:', {
          forYou: forYouProducts,
          topRated: topRatedResponse.data.data,
          trending: trendingResponse.data.data
        }); // Debug log

        setRecommendations({
          forYou: forYouProducts,
          topRated: topRatedResponse.data.data,
          trending: trendingResponse.data.data
        });
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]); // Depend on user to refetch when auth state changes

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Debug log untuk recommendations state
  console.log('Current recommendations state:', recommendations);

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {user && recommendations.forYou && recommendations.forYou.length > 0 && (
          <div className="mb-24">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-bold text-black mb-4">For You</h2>
                <p className="text-gray-600 max-w-2xl">
                  Personalized recommendations based on your preferences and purchase history.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendations.forYou.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        <div className="mb-24">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-black mb-4">Top Rated</h2>
              <p className="text-gray-600 max-w-2xl">
                Our highest rated audio equipment, loved by audiophiles worldwide.
              </p>
            </div>
            <a href="/shop?sort=-rating" className="hidden md:flex items-center space-x-2 text-black hover:text-gray-600 transition-colors">
              <span className="font-medium">View All</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendations.topRated.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-black mb-4">Trending Now</h2>
              <p className="text-gray-600 max-w-2xl">
                Popular audio equipment making waves in our community.
              </p>
            </div>
            <a href="/shop?sort=-reviews" className="hidden md:flex items-center space-x-2 text-black hover:text-gray-600 transition-colors">
              <span className="font-medium">View All</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendations.trending.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendationsSection;