import { i as useParams, u as useNavigate, r as reactExports, j as jsxRuntimeExports, h as brand, B as Box, C as CircularProgress, f as api } from "./index-EstIw0RN.js";
import { A as ArrowBackRoundedIcon } from "./ArrowBackRounded-B6uNaBio.js";
import { L as LocationOnRoundedIcon } from "./LocationOnRounded-DboijKjd.js";
import { A as AppLayout, g as RestaurantMenuRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { D as DirectionsBikeRoundedIcon } from "./DirectionsBikeRounded-50JdC_x1.js";
import { A as AccessTimeRoundedIcon } from "./AccessTimeRounded-D9UrkeMa.js";
import { F as FoodCard } from "./FoodCard-CyXU-3br.js";
import { u as useCustomerGeo, h as haversineKm, a as formatDistance, b as formatEta, c as etaMinutes } from "./geoUtils-BOmLn7Eh.js";
import { C as Container } from "./index-BIPustA6.js";
import { I as IconButton, P as Paper, T as Typography } from "./Logo-DCDhUauE.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import { G as Grid } from "./Grid-9uopkaoy.js";
import "./DinnerDiningRounded-DokMA8tQ.js";
import "./Card-XJvyk6-3.js";
import "./useControlled-Am1rG54b.js";
import "./Grow-BX3DzL8A.js";
import "./Button-DPTwUjxe.js";
import "./isMuiElement-CVFCK7HK.js";
function CatererDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customerCoords = useCustomerGeo();
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  reactExports.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.request(`/caterers/${id}/foods`);
        setData(res);
      } catch (err) {
        setError(err?.message || "Failed to load caterer.");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);
  const caterer = data?.caterer;
  const foods = data?.foods || [];
  const available = foods.filter((f) => f.is_available);
  const unavailable = foods.filter((f) => !f.is_available);
  const hasDistance = customerCoords && caterer?.latitude != null && caterer?.longitude != null;
  const distKm = hasDistance ? haversineKm(customerCoords.lat, customerCoords.lng, Number(caterer.latitude), Number(caterer.longitude)) : null;
  const eta = distKm != null ? etaMinutes(distKm) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { pt: 3, pb: 5 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => navigate("/services/catering"), sx: { color: brand.muted, mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBackRoundedIcon, {}) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", sx: { mb: 2 }, children: error }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) : !caterer ? /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: "Caterer not found." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Paper,
        {
          elevation: 0,
          sx: {
            border: `1px solid ${brand.border}`,
            borderRadius: 3,
            overflow: "hidden",
            mb: 3
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Box,
              {
                sx: {
                  height: 110,
                  background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantMenuRoundedIcon, { sx: { fontSize: 52, color: "white", opacity: 0.5 } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2.5 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: caterer.catererName }),
              caterer.businessName && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: caterer.businessName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 1.5, alignItems: "center", sx: { mt: 1.25 }, flexWrap: "wrap", useFlexGap: true, children: (caterer.address || caterer.location) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "flex-start", gap: 0.4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LocationOnRoundedIcon, { sx: { fontSize: 14, color: "text.secondary", mt: "1px", flexShrink: 0 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: caterer.address || caterer.location })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", sx: { mt: 1 }, flexWrap: "wrap", useFlexGap: true, children: [
                distKm != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DirectionsBikeRoundedIcon, { sx: { fontSize: "14px !important" } }),
                      label: formatDistance(distKm),
                      size: "small",
                      sx: { height: 26, backgroundColor: "#E8F5E9", color: "#2e7d32", "& .MuiChip-icon": { color: "#2e7d32" }, fontSize: "0.75rem" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AccessTimeRoundedIcon, { sx: { fontSize: "14px !important" } }),
                      label: `~${formatEta(eta)} delivery`,
                      size: "small",
                      sx: { height: 26, backgroundColor: "#E3F2FD", color: "#1565c0", "& .MuiChip-icon": { color: "#1565c0" }, fontSize: "0.75rem" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantMenuRoundedIcon, { sx: { fontSize: "14px !important" } }),
                    label: `${available.length} item${available.length !== 1 ? "s" : ""} available`,
                    size: "small",
                    sx: { height: 26, backgroundColor: brand.orangeLight, color: brand.orange, fontSize: "0.75rem" }
                  }
                )
              ] })
            ] })
          ]
        }
      ),
      available.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 800, mb: 1.5 }, children: "Available Now" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: available.map((food) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, sm: 4, md: 3, lg: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          FoodCard,
          {
            food: { ...food, catererName: caterer.catererName },
            onClick: () => navigate(`/customer/food/${food.id}`)
          }
        ) }, food.id)) })
      ] }),
      unavailable.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700, color: "text.secondary", mb: 1.5 }, children: "Currently Unavailable" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: unavailable.map((food) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, sm: 4, md: 3, lg: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          FoodCard,
          {
            food: { ...food, catererName: caterer.catererName },
            onClick: void 0
          }
        ) }, food.id)) })
      ] }),
      foods.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantMenuRoundedIcon, { sx: { fontSize: 56, color: brand.border, mb: 1 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { color: "text.secondary" }, children: "No food items yet" })
      ] })
    ] })
  ] }) });
}
export {
  CatererDetailPage as default
};
