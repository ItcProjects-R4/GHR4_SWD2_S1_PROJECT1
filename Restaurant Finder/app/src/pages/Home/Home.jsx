import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import Hero from "@/components/Hero/Hero";
import CategoryFilter from "@/components/CategoryFilter/CategoryFilter";
import RestaurantCard from "@/components/RestaurantCard/RestaurantCard";
import Loader from "@/components/Loader/Loader";
import {
  categories,
  fetchRestaurants,
  getSavedIds,
  getSavedRestaurants,
  getViewHistory,
  getPopularRestaurants,
  getRecommendedRestaurants,
  toggleSavedRestaurant,
} from "@/data/restaurants";
import { useAuth } from "@/context/AuthContext";
import SmartAssistant from "@/components/SmartAssistant/SmartAssistant";
import {
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
} from "lucide-react";

const SMART_ASSISTANT_SEEN_KEY = "smartAssistantSeen";
const SMART_ASSISTANT_ANSWERS_KEY = "smartAssistantAnswers";

function getAssistantStorageKey(email) {
  return email ? `${SMART_ASSISTANT_ANSWERS_KEY}_${email}` : SMART_ASSISTANT_ANSWERS_KEY;
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(() => getSavedIds(user));
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [assistantAnswers, setAssistantAnswers] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const request = {
      limit: 16,
    };
    if (activeCategory !== "all") {
      request.categories = activeCategory;
    }

    fetchRestaurants(request)
      .then((data) => {
        if (!cancelled) {
          setRestaurantsData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load restaurants");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (loading) return;

    const assistantSeenKey = user?.email
      ? `${SMART_ASSISTANT_SEEN_KEY}_${user.email}`
      : SMART_ASSISTANT_SEEN_KEY;

    const seen = localStorage.getItem(assistantSeenKey);
    if (seen !== "true") {
      setShowAssistantModal(true);
    }
  }, [isAuthenticated, loading, user?.email]);

  useEffect(() => {
    const key = getAssistantStorageKey(user?.email);
    const savedAnswers = localStorage.getItem(key);
    if (savedAnswers) {
      try {
        setAssistantAnswers(JSON.parse(savedAnswers));
      } catch {
        setAssistantAnswers(null);
      }
    } else {
      setAssistantAnswers(null);
    }
  }, [user?.email]);

  const closeAssistantModal = () => {
    const assistantSeenKey = user?.email
      ? `${SMART_ASSISTANT_SEEN_KEY}_${user.email}`
      : SMART_ASSISTANT_SEEN_KEY;

    localStorage.setItem(assistantSeenKey, "true");
    setShowAssistantModal(false);
  };

  const handleSaveAssistantAnswers = useCallback(
    (answers) => {
      const key = getAssistantStorageKey(user?.email);
      try {
        localStorage.setItem(key, JSON.stringify(answers));
        setAssistantAnswers(answers);
      } catch {
        // ignore storage failures
      }
    },
    [user?.email],
  );

  useEffect(() => {
    setSavedIds(getSavedIds(user));
  }, [user]);

  const toggleSave = (id) => {
    const restaurant = restaurantsData.find((r) => r.id === id);
    if (!restaurant) return;
    const newIds = toggleSavedRestaurant(restaurant, user);
    setSavedIds(newIds);
  };

  const normalize = (v) => String(v || "").trim().toLowerCase();

  const filteredRestaurants =
    activeCategory === "all"
      ? restaurantsData
      : restaurantsData.filter((r) => {
            if (!r) return false;
            const rawCuisine = String(r.cuisine || "").trim().toLowerCase();
            const rawCuisineName = String(r.cuisineName || "").trim().toLowerCase();
            const cuisine = rawCuisine && rawCuisine !== "all" ? rawCuisine : rawCuisineName;
            const active = normalize(activeCategory);

            // Match by main cuisine fields
            if (cuisine === active) return true;

            // Match by cuisineName fallback
            if (rawCuisineName === active) return true;

            // Match by categories array (alias or title)
            if (Array.isArray(r.categories) && r.categories.length) {
              for (const c of r.categories) {
                const alias = String(c?.alias || "").trim().toLowerCase();
                const title = String(c?.title || "").trim().toLowerCase();
                if (alias === active || title === active) return true;
              }
            }

            return false;
          });

  const popularRestaurants = getPopularRestaurants(filteredRestaurants, 4);
  const recommendedRestaurants = getRecommendedRestaurants(
    filteredRestaurants,
    {
      history: getViewHistory(),
      saved: getSavedRestaurants(user),
      user,
      assistantAnswers,
      count: 4,
      excludeIds: popularRestaurants.map((restaurant) => restaurant.id),
    },
  );

  const featuredRestaurants = popularRestaurants;

  return (
    <div>
      <Hero />

      <button
        type="button"
        onClick={() => setShowAssistantModal(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-orange-500/20 transition hover:bg-orange-700"
      >
        Try AI test now
      </button>

      {/* Categories Section */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Browse by Cuisine
            </h2>
            <Link
              to="/explore"
              className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <CategoryFilter
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        </div>
      </section>

      {showAssistantModal && (
        <SmartAssistant
          restaurants={restaurantsData}
          activeCategory={activeCategory}
          user={user}
          savedRestaurants={getSavedRestaurants(user)}
          viewHistory={getViewHistory()}
          open={showAssistantModal}
          initialAnswers={assistantAnswers}
          onSaveAnswers={handleSaveAssistantAnswers}
          onClose={closeAssistantModal}
        />
      )}

      {/* Featured Restaurants */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Popular Restaurants
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Most-reviewed dining spots within this cuisine category
              </p>
            </div>
            <Link
              to="/explore"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Explore All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Could not load restaurants
              </h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  isSaved={savedIds.includes(restaurant.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recommended Restaurants */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Recommended Restaurants
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Hand-picked dining spots based on your saved and viewed
                favorites
              </p>
            </div>
            <Link
              to="/explore"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Explore More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Could not load recommendations
              </h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
            </div>
          ) : recommendedRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  isSaved={savedIds.includes(restaurant.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                More recommendations coming soon
              </h3>
              <p className="text-sm text-gray-500">
                Try another cuisine or refresh to discover new dining spots.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Find and book your perfect dining experience in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-3xl p-8 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Discover
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Browse through hundreds of restaurants filtered by cuisine,
                location, and ratings.
              </p>
            </div>
            <div className="bg-gray-50 rounded-3xl p-8 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Choose
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                View detailed profiles with menus, photos, reviews, and features
                to find your match.
              </p>
            </div>
            <div className="bg-gray-50 rounded-3xl p-8 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Book</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Reserve your table instantly and get confirmation. It's that
                simple!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-orange-500 rounded-3xl p-8 sm:p-12 text-center text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Start Your Culinary Journey
              </h2>
              <p className="text-white/80 max-w-lg mx-auto mb-6">
                Join thousands of food lovers discovering new dining experiences
                every day.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white text-orange-600 font-medium rounded-xl hover:bg-orange-50 transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/explore"
                  className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors border border-orange-400"
                >
                  Explore Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
