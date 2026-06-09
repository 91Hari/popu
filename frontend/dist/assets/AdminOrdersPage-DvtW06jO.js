import { r as reactExports, j as jsxRuntimeExports, B as Box, h as brand, C as CircularProgress } from "./index-EstIw0RN.js";
import { A as AppLayout, R as ReceiptLongRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { a as adminService } from "./adminService-BlTauhTR.js";
import { C as Container } from "./index-BIPustA6.js";
import { T as Typography, P as Paper } from "./Logo-DCDhUauE.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { F as FormControl, S as Select } from "./Select-4eHc_Vcc.js";
import { I as InputLabel } from "./InputLabel-DA7QQiD4.js";
import { M as MenuItem } from "./MenuItem-gextyUDk.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-DAmX_BIX.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import "./InputBase-e5CItqOA.js";
import "./useFormControl-CRnBRMMH.js";
import "./isMuiElement-CVFCK7HK.js";
import "./Grow-BX3DzL8A.js";
import "./useControlled-Am1rG54b.js";
const STATUSES = ["", "PLACED", "ACCEPTED", "PREPARING", "DELIVERED", "CANCELLED"];
const STATUS_COLORS = {
  PLACED: "info",
  ACCEPTED: "primary",
  PREPARING: "warning",
  DELIVERED: "success",
  CANCELLED: "default"
};
function AdminOrdersPage() {
  const [orders, setOrders] = reactExports.useState([]);
  const [total, setTotal] = reactExports.useState(0);
  const [statusFilter, setStatus] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState({});
  const load = reactExports.useCallback(async (s) => {
    setLoading(true);
    try {
      const data = await adminService.getOrders({ status: s, limit: 50 });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    load("");
  }, [load]);
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    load(e.target.value);
  };
  const updateStatus = async (id, newStatus) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      await adminService.updateOrderStatus(id, newStatus);
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
    } catch {
      setError("Failed to update order.");
    } finally {
      setBusy((b) => {
        const n = { ...b };
        delete n[id];
        return n;
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5, mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptLongRoundedIcon, { sx: { color: brand.orange, fontSize: 26 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "Orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: [
          total,
          " results"
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", onClose: () => setError(""), sx: { mb: 2 }, children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { size: "small", sx: { minWidth: 180 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Filter by Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onChange: handleStatusChange, label: "Filter by Status", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "All Statuses" }),
        STATUSES.filter(Boolean).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: s, children: s }, s))
      ] })
    ] }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, elevation: 0, sx: { border: `1px solid ${brand.border}`, borderRadius: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { sx: { backgroundColor: brand.orangeLight }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Order #" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontWeight: 700 }, children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 700 }, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Placed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 700 }, children: "Update Status" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: orders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { sx: { fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 600 }, children: [
          "#",
          o.id.slice(0, 8).toUpperCase()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: o.customer_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: o.customer_email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { align: "right", sx: { fontWeight: 700, color: brand.orange }, children: [
          "₹",
          Number(o.total_amount).toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: o.status, color: STATUS_COLORS[o.status] || "default", size: "small", sx: { fontWeight: 700 } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontSize: "0.8rem", color: "text.secondary" }, children: new Date(o.created_at).toLocaleDateString("en-IN") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 0.5, justifyContent: "center", flexWrap: "wrap", children: ["DELIVERED", "CANCELLED"].includes(o.status) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.disabled" }, children: "—" }) : STATUSES.filter(Boolean).filter((s) => s !== o.status).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "small",
            variant: "outlined",
            disabled: !!busy[o.id],
            onClick: () => updateStatus(o.id, s),
            sx: { fontSize: "0.65rem", px: 0.75, py: 0.25, fontWeight: 600, minWidth: 0 },
            children: busy[o.id] ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 10 }) : s
          },
          s
        )) }) })
      ] }, o.id)) })
    ] }) })
  ] }) });
}
export {
  AdminOrdersPage as default
};
