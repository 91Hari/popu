/**
 * ErrorLogger — stores up to 50 error entries in localStorage.
 * Never throws; completely silent on any failure.
 */

const STORAGE_KEY = "popu_error_log";
const MAX_ENTRIES = 50;

/**
 * Log an error entry.
 * @param {'api'|'network'|'render'|'payment'} type
 * @param {string} message
 * @param {object} details
 */
function log(type, message, details = {}) {
  try {
    const logs = getLogs();
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      message: String(message),
      details,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.hash : "",
    };
    logs.unshift(entry); // newest first
    const trimmed = logs.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch { /* silent */ }
}

/**
 * Retrieve all stored log entries.
 * @returns {Array}
 */
function getLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

/**
 * Clear all stored log entries.
 */
function clearLogs() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* silent */ }
}

const errorLogger = { log, getLogs, clearLogs };
export default errorLogger;
