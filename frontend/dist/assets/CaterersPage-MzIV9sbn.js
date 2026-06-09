import { r as reactExports, j as jsxRuntimeExports, B as Box, h as brand, C as CircularProgress } from "./index-EstIw0RN.js";
import { S as SearchRoundedIcon } from "./SearchRounded-BjayBowh.js";
import { A as AppLayout, S as StorefrontRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { a as adminService } from "./adminService-BlTauhTR.js";
import { C as Container } from "./index-BIPustA6.js";
import { T as Typography, P as Paper } from "./Logo-DCDhUauE.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { T as TextField } from "./TextField-Bs3yYaqe.js";
import { I as InputAdornment } from "./InputAdornment-J_mhbpLy.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-DAmX_BIX.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import "./Select-4eHc_Vcc.js";
import "./InputBase-e5CItqOA.js";
import "./useFormControl-CRnBRMMH.js";
import "./isMuiElement-CVFCK7HK.js";
import "./Grow-BX3DzL8A.js";
import "./useControlled-Am1rG54b.js";
import "./InputLabel-DA7QQiD4.js";
function CaterersPage() {
  const [caterers, setCaterers] = reactExports.useState([]);
  const [total, setTotal] = reactExports.useState(0);
  const [search, setSearch] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState({});
  const load = reactExports.useCallback(async (q) => {
    setLoading(true);
    try {
      const data = await adminService.getCaterers({ search: q, limit: 50 });
      setCaterers(data.caterers || []);
      setTotal(data.total || 0);
    } catch {
      setError("Failed to load caterers.");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    load("");
  }, [load]);
  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };
  const toggleStatus = async (id, currentActive) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const updated = await adminService.setCatererStatus(id, !currentActive);
      setCaterers((prev) => prev.map((c) => c.id === id ? { ...c, is_active: updated.is_active } : c));
    } catch {
      setError("Failed to update status.");
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(StorefrontRoundedIcon, { sx: { color: brand.orange, fontSize: 26 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "Caterers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: [
          total,
          " total"
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", onClose: () => setError(""), sx: { mb: 2 }, children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "form", onSubmit: handleSearch, sx: { mb: 2, maxWidth: 400 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      TextField,
      {
        fullWidth: true,
        size: "small",
        placeholder: "Search caterers…",
        value: search,
        onChange: (e) => setSearch(e.target.value),
        InputProps: { startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchRoundedIcon, { sx: { fontSize: 18 } }) }) }
      }
    ) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, elevation: 0, sx: { border: `1px solid ${brand.border}`, borderRadius: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { sx: { backgroundColor: brand.orangeLight }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Business" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Location" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 700 }, children: "Availability" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 700 }, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 700 }, children: "Action" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: caterers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "text.secondary" }, children: c.business_name || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "text.secondary" }, children: c.location || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: c.availability_status || "READY",
            size: "small",
            sx: {
              fontWeight: 700,
              fontSize: "0.7rem",
              backgroundColor: c.availability_status === "NOT_READY" ? "#9e9e9e" : brand.green,
              color: "white"
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: c.is_active ? "Active" : "Inactive",
            color: c.is_active ? "success" : "default",
            size: "small",
            sx: { fontWeight: 700 }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "small",
            variant: "outlined",
            color: c.is_active ? "error" : "success",
            disabled: !!busy[c.id],
            onClick: () => toggleStatus(c.id, c.is_active),
            sx: { fontWeight: 600, fontSize: "0.75rem" },
            children: busy[c.id] ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 14 }) : c.is_active ? "Deactivate" : "Activate"
          }
        ) })
      ] }, c.id)) })
    ] }) })
  ] }) });
}
export {
  CaterersPage as default
};
