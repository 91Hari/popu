import { g as generateUtilityClass, a as generateUtilityClasses, r as reactExports, b as useDefaultProps, d as duration, c as clsx, j as jsxRuntimeExports, e as composeClasses, s as styled, m as memoTheme, u as useNavigate, B as Box, C as CircularProgress, L as Link } from "./index-EstIw0RN.js";
import { a as Transition, u as useTheme, b as useTimeout, c as useForkRef, d as useSlot, n as normalizedTransitionCallback, g as getTransitionProps, e as createSvgIcon, L as Logo, T as Typography } from "./Logo-DCDhUauE.js";
import { C as CheckCircleRoundedIcon } from "./CheckCircleRounded-CLWxVan5.js";
import { a as authService } from "./authService-DlXx6MPf.js";
import { u as useMediaQuery, C as Container, D as Divider } from "./index-BIPustA6.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { T as TextField } from "./TextField-Bs3yYaqe.js";
import { F as FormControl, S as Select } from "./Select-4eHc_Vcc.js";
import { I as InputLabel } from "./InputLabel-DA7QQiD4.js";
import { M as MenuItem } from "./MenuItem-gextyUDk.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import "./InputBase-e5CItqOA.js";
import "./useFormControl-CRnBRMMH.js";
import "./isMuiElement-CVFCK7HK.js";
import "./Grow-BX3DzL8A.js";
import "./useControlled-Am1rG54b.js";
function getCollapseUtilityClass(slot) {
  return generateUtilityClass("MuiCollapse", slot);
}
generateUtilityClasses("MuiCollapse", ["root", "horizontal", "vertical", "entered", "hidden", "wrapper", "wrapperInner"]);
const useUtilityClasses = (ownerState) => {
  const {
    orientation,
    classes
  } = ownerState;
  const slots = {
    root: ["root", orientation],
    entered: ["entered"],
    hidden: ["hidden"],
    wrapper: ["wrapper", orientation],
    wrapperInner: ["wrapperInner", orientation]
  };
  return composeClasses(slots, getCollapseUtilityClass, classes);
};
const CollapseRoot = styled("div", {
  name: "MuiCollapse",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, styles[ownerState.orientation], ownerState.state === "entered" && styles.entered, ownerState.state === "exited" && !ownerState.in && ownerState.collapsedSize === "0px" && styles.hidden];
  }
})(memoTheme(({
  theme
}) => ({
  height: 0,
  overflow: "hidden",
  transition: theme.transitions.create("height"),
  variants: [{
    props: {
      orientation: "horizontal"
    },
    style: {
      height: "auto",
      width: 0,
      transition: theme.transitions.create("width")
    }
  }, {
    props: {
      state: "entered"
    },
    style: {
      height: "auto",
      overflow: "visible"
    }
  }, {
    props: {
      state: "entered",
      orientation: "horizontal"
    },
    style: {
      width: "auto"
    }
  }, {
    props: ({
      ownerState
    }) => ownerState.state === "exited" && !ownerState.in && ownerState.collapsedSize === "0px",
    style: {
      visibility: "hidden"
    }
  }]
})));
const CollapseWrapper = styled("div", {
  name: "MuiCollapse",
  slot: "Wrapper"
})({
  // Hack to get children with a negative margin to not falsify the height computation.
  display: "flex",
  width: "100%",
  variants: [{
    props: {
      orientation: "horizontal"
    },
    style: {
      width: "auto",
      height: "100%"
    }
  }]
});
const CollapseWrapperInner = styled("div", {
  name: "MuiCollapse",
  slot: "WrapperInner"
})({
  width: "100%",
  variants: [{
    props: {
      orientation: "horizontal"
    },
    style: {
      width: "auto",
      height: "100%"
    }
  }]
});
const Collapse = /* @__PURE__ */ reactExports.forwardRef(function Collapse2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiCollapse"
  });
  const {
    addEndListener,
    children,
    className,
    collapsedSize: collapsedSizeProp = "0px",
    component,
    easing,
    in: inProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    orientation = "vertical",
    slots = {},
    slotProps = {},
    style,
    timeout = duration.standard,
    // eslint-disable-next-line react/prop-types
    TransitionComponent = Transition,
    ...other
  } = props;
  const ownerState = {
    ...props,
    orientation,
    collapsedSize: collapsedSizeProp
  };
  const classes = useUtilityClasses(ownerState);
  const theme = useTheme();
  const timer = useTimeout();
  const wrapperRef = reactExports.useRef(null);
  const autoTransitionDuration = reactExports.useRef();
  const collapsedSize = typeof collapsedSizeProp === "number" ? `${collapsedSizeProp}px` : collapsedSizeProp;
  const isHorizontal = orientation === "horizontal";
  const size = isHorizontal ? "width" : "height";
  const nodeRef = reactExports.useRef(null);
  const handleRef = useForkRef(ref, nodeRef);
  const getWrapperSize = () => wrapperRef.current ? wrapperRef.current[isHorizontal ? "clientWidth" : "clientHeight"] : 0;
  const handleEnter = normalizedTransitionCallback(nodeRef, (node, isAppearing) => {
    if (wrapperRef.current && isHorizontal) {
      wrapperRef.current.style.position = "absolute";
    }
    node.style[size] = collapsedSize;
    if (onEnter) {
      onEnter(node, isAppearing);
    }
  });
  const handleEntering = normalizedTransitionCallback(nodeRef, (node, isAppearing) => {
    const wrapperSize = getWrapperSize();
    if (wrapperRef.current && isHorizontal) {
      wrapperRef.current.style.position = "";
    }
    const {
      duration: transitionDuration,
      easing: transitionTimingFunction
    } = getTransitionProps({
      style,
      timeout,
      easing
    }, {
      mode: "enter"
    });
    if (timeout === "auto") {
      const duration2 = theme.transitions.getAutoHeightDuration(wrapperSize);
      node.style.transitionDuration = `${duration2}ms`;
      autoTransitionDuration.current = duration2;
    } else {
      node.style.transitionDuration = typeof transitionDuration === "string" ? transitionDuration : `${transitionDuration}ms`;
    }
    node.style[size] = `${wrapperSize}px`;
    node.style.transitionTimingFunction = transitionTimingFunction;
    if (onEntering) {
      onEntering(node, isAppearing);
    }
  });
  const handleEntered = normalizedTransitionCallback(nodeRef, (node, isAppearing) => {
    node.style[size] = "auto";
    if (onEntered) {
      onEntered(node, isAppearing);
    }
  });
  const handleExit = normalizedTransitionCallback(nodeRef, (node) => {
    node.style[size] = `${getWrapperSize()}px`;
    if (onExit) {
      onExit(node);
    }
  });
  const handleExited = normalizedTransitionCallback(nodeRef, onExited);
  const handleExiting = normalizedTransitionCallback(nodeRef, (node) => {
    const wrapperSize = getWrapperSize();
    const {
      duration: transitionDuration,
      easing: transitionTimingFunction
    } = getTransitionProps({
      style,
      timeout,
      easing
    }, {
      mode: "exit"
    });
    if (timeout === "auto") {
      const duration2 = theme.transitions.getAutoHeightDuration(wrapperSize);
      node.style.transitionDuration = `${duration2}ms`;
      autoTransitionDuration.current = duration2;
    } else {
      node.style.transitionDuration = typeof transitionDuration === "string" ? transitionDuration : `${transitionDuration}ms`;
    }
    node.style[size] = collapsedSize;
    node.style.transitionTimingFunction = transitionTimingFunction;
    if (onExiting) {
      onExiting(node);
    }
  });
  const handleAddEndListener = (next) => {
    if (timeout === "auto") {
      timer.start(autoTransitionDuration.current || 0, next);
    }
    if (addEndListener) {
      addEndListener(nodeRef.current, next);
    }
  };
  const externalForwardedProps = {
    slots,
    slotProps,
    component
  };
  const [RootSlot, rootSlotProps] = useSlot("root", {
    ref: handleRef,
    className: clsx(classes.root, className),
    elementType: CollapseRoot,
    externalForwardedProps,
    ownerState,
    additionalProps: {
      style: {
        [isHorizontal ? "minWidth" : "minHeight"]: collapsedSize,
        ...style
      }
    }
  });
  const [WrapperSlot, wrapperSlotProps] = useSlot("wrapper", {
    ref: wrapperRef,
    className: classes.wrapper,
    elementType: CollapseWrapper,
    externalForwardedProps,
    ownerState
  });
  const [WrapperInnerSlot, wrapperInnerSlotProps] = useSlot("wrapperInner", {
    className: classes.wrapperInner,
    elementType: CollapseWrapperInner,
    externalForwardedProps,
    ownerState
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionComponent, {
    in: inProp,
    onEnter: handleEnter,
    onEntered: handleEntered,
    onEntering: handleEntering,
    onExit: handleExit,
    onExited: handleExited,
    onExiting: handleExiting,
    addEndListener: handleAddEndListener,
    nodeRef,
    timeout: timeout === "auto" ? null : timeout,
    ...other,
    children: (state, {
      ownerState: incomingOwnerState,
      ...restChildProps
    }) => {
      const stateOwnerState = {
        ...ownerState,
        state
      };
      return /* @__PURE__ */ jsxRuntimeExports.jsx(RootSlot, {
        ...rootSlotProps,
        className: clsx(rootSlotProps.className, {
          "entered": classes.entered,
          "exited": !inProp && collapsedSize === "0px" && classes.hidden
        }[state]),
        ownerState: stateOwnerState,
        ...restChildProps,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(WrapperSlot, {
          ...wrapperSlotProps,
          ownerState: stateOwnerState,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(WrapperInnerSlot, {
            ...wrapperInnerSlotProps,
            ownerState: stateOwnerState,
            children
          })
        })
      });
    }
  });
});
if (Collapse) {
  Collapse.muiSupportAuto = true;
}
const MyLocationRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V2c0-.55-.45-1-1-1s-1 .45-1 1v1.06C6.83 3.52 3.52 6.83 3.06 11H2c-.55 0-1 .45-1 1s.45 1 1 1h1.06c.46 4.17 3.77 7.48 7.94 7.94V22c0 .55.45 1 1 1s1-.45 1-1v-1.06c4.17-.46 7.48-3.77 7.94-7.94H22c.55 0 1-.45 1-1s-.45-1-1-1zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7"
}));
const BRAND_ORANGE = "#E8751A";
function RegisterPage() {
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [role, setRole] = reactExports.useState("customer");
  const [businessName, setBusinessName] = reactExports.useState("");
  const [address, setAddress] = reactExports.useState("");
  const [latitude, setLatitude] = reactExports.useState(null);
  const [longitude, setLongitude] = reactExports.useState(null);
  const [geoStatus, setGeoStatus] = reactExports.useState("idle");
  const [errors, setErrors] = reactExports.useState({});
  const [apiError, setApiError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isCaterer = role === "caterer";
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGeoStatus("detected");
      },
      () => setGeoStatus("denied"),
      { timeout: 1e4 }
    );
  };
  const validateForm = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    else if (name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";
    if (!password.trim()) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    if (!confirmPassword.trim()) e.confirmPassword = "Confirm password is required";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!role) e.role = "Please select a role";
    if (isCaterer) {
      if (!businessName.trim()) e.businessName = "Business name is required";
      if (!address.trim()) e.address = "Address is required";
    }
    return e;
  };
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      await authService.register({
        name,
        email,
        password,
        role,
        ...isCaterer && {
          business_name: businessName,
          address,
          latitude,
          longitude
        }
      });
      navigate("/login");
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 1 } };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Box,
    {
      sx: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        py: isMobile ? 2 : 4
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { width: "100%", boxShadow: 3, borderRadius: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: isMobile ? 3 : 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", mb: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", mb: 1.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: 44, showTagline: true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", fontSize: isMobile ? "0.875rem" : "1rem" }, children: "Create Your Account" })
        ] }),
        apiError && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: apiError }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "form", onSubmit: handleSubmit, noValidate: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2.5, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Full Name",
              type: "text",
              value: name,
              onChange: (e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              },
              error: !!errors.name,
              helperText: errors.name,
              placeholder: "John Doe",
              disabled: loading,
              autoComplete: "name",
              sx: fieldSx
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Email Address",
              type: "email",
              value: email,
              onChange: (e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              },
              error: !!errors.email,
              helperText: errors.email,
              placeholder: "example@email.com",
              disabled: loading,
              autoComplete: "email",
              sx: fieldSx
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Password",
              type: "password",
              value: password,
              onChange: (e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: "" });
              },
              error: !!errors.password,
              helperText: errors.password,
              placeholder: "••••••••",
              disabled: loading,
              autoComplete: "new-password",
              sx: fieldSx
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Confirm Password",
              type: "password",
              value: confirmPassword,
              onChange: (e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
              },
              error: !!errors.confirmPassword,
              helperText: errors.confirmPassword,
              placeholder: "••••••••",
              disabled: loading,
              autoComplete: "new-password",
              sx: fieldSx
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, error: !!errors.role, disabled: loading, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { id: "role-label", children: "Select Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                labelId: "role-label",
                value: role,
                label: "Select Role",
                onChange: (e) => {
                  setRole(e.target.value);
                  if (errors.role) setErrors({ ...errors, role: "" });
                },
                sx: { borderRadius: 1 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "customer", children: "🛒 Customer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "caterer", children: "👨‍🍳 Caterer" })
                ]
              }
            ),
            errors.role && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "#d32f2f", mt: 0.5 }, children: errors.role })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Collapse, { in: isCaterer, unmountOnExit: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2.5, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Caterer Details", size: "small", sx: { backgroundColor: "#FFF3E0", color: BRAND_ORANGE, fontWeight: 600 } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Business Name",
                type: "text",
                value: businessName,
                onChange: (e) => {
                  setBusinessName(e.target.value);
                  if (errors.businessName) setErrors({ ...errors, businessName: "" });
                },
                error: !!errors.businessName,
                helperText: errors.businessName,
                placeholder: "e.g. Amma's Kitchen",
                disabled: loading,
                sx: fieldSx
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Full Address",
                multiline: true,
                rows: 2,
                value: address,
                onChange: (e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors({ ...errors, address: "" });
                },
                error: !!errors.address,
                helperText: errors.address || "Street, area, city and pincode",
                placeholder: "e.g. 12 MG Road, Banjara Hills, Hyderabad 500034",
                disabled: loading,
                sx: fieldSx
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: {
                  p: 1.5,
                  borderRadius: 1,
                  border: `1px solid`,
                  borderColor: geoStatus === "detected" ? "#4caf50" : "#e0e0e0",
                  backgroundColor: geoStatus === "detected" ? "#f1f8e9" : "#fafafa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 600, display: "block" }, children: "Business Location (GPS)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: [
                      geoStatus === "idle" && "Used to show delivery distance to customers",
                      geoStatus === "detecting" && "Detecting your location…",
                      geoStatus === "detected" && `Detected — lat ${latitude?.toFixed(4)}, lng ${longitude?.toFixed(4)}`,
                      geoStatus === "denied" && "Location access denied — customers won't see distance"
                    ] })
                  ] }),
                  geoStatus === "detected" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleRoundedIcon, { sx: { color: "#4caf50", flexShrink: 0 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "small",
                      variant: "outlined",
                      startIcon: geoStatus === "detecting" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 12, color: "inherit" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MyLocationRoundedIcon, {}),
                      onClick: detectLocation,
                      disabled: loading || geoStatus === "detecting",
                      sx: { borderColor: BRAND_ORANGE, color: BRAND_ORANGE, fontWeight: 600, flexShrink: 0, fontSize: "0.75rem" },
                      children: geoStatus === "detecting" ? "Detecting…" : "Detect"
                    }
                  )
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 2, backgroundColor: "#f5f5f5", borderRadius: 1, border: "1px solid #e0e0e0" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Customer:" }),
            " Browse and order food from caterers",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Caterer:" }),
            " Add and manage food offerings"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              fullWidth: true,
              variant: "contained",
              size: isMobile ? "medium" : "large",
              onClick: handleSubmit,
              disabled: loading,
              sx: {
                mt: 2,
                background: "linear-gradient(135deg, #E8751A 0%, #F5A05A 100%)",
                textTransform: "none",
                fontSize: isMobile ? "0.95rem" : "1rem",
                fontWeight: 600,
                py: isMobile ? 1.2 : 1.5,
                borderRadius: 1,
                "&:hover": { background: "linear-gradient(135deg, #D2680F 0%, #D2680F 100%)" },
                "&:disabled": { background: "#ccc" }
              },
              children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20, sx: { mr: 1, color: "white" } }),
                " Creating Account…"
              ] }) : "Register"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              fullWidth: true,
              variant: "outlined",
              size: isMobile ? "medium" : "large",
              component: Link,
              to: "/login",
              disabled: loading,
              sx: {
                textTransform: "none",
                fontSize: isMobile ? "0.95rem" : "1rem",
                fontWeight: 600,
                py: isMobile ? 1.2 : 1.5,
                borderRadius: 1,
                borderColor: BRAND_ORANGE,
                color: BRAND_ORANGE,
                "&:hover": { backgroundColor: "rgba(232,117,26,0.06)", borderColor: BRAND_ORANGE }
              },
              children: "Back To Login"
            }
          )
        ] }) })
      ] }) })
    }
  ) });
}
export {
  RegisterPage as default
};
