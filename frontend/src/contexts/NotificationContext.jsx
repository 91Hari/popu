import { createContext, useCallback, useContext, useEffect, useState } from "react";
import notificationService         from "../services/notificationService";
import catererNotificationService  from "../services/catererNotificationService";

const NotificationContext = createContext(null);

function getUserRole() {
  try { return JSON.parse(localStorage.getItem("user"))?.role || "customer"; } catch { return "customer"; }
}

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("token")) { setUnreadCount(0); return; }
    try {
      const role = getUserRole();
      if (role === "caterer") {
        const data = await catererNotificationService.getUnreadCount();
        setUnreadCount(data?.unread_count ?? 0);
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

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}
