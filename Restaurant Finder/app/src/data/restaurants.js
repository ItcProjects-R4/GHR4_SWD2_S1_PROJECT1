import {
  searchBusinesses,
  getBusinessDetails,
  mapYelpToRestaurant,
} from "@/services/yelpApi";

export const categories = [
  { id: "all", name: "All", icon: "UtensilsCrossed" },
  { id: "italian", name: "Italian", icon: "Pizza" },
  { id: "japanese", name: "Japanese", icon: "Fish" },
  { id: "french", name: "French", icon: "Croissant" },
  { id: "mexican", name: "Mexican", icon: "Flame" },
  { id: "american", name: "American", icon: "Beef" },
  { id: "indian", name: "Indian", icon: "Soup" },
  { id: "chinese", name: "Chinese", icon: "Bowl" },
  { id: "seafood", name: "Seafood", icon: "Shrimp" },
];

const MANAGED_RESTAURANTS_KEY = "managedRestaurants";
const VIEW_HISTORY_KEY = "viewHistory";

export function getManagedRestaurants() {
  try {
    const raw = localStorage.getItem(MANAGED_RESTAURANTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveManagedRestaurants(restaurants) {
  localStorage.setItem(MANAGED_RESTAURANTS_KEY, JSON.stringify(restaurants));
}

export function addManagedRestaurant(restaurant, id) {
  const current = getManagedRestaurants();
  const record = {
    id: id || `admin-${Date.now()}`,
    cuisine: restaurant.cuisine || "american",
    cuisineName: restaurant.cuisineName || "American",
    rating: Number(restaurant.rating) || 4.5,
    reviews: Number(restaurant.reviews) || 120,
    priceRange: restaurant.priceRange || "$$",
    priceLevel: Number(restaurant.priceLevel) || 2,
    location: restaurant.location || "Cairo, Egypt",
    phone: restaurant.phone || "(555) 123-4567",
    description:
      restaurant.description ||
      "A handcrafted restaurant with a great local dining experience.",
    image: restaurant.image || "/images/hero-bg.jpg",
    hours: restaurant.hours || "Open daily",
    features: restaurant.features || ["Dine-in", "Reservations"],
    menu: restaurant.menu || ["Signature Dish", "Chef's Special"],
    name: restaurant.name || "Admin Restaurant",
  };
  saveManagedRestaurants([record, ...current]);
  return record;
}

export function updateManagedRestaurant(id, updates) {
  const current = getManagedRestaurants();
  const next = current.map((restaurant) =>
    restaurant.id === id ? { ...restaurant, ...updates } : restaurant,
  );
  saveManagedRestaurants(next);
  return next.find((restaurant) => restaurant.id === id);
}

export function deleteManagedRestaurant(id) {
  const current = getManagedRestaurants();
  const next = current.filter((restaurant) => restaurant.id !== id);
  saveManagedRestaurants(next);
  return next;
}

/**
 * Fetch restaurants from Yelp API with optional filters.
 */
export async function fetchRestaurants({
  term,
  categories,
  price,
  limit,
  location,
} = {}) {
  const data = await searchBusinesses({
    term,
    categories,
    price,
    limit,
    location,
    sort_by: "best_match",
  });
  const managedRestaurants = getManagedRestaurants().filter((restaurant) => {
    if (categories && categories !== "all" && restaurant.cuisine !== categories)
      return false;
    if (term && term.trim()) {
      const text =
        `${restaurant.name} ${restaurant.location} ${restaurant.cuisine}`.toLowerCase();
      return text.includes(term.trim().toLowerCase());
    }
    return true;
  });
  const managedIds = new Set(
    managedRestaurants.map((restaurant) => restaurant.id),
  );
  return managedRestaurants.concat(
    (data.businesses || [])
      .map(mapYelpToRestaurant)
      .filter((restaurant) => !managedIds.has(restaurant.id)),
  );
}

/**
 * Search restaurants by free-text query.
 */
export async function searchRestaurants(query) {
  if (!query.trim()) return fetchRestaurants({ limit: 20 });
  const data = await searchBusinesses({
    term: query.trim(),
    limit: 20,
  });
  const managedRestaurants = getManagedRestaurants().filter((restaurant) => {
    const text =
      `${restaurant.name} ${restaurant.location} ${restaurant.cuisine}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });
  const managedIds = new Set(
    managedRestaurants.map((restaurant) => restaurant.id),
  );
  return (data.businesses || [])
    .map(mapYelpToRestaurant)
    .filter((restaurant) => !managedIds.has(restaurant.id))
    .concat(managedRestaurants);
}

/**
 * Fetch suggestion items for a search query.
 * This returns a short list of current Yelp business matches for the typed query.
 */
export async function fetchRestaurantSuggestions(query) {
  if (!query.trim()) return [];
  const data = await searchBusinesses({
    term: query.trim(),
    limit: 5,
  });
  return (data.businesses || []).map((business) => ({
    id: business.id,
    name: business.name,
    location: business.location?.display_address?.join(", ") || "",
    category: business.categories?.[0]?.title || "",
  }));
}

/**
 * Get a single restaurant by Yelp business ID.
 */
export async function getRestaurantById(id) {
  const managed = getManagedRestaurants().find(
    (restaurant) => restaurant.id === id,
  );
  if (managed) return managed;
  const business = await getBusinessDetails(id);
  return mapYelpToRestaurant(business);
}

/**
 * Filter restaurants by cuisine alias.
 * If data is not provided, fetches from API.
 */
export async function getRestaurantsByCuisine(cuisine, data) {
  if (cuisine === "all") {
    if (data) return data;
    return fetchRestaurants({ limit: 20 });
  }
  if (data) {
    return data.filter((r) => r.cuisine === cuisine);
  }
  return fetchRestaurants({ categories: cuisine, limit: 20 });
}

// ─── Saved Restaurants Utilities ──────────────────────────────

const SAVED_DATA_KEY = "savedRestaurantsData";
const SAVED_IDS_KEY = "savedRestaurants";

export function getSavedRestaurants() {
  try {
    const raw = localStorage.getItem(SAVED_DATA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSavedIds() {
  try {
    const raw = localStorage.getItem(SAVED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getViewHistory() {
  try {
    const raw = localStorage.getItem(VIEW_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getPopularRestaurants(restaurants, count = 4) {
  return [...restaurants]
    .sort((a, b) => {
      if (b.reviews !== a.reviews) return b.reviews - a.reviews;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    })
    .slice(0, count);
}

export function getRecommendedRestaurants(
  restaurants,
  { history = [], saved = [], user = null, count = 4, excludeIds = [] } = {},
) {
  const normalizedCuisine = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const preferenceCuisines = new Set();
  if (user?.preferences?.cuisineTypes) {
    user.preferences.cuisineTypes
      .split(/,|\//)
      .map((c) => normalizedCuisine(c))
      .filter(Boolean)
      .forEach((c) => preferenceCuisines.add(c));
  }

  const cuisineScores = {};
  [...saved, ...history].forEach((restaurant) => {
    const cuisine = normalizedCuisine(restaurant.cuisine);
    if (!cuisine) return;
    cuisineScores[cuisine] = (cuisineScores[cuisine] || 0) + 1;
  });

  const scoredRestaurants = restaurants
    .filter((restaurant) => !excludeIds.includes(restaurant.id))
    .map((restaurant) => {
      const cuisine = normalizedCuisine(restaurant.cuisine);
      let score = 0;

      if (preferenceCuisines.has(cuisine)) score += 15;
      if (cuisineScores[cuisine]) score += cuisineScores[cuisine] * 4;
      if (restaurant.rating >= 4.5) score += 3;
      if (restaurant.reviews >= 100) score += 2;
      if (restaurant.priceLevel <= 2) score += 1;

      return { restaurant, score };
    });

  const recommended = scoredRestaurants
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.restaurant.reviews !== a.restaurant.reviews)
        return b.restaurant.reviews - a.restaurant.reviews;
      if (b.restaurant.rating !== a.restaurant.rating)
        return b.restaurant.rating - a.restaurant.rating;
      return a.restaurant.name.localeCompare(b.restaurant.name);
    })
    .map((item) => item.restaurant);

  if (recommended.length >= count) {
    return recommended.slice(0, count);
  }

  const remaining = restaurants
    .filter((restaurant) => !excludeIds.includes(restaurant.id))
    .filter(
      (restaurant) => !recommended.some((item) => item.id === restaurant.id),
    )
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.reviews !== a.reviews) return b.reviews - a.reviews;
      return a.name.localeCompare(b.name);
    });

  return [...recommended, ...remaining].slice(0, count);
}

export function saveViewHistory(restaurant) {
  try {
    const raw = localStorage.getItem(VIEW_HISTORY_KEY);
    const current = raw ? JSON.parse(raw) : [];
    const next = [
      restaurant,
      ...current.filter((item) => item.id !== restaurant.id),
    ].slice(0, 12);
    localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export function isRestaurantSaved(id) {
  const saved = getSavedIds();
  return saved.includes(id);
}

/**
 * Toggle a restaurant in saved storage.
 * Pass the full restaurant object so it can be stored.
 * @param {Object} restaurant - Full restaurant object
 * @returns {string[]} Updated saved IDs
 */
export function toggleSavedRestaurant(restaurant) {
  const savedData = getSavedRestaurants();
  const savedIds = getSavedIds();
  const id = restaurant.id;

  let newData;
  let newIds;

  if (savedIds.includes(id)) {
    newData = savedData.filter((r) => r.id !== id);
    newIds = savedIds.filter((sid) => sid !== id);
  } else {
    newData = [...savedData, restaurant];
    newIds = [...savedIds, id];
  }

  localStorage.setItem(SAVED_DATA_KEY, JSON.stringify(newData));
  localStorage.setItem(SAVED_IDS_KEY, JSON.stringify(newIds));
  return newIds;
}
