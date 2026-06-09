import { j as jsxRuntimeExports, i as useParams, u as useNavigate, r as reactExports, B as Box, C as CircularProgress, h as brand } from "./index-EstIw0RN.js";
import { R as RemoveRoundedIcon, A as AddRoundedIcon } from "./RemoveRounded-FxQJ52z7.js";
import { A as ArrowBackRoundedIcon } from "./ArrowBackRounded-B6uNaBio.js";
import { e as createSvgIcon, u as useTheme, T as Typography, I as IconButton } from "./Logo-DCDhUauE.js";
import { D as DinnerDiningRoundedIcon } from "./DinnerDiningRounded-DokMA8tQ.js";
import { A as AccessTimeRoundedIcon } from "./AccessTimeRounded-D9UrkeMa.js";
import { D as DirectionsBikeRoundedIcon } from "./DirectionsBikeRounded-50JdC_x1.js";
import { f as foodService } from "./foodService-DCZ7hpOB.js";
import { o as orderService } from "./orderService-tS4cvTQf.js";
import { A as AppLayout } from "./AppLayout-DH-wOGjI.js";
import { u as useCustomerGeo } from "./geoUtils-BOmLn7Eh.js";
import { u as useMediaQuery, C as Container } from "./index-BIPustA6.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { T as TextField } from "./TextField-Bs3yYaqe.js";
import "./Select-4eHc_Vcc.js";
import "./InputBase-e5CItqOA.js";
import "./useFormControl-CRnBRMMH.js";
import "./isMuiElement-CVFCK7HK.js";
import "./Grow-BX3DzL8A.js";
import "./useControlled-Am1rG54b.js";
import "./InputLabel-DA7QQiD4.js";
const PersonPinRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l2.29 2.29c.39.39 1.02.39 1.41 0L15 20h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-7 3.3c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7S9.3 9.49 9.3 8s1.21-2.7 2.7-2.7M18 16H6v-.9c0-2 4-3.1 6-3.1s6 1.1 6 3.1z"
}));
function FoodDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customerCoords = useCustomerGeo();
  const [food, setFood] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [qty, setQty] = reactExports.useState(1);
  const [placing, setPlacing] = reactExports.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  reactExports.useEffect(() => {
    const fetchFood = async () => {
      try {
        setLoading(true);
        const data = await foodService.getFoodById(id, {
          customerLat: customerCoords?.lat,
          customerLng: customerCoords?.lng
        });
        setFood(data);
      } catch (err) {
        console.error("Error fetching food:", err);
        setError("Failed to load food details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFood();
  }, [id, customerCoords]);
  const increase = () => setQty((q) => Math.min(q + 1, 99));
  const decrease = () => setQty((q) => Math.max(q - 1, 1));
  const handleQtyChange = (e) => {
    const v = Number(e.target.value || 0);
    if (Number.isNaN(v)) return;
    setQty(Math.max(1, Math.min(99, Math.floor(v))));
  };
  const handlePlaceOrder = async () => {
    if (!food) return;
    setPlacing(true);
    setError("");
    try {
      await orderService.createOrder({
        items: [{ food_item_id: food.id, quantity: qty }],
        customer_lat: customerCoords?.lat,
        customer_lng: customerCoords?.lng
      });
      navigate("/customer/orders");
    } catch (err) {
      console.error("Place order failed:", err);
      setError(err?.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) });
  }
  if (error && !food) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "md", sx: { py: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", children: error }) }) });
  }
  if (!food) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "md", sx: { py: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: "Food not found." }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "md", sx: { py: isMobile ? 2 : 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBackRoundedIcon, {}),
        onClick: () => navigate(-1),
        sx: { mb: 2, color: brand.muted },
        children: "Back"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        sx: {
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          overflow: "hidden"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Box,
            {
              sx: {
                width: isMobile ? "100%" : "42%",
                minHeight: isMobile ? 220 : 320,
                background: `linear-gradient(135deg, ${brand.orangeLight}, #FFD0A0)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                DinnerDiningRoundedIcon,
                {
                  sx: { fontSize: isMobile ? 72 : 100, color: brand.orange, opacity: 0.6 }
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { flex: 1, p: { xs: 2.5, md: 3 } }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", component: "h1", sx: { fontWeight: 800, color: brand.dark }, children: food.food_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.75, mt: 0.75 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PersonPinRoundedIcon, { sx: { fontSize: 16, color: "text.secondary" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: [
                "By: ",
                food.caterer_name || "Premium Caterer"
              ] })
            ] }),
            food.estimatedDeliveryTime != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: {
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: "#E3F2FD",
                  border: "1px solid #BBDEFB"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.75 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DirectionsBikeRoundedIcon, { sx: { color: "#1565c0", fontSize: 20 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "#1565c0", fontWeight: 700, display: "block", lineHeight: 1.2 }, children: "Estimated Delivery" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { color: "#1565c0", fontWeight: 800 }, children: food.etaRange || `${food.estimatedDeliveryTime} mins` })
                    ] })
                  ] }),
                  food.distanceKm != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AccessTimeRoundedIcon, { sx: { color: "#1565c0", fontSize: 16 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "#1565c0" }, children: [
                      food.distanceKm,
                      " km away"
                    ] })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { mt: 2, color: "text.secondary", lineHeight: 1.7 }, children: food.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", sx: { mt: 3, mb: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", sx: { fontWeight: 900, color: brand.orange }, children: [
                "₹",
                food.price
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  IconButton,
                  {
                    onClick: decrease,
                    size: "small",
                    sx: {
                      backgroundColor: brand.orangeLight,
                      color: brand.orange,
                      "&:hover": { backgroundColor: "#fce4c8" }
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(RemoveRoundedIcon, { fontSize: "small" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    value: qty,
                    onChange: handleQtyChange,
                    inputProps: {
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      style: { textAlign: "center", width: 48, fontWeight: 700 }
                    },
                    size: "small",
                    sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  IconButton,
                  {
                    onClick: increase,
                    size: "small",
                    sx: {
                      backgroundColor: brand.orange,
                      color: "white",
                      "&:hover": { backgroundColor: "#d2680f" }
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(AddRoundedIcon, { fontSize: "small" })
                  }
                )
              ] })
            ] }),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "contained",
                size: "large",
                fullWidth: isMobile,
                onClick: handlePlaceOrder,
                disabled: placing,
                sx: { fontWeight: 700, px: 4, py: 1.25 },
                children: [
                  placing ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 18, sx: { color: "white", mr: 1 } }) : null,
                  "Place Order"
                ]
              }
            )
          ] })
        ]
      }
    )
  ] }) });
}
export {
  FoodDetailsPage as default
};
