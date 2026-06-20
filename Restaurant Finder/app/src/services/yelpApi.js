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
  // Try to also fetch reviews (Yelp has a separate reviews endpoint)
  try {
    const reviews = await fetchBusinessReviews(id);
    if (reviews) json.reviews = reviews;
  } catch (e) {
    // ignore review fetch errors
  }
  // Try to also fetch menus (some Yelp endpoints expose menus)
  try {
    const menus = await fetchBusinessMenus(id);
    if (menus) {
      json.menus = menus;
      // also set `menu` for backward compatibility if menus is an array
      json.menu = Array.isArray(menus) ? menus : [menus];
    }
  } catch (e) {
    // ignore menu fetch errors
  }

  console.log("Yelp business response", json);
  return json;
}

// Fetch business reviews and merge them into the business detail object when possible
async function fetchBusinessReviews(id) {
  const url = `${PROXY_BASE}/api/business/${encodeURIComponent(id)}/reviews`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.reviews || data || null;
  } catch (err) {
    if (EXTERNAL_PROXY_BASE && YELP_API_KEY) {
      try {
        const directUrl = `${YELP_BASE}/businesses/${encodeURIComponent(id)}/reviews`;
        const proxyUrl = `${EXTERNAL_PROXY_BASE}${encodeURIComponent(directUrl)}`;
        const resp2 = await fetch(proxyUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${YELP_API_KEY}`,
            Accept: "application/json",
          },
        });
        if (!resp2.ok) return null;
        const data2 = await resp2.json();
        return data2.reviews || data2 || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

// Fetch business menus (Yelp may expose menus on a separate endpoint)
async function fetchBusinessMenus(id) {
  const url = `${PROXY_BASE}/api/business/${encodeURIComponent(id)}/menus`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.menus || data || null;
  } catch (err) {
    if (EXTERNAL_PROXY_BASE && YELP_API_KEY) {
      try {
        const directUrl = `${YELP_BASE}/businesses/${encodeURIComponent(id)}/menus`;
        const proxyUrl = `${EXTERNAL_PROXY_BASE}${encodeURIComponent(directUrl)}`;
        const resp2 = await fetch(proxyUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${YELP_API_KEY}`,
            Accept: "application/json",
          },
        });
        if (!resp2.ok) return null;
        const data2 = await resp2.json();
        return data2.menus || data2 || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

/**
 * Return full hours array formatted as human readable strings
 */
function formatHoursFull(hoursData) {
  if (!hoursData || !hoursData.open) return [];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return hoursData.open.map((slot) => {
    const day = days[slot.day] || "?";
    const start = `${slot.start.slice(0, 2)}:${slot.start.slice(2)}`;
    const end = `${slot.end.slice(0, 2)}:${slot.end.slice(2)}`;
    return `${day}: ${start} - ${end}`;
  });
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
  const hoursFull = formatHoursFull(business.hours?.[0]);

  // Description based on category data
  const description = `${cuisineTitle} restaurant${
    business.rating ? ` rated ${business.rating} stars` : ""
  }${
    business.review_count
      ? ` with ${business.review_count.toLocaleString()} reviews`
      : ""
  }. Located at ${location}. Call ${phone} for reservations.`;

  // Yelp Fusion business detail may include a menu array, but it is not guaranteed.
  // Keep raw menu only when the API provides it, and preserve the original object.
  const menu = Array.isArray(business.menus)
    ? business.menus
    : Array.isArray(business.menu)
    ? business.menu
    : business.menu
    ? [business.menu]
    : [];

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
    // Keep raw reference and expose more Yelp fields so UI can use everything
    photos: business.photos || [],
    categories: business.categories || [],
    coordinates: business.coordinates || null,
    isClosed: business.is_closed || false,
    transactions: business.transactions || [],
    yelpPrice: business.price || priceRange,
    yelpUrl: business.url || "",
    websiteMenuUrl: business.attributes?.menu_url || business.url || "",
    hoursFull,
    reviewsList: business.reviews || [],
    _raw: business,
  };
}

/**
 * Map Yelp category alias to our cuisine IDs.
 */
function mapCuisineAlias(alias) {
  const map = {
    italian: "italian",
    pizza: "italian",
    trattoria: "italian",
    japanese: "japanese",
    sushi: "japanese",
    ramen: "japanese",
    mexican: "mexican",
    tacos: "mexican",
    french: "french",
    bistros: "french",
    chinese: "chinese",
    dimsum: "chinese",
    szechuan: "chinese",
    shanghainese: "chinese",
    cantonese: "chinese",
    hotpot: "chinese",
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
  return map[alias] || alias || "all";
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
