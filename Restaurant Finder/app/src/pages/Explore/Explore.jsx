import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { useAuth } from "@/context/AuthContext";
import CategoryFilter from "@/components/CategoryFilter/CategoryFilter";
import RestaurantCard from "@/components/RestaurantCard/RestaurantCard";
import Loader from "@/components/Loader/Loader";
import {
  categories,
  searchRestaurants,
  getRestaurantsByCuisine,
  fetchRestaurants,
  getSavedIds,
  toggleSavedRestaurant,
  fetchRestaurantSuggestions,
} from "@/data/restaurants";
import { Search, SlidersHorizontal, X, AlertCircle, Sparkles, MapPin } from "lucide-react";

export default function Explore() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(() => getSavedIds(user));
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 21;

  const urlQuery = searchParams.get("q") || "";
  const urlCuisine = searchParams.get("cuisine") || "";

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
          data = await fetchRestaurants({ categories: urlCuisine, limit: 200 });
        } else {
          data = await fetchRestaurants({ limit: 200 });
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

  useEffect(() => {
    if (urlQuery) setSearchQuery(urlQuery);
    if (urlCuisine) setActiveCategory(urlCuisine);
  }, [urlQuery, urlCuisine]);

  useEffect(() => {
    setSavedIds(getSavedIds(user));
  }, [user]);

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
    const newIds = toggleSavedRestaurant(restaurant, user);
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

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeCategory, priceFilter, ratingFilter, urlCuisine]);

  const totalPages = Math.max(1, Math.ceil(resultCount / ITEMS_PER_PAGE));
  const pagedResults = results.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl -mr-48 -mt-48" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-orange-600">Discover & Explore</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              Find Your Perfect Dining
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Browse hundreds of restaurants, filter by cuisine, price, and ratings to discover your next favorite dining experience.
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search restaurants, cuisines, locations..."
                className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all shadow-sm hover:border-gray-300"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 w-full rounded-xl bg-white border-2 border-gray-100 shadow-xl overflow-hidden z-50">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-semibold text-gray-900">
                        {suggestion.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
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
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                showFilters
                  ? "bg-orange-600 text-white border-2 border-orange-600"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-400 hover:text-orange-600"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-sm mb-6">
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2.5 block">
                  Price Range
                </label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 bg-white font-medium transition-colors"
                >
                  <option value="all">All Prices</option>
                  <option value="1">$ (Budget)</option>
                  <option value="2">$$ (Moderate)</option>
                  <option value="3">$$$ (Premium)</option>
                  <option value="4">$$$$ (Luxury)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2.5 block">
                  Min Rating
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 bg-white font-medium transition-colors"
                >
                  <option value="all">All Ratings</option>
                  <option value="4.5">⭐ 4.5+</option>
                  <option value="4.0">⭐ 4.0+</option>
                  <option value="3.5">⭐ 3.5+</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setPriceFilter("all");
                    setRatingFilter("all");
                  }}
                  className="w-full px-4 py-2.5 text-sm font-semibold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border-2 border-orange-200"
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

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-600 mb-1">
              {resultCount} result{resultCount !== 1 ? "s" : ""} found
            </p>
            {urlQuery && (
              <p className="text-sm text-gray-600">
                Searching for "<span className="font-semibold">{urlQuery}</span>"
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-100">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Could not load restaurants
            </h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagedResults.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  isSaved={savedIds.includes(restaurant.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 rounded-lg border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous page"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold flex items-center justify-center border-2 transition-all ${
                          pageNum === page
                            ? "bg-orange-600 text-white border-orange-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600"
                        }`}
                        aria-current={pageNum === page ? "page" : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 rounded-lg border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Next page"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No restaurants found
            </h3>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filters to find what you're looking for
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
