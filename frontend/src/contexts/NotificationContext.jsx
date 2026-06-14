import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import notificationService         from "../services/notificationService";
import catererNotificationService  from "../services/catererNotificationService";
import { playOrderAlert }          from "../utils/notificationSound";

const NotificationContext = createContext(null);

function getUserRole() {
  try { return JSON.parse(localStorage.getItem("user"))?.role || "customer"; } catch { return "customer"; }
}

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [alertQueue,  setAlertQueue]  = useState([]);
  const [hasAlert,    setHasAlert]    = useState(false);
  const seenAlertIdsRef = useRef(new Set());

  // Load previously seen IDs from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("popu_alerted_notif_ids") || "[]");
      seenAlertIdsRef.current = new Set(saved);
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("token")) { setUnreadCount(0); return; }
    try {
      const role = getUserRole();
      if (role === "caterer") {
        const notifications = await catererNotificationService.getNotifications();
        const unread = (notifications || []).filter((n) => !n.is_read);
        setUnreadCount(unread.length);

        // Find new alert notifications (NEW_ORDER or ORDER_REMINDER) not yet alerted
        const alertTypes = ["NEW_ORDER", "ORDER_REMINDER"];
        const newAlerts = unread.filter(
          (n) => alertTypes.includes(n.notification_type) && !seenAlertIdsRef.current.has(n.id)
        );

        if (newAlerts.length > 0) {
          // Mark as alerted in memory + localStorage
          newAlerts.forEach((n) => seenAlertIdsRef.current.add(n.id));
          try {
            localStorage.setItem(
              "popu_alerted_notif_ids",
              JSON.stringify([...seenAlertIdsRef.current].slice(-200)) // cap at 200
            );
          } catch {}

          playOrderAlert();
          setHasAlert(true);
          setAlertQueue((prev) => [...prev, ...newAlerts]);

          // Auto-clear hasAlert after 3s (bell animation duration)
          setTimeout(() => setHasAlert(false), 3000);
        }
      } else {
        const data = await notificationService.getNotifications();
        setUnreadCount((data || []).filter((n) => !n.is_read).length);
      }
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const markRead = async (id) => {
    const role = getUserRole();
    if (role === "caterer") {
      await catererNotificationService.markRead(id);
    } else {
      await notificationService.markRead(id);
    }
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    const role = getUserRole();
    if (role === "caterer") {
      await catererNotificationService.markAllRead();
    } else {
      await notificationService.markAllRead();
    }
    setUnreadCount(0);
  };

  const dismissAlert = useCallback((id) => {
    setAlertQueue((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, refresh, markRead, markAllRead, alertQueue, dismissAlert, hasAlert }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}
