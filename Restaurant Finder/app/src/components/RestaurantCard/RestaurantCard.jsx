import { Link } from 'react-router';
import { Star, MapPin, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RestaurantCard({ restaurant, isSaved, onToggleSave }) {
  const { isAuthenticated } = useAuth();

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(restaurant.id);
    }
  };

  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <button
            onClick={handleSave}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isSaved
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700">
            {restaurant.cuisineName}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          <span className="text-xs font-medium text-gray-500 shrink-0">
            {restaurant.priceRange}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-gray-800">
            {restaurant.rating}
          </span>
          <span className="text-sm text-gray-400">
            ({restaurant.reviews.toLocaleString()} reviews)
          </span>
        </div>

        <div className="flex items-center gap-1 text-gray-500">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs truncate">{restaurant.location}</span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {restaurant.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-md"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
