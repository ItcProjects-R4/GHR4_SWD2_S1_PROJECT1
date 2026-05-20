// Frontend should call the local proxy server which holds the Yelp API key.
// The proxy is expected to be running at http://localhost:4000 and expose
// /api/search and /api/business/:id
const LOCAL_PROXY_BASE =
  import.meta.env.VITE_API_PROXY_BASE || "http://localhost:4000";
const EXTERNAL_PROXY_BASE = import.meta.env.VITE_YELP_API_PROXY || "";
const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY || "";
const YELP_BASE = "https://api.yelp.com/v3";
const PROXY_BASE = LOCAL_PROXY_BASE;

/**
 * Search businesses on Yelp.
 * @param {Object} params - Search parameters
 * @param {string} params.term - Search term (e.g., "restaurants", "sushi")
 * @param {string} params.location - Location (e.g., "New York, NY")
 * @param {string} params.categories - Yelp category alias (e.g., "italian")
 * @param {string} params.price - Price level "1" to "4"
 * @param {number} params.limit - Max results (default 20)
 * @param {number} params.offset - Pagination offset
 * @param {string} params.sort_by - "best_match", "rating", "review_count", "distance"
 * @returns {Promise<{businesses: Array, total: number}>}
 */
export async function searchBusinesses(params = {}) {
  const query = new URLSearchParams();

  if (params.term) query.set("term", params.term);
  if (params.categories) query.set("categories", params.categories);
  if (params.price) query.set("price", params.price);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));

  query.set("sort_by", params.sort_by || "best_match");

  const isDefaultLocation = !params.location && !params.latitude;

  // Default location
  if (isDefaultLocation) {
    query.set("location", "Cairo, Egypt");
  } else if (params.location) {
    query.set("location", params.location);
  }

  const url = `${PROXY_BASE}/api/search?${query.toString()}`;
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    if (EXTERNAL_PROXY_BASE && YELP_API_KEY) {
      const directUrl = `${YELP_BASE}/businesses/search?${query.toString()}`;
      const proxyUrl = `${EXTERNAL_PROXY_BASE}${encodeURIComponent(directUrl)}`;
      response = await fetch(proxyUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`,
          Accept: "application/json",
        },
      });
    } else {
      throw err;
    }
  }
  let text = await response.text();

  if (!response.ok) {
    if (
      isDefaultLocation &&
      response.status === 400 &&
      text.includes("LOCATION_NOT_FOUND")
    ) {
      console.warn(
        "Cairo default location failed; falling back to New York, NY",
      );
      query.set("location", "New York, NY");
      const fallbackUrl = `${PROXY_BASE}/api/search?${query.toString()}`;
      response = await fetch(fallbackUrl);
      text = await response.text();
      if (!response.ok) {
        throw new Error(`Proxy/Yelp API error ${response.status}: ${text}`);
      }
    } else {
      throw new Error(`Proxy/Yelp API error ${response.status}: ${text}`);
    }
  }

  const json = JSON.parse(text);
  console.log("Yelp search response", json);
  return json;
}

/**
 * Get detailed info for a single business.
 * @param {string} id - Yelp business ID
 * @returns {Promise<Object>}
 */
export async function getBusinessDetails(id) {
  const url = `${PROXY_BASE}/api/business/${encodeURIComponent(id)}`;
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    if (EXTERNAL_PROXY_BASE && YELP_API_KEY) {
      const directUrl = `${YELP_BASE}/businesses/${encodeURIComponent(id)}`;
      const proxyUrl = `${EXTERNAL_PROXY_BASE}${encodeURIComponent(directUrl)}`;
      response = await fetch(proxyUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`,
          Accept: "application/json",
        },
      });
    } else {
      throw err;
    }
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Proxy/Yelp API error ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  console.log("Yelp business response", json);
  return json;
}

/**
 * Map a raw Yelp business object to our UI restaurant shape.
 */
export function mapYelpToRestaurant(business) {
  const category = business.categories?.[0];
  const cuisineAlias = category?.alias || "restaurants";
  const cuisineTitle = category?.title || "Restaurant";

  // Map transactions to features
  const transactionMap = {
    delivery: "Delivery",
    pickup: "Takeout",
    restaurant_reservation: "Reservations",
  };
  const features = (business.transactions || [])
    .map((t) => transactionMap[t])
    .filter(Boolean);

  // Always include dine-in
  features.push("Dine-in");

  // Derive price level from $ string length
  const priceLevel = business.price?.length || 2;
  const priceRange = business.price || "$$";

  // Location string
  const location =
    business.location?.display_address?.join(", ") ||
    business.location?.address1 ||
    "Unknown location";

  // Phone
  const phone = business.display_phone || business.phone || "N/A";

  // Image fallback
  const image =
    business.image_url || business.photos?.[0] || "/images/hero-bg.jpg";

  // Format hours from detail data
  const hours = formatHours(business.hours?.[0]);

  // Description based on category data
  const description = `${cuisineTitle} restaurant${
    business.rating ? ` rated ${business.rating} stars` : ""
  }${
    business.review_count
      ? ` with ${business.review_count.toLocaleString()} reviews`
      : ""
  }. Located at ${location}. Call ${phone} for reservations.`;

  // Generic menu items since Yelp API doesn't provide menus
  const menu = [
    "Signature Dish",
    "Chef's Special",
    "House Favorite",
    "Daily Special",
  ];

  return {
    id: business.id,
    name: business.name,
    cuisine: mapCuisineAlias(cuisineAlias),
    cuisineName: cuisineTitle,
    rating: business.rating || 0,
    reviews: business.review_count || 0,
    priceRange,
    priceLevel,
    location,
    phone,
    description,
    image,
    hours,
    features,
    menu,
    // Keep raw reference
    _yelpUrl: business.url || "",
  };
}

/**
 * Map Yelp category alias to our cuisine IDs.
 */
function mapCuisineAlias(alias) {
  const map = {
    italian: "italian",
    pizza: "italian",
    japanese: "japanese",
    sushi: "japanese",
    ramen: "japanese",
    mexican: "mexican",
    tacos: "mexican",
    french: "french",
    bistros: "french",
    chinese: "chinese",
    dimsum: "chinese",
    indian: "indian",
    seafood: "seafood",
    tradamerican: "american",
    newamerican: "american",
    burgers: "american",
    bbq: "american",
    steakhouses: "american",
    breakfast_brunch: "american",
    cafes: "french",
    coffee: "french",
    bakeries: "french",
    thai: "thai",
    korean: "korean",
    vietnamese: "vietnamese",
    mediterranean: "mediterranean",
    greek: "mediterranean",
    middleeastern: "mediterranean",
    vegetarian: "vegetarian",
    vegan: "vegetarian",
    gluten_free: "vegetarian",
  };
  return map[alias] || "all";
}

/**
 * Format Yelp hours data into readable string.
 */
function formatHours(hoursData) {
  if (!hoursData || !hoursData.open) return "Hours vary — call ahead";

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const formatted = hoursData.open.map((slot) => {
    const day = days[slot.day] || "?";
    const start = `${slot.start.slice(0, 2)}:${slot.start.slice(2)}`;
    const end = `${slot.end.slice(0, 2)}:${slot.end.slice(2)}`;
    return `${day}: ${start} - ${end}`;
  });

  return (
    formatted.slice(0, 3).join(" | ") + (formatted.length > 3 ? " ..." : "")
  );
}
