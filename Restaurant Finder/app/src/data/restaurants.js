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

const MENU_FALLBACKS = {
  all: [
    "House Salad",
    "Seasonal Soup",
    "Chef's Special",
    "Fresh Bread Basket",
    "Signature Fries",
    "Classic Dessert",
    "Grilled Vegetables",
    "Mixed Greens",
    "Market Catch",
    "Daily Pasta",
    "Herb-Roasted Chicken",
    "Beef Sliders",
    "Caesar Salad",
    "Citrus Tart",
    "Garlic Bread",
    "Charcuterie Board",
    "Pan-Seared Fish",
    "Truffle Fries",
    "Summer Roll",
    "Spiced Lamb Skewers",
  ],
  italian: [
    "Bruschetta",
    "Margherita Pizza",
    "Spaghetti Carbonara",
    "Fettuccine Alfredo",
    "Eggplant Parmigiana",
    "Caprese Salad",
    "Lasagna",
    "Minestrone Soup",
    "Tiramisu",
    "Gelato",
    "Pesto Gnocchi",
    "Prosciutto e Melone",
    "Risotto Milanese",
    "Polenta Fries",
    "Affogato",
  ],
  japanese: [
    "Salmon Sushi Roll",
    "Tuna Sashimi",
    "Vegetable Tempura",
    "Tempura Udon",
    "Shrimp Tempura",
    "Miso Soup",
    "California Roll",
    "Pork Tonkatsu",
    "Yakitori Skewers",
    "Green Tea Mochi",
    "Chicken Teriyaki",
    "Soba Noodles",
    "Avocado Maki",
    "Seaweed Salad",
    "Matcha Cheesecake",
  ],
  french: [
    "French Onion Soup",
    "Quiche Lorraine",
    "Beef Bourguignon",
    "Coq au Vin",
    "Duck Confit",
    "Nicoise Salad",
    "Crème Brûlée",
    "Croque Monsieur",
    "Ratatouille",
    "Escargot",
    "Steak Frites",
    "Moules Marinières",
    "Tarte Tatin",
    "Baguette with Butter",
    "Salade Lyonnaise",
  ],
  mexican: [
    "Street Tacos",
    "Chicken Enchiladas",
    "Guacamole",
    "Carnitas Burrito",
    "Chiles Rellenos",
    "Quesadilla",
    "Salsa Fresca",
    "Fajitas",
    "Elote",
    "Tres Leches Cake",
    "Shrimp Ceviche",
    "Pozole",
    "Tostadas",
    "Taquitos",
    "Churros",
  ],
  american: [
    "Classic Burger",
    "BBQ Ribs",
    "Fried Chicken",
    "Mac and Cheese",
    "Cobb Salad",
    "Steak Frites",
    "Pulled Pork Sandwich",
    "Grilled Salmon",
    "Mashed Potatoes",
    "Apple Pie",
    "Buffalo Wings",
    "Caesar Salad",
    "Fish and Chips",
    "Club Sandwich",
    "Brownie Sundae",
  ],
  indian: [
    "Chicken Tikka Masala",
    "Lamb Rogan Josh",
    "Butter Chicken",
    "Veg Biryani",
    "Samosas",
    "Garlic Naan",
    "Palak Paneer",
    "Biryani",
    "Chana Masala",
    "Dal Tadka",
    "Aloo Gobi",
    "Paneer Tikka",
    "Mango Lassi",
    "Naan Bread",
    "Gulab Jamun",
  ],
  chinese: [
    "Kung Pao Chicken",
    "Sweet and Sour Pork",
    "Vegetable Fried Rice",
    "General Tso's Chicken",
    "Steamed Dumplings",
    "Mapo Tofu",
    "Chow Mein",
    "Peking Duck",
    "Hot and Sour Soup",
    "Spring Rolls",
    "Spicy Szechuan Noodles",
    "Char Siu Bao",
    "Crispy Sesame Beef",
    "Egg Drop Soup",
    "Garlic Bok Choy",
  ],
  seafood: [
    "Grilled Shrimp",
    "Lobster Roll",
    "Fried Calamari",
    "Clam Chowder",
    "Seared Scallops",
    "Fish Tacos",
    "Oysters on the Half Shell",
    "Crab Cakes",
    "Seafood Paella",
    "Citrus Salmon",
    "Shrimp Scampi",
    "Mussels Provencal",
    "Grilled Tuna Steak",
    "Ceviche",
    "Swordfish Kebabs",
  ],
  mediterranean: [
    "Hummus Platter",
    "Falafel Wrap",
    "Chicken Shawarma",
    "Greek Salad",
    "Grilled Halloumi",
    "Tabbouleh",
    "Lamb Kofta",
    "Baklava",
    "Stuffed Grape Leaves",
    "Pita Bread",
    "Shakshuka",
    "Moussaka",
    "Fattoush",
    "Spanakopita",
    "Tahini Chicken",
  ],
  korean: [
    "Bibimbap",
    "Korean BBQ Beef",
    "Kimchi Pancake",
    "Spicy Tofu Stew",
    "Fried Chicken",
    "Japchae",
    "Bulgogi",
    "Kimbap",
    "Seafood Pancake",
    "Tteokbokki",
    "Cold Noodles",
    "Samgyeopsal",
    "Galbi",
    "Korean BBQ Ribs",
    "Mandu",
  ],
  thai: [
    "Pad Thai",
    "Green Curry",
    "Tom Yum Soup",
    "Massaman Curry",
    "Mango Sticky Rice",
    "Thai Basil Chicken",
    "Papaya Salad",
    "Satay Skewers",
    "Coconut Rice",
    "Spring Rolls",
    "Pineapple Fried Rice",
    "Panang Curry",
    "Thai Iced Tea",
    "Crab Rangoon",
    "Steamed Fish with Lime",
  ],
  vegetarian: [
    "Grilled Vegetable Platter",
    "Falafel Bowl",
    "Veggie Burger",
    "Roasted Cauliflower",
    "Stuffed Peppers",
    "Greek Salad",
    "Lentil Soup",
    "Veggie Tacos",
    "Quinoa Salad",
    "Sweet Potato Fries",
    "Zucchini Noodles",
    "Marinated Tofu",
    "Eggplant Rollatini",
    "Mushroom Risotto",
    "Cauliflower Steak",
  ],
  vegan: [
    "Tofu Stir Fry",
    "Vegan Buddha Bowl",
    "Black Bean Burger",
    "Roasted Chickpeas",
    "Stuffed Squash",
    "Vegetable Curry",
    "Vegan Pad Thai",
    "Lentil Shepherd's Pie",
    "Zucchini Noodles",
    "Coconut Milk Pudding",
    "Vegan Chili",
    "Quinoa Stuffed Peppers",
    "Avocado Toast",
    "Chia Seed Pudding",
    "Grilled Portobello",
  ],
  dessert: [
    "Chocolate Lava Cake",
    "Crème Brûlée",
    "Baklava",
    "Tiramisu",
    "Strawberry Cheesecake",
    "Macarons",
    "Pistachio Gelato",
    "Fruit Tart",
    "Brownie Sundae",
    "Lemon Meringue Pie",
    "Crepes with Nutella",
    "Chocolate Éclairs",
    "Panna Cotta",
    "Banoffee Pie",
    "Mini Cheesecake Bites",
  ],
  bakery: [
    "Sourdough Loaf",
    "Croissant",
    "Cinnamon Roll",
    "Almond Brioche",
    "Blueberry Muffin",
    "Chocolate Chip Cookie",
    "Apple Danish",
    "Banana Bread",
    "Baguette",
    "Bagel with Cream Cheese",
    "Fruit Scone",
    "Pecan Tart",
    "Pumpkin Loaf",
    "Cheese Danish",
    "Lemon Pound Cake",
  ],
  cafe: [
    "Flat White",
    "Latte",
    "Avocado Toast",
    "Granola Bowl",
    "Chicken Panini",
    "Tomato Basil Soup",
    "Quiche Lorraine",
    "Pastrami Sandwich",
    "Iced Matcha Latte",
    "Berry Parfait",
    "Cinnamon Latte",
    "Brie and Fig Sandwich",
    "Egg and Cheese Croissant",
    "Spinach Frittata",
    "Blueberry Pancakes",
  ],
  breakfast: [
    "Eggs Benedict",
    "Pancakes",
    "French Toast",
    "Omelette",
    "Breakfast Burrito",
    "Avocado Toast",
    "Belgian Waffles",
    "Breakfast Sandwich",
    "Granola Yogurt Bowl",
    "Hash Browns",
    "Shakshuka",
    "Smoked Salmon Bagel",
    "Banana Pancakes",
    "Huevos Rancheros",
    "Fresh Fruit Plate",
  ],
};

