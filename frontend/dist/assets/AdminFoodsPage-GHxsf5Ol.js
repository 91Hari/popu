import { r as reactExports, j as jsxRuntimeExports, B as Box, h as brand, C as CircularProgress } from "./index-EstIw0RN.js";
import { S as SearchRoundedIcon } from "./SearchRounded-BjayBowh.js";
import { A as AppLayout, g as RestaurantMenuRoundedIcon } from "./AppLayout-DH-wOGjI.js";
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
function AdminFoodsPage() {
  const [foods, setFoods] = reactExports.useState([]);
  const [total, setTotal] = reactExports.useState(0);
  const [search, setSearch] = reactExports.useState("");
  const [loading, setLoad] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState({});
  const load = reactExports.useCallback(async (q) => {
    setLoad(true);
    try {
      const data = await adminService.getFoods({ search: q, limit: 50 });
      setFoods(data.foods || []);
      setTotal(data.total || 0);
    } catch {
      setError("Failed to load foods.");
    } finally {
      setLoad(false);
    }
  }, []);
  reactExports.useEffect(() => {
    load("");
  }, [load]);
  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };
  const toggleStatus = async (id, current) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const updated = await adminService.setFoodStatus(id, !current);
      setFoods((prev) => prev.map((f) => f.id === id ? { ...f, is_available: updated.is_available } : f));
    } catch {
      setError("Failed to update.");
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantMenuRoundedIcon, { sx: { color: brand.orange, fontSize: 26 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "Food Catalog" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: [
          total,
          " items"
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", onClose: () => setError(""), sx: { mb: 2 }, children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "form", onSubmit: handleSearch, sx: { mb: 2, maxWidth: 400 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      TextField,
      {
        fullWidth: true,
        size: "small",
        placeholder: "Search foods…",
        value: search,
        onChange: (e) => setSearch(e.target.value),
        InputProps: { startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchRoundedIcon, { sx: { fontSize: 18 } }) }) }
      }
    ) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, elevation: 0, sx: { border: `1px solid ${brand.border}`, borderRadius: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { sx: { backgroundColor: brand.orangeLight }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Food Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Caterer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontWeight: 700 }, children: "Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 700 }, children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 700 }, children: "Action" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: foods.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: f.food_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "text.secondary" }, children: f.caterer_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "text.secondary" }, children: f.category || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { align: "right", sx: { fontWeight: 700, color: brand.orange }, children: [
          "₹",
          f.price
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: f.is_available ? "Available" : "Disabled",
            color: f.is_available ? "success" : "default",
            size: "small",
            sx: { fontWeight: 700 }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "small",
            variant: "outlined",
            color: f.is_available ? "error" : "success",
            disabled: !!busy[f.id],
            onClick: () => toggleStatus(f.id, f.is_available),
            sx: { fontWeight: 600, fontSize: "0.75rem" },
            children: busy[f.id] ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 14 }) : f.is_available ? "Disable" : "Enable"
          }
        ) })
      ] }, f.id)) })
    ] }) })
  ] }) });
}
export {
  AdminFoodsPage as default
};
