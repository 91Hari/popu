/**
 * CacheService — localStorage-based cache with TTL.
 * All keys are prefixed with "popu_cache_".
 * Silent on QuotaExceededError or any storage failures.
 */

const PREFIX = "popu_cache_";
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

function fullKey(key) {
  return `${PREFIX}${key}`;
}

/**
 * Store a value with a TTL.
 * @param {string} key
 * @param {*}      data   — must be JSON-serializable
 * @param {number} ttlMs  — time-to-live in milliseconds (default 5 min)
 */
function set(key, data, ttlMs = DEFAULT_TTL) {
  try {
    const entry = {
      data,
      expiresAt: Date.now() + ttlMs,
    };
    localStorage.setItem(fullKey(key), JSON.stringify(entry));
  } catch {
    // QuotaExceededError or other storage errors — silent
  }
}

/**
 * Retrieve a cached value.
 * @param {string} key
 * @returns {*} The stored data, or null if missing / expired
 */
function get(key) {
  try {
    const raw = localStorage.getItem(fullKey(key));
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(fullKey(key));
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Remove a specific cached entry.
 * @param {string} key
 */
function remove(key) {
  try {
    localStorage.removeItem(fullKey(key));
  } catch { /* silent */ }
}

/**
 * Clear all popu_cache_ prefixed entries from localStorage.
 */
function clear() {
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch { /* silent */ }
}

const cacheService = { set, get, remove, clear };
export default cacheService;