const YELP_CATEGORY_ALIASES = {
  all: "all",
  italian: "italian",
  japanese: "japanese",
  french: "french",
  mexican: "mexican",
  american: "tradamerican,newamerican",
  indian: "indpak",
  chinese: "chinese",
  seafood: "seafood",
};

function getYelpCategoryAlias(category) {
  if (!category || category === "all") return undefined;
  return YELP_CATEGORY_ALIASES[category] || category;
}

function getCuisineFallbackKey(cuisine, cuisineName) {
  const normalizedCuisine = String(cuisine || "").trim().toLowerCase();
  const normalizedName = String(cuisineName || "").trim().toLowerCase();

  if (MENU_FALLBACKS[normalizedCuisine]) {
    return normalizedCuisine;
  }

  if (
    normalizedName.includes("dessert") ||
    normalizedName.includes("bakery") ||
    normalizedName.includes("patisserie") ||
    normalizedName.includes("sweet") ||
    normalizedName.includes("cake") ||
    normalizedName.includes("ice cream") ||
    normalizedName.includes("chocolate")
  ) {
    return "dessert";
  }

  if (
    normalizedName.includes("cafe") ||
    normalizedName.includes("coffee") ||
    normalizedName.includes("tea") ||
    normalizedName.includes("bistro") ||
    normalizedName.includes("espresso")
  ) {
    return "cafe";
  }

  if (normalizedName.includes("breakfast") || normalizedName.includes("brunch")) {
    return "breakfast";
  }

  if (normalizedName.includes("pizza") || normalizedName.includes("trattoria")) {
    return "italian";
  }

  if (
    normalizedName.includes("sushi") ||
    normalizedName.includes("ramen") ||
    normalizedName.includes("izakaya") ||
    normalizedName.includes("japanese")
  ) {
    return "japanese";
  }

  if (
    normalizedName.includes("taco") ||
    normalizedName.includes("taqueria") ||
    normalizedName.includes("burrito") ||
    normalizedName.includes("mexican")
  ) {
    return "mexican";
  }

  if (
    normalizedName.includes("seafood") ||
    normalizedName.includes("fish") ||
    normalizedName.includes("oyster") ||
    normalizedName.includes("shrimp") ||
    normalizedName.includes("shellfish")
  ) {
    return "seafood";
  }

  if (
    normalizedName.includes("mediterranean") ||
    normalizedName.includes("greek") ||
    normalizedName.includes("middle eastern") ||
    normalizedName.includes("lebanese") ||
    normalizedName.includes("turkish")
  ) {
    return "mediterranean";
  }

  if (normalizedName.includes("thai") || normalizedName.includes("pad thai") || normalizedName.includes("massaman")) {
    return "thai";
  }

  if (normalizedName.includes("korean") || normalizedName.includes("kimchi") || normalizedName.includes("bibimbap")) {
    return "korean";
  }

  if (
    normalizedName.includes("chinese") ||
    normalizedName.includes("dim sum") ||
    normalizedName.includes("szechuan") ||
    normalizedName.includes("cantonese")
  ) {
    return "chinese";
  }

  if (
    normalizedName.includes("indian") ||
    normalizedName.includes("curry") ||
    normalizedName.includes("naan") ||
    normalizedName.includes("tandoori") ||
    normalizedName.includes("biryani") ||
    normalizedName.includes("tikka") ||
    normalizedName.includes("samosa") ||
    normalizedName.includes("paneer") ||
    normalizedName.includes("rogan josh") ||
    normalizedName.includes("vindaloo") ||
    normalizedName.includes("dal") ||
    normalizedName.includes("aloo") ||
    normalizedName.includes("bhindi") ||
    normalizedName.includes("chapati") ||
    normalizedName.includes("dosa") ||
    normalizedName.includes("idli") ||
    normalizedName.includes("masala")
  ) {
    return "indian";
  }

  if (
    normalizedName.includes("bbq") ||
    normalizedName.includes("barbecue") ||
    normalizedName.includes("burger") ||
    normalizedName.includes("diner") ||
    normalizedName.includes("grill") ||
    normalizedName.includes("steak")
  ) {
    return "american";
  }

  if (normalizedName.includes("bakery") || normalizedName.includes("bread") || normalizedName.includes("pastry")) {
    return "bakery";
  }

  return "all";
}

