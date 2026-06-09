import { u as useNavigate, k as useNotifications, r as reactExports, x as catererNotifService, j as jsxRuntimeExports, h as brand, B as Box, C as CircularProgress } from "./index-EstIw0RN.js";
import { A as AppLayout, N as NotificationsNoneRoundedIcon, L as ListItemButton, a as ListItemIcon, c as ListItemText } from "./AppLayout-DH-wOGjI.js";
import { F as FiberNewRoundedIcon } from "./FiberNewRounded-BVJzbOoC.js";
import { C as CheckCircleOutlineRoundedIcon } from "./CheckCircleOutlineRounded-_0GBG9Lh.js";
import { C as Container, D as Divider } from "./index-BIPustA6.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { T as Typography, f as List } from "./Logo-DCDhUauE.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
function CatererNotificationsPage() {
  const navigate = useNavigate();
  const { refresh } = useNotifications();
  const [notifs, setNotifs] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const fetchAll = reactExports.useCallback(async () => {
    try {
      const data = await catererNotifService.getNotifications();
      setNotifs(Array.isArray(data) ? data : []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const handleClick = async (notif) => {
    try {
      await catererNotifService.markRead(notif.id);
    } catch {
    }
    refresh();
    setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
    const dest = notif.reference_id ? `/caterer/orders?highlight=${notif.reference_id}` : "/caterer/orders";
    navigate(dest);
  };
  const handleMarkAll = async () => {
    try {
      await catererNotifService.markAllRead();
    } catch {
    }
    refresh();
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "sm", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1.5, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsNoneRoundedIcon, { sx: { color: brand.orange, fontSize: 28 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "Notifications" })
      ] }),
      notifs.some((n) => !n.is_read) && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "small",
          variant: "outlined",
          onClick: handleMarkAll,
          sx: { borderColor: brand.orange, color: brand.orange, fontWeight: 600, textTransform: "none" },
          children: "Mark all read"
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) : notifs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { elevation: 0, sx: { p: 4, textAlign: "center", border: `1px solid ${brand.border}` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineRoundedIcon, { sx: { fontSize: 56, color: brand.border, mb: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { color: "text.secondary" }, children: "All caught up!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: "No notifications yet." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { border: `1px solid ${brand.border}`, borderRadius: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { disablePadding: true, children: notifs.map((n, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        ListItemButton,
        {
          onClick: () => handleClick(n),
          sx: {
            px: 2,
            py: 1.5,
            backgroundColor: n.is_read ? "transparent" : "#FFF8F3",
            "&:hover": { backgroundColor: brand.orangeLight }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 36 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              FiberNewRoundedIcon,
              {
                sx: { color: n.is_read ? "text.disabled" : brand.orange, fontSize: 20 }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: n.is_read ? 400 : 700 }, children: n.title }),
                  !n.is_read && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: "NEW",
                      size: "small",
                      sx: {
                        height: 16,
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        backgroundColor: brand.orange,
                        color: "#fff",
                        borderRadius: 1
                      }
                    }
                  )
                ] }),
                secondary: n.message
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.disabled", ml: 1, whiteSpace: "nowrap" }, children: new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) })
          ]
        }
      ),
      idx < notifs.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
    ] }, n.id)) }) })
  ] }) });
}
export {
  CatererNotificationsPage as default
};
