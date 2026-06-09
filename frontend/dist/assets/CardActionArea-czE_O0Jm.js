import { g as generateUtilityClass, a as generateUtilityClasses, r as reactExports, b as useDefaultProps, c as clsx, j as jsxRuntimeExports, e as composeClasses, s as styled, m as memoTheme } from "./index-EstIw0RN.js";
import { d as useSlot, B as ButtonBase } from "./Logo-DCDhUauE.js";
function getCardActionAreaUtilityClass(slot) {
  return generateUtilityClass("MuiCardActionArea", slot);
}
const cardActionAreaClasses = generateUtilityClasses("MuiCardActionArea", ["root", "focusVisible", "focusHighlight"]);
const useUtilityClasses = (ownerState) => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ["root"],
    focusHighlight: ["focusHighlight"]
  };
  return composeClasses(slots, getCardActionAreaUtilityClass, classes);
};
const CardActionAreaRoot = styled(ButtonBase, {
  name: "MuiCardActionArea",
  slot: "Root"
})(memoTheme(({
  theme
}) => ({
  display: "block",
  textAlign: "inherit",
  borderRadius: "inherit",
  // for Safari to work https://github.com/mui/material-ui/issues/36285.
  width: "100%",
  [`&:hover .${cardActionAreaClasses.focusHighlight}`]: {
    opacity: (theme.vars || theme).palette.action.hoverOpacity,
    "@media (hover: none)": {
      opacity: 0
    }
  },
  [`&.${cardActionAreaClasses.focusVisible} .${cardActionAreaClasses.focusHighlight}`]: {
    opacity: (theme.vars || theme).palette.action.focusOpacity
  }
})));
const CardActionAreaFocusHighlight = styled("span", {
  name: "MuiCardActionArea",
  slot: "FocusHighlight"
})(memoTheme(({
  theme
}) => ({
  overflow: "hidden",
  pointerEvents: "none",
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  borderRadius: "inherit",
  opacity: 0,
  backgroundColor: "currentcolor",
  transition: theme.transitions.create("opacity", {
    duration: theme.transitions.duration.short
  })
})));
const CardActionArea = /* @__PURE__ */ reactExports.forwardRef(function CardActionArea2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiCardActionArea"
  });
  const {
    children,
    className,
    focusVisibleClassName,
    slots = {},
    slotProps = {},
    ...other
  } = props;
  const ownerState = props;
  const classes = useUtilityClasses(ownerState);
  const externalForwardedProps = {
    slots,
    slotProps
  };
  const [RootSlot, rootProps] = useSlot("root", {
    elementType: CardActionAreaRoot,
    externalForwardedProps: {
      ...externalForwardedProps,
      ...other
    },
    shouldForwardComponentProp: true,
    ownerState,
    ref,
    className: clsx(classes.root, className),
    additionalProps: {
      focusVisibleClassName: clsx(focusVisibleClassName, classes.focusVisible)
    }
  });
  const [FocusHighlightSlot, focusHighlightProps] = useSlot("focusHighlight", {
    elementType: CardActionAreaFocusHighlight,
    externalForwardedProps,
    ownerState,
    className: classes.focusHighlight
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(RootSlot, {
    ...rootProps,
    children: [children, /* @__PURE__ */ jsxRuntimeExports.jsx(FocusHighlightSlot, {
      ...focusHighlightProps
    })]
  });
});
export {
  CardActionArea as C
};
