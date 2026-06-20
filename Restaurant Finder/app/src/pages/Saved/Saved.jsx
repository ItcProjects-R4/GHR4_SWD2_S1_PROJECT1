import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import RestaurantCard from '@/components/RestaurantCard/RestaurantCard';
import { getSavedRestaurants, getSavedIds, toggleSavedRestaurant } from '@/data/restaurants';
import { Heart, ArrowRight } from 'lucide-react';

export default function Saved() {
  const { user } = useAuth();
  const [savedRestaurants, setSavedRestaurants] = useState(() => getSavedRestaurants(user));
  const [savedIds, setSavedIds] = useState(() => getSavedIds(user));

  useEffect(() => {
    setSavedRestaurants(getSavedRestaurants(user));
    setSavedIds(getSavedIds(user));
  }, [user]);

  const toggleSave = (id) => {
    const restaurant = savedRestaurants.find((r) => r.id === id);
    if (!restaurant) return;
    const newIds = toggleSavedRestaurant(restaurant, user);
    setSavedIds(newIds);
    setSavedRestaurants(getSavedRestaurants(user));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-b from-orange-50 via-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="rounded-[2rem] border border-orange-100 bg-white shadow-sm p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
                  <Heart className="w-4 h-4" />
                  Saved favorites
                </div>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">Your saved restaurants</h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-500">
                  These are the restaurants you saved for later. Open them quickly or keep browsing to add more favorites.
                </p>
              </div>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 self-start rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-600"
              >
                Explore restaurants
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{savedRestaurants.length}</span>
              <span>
                {savedRestaurants.length === 1 ? 'restaurant saved' : 'restaurants saved'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 mt-10">
        {savedRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
          <div className="rounded-[2rem] border border-dashed border-orange-200 bg-white/90 p-10 text-center shadow-sm mt-8">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-100 text-orange-600 mb-6">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">No saved restaurants yet</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Save restaurants while you explore to keep the best options close at hand.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-600"
            >
              Explore restaurants
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
