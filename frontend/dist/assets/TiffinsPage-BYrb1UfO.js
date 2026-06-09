import { r as reactExports, g as generateUtilityClass, a as generateUtilityClasses, t as resolveProps, b as useDefaultProps, j as jsxRuntimeExports, c as clsx, p as capitalize, e as composeClasses, s as styled, m as memoTheme, q as createSimplePaletteValueFilter, u as useNavigate, h as brand, B as Box, C as CircularProgress } from "./index-EstIw0RN.js";
import { S as SearchRoundedIcon } from "./SearchRounded-BjayBowh.js";
import { A as ArrowBackRoundedIcon } from "./ArrowBackRounded-B6uNaBio.js";
import { A as AppLayout, b as LunchDiningRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { B as ButtonBase, e as createSvgIcon, I as IconButton, T as Typography } from "./Logo-DCDhUauE.js";
import { F as FoodCard } from "./FoodCard-CyXU-3br.js";
import { f as foodService } from "./foodService-DCZ7hpOB.js";
import { u as useCustomerGeo } from "./geoUtils-BOmLn7Eh.js";
import { C as Container } from "./index-BIPustA6.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { I as InputBase } from "./InputBase-e5CItqOA.js";
import { F as FormControl, S as Select } from "./Select-4eHc_Vcc.js";
import { M as MenuItem } from "./MenuItem-gextyUDk.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { G as Grid } from "./Grid-9uopkaoy.js";
import "./AccessTimeRounded-D9UrkeMa.js";
import "./DinnerDiningRounded-DokMA8tQ.js";
import "./Card-XJvyk6-3.js";
import "./useControlled-Am1rG54b.js";
import "./Grow-BX3DzL8A.js";
import "./Chip-yjaeJ34r.js";
import "./Button-DPTwUjxe.js";
import "./useFormControl-CRnBRMMH.js";
import "./isMuiElement-CVFCK7HK.js";
function getValidReactChildren(children) {
  return reactExports.Children.toArray(children).filter((child) => /* @__PURE__ */ reactExports.isValidElement(child));
}
function getToggleButtonUtilityClass(slot) {
  return generateUtilityClass("MuiToggleButton", slot);
}
const toggleButtonClasses = generateUtilityClasses("MuiToggleButton", ["root", "disabled", "selected", "standard", "primary", "secondary", "sizeSmall", "sizeMedium", "sizeLarge", "fullWidth"]);
const ToggleButtonGroupContext = /* @__PURE__ */ reactExports.createContext({});
const ToggleButtonGroupButtonContext = /* @__PURE__ */ reactExports.createContext(void 0);
function isValueSelected(value, candidate) {
  if (candidate === void 0 || value === void 0) {
    return false;
  }
  if (Array.isArray(candidate)) {
    return candidate.includes(value);
  }
  return value === candidate;
}
const useUtilityClasses$1 = (ownerState) => {
  const {
    classes,
    fullWidth,
    selected,
    disabled,
    size,
    color
  } = ownerState;
  const slots = {
    root: ["root", selected && "selected", disabled && "disabled", fullWidth && "fullWidth", `size${capitalize(size)}`, color]
  };
  return composeClasses(slots, getToggleButtonUtilityClass, classes);
};
const ToggleButtonRoot = styled(ButtonBase, {
  name: "MuiToggleButton",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, styles[`size${capitalize(ownerState.size)}`]];
  }
})(memoTheme(({
  theme
}) => ({
  ...theme.typography.button,
  borderRadius: (theme.vars || theme).shape.borderRadius,
  padding: 11,
  border: `1px solid ${(theme.vars || theme).palette.divider}`,
  color: (theme.vars || theme).palette.action.active,
  [`&.${toggleButtonClasses.disabled}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    border: `1px solid ${(theme.vars || theme).palette.action.disabledBackground}`
  },
  "&:hover": {
    textDecoration: "none",
    // Reset on mouse devices
    backgroundColor: theme.alpha((theme.vars || theme).palette.text.primary, (theme.vars || theme).palette.action.hoverOpacity),
    "@media (hover: none)": {
      backgroundColor: "transparent"
    }
  },
  variants: [{
    props: {
      color: "standard"
    },
    style: {
      [`&.${toggleButtonClasses.selected}`]: {
        color: (theme.vars || theme).palette.text.primary,
        backgroundColor: theme.alpha((theme.vars || theme).palette.text.primary, (theme.vars || theme).palette.action.selectedOpacity),
        "&:hover": {
          backgroundColor: theme.alpha((theme.vars || theme).palette.text.primary, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.hoverOpacity}`),
          // Reset on touch devices, it doesn't add specificity
          "@media (hover: none)": {
            backgroundColor: theme.alpha((theme.vars || theme).palette.text.primary, (theme.vars || theme).palette.action.selectedOpacity)
          }
        }
      }
    }
  }, ...Object.entries(theme.palette).filter(createSimplePaletteValueFilter()).map(([color]) => ({
    props: {
      color
    },
    style: {
      [`&.${toggleButtonClasses.selected}`]: {
        color: (theme.vars || theme).palette[color].main,
        backgroundColor: theme.alpha((theme.vars || theme).palette[color].main, (theme.vars || theme).palette.action.selectedOpacity),
        "&:hover": {
          backgroundColor: theme.alpha((theme.vars || theme).palette[color].main, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.hoverOpacity}`),
          // Reset on touch devices, it doesn't add specificity
          "@media (hover: none)": {
            backgroundColor: theme.alpha((theme.vars || theme).palette[color].main, (theme.vars || theme).palette.action.selectedOpacity)
          }
        }
      }
    }
  })), {
    props: {
      fullWidth: true
    },
    style: {
      width: "100%"
    }
  }, {
    props: {
      size: "small"
    },
    style: {
      padding: 7,
      fontSize: theme.typography.pxToRem(13)
    }
  }, {
    props: {
      size: "large"
    },
    style: {
      padding: 15,
      fontSize: theme.typography.pxToRem(15)
    }
  }]
})));
const ToggleButton = /* @__PURE__ */ reactExports.forwardRef(function ToggleButton2(inProps, ref) {
  const {
    value: contextValue,
    ...contextProps
  } = reactExports.useContext(ToggleButtonGroupContext);
  const toggleButtonGroupButtonContextPositionClassName = reactExports.useContext(ToggleButtonGroupButtonContext);
  const resolvedProps = resolveProps({
    ...contextProps,
    selected: isValueSelected(inProps.value, contextValue)
  }, inProps);
  const props = useDefaultProps({
    props: resolvedProps,
    name: "MuiToggleButton"
  });
  const {
    children,
    className,
    color = "standard",
    disabled = false,
    disableFocusRipple = false,
    fullWidth = false,
    onChange,
    onClick,
    selected,
    size = "medium",
    value,
    ...other
  } = props;
  const ownerState = {
    ...props,
    color,
    disabled,
    disableFocusRipple,
    fullWidth,
    size
  };
  const classes = useUtilityClasses$1(ownerState);
  const handleChange = (event) => {
    if (onClick) {
      onClick(event, value);
      if (event.defaultPrevented) {
        return;
      }
    }
    if (onChange) {
      onChange(event, value);
    }
  };
  const positionClassName = toggleButtonGroupButtonContextPositionClassName || "";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButtonRoot, {
    className: clsx(contextProps.className, classes.root, className, positionClassName),
    disabled,
    focusRipple: !disableFocusRipple,
    ref,
    onClick: handleChange,
    onChange,
    value,
    ownerState,
    "aria-pressed": selected,
    ...other,
    children
  });
});
function getToggleButtonGroupUtilityClass(slot) {
  return generateUtilityClass("MuiToggleButtonGroup", slot);
}
const toggleButtonGroupClasses = generateUtilityClasses("MuiToggleButtonGroup", ["root", "selected", "horizontal", "vertical", "disabled", "grouped", "groupedHorizontal", "groupedVertical", "fullWidth", "firstButton", "lastButton", "middleButton"]);
const useUtilityClasses = (ownerState) => {
  const {
    classes,
    orientation,
    fullWidth,
    disabled
  } = ownerState;
  const slots = {
    root: ["root", orientation, fullWidth && "fullWidth"],
    grouped: ["grouped", `grouped${capitalize(orientation)}`, disabled && "disabled"],
    firstButton: ["firstButton"],
    lastButton: ["lastButton"],
    middleButton: ["middleButton"]
  };
  return composeClasses(slots, getToggleButtonGroupUtilityClass, classes);
};
const ToggleButtonGroupRoot = styled("div", {
  name: "MuiToggleButtonGroup",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [{
      [`& .${toggleButtonGroupClasses.grouped}`]: styles.grouped
    }, {
      [`& .${toggleButtonGroupClasses.grouped}`]: styles[`grouped${capitalize(ownerState.orientation)}`]
    }, {
      [`& .${toggleButtonGroupClasses.firstButton}`]: styles.firstButton
    }, {
      [`& .${toggleButtonGroupClasses.lastButton}`]: styles.lastButton
    }, {
      [`& .${toggleButtonGroupClasses.middleButton}`]: styles.middleButton
    }, styles.root, ownerState.orientation === "vertical" && styles.vertical, ownerState.fullWidth && styles.fullWidth];
  }
})(memoTheme(({
  theme
}) => ({
  display: "inline-flex",
  borderRadius: (theme.vars || theme).shape.borderRadius,
  variants: [{
    props: {
      orientation: "vertical"
    },
    style: {
      flexDirection: "column",
      [`& .${toggleButtonGroupClasses.grouped}`]: {
        [`&.${toggleButtonGroupClasses.selected} + .${toggleButtonGroupClasses.grouped}.${toggleButtonGroupClasses.selected}`]: {
          borderTop: 0,
          marginTop: 0
        }
      },
      [`& .${toggleButtonGroupClasses.firstButton},& .${toggleButtonGroupClasses.middleButton}`]: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
      },
      [`& .${toggleButtonGroupClasses.lastButton},& .${toggleButtonGroupClasses.middleButton}`]: {
        marginTop: -1,
        borderTop: "1px solid transparent",
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0
      },
      [`& .${toggleButtonGroupClasses.lastButton}.${toggleButtonClasses.disabled},& .${toggleButtonGroupClasses.middleButton}.${toggleButtonClasses.disabled}`]: {
        borderTop: "1px solid transparent"
      }
    }
  }, {
    props: {
      fullWidth: true
    },
    style: {
      width: "100%"
    }
  }, {
    props: {
      orientation: "horizontal"
    },
    style: {
      [`& .${toggleButtonGroupClasses.grouped}`]: {
        [`&.${toggleButtonGroupClasses.selected} + .${toggleButtonGroupClasses.grouped}.${toggleButtonGroupClasses.selected}`]: {
          borderLeft: 0,
          marginLeft: 0
        }
      },
      [`& .${toggleButtonGroupClasses.firstButton},& .${toggleButtonGroupClasses.middleButton}`]: {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0
      },
      [`& .${toggleButtonGroupClasses.lastButton},& .${toggleButtonGroupClasses.middleButton}`]: {
        marginLeft: -1,
        borderLeft: "1px solid transparent",
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0
      },
      [`& .${toggleButtonGroupClasses.lastButton}.${toggleButtonClasses.disabled},& .${toggleButtonGroupClasses.middleButton}.${toggleButtonClasses.disabled}`]: {
        borderLeft: "1px solid transparent"
      }
    }
  }]
})));
const ToggleButtonGroup = /* @__PURE__ */ reactExports.forwardRef(function ToggleButtonGroup2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiToggleButtonGroup"
  });
  const {
    children,
    className,
    color = "standard",
    disabled = false,
    exclusive = false,
    fullWidth = false,
    onChange,
    orientation = "horizontal",
    size = "medium",
    value,
    ...other
  } = props;
  const ownerState = {
    ...props,
    disabled,
    fullWidth,
    orientation,
    size
  };
  const classes = useUtilityClasses(ownerState);
  const handleChange = reactExports.useCallback((event, buttonValue) => {
    if (!onChange) {
      return;
    }
    const index = value && value.indexOf(buttonValue);
    let newValue;
    if (value && index >= 0) {
      newValue = value.slice();
      newValue.splice(index, 1);
    } else {
      newValue = value ? value.concat(buttonValue) : [buttonValue];
    }
    onChange(event, newValue);
  }, [onChange, value]);
  const handleExclusiveChange = reactExports.useCallback((event, buttonValue) => {
    if (!onChange) {
      return;
    }
    onChange(event, value === buttonValue ? null : buttonValue);
  }, [onChange, value]);
  const context = reactExports.useMemo(() => ({
    className: classes.grouped,
    onChange: exclusive ? handleExclusiveChange : handleChange,
    value,
    size,
    fullWidth,
    color,
    disabled
  }), [classes.grouped, exclusive, handleExclusiveChange, handleChange, value, size, fullWidth, color, disabled]);
  const validChildren = getValidReactChildren(children);
  const childrenCount = validChildren.length;
  const getButtonPositionClassName = (index) => {
    const isFirstButton = index === 0;
    const isLastButton = index === childrenCount - 1;
    if (isFirstButton && isLastButton) {
      return "";
    }
    if (isFirstButton) {
      return classes.firstButton;
    }
    if (isLastButton) {
      return classes.lastButton;
    }
    return classes.middleButton;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButtonGroupRoot, {
    role: "group",
    className: clsx(classes.root, className),
    ref,
    ownerState,
    ...other,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButtonGroupContext.Provider, {
      value: context,
      children: validChildren.map((child, index) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButtonGroupButtonContext.Provider, {
          value: getButtonPositionClassName(index),
          children: child
        }, index);
      })
    })
  });
});
const SortRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M4 18h4c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1M3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1m1 6h10c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1"
}));
const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "eta_asc", label: "ETA ↑" }
];
function sortFoods(foods, sort) {
  if (sort === "price_asc") return [...foods].sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === "price_desc") return [...foods].sort((a, b) => Number(b.price) - Number(a.price));
  if (sort === "eta_asc") return [...foods].sort((a, b) => (a.estimatedDeliveryTime ?? 999) - (b.estimatedDeliveryTime ?? 999));
  return foods;
}
function TiffinsPage() {
  const navigate = useNavigate();
  const customerCoords = useCustomerGeo();
  const [foods, setFoods] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [inputVal, setInputVal] = reactExports.useState("");
  const [catererFilter, setCaterer] = reactExports.useState("");
  const [sort, setSort] = reactExports.useState("default");
  const [catererNames, setCaterers] = reactExports.useState([]);
  const load = reactExports.useCallback(async (foodName, catererName, coords) => {
    setLoading(true);
    setError("");
    try {
      let data;
      const geo = coords || customerCoords;
      if (foodName || catererName) {
        data = await foodService.searchFoodsFull({
          foodName,
          catererName,
          available: true,
          customerLat: geo?.lat,
          customerLng: geo?.lng
        });
      } else {
        data = await foodService.getCustomerFoods({
          customerLat: geo?.lat,
          customerLng: geo?.lng
        });
      }
      setFoods(data || []);
      const names = [...new Set((data || []).map((f) => f.catererName || f.caterer_name).filter(Boolean))];
      setCaterers(names.sort());
    } catch (err) {
      setError(err?.message || "Failed to load food items.");
    } finally {
      setLoading(false);
    }
  }, [customerCoords]);
  reactExports.useEffect(() => {
    load("", "");
  }, [load]);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load(inputVal.trim(), catererFilter);
  };
  const handleCatererChange = (e) => {
    const val = e.target.value;
    setCaterer(val);
    load(inputVal.trim(), val);
  };
  const displayed = sortFoods(foods, sort);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { pt: 3, pb: 5 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", gap: 1, sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => navigate("/services"), sx: { color: brand.muted }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBackRoundedIcon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LunchDiningRoundedIcon, { sx: { color: brand.orange, fontSize: 26 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800, lineHeight: 1.1 }, children: "Tiffins" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: [
          displayed.length,
          " item",
          displayed.length !== 1 ? "s" : "",
          " available",
          customerCoords && " · showing ETA"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, gap: 1.5, sx: { mb: 3 }, flexWrap: "wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Box,
        {
          component: "form",
          onSubmit: handleSearchSubmit,
          sx: {
            flex: 1,
            minWidth: 200,
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
                placeholder: "Search food name…",
                value: inputVal,
                onChange: (e) => setInputVal(e.target.value),
                sx: { py: 1.1, fontSize: "0.9rem" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { type: "submit", size: "small", sx: { color: brand.orange }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchRoundedIcon, { fontSize: "small" }) })
          ]
        }
      ),
      catererNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { size: "small", sx: { minWidth: 180 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          displayEmpty: true,
          value: catererFilter,
          onChange: handleCatererChange,
          sx: { borderRadius: 6, backgroundColor: brand.white, fontSize: "0.9rem" },
          renderValue: (v) => v || "All Caterers",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "All Caterers" }),
            catererNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: n, children: n }, n))
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", gap: 0.75, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SortRoundedIcon, { sx: { color: "text.secondary", fontSize: 20 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButtonGroup, { size: "small", exclusive: true, value: sort, onChange: (_, v) => v && setSort(v), children: SORT_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          ToggleButton,
          {
            value: o.value,
            sx: {
              fontSize: "0.75rem",
              px: 1.5,
              fontWeight: 600,
              "&.Mui-selected": { backgroundColor: brand.orangeLight, color: brand.orange }
            },
            children: o.label
          },
          o.value
        )) })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", sx: { mb: 2 }, children: error }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) : displayed.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LunchDiningRoundedIcon, { sx: { fontSize: 56, color: brand.border, mb: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { color: "text.secondary" }, children: "No items found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: "Try a different search or caterer filter" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: displayed.map((food) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, sm: 4, md: 3, lg: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      FoodCard,
      {
        food,
        onClick: () => navigate(`/customer/food/${food.foodId || food.id}`)
      }
    ) }, food.foodId || food.id)) })
  ] }) });
}
export {
  TiffinsPage as default
};
