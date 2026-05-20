import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import {
  getRestaurantById,
  getSavedIds,
  toggleSavedRestaurant,
  saveViewHistory,
  updateManagedRestaurant,
  addManagedRestaurant,
  getManagedRestaurants,
} from "@/data/restaurants";
import Loader from "@/components/Loader/Loader";
import {
  Star,
  MapPin,
  Phone,
  Clock,
  Heart,
  ArrowLeft,
  DollarSign,
  Check,
  UtensilsCrossed,
  Car,
  Accessibility,
  Wine,
  Music,
  Wifi,
  AlertCircle,
} from "lucide-react";

const featureIcons = {
  "Outdoor Seating": Car,
  "Full Bar": Wine,
  "Private Dining": UtensilsCrossed,
  "Wheelchair Accessible": Accessibility,
  "Wine Bar": Wine,
  "Live Music": Music,
  Reservations: Check,
  "Omakase Menu": UtensilsCrossed,
  "Sake Bar": Wine,
  "Private Rooms": Check,
  "Valet Parking": Car,
  Breakfast: UtensilsCrossed,
  "Coffee Bar": Wifi,
  "Pastry Counter": UtensilsCrossed,
  "Free WiFi": Wifi,
  "Rooftop Views": Star,
  "Craft Cocktails": Wine,
  "Fire Pits": Star,
  "DJ Nights": Music,
  "Margarita Bar": Wine,
  "Outdoor Patio": Car,
  "Happy Hour": Clock,
  "Dine-in": UtensilsCrossed,
  Delivery: Car,
  Takeout: Car,
};

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(getSavedIds);
  const [activeTab, setActiveTab] = useState("menu");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getRestaurantById(id)
      .then((data) => {
        if (!cancelled) {
          setRestaurant(data);
          saveViewHistory(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load restaurant");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleSave = () => {
    if (!restaurant) return;
    const newIds = toggleSavedRestaurant(restaurant);
    setSavedIds(newIds);
  };

  const handleBeginEdit = () => {
    setEditData({
      ...restaurant,
      features: restaurant.features.join(", "),
      menu: restaurant.menu.join(", "),
      rating: restaurant.rating?.toString() ?? "4.5",
      reviews: restaurant.reviews?.toString() ?? "120",
      priceLevel: restaurant.priceLevel?.toString() ?? "2",
    });
    setAdminError("");
    setAdminMessage("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
    setAdminError("");
  };

  const handleSaveEdit = () => {
    if (!editData.name.trim()) {
      setAdminError("Restaurant name is required.");
      return;
    }
    const payload = {
      name: editData.name,
      cuisine: editData.cuisine || "american",
      cuisineName: editData.cuisineName || "American",
      rating: Number(editData.rating) || 4.5,
      reviews: Number(editData.reviews) || 120,
      priceRange: editData.priceRange || "$$",
      priceLevel: Number(editData.priceLevel) || 2,
      location: editData.location || "Cairo, Egypt",
      phone: editData.phone || "(555) 123-4567",
      description: editData.description || "A local favorite with great food.",
      image: editData.image || "/images/hero-bg.jpg",
      hours: editData.hours || "Open daily",
      features: editData.features
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      menu: editData.menu
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const existingManaged = getManagedRestaurants().find(
      (rest) => rest.id === restaurant.id,
    );
    if (existingManaged) {
      updateManagedRestaurant(restaurant.id, payload);
    } else {
      addManagedRestaurant({ ...payload, id: restaurant.id }, restaurant.id);
    }
    setRestaurant({ ...restaurant, ...payload });
    setAdminMessage("Restaurant updated successfully.");
    setAdminError("");
    setIsEditing(false);
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Restaurant not found
        </h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => navigate("/explore")}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Restaurant not found
        </h2>
        <button
          onClick={() => navigate("/explore")}
          className="text-orange-600 hover:text-orange-700 font-medium"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const isSaved = savedIds.includes(restaurant.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 lg:h-96">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl text-gray-700 hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={toggleSave}
          className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-sm transition-colors ${
            isSaved
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-700 hover:bg-white"
          }`}
        >
          <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-lg">
                    {restaurant.cuisineName}
                  </span>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                    {restaurant.priceRange}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {restaurant.name}
                </h1>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
                <Star className="w-4 h-4 text-green-600 fill-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  {restaurant.rating}
                </span>
                <span className="text-xs text-green-600">
                  ({restaurant.reviews.toLocaleString()})
                </span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-4">
              {restaurant.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                {restaurant.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                {restaurant.phone}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                {restaurant.hours}
              </div>
            </div>
            {user?.role === "admin" && (
              <div className="mt-6 rounded-3xl border border-orange-100 bg-orange-50 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-orange-700">
                      Admin edit mode
                    </p>
                    <p className="text-sm text-orange-700/80">
                      You can update the restaurant details here and save
                      changes.
                    </p>
                  </div>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={handleBeginEdit}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-full hover:bg-orange-700 transition-colors"
                    >
                      Edit Restaurant
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-full hover:bg-orange-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                {isEditing && editData && (
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Name
                      </label>
                      <input
                        value={editData.name}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Location
                      </label>
                      <input
                        value={editData.location}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Phone
                      </label>
                      <input
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Image URL
                      </label>
                      <input
                        value={editData.image}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            image: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Rating
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editData.rating}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            rating: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Reviews
                      </label>
                      <input
                        type="number"
                        value={editData.reviews}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            reviews: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Price Range
                      </label>
                      <input
                        value={editData.priceRange}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            priceRange: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Price Level
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        value={editData.priceLevel}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            priceLevel: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={editData.description}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Hours
                      </label>
                      <input
                        value={editData.hours}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            hours: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Features
                      </label>
                      <input
                        value={editData.features}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            features: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        placeholder="Comma separated list"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Menu Items
                      </label>
                      <input
                        value={editData.menu}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            menu: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        placeholder="Comma separated list"
                      />
                    </div>
                  </div>
                )}
                {adminError && (
                  <p className="mt-3 text-sm text-red-600">{adminError}</p>
                )}
                {adminMessage && (
                  <p className="mt-3 text-sm text-green-600">{adminMessage}</p>
                )}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Features & Amenities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {restaurant.features.map((feature) => {
                const IconComp = featureIcons[feature] || Check;
                return (
                  <div
                    key={feature}
                    className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-lg"
                  >
                    <IconComp className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100">
            <div className="flex px-6 sm:px-8">
              <button
                onClick={() => setActiveTab("menu")}
                className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "menu"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Popular Dishes
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "reviews"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Reviews
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {activeTab === "menu" ? (
              <div className="space-y-3">
                {restaurant.menu.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{item}</span>
                    </div>
                    <div className="flex items-center text-orange-500">
                      <DollarSign className="w-3.5 h-3.5" />
                      <DollarSign
                        className={`w-3.5 h-3.5 ${
                          restaurant.priceLevel < 2 ? "text-gray-300" : ""
                        }`}
                      />
                      <DollarSign
                        className={`w-3.5 h-3.5 ${
                          restaurant.priceLevel < 3 ? "text-gray-300" : ""
                        }`}
                      />
                      <DollarSign
                        className={`w-3.5 h-3.5 ${
                          restaurant.priceLevel < 4 ? "text-gray-300" : ""
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  {
                    name: "Sarah M.",
                    rating: 5,
                    date: "2 weeks ago",
                    text: "Absolutely amazing experience! The food was exceptional and the service was top-notch. Will definitely be coming back.",
                  },
                  {
                    name: "James K.",
                    rating: 4,
                    date: "1 month ago",
                    text: "Great ambiance and delicious food. The wait was a bit long but worth it. Recommended for special occasions.",
                  },
                  {
                    name: "Emily R.",
                    rating: 5,
                    date: "2 months ago",
                    text: "One of the best dining experiences in the city. Every dish was perfectly prepared. A must-visit!",
                  },
                ].map((review, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-semibold">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.name}
                          </p>
                          <p className="text-xs text-gray-400">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`w-3.5 h-3.5 ${
                              j < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
