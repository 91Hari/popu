import { j as jsxRuntimeExports, B as Box, h as brand, u as useNavigate } from "./index-EstIw0RN.js";
import { R as RestaurantRoundedIcon } from "./RestaurantRounded-gKpdzxDS.js";
import { A as AppLayout, b as LunchDiningRoundedIcon, H as HomeRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { P as PeopleAltRoundedIcon } from "./PeopleAltRounded-D7_mpwkS.js";
import { S as SchoolRoundedIcon } from "./SchoolRounded-DGhAujcv.js";
import { C as ChevronRightRoundedIcon } from "./ChevronRightRounded-7MdecKvC.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { C as CardActionArea } from "./CardActionArea-czE_O0Jm.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { T as Typography } from "./Logo-DCDhUauE.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import { C as Container } from "./index-BIPustA6.js";
function ServiceCard({ icon, title, subtitle, comingSoon = false, onClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      sx: {
        opacity: comingSoon ? 0.72 : 1,
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": comingSoon ? {} : {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 24px rgba(232,117,26,0.14)"
        }
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        CardActionArea,
        {
          onClick: comingSoon ? void 0 : onClick,
          disabled: comingSoon,
          sx: { p: 0 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            CardContent,
            {
              sx: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                "&:last-child": { pb: 2 }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Box,
                    {
                      sx: {
                        width: 52,
                        height: 52,
                        borderRadius: 2.5,
                        backgroundColor: comingSoon ? brand.border : brand.orangeLight,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      },
                      children: icon
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700 }, children: title }),
                      comingSoon && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Chip,
                        {
                          label: "Coming Soon",
                          size: "small",
                          sx: { height: 20, fontSize: "0.65rem", backgroundColor: brand.border, color: brand.muted }
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: subtitle })
                  ] })
                ] }),
                !comingSoon && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRightRoundedIcon, { sx: { color: brand.orange, flexShrink: 0 } })
              ]
            }
          )
        }
      )
    }
  );
}
const SERVICES = [
  {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantRoundedIcon, { sx: { fontSize: 28, color: brand.orange } }),
    title: "Catering",
    subtitle: "Professional catering for weddings, parties & events",
    to: "/services/catering",
    comingSoon: false
  },
  {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LunchDiningRoundedIcon, { sx: { fontSize: 28, color: brand.orange } }),
    title: "Tiffins",
    subtitle: "Daily fresh meals delivered to your door",
    to: "/services/tiffins",
    comingSoon: false
  },
  {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleAltRoundedIcon, { sx: { fontSize: 28, color: brand.muted } }),
    title: "Book Cook",
    subtitle: "Hire expert cooks for your home or event",
    to: "/services/book-cook",
    comingSoon: true
  },
  {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HomeRoundedIcon, { sx: { fontSize: 28, color: brand.muted } }),
    title: "Home Food",
    subtitle: "Homemade food made with love",
    to: "/services/home-food",
    comingSoon: true
  },
  {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SchoolRoundedIcon, { sx: { fontSize: 28, color: brand.muted } }),
    title: "Training",
    subtitle: "Culinary training & upskilling courses",
    to: "/services/training",
    comingSoon: true
  }
];
function ServicesPage() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "md", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800, mb: 0.5 }, children: "Our Services" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", mb: 3 }, children: "Choose a service to explore" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexDirection: "column", gap: 1.5 }, children: SERVICES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      ServiceCard,
      {
        icon: s.icon,
        title: s.title,
        subtitle: s.subtitle,
        comingSoon: s.comingSoon,
        onClick: () => navigate(s.to)
      },
      s.title
    )) })
  ] }) });
}
export {
  ServicesPage as default
};
