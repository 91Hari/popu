/**
 * NetworkService — singleton that monitors connectivity and server reachability.
 * Works in browser and Capacitor (no crashes if navigator.connection is absent).
 */

const HEALTH_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api")
  .replace(/\/api$/, "") + "/health";
const PING_TIMEOUT_MS = 5000;

class NetworkService {
  constructor() {
    this._online = typeof navigator !== "undefined" ? navigator.onLine : true;
    this._slow = false;
    this._subscribers = new Set();

    if (typeof window !== "undefined") {
      window.addEventListener("online",  this._handleOnline.bind(this));
      window.addEventListener("offline", this._handleOffline.bind(this));

      // Monitor connection quality (may not be available in all environments)
      try {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
          this._slow = this._isSlowType(conn.effectiveType);
          conn.addEventListener("change", () => {
            this._slow = this._isSlowType(conn.effectiveType);
            this._notify();
          });
        }
      } catch { /* ignore if not supported */ }
    }
  }

  _isSlowType(type) {
    return type === "slow-2g" || type === "2g" || type === "3g";
  }

  _handleOnline() {
    // navigator.onLine can lie — verify with an actual ping
    this._pingServer().then((reachable) => {
      this._online = reachable;
      this._notify();
    });
  }

  _handleOffline() {
    this._online = false;
    this._notify();
  }

  async _pingServer() {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
      const res = await fetch(HEALTH_URL, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);
      return res.ok || res.status < 500;
    } catch {
      return false;
    }
  }

  _notify() {
    const state = { online: this._online, slow: this._slow };
    this._subscribers.forEach((fn) => {
      try { fn(state); } catch { /* never let subscriber crash the service */ }
    });
  }

  /** Returns current online state synchronously */
  isOnline() {
    return this._online;
  }

  /** Returns true when connection is 3G or worse */
  isSlowNetwork() {
    return this._slow;
  }

  /**
   * Subscribe to network state changes.
   * @param {function} fn  Called with { online: boolean, slow: boolean }
   * @returns {function}   Call this to unsubscribe
   */
  subscribe(fn) {
    this._subscribers.add(fn);
    return () => this._subscribers.delete(fn);
  }
}

const networkService = new NetworkService();
export default networkService;
