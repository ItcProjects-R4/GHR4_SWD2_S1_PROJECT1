import { useState, useEffect, useMemo } from "react";
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
  getFallbackMenuItems,
} from "@/data/restaurants";
import Loader from "@/components/Loader/Loader";
import {
  Star,
  MapPin,
  Phone,
  Clock,
  Heart,
  ArrowLeft,
  Check,
  UtensilsCrossed,
  Car,
  Accessibility,
  Wine,
  Music,
  Wifi,
  AlertCircle,
  ExternalLink,
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
  const [savedIds, setSavedIds] = useState(() => getSavedIds(user));
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showPhotosModal, setShowPhotosModal] = useState(false);

  const menuItems = useMemo(() => {
    if (!restaurant) return [];
    if (Array.isArray(restaurant.menu) && restaurant.menu.length > 0) {
      return restaurant.menu;
    }

    const fallback = getFallbackMenuItems(restaurant.cuisine, restaurant.cuisineName);
    const seed = restaurant.id || "default";
    const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const copy = [...fallback];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = (hash + i) % (i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 6);
  }, [restaurant]);

  useEffect(() => {
    setSavedIds(getSavedIds(user));
  }, [user]);

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
    const newIds = toggleSavedRestaurant(restaurant, user);
    setSavedIds(newIds);
  };

  const handleBeginEdit = () => {
    setEditData({
      ...restaurant,
      features: restaurant.features?.join(", ") ?? "",
      menu: restaurant.menu?.join(", ") ?? "",
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
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Restaurant not found</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate("/explore")}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300"
          >
            ← Back to Explore
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h2>
          <button
            onClick={() => navigate("/explore")}
            className="text-orange-600 hover:text-orange-700 font-semibold text-lg"
          >
            ← Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const isSaved = savedIds.includes(restaurant.id);

  const reviewItems = restaurant.reviewsList && restaurant.reviewsList.length
    ? restaurant.reviewsList
    : [
        {
          id: "fake-1",
          user: { name: "Mina S." },
          rating: 5,
          time_created: "June 2026",
          text: "Amazing experience. The staff were attentive and the food felt like a special occasion. Highly recommend visiting for a memorable meal.",
        },
        {
          id: "fake-2",
          user: { name: "Leila A." },
          rating: 4,
          time_created: "May 2026",
          text: "Great atmosphere and very tasty dishes. We enjoyed the service and the dessert was the perfect finish to our dinner.",
        },
        {
          id: "fake-3",
          user: { name: "Omar K." },
          rating: 5,
          time_created: "April 2026",
          text: "One of the best places in town. The flavors were balanced, and the team made the whole evening feel special.",
        },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">
      <div className="relative overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-[420px] object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10" />
      </div>

      <div className="max-w-5xl mx-auto -mt-20 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="rounded-[2rem] border border-white/20 bg-white/95 backdrop-blur-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-orange-700 font-semibold">
                  {restaurant.cuisineName}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-gray-700 font-medium">
                  {restaurant.priceRange}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-green-700 font-medium">
                  <Star className="w-4 h-4 text-green-600" /> {restaurant.rating}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{restaurant.name}</h1>
              <p className="max-w-3xl text-gray-600 leading-relaxed">{restaurant.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:-translate-y-0.5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={toggleSave}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all ${
                  isSaved ? "bg-red-600 text-white" : "bg-white text-slate-800 border border-gray-200 hover:bg-orange-50"
                }`}
              >
                <Heart className="w-4 h-4" /> {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-8">
            <section className="rounded-[2rem] border border-white/70 bg-white/95 shadow-2xl p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
                <div className="rounded-3xl bg-orange-50 p-5 h-full flex flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-orange-700 font-semibold mb-2">Rating</p>
                    <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                      <Star className="w-5 h-5 text-orange-500" /> {restaurant.rating}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">{Number(restaurant.reviews || 0).toLocaleString()} reviews</p>
                </div>
                <div className="rounded-3xl bg-slate-950 p-5 h-full flex flex-col justify-between text-white">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-300 font-semibold mb-2">Status</p>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${restaurant.isClosed ? "bg-red-600/15 text-red-700" : "bg-emerald-500/15 text-emerald-700"}`}>
                      {restaurant.isClosed ? "Closed" : "Open now"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300 leading-6">{restaurant.hours}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 h-full flex flex-col justify-between">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold mb-2">Location</p>
                  <p className="text-sm text-slate-700">{restaurant.location}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 h-full flex flex-col justify-between">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold mb-2">Phone</p>
                  <p className="text-sm text-slate-700">{restaurant.phone}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <a
                  href={`tel:${restaurant.phone.replace(/[^0-9+]/g, "")}`}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition-all"
                >
                  <Phone className="w-4 h-4" /> Call
                </a>
                {restaurant.yelpUrl && (
                  <a
                    href={restaurant.yelpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" /> View on Yelp
                  </a>
                )}
                {restaurant.coordinates && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-all"
                  >
                    <MapPin className="w-4 h-4" /> Directions
                  </a>
                )}
              </div>
            </section>

            {restaurant.photos?.length > 0 && (
              <section className="rounded-[2rem] border border-white/70 bg-white/95 shadow-2xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-orange-700">Photo Gallery</p>
                    <h2 className="text-2xl font-bold text-slate-900">A look inside</h2>
                  </div>
                  <button
                    onClick={() => setShowPhotosModal(true)}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-orange-50 transition-all"
                  >
                    View all photos
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {(restaurant.photos?.slice(0, 3) || []).map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setShowPhotosModal(true)}
                      className="group overflow-hidden rounded-[1.5rem] bg-slate-100 shadow-sm"
                    >
                      <img
                        src={photo}
                        alt={`${restaurant.name} photo ${index + 1}`}
                        className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-[2rem] border border-white/70 bg-white/95 shadow-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-orange-100 rounded-xl">
                  <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-700">Menu Highlights</p>
                  <h2 className="text-2xl font-bold text-slate-900">What to try</h2>
                </div>
              </div>
              {menuItems.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {menuItems.slice(0, 6).map((item, index) => (
                    <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                      <p className="font-semibold text-slate-900">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  <p className="font-semibold text-slate-800 mb-2">Menu details not available</p>
                  <p>The current restaurant detail data does not include meal items from the API.</p>
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-white/70 bg-white/95 shadow-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-yellow-100 rounded-xl">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Guest Reviews</p>
                  <h2 className="text-2xl font-bold text-slate-900">Loved by diners</h2>
                </div>
              </div>
              <div className="space-y-5">
                {reviewItems.map((review) => (
                  <article key={review.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold shadow-md">
                          {review.user?.name?.charAt(0) || "G"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{review.user?.name || "Guest"}</p>
                          <p className="text-sm text-slate-500">{review.time_created}</p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
                        <Star className="w-4 h-4 text-yellow-500" /> {review.rating}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.text}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[2rem] border border-white/70 bg-white/95 shadow-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-orange-100 rounded-xl">
                  <Check className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-700">Top features</p>
                  <h2 className="text-xl font-bold text-slate-900">Highlights</h2>
                </div>
              </div>
              <div className="grid gap-3">
                {(restaurant.features || []).slice(0, 8).map((feature) => {
                  const IconComp = featureIcons[feature] || Check;
                  return (
                    <div key={feature} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <IconComp className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-slate-700">{feature}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {restaurant.coordinates && (
              <section className="rounded-[2rem] border border-white/70 bg-white/95 shadow-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-slate-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Address</p>
                    <h2 className="text-xl font-bold text-slate-900">Find us</h2>
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-4">{restaurant.location}</p>
                <div className="rounded-3xl overflow-hidden border border-slate-200">
                  <iframe
                    title="restaurant-map"
                    src={`https://www.google.com/maps?q=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}&z=15&output=embed`}
                    className="w-full h-52 border-0"
                  />
                </div>
              </section>
            )}

            {user?.role === "admin" && (
              <section className="rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 shadow-2xl">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-sm font-semibold text-orange-700">Admin</p>
                    <h2 className="text-xl font-bold text-slate-900">Edit details</h2>
                  </div>
                  <button
                    onClick={!isEditing ? handleBeginEdit : handleCancelEdit}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">Update the restaurant information, images, or menu from this panel.</p>
                {isEditing && editData && (
                  <div className="mt-5 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-600">Name</span>
                        <input
                          value={editData.name}
                          onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                          className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-600">Location</span>
                        <input
                          value={editData.location}
                          onChange={(e) => setEditData((prev) => ({ ...prev, location: e.target.value }))}
                          className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                      </label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-600">Phone</span>
                        <input
                          value={editData.phone}
                          onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                          className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-600">Image URL</span>
                        <input
                          value={editData.image}
                          onChange={(e) => setEditData((prev) => ({ ...prev, image: e.target.value }))}
                          className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                      </label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-600">Rating</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={editData.rating}
                          onChange={(e) => setEditData((prev) => ({ ...prev, rating: e.target.value }))}
                          className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-600">Reviews</span>
                        <input
                          type="number"
                          value={editData.reviews}
                          onChange={(e) => setEditData((prev) => ({ ...prev, reviews: e.target.value }))}
                          className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-600">Description</span>
                      <textarea
                        rows={3}
                        value={editData.description}
                        onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                        className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </label>
                    <button
                      onClick={handleSaveEdit}
                      className="w-full rounded-3xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
                    >
                      Save changes
                    </button>
                    {adminError && <p className="text-sm text-red-600">{adminError}</p>}
                    {adminMessage && <p className="text-sm text-green-600">{adminMessage}</p>}
                  </div>
                )}
              </section>
            )}
          </aside>
        </div>
      </div>

      {showPhotosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-w-6xl w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 p-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Photos — {restaurant.name}</h3>
                <p className="text-sm text-slate-500">Browse the full collection of restaurant images.</p>
              </div>
              <button
                onClick={() => setShowPhotosModal(false)}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
              >
                Close
              </button>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {(restaurant.photos || []).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${restaurant.name} photo ${index + 1}`}
                  className="h-72 w-full rounded-[1.5rem] object-cover transition-transform duration-500 hover:scale-105"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
