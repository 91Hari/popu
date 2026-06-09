import { j as jsxRuntimeExports, B as Box, h as brand, u as useNavigate, r as reactExports, x as catererNotifService } from "./index-EstIw0RN.js";
import { A as AppLayout, h as AddCircleOutlineRoundedIcon, g as RestaurantMenuRoundedIcon, R as ReceiptLongRoundedIcon, N as NotificationsNoneRoundedIcon, L as ListItemButton, a as ListItemIcon, c as ListItemText, i as ListAltRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { A as AttachMoneyRoundedIcon } from "./AttachMoneyRounded-DnmDm0Qz.js";
import { e as createSvgIcon, T as Typography, f as List } from "./Logo-DCDhUauE.js";
import { F as FiberNewRoundedIcon } from "./FiberNewRounded-BVJzbOoC.js";
import { C as CheckCircleOutlineRoundedIcon } from "./CheckCircleOutlineRounded-_0GBG9Lh.js";
import { f as foodService } from "./foodService-DCZ7hpOB.js";
import { o as orderService } from "./orderService-tS4cvTQf.js";
import { c as catererService } from "./catererService-MNSLc32N.js";
import { C as CheckCircleRoundedIcon } from "./CheckCircleRounded-CLWxVan5.js";
import { P as PauseCircleRoundedIcon, A as AvailabilityToggle } from "./AvailabilityToggle-BRFmNg-x.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { D as Divider, C as Container } from "./index-BIPustA6.js";
import { S as Skeleton } from "./Skeleton-CIjyFMxR.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { G as Grid } from "./Grid-9uopkaoy.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import "./Switch-DcmvwebP.js";
import "./useFormControl-CRnBRMMH.js";
import "./useControlled-Am1rG54b.js";
import "./isMuiElement-CVFCK7HK.js";
const ArrowForwardRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M5 13h11.17l-4.88 4.88c-.39.39-.39 1.03 0 1.42s1.02.39 1.41 0l6.59-6.59c.39-.39.39-1.02 0-1.41l-6.58-6.6a.996.996 0 0 0-1.41 0c-.39.39-.39 1.02 0 1.41L16.17 11H5c-.55 0-1 .45-1 1s.45 1 1 1"
}));
function StatBox({ label, value, color, loading }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", flex: 1 }, children: [
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { width: 48, height: 36, sx: { mx: "auto" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 900, color: color || brand.orange, lineHeight: 1 }, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.secondary", fontWeight: 500 }, children: label })
  ] });
}
function WelcomeCard({ catererName, availabilityStatus, stats, loading }) {
  const isReady = availabilityStatus === "READY";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Box,
    {
      sx: {
        borderRadius: 3,
        background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
        color: "white",
        p: { xs: 2.5, md: 3 },
        mb: 3,
        position: "relative",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
          position: "absolute",
          right: -24,
          top: -24,
          width: 140,
          height: 140,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.1)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "flex-start", sx: { mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { opacity: 0.85, fontWeight: 600, letterSpacing: 1 }, children: "WELCOME BACK" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 900, lineHeight: 1.2, mt: 0.25 }, children: catererName || "Your Kitchen" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Box,
            {
              sx: {
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                backgroundColor: isReady ? "rgba(46,125,50,0.85)" : "rgba(0,0,0,0.25)",
                borderRadius: 6,
                px: 1.5,
                py: 0.5
              },
              children: [
                isReady ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleRoundedIcon, { sx: { fontSize: 14 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PauseCircleRoundedIcon, { sx: { fontSize: 14 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 700, fontSize: "0.7rem" }, children: isReady ? "READY FOR ORDERS" : "NOT READY" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { borderColor: "rgba(255,255,255,0.25)", mb: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", divider: /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { orientation: "vertical", flexItem: true, sx: { borderColor: "rgba(255,255,255,0.25)" } }), spacing: 1, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatBox, { label: "Today's Orders", value: loading ? "—" : stats?.todayOrders ?? 0, color: "white", loading }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatBox, { label: "Food Items", value: loading ? "—" : stats?.totalFoods ?? 0, color: "white", loading }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatBox, { label: "Pending", value: loading ? "—" : stats?.pendingOrders ?? 0, color: stats?.pendingOrders > 0 ? "#FFE082" : "white", loading })
        ] })
      ]
    }
  );
}
const STAT_CARDS = [
  { key: "foods", label: "Total Foods", hint: "Manage menu", href: "/caterer/foods", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantMenuRoundedIcon, { sx: { color: brand.orange, fontSize: 32 } }) },
  { key: "orders", label: "Total Orders", hint: "View all orders", href: "/caterer/orders", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ListAltRoundedIcon, { sx: { color: brand.orange, fontSize: 32 } }) },
  { key: "revenue", label: "Revenue", hint: "View orders", href: "/caterer/orders", prefix: "₹", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AttachMoneyRoundedIcon, { sx: { color: brand.orange, fontSize: 32 } }) }
];
function CatererDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = reactExports.useState({ foods: 0, orders: 0, revenue: 0 });
  const [welcomeStats, setWelcome] = reactExports.useState({ todayOrders: 0, totalFoods: 0, pendingOrders: 0 });
  const [availStatus, setAvailStatus] = reactExports.useState("READY");
  const [availLoading, setAvailLoad] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [notifs, setNotifs] = reactExports.useState([]);
  const [notifsLoading, setNotifsLoad] = reactExports.useState(false);
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const fetchAll = reactExports.useCallback(async () => {
    try {
      setLoading(true);
      const [allFoods, ordersData, availData] = await Promise.all([
        foodService.getFoods(),
        orderService.getOrders(),
        catererService.getMyAvailability()
      ]);
      const myFoods = (Array.isArray(allFoods) ? allFoods : []).filter((f) => f.caterer_id === user.id);
      const orders = Array.isArray(ordersData) ? ordersData : ordersData?.orders ?? [];
      const today = (/* @__PURE__ */ new Date()).toDateString();
      const todayOrd = orders.filter((o) => new Date(o.created_at).toDateString() === today).length;
      const pending = orders.filter((o) => o.status === "PLACED").length;
      let revenue = 0;
      orders.filter((o) => o.status === "DELIVERED").forEach((o) => {
        revenue += Number(o.total_amount || 0);
      });
      setStats({ foods: myFoods.length, orders: orders.length, revenue: revenue.toFixed(2) });
      setWelcome({ todayOrders: todayOrd, totalFoods: myFoods.length, pendingOrders: pending });
      setAvailStatus(availData?.availability_status || "READY");
    } catch (err) {
      console.error(err);
      setStats({ foods: 0, orders: 0, revenue: "0.00" });
    } finally {
      setLoading(false);
    }
  }, [user.id]);
  reactExports.useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const fetchNotifs = reactExports.useCallback(async () => {
    try {
      setNotifsLoad(true);
      const data = await catererNotifService.getNotifications();
      setNotifs((Array.isArray(data) ? data : []).slice(0, 5));
    } catch {
    } finally {
      setNotifsLoad(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 3e4);
    return () => clearInterval(id);
  }, [fetchNotifs]);
  const handleNotifClick = async (notif) => {
    try {
      await catererNotifService.markRead(notif.id);
    } catch {
    }
    const dest = notif.reference_id ? `/caterer/orders?highlight=${notif.reference_id}` : "/caterer/orders";
    navigate(dest);
  };
  const handleAvailChange = async (newStatus) => {
    setAvailLoad(true);
    setError("");
    try {
      const data = await catererService.setMyAvailability(newStatus);
      setAvailStatus(data.availability_status || newStatus);
    } catch {
      setError("Failed to update availability. Please try again.");
    } finally {
      setAvailLoad(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { pt: 3, pb: 4 }, children: [
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", onClose: () => setError(""), sx: { mb: 2 }, children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      WelcomeCard,
      {
        catererName: user.name,
        availabilityStatus: availStatus,
        stats: welcomeStats,
        loading
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      AvailabilityToggle,
      {
        status: availStatus,
        onChange: handleAvailChange,
        loading: availLoading
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 700, mb: 2 }, children: "Overview" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, sx: { mb: 4 }, children: STAT_CARDS.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        onClick: () => navigate(card.href),
        sx: {
          height: "100%",
          borderLeft: `4px solid ${brand.orange}`,
          cursor: "pointer",
          transition: "box-shadow 0.2s, transform 0.15s",
          "&:hover": { boxShadow: "0 6px 20px rgba(232,117,26,0.18)", transform: "translateY(-2px)" },
          "&:hover .stat-hint": { opacity: 1 }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { pb: "12px !important" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", sx: { mb: 1.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
              width: 52,
              height: 52,
              borderRadius: 2.5,
              backgroundColor: brand.orangeLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }, children: card.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", fontWeight: 500 }, children: card.label }),
              loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { width: 72, height: 32 }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", sx: { fontWeight: 900, lineHeight: 1.2 }, children: [
                card.prefix || "",
                stats[card.key]
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Stack,
            {
              className: "stat-hint",
              direction: "row",
              alignItems: "center",
              spacing: 0.5,
              sx: { opacity: 0, transition: "opacity 0.2s", color: brand.orange },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 600, color: brand.orange }, children: card.hint }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForwardRoundedIcon, { sx: { fontSize: 13 } })
              ]
            }
          )
        ] })
      }
    ) }, card.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 700, mb: 2 }, children: "Quick Actions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          size: "large",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddCircleOutlineRoundedIcon, {}),
          onClick: () => navigate("/caterer/add-food"),
          sx: { background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`, fontWeight: 700, px: 3 },
          children: "Add New Food"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          size: "large",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantMenuRoundedIcon, {}),
          onClick: () => navigate("/caterer/foods"),
          sx: { borderColor: brand.orange, color: brand.orange, fontWeight: 700, px: 3 },
          children: "Manage Menu"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          size: "large",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptLongRoundedIcon, {}),
          onClick: () => navigate("/caterer/orders"),
          sx: { borderColor: brand.orange, color: brand.orange, fontWeight: 700, px: 3 },
          children: "View Orders"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsNoneRoundedIcon, { sx: { color: brand.orange, fontSize: 22 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "Recent Notifications" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "small",
            variant: "text",
            onClick: () => navigate("/caterer/notifications"),
            sx: { color: brand.orange, fontWeight: 600, textTransform: "none" },
            children: "View all"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { border: `1px solid ${brand.border}`, borderRadius: 2 }, children: notifsLoading && notifs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: [1, 2].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 48, sx: { mb: 0.5 } }, k)) }) : notifs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineRoundedIcon, { sx: { fontSize: 40, color: brand.border, mb: 0.5 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: "All caught up!" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(List, { disablePadding: true, children: notifs.map((n, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ListItemButton,
          {
            onClick: () => handleNotifClick(n),
            sx: {
              px: 2,
              py: 1.25,
              backgroundColor: n.is_read ? "transparent" : "#FFF8F3",
              "&:hover": { backgroundColor: brand.orangeLight }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 36 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiberNewRoundedIcon, { sx: { color: n.is_read ? "text.disabled" : brand.orange, fontSize: 20 } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: n.is_read ? 400 : 700 }, noWrap: true, children: n.title }),
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
                  secondary: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.secondary" }, noWrap: true, children: n.message })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.disabled", ml: 1, whiteSpace: "nowrap" }, children: new Date(n.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) })
            ]
          }
        ),
        idx < notifs.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
      ] }, n.id)) }) })
    ] })
  ] }) });
}
export {
  CatererDashboard as default
};
