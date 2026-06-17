import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
let _ready = false;

export async function ensureMapsInit(...libraries) {
  if (!API_KEY) return false;
  if (!_ready) {
    setOptions({ apiKey: API_KEY, version: "weekly" });
    _ready = true;
  }
  if (libraries.length) {
    await Promise.all(libraries.map((lib) => importLibrary(lib)));
  }
  return true;
}

export { API_KEY };
