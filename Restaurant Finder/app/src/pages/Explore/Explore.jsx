import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import CategoryFilter from "@/components/CategoryFilter/CategoryFilter";
import RestaurantCard from "@/components/RestaurantCard/RestaurantCard";
import Loader from "@/components/Loader/Loader";
import {
  categories,
  searchRestaurants,
  getRestaurantsByCuisine,
  getSavedIds,
  toggleSavedRestaurant,
  fetchRestaurantSuggestions,
} from "@/data/restaurants";
import { Search, SlidersHorizontal, X, AlertCircle } from "lucide-react";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(getSavedIds);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const urlQuery = searchParams.get("q") || "";
  const urlCuisine = searchParams.get("cuisine") || "";

  // Fetch data whenever search/category changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        let data;
        if (urlQuery.trim()) {
          data = await searchRestaurants(urlQuery.trim());
        } else if (urlCuisine && urlCuisine !== "all") {
          data = await getRestaurantsByCuisine(urlCuisine);
        } else {
          data = await searchRestaurants("");
        }
        if (!cancelled) {
          setRestaurantsData(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load restaurants");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [urlQuery, urlCuisine]);

  // Sync local state with URL params
  useEffect(() => {
    if (urlQuery) setSearchQuery(urlQuery);
    if (urlCuisine) setActiveCategory(urlCuisine);
  }, [urlQuery, urlCuisine]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const suggestionResults = await fetchRestaurantSuggestions(
          searchQuery.trim(),
        );
        setSuggestions(suggestionResults);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleSave = (id) => {
    const restaurant = restaurantsData.find((r) => r.id === id);
    if (!restaurant) return;
    const newIds = toggleSavedRestaurant(restaurant);
    setSavedIds(newIds);
  };

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    const newParams = new URLSearchParams(searchParams);
    if (catId === "all") {
      newParams.delete("cuisine");
    } else {
      newParams.set("cuisine", catId);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      newParams.set("q", searchQuery.trim());
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("q", suggestion.name);
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    setSearchQuery("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("q");
    setSearchParams(newParams);
  };

  // Client-side filter on fetched results
  let results = restaurantsData;

  if (activeCategory !== "all" && !urlCuisine) {
    results = results.filter((r) => r.cuisine === activeCategory);
  }

  if (priceFilter !== "all") {
    results = results.filter((r) => r.priceLevel === Number(priceFilter));
  }

  if (ratingFilter !== "all") {
    results = results.filter((r) => r.rating >= Number(ratingFilter));
  }

  const resultCount = results.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Explore Restaurants
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {resultCount} restaurant{resultCount !== 1 ? "s" : ""} found
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search restaurants, cuisines, locations..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-2 w-full rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {suggestion.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {suggestion.category}
                        {suggestion.location ? ` · ${suggestion.location}` : ""}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                showFilters
                  ? "border-orange-400 text-orange-600 bg-orange-50"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Price Range
                </label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 bg-white"
                >
                  <option value="all">All Prices</option>
                  <option value="1">$ (Budget)</option>
                  <option value="2">$$ (Moderate)</option>
                  <option value="3">$$$ (Premium)</option>
                  <option value="4">$$$$ (Luxury)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Min Rating
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 bg-white"
                >
                  <option value="all">All Ratings</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.0">4.0+</option>
                  <option value="3.5">3.5+</option>
                </select>
              </div>
              <div className="ml-auto self-end">
                <button
                  onClick={() => {
                    setPriceFilter("all");
                    setRatingFilter("all");
                  }}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Categories */}
          <CategoryFilter
            categories={categories}
            active={activeCategory}
            onChange={handleCategoryChange}
          />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-center py-16">
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
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isSaved={savedIds.includes(restaurant.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No restaurants found
            </h3>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
