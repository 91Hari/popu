import { createContext, useCallback, useContext, useEffect, useState } from "react";
import notificationService from "../services/notificationService";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("token")) { setUnreadCount(0); return; }
    try {
      const data = await notificationService.getNotifications();
      const count = (data || []).filter((n) => !n.is_read).length;
      setUnreadCount(count);
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
    await notificationService.markRead(id);
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
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
