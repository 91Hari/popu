import { j as jsxRuntimeExports, r as reactExports, u as useNavigate, f as api, B as Box, h as brand, C as CircularProgress } from "./index-EstIw0RN.js";
import { R as RestaurantRoundedIcon } from "./RestaurantRounded-gKpdzxDS.js";
import { L as ListItemButton, a as ListItemIcon, b as LunchDiningRoundedIcon, c as ListItemText, S as StorefrontRoundedIcon, A as AppLayout, H as HomeRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { P as PeopleAltRoundedIcon } from "./PeopleAltRounded-D7_mpwkS.js";
import { S as SchoolRoundedIcon } from "./SchoolRounded-DGhAujcv.js";
import { D as DinnerDiningRoundedIcon } from "./DinnerDiningRounded-DokMA8tQ.js";
import { e as createSvgIcon, P as Paper, f as List, T as Typography } from "./Logo-DCDhUauE.js";
import { F as FoodCard } from "./FoodCard-CyXU-3br.js";
import { S as SearchRoundedIcon } from "./SearchRounded-BjayBowh.js";
import { I as InputBase } from "./InputBase-e5CItqOA.js";
import { D as Divider, C as Container } from "./index-BIPustA6.js";
import { f as foodService } from "./foodService-DCZ7hpOB.js";
import { u as useCustomerGeo } from "./geoUtils-BOmLn7Eh.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import { G as Grid } from "./Grid-9uopkaoy.js";
import "./AccessTimeRounded-D9UrkeMa.js";
import "./Card-XJvyk6-3.js";
import "./useControlled-Am1rG54b.js";
import "./Grow-BX3DzL8A.js";
import "./Chip-yjaeJ34r.js";
import "./useFormControl-CRnBRMMH.js";
import "./isMuiElement-CVFCK7HK.js";
const RocketLaunchRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89l-2.26-.97c-.65-.28-.81-1.13-.31-1.63l3.01-3.01c.47-.47 1.15-.68 1.81-.55zm1.49 10.16c.3.3.74.38 1.12.2 1.16-.54 3.65-1.81 5.26-3.42 4.59-4.59 4.63-8.33 4.36-9.93-.07-.4-.39-.72-.79-.79-1.6-.27-5.34-.23-9.93 4.36-1.61 1.61-2.87 4.1-3.42 5.26-.18.38-.09.83.2 1.12zm6.97-1.7c-2.29 2.04-5.58 3.44-5.89 3.57l.97 2.26c.28.65 1.13.81 1.63.31l3.01-3.01c.47-.47.68-1.15.55-1.81zm-8.71 2.6c.2 1.06-.15 2.04-.82 2.71-.77.77-3.16 1.34-4.71 1.64-.69.13-1.3-.48-1.17-1.17.3-1.55.86-3.94 1.64-4.71.67-.67 1.65-1.02 2.71-.82 1.17.22 2.13 1.18 2.35 2.35M13 9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2"
}));
function useDebounce(value, delay) {
  const [debounced, setDebounced] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
function SearchSuggestions({ placeholder = "Search food, caterers…", onSearch, fullWidth = false }) {
  const [query, setQuery] = reactExports.useState("");
  const [suggestions, setSuggestions] = reactExports.useState({ foods: [], caterers: [] });
  const [open, setOpen] = reactExports.useState(false);
  const [fetching, setFetching] = reactExports.useState(false);
  const navigate = useNavigate();
  const containerRef = reactExports.useRef(null);
  const debouncedQuery = useDebounce(query, 250);
  const fetchSuggestions = reactExports.useCallback(async (q) => {
    if (!q || q.trim().length < 1) {
      setSuggestions({ foods: [], caterers: [] });
      setOpen(false);
      return;
    }
    setFetching(true);
    try {
      const data = await api.request(`/search/suggestions?q=${encodeURIComponent(q.trim())}`);
      setSuggestions(data || { foods: [], caterers: [] });
      setOpen(true);
    } catch {
      setSuggestions({ foods: [], caterers: [] });
    } finally {
      setFetching(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);
  reactExports.useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const handleSelect = (item) => {
    setOpen(false);
    setQuery(item.label);
    if (item.type === "food") {
      navigate(`/services/tiffins?foodName=${encodeURIComponent(item.label)}`);
    } else {
      navigate(`/services/catering?search=${encodeURIComponent(item.label)}`);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    if (onSearch) onSearch(query);
    else if (query.trim()) navigate(`/customer/search?q=${encodeURIComponent(query.trim())}`);
  };
  const hasResults = suggestions.foods.length > 0 || suggestions.caterers.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { ref: containerRef, sx: { position: "relative", width: fullWidth ? "100%" : "auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        component: "form",
        onSubmit: handleSubmit,
        sx: {
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: brand.white,
          border: `1.5px solid ${open ? brand.orange : brand.border}`,
          borderRadius: 6,
          px: 2,
          transition: "border-color 0.15s",
          "&:focus-within": { borderColor: brand.orange }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SearchRoundedIcon, { sx: { color: "text.secondary", fontSize: 20, flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            InputBase,
            {
              fullWidth: true,
              placeholder,
              value: query,
              onChange: (e) => setQuery(e.target.value),
              onFocus: () => {
                if (hasResults) setOpen(true);
              },
              sx: { py: 1.1, fontSize: "0.9rem" },
              inputProps: { autoComplete: "off" }
            }
          ),
          fetching && /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, sx: { color: brand.orange, flexShrink: 0 } })
        ]
      }
    ),
    open && hasResults && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Paper,
      {
        elevation: 8,
        sx: {
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          right: 0,
          zIndex: 1300,
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${brand.border}`,
          maxHeight: 360,
          overflowY: "auto"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { disablePadding: true, children: [
          suggestions.foods.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { px: 2, pt: 1, pb: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 700, color: brand.muted, textTransform: "uppercase", letterSpacing: 0.5 }, children: "Food Items" }) }),
            suggestions.foods.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItemButton, { onClick: () => handleSelect(item), sx: { py: 0.75, px: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LunchDiningRoundedIcon, { sx: { fontSize: 18, color: brand.orange } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: item.label,
                  secondary: `By ${item.caterer_name} · ₹${item.price}`,
                  primaryTypographyProps: { fontSize: "0.88rem", fontWeight: 600 },
                  secondaryTypographyProps: { fontSize: "0.75rem" }
                }
              ),
              item.availability_status === "NOT_READY" && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.disabled", flexShrink: 0 }, children: "Unavailable" })
            ] }, item.id))
          ] }),
          suggestions.foods.length > 0 && suggestions.caterers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
          suggestions.caterers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { px: 2, pt: 1, pb: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 700, color: brand.muted, textTransform: "uppercase", letterSpacing: 0.5 }, children: "Caterers" }) }),
            suggestions.caterers.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItemButton, { onClick: () => handleSelect(item), sx: { py: 0.75, px: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StorefrontRoundedIcon, { sx: { fontSize: 18, color: brand.muted } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: item.label,
                  secondary: item.location || item.business_name,
                  primaryTypographyProps: { fontSize: "0.88rem", fontWeight: 600 },
                  secondaryTypographyProps: { fontSize: "0.75rem" }
                }
              )
            ] }, item.id))
          ] })
        ] })
      }
    )
  ] });
}
const CATEGORIES = [
  { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantRoundedIcon, { sx: { fontSize: 26, color: brand.orange } }), label: "Catering", to: "/services/catering" },
  { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LunchDiningRoundedIcon, { sx: { fontSize: 26, color: brand.orange } }), label: "Tiffins", to: "/services/tiffins" },
  { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleAltRoundedIcon, { sx: { fontSize: 26, color: brand.muted } }), label: "Book Cook", to: "/services/book-cook" },
  { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HomeRoundedIcon, { sx: { fontSize: 26, color: brand.muted } }), label: "Home Food", to: "/services/home-food" },
  { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SchoolRoundedIcon, { sx: { fontSize: 26, color: brand.muted } }), label: "Training", to: "/services/training" }
];
function CustomerDashboard() {
  const [foods, setFoods] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const navigate = useNavigate();
  const customerCoords = useCustomerGeo();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();
  const firstName = (user.name || "there").split(" ")[0];
  const fetchFoods = reactExports.useCallback(async (coords) => {
    try {
      setLoading(true);
      const geo = coords || customerCoords;
      const data = await foodService.getCustomerFoods({ customerLat: geo?.lat, customerLng: geo?.lng });
      setFoods((data || []).slice(0, 12));
    } catch {
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, [customerCoords]);
  reactExports.useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { pt: 2.5, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 2.5 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", sx: { fontWeight: 800, lineHeight: 1.2 }, children: [
        "Hi, ",
        firstName
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", mt: 0.25 }, children: "What would you like today?" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 3, maxWidth: 600 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchSuggestions, { placeholder: "Search for catering, tiffins, cooks…", fullWidth: true }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        sx: {
          backgroundColor: brand.orange,
          color: "white",
          borderRadius: 4,
          p: { xs: 2.5, md: 4 },
          mb: 3.5,
          backgroundImage: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          overflow: "hidden",
          position: "relative"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { position: "relative", zIndex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", sx: { fontWeight: 800, lineHeight: 1.2, mb: 0.5 }, children: [
              "Healthy Food",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "For Every Occasion"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { opacity: 0.85, mb: 2 }, children: "pure · fresh · trusted" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => navigate("/services"),
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RocketLaunchRoundedIcon, {}),
                sx: {
                  backgroundColor: "white",
                  color: brand.orange,
                  fontWeight: 700,
                  px: 3,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" }
                },
                children: "Explore Now"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DinnerDiningRoundedIcon,
            {
              sx: { fontSize: { xs: 60, md: 100 }, opacity: 0.18, display: { xs: "none", sm: "block" }, flexShrink: 0 }
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 800, mb: 1.5 }, children: "Our Services" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Box,
      {
        sx: {
          display: "flex",
          gap: { xs: 1, md: 2 },
          mb: 3.5,
          overflowX: "auto",
          pb: 0.5,
          "&::-webkit-scrollbar": { display: "none" }
        },
        children: CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Box,
          {
            onClick: () => navigate(cat.to),
            sx: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.75,
              cursor: "pointer",
              flexShrink: 0,
              minWidth: { xs: 72, md: 90 }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Box,
                {
                  sx: {
                    width: { xs: 56, md: 68 },
                    height: { xs: 56, md: 68 },
                    borderRadius: 3,
                    backgroundColor: brand.orangeLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background-color 0.15s, transform 0.15s",
                    "&:hover": { backgroundColor: "#fce4c8", transform: "translateY(-3px)" }
                  },
                  children: cat.icon
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 600, textAlign: "center", lineHeight: 1.2, fontSize: { md: "0.78rem" } }, children: cat.label })
            ]
          },
          cat.label
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 800, mb: 1.5 }, children: "Recommended For You" }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) : foods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DinnerDiningRoundedIcon, { sx: { fontSize: 48, color: brand.border, mb: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: "No food items available right now." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: foods.map((food) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, sm: 4, md: 3, lg: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      FoodCard,
      {
        food,
        onClick: () => navigate(`/customer/food/${food.foodId || food.id}`)
      }
    ) }, food.foodId || food.id)) })
  ] }) });
}
export {
  CustomerDashboard as default
};
