import { j as jsxRuntimeExports, u as useNavigate, r as reactExports, B as Box, C as CircularProgress, h as brand } from "./index-EstIw0RN.js";
import { e as createSvgIcon, T as Typography } from "./Logo-DCDhUauE.js";
import { D as DinnerDiningRoundedIcon } from "./DinnerDiningRounded-DokMA8tQ.js";
import { A as AccessTimeRoundedIcon } from "./AccessTimeRounded-D9UrkeMa.js";
import { D as DirectionsBikeRoundedIcon } from "./DirectionsBikeRounded-50JdC_x1.js";
import { H as HourglassEmptyRoundedIcon } from "./HourglassEmptyRounded-BbPTmT4t.js";
import { o as orderService } from "./orderService-tS4cvTQf.js";
import { A as AppLayout } from "./AppLayout-DH-wOGjI.js";
import { f as formatArrivalTime, e as etaRange } from "./geoUtils-BOmLn7Eh.js";
import { C as Container, D as Divider } from "./index-BIPustA6.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-Bgs80M7L.js";
import { T as TextField } from "./TextField-Bs3yYaqe.js";
import "./Select-4eHc_Vcc.js";
import "./InputBase-e5CItqOA.js";
import "./useFormControl-CRnBRMMH.js";
import "./isMuiElement-CVFCK7HK.js";
import "./Grow-BX3DzL8A.js";
import "./useControlled-Am1rG54b.js";
import "./InputLabel-DA7QQiD4.js";
const Inventory2RoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2m-6 12h-4c-.55 0-1-.45-1-1s.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1m6-7H4V4h16z"
}));
const CancelRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m4.3 14.3c-.39.39-1.02.39-1.41 0L12 13.41 9.11 16.3c-.39.39-1.02.39-1.41 0a.996.996 0 0 1 0-1.41L10.59 12 7.7 9.11a.996.996 0 0 1 0-1.41c.39-.39 1.02-.39 1.41 0L12 10.59l2.89-2.89c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41L13.41 12l2.89 2.89c.38.38.38 1.02 0 1.41"
}));
const STATUS_CFG = {
  PLACED: { label: "Placed", color: "info", canCancel: true },
  ACCEPTED: { label: "Accepted", color: "primary", canCancel: true },
  PREPARING: { label: "Preparing", color: "warning", canCancel: false },
  DELIVERED: { label: "Delivered", color: "success", canCancel: false },
  CANCELLED: { label: "Cancelled", color: "default", canCancel: false }
};
function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [cancelId, setCancelId] = reactExports.useState(null);
  const [reason, setReason] = reactExports.useState("");
  const [cancelling, setCancelling] = reactExports.useState(false);
  const load = reactExports.useCallback(async () => {
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
    load();
  }, [load]);
  reactExports.useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);
  const handleCancelConfirm = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(cancelId, reason);
      setOrders((prev) => prev.map((o) => o.id === cancelId ? { ...o, ...updated } : o));
      setCancelId(null);
      setReason("");
    } catch (err) {
      setError(err?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "md", sx: { pt: 3, pb: 5 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5, mb: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Inventory2RoundedIcon, { sx: { color: brand.orange, fontSize: 26 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "My Bookings" })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", sx: { mb: 2 }, children: error }),
      orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { elevation: 0, sx: { p: 5, textAlign: "center", border: `1px solid ${brand.border}` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Inventory2RoundedIcon, { sx: { fontSize: 56, color: brand.border, mb: 1 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { color: "text.secondary" }, children: "No orders yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", mb: 2 }, children: "Your orders will appear here once placed." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: () => navigate("/services/tiffins"), children: "Browse Food" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, children: orders.map((order) => {
        const statusKey = order.status || "PLACED";
        const cfg = STATUS_CFG[statusKey] || { label: statusKey, color: "default", canCancel: false };
        const items = Array.isArray(order.items) ? order.items : [];
        const hasEta = order.eta_minutes != null;
        const isDone = statusKey === "DELIVERED" || statusKey === "CANCELLED";
        const arrival = order.expected_arrival_at ? formatArrivalTime(order.expected_arrival_at) : null;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { border: `1px solid ${brand.border}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 2, "&:last-child": { pb: 2 } }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "flex-start", sx: { mb: 1.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", sx: { fontWeight: 800, color: brand.orange }, children: [
                "Order #",
                order.id.slice(0, 8).toUpperCase()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: [
                "Placed: ",
                fmtDate(order.created_at),
                " · ",
                fmtTime(order.created_at)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: cfg.label, color: cfg.color, size: "small", sx: { fontWeight: 700 } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 1.5 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 0.75, sx: { mb: 1.5 }, children: items.map((it, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.25 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
              width: 36,
              height: 36,
              borderRadius: 1.5,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${brand.orangeLight}, #FFD0A0)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DinnerDiningRoundedIcon, { sx: { fontSize: 18, color: brand.orange, opacity: 0.7 } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: it.food_name || it.foodName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: [
                "Qty: ",
                it.quantity,
                " × ₹",
                Number(it.unit_price || 0).toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { fontWeight: 700, flexShrink: 0 }, children: [
              "₹",
              Number(it.total_price || 0).toFixed(2)
            ] })
          ] }, idx)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 1.25 } }),
          !isDone && (hasEta ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.25,
            p: 1,
            borderRadius: 1.5,
            backgroundColor: "#E3F2FD",
            border: "1px solid #BBDEFB"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.75 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DirectionsBikeRoundedIcon, { sx: { fontSize: 16, color: "#1565c0" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "#1565c0", fontWeight: 700, display: "block", lineHeight: 1.2 }, children: "Estimated Delivery" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "#1565c0" }, children: etaRange(order.eta_minutes) })
              ] })
            ] }),
            arrival && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "right" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "#1565c0", fontWeight: 700, display: "block", lineHeight: 1.2 }, children: "Expected Arrival" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.4, justifyContent: "flex-end" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AccessTimeRoundedIcon, { sx: { fontSize: 12, color: "#1565c0" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "#1565c0", fontWeight: 700 }, children: arrival })
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            mb: 1.25,
            p: 1,
            borderRadius: 1.5,
            backgroundColor: "#FFF8E1",
            border: "1px solid #FFE082"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(HourglassEmptyRoundedIcon, { sx: { fontSize: 15, color: "#F57F17" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "#F57F17", fontWeight: 600 }, children: "Estimated Delivery: Pending Caterer Acceptance" })
          ] })),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 900, color: brand.orange }, children: [
                "₹",
                Number(order.total_amount || 0).toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [
              cfg.canCancel && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "small",
                  variant: "outlined",
                  color: "error",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CancelRoundedIcon, { fontSize: "small" }),
                  onClick: () => {
                    setCancelId(order.id);
                    setReason("");
                  },
                  sx: { fontWeight: 600, fontSize: "0.78rem" },
                  children: "Cancel Order"
                }
              ),
              order.cancelled_at && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "text.disabled" }, children: [
                "Cancelled ",
                fmtDate(order.cancelled_at)
              ] })
            ] })
          ] })
        ] }) }, order.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: !!cancelId, onClose: () => !cancelling && setCancelId(null), maxWidth: "xs", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: { fontWeight: 700 }, children: "Cancel Order?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2, color: "text.secondary" }, children: "This action cannot be undone. Please provide a reason (optional)." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            size: "small",
            label: "Reason (optional)",
            value: reason,
            onChange: (e) => setReason(e.target.value),
            multiline: true,
            rows: 2
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { px: 3, pb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setCancelId(null), disabled: cancelling, children: "Keep Order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            color: "error",
            onClick: handleCancelConfirm,
            disabled: cancelling,
            startIcon: cancelling ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 14, color: "inherit" }) : null,
            children: "Yes, Cancel"
          }
        )
      ] })
    ] })
  ] });
}
export {
  OrdersPage as default
};
