import { r as reactExports, j as jsxRuntimeExports, B as Box, h as brand } from "./index-EstIw0RN.js";
import { A as AppLayout, j as AdminPanelSettingsRoundedIcon, P as PeopleRoundedIcon, S as StorefrontRoundedIcon, g as RestaurantMenuRoundedIcon, R as ReceiptLongRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { H as HourglassEmptyRoundedIcon } from "./HourglassEmptyRounded-BbPTmT4t.js";
import { A as AttachMoneyRoundedIcon } from "./AttachMoneyRounded-DnmDm0Qz.js";
import { a as adminService } from "./adminService-BlTauhTR.js";
import { C as Container } from "./index-BIPustA6.js";
import { T as Typography } from "./Logo-DCDhUauE.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { G as Grid } from "./Grid-9uopkaoy.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { S as Skeleton } from "./Skeleton-CIjyFMxR.js";
import "./isMuiElement-CVFCK7HK.js";
const STAT_DEFS = [
  { key: "totalCustomers", label: "Customers", color: "#1565c0", bg: "#E3F2FD", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleRoundedIcon, {}) },
  { key: "totalCaterers", label: "Caterers", color: brand.orange, bg: brand.orangeLight, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(StorefrontRoundedIcon, {}) },
  { key: "totalFoods", label: "Food Items", color: "#2e7d32", bg: "#E8F5E9", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantMenuRoundedIcon, {}) },
  { key: "totalOrders", label: "Total Orders", color: "#6a1b9a", bg: "#F3E5F5", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptLongRoundedIcon, {}) },
  { key: "pendingOrders", label: "Pending", color: "#e65100", bg: "#FFF3E0", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HourglassEmptyRoundedIcon, {}) },
  { key: "revenue", label: "Revenue", color: "#1b5e20", bg: "#E8F5E9", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AttachMoneyRoundedIcon, {}), prefix: "₹" }
];
function AdminDashboard() {
  const [stats, setStats] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  reactExports.useEffect(() => {
    adminService.getDashboard().then(setStats).catch(() => setError("Failed to load dashboard stats.")).finally(() => setLoading(false));
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5, mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPanelSettingsRoundedIcon, { sx: { color: brand.orange, fontSize: 30 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "Admin Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: "Platform overview and management" })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: STAT_DEFS.map((def) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { border: `1px solid ${brand.border}`, borderLeft: `4px solid ${def.color}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { display: "flex", alignItems: "center", gap: 2, py: "20px !important" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
        width: 48,
        height: 48,
        borderRadius: 2,
        backgroundColor: def.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: def.color,
        flexShrink: 0
      }, children: def.icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", fontWeight: 500 }, children: def.label }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { width: 72, height: 36 }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", sx: { fontWeight: 900, lineHeight: 1.1, color: def.color }, children: [
          def.prefix || "",
          stats?.[def.key] ?? "—"
        ] })
      ] })
    ] }) }) }, def.key)) })
  ] }) });
}
export {
  AdminDashboard as default
};
