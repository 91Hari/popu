import { j as jsxRuntimeExports, r as reactExports, B as Box, h as brand } from "./index-EstIw0RN.js";
import { A as AppLayout, k as AssessmentRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { e as createSvgIcon, T as Typography } from "./Logo-DCDhUauE.js";
import { a as adminService } from "./adminService-BlTauhTR.js";
import { C as Container } from "./index-BIPustA6.js";
import { G as Grid } from "./Grid-9uopkaoy.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { S as Skeleton } from "./Skeleton-CIjyFMxR.js";
import "./isMuiElement-CVFCK7HK.js";
const TrendingUpRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "m16.85 6.85 1.44 1.44-4.88 4.88-3.29-3.29a.996.996 0 0 0-1.41 0l-6 6.01c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L9.41 12l3.29 3.29c.39.39 1.02.39 1.41 0l5.59-5.58 1.44 1.44c.31.31.85.09.85-.35V6.5c.01-.28-.21-.5-.49-.5h-4.29c-.45 0-.67.54-.36.85"
}));
function ReportsPage() {
  const [stats, setStats] = reactExports.useState(null);
  const [loading, setLoad] = reactExports.useState(true);
  reactExports.useEffect(() => {
    adminService.getDashboard().then(setStats).finally(() => setLoad(false));
  }, []);
  const metrics = stats ? [
    { label: "Order Completion Rate", value: stats.totalOrders > 0 ? `${Math.round((Number(stats.totalOrders) - Number(stats.pendingOrders)) / Number(stats.totalOrders) * 100)}%` : "—" },
    { label: "Total Revenue", value: `₹${stats.revenue}` },
    { label: "Avg Revenue / Order", value: stats.totalOrders > 0 ? `₹${(parseFloat(stats.revenue) / Number(stats.totalOrders)).toFixed(2)}` : "—" },
    { label: "Active Caterers", value: String(stats.totalCaterers) },
    { label: "Active Customers", value: String(stats.totalCustomers) },
    { label: "Food Items Listed", value: String(stats.totalFoods) }
  ] : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5, mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AssessmentRoundedIcon, { sx: { color: brand.orange, fontSize: 26 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "Reports" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: loading ? Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { border: `1px solid ${brand.border}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 60 }) }) }) }, i)) : metrics.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { border: `1px solid ${brand.border}`, borderLeft: `4px solid ${brand.orange}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { display: "flex", alignItems: "center", gap: 2, py: "20px !important" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUpRoundedIcon, { sx: { color: brand.orange, fontSize: 28, flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.secondary", fontWeight: 500 }, children: m.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 900, color: brand.orange, lineHeight: 1.1 }, children: m.value })
      ] })
    ] }) }) }, m.label)) })
  ] }) });
}
export {
  ReportsPage as default
};
