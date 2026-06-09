import { j as jsxRuntimeExports, r as reactExports, k as useNotifications, n as notificationService, B as Box, C as CircularProgress, h as brand } from "./index-EstIw0RN.js";
import { e as createSvgIcon, T as Typography, P as Paper, f as List } from "./Logo-DCDhUauE.js";
import { A as AppLayout, a as ListItemIcon, c as ListItemText } from "./AppLayout-DH-wOGjI.js";
import { C as Container, D as Divider } from "./index-BIPustA6.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { L as ListItem } from "./ListItem--KqQhZmu.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import "./isMuiElement-CVFCK7HK.js";
const NotificationsRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2m6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29c-.63.63-.19 1.71.7 1.71h13.17c.89 0 1.34-1.08.71-1.71z"
}));
const NotificationsActiveRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M18 16v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.68-1.5-1.51-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-1.3 1.29c-.63.63-.19 1.71.7 1.71h13.17c.89 0 1.34-1.08.71-1.71zm-6.01 6c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2M6.77 4.73c.42-.38.43-1.03.03-1.43-.38-.38-1-.39-1.39-.02C3.7 4.84 2.52 6.96 2.14 9.34c-.09.61.38 1.16 1 1.16.48 0 .9-.35.98-.83.3-1.94 1.26-3.67 2.65-4.94M18.6 3.28c-.4-.37-1.02-.36-1.4.02-.4.4-.38 1.04.03 1.42 1.38 1.27 2.35 3 2.65 4.94.07.48.49.83.98.83.61 0 1.09-.55.99-1.16-.38-2.37-1.55-4.48-3.25-6.05"
}));
const DoneAllRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M17.3 6.3a.996.996 0 0 0-1.41 0l-5.64 5.64 1.41 1.41L17.3 7.7c.38-.38.38-1.02 0-1.4m4.24-.01-9.88 9.88-3.48-3.47a.996.996 0 0 0-1.41 0c-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L22.95 7.71c.39-.39.39-1.02 0-1.41h-.01c-.38-.4-1.01-.4-1.4-.01M1.12 14.12 5.3 18.3c.39.39 1.02.39 1.41 0l.7-.7-4.88-4.9a.996.996 0 0 0-1.41 0c-.39.39-.39 1.03 0 1.42"
}));
function NotificationsPage() {
  const [notifications, setNotifications] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const { refresh: refreshCount } = useNotifications();
  const load = reactExports.useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  const handleMarkRead = async (id) => {
    setNotifications(
      (prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
    );
    try {
      await notificationService.markRead(id);
      refreshCount();
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };
  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationService.markAllRead();
      refreshCount();
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "md", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsActiveRoundedIcon, { sx: { color: brand.orange, fontSize: 28 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "Notifications" }),
          unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: [
            unreadCount,
            " unread"
          ] })
        ] })
      ] }),
      unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "small",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DoneAllRoundedIcon, {}),
          onClick: handleMarkAllRead,
          sx: { color: brand.orange, fontWeight: 600 },
          children: "Mark all read"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", sx: { mb: 2 }, children: error }),
    notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        elevation: 0,
        sx: { p: 5, textAlign: "center", border: `1px solid ${brand.border}`, borderRadius: 2 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsRoundedIcon, { sx: { fontSize: 56, color: brand.border, mb: 1 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { color: "text.secondary" }, children: "No notifications yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", mt: 0.5 }, children: "When caterers add new food items, you'll see updates here." })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      Paper,
      {
        elevation: 0,
        sx: { border: `1px solid ${brand.border}`, borderRadius: 2, overflow: "hidden" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { disablePadding: true, children: notifications.map((n, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            ListItem,
            {
              alignItems: "flex-start",
              sx: {
                py: 2,
                px: 2.5,
                backgroundColor: n.is_read ? "transparent" : `${brand.orangeLight}`,
                cursor: n.is_read ? "default" : "pointer",
                "&:hover": { backgroundColor: n.is_read ? "action.hover" : "#fce4d0" }
              },
              onClick: () => !n.is_read && handleMarkRead(n.id),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 36, mt: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  NotificationsRoundedIcon,
                  {
                    sx: { fontSize: 20, color: n.is_read ? "text.disabled" : brand.orange }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", gap: 1, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: n.is_read ? 500 : 700 }, children: n.title }),
                      !n.is_read && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "New", size: "small", sx: { height: 18, fontSize: 10, backgroundColor: brand.orange, color: "white" } })
                    ] }),
                    secondary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", mt: 0.25 }, children: n.message }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.disabled", mt: 0.5, display: "block" }, children: n.created_at ? new Date(n.created_at).toLocaleString() : "" })
                    ] })
                  }
                )
              ]
            }
          ),
          idx < notifications.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
        ] }, n.id)) })
      }
    )
  ] }) });
}
export {
  NotificationsPage as default
};
