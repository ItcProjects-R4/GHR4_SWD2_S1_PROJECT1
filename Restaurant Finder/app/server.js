import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const YELP_API_KEY = process.env.REACT_APP_YELP_API_KEY;
if (!YELP_API_KEY) {
  console.warn("Warning: REACT_APP_YELP_API_KEY not set in environment");
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
    res.status(response.status).send(text);
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

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
