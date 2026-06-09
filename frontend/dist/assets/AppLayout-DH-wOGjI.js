import { g as generateUtilityClass, a as generateUtilityClasses, r as reactExports, b as useDefaultProps, j as jsxRuntimeExports, c as clsx, p as capitalize, e as composeClasses, s as styled, m as memoTheme, q as createSimplePaletteValueFilter, o as useRtl, y as rootShouldForwardProp, v as useEnhancedEffect, T as useLocation, l as useCart, k as useNotifications, B as Box, h as brand, u as useNavigate } from "./index-EstIw0RN.js";
import { P as Paper, d as useSlot, u as useTheme, c as useForkRef, j as getReactElementRef, w as ownerWindow, a as Transition, y as debounce, n as normalizedTransitionCallback, g as getTransitionProps, G as reflow, q as mergeSlotProps, m as FOCUSABLE_ATTRIBUTE, M as Modal, t as ListContext, B as ButtonBase, T as Typography, H as typographyClasses, e as createSvgIcon, I as IconButton, L as Logo, f as List } from "./Logo-DCDhUauE.js";
import { g as getListItemIconUtilityClass, b as getListItemTextUtilityClass, a as listItemTextClasses, u as useMediaQuery, D as Divider } from "./index-BIPustA6.js";
function getAppBarUtilityClass(slot) {
  return generateUtilityClass("MuiAppBar", slot);
}
generateUtilityClasses("MuiAppBar", ["root", "positionFixed", "positionAbsolute", "positionSticky", "positionStatic", "positionRelative", "colorDefault", "colorPrimary", "colorSecondary", "colorInherit", "colorTransparent", "colorError", "colorInfo", "colorSuccess", "colorWarning"]);
const useUtilityClasses$6 = (ownerState) => {
  const {
    color,
    position,
    classes
  } = ownerState;
  const slots = {
    root: ["root", `color${capitalize(color)}`, `position${capitalize(position)}`]
  };
  return composeClasses(slots, getAppBarUtilityClass, classes);
};
const joinVars = (var1, var2) => var1 ? `${var1.replace(")", "")}, ${var2})` : var2;
const AppBarRoot = styled(Paper, {
  name: "MuiAppBar",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, styles[`position${capitalize(ownerState.position)}`], styles[`color${capitalize(ownerState.color)}`]];
  }
})(memoTheme(({
  theme
}) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  boxSizing: "border-box",
  // Prevent padding issue with the Modal and fixed positioned AppBar.
  flexShrink: 0,
  variants: [{
    props: {
      position: "fixed"
    },
    style: {
      position: "fixed",
      zIndex: (theme.vars || theme).zIndex.appBar,
      top: 0,
      left: "auto",
      right: 0,
      "@media print": {
        // Prevent the app bar to be visible on each printed page.
        position: "absolute"
      }
    }
  }, {
    props: {
      position: "absolute"
    },
    style: {
      position: "absolute",
      zIndex: (theme.vars || theme).zIndex.appBar,
      top: 0,
      left: "auto",
      right: 0
    }
  }, {
    props: {
      position: "sticky"
    },
    style: {
      position: "sticky",
      zIndex: (theme.vars || theme).zIndex.appBar,
      top: 0,
      left: "auto",
      right: 0
    }
  }, {
    props: {
      position: "static"
    },
    style: {
      position: "static"
    }
  }, {
    props: {
      position: "relative"
    },
    style: {
      position: "relative"
    }
  }, {
    props: {
      color: "inherit"
    },
    style: {
      "--AppBar-color": "inherit",
      color: "var(--AppBar-color)"
    }
  }, {
    props: {
      color: "default"
    },
    style: {
      "--AppBar-background": theme.vars ? theme.vars.palette.AppBar.defaultBg : theme.palette.grey[100],
      "--AppBar-color": theme.vars ? theme.vars.palette.text.primary : theme.palette.getContrastText(theme.palette.grey[100]),
      ...theme.applyStyles("dark", {
        "--AppBar-background": theme.vars ? theme.vars.palette.AppBar.defaultBg : theme.palette.grey[900],
        "--AppBar-color": theme.vars ? theme.vars.palette.text.primary : theme.palette.getContrastText(theme.palette.grey[900])
      })
    }
  }, ...Object.entries(theme.palette).filter(createSimplePaletteValueFilter(["contrastText"])).map(([color]) => ({
    props: {
      color
    },
    style: {
      "--AppBar-background": (theme.vars ?? theme).palette[color].main,
      "--AppBar-color": (theme.vars ?? theme).palette[color].contrastText
    }
  })), {
    props: (props) => props.enableColorOnDark === true && !["inherit", "transparent"].includes(props.color),
    style: {
      backgroundColor: "var(--AppBar-background)",
      color: "var(--AppBar-color)"
    }
  }, {
    props: (props) => props.enableColorOnDark === false && !["inherit", "transparent"].includes(props.color),
    style: {
      backgroundColor: "var(--AppBar-background)",
      color: "var(--AppBar-color)",
      ...theme.applyStyles("dark", {
        backgroundColor: theme.vars ? joinVars(theme.vars.palette.AppBar.darkBg, "var(--AppBar-background)") : null,
        color: theme.vars ? joinVars(theme.vars.palette.AppBar.darkColor, "var(--AppBar-color)") : null
      })
    }
  }, {
    props: {
      color: "transparent"
    },
    style: {
      "--AppBar-background": "transparent",
      "--AppBar-color": "inherit",
      backgroundColor: "var(--AppBar-background)",
      color: "var(--AppBar-color)",
      ...theme.applyStyles("dark", {
        backgroundImage: "none"
      })
    }
  }]
})));
const AppBar = /* @__PURE__ */ reactExports.forwardRef(function AppBar2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiAppBar"
  });
  const {
    className,
    color = "primary",
    enableColorOnDark = false,
    position = "fixed",
    ...other
  } = props;
  const ownerState = {
    ...props,
    color,
    position,
    enableColorOnDark
  };
  const classes = useUtilityClasses$6(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppBarRoot, {
    square: true,
    component: "header",
    ownerState,
    elevation: 4,
    className: clsx(classes.root, className, position === "fixed" && "mui-fixed"),
    ref,
    ...other
  });
});
function usePreviousProps(value) {
  const ref = reactExports.useRef({});
  reactExports.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
function useBadge(parameters) {
  const {
    badgeContent: badgeContentProp,
    invisible: invisibleProp = false,
    max: maxProp = 99,
    showZero = false
  } = parameters;
  const prevProps = usePreviousProps({
    badgeContent: badgeContentProp,
    max: maxProp
  });
  let invisible = invisibleProp;
  if (invisibleProp === false && badgeContentProp === 0 && !showZero) {
    invisible = true;
  }
  const {
    badgeContent,
    max = maxProp
  } = invisible ? prevProps : parameters;
  const displayValue = badgeContent && Number(badgeContent) > max ? `${max}+` : badgeContent;
  return {
    badgeContent,
    invisible,
    max,
    displayValue
  };
}
function getBadgeUtilityClass(slot) {
  return generateUtilityClass("MuiBadge", slot);
}
const badgeClasses = generateUtilityClasses("MuiBadge", [
  "root",
  "badge",
  "dot",
  "standard",
  "anchorOriginTopRight",
  "anchorOriginBottomRight",
  "anchorOriginTopLeft",
  "anchorOriginBottomLeft",
  "invisible",
  "colorError",
  "colorInfo",
  "colorPrimary",
  "colorSecondary",
  "colorSuccess",
  "colorWarning",
  "overlapRectangular",
  "overlapCircular",
  // TODO: v6 remove the overlap value from these class keys
  "anchorOriginTopLeftCircular",
  "anchorOriginTopLeftRectangular",
  "anchorOriginTopRightCircular",
  "anchorOriginTopRightRectangular",
  "anchorOriginBottomLeftCircular",
  "anchorOriginBottomLeftRectangular",
  "anchorOriginBottomRightCircular",
  "anchorOriginBottomRightRectangular"
]);
const RADIUS_STANDARD = 10;
const RADIUS_DOT = 4;
const useUtilityClasses$5 = (ownerState) => {
  const {
    color,
    anchorOrigin,
    invisible,
    overlap,
    variant,
    classes = {}
  } = ownerState;
  const slots = {
    root: ["root"],
    badge: ["badge", variant, invisible && "invisible", `anchorOrigin${capitalize(anchorOrigin.vertical)}${capitalize(anchorOrigin.horizontal)}`, `anchorOrigin${capitalize(anchorOrigin.vertical)}${capitalize(anchorOrigin.horizontal)}${capitalize(overlap)}`, `overlap${capitalize(overlap)}`, color !== "default" && `color${capitalize(color)}`]
  };
  return composeClasses(slots, getBadgeUtilityClass, classes);
};
const BadgeRoot = styled("span", {
  name: "MuiBadge",
  slot: "Root"
})({
  position: "relative",
  display: "inline-flex",
  // For correct alignment with the text.
  verticalAlign: "middle",
  flexShrink: 0
});
const BadgeBadge = styled("span", {
  name: "MuiBadge",
  slot: "Badge",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.badge, styles[ownerState.variant], styles[`anchorOrigin${capitalize(ownerState.anchorOrigin.vertical)}${capitalize(ownerState.anchorOrigin.horizontal)}${capitalize(ownerState.overlap)}`], ownerState.color !== "default" && styles[`color${capitalize(ownerState.color)}`], ownerState.invisible && styles.invisible];
  }
})(memoTheme(({
  theme
}) => ({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  alignContent: "center",
  alignItems: "center",
  position: "absolute",
  boxSizing: "border-box",
  fontFamily: theme.typography.fontFamily,
  fontWeight: theme.typography.fontWeightMedium,
  fontSize: theme.typography.pxToRem(12),
  minWidth: RADIUS_STANDARD * 2,
  lineHeight: 1,
  padding: "0 6px",
  height: RADIUS_STANDARD * 2,
  borderRadius: RADIUS_STANDARD,
  zIndex: 1,
  // Render the badge on top of potential ripples.
  transition: theme.transitions.create("transform", {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.enteringScreen
  }),
  variants: [...Object.entries(theme.palette).filter(createSimplePaletteValueFilter(["contrastText"])).map(([color]) => ({
    props: {
      color
    },
    style: {
      backgroundColor: (theme.vars || theme).palette[color].main,
      color: (theme.vars || theme).palette[color].contrastText
    }
  })), {
    props: {
      variant: "dot"
    },
    style: {
      borderRadius: RADIUS_DOT,
      height: RADIUS_DOT * 2,
      minWidth: RADIUS_DOT * 2,
      padding: 0
    }
  }, {
    props: {
      invisible: true
    },
    style: {
      transition: theme.transitions.create("transform", {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.leavingScreen
      })
    }
  }, {
    style: ({
      ownerState
    }) => {
      const {
        vertical,
        horizontal
      } = ownerState.anchorOrigin;
      const offset = ownerState.overlap === "circular" ? "14%" : 0;
      return {
        "--Badge-translateX": horizontal === "right" ? "50%" : "-50%",
        "--Badge-translateY": vertical === "top" ? "-50%" : "50%",
        top: vertical === "top" ? offset : "initial",
        bottom: vertical === "bottom" ? offset : "initial",
        right: horizontal === "right" ? offset : "initial",
        left: horizontal === "left" ? offset : "initial",
        transform: "scale(1) translate(var(--Badge-translateX), var(--Badge-translateY))",
        transformOrigin: `${horizontal === "right" ? "100%" : "0%"} ${vertical === "top" ? "0%" : "100%"}`,
        [`&.${badgeClasses.invisible}`]: {
          transform: "scale(0) translate(var(--Badge-translateX), var(--Badge-translateY))"
        }
      };
    }
  }]
})));
function getAnchorOrigin(anchorOrigin) {
  return {
    vertical: anchorOrigin?.vertical ?? "top",
    horizontal: anchorOrigin?.horizontal ?? "right"
  };
}
const Badge = /* @__PURE__ */ reactExports.forwardRef(function Badge2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiBadge"
  });
  const {
    anchorOrigin: anchorOriginProp,
    className,
    classes: classesProp,
    component,
    components = {},
    componentsProps = {},
    children,
    overlap: overlapProp = "rectangular",
    color: colorProp = "default",
    invisible: invisibleProp = false,
    max: maxProp = 99,
    badgeContent: badgeContentProp,
    slots,
    slotProps,
    showZero = false,
    variant: variantProp = "standard",
    ...other
  } = props;
  const {
    badgeContent,
    invisible: invisibleFromHook,
    max,
    displayValue: displayValueFromHook
  } = useBadge({
    max: maxProp,
    invisible: invisibleProp,
    badgeContent: badgeContentProp,
    showZero
  });
  const prevProps = usePreviousProps({
    anchorOrigin: getAnchorOrigin(anchorOriginProp),
    color: colorProp,
    overlap: overlapProp,
    variant: variantProp,
    badgeContent: badgeContentProp
  });
  const invisible = invisibleFromHook || badgeContent == null && variantProp !== "dot";
  const {
    color = colorProp,
    overlap = overlapProp,
    anchorOrigin: anchorOriginPropProp,
    variant = variantProp
  } = invisible ? prevProps : props;
  const anchorOrigin = getAnchorOrigin(anchorOriginPropProp);
  const displayValue = variant !== "dot" ? displayValueFromHook : void 0;
  const ownerState = {
    ...props,
    badgeContent,
    invisible,
    max,
    displayValue,
    showZero,
    anchorOrigin,
    color,
    overlap,
    variant
  };
  const classes = useUtilityClasses$5(ownerState);
  const externalForwardedProps = {
    slots: {
      root: slots?.root ?? components.Root,
      badge: slots?.badge ?? components.Badge
    },
    slotProps: {
      root: slotProps?.root ?? componentsProps.root,
      badge: slotProps?.badge ?? componentsProps.badge
    }
  };
  const [RootSlot, rootProps] = useSlot("root", {
    elementType: BadgeRoot,
    externalForwardedProps: {
      ...externalForwardedProps,
      ...other
    },
    ownerState,
    className: clsx(classes.root, className),
    ref,
    additionalProps: {
      as: component
    }
  });
  const [BadgeSlot, badgeProps] = useSlot("badge", {
    elementType: BadgeBadge,
    externalForwardedProps,
    ownerState,
    className: classes.badge
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(RootSlot, {
    ...rootProps,
    children: [children, /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeSlot, {
      ...badgeProps,
      children: displayValue
    })]
  });
});
const hiddenStyles = {
  visibility: "hidden"
};
function getTranslateValue(direction, node, resolvedContainer) {
  const containerRect = resolvedContainer && resolvedContainer.getBoundingClientRect();
  const containerWindow = ownerWindow(node);
  const previousTransform = node.style.transform;
  const previousTransition = node.style.transition;
  node.style.transition = "";
  node.style.transform = "";
  const rect = node.getBoundingClientRect();
  const computedStyle = containerWindow.getComputedStyle(node);
  const transform = computedStyle.getPropertyValue("transform");
  node.style.transform = previousTransform;
  node.style.transition = previousTransition;
  let offsetX = 0;
  let offsetY = 0;
  if (transform && transform !== "none" && typeof transform === "string") {
    const transformValues = transform.split("(")[1].split(")")[0].split(",");
    offsetX = parseInt(transformValues[4], 10);
    offsetY = parseInt(transformValues[5], 10);
  }
  if (direction === "left") {
    if (containerRect) {
      return `translateX(${containerRect.right + offsetX - rect.left}px)`;
    }
    return `translateX(${containerWindow.innerWidth + offsetX - rect.left}px)`;
  }
  if (direction === "right") {
    if (containerRect) {
      return `translateX(-${rect.right - containerRect.left - offsetX}px)`;
    }
    return `translateX(-${rect.left + rect.width - offsetX}px)`;
  }
  if (direction === "up") {
    if (containerRect) {
      return `translateY(${containerRect.bottom + offsetY - rect.top}px)`;
    }
    return `translateY(${containerWindow.innerHeight + offsetY - rect.top}px)`;
  }
  if (containerRect) {
    return `translateY(-${rect.top - containerRect.top + rect.height - offsetY}px)`;
  }
  return `translateY(-${rect.top + rect.height - offsetY}px)`;
}
function resolveContainer(containerPropProp) {
  return typeof containerPropProp === "function" ? containerPropProp() : containerPropProp;
}
function setTranslateValue(direction, node, containerProp) {
  const resolvedContainer = resolveContainer(containerProp);
  const transform = getTranslateValue(direction, node, resolvedContainer);
  if (transform) {
    node.style.transform = transform;
  }
}
const Slide = /* @__PURE__ */ reactExports.forwardRef(function Slide2(props, ref) {
  const theme = useTheme();
  const defaultEasing = {
    enter: theme.transitions.easing.easeOut,
    exit: theme.transitions.easing.sharp
  };
  const defaultTimeout = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen
  };
  const {
    addEndListener,
    appear = true,
    children,
    container: containerProp,
    direction = "down",
    easing: easingProp = defaultEasing,
    in: inProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    style,
    timeout = defaultTimeout,
    ...other
  } = props;
  const childrenRef = reactExports.useRef(null);
  const handleRef = useForkRef(getReactElementRef(children), childrenRef, ref);
  const handleEnter = normalizedTransitionCallback(childrenRef, (node, isAppearing) => {
    setTranslateValue(direction, node, containerProp);
    reflow(node);
    if (onEnter) {
      onEnter(node, isAppearing);
    }
  });
  const handleEntering = normalizedTransitionCallback(childrenRef, (node, isAppearing) => {
    const transitionProps = getTransitionProps({
      timeout,
      style,
      easing: easingProp
    }, {
      mode: "enter"
    });
    node.style.transition = theme.transitions.create("transform", transitionProps);
    node.style.transform = "none";
    if (onEntering) {
      onEntering(node, isAppearing);
    }
  });
  const handleEntered = normalizedTransitionCallback(childrenRef, onEntered);
  const handleExiting = normalizedTransitionCallback(childrenRef, onExiting);
  const handleExit = normalizedTransitionCallback(childrenRef, (node) => {
    const transitionProps = getTransitionProps({
      timeout,
      style,
      easing: easingProp
    }, {
      mode: "exit"
    });
    node.style.transition = theme.transitions.create("transform", transitionProps);
    setTranslateValue(direction, node, containerProp);
    if (onExit) {
      onExit(node);
    }
  });
  const handleExited = normalizedTransitionCallback(childrenRef, (node) => {
    node.style.transition = "";
    if (onExited) {
      onExited(node);
    }
  });
  const handleAddEndListener = (next) => {
    if (addEndListener) {
      addEndListener(childrenRef.current, next);
    }
  };
  const updatePosition = reactExports.useCallback(() => {
    if (childrenRef.current) {
      setTranslateValue(direction, childrenRef.current, containerProp);
    }
  }, [direction, containerProp]);
  reactExports.useEffect(() => {
    if (inProp || direction === "down" || direction === "right") {
      return void 0;
    }
    const handleResize = debounce(() => {
      if (childrenRef.current) {
        setTranslateValue(direction, childrenRef.current, containerProp);
      }
    });
    const containerWindow = ownerWindow(childrenRef.current);
    containerWindow.addEventListener("resize", handleResize);
    return () => {
      handleResize.clear();
      containerWindow.removeEventListener("resize", handleResize);
    };
  }, [direction, inProp, containerProp]);
  reactExports.useEffect(() => {
    if (!inProp) {
      updatePosition();
    }
  }, [inProp, updatePosition]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Transition, {
    nodeRef: childrenRef,
    onEnter: handleEnter,
    onEntered: handleEntered,
    onEntering: handleEntering,
    onExit: handleExit,
    onExited: handleExited,
    onExiting: handleExiting,
    addEndListener: handleAddEndListener,
    appear,
    in: inProp,
    timeout,
    ...other,
    children: (state, {
      ownerState,
      ...restChildProps
    }) => {
      let childStyle;
      if (state === "exited" && !inProp) {
        childStyle = style || children.props.style ? {
          visibility: "hidden",
          ...style,
          ...children.props.style
        } : hiddenStyles;
      } else if (style && children.props.style) {
        childStyle = {
          ...style,
          ...children.props.style
        };
      } else {
        childStyle = style || children.props.style;
      }
      return /* @__PURE__ */ reactExports.cloneElement(children, {
        ref: handleRef,
        style: childStyle,
        ...restChildProps
      });
    }
  });
});
function getDrawerUtilityClass(slot) {
  return generateUtilityClass("MuiDrawer", slot);
}
generateUtilityClasses("MuiDrawer", ["root", "docked", "paper", "anchorLeft", "anchorRight", "anchorTop", "anchorBottom", "paperAnchorLeft", "paperAnchorRight", "paperAnchorTop", "paperAnchorBottom", "paperAnchorDockedLeft", "paperAnchorDockedRight", "paperAnchorDockedTop", "paperAnchorDockedBottom", "modal"]);
const overridesResolver$1 = (props, styles) => {
  const {
    ownerState
  } = props;
  return [styles.root, (ownerState.variant === "permanent" || ownerState.variant === "persistent") && styles.docked, ownerState.variant === "temporary" && styles.modal];
};
const useUtilityClasses$4 = (ownerState) => {
  const {
    classes,
    anchor,
    variant
  } = ownerState;
  const slots = {
    root: ["root", `anchor${capitalize(anchor)}`],
    docked: [(variant === "permanent" || variant === "persistent") && "docked"],
    modal: ["modal"],
    paper: ["paper", `paperAnchor${capitalize(anchor)}`, variant !== "temporary" && `paperAnchorDocked${capitalize(anchor)}`]
  };
  return composeClasses(slots, getDrawerUtilityClass, classes);
};
const DrawerRoot = styled(Modal, {
  name: "MuiDrawer",
  slot: "Root",
  overridesResolver: overridesResolver$1
})(memoTheme(({
  theme
}) => ({
  zIndex: (theme.vars || theme).zIndex.drawer
})));
const DrawerDockedRoot = styled("div", {
  shouldForwardProp: rootShouldForwardProp,
  name: "MuiDrawer",
  slot: "Docked",
  skipVariantsResolver: false,
  overridesResolver: overridesResolver$1
})({
  flex: "0 0 auto"
});
const DrawerPaper = styled(Paper, {
  name: "MuiDrawer",
  slot: "Paper",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.paper, styles[`paperAnchor${capitalize(ownerState.anchor)}`], ownerState.variant !== "temporary" && styles[`paperAnchorDocked${capitalize(ownerState.anchor)}`]];
  }
})(memoTheme(({
  theme
}) => ({
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  flex: "1 0 auto",
  zIndex: (theme.vars || theme).zIndex.drawer,
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: "touch",
  // temporary style
  position: "fixed",
  top: 0,
  // We disable the focus ring for mouse, touch and keyboard users.
  // At some point, it would be better to keep it for keyboard users.
  // :focus-ring CSS pseudo-class will help.
  outline: 0,
  variants: [{
    props: {
      anchor: "left"
    },
    style: {
      left: 0
    }
  }, {
    props: {
      anchor: "top"
    },
    style: {
      top: 0,
      left: 0,
      right: 0,
      height: "auto",
      maxHeight: "100%"
    }
  }, {
    props: {
      anchor: "right"
    },
    style: {
      right: 0
    }
  }, {
    props: {
      anchor: "bottom"
    },
    style: {
      top: "auto",
      left: 0,
      bottom: 0,
      right: 0,
      height: "auto",
      maxHeight: "100%"
    }
  }, {
    props: ({
      ownerState
    }) => ownerState.anchor === "left" && ownerState.variant !== "temporary",
    style: {
      borderRight: `1px solid ${(theme.vars || theme).palette.divider}`
    }
  }, {
    props: ({
      ownerState
    }) => ownerState.anchor === "top" && ownerState.variant !== "temporary",
    style: {
      borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`
    }
  }, {
    props: ({
      ownerState
    }) => ownerState.anchor === "right" && ownerState.variant !== "temporary",
    style: {
      borderLeft: `1px solid ${(theme.vars || theme).palette.divider}`
    }
  }, {
    props: ({
      ownerState
    }) => ownerState.anchor === "bottom" && ownerState.variant !== "temporary",
    style: {
      borderTop: `1px solid ${(theme.vars || theme).palette.divider}`
    }
  }]
})));
const oppositeDirection = {
  left: "right",
  right: "left",
  top: "down",
  bottom: "up"
};
function isHorizontal(anchor) {
  return ["left", "right"].includes(anchor);
}
function getAnchor({
  direction
}, anchor) {
  return direction === "rtl" && isHorizontal(anchor) ? oppositeDirection[anchor] : anchor;
}
const Drawer = /* @__PURE__ */ reactExports.forwardRef(function Drawer2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiDrawer"
  });
  const theme = useTheme();
  const isRtl = useRtl();
  const defaultTransitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen
  };
  const {
    anchor: anchorProp = "left",
    BackdropProps,
    children,
    className,
    elevation = 16,
    hideBackdrop = false,
    ModalProps: {
      BackdropProps: BackdropPropsProp,
      ...ModalProps
    } = {},
    onClose,
    open = false,
    PaperProps = {},
    SlideProps,
    // eslint-disable-next-line react/prop-types
    TransitionComponent,
    transitionDuration = defaultTransitionDuration,
    variant = "temporary",
    slots = {},
    slotProps = {},
    ...other
  } = props;
  const mounted = reactExports.useRef(false);
  const rootRef = reactExports.useRef(null);
  const handleRef = useForkRef(ref, rootRef);
  reactExports.useEffect(() => {
    mounted.current = true;
  }, []);
  const resolveSlideContainer = reactExports.useCallback(() => rootRef.current, []);
  const anchorInvariant = getAnchor({
    direction: isRtl ? "rtl" : "ltr"
  }, anchorProp);
  const anchor = anchorProp;
  const ownerState = {
    ...props,
    anchor,
    elevation,
    open,
    variant,
    ...other
  };
  const classes = useUtilityClasses$4(ownerState);
  const externalForwardedProps = {
    slots: {
      transition: TransitionComponent,
      ...slots
    },
    slotProps: {
      paper: PaperProps,
      transition: SlideProps,
      ...slotProps,
      backdrop: mergeSlotProps(slotProps.backdrop || {
        ...BackdropProps,
        ...BackdropPropsProp
      }, {
        transitionDuration
      })
    }
  };
  const [RootSlot, rootSlotProps] = useSlot("root", {
    ref: handleRef,
    elementType: DrawerRoot,
    className: clsx(classes.root, classes.modal, className),
    shouldForwardComponentProp: true,
    ownerState,
    externalForwardedProps: {
      ...externalForwardedProps,
      ...other,
      ...ModalProps
    },
    additionalProps: {
      closeAfterTransition: true,
      open,
      onClose,
      hideBackdrop,
      slots: {
        backdrop: externalForwardedProps.slots.backdrop
      },
      slotProps: {
        backdrop: externalForwardedProps.slotProps.backdrop
      }
    }
  });
  const [PaperSlot, paperSlotProps] = useSlot("paper", {
    elementType: DrawerPaper,
    shouldForwardComponentProp: true,
    className: clsx(classes.paper, PaperProps.className),
    ownerState,
    externalForwardedProps,
    additionalProps: {
      elevation: variant === "temporary" ? elevation : 0,
      square: true,
      ...variant === "temporary" && {
        role: "dialog",
        "aria-modal": "true",
        [FOCUSABLE_ATTRIBUTE]: "",
        tabIndex: -1
      }
    }
  });
  const [DockedSlot, dockedSlotProps] = useSlot("docked", {
    elementType: DrawerDockedRoot,
    ref: handleRef,
    className: clsx(classes.root, classes.docked, className),
    ownerState,
    externalForwardedProps,
    additionalProps: other
    // pass `other` here because `DockedSlot` is also a root slot for some variants
  });
  const [TransitionSlot, transitionSlotProps] = useSlot("transition", {
    elementType: Slide,
    ownerState,
    externalForwardedProps,
    additionalProps: {
      in: open,
      direction: oppositeDirection[anchorInvariant],
      timeout: transitionDuration,
      appear: mounted.current,
      ...variant === "temporary" && (slots.transition == null || slots.transition === Slide) && {
        container: resolveSlideContainer
      }
    }
  });
  const drawer = /* @__PURE__ */ jsxRuntimeExports.jsx(PaperSlot, {
    ...paperSlotProps,
    children
  });
  if (variant === "permanent") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DockedSlot, {
      ...dockedSlotProps,
      children: drawer
    });
  }
  const slidingDrawer = /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionSlot, {
    ...transitionSlotProps,
    children: drawer
  });
  if (variant === "persistent") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DockedSlot, {
      ...dockedSlotProps,
      children: slidingDrawer
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RootSlot, {
    ...rootSlotProps,
    children: slidingDrawer
  });
});
function getListItemButtonUtilityClass(slot) {
  return generateUtilityClass("MuiListItemButton", slot);
}
const listItemButtonClasses = generateUtilityClasses("MuiListItemButton", ["root", "focusVisible", "dense", "alignItemsFlexStart", "disabled", "divider", "gutters", "selected"]);
const overridesResolver = (props, styles) => {
  const {
    ownerState
  } = props;
  return [styles.root, ownerState.dense && styles.dense, ownerState.alignItems === "flex-start" && styles.alignItemsFlexStart, ownerState.divider && styles.divider, !ownerState.disableGutters && styles.gutters];
};
const useUtilityClasses$3 = (ownerState) => {
  const {
    alignItems,
    classes,
    dense,
    disabled,
    disableGutters,
    divider,
    selected
  } = ownerState;
  const slots = {
    root: ["root", dense && "dense", !disableGutters && "gutters", divider && "divider", disabled && "disabled", alignItems === "flex-start" && "alignItemsFlexStart", selected && "selected"]
  };
  const composedClasses = composeClasses(slots, getListItemButtonUtilityClass, classes);
  return {
    ...classes,
    ...composedClasses
  };
};
const ListItemButtonRoot = styled(ButtonBase, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === "classes",
  name: "MuiListItemButton",
  slot: "Root",
  overridesResolver
})(memoTheme(({
  theme
}) => ({
  display: "flex",
  flexGrow: 1,
  justifyContent: "flex-start",
  alignItems: "center",
  position: "relative",
  textDecoration: "none",
  minWidth: 0,
  boxSizing: "border-box",
  textAlign: "left",
  paddingTop: 8,
  paddingBottom: 8,
  transition: theme.transitions.create("background-color", {
    duration: theme.transitions.duration.shortest
  }),
  "&:hover": {
    textDecoration: "none",
    backgroundColor: (theme.vars || theme).palette.action.hover,
    // Reset on touch devices, it doesn't add specificity
    "@media (hover: none)": {
      backgroundColor: "transparent"
    }
  },
  [`&.${listItemButtonClasses.selected}`]: {
    backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, (theme.vars || theme).palette.action.selectedOpacity),
    [`&.${listItemButtonClasses.focusVisible}`]: {
      backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.focusOpacity}`)
    }
  },
  [`&.${listItemButtonClasses.selected}:hover`]: {
    backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.hoverOpacity}`),
    // Reset on touch devices, it doesn't add specificity
    "@media (hover: none)": {
      backgroundColor: theme.alpha((theme.vars || theme).palette.primary.main, (theme.vars || theme).palette.action.selectedOpacity)
    }
  },
  [`&.${listItemButtonClasses.focusVisible}`]: {
    backgroundColor: (theme.vars || theme).palette.action.focus
  },
  [`&.${listItemButtonClasses.disabled}`]: {
    opacity: (theme.vars || theme).palette.action.disabledOpacity
  },
  variants: [{
    props: ({
      ownerState
    }) => ownerState.divider,
    style: {
      borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`,
      backgroundClip: "padding-box"
    }
  }, {
    props: {
      alignItems: "flex-start"
    },
    style: {
      alignItems: "flex-start"
    }
  }, {
    props: ({
      ownerState
    }) => !ownerState.disableGutters,
    style: {
      paddingLeft: 16,
      paddingRight: 16
    }
  }, {
    props: ({
      ownerState
    }) => ownerState.dense,
    style: {
      paddingTop: 4,
      paddingBottom: 4
    }
  }]
})));
const ListItemButton = /* @__PURE__ */ reactExports.forwardRef(function ListItemButton2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiListItemButton"
  });
  const {
    alignItems = "center",
    autoFocus = false,
    component = "div",
    children,
    dense = false,
    disableGutters = false,
    divider = false,
    focusVisibleClassName,
    selected = false,
    className,
    ...other
  } = props;
  const context = reactExports.useContext(ListContext);
  const childContext = reactExports.useMemo(() => ({
    dense: dense || context.dense || false,
    alignItems,
    disableGutters
  }), [alignItems, context.dense, dense, disableGutters]);
  const listItemRef = reactExports.useRef(null);
  useEnhancedEffect(() => {
    if (autoFocus) {
      if (listItemRef.current) {
        listItemRef.current.focus();
      }
    }
  }, [autoFocus]);
  const ownerState = {
    ...props,
    alignItems,
    dense: childContext.dense,
    disableGutters,
    divider,
    selected
  };
  const classes = useUtilityClasses$3(ownerState);
  const {
    root,
    ...forwardedClasses
  } = classes;
  const handleRef = useForkRef(listItemRef, ref);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ListContext.Provider, {
    value: childContext,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemButtonRoot, {
      ref: handleRef,
      href: other.href || other.to,
      component: (other.href || other.to) && component === "div" ? "button" : component,
      focusVisibleClassName: clsx(classes.focusVisible, focusVisibleClassName),
      ownerState,
      className: clsx(classes.root, className),
      ...other,
      classes: forwardedClasses,
      children
    })
  });
});
const useUtilityClasses$2 = (ownerState) => {
  const {
    alignItems,
    classes
  } = ownerState;
  const slots = {
    root: ["root", alignItems === "flex-start" && "alignItemsFlexStart"]
  };
  return composeClasses(slots, getListItemIconUtilityClass, classes);
};
const ListItemIconRoot = styled("div", {
  name: "MuiListItemIcon",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, ownerState.alignItems === "flex-start" && styles.alignItemsFlexStart];
  }
})(memoTheme(({
  theme
}) => ({
  minWidth: 56,
  color: (theme.vars || theme).palette.action.active,
  flexShrink: 0,
  display: "inline-flex",
  variants: [{
    props: {
      alignItems: "flex-start"
    },
    style: {
      marginTop: 8
    }
  }]
})));
const ListItemIcon = /* @__PURE__ */ reactExports.forwardRef(function ListItemIcon2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiListItemIcon"
  });
  const {
    className,
    ...other
  } = props;
  const context = reactExports.useContext(ListContext);
  const ownerState = {
    ...props,
    alignItems: context.alignItems
  };
  const classes = useUtilityClasses$2(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIconRoot, {
    className: clsx(classes.root, className),
    ownerState,
    ref,
    ...other
  });
});
const useUtilityClasses$1 = (ownerState) => {
  const {
    classes,
    inset,
    primary,
    secondary,
    dense
  } = ownerState;
  const slots = {
    root: ["root", inset && "inset", dense && "dense", primary && secondary && "multiline"],
    primary: ["primary"],
    secondary: ["secondary"]
  };
  return composeClasses(slots, getListItemTextUtilityClass, classes);
};
const ListItemTextRoot = styled("div", {
  name: "MuiListItemText",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [{
      [`& .${listItemTextClasses.primary}`]: styles.primary
    }, {
      [`& .${listItemTextClasses.secondary}`]: styles.secondary
    }, styles.root, ownerState.inset && styles.inset, ownerState.primary && ownerState.secondary && styles.multiline, ownerState.dense && styles.dense];
  }
})({
  flex: "1 1 auto",
  minWidth: 0,
  marginTop: 4,
  marginBottom: 4,
  // Combine this and the below selector once https://github.com/emotion-js/emotion/issues/3366 is solved
  [`.${typographyClasses.root}:where(& .${listItemTextClasses.primary})`]: {
    display: "block"
  },
  [`.${typographyClasses.root}:where(& .${listItemTextClasses.secondary})`]: {
    display: "block"
  },
  variants: [{
    props: ({
      ownerState
    }) => ownerState.primary && ownerState.secondary,
    style: {
      marginTop: 6,
      marginBottom: 6
    }
  }, {
    props: ({
      ownerState
    }) => ownerState.inset,
    style: {
      paddingLeft: 56
    }
  }]
});
const ListItemText = /* @__PURE__ */ reactExports.forwardRef(function ListItemText2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiListItemText"
  });
  const {
    children,
    className,
    disableTypography = false,
    inset = false,
    primary: primaryProp,
    primaryTypographyProps,
    secondary: secondaryProp,
    secondaryTypographyProps,
    slots = {},
    slotProps = {},
    ...other
  } = props;
  const {
    dense
  } = reactExports.useContext(ListContext);
  let primary = primaryProp != null ? primaryProp : children;
  let secondary = secondaryProp;
  const ownerState = {
    ...props,
    disableTypography,
    inset,
    primary: !!primary,
    secondary: !!secondary,
    dense
  };
  const classes = useUtilityClasses$1(ownerState);
  const externalForwardedProps = {
    slots,
    slotProps: {
      primary: primaryTypographyProps,
      secondary: secondaryTypographyProps,
      ...slotProps
    }
  };
  const [RootSlot, rootSlotProps] = useSlot("root", {
    className: clsx(classes.root, className),
    elementType: ListItemTextRoot,
    externalForwardedProps: {
      ...externalForwardedProps,
      ...other
    },
    ownerState,
    ref
  });
  const [PrimarySlot, primarySlotProps] = useSlot("primary", {
    className: classes.primary,
    elementType: Typography,
    externalForwardedProps,
    ownerState
  });
  const [SecondarySlot, secondarySlotProps] = useSlot("secondary", {
    className: classes.secondary,
    elementType: Typography,
    externalForwardedProps,
    ownerState
  });
  if (primary != null && primary.type !== Typography && !disableTypography) {
    primary = /* @__PURE__ */ jsxRuntimeExports.jsx(PrimarySlot, {
      variant: dense ? "body2" : "body1",
      component: primarySlotProps?.variant ? void 0 : "span",
      ...primarySlotProps,
      children: primary
    });
  }
  if (secondary != null && secondary.type !== Typography && !disableTypography) {
    secondary = /* @__PURE__ */ jsxRuntimeExports.jsx(SecondarySlot, {
      variant: "body2",
      color: "textSecondary",
      ...secondarySlotProps,
      children: secondary
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(RootSlot, {
    ...rootSlotProps,
    children: [primary, secondary]
  });
});
function getToolbarUtilityClass(slot) {
  return generateUtilityClass("MuiToolbar", slot);
}
generateUtilityClasses("MuiToolbar", ["root", "gutters", "regular", "dense"]);
const useUtilityClasses = (ownerState) => {
  const {
    classes,
    disableGutters,
    variant
  } = ownerState;
  const slots = {
    root: ["root", !disableGutters && "gutters", variant]
  };
  return composeClasses(slots, getToolbarUtilityClass, classes);
};
const ToolbarRoot = styled("div", {
  name: "MuiToolbar",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, !ownerState.disableGutters && styles.gutters, styles[ownerState.variant]];
  }
})(memoTheme(({
  theme
}) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  variants: [{
    props: ({
      ownerState
    }) => !ownerState.disableGutters,
    style: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3)
      }
    }
  }, {
    props: {
      variant: "dense"
    },
    style: {
      minHeight: 48
    }
  }, {
    props: {
      variant: "regular"
    },
    style: theme.mixins.toolbar
  }]
})));
const Toolbar = /* @__PURE__ */ reactExports.forwardRef(function Toolbar2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiToolbar"
  });
  const {
    className,
    component = "div",
    disableGutters = false,
    variant = "regular",
    ...other
  } = props;
  const ownerState = {
    ...props,
    component,
    disableGutters,
    variant
  };
  const classes = useUtilityClasses(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ToolbarRoot, {
    as: component,
    className: clsx(classes.root, className),
    ref,
    ownerState,
    ...other
  });
});
const LunchDiningRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M3.37 14.28c.79-.29 1.17-.78 1.99-.78 1.19 0 1.42 1 3.33 1 1.95 0 2.09-1 3.33-1 1.19 0 1.42 1 3.33 1 1.95 0 2.09-1 3.33-1 .81 0 1.17.46 1.93.76.67.26 1.39-.25 1.39-.96 0-.43-.28-.81-.69-.96-.97-.35-1.22-.83-2.65-.83-1.95 0-2.09 1-3.33 1-1.19 0-1.42-1-3.33-1-1.95 0-2.09 1-3.33 1-1.19 0-1.42-1-3.33-1-1.55 0-1.96.63-2.68.89-.39.14-.65.52-.65.94 0 .69.7 1.18 1.36.94M2 19c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-1c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2zM22 9c.02-4-4.28-6-10-6C6.29 3 2 5 2 9c0 .55.45 1 1 1h18c.55 0 1-.45 1-1"
}));
const HomeRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1"
}));
const MenuRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1m0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1M3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1"
}));
const ReceiptLongRoundedIcon = createSvgIcon([/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M14 9h-4c-.55 0-1-.45-1-1s.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1m0 3h-4c-.55 0-1-.45-1-1s.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1"
}, "0"), /* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M19.5 3.5 18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H4c-.55 0-1 .45-1 1v2c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2zM15 20H6c-.55 0-1-.45-1-1v-1h10zm4-1c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55-.45-1-1-1H8V5h11z"
}, "1"), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
  cx: "17",
  cy: "8",
  r: "1"
}, "2"), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
  cx: "17",
  cy: "11",
  r: "1"
}, "3")]);
const PersonRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4"
}));
const DashboardRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1m0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1m10 0h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1M13 4v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1"
}));
const AddCircleOutlineRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 7c-.55 0-1 .45-1 1v3H8c-.55 0-1 .45-1 1s.45 1 1 1h3v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1h-3V8c0-.55-.45-1-1-1m0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8"
}));
const RestaurantMenuRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "m8.1 13.34 2.83-2.83-6.19-6.18c-.48-.48-1.31-.35-1.61.27-.71 1.49-.45 3.32.78 4.56zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L4.4 19.17c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L12 14.41l6.18 6.18c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L13.41 13z"
}));
const ListAltRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 9h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1s.45 1 1 1m0 4h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1s.45 1 1 1m0 4h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1s.45 1 1 1M7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zM20 3H4c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1m-1 16H5V5h14z"
}));
const NotificationsNoneRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M19.29 17.29 18 16v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29c-.63.63-.19 1.71.7 1.71h13.17c.9 0 1.34-1.08.71-1.71M16 17H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5zm-4 5c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2"
}));
const ShoppingCartRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2M1 3c0 .55.45 1 1 1h1l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11c.55 0 1-.45 1-1s-.45-1-1-1H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.67-1.43c-.16-.35-.52-.57-.9-.57H2c-.55 0-1 .45-1 1m16 15c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2"
}));
const LogoutRoundedIcon = createSvgIcon([/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M5 5h6c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h6c.55 0 1-.45 1-1s-.45-1-1-1H5z"
}, "0"), /* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "m20.65 11.65-2.79-2.79c-.32-.32-.86-.1-.86.35V11h-7c-.55 0-1 .45-1 1s.45 1 1 1h7v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.19.2-.51.01-.7"
}, "1")]);
const RoomServiceRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M3 17h18c.55 0 1 .45 1 1s-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1m10.84-9.21c.1-.24.16-.51.16-.79 0-1.1-.9-2-2-2s-2 .9-2 2c0 .28.06.55.16.79C6.25 8.6 3.27 11.93 3 16h18c-.27-4.07-3.25-7.4-7.16-8.21"
}));
const CircleRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2"
}));
const PeopleRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V18c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-1.5c0-2.33-4.67-3.5-7-3.5m8 0c-.29 0-.62.02-.97.05.02.01.03.03.04.04 1.14.83 1.93 1.94 1.93 3.41V18c0 .35-.07.69-.18 1H22c.55 0 1-.45 1-1v-1.5c0-2.33-4.67-3.5-7-3.5"
}));
const StorefrontRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "m21.9 7.89-1.05-3.37c-.22-.9-1-1.52-1.91-1.52H5.05c-.9 0-1.69.63-1.9 1.52L2.1 7.89c-.46 1.97.85 3.11.9 3.17V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7.94c1.12-1.12 1.09-2.41.9-3.17M13 5h1.96l.54 3.52c.09.71-.39 1.48-1.28 1.48-.67 0-1.22-.59-1.22-1.31zM6.44 8.86c-.08.65-.6 1.14-1.21 1.14-.93 0-1.35-.97-1.19-1.64L5.05 5h1.97zM11 8.69c0 .72-.55 1.31-1.29 1.31-.75 0-1.3-.7-1.22-1.48L9.04 5H11zM18.77 10c-.61 0-1.14-.49-1.21-1.14L16.98 5l1.93-.01 1.05 3.37c.16.67-.25 1.64-1.19 1.64"
}));
const AssessmentRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M8 17c-.55 0-1-.45-1-1v-5c0-.55.45-1 1-1s1 .45 1 1v5c0 .55-.45 1-1 1m4 0c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v8c0 .55-.45 1-1 1m4 0c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1"
}));
const SettingsRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M19.5 12c0-.23-.01-.45-.03-.68l1.86-1.41c.4-.3.51-.86.26-1.3l-1.87-3.23c-.25-.44-.79-.62-1.25-.42l-2.15.91c-.37-.26-.76-.49-1.17-.68l-.29-2.31c-.06-.5-.49-.88-.99-.88h-3.73c-.51 0-.94.38-1 .88l-.29 2.31c-.41.19-.8.42-1.17.68l-2.15-.91c-.46-.2-1-.02-1.25.42L2.41 8.62c-.25.44-.14.99.26 1.3l1.86 1.41c-.02.22-.03.44-.03.67s.01.45.03.68l-1.86 1.41c-.4.3-.51.86-.26 1.3l1.87 3.23c.25.44.79.62 1.25.42l2.15-.91c.37.26.76.49 1.17.68l.29 2.31c.06.5.49.88.99.88h3.73c.5 0 .93-.38.99-.88l.29-2.31c.41-.19.8-.42 1.17-.68l2.15.91c.46.2 1 .02 1.25-.42l1.87-3.23c.25-.44.14-.99-.26-1.3l-1.86-1.41c.03-.23.04-.45.04-.68m-7.46 3.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5"
}));
const AdminPanelSettingsRoundedIcon = createSvgIcon([/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M17 11c.34 0 .67.04 1 .09V7.58c0-.8-.47-1.52-1.2-1.83l-5.5-2.4c-.51-.22-1.09-.22-1.6 0l-5.5 2.4C3.47 6.07 3 6.79 3 7.58v3.6c0 4.54 3.2 8.79 7.5 9.82.55-.13 1.08-.32 1.6-.55-.69-.98-1.1-2.17-1.1-3.45 0-3.31 2.69-6 6-6"
}, "0"), /* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M17 13c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 1.38c.62 0 1.12.51 1.12 1.12s-.51 1.12-1.12 1.12-1.12-.51-1.12-1.12.5-1.12 1.12-1.12m0 5.37c-.93 0-1.74-.46-2.24-1.17.05-.72 1.51-1.08 2.24-1.08s2.19.36 2.24 1.08c-.5.71-1.31 1.17-2.24 1.17"
}, "1")]);
const DRAWER_WIDTH = 240;
const CUSTOMER_NAV = [
  { label: "Dashboard", path: "/customer", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HomeRoundedIcon, {}) },
  { label: "Services", path: "/services", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RoomServiceRoundedIcon, {}) },
  { label: "Tiffins", path: "/services/tiffins", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LunchDiningRoundedIcon, {}) },
  { label: "My Cart", path: "/cart", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCartRoundedIcon, {}), cartBadge: true },
  { label: "My Orders", path: "/customer/orders", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptLongRoundedIcon, {}) },
  { label: "Notifications", path: "/customer/notifications", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsNoneRoundedIcon, {}), notifBadge: true },
  { label: "Profile", path: "/customer/profile", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PersonRoundedIcon, {}) }
];
const CATERER_NAV = [
  { label: "Dashboard", path: "/caterer", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardRoundedIcon, {}) },
  { label: "Food Management", path: "/caterer/foods", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantMenuRoundedIcon, {}) },
  { label: "Add Food", path: "/caterer/add-food", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddCircleOutlineRoundedIcon, {}) },
  { label: "Orders", path: "/caterer/orders", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ListAltRoundedIcon, {}) },
  { label: "Notifications", path: "/caterer/notifications", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsNoneRoundedIcon, {}), notifBadge: true },
  { label: "Availability", path: "/caterer/availability", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleRoundedIcon, {}) },
  { label: "Profile", path: "/caterer/profile", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PersonRoundedIcon, {}) }
];
const ADMIN_NAV = [
  { label: "Dashboard", path: "/admin", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardRoundedIcon, {}) },
  { label: "Customers", path: "/admin/customers", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleRoundedIcon, {}) },
  { label: "Caterers", path: "/admin/caterers", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(StorefrontRoundedIcon, {}) },
  { label: "Food Catalog", path: "/admin/foods", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantMenuRoundedIcon, {}) },
  { label: "Orders", path: "/admin/orders", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptLongRoundedIcon, {}) },
  { label: "Notifications", path: "/admin/notifications", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsNoneRoundedIcon, {}) },
  { label: "Reports", path: "/admin/reports", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AssessmentRoundedIcon, {}) },
  { label: "Settings", path: "/admin/settings", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsRoundedIcon, {}) }
];
function matchActive(path, currentPath) {
  if (["/customer", "/caterer", "/admin"].includes(path)) return currentPath === path;
  return currentPath.startsWith(path);
}
function SidebarContent({ navItems, onNavigate, cartCount, unreadCount, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const go = (path) => {
    navigate(path);
    if (onClose) onClose();
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", height: "100%" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 1.5 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: 36, showWordmark: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 900, color: brand.orange, letterSpacing: "-0.03em" }, children: "PO.PU" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(List, { sx: { flex: 1, pt: 1, px: 1 }, children: navItems.map((item) => {
      const active = matchActive(item.path, location.pathname);
      let icon = item.icon;
      if (item.cartBadge && cartCount > 0) {
        icon = /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            badgeContent: cartCount,
            color: "primary",
            max: 99,
            sx: { "& .MuiBadge-badge": { backgroundColor: brand.orange, fontSize: "0.6rem", minWidth: 16, height: 16 } },
            children: item.icon
          }
        );
      }
      if (item.notifBadge && unreadCount > 0) {
        icon = /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            badgeContent: unreadCount,
            color: "error",
            max: 99,
            sx: { "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16 } },
            children: item.icon
          }
        );
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        ListItemButton,
        {
          onClick: () => go(item.path),
          sx: {
            borderRadius: 2,
            mb: 0.25,
            px: 1.5,
            backgroundColor: active ? brand.orangeLight : "transparent",
            color: active ? brand.orange : "text.primary",
            "& .MuiListItemIcon-root": { color: active ? brand.orange : "text.secondary", minWidth: 38 },
            "&:hover": {
              backgroundColor: brand.orangeLight,
              color: brand.orange,
              "& .MuiListItemIcon-root": { color: brand.orange }
            }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 38 }, children: icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: item.label,
                primaryTypographyProps: { fontWeight: active ? 700 : 500, fontSize: "0.88rem" }
              }
            )
          ]
        },
        item.path
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(List, { sx: { px: 1, pb: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      ListItemButton,
      {
        onClick: handleLogout,
        sx: {
          borderRadius: 2,
          px: 1.5,
          color: "text.secondary",
          "& .MuiListItemIcon-root": { color: "text.secondary", minWidth: 38 },
          "&:hover": {
            backgroundColor: "#FFF0F0",
            color: "error.main",
            "& .MuiListItemIcon-root": { color: "error.main" }
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 38 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogoutRoundedIcon, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Log Out", primaryTypographyProps: { fontSize: "0.88rem" } })
        ]
      }
    ) })
  ] });
}
function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = reactExports.useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { cartCount } = useCart();
  const { unreadCount } = useNotifications();
  const path = location.pathname;
  const role = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"))?.role || "customer";
    } catch {
      return "customer";
    }
  })();
  let navItems;
  if (path.startsWith("/admin") || role === "admin") navItems = ADMIN_NAV;
  else if (path.startsWith("/caterer") || role === "caterer") navItems = CATERER_NAV;
  else navItems = CUSTOMER_NAV;
  const sidebarProps = { navItems, cartCount, unreadCount };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", minHeight: "100vh", bgcolor: brand.bg }, children: [
    !isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Drawer,
      {
        variant: "permanent",
        sx: {
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: `1px solid ${brand.border}`,
            bgcolor: brand.white
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarContent, { ...sidebarProps })
      }
    ),
    isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Drawer,
      {
        variant: "temporary",
        open: mobileOpen,
        onClose: () => setMobileOpen(false),
        ModalProps: { keepMounted: true },
        sx: {
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: `1px solid ${brand.border}`,
            bgcolor: brand.white
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarContent, { ...sidebarProps, onClose: () => setMobileOpen(false) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        component: "main",
        sx: {
          flexGrow: 1,
          minWidth: 0,
          bgcolor: brand.bg,
          ...isMobile ? {} : { ml: 0 }
        },
        children: [
          isMobile && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AppBar,
              {
                position: "fixed",
                elevation: 0,
                sx: {
                  bgcolor: brand.white,
                  borderBottom: `1px solid ${brand.border}`,
                  color: brand.text,
                  zIndex: theme.zIndex.drawer + 1
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Toolbar, { sx: { justifyContent: "space-between", minHeight: 56 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => setMobileOpen(true), sx: { color: brand.text }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuRoundedIcon, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: 32, showWordmark: false }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 0.5 }, children: [
                    navItems === CUSTOMER_NAV && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        IconButton,
                        {
                          size: "small",
                          sx: { color: brand.muted },
                          onClick: () => {
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { badgeContent: unreadCount > 0 ? unreadCount : null, color: "error", max: 99, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsNoneRoundedIcon, { fontSize: "small" }) })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        IconButton,
                        {
                          size: "small",
                          sx: { color: brand.muted },
                          onClick: () => {
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Badge,
                            {
                              badgeContent: cartCount > 0 ? cartCount : null,
                              color: "primary",
                              max: 99,
                              sx: { "& .MuiBadge-badge": { backgroundColor: brand.orange } },
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCartRoundedIcon, { fontSize: "small" })
                            }
                          )
                        }
                      )
                    ] }),
                    navItems === ADMIN_NAV && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPanelSettingsRoundedIcon, { sx: { color: brand.orange } })
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Toolbar, { sx: { minHeight: "56px !important" } })
          ] }),
          children
        ]
      }
    )
  ] });
}
export {
  AppLayout as A,
  CircleRoundedIcon as C,
  HomeRoundedIcon as H,
  ListItemButton as L,
  NotificationsNoneRoundedIcon as N,
  PeopleRoundedIcon as P,
  ReceiptLongRoundedIcon as R,
  StorefrontRoundedIcon as S,
  ListItemIcon as a,
  LunchDiningRoundedIcon as b,
  ListItemText as c,
  LogoutRoundedIcon as d,
  SettingsRoundedIcon as e,
  ShoppingCartRoundedIcon as f,
  RestaurantMenuRoundedIcon as g,
  AddCircleOutlineRoundedIcon as h,
  ListAltRoundedIcon as i,
  AdminPanelSettingsRoundedIcon as j,
  AssessmentRoundedIcon as k,
  listItemButtonClasses as l
};