export function getFallbackMenuItems(cuisine, cuisineName) {
  const key = getCuisineFallbackKey(cuisine, cuisineName);
  return MENU_FALLBACKS[key] || MENU_FALLBACKS.all;
}

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
    menu: Array.isArray(restaurant.menu) ? restaurant.menu : [],
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
  offset,
  location,
} = {}) {
  // Yelp API enforces a maximum `limit` of 50. Clamp to avoid 400 validation errors.
  const boundedLimit = Math.max(1, Math.min(Number(limit) || 20, 50));
  const boundedOffset = Math.max(0, Number(offset) || 0);

  const yelpCategories = getYelpCategoryAlias(categories);
  const data = await searchBusinesses({
    term,
    categories: yelpCategories,
    price,
    limit: boundedLimit,
    offset: boundedOffset,
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
  const yelpCategories = getYelpCategoryAlias(cuisine);
  if (cuisine === "all") {
    if (data) return data;
    return fetchRestaurants({ limit: 20 });
  }
  if (data) {
    return data.filter((r) => r.cuisine === cuisine);
  }
  return fetchRestaurants({ categories: yelpCategories, limit: 20 });
}

// ─── Saved Restaurants Utilities ──────────────────────────────

const SAVED_DATA_KEY = "savedRestaurantsData";
const SAVED_IDS_KEY = "savedRestaurants";

function getSavedDataKey(email) {
  if (email) {
    return `${SAVED_DATA_KEY}_${email}`;
  }
  return `${SAVED_DATA_KEY}_guest`;
}

function getSavedIdsKey(email) {
  if (email) {
    return `${SAVED_IDS_KEY}_${email}`;
  }
  return `${SAVED_IDS_KEY}_guest`;
}

export function getSavedRestaurants(user = null) {
  try {
    const raw = localStorage.getItem(getSavedDataKey(user?.email));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSavedIds(user = null) {
  try {
    const raw = localStorage.getItem(getSavedIdsKey(user?.email));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearSavedRestaurants(user = null) {
  try {
    localStorage.removeItem(getSavedDataKey(user?.email));
    localStorage.removeItem(getSavedIdsKey(user?.email));
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent("saved-updated", { detail: { email: user?.email || null } }));
    }
  } catch {}
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
  {
    history = [],
    saved = [],
    user = null,
    assistantAnswers = null,
    count = 4,
    excludeIds = [],
  } = {},
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

  const assistantPreferredCuisine = assistantAnswers?.cuisine
    ? normalizedCuisine(assistantAnswers.cuisine === "Any cuisine" ? "" : assistantAnswers.cuisine)
    : null;
  const assistantMood = assistantAnswers?.mood || null;
  const assistantBudget = assistantAnswers?.budget || null;
  const assistantDiet = assistantAnswers?.diet || null;

  const dietKeywords = {
    vegetarian: ["vegetarian", "veggie", "plant-based", "tofu", "salad"],
    vegan: ["vegan", "plant-based", "tofu", "tempeh", "veggie"],
    "gluten-free": ["gluten-free", "gluten free", "gf", "rice", "corn", "potato"],
    "low-sodium": ["low sodium", "heart friendly", "light", "fresh", "healthy"],
    "diabetes-friendly": ["diabetes-friendly", "low carb", "low sugar", "healthy", "balanced"],
  };

  const cuisineScores = {};
  [...saved, ...history].forEach((restaurant) => {
    const cuisine = normalizedCuisine(restaurant.cuisine);
    if (!cuisine) return;
    cuisineScores[cuisine] = (cuisineScores[cuisine] || 0) + 1;
  });

  const matchesDiet = (restaurant) => {
    if (!assistantDiet || assistantDiet === "none") return true;
    const target = dietKeywords[assistantDiet] || [];
    if (!target.length) return true;
    const text = [
      restaurant.name,
      restaurant.description,
      restaurant.cuisineName,
      restaurant.location,
      restaurant.features?.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return target.some((keyword) => text.includes(keyword));
  };

  const moodKeywords = {
    "local-favorite": ["local", "favorite", "trending", "popular", "neighborhood"],
    "date-night": ["romantic", "cozy", "intimate", "wine", "private"],
    "quick-bite": ["fast", "quick", "counter", "takeout", "grab"],
    "group-dinner": ["group", "family", "large", "shareable", "outdoor", "party"],
  };

  const scoredRestaurants = restaurants
    .filter((restaurant) => !excludeIds.includes(restaurant.id))
    .map((restaurant) => {
      const cuisine = normalizedCuisine(restaurant.cuisine);
      let score = 0;
      const rating = Number(restaurant.rating) || 0;
      const reviews = Number(restaurant.reviews) || 0;
      const priceLevel = Number(restaurant.priceLevel) || 2;
      const text = [
        restaurant.name,
        restaurant.description,
        restaurant.cuisineName,
        restaurant.location,
        restaurant.features?.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (assistantPreferredCuisine && cuisine === assistantPreferredCuisine) score += 18;
      if (preferenceCuisines.has(cuisine)) score += 12;
      if (cuisineScores[cuisine]) score += cuisineScores[cuisine] * 4;
      if (restaurant.reviews >= 100) score += 6;
      if (restaurant.rating >= 4.5) score += 4;
      if (restaurant.priceLevel <= 2) score += 1;

      if (assistantBudget === "economy" && priceLevel <= 2) score += 10;
      if (assistantBudget === "moderate" && (priceLevel === 2 || priceLevel === 3)) score += 6;
      if (assistantBudget === "premium" && priceLevel >= 3) score += 10;

      if (assistantDiet && assistantDiet !== "none") {
        if (matchesDiet(restaurant)) {
          score += 8;
        } else {
          score -= 3;
        }
      }

      const moodTarget = assistantMood ? moodKeywords[assistantMood] || [] : [];
      if (moodTarget.some((keyword) => text.includes(keyword))) score += 8;
      if (assistantMood === "local-favorite" && reviews >= 150) score += 6;
      if (assistantMood === "date-night" && text.includes("romantic")) score += 6;
      if (assistantMood === "quick-bite" && text.includes("fast")) score += 6;
      if (assistantMood === "group-dinner" && text.includes("group")) score += 6;

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

function normalizeCuisine(value) {
  return String(value || "").trim().toLowerCase();
}

function selectTopFeature(restaurant) {
  if (!restaurant.features || !restaurant.features.length) return "Great atmosphere";
  return restaurant.features[0];
}

export function getAIDiningAssistant({
  restaurants = [],
  category = "all",
  user = null,
  mood = "local-favorite",
  saved = [],
  history = [],
} = {}) {
  const moodConfig = {
    "local-favorite": {
      label: "Local Favorite",
      title: "Trusted neighborhood picks",
      summary:
        "Perfect when you want a safe, highly rated spot that locals return to again and again.",
      boosts: ["popular", "highRating"],
    },
    "date-night": {
      label: "Date Night",
      title: "Romantic dining suggestions",
      summary:
        "Ideal for an intimate evening with atmosphere, quality service, and memorable cuisine.",
      boosts: ["romantic", "highRating"],
    },
    "quick-bite": {
      label: "Quick Bite",
      title: "Fast and tasty options",
      summary:
        "Great when you need something delicious, efficient, and easy to enjoy on the go.",
      boosts: ["affordable", "fast"],
    },
    "group-dinner": {
      label: "Group Dinner",
      title: "Spacious spots for groups",
      summary:
        "Best for lively gatherings with plenty of seating, shareable dishes, and a fun atmosphere.",
      boosts: ["group", "popular"],
    },
  };

  const selectedMood = moodConfig[mood] || moodConfig["local-favorite"];
  const preferredCuisines = new Set();
  if (user?.preferences?.cuisineTypes) {
    user.preferences.cuisineTypes
      .split(/,|\//)
      .map((c) => normalizeCuisine(c))
      .filter(Boolean)
      .forEach((c) => preferredCuisines.add(c));
  }

  const savedCuisines = new Set(
    saved
      .map((restaurant) => normalizeCuisine(restaurant.cuisine))
      .filter(Boolean),
  );
  const historyCuisines = new Set(
    history
      .map((restaurant) => normalizeCuisine(restaurant.cuisine))
      .filter(Boolean),
  );

  const pool = restaurants.filter((restaurant) => {
    if (!restaurant) return false;
    if (category && category !== "all") {
      return normalizeCuisine(restaurant.cuisine) === normalizeCuisine(category);
    }
    return true;
  });

  const candidates = pool.length ? pool : restaurants;

  const scoreRestaurant = (restaurant) => {
    let score = 0;
    const rating = Number(restaurant.rating) || 0;
    const reviews = Number(restaurant.reviews) || 0;
    const priceLevel = Number(restaurant.priceLevel) || 2;
    const cuisine = normalizeCuisine(restaurant.cuisine);

    score += rating * 12;
    score += Math.min(reviews, 200) * 0.05;

    if (preferredCuisines.has(cuisine)) score += 10;
    if (savedCuisines.has(cuisine)) score += 8;
    if (historyCuisines.has(cuisine)) score += 5;

    if (selectedMood.boosts.includes("highRating")) {
      score += rating * 8;
    }
    if (selectedMood.boosts.includes("popular")) {
      score += Math.min(reviews, 200) * 0.08;
    }
    if (selectedMood.boosts.includes("affordable") && priceLevel <= 2) {
      score += 12;
    }
    if (selectedMood.boosts.includes("fast") && priceLevel <= 2) {
      score += 6;
    }
    if (selectedMood.boosts.includes("group")) {
      const groupFriendly = [
        "Private Dining",
        "Group Dining",
        "Live Music",
        "Rooftop Views",
        "Outdoor Seating",
        "Full Bar",
      ];
      const match = restaurant.features?.some((feature) =>
        groupFriendly.includes(feature),
      );
      if (match) score += 14;
    }
    if (selectedMood.boosts.includes("romantic")) {
      const romanticFeatures = ["Wine Bar", "Rooftop Views", "Live Music", "Private Dining"];
      const match = restaurant.features?.some((feature) => romanticFeatures.includes(feature));
      if (match) score += 14;
    }
    if (restaurant.priceLevel <= 2) score += 2;
    return score;
  };

  const scoredRestaurants = candidates
    .map((restaurant) => ({ restaurant, score: scoreRestaurant(restaurant) }))
    .sort((a, b) => b.score - a.score);

  const recommendation = scoredRestaurants.find((item) => item.restaurant.id)?.restaurant || null;

  const reason = recommendation
    ? preferredCuisines.has(normalizeCuisine(recommendation.cuisine))
      ? `Matches your favorite cuisine and strong local feedback with a ${recommendation.rating.toFixed(1)}★ rating.`
      : savedCuisines.has(normalizeCuisine(recommendation.cuisine))
      ? `This one fits the kinds of places you've saved before and keeps the experience familiar.`
      : `A great fit for your selected dining mood with strong reviews and excellent value.`
    : "We’ll update this suggestion as you refine your search and save favorites.";

  return {
    moodLabel: selectedMood.label,
    title: selectedMood.title,
    summary: selectedMood.summary,
    recommendation,
    reason,
    featureText: selectTopFeature(recommendation || {}),
  };
}

export function getAIDiningRecommendationFromSurvey({
  restaurants = [],
  answers = {},
  category = "all",
  user = null,
  saved = [],
  history = [],
} = {}) {
  const mood = answers.mood || "local-favorite";
  const preferredCuisine = answers.cuisine && answers.cuisine !== "Any cuisine"
    ? normalizeCuisine(answers.cuisine)
    : null;
  const budget = answers.budget || "moderate";
  const diet = answers.diet || "none";
  const partySize = answers.partySize || "solo";
  const height = answers.height || "170-180-cm";
  const weight = answers.weight || "60-75-kg";
  const medicalCondition = answers.medicalCondition || "none";

  const assistantBase = getAIDiningAssistant({
    restaurants,
    category,
    user,
    mood,
    saved,
    history,
  });

  const dietKeywords = {
    vegetarian: ["vegetarian", "veggie", "plant-based", "tofu", "salad", "paneer", "dal", "chana"],
    vegan: ["vegan", "plant-based", "tofu", "tempeh", "veggie", "dal", "aloo"],
    "gluten-free": ["gluten-free", "gluten free", "gf", "rice", "corn", "potato", "biryani"],
    "low-sodium": ["low sodium", "heart friendly", "light", "fresh", "healthy", "steamed", "grilled"],
    "diabetes-friendly": ["diabetes-friendly", "low carb", "low sugar", "healthy", "balanced", "grilled", "steamed"],
  };

  const normalizeText = (value) => String(value || "").toLowerCase();
  const restaurantText = (restaurant) =>
    [restaurant.name, restaurant.description, restaurant.cuisineName, restaurant.location, restaurant.features?.join(" ")]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  const matchesDiet = (restaurant) => {
    if (diet === "none") return true;
    const target = dietKeywords[diet] || [];
    if (!target.length) return true;
    const text = restaurantText(restaurant);
    return target.some((keyword) => text.includes(keyword));
  };

  const matchesMedicalCondition = (restaurant) => {
    if (medicalCondition === "none") return true;
  const medicalKeywords = {
      "high-blood-pressure": ["low sodium", "heart healthy", "low salt", "fresh", "light", "grilled", "steamed"],
      diabetes: ["low sugar", "low carb", "balanced", "sugar free", "diabetes friendly", "grilled", "steamed"],
      "gluten-allergy": ["gluten-free", "gluten free", "gf", "rice", "corn", "potato", "biryani", "tandoori"],
      "dairy-sensitivity": ["dairy-free", "lactose-free", "vegan", "nut milk", "plant-based"],
      "heart-condition": ["heart healthy", "low sodium", "fresh", "light", "lean protein", "grilled"],
      "weight-management": ["low calorie", "light", "lean", "salad", "protein", "grilled", "steamed"],
    };
    const target = medicalKeywords[medicalCondition] || [];
    if (!target.length) return true;
    const text = restaurantText(restaurant);
    return target.some((keyword) => text.includes(keyword));
  };

  const matchesWeightGoal = (restaurant) => {
    const text = restaurantText(restaurant);
    if (weight === "under-60-kg" || weight === "60-75-kg") {
      return text.includes("salad") || text.includes("grilled") || text.includes("lean") || text.includes("fresh");
    }
    if (weight === "75-90-kg" || weight === "90-105-kg") {
      return true;
    }
    if (weight === "105-kg-plus") {
      return text.includes("hearty") || text.includes("rich") || text.includes("generous") || text.includes("steak") || text.includes("comfort");
    }
    return true;
  };

  const matchesHeightNote = (restaurant) => {
    const text = restaurantText(restaurant);
    if (height === "under-160-cm") {
      return text.includes("small plates") || text.includes("light") || text.includes("sharing") || text.includes("snack");
    }
    if (height === "190-cm-plus") {
      return text.includes("large portions") || text.includes("family style") || text.includes("hearty") || text.includes("generous");
    }
    return true;
  };

  const getCuisineMatchLevel = (restaurant) => {
    if (!preferredCuisine) return 0;
    const text = restaurantText(restaurant);
    const restaurantCuisine = normalizeCuisine(restaurant.cuisine);
    const restaurantCuisineName = normalizeText(restaurant.cuisineName);
    const categories = Array.isArray(restaurant.categories)
      ? restaurant.categories.map((cat) => normalizeText(cat?.alias || cat?.title || ""))
      : [];
    const primaryCategory = categories[0] || "";
    // Try matching using Yelp category aliases as well as titles and cuisine fields
    const yelpAlias = getYelpCategoryAlias(preferredCuisine) || preferredCuisine;
    const hasAliasCategory = categories.includes(yelpAlias) || categories.includes(preferredCuisine);
    const hasTitleMatch = categories.some((c) => c.includes(preferredCuisine));
    const hasPrimaryMatch =
      restaurantCuisine === preferredCuisine ||
      restaurantCuisineName === preferredCuisine ||
      primaryCategory === preferredCuisine ||
      primaryCategory === yelpAlias;

    if (hasPrimaryMatch) return 3;
    if (hasAliasCategory || hasTitleMatch) return 2;

    const cuisineKeywords = {
      indian: ["indian", "curry", "naan", "tandoori", "biryani", "tikka", "samosa", "paneer", "dal", "chapati", "dosa", "idli", "rogan josh", "south indian", "north indian", "hyderabadi", "chettinad", "vindaloo", "pakora"],
      italian: ["italian", "pasta", "pizza", "risotto", "gelato", "caprese", "gnocchi"],
      japanese: ["japanese", "sushi", "ramen", "tempura", "sake", "teriyaki", "miso", "udon", "izakaya", "yakiniku"],
      mexican: ["mexican", "taco", "burrito", "enchilada", "salsa", "guacamole", "quesadilla", "ceviche"],
      chinese: ["chinese", "dim sum", "kung pao", "peking", "szechuan", "chow mein", "hot pot", "bao"],
      french: ["french", "coq au vin", "crème", "boulangerie", "bistro", "escargot", "croissant"],
      american: ["american", "burger", "steak", "bbq", "barbecue", "ribs", "pulled pork", "diner"],
      seafood: ["seafood", "fish", "shrimp", "salmon", "lobster", "oyster", "scallop", "crab", "shellfish"],
    };

    const keywords = cuisineKeywords[preferredCuisine] || [preferredCuisine];
    return keywords.some((keyword) => text.includes(keyword)) ? 1 : 0;
  };

  const matchesCuisinePreference = (restaurant) => {
    return getCuisineMatchLevel(restaurant) > 0;
  };

  const categoryMatchesTarget = (restaurant, targetCategory) => {
    if (!targetCategory || targetCategory === "all") return true;
    const normalizedTarget = normalizeCuisine(targetCategory);
    const restaurantCuisine = normalizeCuisine(restaurant.cuisine);
    const restaurantCuisineName = normalizeText(restaurant.cuisineName);
    const categories = Array.isArray(restaurant.categories)
      ? restaurant.categories.map((cat) => normalizeText(cat?.alias || cat?.title || ""))
      : [];

    return (
      restaurantCuisine === normalizedTarget ||
      restaurantCuisineName === normalizedTarget ||
      categories.includes(normalizedTarget)
    );
  };

  const matchesBudget = (restaurant) => {
    const priceLevel = Number(restaurant.priceLevel) || 2;
    if (budget === "economy") return priceLevel <= 2;
    if (budget === "moderate") return priceLevel === 2 || priceLevel === 3;
    if (budget === "premium") return priceLevel >= 3;
    return true;
  };

  const partyBoosts = {
    solo: ["casual", "quick", "counter", "fast", "bar seating", "solo-friendly"],
    couple: ["romantic", "private", "cozy", "intimate", "wine", "date", "dim lighting"],
    group: ["group", "family", "large", "shareable", "outdoor", "festive", "communal", "party"],
    business: ["private", "quiet", "lounge", "meeting", "professional", "private room"],
  };

  const matchesPartyPreference = (restaurant) => {
    if (partySize === "solo") return true;
    const text = restaurantText(restaurant);
    const boosts = partyBoosts[partySize] || [];
    return boosts.some((keyword) => text.includes(keyword));
  };

  const scoreRestaurant = (restaurant) => {
    const rating = Number(restaurant.rating) || 0;
    const reviews = Number(restaurant.reviews) || 0;
    const priceLevel = Number(restaurant.priceLevel) || 2;
    const cuisine = normalizeCuisine(restaurant.cuisine);
    let score = rating * 14 + Math.min(reviews, 200) * 0.08;

    if (preferredCuisine) {
      const cuisineMatchLevel = getCuisineMatchLevel(restaurant);
      if (cuisineMatchLevel >= 3) {
        score += 48;
      } else if (cuisineMatchLevel === 2) {
        score += 32;
      } else if (cuisineMatchLevel === 1) {
        score += 18;
      } else {
        score -= 30;
      }
    }

    if (saved.some((item) => normalizeCuisine(item.cuisine) === cuisine)) score += 6;
    if (history.some((item) => normalizeCuisine(item.cuisine) === cuisine)) score += 4;

    if (budget === "economy") {
      score += priceLevel <= 2 ? 16 : -10;
    } else if (budget === "moderate") {
      score += priceLevel === 2 || priceLevel === 3 ? 10 : 2;
    } else if (budget === "premium") {
      score += priceLevel >= 3 ? 16 : -6;
    }

    if (diet !== "none") {
      if (matchesDiet(restaurant)) {
        score += 18;
      } else {
        score -= 12;
      }
    }

    if (medicalCondition !== "none") {
      if (matchesMedicalCondition(restaurant)) {
        score += 18;
      } else {
        score -= 14;
      }
    }

    if (weight && matchesWeightGoal(restaurant)) {
      score += weight === "105-kg-plus" ? 8 : 4;
    } else if (weight) {
      score -= 6;
    }

    if (height && matchesHeightNote(restaurant)) {
      score += height === "190-cm-plus" || height === "under-160-cm" ? 6 : 2;
    }

    if (matchesPartyPreference(restaurant)) {
      score += partySize === "solo" ? 2 : 10;
    }

    return score;
  };

  const matchedByPreferences = restaurants.filter((restaurant) => {
    if (!restaurant) return false;

    const cuisineMatchLevel = preferredCuisine ? getCuisineMatchLevel(restaurant) : 1;
    const cuisineMatches = !preferredCuisine || cuisineMatchLevel > 0;

    const dietMatches = diet === "none" || matchesDiet(restaurant);
    const medicalMatches = medicalCondition === "none" || matchesMedicalCondition(restaurant);
    const budgetMatches = budget === "moderate" || matchesBudget(restaurant);

    if (!preferredCuisine) {
      return budgetMatches;
    }

    if (!cuisineMatches) return false;

    return true;
  });

  // Debug: Log the filtering process
  if (preferredCuisine && typeof window !== 'undefined' && window.location.href.includes('localhost')) {
    const matchedCuisines = matchedByPreferences.map(r => `${r.name} (${r.cuisineName})`);
    if (matchedCuisines.length < 3 && restaurants.length > 20) {
      console.warn(`[SmartAssistant] Low match for ${preferredCuisine}: Only ${matchedCuisines.length} of ${restaurants.length} restaurants matched. Top matches: ${matchedCuisines.slice(0, 5).join(', ')}`);
    }
  }

  // If a preferred cuisine is selected, use it for fallback filtering
  const fallbackCategory = preferredCuisine || category;
  
  const categoryPool = restaurants.filter((restaurant) => {
    if (!restaurant) return false;
    if (fallbackCategory && fallbackCategory !== "all") {
      return categoryMatchesTarget(restaurant, fallbackCategory);
    }
    return true;
  });

  const pool = matchedByPreferences.length
    ? matchedByPreferences
    : categoryPool.length
    ? categoryPool
    : restaurants;

  const candidates = pool;
  const scored = candidates
    .map((restaurant) => ({ restaurant, score: scoreRestaurant(restaurant) }))
    .sort((a, b) => b.score - a.score);

  const selectedRestaurant = scored.length ? scored[0].restaurant : assistantBase.recommendation;
  const reason = selectedRestaurant
    ? preferredCuisine && normalizeCuisine(selectedRestaurant.cuisine) === preferredCuisine
      ? `Matches your preferred cuisine and current dining mood with ${selectedRestaurant.rating.toFixed(1)}★ reviews.`
      : medicalCondition !== "none" && matchesMedicalCondition(selectedRestaurant)
      ? `Suited to your health condition and still offers a strong ${selectedRestaurant.cuisineName} experience.`
      : diet !== "none" && matchesDiet(selectedRestaurant)
      ? `Fits your dietary need while still delivering a great ${selectedRestaurant.cuisineName} dining experience.`
      : partySize !== "solo"
      ? `A top fit for your ${partySize.replace(/([A-Z])/g, " $1")} selection and balanced quality.`
      : `A strong match for your current dining preferences and local ratings.`
    : assistantBase.reason;

  return {
    ...assistantBase,
    recommendation: selectedRestaurant,
    restaurant: selectedRestaurant,
    reason,
  };
}

export function isRestaurantSaved(id, user = null) {
  const saved = getSavedIds(user);
  return saved.includes(id);
}

/**
 * Toggle a restaurant in saved storage.
 * Pass the full restaurant object so it can be stored.
 * @param {Object} restaurant - Full restaurant object
 * @param {Object|null} user - Current authenticated user object
 * @returns {string[]} Updated saved IDs
 */
export function toggleSavedRestaurant(restaurant, user = null) {
  const savedData = getSavedRestaurants(user);
  const savedIds = getSavedIds(user);
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

  localStorage.setItem(getSavedDataKey(user?.email), JSON.stringify(newData));
  localStorage.setItem(getSavedIdsKey(user?.email), JSON.stringify(newIds));
  try {
    // Emit a global event so UI components (Navbar, pages) can react immediately
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("saved-updated", { detail: { email: user?.email || null } }),
      );
    }
  } catch {
    // ignore
  }
  return newIds;
}
