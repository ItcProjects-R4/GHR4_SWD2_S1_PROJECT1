import { useState } from 'react';
import { Link } from 'react-router';
import RestaurantCard from '@/components/RestaurantCard/RestaurantCard';
import { getSavedRestaurants, getSavedIds, toggleSavedRestaurant } from '@/data/restaurants';
import { Heart, ArrowRight } from 'lucide-react';

export default function Saved() {
  const [savedRestaurants, setSavedRestaurants] = useState(getSavedRestaurants);
  const [savedIds, setSavedIds] = useState(getSavedIds);

  const toggleSave = (id) => {
    const restaurant = savedRestaurants.find((r) => r.id === id);
    if (!restaurant) return;
    const newIds = toggleSavedRestaurant(restaurant);
    setSavedIds(newIds);
    setSavedRestaurants(getSavedRestaurants());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Saved Restaurants
          </h1>
          <p className="text-sm text-gray-500">
            {savedRestaurants.length} restaurant
            {savedRestaurants.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {savedRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isSaved={savedIds.includes(restaurant.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No saved restaurants yet
            </h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start exploring and save your favorite restaurants to find them
              here later.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors"
            >
              Explore Restaurants
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
