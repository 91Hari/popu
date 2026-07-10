import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// Track initialization state separately from "options set" so a failed load
// can be retried rather than silently returning stale state forever.
let _optionsSet  = false;
let _initPromise = null;

function _initOnce() {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    if (!API_KEY) throw new Error("VITE_GOOGLE_MAPS_API_KEY is not set");
    if (!_optionsSet) {
      setOptions({ apiKey: API_KEY, version: "weekly" });
      _optionsSet = true;
    }
  })();
  return _initPromise;
}

export async function ensureMapsInit(...libraries) {
  if (!API_KEY) return false;
  try {
    await _initOnce();
    if (libraries.length) {
      await Promise.all(libraries.map((lib) => importLibrary(lib)));
    }
    return true;
  } catch (err) {
    // Reset so the next caller can retry (e.g. after network comes back)
    _initPromise = null;
    console.error("[Maps] Failed to load Google Maps:", err?.message || err);
    return false;
  }
}

export { API_KEY };
