import axios from "axios";

/** Local copy served by Vite from /public, with the GitHub raw file as fallback. */
const DATA_URLS = [
  "/assets/data/data.json",
  "https://raw.githubusercontent.com/mmhz23/mft-final/refs/heads/main/public/assets/data/data.json",
];

/** json-server base URL (see `npm run watch:users-api`). */
export const USERS_API = (
  import.meta.env.VITE_USERS_API ?? "http://localhost:3000"
).replace(/\/$/, "");

const LOCAL_USERS_KEY = "nft-users";

/**
 * data.json references images on GitHub. The same files ship in /public, so
 * rewrite those URLs to local paths (faster, works offline, no hot-linking).
 */
const GITHUB_PREFIXES = [
  "https://github.com/mmhz23/mft-final/blob/main/public/",
  "https://raw.githubusercontent.com/mmhz23/mft-final/refs/heads/main/public/",
];

export const toLocalAsset = function (url) {
  if (typeof url !== "string") return url;
  for (const prefix of GITHUB_PREFIXES) {
    if (url.startsWith(prefix)) {
      return "/" + url.slice(prefix.length).replace(/\?raw=true$/, "");
    }
  }
  return url;
};

const localizeAssets = function (data) {
  const mapCollection = (c) => ({ ...c, images: c.images.map(toLocalAsset) });
  const mapImage = (item) => ({
    ...item,
    image: toLocalAsset(item.image),
    ...(item.icon ? { icon: toLocalAsset(item.icon) } : {}),
  });

  return {
    ...data,
    collections: (data.collections ?? []).map(mapCollection),
    creators: (data.creators ?? []).map(mapImage),
    categories: (data.categories ?? []).map(mapImage),
    nfts: (data.nfts ?? []).map(mapImage),
  };
};

/* ---------- data.json ---------- */
export const fetchData = async function () {
  let lastError;

  for (const url of DATA_URLS) {
    try {
      const response = await axios.get(url, { timeout: 8000 });
      return localizeAssets(response.data);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Could not load data.json");
};

/* ---------- users.json (via json-server) ---------- */

const readLocalUsers = function () {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
};

const writeLocalUsers = function (users) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {
    /* ignore */
  }
};

/**
 * Returns all users. Prefers json-server; falls back to browser storage
 * when the API is not reachable (e.g. the static Vercel deployment).
 */
export const getUsers = async function () {
  try {
    const response = await axios.get(`${USERS_API}/users`, { timeout: 4000 });
    return { users: response.data, source: "api" };
  } catch {
    return { users: readLocalUsers(), source: "local" };
  }
};

/**
 * Persists a new user. Resolves with `{ user, source }` where `source` tells
 * whether it was stored in users.json ("api") or in localStorage ("local").
 */
export const createUser = async function (user) {
  try {
    const response = await axios.post(`${USERS_API}/users`, user, {
      timeout: 4000,
    });
    return { user: response.data, source: "api" };
  } catch {
    const users = readLocalUsers();
    const nextId =
      users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1;
    const stored = { id: nextId, ...user };
    writeLocalUsers([...users, stored]);
    return { user: stored, source: "local" };
  }
};
