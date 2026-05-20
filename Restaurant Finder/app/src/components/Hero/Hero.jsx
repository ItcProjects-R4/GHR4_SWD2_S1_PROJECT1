import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, UtensilsCrossed } from "lucide-react";
import { fetchRestaurantSuggestions } from "@/data/restaurants";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    navigate(`/explore?q=${encodeURIComponent(suggestion.name)}`);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const results = await fetchRestaurantSuggestions(searchQuery.trim());
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <section className="relative h-[500px] flex items-center justify-center overflow-visible">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/hero-bg.jpg)" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          Find Your Perfect Table
        </h1>
        <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl mx-auto">
          Discover the best restaurants, cafes, and bars near you. Book your
          table in seconds.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
          <div className="flex items-center bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="pl-4 text-gray-400">
              <MapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search by restaurant, cuisine, or location..."
              className="flex-1 px-3 py-4 text-gray-800 placeholder-gray-400 outline-none text-sm sm:text-base"
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white border border-gray-200 shadow-xl overflow-y-auto max-h-80 z-50">
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
        </form>

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-8 mt-8 text-white/70 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white">500+</span> Restaurants
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full" />
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white">50+</span> Cuisines
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full" />
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white">10K+</span> Reviews
          </div>
        </div>
      </div>
    </section>
  );
}
