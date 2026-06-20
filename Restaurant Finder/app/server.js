import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const YELP_API_KEY = process.env.REACT_APP_YELP_API_KEY || process.env.VITE_YELP_API_KEY;
if (!YELP_API_KEY) {
  console.warn("Warning: Yelp API key not set in environment");
}

const YELP_BASE = "https://api.yelp.com/v3";

async function proxyFetch(path, req, res) {
  console.log(`Proxy request: ${path} from ${req.ip}`);
  try {
    const url = `${YELP_BASE}${path}`;
    const response = await fetch(url, {
      method: req.method || "GET",
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
        Accept: "application/json",
      },
    });

    const text = await response.text();
    res.status(response.status).type("application/json").send(text);
  } catch (err) {
    console.error("Proxy error", err);
    res.status(500).json({ error: "Proxy server error" });
  }
}

// /api/search -> forwards to /businesses/search
app.get("/api/search", (req, res) => {
  const qs = new URLSearchParams(req.query).toString();
  return proxyFetch(`/businesses/search?${qs}`, req, res);
});

// /api/business/:id -> forwards to /businesses/:id
app.get("/api/business/:id", (req, res) => {
  const id = encodeURIComponent(req.params.id);
  return proxyFetch(`/businesses/${id}`, req, res);
});

// /api/business/:id/reviews -> forwards to /businesses/:id/reviews
app.get("/api/business/:id/reviews", (req, res) => {
  const id = encodeURIComponent(req.params.id);
  return proxyFetch(`/businesses/${id}/reviews`, req, res);
});

// /api/business/:id/menus -> forwards to /businesses/:id/menus
app.get("/api/business/:id/menus", (req, res) => {
  const id = encodeURIComponent(req.params.id);
  return proxyFetch(`/businesses/${id}/menus`, req, res);
});

// Fetch the restaurant's website menu HTML (if Yelp provides a menu_url in attributes)
app.get("/api/business/:id/website-menu", async (req, res) => {
  const id = encodeURIComponent(req.params.id);
  try {
    // First, get business detail from Yelp
    const detailResp = await fetch(`${YELP_BASE}/businesses/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!detailResp.ok) {
      const text = await detailResp.text();
      return res.status(detailResp.status).type("application/json").send(text);
    }

    const detailJson = await detailResp.json();
    const menuUrl = detailJson.attributes?.menu_url || detailJson.menu_url || null;
    if (!menuUrl) return res.status(404).json({ error: "No menu URL available" });

    // Fetch the external menu page
    const pageResp = await fetch(menuUrl, { method: "GET" });
    if (!pageResp.ok) {
      const txt = await pageResp.text().catch(() => "");
      return res.status(pageResp.status).type("text/plain").send(txt || "Failed to fetch menu page");
    }

    let html = await pageResp.text();

    // Basic sanitization: remove <script> tags to avoid executing external JS in our UI
    html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

    res.status(200).type("text/html").send(html);
  } catch (err) {
    console.error("website-menu proxy error", err);
    res.status(500).json({ error: "Failed to fetch website menu" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
