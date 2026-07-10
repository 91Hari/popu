import errorLogger from "./errorLogger";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 1000;

/**
 * Classify and throw a structured error from a non-OK response.
 * Sets window.__POPU_MAINTENANCE__ for 503 maintenance responses.
 */
async function throwClassifiedError(res) {
  let body = null;
  let message = res.statusText || "Request failed";

  try {
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
        message = body.message || body.error || message;
      } catch {
        message = text || message;
      }
    }
  } catch { /* ignore body parse failure */ }

  // Log non-2xx responses
  errorLogger.log("api", message, { status: res.status, url: res.url, body });

  if (res.status === 503 && body?.maintenance) {
    // Signal maintenance mode globally for NetworkContext to pick up
    if (typeof window !== "undefined") window.__POPU_MAINTENANCE__ = true;
    throw { type: "maintenance", status: 503, message: body.message || "Service unavailable" };
  }

  if (res.status === 401) {
    throw { type: "auth", status: 401, message: "Session expired. Please log in again." };
  }

  throw { type: "api", status: res.status, message };
}

/**
 * Core fetch wrapper with timeout, retry, and error classification.
 *
 * @param {string} path     — API path (e.g. "/foods")
 * @param {object} options  — fetch options
 * @param {number} retries  — number of retries on network errors (default 0)
 */
async function request(path, options = {}, retries = 0) {
  const headers = { ...(options.headers || {}) };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(BASE + path, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      await throwClassifiedError(res);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return res.json();
    return res.text();
  } catch (err) {
    clearTimeout(timeoutId);

    // If this is already a classified error object, rethrow immediately
    if (err && err.type) throw err;

    // AbortError from our own timeout or fetch network failure
    const isNetworkError =
      err?.name === "AbortError" ||
      err?.name === "TypeError" ||
      (err?.message && (
        err.message.includes("fetch") ||
        err.message.includes("network") ||
        err.message.includes("Failed to fetch")
      ));

    if (isNetworkError) {
      errorLogger.log("network", "Network request failed", { path, error: err?.message });

      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return request(path, options, retries - 1);
      }

      throw { type: "network", message: "No internet connection" };
    }

    // Unknown error
    throw { type: "api", status: 0, message: err?.message || "Unknown error" };
  }
}

export default { request };
