import { g as generateUtilityClass, a as generateUtilityClasses, r as reactExports, b as useDefaultProps, j as jsxRuntimeExports, c as clsx, e as composeClasses, s as styled, y as rootShouldForwardProp, u as useNavigate, B as Box, h as brand } from "./index-EstIw0RN.js";
import { T as Typography, e as createSvgIcon, u as useTheme, P as Paper, I as IconButton } from "./Logo-DCDhUauE.js";
import { A as AppLayout, h as AddCircleOutlineRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { f as foodService } from "./foodService-DCZ7hpOB.js";
import { u as useMediaQuery, C as Container } from "./index-BIPustA6.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import { T as TableContainer, a as Table, b as TableHead, c as TableRow, d as TableCell, e as TableBody } from "./TableRow-DAmX_BIX.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { D as Dialog, a as DialogTitle, b as DialogContent, c as DialogActions } from "./DialogTitle-Bgs80M7L.js";
function getDialogContentTextUtilityClass(slot) {
  return generateUtilityClass("MuiDialogContentText", slot);
}
generateUtilityClasses("MuiDialogContentText", ["root"]);
const useUtilityClasses = (ownerState) => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ["root"]
  };
  const composedClasses = composeClasses(slots, getDialogContentTextUtilityClass, classes);
  return {
    ...classes,
    // forward classes to the Typography
    ...composedClasses
  };
};
const DialogContentTextRoot = styled(Typography, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === "classes",
  name: "MuiDialogContentText",
  slot: "Root"
})({});
const DialogContentText = /* @__PURE__ */ reactExports.forwardRef(function DialogContentText2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiDialogContentText"
  });
  const {
    children,
    className,
    ...ownerState
  } = props;
  const classes = useUtilityClasses(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentTextRoot, {
    component: "p",
    variant: "body1",
    color: "textSecondary",
    ref,
    ownerState,
    className: clsx(classes.root, className),
    ...props,
    classes
  });
});
const EditRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1q-.15.15-.15.36M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"
}));
const DeleteRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1"
}));
function FoodListPage() {
  const [rows, setRows] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  reactExports.useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const data = await foodService.getFoods();
        const mine = user.id ? (data || []).filter((f) => f.caterer_id === user.id) : data || [];
        const mapped = mine.map((f) => ({
          id: f.id,
          name: f.food_name || "",
          price: Number(f.price ?? 0),
          available: !!f.is_available,
          raw: f
        }));
        setRows(mapped);
      } catch (err) {
        console.error("Failed to load foods:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);
  const handleEdit = (id) => navigate(`/caterer/edit-food/${id}`);
  const confirmDelete = (id) => {
    setDeleteId(id);
    setDialogOpen(true);
  };
  const handleDelete = async () => {
    const id = deleteId;
    setDialogOpen(false);
    if (!id) return;
    try {
      if (foodService && typeof foodService.deleteFood === "function") {
        await foodService.deleteFood(id);
        setRows((prev) => prev.filter((r) => r.id !== id));
      } else {
        await fetch(
          `http://localhost:3000/api/foods/${id}`,
          { method: "DELETE" }
        );
        setRows((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeleteId(null);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        sx: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: isMobile ? "h5" : "h4", sx: { fontWeight: 800, color: brand.orange }, children: "My Foods" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: [
              rows.length,
              " item",
              rows.length !== 1 ? "s" : "",
              " in your menu"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddCircleOutlineRoundedIcon, {}),
              sx: {
                background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
                fontWeight: 700
              },
              onClick: () => navigate("/caterer/add-food"),
              children: isMobile ? "Add" : "Add Food"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TableContainer,
      {
        component: Paper,
        elevation: 0,
        sx: { border: `1px solid ${brand.border}`, borderRadius: 2 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { sx: { backgroundColor: brand.orangeLight }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 700 }, children: "Food Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", sx: { fontWeight: 700 }, children: "Price (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 700 }, children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", sx: { fontWeight: 700 }, children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, align: "center", sx: { py: 4, color: "text.secondary" }, children: "Loading…" }) }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, align: "center", sx: { py: 4, color: "text.secondary" }, children: "No food items yet. Add your first item." }) }) : rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: r.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { align: "right", children: [
              "₹",
              r.price
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: r.available ? "Available" : "Unavailable",
                size: "small",
                sx: {
                  fontWeight: 600,
                  backgroundColor: r.available ? brand.greenLight : "#FFF0F0",
                  color: r.available ? brand.green : "#D32F2F"
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 0.5, justifyContent: "center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  onClick: () => handleEdit(r.id),
                  sx: { color: brand.orange },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditRoundedIcon, { fontSize: "small" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  onClick: () => confirmDelete(r.id),
                  sx: { color: "#D32F2F" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteRoundedIcon, { fontSize: "small" })
                }
              )
            ] }) })
          ] }, r.id)) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: { fontWeight: 700 }, children: "Delete Food Item" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentText, { children: "Are you sure you want to delete this food item? This action cannot be undone." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { color: "error", variant: "contained", onClick: handleDelete, children: "Delete" })
      ] })
    ] })
  ] }) });
}
export {
  FoodListPage as default
};
