import { j as jsxRuntimeExports, r as reactExports, z as useSearchParams, B as Box, C as CircularProgress, h as brand } from "./index-EstIw0RN.js";
import { A as AppLayout, R as ReceiptLongRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { C as CheckCircleOutlineRoundedIcon } from "./CheckCircleOutlineRounded-_0GBG9Lh.js";
import { e as createSvgIcon, u as useTheme, T as Typography, P as Paper } from "./Logo-DCDhUauE.js";
import { o as orderService } from "./orderService-tS4cvTQf.js";
import { u as useMediaQuery, C as Container, D as Divider } from "./index-BIPustA6.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-DAmX_BIX.js";
import { B as Button } from "./Button-DPTwUjxe.js";
const CancelOutlinedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z"
}));
const LocalDiningRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "m8.1 13.34 2.83-2.83-6.19-6.18c-.48-.48-1.31-.35-1.61.27-.71 1.49-.45 3.32.78 4.56zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27l-9.05 9.05c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L12 14.41l6.18 6.18c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L13.41 13z"
}));
const TaskAltRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "m21.29 5.89-10 10c-.39.39-1.02.39-1.41 0l-2.83-2.83a.996.996 0 0 1 0-1.41c.39-.39 1.02-.39 1.41 0l2.12 2.12 9.29-9.29c.39-.39 1.02-.39 1.41 0 .4.39.4 1.02.01 1.41m-5.52-3.15c-1.69-.69-3.61-.93-5.61-.57-4.07.73-7.32 4.01-8.01 8.08C1.01 17 6.63 22.78 13.34 21.91c3.96-.51 7.28-3.46 8.32-7.31.4-1.47.44-2.89.21-4.22-.13-.8-1.12-1.11-1.7-.54-.23.23-.33.57-.27.89.22 1.33.12 2.75-.52 4.26-1.16 2.71-3.68 4.7-6.61 4.97-5.1.47-9.33-3.85-8.7-8.98.43-3.54 3.28-6.42 6.81-6.91 1.73-.24 3.37.09 4.77.81.39.2.86.13 1.17-.18.48-.48.36-1.29-.24-1.6-.27-.12-.54-.25-.81-.36"
}));
const STATUS_MAP = {
  PLACED: { label: "Placed", color: "info" },
  ACCEPTED: { label: "Accepted", color: "primary" },
  PREPARING: { label: "Preparing", color: "warning" },
  DELIVERED: { label: "Delivered", color: "success" },
  CANCELLED: { label: "Cancelled", color: "default" }
};
function getActions(status, orderId, busy, onAction) {
  const btn = (label, newStatus, icon, color, bg) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      variant: color === "error" ? "outlined" : "contained",
      color: color === "error" ? "error" : void 0,
      size: "small",
      startIcon: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 12, color: "inherit" }) : icon,
      disabled: !!busy,
      onClick: () => onAction(orderId, newStatus),
      sx: {
        fontWeight: 600,
        fontSize: "0.75rem",
        ...bg ? { backgroundColor: bg, "&:hover": { backgroundColor: bg, filter: "brightness(0.9)" } } : {}
      },
      children: busy === newStatus ? "…" : label
    },
    newStatus
  );
  switch (status) {
    case "PLACED":
      return [
        btn("Accept", "ACCEPTED", /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineRoundedIcon, {}), null, brand.green),
        btn("Reject", "CANCELLED", /* @__PURE__ */ jsxRuntimeExports.jsx(CancelOutlinedIcon, {}), "error", null)
      ];
    case "ACCEPTED":
      return [
        btn("Start Preparing", "PREPARING", /* @__PURE__ */ jsxRuntimeExports.jsx(LocalDiningRoundedIcon, {}), null, brand.orange),
        btn("Cancel", "CANCELLED", /* @__PURE__ */ jsxRuntimeExports.jsx(CancelOutlinedIcon, {}), "error", null)
      ];
    case "PREPARING":
      return [
        btn("Mark Delivered", "DELIVERED", /* @__PURE__ */ jsxRuntimeExports.jsx(TaskAltRoundedIcon, {}), null, "#1976d2"),
        btn("Cancel", "CANCELLED", /* @__PURE__ */ jsxRuntimeExports.jsx(CancelOutlinedIcon, {}), "error", null)
      ];
    default:
      return null;
  }
}
function CatererOrdersPage() {
  const [orders, setOrders] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight") || "";
  const fetchOrders = reactExports.useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  const handleAction = reactExports.useCallback(async (orderId, newStatus) => {
    const prev = orders.find((o) => o.id === orderId);
    if (!prev) return;
    setBusy((b) => ({ ...b, [orderId]: newStatus }));
    setError("");
    setOrders((all) => all.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
    } catch (err) {
      setOrders((all) => all.map((o) => o.id === orderId ? { ...o, status: prev.status } : o));
      setError(
        err?.message?.includes("Cannot transition") ? `Cannot change status: ${err.message}` : "Failed to update order status. Please try again."
      );
    } finally {
      setBusy((b) => {
        const n = { ...b };
        delete n[orderId];
        return n;
      });
    }
  }, [orders]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5, mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptLongRoundedIcon, { sx: { color: brand.orange, fontSize: 28 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 800, color: brand.orange }, children: "Incoming Orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: "Manage and track all customer orders." })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", onClose: () => setError(""), sx: { mb: 2 }, children: error }),
    orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { elevation: 0, sx: { p: 4, textAlign: "center", border: `1px solid ${brand.border}` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptLongRoundedIcon, { sx: { fontSize: 56, color: brand.border, mb: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { color: "text.secondary" }, children: "No orders yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: "Incoming orders will appear here." })
    ] }) : isMobile ? (
      /* ─── Mobile cards ─── */
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, children: orders.map((order) => {
        const orderId = order.id;
        const items = Array.isArray(order.items) ? order.items : [];
        const amount = Number(order.total_amount || 0).toFixed(2);
        const statusKey = order.status || "PLACED";
        const actions = getActions(statusKey, orderId, busy[orderId], handleAction);
        const isHighlighted = highlightId && orderId === highlightId;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: {
          border: isHighlighted ? `2px solid ${brand.orange}` : `1px solid ${brand.border}`,
          backgroundColor: isHighlighted ? "#FFF3E0" : void 0
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 2, "&:last-child": { pb: 2 } }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "flex-start", sx: { mb: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", spacing: 0.75, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", sx: { fontWeight: 700 }, children: [
                  "#",
                  orderId.slice(0, 8).toUpperCase()
                ] }),
                isHighlighted && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: "NEW",
                    size: "small",
                    sx: {
                      height: 16,
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      backgroundColor: brand.orange,
                      color: "#fff",
                      borderRadius: 1
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: STATUS_MAP[statusKey]?.label || statusKey,
                color: STATUS_MAP[statusKey]?.color,
                size: "small",
                sx: { fontWeight: 700 }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 1 } }),
          items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 0.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
              it.food_name,
              " × ",
              it.quantity
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: [
              "₹",
              Number(it.total_price || 0).toFixed(2)
            ] })
          ] }, i)),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 1 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", sx: { fontWeight: 800, color: brand.orange }, children: [
              "Total ₹",
              amount
            ] }),
            actions && /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 0.75, children: actions })
          ] })
        ] }) }, orderId);
      }) })
    ) : (
      /* ─── Desktop table ─── */
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, elevation: 0, sx: { border: `1px solid ${brand.border}`, borderRadius: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { sx: { backgroundColor: brand.orangeLight }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Order #" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Items" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Date & Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontWeight: 700 }, children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 700 }, children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 700 }, children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: orders.map((order) => {
          const orderId = order.id;
          const items = Array.isArray(order.items) ? order.items : [];
          const amount = Number(order.total_amount || 0).toFixed(2);
          const statusKey = order.status || "PLACED";
          const actions = getActions(statusKey, orderId, busy[orderId], handleAction);
          const isHighlighted = highlightId && orderId === highlightId;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TableRow,
            {
              hover: true,
              sx: isHighlighted ? {
                backgroundColor: "#FFF3E0",
                outline: `2px solid ${brand.orange}`,
                outlineOffset: "-2px"
              } : {},
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { sx: { fontWeight: 600, fontFamily: "monospace", fontSize: "0.8rem" }, children: [
                  "#",
                  orderId.slice(0, 8).toUpperCase(),
                  isHighlighted && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: "NEW",
                      size: "small",
                      sx: {
                        ml: 0.75,
                        height: 16,
                        fontSize: "0.62rem",
                        fontWeight: 800,
                        backgroundColor: brand.orange,
                        color: "#fff",
                        borderRadius: 1
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, noWrap: true, children: it.food_name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: [
                    "Qty: ",
                    it.quantity,
                    " × ₹",
                    Number(it.unit_price || 0).toFixed(2)
                  ] })
                ] }, i)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontSize: "0.8rem", color: "text.secondary", whiteSpace: "nowrap" }, children: new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { align: "right", sx: { fontWeight: 700, color: brand.orange }, children: [
                  "₹",
                  amount
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: STATUS_MAP[statusKey]?.label || statusKey,
                    color: STATUS_MAP[statusKey]?.color,
                    size: "small",
                    sx: { fontWeight: 700 }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: actions ? /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 0.75, justifyContent: "center", children: actions }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.disabled" }, children: "—" }) })
              ]
            },
            orderId
          );
        }) })
      ] }) })
    )
  ] }) });
}
export {
  CatererOrdersPage as default
};
