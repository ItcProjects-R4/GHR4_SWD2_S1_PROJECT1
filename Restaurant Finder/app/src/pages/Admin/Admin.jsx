import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getManagedRestaurants,
  addManagedRestaurant,
  updateManagedRestaurant,
  deleteManagedRestaurant,
} from "@/data/restaurants";
import { Edit3, Trash2, Plus, CheckCircle, AlertTriangle } from "lucide-react";

const emptyForm = {
  name: "",
  cuisine: "american",
  cuisineName: "American",
  rating: 4.5,
  reviews: 120,
  priceRange: "$$",
  priceLevel: 2,
  location: "Cairo, Egypt",
  phone: "(555) 123-4567",
  description: "A local favorite with a warm atmosphere and delicious food.",
  image: "/images/hero-bg.jpg",
  hours: "Open daily",
  features: "Dine-in, Reservations",
  menu: "Signature Dish, Chef's Special",
};

const cuisineOptions = [
  { id: "american", label: "American" },
  { id: "italian", label: "Italian" },
  { id: "japanese", label: "Japanese" },
  { id: "french", label: "French" },
  { id: "mexican", label: "Mexican" },
  { id: "indian", label: "Indian" },
  { id: "chinese", label: "Chinese" },
  { id: "seafood", label: "Seafood" },
];

export default function Admin() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setRestaurants(getManagedRestaurants());
  }, []);

  const refresh = () => setRestaurants(getManagedRestaurants());

  const beginEdit = (restaurant) => {
    setSelectedId(restaurant.id);
    setFormData({
      ...restaurant,
      features: restaurant.features.join(", "),
      menu: restaurant.menu.join(", "),
    });
    setErrorMessage("");
    setStatusMessage("");
  };

  const resetForm = () => {
    setSelectedId(null);
    setFormData(emptyForm);
    setErrorMessage("");
    setStatusMessage("");
  };

  const saveRestaurant = () => {
    if (!formData.name.trim()) {
      setErrorMessage("Restaurant name is required.");
      return;
    }
    const payload = {
      ...formData,
      cuisineName:
        cuisineOptions.find((item) => item.id === formData.cuisine)?.label ||
        "American",
      features: formData.features
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      menu: formData.menu
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      rating: Number(formData.rating) || 4.5,
      reviews: Number(formData.reviews) || 120,
      priceLevel: Number(formData.priceLevel) || 2,
      priceRange: formData.priceRange || "$$",
    };

    if (selectedId) {
      updateManagedRestaurant(selectedId, payload);
      setStatusMessage("Restaurant updated successfully.");
    } else {
      addManagedRestaurant(payload);
      setStatusMessage("Restaurant added successfully.");
    }
    refresh();
    resetForm();
    window.setTimeout(() => setStatusMessage(""), 3500);
  };

  const removeRestaurant = (id) => {
    if (!window.confirm("Delete this restaurant permanently?")) return;
    deleteManagedRestaurant(id);
    refresh();
    setStatusMessage("Restaurant deleted successfully.");
    setTimeout(() => setStatusMessage(""), 3500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-orange-600 font-semibold">
              Admin Dashboard
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Site Management
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-2xl">
              Hello {user?.name || "Admin"}. Use this dashboard to manage
              restaurant content, update listings, and keep the site fresh.
            </p>
          </div>
          <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">
              Managed Restaurants
            </p>
            <div className="text-2xl font-semibold text-gray-900">
              {restaurants.length}
            </div>
            <p className="text-sm text-gray-500">
              Total custom restaurant entries
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Restaurant Listings
                  </h2>
                  <p className="text-sm text-gray-500">
                    Edit or delete custom site restaurants.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Listing
                </button>
              </div>

              {restaurants.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 p-10 text-center text-gray-500">
                  <AlertTriangle className="mx-auto mb-4 w-8 h-8 text-orange-400" />
                  <p className="text-sm">
                    No managed restaurants added yet. Create a new listing from
                    the form.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="rounded-3xl border border-gray-100 p-4 hover:shadow-sm transition-shadow bg-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {restaurant.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {restaurant.cuisineName} · {restaurant.location}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => beginEdit(restaurant)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => removeRestaurant(restaurant.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Live Admin Controls
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Only admin can manage these entries, and new items will appear
                in Explore and Home results.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-sm text-orange-700 font-semibold">
                    Admin Email
                  </p>
                  <p className="mt-2 text-sm text-gray-900">Admin@gmail.com</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-sm text-orange-700 font-semibold">
                    Admin Password
                  </p>
                  <p className="mt-2 text-sm text-gray-900">Admin123</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Listing Builder
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Name
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Restaurant name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Cuisine
                    </label>
                    <select
                      value={formData.cuisine}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cuisine: e.target.value,
                          cuisineName:
                            cuisineOptions.find(
                              (option) => option.id === e.target.value,
                            )?.label || "American",
                        }))
                      }
                      className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    >
                      {cuisineOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Location
                    </label>
                    <input
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          rating: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Price Range
                    </label>
                    <input
                      value={formData.priceRange}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          priceRange: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Phone
                  </label>
                  <input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Image URL
                  </label>
                  <input
                    value={formData.image}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        image: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Features
                  </label>
                  <input
                    value={formData.features}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        features: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Comma separated: Dine-in, Reservations"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Menu Items
                  </label>
                  <input
                    value={formData.menu}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, menu: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    placeholder="Comma separated: Signature Dish, Chef's Special"
                  />
                </div>
                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}
                {statusMessage && (
                  <p className="text-sm text-green-600">{statusMessage}</p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={saveRestaurant}
                    className="px-5 py-3 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    {selectedId ? "Update Listing" : "Create Listing"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
