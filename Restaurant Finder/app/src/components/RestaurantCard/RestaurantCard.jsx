import { Link, useLocation, useNavigate } from 'react-router';
import { Star, MapPin, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RestaurantCard({ restaurant, isSaved, onToggleSave }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/register', {
        state: {
          message: 'Please register or sign in to save restaurants to your favorites.',
          from: location.pathname,
        },
      });
      return;
    }

    if (onToggleSave) {
      onToggleSave(restaurant.id);
    }
  };

  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="group bg-white rounded-[1.75rem] overflow-hidden border border-gray-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <button
            onClick={handleSave}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isSaved
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-slate-700 hover:bg-white'
            }`}
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-slate-700">
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
        {restaurant.categories && restaurant.categories.length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            {restaurant.categories.map((c) => c.title).join(", ")}
          </div>
        )}
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
        <div className="flex flex-wrap gap-2 mt-3">
          {restaurant.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
