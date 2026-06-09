import { r as reactExports, u as useNavigate, j as jsxRuntimeExports, B as Box, h as brand, C as CircularProgress } from "./index-EstIw0RN.js";
import { S as SearchRoundedIcon } from "./SearchRounded-BjayBowh.js";
import { D as DinnerDiningRoundedIcon } from "./DinnerDiningRounded-DokMA8tQ.js";
import { S as StarRoundedIcon } from "./StarRounded-yGXFjJDP.js";
import { A as AppLayout } from "./AppLayout-DH-wOGjI.js";
import { f as foodService } from "./foodService-DCZ7hpOB.js";
import { C as Container } from "./index-BIPustA6.js";
import { T as Typography, I as IconButton } from "./Logo-DCDhUauE.js";
import { I as InputBase } from "./InputBase-e5CItqOA.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { G as Grid } from "./Grid-9uopkaoy.js";
import "./useFormControl-CRnBRMMH.js";
import "./isMuiElement-CVFCK7HK.js";
function FoodSearchPage() {
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [foods, setFoods] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [searched, setSearched] = reactExports.useState(false);
  const navigate = useNavigate();
  const loadAll = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const data = await foodService.getCustomerFoods();
      setFoods(data || []);
    } catch (err) {
      console.error(err);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    loadAll();
  }, [loadAll]);
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearched(true);
    setLoading(true);
    try {
      const data = searchQuery.trim() ? await foodService.searchFoods(searchQuery.trim()) : await foodService.getCustomerFoods();
      setFoods(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { pt: 2.5, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800, mb: 2 }, children: "Browse Caterers & Food" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        component: "form",
        onSubmit: handleSearch,
        sx: { display: "flex", gap: 1, mb: 3, maxWidth: 600 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Box,
            {
              sx: {
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: brand.white,
                border: `1px solid ${brand.border}`,
                borderRadius: 6,
                px: 2,
                "&:focus-within": { borderColor: brand.orange }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SearchRoundedIcon, { sx: { color: "text.secondary", fontSize: 20 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  InputBase,
                  {
                    fullWidth: true,
                    placeholder: "Search food, caterer…",
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                    sx: { py: 1.1, fontSize: "0.9rem" }
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              type: "submit",
              sx: {
                backgroundColor: brand.orange,
                borderRadius: 2,
                color: "white",
                "&:hover": { backgroundColor: "#d2680f" }
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchRoundedIcon, {})
            }
          )
        ]
      }
    ),
    searched && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "text.secondary", mb: 1.5 }, children: [
      foods.length,
      " result",
      foods.length !== 1 ? "s" : "",
      searchQuery ? ` for "${searchQuery}"` : ""
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) : foods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { sx: { p: 4, textAlign: "center", maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SearchRoundedIcon, { sx: { fontSize: 48, color: brand.border, mb: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { color: "text.secondary" }, children: "No results found" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: foods.map((food) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        onClick: () => navigate(`/customer/food/${food.foodId}`),
        sx: {
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.5,
          cursor: "pointer",
          transition: "transform 0.15s",
          "&:hover": { borderColor: brand.orange, transform: "translateY(-2px)" }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
            width: 64,
            height: 64,
            flexShrink: 0,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${brand.orangeLight}, #FFD0A0)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DinnerDiningRoundedIcon, { sx: { fontSize: 30, color: brand.orange, opacity: 0.8 } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700 }, noWrap: true, children: food.foodName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "text.secondary", display: "block" }, noWrap: true, children: [
              "By: ",
              food.catererName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(StarRoundedIcon, { sx: { fontSize: 14, color: brand.star } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { ml: 0.25 }, children: "4.8" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", sx: { fontWeight: 800, color: brand.orange }, children: [
                "₹",
                food.price
              ] })
            ] })
          ] })
        ]
      }
    ) }, food.foodId)) })
  ] }) });
}
export {
  FoodSearchPage as default
};
