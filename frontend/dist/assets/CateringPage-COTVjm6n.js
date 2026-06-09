import { g as generateUtilityClass, a as generateUtilityClasses, j as jsxRuntimeExports, r as reactExports, b as useDefaultProps, o as useRtl, c as clsx, p as capitalize, e as composeClasses, s as styled, m as memoTheme, q as createSimplePaletteValueFilter, B as Box, h as brand, u as useNavigate, C as CircularProgress } from "./index-EstIw0RN.js";
import { h as haversineKm, a as formatDistance, b as formatEta, c as etaMinutes, u as useCustomerGeo } from "./geoUtils-BOmLn7Eh.js";
import { S as SearchRoundedIcon } from "./SearchRounded-BjayBowh.js";
import { A as ArrowBackRoundedIcon } from "./ArrowBackRounded-B6uNaBio.js";
import { R as RestaurantRoundedIcon } from "./RestaurantRounded-gKpdzxDS.js";
import { g as RestaurantMenuRoundedIcon, A as AppLayout } from "./AppLayout-DH-wOGjI.js";
import { L as LocationOnRoundedIcon } from "./LocationOnRounded-DboijKjd.js";
import { S as StarRoundedIcon } from "./StarRounded-yGXFjJDP.js";
import { D as DirectionsBikeRoundedIcon } from "./DirectionsBikeRounded-50JdC_x1.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { C as CardActionArea } from "./CardActionArea-czE_O0Jm.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { e as createSvgIcon, d as useSlot, B as ButtonBase, T as Typography, I as IconButton } from "./Logo-DCDhUauE.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import { c as catererService } from "./catererService-MNSLc32N.js";
import { C as Container } from "./index-BIPustA6.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { I as InputBase } from "./InputBase-e5CItqOA.js";
import { F as FormControl, S as Select } from "./Select-4eHc_Vcc.js";
import { M as MenuItem } from "./MenuItem-gextyUDk.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { G as Grid } from "./Grid-9uopkaoy.js";
import { u as useControlled } from "./useControlled-Am1rG54b.js";
import "./useFormControl-CRnBRMMH.js";
import "./isMuiElement-CVFCK7HK.js";
import "./Grow-BX3DzL8A.js";
function getPaginationUtilityClass(slot) {
  return generateUtilityClass("MuiPagination", slot);
}
generateUtilityClasses("MuiPagination", ["root", "ul", "outlined", "text"]);
function usePagination(props = {}) {
  const {
    boundaryCount = 1,
    componentName = "usePagination",
    count = 1,
    defaultPage = 1,
    disabled = false,
    hideNextButton = false,
    hidePrevButton = false,
    onChange: handleChange,
    page: pageProp,
    showFirstButton = false,
    showLastButton = false,
    siblingCount = 1,
    ...other
  } = props;
  const [page, setPageState] = useControlled({
    controlled: pageProp,
    default: defaultPage,
    name: componentName,
    state: "page"
  });
  const handleClick = (event, value) => {
    if (!pageProp) {
      setPageState(value);
    }
    if (handleChange) {
      handleChange(event, value);
    }
  };
  const range = (start, end) => {
    const length = end - start + 1;
    return Array.from({
      length
    }, (_, i) => start + i);
  };
  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);
  const siblingsStart = Math.max(
    Math.min(
      // Natural start
      page - siblingCount,
      // Lower boundary when page is high
      count - boundaryCount - siblingCount * 2 - 1
    ),
    // Greater than startPages
    boundaryCount + 2
  );
  const siblingsEnd = Math.min(
    Math.max(
      // Natural end
      page + siblingCount,
      // Upper boundary when page is low
      boundaryCount + siblingCount * 2 + 2
    ),
    // Less than endPages
    count - boundaryCount - 1
  );
  const itemList = [
    ...showFirstButton ? ["first"] : [],
    ...hidePrevButton ? [] : ["previous"],
    ...startPages,
    // Start ellipsis
    // eslint-disable-next-line no-nested-ternary
    ...siblingsStart > boundaryCount + 2 ? ["start-ellipsis"] : boundaryCount + 1 < count - boundaryCount ? [boundaryCount + 1] : [],
    // Sibling pages
    ...range(siblingsStart, siblingsEnd),
    // End ellipsis
    // eslint-disable-next-line no-nested-ternary
    ...siblingsEnd < count - boundaryCount - 1 ? ["end-ellipsis"] : count - boundaryCount > boundaryCount ? [count - boundaryCount] : [],
    ...endPages,
    ...hideNextButton ? [] : ["next"],
    ...showLastButton ? ["last"] : []
  ];
  const buttonPage = (type) => {
    switch (type) {
      case "first":
        return 1;
      case "previous":
        return page - 1;
      case "next":
        return page + 1;
      case "last":
        return count;
      default:
        return null;
    }
  };
  const items = itemList.map((item) => {
    return typeof item === "number" ? {
      onClick: (event) => {
        handleClick(event, item);
      },
      type: "page",
      page: item,
      selected: item === page,
      disabled,
      "aria-current": item === page ? "page" : void 0
    } : {
      onClick: (event) => {
        handleClick(event, buttonPage(item));
      },
      type: item,
      page: buttonPage(item),
      selected: false,
      disabled: disabled || !item.includes("ellipsis") && (item === "next" || item === "last" ? page >= count : page <= 1)
    };
  });
  return {
    items,
    ...other
  };
}
function getPaginationItemUtilityClass(slot) {
  return generateUtilityClass("MuiPaginationItem", slot);
}
const paginationItemClasses = generateUtilityClasses("MuiPaginationItem", ["root", "page", "sizeSmall", "sizeLarge", "text", "textPrimary", "textSecondary", "outlined", "outlinedPrimary", "outlinedSecondary", "rounded", "ellipsis", "firstLast", "previousNext", "focusVisible", "disabled", "selected", "icon", "colorPrimary", "colorSecondary"]);
const FirstPageIconDefault = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"
}));
const LastPageIconDefault = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"
}));
const NavigateBeforeIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
}));
const NavigateNextIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
}));
const overridesResolver = (props, styles) => {
  const {
    ownerState
  } = props;
  return [styles.root, styles[ownerState.variant], styles[`size${capitalize(ownerState.size)}`], ownerState.variant === "text" && styles[`text${capitalize(ownerState.color)}`], ownerState.variant === "outlined" && styles[`outlined${capitalize(ownerState.color)}`], ownerState.shape === "rounded" && styles.rounded, ownerState.type === "page" && styles.page, (ownerState.type === "start-ellipsis" || ownerState.type === "end-ellipsis") && styles.ellipsis, (ownerState.type === "previous" || ownerState.type === "next") && styles.previousNext, (ownerState.type === "first" || ownerState.type === "last") && styles.firstLast];
};
const useUtilityClasses$1 = (ownerState) => {
  const {
    classes,
    color,
    disabled,
    selected,
    size,
    shape,
    type,
    variant
  } = ownerState;
  const slots = {
    root: ["root", `size${capitalize(size)}`, variant, shape, color !== "standard" && `color${capitalize(color)}`, color !== "standard" && `${variant}${capitalize(color)}`, disabled && "disabled", selected && "selected", {
      page: "page",
      first: "firstLast",
      last: "firstLast",
      "start-ellipsis": "ellipsis",
      "end-ellipsis": "ellipsis",
      previous: "previousNext",
      next: "previousNext"
    }[type]],
    icon: ["icon"]
  };
  return composeClasses(slots, getPaginationItemUtilityClass, classes);
};
const PaginationItemEllipsis = styled("div", {
  name: "MuiPaginationItem",
  slot: "Root",
  overridesResolver
})(memoTheme(({
  theme
}) => ({
  ...theme.typography.body2,
  borderRadius: 32 / 2,
  textAlign: "center",
  boxSizing: "border-box",
  minWidth: 32,
  padding: "0 6px",
  margin: "0 3px",
  color: (theme.vars || theme).palette.text.primary,
  height: "auto",
  [`&.${paginationItemClasses.disabled}`]: {
    opacity: (theme.vars || theme).palette.action.disabledOpacity
  },
  variants: [{
    props: {
      size: "small"
    },
    style: {
      minWidth: 26,
      borderRadius: 26 / 2,
      margin: "0 1px",
      padding: "0 4px"
    }
  }, {
    props: {
      size: "large"
    },
    style: {
      minWidth: 40,
      borderRadius: 40 / 2,
      padding: "0 10px",
      fontSize: theme.typography.pxToRem(15)
    }
  }]
})));
const PaginationItemPage = styled(ButtonBase, {
  name: "MuiPaginationItem",
  slot: "Root",
  overridesResolver
})(memoTheme(({
  theme
}) => ({
  ...theme.typography.body2,
  borderRadius: 32 / 2,
  textAlign: "center",
  boxSizing: "border-box",
  minWidth: 32,
  height: 32,
  padding: "0 6px",
  margin: "0 3px",
  color: (theme.vars || theme).palette.text.primary,
  [`&.${paginationItemClasses.focusVisible}`]: {
    backgroundColor: (theme.vars || theme).palette.action.focus
  },
  [`&.${paginationItemClasses.disabled}`]: {
    opacity: (theme.vars || theme).palette.action.disabledOpacity
  },
  transition: theme.transitions.create(["color", "background-color"], {
    duration: theme.transitions.duration.short
  }),
  "&:hover": {
    backgroundColor: (theme.vars || theme).palette.action.hover,
    // Reset on touch devices, it doesn't add specificity
    "@media (hover: none)": {
      backgroundColor: "transparent"
    }
  },
  [`&.${paginationItemClasses.selected}`]: {
    backgroundColor: (theme.vars || theme).palette.action.selected,
    "&:hover": {
      backgroundColor: theme.alpha((theme.vars || theme).palette.action.selected, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.hoverOpacity}`),
      // Reset on touch devices, it doesn't add specificity
      "@media (hover: none)": {
        backgroundColor: (theme.vars || theme).palette.action.selected
      }
    },
    [`&.${paginationItemClasses.focusVisible}`]: {
      backgroundColor: theme.alpha((theme.vars || theme).palette.action.selected, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.focusOpacity}`)
    },
    [`&.${paginationItemClasses.disabled}`]: {
      opacity: 1,
      color: (theme.vars || theme).palette.action.disabled,
      backgroundColor: (theme.vars || theme).palette.action.selected
    }
  },
  variants: [{
    props: {
      size: "small"
    },
    style: {
      minWidth: 26,
      height: 26,
      borderRadius: 26 / 2,
      margin: "0 1px",
      padding: "0 4px"
    }
  }, {
    props: {
      size: "large"
    },
    style: {
      minWidth: 40,
      height: 40,
      borderRadius: 40 / 2,
      padding: "0 10px",
      fontSize: theme.typography.pxToRem(15)
    }
  }, {
    props: {
      shape: "rounded"
    },
    style: {
      borderRadius: (theme.vars || theme).shape.borderRadius
    }
  }, {
    props: {
      variant: "outlined"
    },
    style: {
      border: theme.vars ? `1px solid ${theme.alpha(theme.vars.palette.common.onBackground, 0.23)}` : `1px solid ${theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.23)" : "rgba(255, 255, 255, 0.23)"}`,
      [`&.${paginationItemClasses.selected}`]: {
        [`&.${paginationItemClasses.disabled}`]: {
          borderColor: (theme.vars || theme).palette.action.disabledBackground,
          color: (theme.vars || theme).palette.action.disabled
        }
      }
    }
  }, {
    props: {
      variant: "text"
    },
    style: {
      [`&.${paginationItemClasses.selected}`]: {
        [`&.${paginationItemClasses.disabled}`]: {
          color: (theme.vars || theme).palette.action.disabled
        }
      }
    }
  }, ...Object.entries(theme.palette).filter(createSimplePaletteValueFilter(["dark", "contrastText"])).map(([color]) => ({
    props: {
      variant: "text",
      color
    },
    style: {
      [`&.${paginationItemClasses.selected}`]: {
        color: (theme.vars || theme).palette[color].contrastText,
        backgroundColor: (theme.vars || theme).palette[color].main,
        "&:hover": {
          backgroundColor: (theme.vars || theme).palette[color].dark,
          // Reset on touch devices, it doesn't add specificity
          "@media (hover: none)": {
            backgroundColor: (theme.vars || theme).palette[color].main
          }
        },
        [`&.${paginationItemClasses.focusVisible}`]: {
          backgroundColor: (theme.vars || theme).palette[color].dark
        },
        [`&.${paginationItemClasses.disabled}`]: {
          color: (theme.vars || theme).palette.action.disabled
        }
      }
    }
  })), ...Object.entries(theme.palette).filter(createSimplePaletteValueFilter(["light"])).map(([color]) => ({
    props: {
      variant: "outlined",
      color
    },
    style: {
      [`&.${paginationItemClasses.selected}`]: {
        color: (theme.vars || theme).palette[color].main,
        border: `1px solid ${theme.alpha((theme.vars || theme).palette[color].main, 0.5)}`,
        backgroundColor: theme.alpha((theme.vars || theme).palette[color].main, (theme.vars || theme).palette.action.activatedOpacity),
        "&:hover": {
          backgroundColor: theme.alpha((theme.vars || theme).palette[color].main, `${(theme.vars || theme).palette.action.activatedOpacity} + ${(theme.vars || theme).palette.action.focusOpacity}`),
          // Reset on touch devices, it doesn't add specificity
          "@media (hover: none)": {
            backgroundColor: "transparent"
          }
        },
        [`&.${paginationItemClasses.focusVisible}`]: {
          backgroundColor: theme.alpha((theme.vars || theme).palette[color].main, `${(theme.vars || theme).palette.action.activatedOpacity} + ${(theme.vars || theme).palette.action.focusOpacity}`)
        }
      }
    }
  }))]
})));
const PaginationItemPageIcon = styled("div", {
  name: "MuiPaginationItem",
  slot: "Icon"
})(memoTheme(({
  theme
}) => ({
  fontSize: theme.typography.pxToRem(20),
  margin: "0 -8px",
  variants: [{
    props: {
      size: "small"
    },
    style: {
      fontSize: theme.typography.pxToRem(18)
    }
  }, {
    props: {
      size: "large"
    },
    style: {
      fontSize: theme.typography.pxToRem(22)
    }
  }]
})));
const PaginationItem = /* @__PURE__ */ reactExports.forwardRef(function PaginationItem2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiPaginationItem"
  });
  const {
    className,
    color = "standard",
    component,
    components = {},
    disabled = false,
    page,
    selected = false,
    shape = "circular",
    size = "medium",
    slots = {},
    slotProps = {},
    type = "page",
    variant = "text",
    ...other
  } = props;
  const ownerState = {
    ...props,
    color,
    disabled,
    selected,
    shape,
    size,
    type,
    variant
  };
  const isRtl = useRtl();
  const classes = useUtilityClasses$1(ownerState);
  const externalForwardedProps = {
    slots: {
      previous: slots.previous ?? components.previous,
      next: slots.next ?? components.next,
      first: slots.first ?? components.first,
      last: slots.last ?? components.last
    },
    slotProps
  };
  const [PreviousSlot, previousSlotProps] = useSlot("previous", {
    elementType: NavigateBeforeIcon,
    externalForwardedProps,
    ownerState
  });
  const [NextSlot, nextSlotProps] = useSlot("next", {
    elementType: NavigateNextIcon,
    externalForwardedProps,
    ownerState
  });
  const [FirstSlot, firstSlotProps] = useSlot("first", {
    elementType: FirstPageIconDefault,
    externalForwardedProps,
    ownerState
  });
  const [LastSlot, lastSlotProps] = useSlot("last", {
    elementType: LastPageIconDefault,
    externalForwardedProps,
    ownerState
  });
  const rtlAwareType = isRtl ? {
    previous: "next",
    next: "previous",
    first: "last",
    last: "first"
  }[type] : type;
  const IconSlot = {
    previous: PreviousSlot,
    next: NextSlot,
    first: FirstSlot,
    last: LastSlot
  }[rtlAwareType];
  const iconSlotProps = {
    previous: previousSlotProps,
    next: nextSlotProps,
    first: firstSlotProps,
    last: lastSlotProps
  }[rtlAwareType];
  return type === "start-ellipsis" || type === "end-ellipsis" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PaginationItemEllipsis, {
    ref,
    ownerState,
    className: clsx(classes.root, className),
    children: "…"
  }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(PaginationItemPage, {
    ref,
    ownerState,
    component,
    disabled,
    className: clsx(classes.root, className),
    ...other,
    children: [type === "page" && page, IconSlot ? /* @__PURE__ */ jsxRuntimeExports.jsx(PaginationItemPageIcon, {
      ...iconSlotProps,
      className: classes.icon,
      as: IconSlot
    }) : null]
  });
});
const useUtilityClasses = (ownerState) => {
  const {
    classes,
    variant
  } = ownerState;
  const slots = {
    root: ["root", variant],
    ul: ["ul"]
  };
  return composeClasses(slots, getPaginationUtilityClass, classes);
};
const PaginationRoot = styled("nav", {
  name: "MuiPagination",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, styles[ownerState.variant]];
  }
})({});
const PaginationUl = styled("ul", {
  name: "MuiPagination",
  slot: "Ul"
})({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  padding: 0,
  margin: 0,
  listStyle: "none"
});
function defaultGetAriaLabel(type, page, selected) {
  if (type === "page") {
    return `${selected ? "" : "Go to "}page ${page}`;
  }
  return `Go to ${type} page`;
}
const Pagination = /* @__PURE__ */ reactExports.forwardRef(function Pagination2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiPagination"
  });
  const {
    boundaryCount = 1,
    className,
    color = "standard",
    count = 1,
    defaultPage = 1,
    disabled = false,
    getItemAriaLabel = defaultGetAriaLabel,
    hideNextButton = false,
    hidePrevButton = false,
    onChange,
    page,
    renderItem = (item) => /* @__PURE__ */ jsxRuntimeExports.jsx(PaginationItem, {
      ...item
    }),
    shape = "circular",
    showFirstButton = false,
    showLastButton = false,
    siblingCount = 1,
    size = "medium",
    variant = "text",
    ...other
  } = props;
  const {
    items
  } = usePagination({
    ...props,
    componentName: "Pagination"
  });
  const ownerState = {
    ...props,
    boundaryCount,
    color,
    count,
    defaultPage,
    disabled,
    getItemAriaLabel,
    hideNextButton,
    hidePrevButton,
    renderItem,
    shape,
    showFirstButton,
    showLastButton,
    siblingCount,
    size,
    variant
  };
  const classes = useUtilityClasses(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PaginationRoot, {
    "aria-label": "pagination navigation",
    className: clsx(classes.root, className),
    ownerState,
    ref,
    ...other,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaginationUl, {
      className: classes.ul,
      ownerState,
      children: items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", {
        children: renderItem({
          ...item,
          color,
          "aria-label": getItemAriaLabel(item.type, item.page, item.selected),
          shape,
          size,
          variant
        })
      }, index))
    })
  });
});
function CatererCard({ caterer = {}, onClick, customerCoords }) {
  const { catererName, businessName, location, address, latitude, longitude, rating, foodCount, email } = caterer;
  const hasDistance = customerCoords && latitude != null && longitude != null;
  const distKm = hasDistance ? haversineKm(customerCoords.lat, customerCoords.lng, Number(latitude), Number(longitude)) : null;
  const eta = distKm != null ? etaMinutes(distKm) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      sx: {
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 24px rgba(232,117,26,0.14)"
        }
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardActionArea, { onClick, sx: { p: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Box,
          {
            sx: {
              height: 80,
              background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantMenuRoundedIcon, { sx: { fontSize: 36, color: "white", opacity: 0.6 } })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 2, "&:last-child": { pb: 2 } }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 800, lineHeight: 1.2 }, noWrap: true, children: catererName || "Caterer" }),
          businessName && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.secondary", display: "block" }, noWrap: true, children: businessName }),
          (address || location) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "flex-start", gap: 0.4, mt: 0.75 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LocationOnRoundedIcon, { sx: { fontSize: 13, color: "text.secondary", mt: "1px", flexShrink: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.secondary", lineHeight: 1.3 }, children: address || location })
          ] }),
          distKm != null && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", alignItems: "center", gap: 0.6, mt: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DirectionsBikeRoundedIcon, { sx: { fontSize: "13px !important" } }),
              label: `${formatDistance(distKm)} · ${formatEta(eta)}`,
              size: "small",
              sx: {
                height: 22,
                fontSize: "0.7rem",
                backgroundColor: "#E8F5E9",
                color: "#2e7d32",
                "& .MuiChip-icon": { color: "#2e7d32" }
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.25 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", alignItems: "center", gap: 0.4 }, children: rating != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StarRoundedIcon, { sx: { fontSize: 15, color: brand.star } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 700 }, children: Number(rating).toFixed(1) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.disabled" }, children: "No rating yet" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantMenuRoundedIcon, { sx: { fontSize: "14px !important" } }),
                label: `${foodCount ?? 0} items`,
                size: "small",
                sx: { height: 22, fontSize: "0.7rem", backgroundColor: brand.orangeLight, color: brand.orange }
              }
            )
          ] }),
          email && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.disabled", display: "block", mt: 0.75 }, noWrap: true, children: email })
        ] })
      ] })
    }
  );
}
const LOCATIONS = ["All", "Hyderabad", "Bangalore", "Chennai", "Mumbai", "Delhi", "Pune"];
function CateringPage() {
  const navigate = useNavigate();
  const customerCoords = useCustomerGeo();
  const [caterers, setCaterers] = reactExports.useState([]);
  const [total, setTotal] = reactExports.useState(0);
  const [page, setPage] = reactExports.useState(1);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [search, setSearch] = reactExports.useState("");
  const [location, setLocation] = reactExports.useState("");
  const [inputVal, setInputVal] = reactExports.useState("");
  const LIMIT = 12;
  const fetchCaterers = reactExports.useCallback(async (s, loc, pg) => {
    setLoading(true);
    setError("");
    try {
      const data = await catererService.getCaterers({
        search: s || void 0,
        location: loc || void 0,
        page: pg,
        limit: LIMIT
      });
      setCaterers(data.caterers || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err?.message || "Failed to load caterers.");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchCaterers(search, location, page);
  }, [fetchCaterers, search, location, page]);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(inputVal.trim());
  };
  const handleLocation = (e) => {
    const val = e.target.value === "All" ? "" : e.target.value;
    setLocation(val);
    setPage(1);
  };
  const pageCount = Math.ceil(total / LIMIT);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { pt: 3, pb: 5 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", gap: 1, sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => navigate("/services"), sx: { color: brand.muted }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBackRoundedIcon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantRoundedIcon, { sx: { color: brand.orange, fontSize: 26 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800, lineHeight: 1.1 }, children: "Catering" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: [
          total,
          " caterer",
          total !== 1 ? "s" : "",
          " available"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, gap: 1.5, sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Box,
        {
          component: "form",
          onSubmit: handleSearchSubmit,
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
                placeholder: "Search caterer name…",
                value: inputVal,
                onChange: (e) => setInputVal(e.target.value),
                sx: { py: 1.1, fontSize: "0.9rem" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { type: "submit", size: "small", sx: { color: brand.orange }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchRoundedIcon, { fontSize: "small" }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { size: "small", sx: { minWidth: 160 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Select,
        {
          displayEmpty: true,
          value: location || "All",
          onChange: handleLocation,
          sx: { borderRadius: 6, backgroundColor: brand.white, fontSize: "0.9rem" },
          children: LOCATIONS.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: l, children: l === "All" ? "All Locations" : l }, l))
        }
      ) })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", sx: { mb: 2 }, children: error }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: brand.orange } }) }) : caterers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantRoundedIcon, { sx: { fontSize: 56, color: brand.border, mb: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { color: "text.secondary" }, children: "No caterers found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: "Try a different search or location" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: caterers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CatererCard, { caterer: c, onClick: () => navigate(`/services/catering/${c.id}`), customerCoords }) }, c.id)) }),
      pageCount > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", mt: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pagination,
        {
          count: pageCount,
          page,
          onChange: (_, v) => setPage(v),
          sx: { "& .MuiPaginationItem-root.Mui-selected": { backgroundColor: brand.orange, color: "white" } }
        }
      ) })
    ] })
  ] }) });
}
export {
  CateringPage as default
};
