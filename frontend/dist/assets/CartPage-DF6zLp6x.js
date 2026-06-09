import { j as jsxRuntimeExports, u as useNavigate, l as useCart, r as reactExports, B as Box, h as brand, C as CircularProgress } from "./index-EstIw0RN.js";
import { R as RemoveRoundedIcon, A as AddRoundedIcon } from "./RemoveRounded-FxQJ52z7.js";
import { e as createSvgIcon, T as Typography, P as Paper, I as IconButton } from "./Logo-DCDhUauE.js";
import { A as AppLayout, f as ShoppingCartRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { D as DinnerDiningRoundedIcon } from "./DinnerDiningRounded-DokMA8tQ.js";
import { A as AccessTimeRoundedIcon } from "./AccessTimeRounded-D9UrkeMa.js";
import { C as CheckCircleRoundedIcon } from "./CheckCircleRounded-CLWxVan5.js";
import { D as DirectionsBikeRoundedIcon } from "./DirectionsBikeRounded-50JdC_x1.js";
import { o as orderService } from "./orderService-tS4cvTQf.js";
import { u as useCustomerGeo, e as etaRange, f as formatArrivalTime, h as haversineKm, t as travelTimeMinutes } from "./geoUtils-BOmLn7Eh.js";
import { C as Container, D as Divider } from "./index-BIPustA6.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-Bgs80M7L.js";
const DeleteOutlineRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2zM9 9h6c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1v-8c0-.55.45-1 1-1m6.5-5-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z"
}));
const ShoppingCartCheckoutRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2m10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2m2-2c0-.55-.45-1-1-1H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03l3.24-6.14c.25-.48.08-1.08-.4-1.34-.49-.27-1.1-.08-1.36.41L15.55 11H8.53L4.54 2.57c-.16-.35-.52-.57-.9-.57H2c-.55 0-1 .45-1 1s.45 1 1 1h1l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11c.55 0 1-.45 1-1M11.29 2.71c.39-.39 1.02-.39 1.41 0l2.59 2.59c.39.39.39 1.02 0 1.41L12.7 9.3c-.39.39-1.02.39-1.41 0a.996.996 0 0 1 0-1.41l.88-.89H9c-.55 0-1-.45-1-1s.45-1 1-1h3.17l-.88-.88a.996.996 0 0 1 0-1.41"
}));
function itemEta(item, customerCoords) {
  if (!customerCoords) return null;
  const lat = item.caterer_latitude != null ? Number(item.caterer_latitude) : null;
  const lng = item.caterer_longitude != null ? Number(item.caterer_longitude) : null;
  if (lat == null || lng == null) return null;
  const dist = haversineKm(customerCoords.lat, customerCoords.lng, lat, lng);
  const travel = travelTimeMinutes(dist);
  const prep = item.preparation_time_minutes || 20;
  return prep + travel;
}
function CartPage() {
  const navigate = useNavigate();
  const customerCoords = useCustomerGeo();
  const { items, total, cartCount, updateQty, removeFromCart, clearCart, loading } = useCart();
  const [checkingOut, setCheckingOut] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [confirmation, setConfirmation] = reactExports.useState(null);
  const itemsWithEta = reactExports.useMemo(
    () => items.map((i) => ({ ...i, _eta: itemEta(i, customerCoords) })),
    [items, customerCoords]
  );
  const overallEta = reactExports.useMemo(() => {
    const etaValues = itemsWithEta.map((i) => i._eta).filter((v) => v != null);
    return etaValues.length > 0 ? Math.max(...etaValues) : null;
  }, [itemsWithEta]);
  const expectedArrival = reactExports.useMemo(() => {
    if (!overallEta) return null;
    const d = new Date(Date.now() + overallEta * 6e4);
    return d;
  }, [overallEta]);
  const handleCheckout = async () => {
    if (!items.length) return;
    setCheckingOut(true);
    setError("");
    try {
      const order = await orderService.createOrder({
        items: items.map((i) => ({ food_item_id: i.food_item_id, quantity: i.quantity })),
        customer_lat: customerCoords?.lat,
        customer_lng: customerCoords?.lng
      });
      await clearCart();
      const eta = order?.eta_minutes ?? overallEta;
      const arrival = order?.expected_arrival_at ?? expectedArrival;
      setConfirmation({ etaMinutes: eta, expectedArrivalAt: arrival });
    } catch (err) {
      setError(err?.message || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };
  const handleConfirmClose = () => {
    setConfirmation(null);
    navigate("/customer/orders");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "md", sx: { pt: 3, pb: 5 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5, mb: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCartRoundedIcon, { sx: { color: brand.orange, fontSize: 26 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "Your Cart" }),
          cartCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: [
            cartCount,
            " item",
            cartCount !== 1 ? "s" : ""
          ] })
        ] })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }),
      loading && !items.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { elevation: 0, sx: { p: 6, textAlign: "center", border: `1px solid ${brand.border}`, borderRadius: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCartRoundedIcon, { sx: { fontSize: 64, color: brand.border, mb: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { color: "text.secondary", mb: 1 }, children: "Your cart is empty" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", mb: 3 }, children: "Browse food items and add them to your cart." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: () => navigate("/services/tiffins"), children: "Browse Food" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { elevation: 0, sx: { border: `1px solid ${brand.border}`, borderRadius: 3, overflow: "hidden" }, children: itemsWithEta.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, p: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Box,
              {
                sx: {
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  flexShrink: 0,
                  background: item.image_url ? `url(${item.image_url}) center/cover no-repeat` : `linear-gradient(135deg, ${brand.orangeLight}, #FFD0A0)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                },
                children: !item.image_url && /* @__PURE__ */ jsxRuntimeExports.jsx(DinnerDiningRoundedIcon, { sx: { fontSize: 28, color: brand.orange, opacity: 0.7 } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700 }, noWrap: true, children: item.food_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.secondary", display: "block" }, noWrap: true, children: item.caterer_name }),
              item._eta != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.4, mt: 0.25 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AccessTimeRoundedIcon, { sx: { fontSize: 11, color: "#1565c0" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "#1565c0", fontWeight: 600, fontSize: "0.65rem" }, children: etaRange(item._eta) })
              ] }),
              !item.is_available && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Unavailable", size: "small", color: "default", sx: { height: 18, fontSize: "0.6rem", mt: 0.5 } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", sx: { fontWeight: 800, color: brand.orange, flexShrink: 0, minWidth: 64, textAlign: "right" }, children: [
              "₹",
              (Number(item.price) * item.quantity).toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  onClick: () => updateQty(item.id, item.quantity - 1),
                  sx: { width: 28, height: 28, backgroundColor: brand.orangeLight, color: brand.orange },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(RemoveRoundedIcon, { fontSize: "small" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 700, minWidth: 24, textAlign: "center" }, children: item.quantity }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  onClick: () => updateQty(item.id, item.quantity + 1),
                  sx: { width: 28, height: 28, backgroundColor: brand.orange, color: "white" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(AddRoundedIcon, { fontSize: "small" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                onClick: () => removeFromCart(item.id),
                sx: { color: "text.disabled", "&:hover": { color: "error.main" }, flexShrink: 0 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteOutlineRoundedIcon, { fontSize: "small" })
              }
            )
          ] }),
          idx < itemsWithEta.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
        ] }, item.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { elevation: 0, sx: { border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700, mb: 1.5 }, children: "Order Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 0.75, children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "text.secondary" }, noWrap: true, children: [
              item.food_name,
              " × ",
              item.quantity
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { flexShrink: 0, ml: 1 }, children: [
              "₹",
              (Number(item.price) * item.quantity).toFixed(2)
            ] })
          ] }, item.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 1.5 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 800 }, children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 900, color: brand.orange }, children: [
              "₹",
              Number(total).toFixed(2)
            ] })
          ] }),
          overallEta != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Box,
            {
              sx: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                p: 1.25,
                borderRadius: 1.5,
                backgroundColor: "#E3F2FD",
                border: "1px solid #BBDEFB"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DirectionsBikeRoundedIcon, { sx: { color: "#1565c0", fontSize: 18 } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 700, color: "#1565c0", display: "block", lineHeight: 1.2 }, children: "Estimated Delivery" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "#1565c0" }, children: etaRange(overallEta) })
                  ] })
                ] }),
                expectedArrival && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { fontWeight: 700, color: "#1565c0" }, children: [
                  "By ",
                  formatArrivalTime(expectedArrival)
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              fullWidth: true,
              variant: "contained",
              size: "large",
              startIcon: checkingOut ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 18, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCartCheckoutRoundedIcon, {}),
              onClick: handleCheckout,
              disabled: checkingOut || !items.length,
              sx: { fontWeight: 700, py: 1.25 },
              children: checkingOut ? "Placing Order…" : "Checkout"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: !!confirmation, onClose: handleConfirmClose, maxWidth: "xs", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { sx: { textAlign: "center", pt: 3, pb: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleRoundedIcon, { sx: { fontSize: 52, color: "#4caf50", mb: 1, display: "block", mx: "auto" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 800 }, children: "Order Placed!" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { sx: { textAlign: "center", px: 3 }, children: confirmation?.etaMinutes != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 1.5, alignItems: "center", sx: { py: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 1.5, borderRadius: 2, backgroundColor: "#E3F2FD", width: "100%" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "#1565c0", fontWeight: 600, display: "block" }, children: "Estimated Delivery" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 900, color: "#1565c0" }, children: etaRange(confirmation.etaMinutes) })
        ] }),
        confirmation.expectedArrivalAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 1.5, borderRadius: 2, backgroundColor: brand.orangeLight, width: "100%" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: brand.orange, fontWeight: 600, display: "block" }, children: "Expected Arrival" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 900, color: brand.orange }, children: formatArrivalTime(confirmation.expectedArrivalAt) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", py: 1 }, children: "Your order has been placed successfully." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActions, { sx: { px: 3, pb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { fullWidth: true, variant: "contained", onClick: handleConfirmClose, sx: { fontWeight: 700 }, children: "View My Orders" }) })
    ] })
  ] });
}
export {
  CartPage as default
};
