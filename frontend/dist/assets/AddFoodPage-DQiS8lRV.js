import { g as generateUtilityClass, a as generateUtilityClasses, r as reactExports, b as useDefaultProps, j as jsxRuntimeExports, c as clsx, p as capitalize, e as composeClasses, s as styled, m as memoTheme, u as useNavigate, h as brand, B as Box, C as CircularProgress } from "./index-EstIw0RN.js";
import { d as useSlot, T as Typography, e as createSvgIcon, u as useTheme } from "./Logo-DCDhUauE.js";
import { A as ArrowBackRoundedIcon } from "./ArrowBackRounded-B6uNaBio.js";
import { f as foodService } from "./foodService-DCZ7hpOB.js";
import { A as AppLayout } from "./AppLayout-DH-wOGjI.js";
import { u as useMediaQuery, C as Container } from "./index-BIPustA6.js";
import { B as Button } from "./Button-DPTwUjxe.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { A as Alert } from "./Alert-C2DtRhcm.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { T as TextField } from "./TextField-Bs3yYaqe.js";
import { I as InputAdornment } from "./InputAdornment-J_mhbpLy.js";
import { f as formControlState } from "./InputBase-e5CItqOA.js";
import { u as useFormControl } from "./useFormControl-CRnBRMMH.js";
import { S as Switch } from "./Switch-DcmvwebP.js";
import "./Select-4eHc_Vcc.js";
import "./isMuiElement-CVFCK7HK.js";
import "./Grow-BX3DzL8A.js";
import "./useControlled-Am1rG54b.js";
import "./InputLabel-DA7QQiD4.js";
function getFormControlLabelUtilityClasses(slot) {
  return generateUtilityClass("MuiFormControlLabel", slot);
}
const formControlLabelClasses = generateUtilityClasses("MuiFormControlLabel", ["root", "labelPlacementStart", "labelPlacementTop", "labelPlacementBottom", "disabled", "label", "error", "required", "asterisk"]);
const useUtilityClasses = (ownerState) => {
  const {
    classes,
    disabled,
    labelPlacement,
    error,
    required
  } = ownerState;
  const slots = {
    root: ["root", disabled && "disabled", `labelPlacement${capitalize(labelPlacement)}`, error && "error", required && "required"],
    label: ["label", disabled && "disabled"],
    asterisk: ["asterisk", error && "error"]
  };
  return composeClasses(slots, getFormControlLabelUtilityClasses, classes);
};
const FormControlLabelRoot = styled("label", {
  name: "MuiFormControlLabel",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [{
      [`& .${formControlLabelClasses.label}`]: styles.label
    }, styles.root, styles[`labelPlacement${capitalize(ownerState.labelPlacement)}`]];
  }
})(memoTheme(({
  theme
}) => ({
  display: "inline-flex",
  alignItems: "center",
  cursor: "pointer",
  // For correct alignment with the text.
  verticalAlign: "middle",
  WebkitTapHighlightColor: "transparent",
  marginLeft: -11,
  marginRight: 16,
  // used for row presentation of radio/checkbox
  [`&.${formControlLabelClasses.disabled}`]: {
    cursor: "default"
  },
  [`& .${formControlLabelClasses.label}`]: {
    [`&.${formControlLabelClasses.disabled}`]: {
      color: (theme.vars || theme).palette.text.disabled
    }
  },
  variants: [{
    props: {
      labelPlacement: "start"
    },
    style: {
      flexDirection: "row-reverse",
      marginRight: -11
    }
  }, {
    props: {
      labelPlacement: "top"
    },
    style: {
      flexDirection: "column-reverse"
    }
  }, {
    props: {
      labelPlacement: "bottom"
    },
    style: {
      flexDirection: "column"
    }
  }, {
    props: ({
      labelPlacement
    }) => labelPlacement === "start" || labelPlacement === "top" || labelPlacement === "bottom",
    style: {
      marginLeft: 16
      // used for row presentation of radio/checkbox
    }
  }]
})));
const AsteriskComponent = styled("span", {
  name: "MuiFormControlLabel",
  slot: "Asterisk"
})(memoTheme(({
  theme
}) => ({
  [`&.${formControlLabelClasses.error}`]: {
    color: (theme.vars || theme).palette.error.main
  }
})));
const FormControlLabel = /* @__PURE__ */ reactExports.forwardRef(function FormControlLabel2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiFormControlLabel"
  });
  const {
    checked,
    className,
    componentsProps = {},
    control,
    disabled: disabledProp,
    disableTypography,
    inputRef,
    label: labelProp,
    labelPlacement = "end",
    name,
    onChange,
    required: requiredProp,
    slots = {},
    slotProps = {},
    value,
    ...other
  } = props;
  const muiFormControl = useFormControl();
  const disabled = disabledProp ?? control.props.disabled ?? muiFormControl?.disabled;
  const required = requiredProp ?? control.props.required;
  const controlProps = {
    disabled,
    required
  };
  ["checked", "name", "onChange", "value", "inputRef"].forEach((key) => {
    if (typeof control.props[key] === "undefined" && typeof props[key] !== "undefined") {
      controlProps[key] = props[key];
    }
  });
  const fcs = formControlState({
    props,
    muiFormControl,
    states: ["error"]
  });
  const ownerState = {
    ...props,
    disabled,
    labelPlacement,
    required,
    error: fcs.error
  };
  const classes = useUtilityClasses(ownerState);
  const externalForwardedProps = {
    slots,
    slotProps: {
      ...componentsProps,
      ...slotProps
    }
  };
  const [TypographySlot, typographySlotProps] = useSlot("typography", {
    elementType: Typography,
    externalForwardedProps,
    ownerState
  });
  let label = labelProp;
  if (label != null && label.type !== Typography && !disableTypography) {
    label = /* @__PURE__ */ jsxRuntimeExports.jsx(TypographySlot, {
      component: "span",
      ...typographySlotProps,
      className: clsx(classes.label, typographySlotProps?.className),
      children: label
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControlLabelRoot, {
    className: clsx(classes.root, className),
    ownerState,
    ref,
    ...other,
    children: [/* @__PURE__ */ reactExports.cloneElement(control, controlProps), required ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      children: [label, /* @__PURE__ */ jsxRuntimeExports.jsxs(AsteriskComponent, {
        ownerState,
        "aria-hidden": true,
        className: classes.asterisk,
        children: [" ", "*"]
      })]
    }) : label]
  });
});
const AddPhotoAlternateRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M21.02 5H19V2.98c0-.54-.44-.98-.98-.98h-.03c-.55 0-.99.44-.99.98V5h-2.01c-.54 0-.98.44-.99.98v.03c0 .55.44.99.99.99H17v2.01c0 .54.44.99.99.98h.03c.54 0 .98-.44.98-.98V7h2.02c.54 0 .98-.44.98-.98v-.04c0-.54-.44-.98-.98-.98M16 9.01V8h-1.01c-.53 0-1.03-.21-1.41-.58-.37-.38-.58-.88-.58-1.44 0-.36.1-.69.27-.98H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8.28c-.3.17-.64.28-1.02.28-1.09-.01-1.98-.9-1.98-1.99M15.96 19H6c-.41 0-.65-.47-.4-.8l1.98-2.63c.21-.28.62-.26.82.02L10 18l2.61-3.48c.2-.26.59-.27.79-.01l2.95 3.68c.26.33.03.81-.39.81"
}));
const SaveRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M17.59 3.59c-.38-.38-.89-.59-1.42-.59H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7.83c0-.53-.21-1.04-.59-1.41zM12 19c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m1-10H7c-1.1 0-2-.9-2-2s.9-2 2-2h6c1.1 0 2 .9 2 2s-.9 2-2 2"
}));
const TimerRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M10 3h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1s.45 1 1 1m9.03 4.39.75-.75c.38-.38.39-1.01 0-1.4l-.01-.01c-.39-.39-1.01-.38-1.4 0l-.75.75C16.07 4.74 14.12 4 12 4c-4.8 0-8.88 3.96-9 8.76C2.87 17.84 6.94 22 12 22c4.98 0 9-4.03 9-9 0-2.12-.74-4.07-1.97-5.61M13 13c0 .55-.45 1-1 1s-1-.45-1-1V9c0-.55.45-1 1-1s1 .45 1 1z"
}));
function AddFoodPage() {
  const [name, setName] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [price, setPrice] = reactExports.useState("");
  const [prepTime, setPrepTime] = reactExports.useState("20");
  const [available, setAvailable] = reactExports.useState(true);
  const [imageFile, setImageFile] = reactExports.useState(null);
  const [imagePreview, setImagePreview] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  const validate = () => {
    if (!name.trim()) return "Food name is required";
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      return "Enter a valid positive price";
    const pt = parseInt(prepTime, 10);
    if (isNaN(pt) || pt < 1 || pt > 180)
      return "Preparation time must be between 1 and 180 minutes";
    return "";
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      await foodService.createFood({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        available: !!available,
        preparation_time_minutes: parseInt(prepTime, 10)
      });
      setSuccess("Food saved successfully.");
      setTimeout(() => navigate("/caterer/foods"), 900);
    } catch (err) {
      setError(err?.message || "Failed to save food. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "sm", sx: { py: isMobile ? 2 : 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBackRoundedIcon, {}), onClick: () => navigate(-1), sx: { mb: 2, color: brand.muted }, children: "Back" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { border: `1px solid ${brand.border}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: { xs: 2.5, md: 3 } }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800, color: brand.orange, mb: 0.5 }, children: "Add New Food" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary", mb: 3 }, children: "Add a new item to your menu with prep time so customers see accurate delivery estimates." }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }),
      success && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 2 }, children: success }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "form", onSubmit: handleSave, noValidate: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2.5, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Food Name",
            value: name,
            onChange: (e) => setName(e.target.value),
            fullWidth: true,
            required: true,
            autoComplete: "off"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Description",
            value: description,
            onChange: (e) => setDescription(e.target.value),
            fullWidth: true,
            multiline: true,
            rows: 3,
            autoComplete: "off"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Price (₹)",
              value: price,
              onChange: (e) => setPrice(e.target.value),
              fullWidth: true,
              required: true,
              inputMode: "decimal",
              autoComplete: "off",
              InputProps: { startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: "₹" }) }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Prep Time",
              value: prepTime,
              onChange: (e) => setPrepTime(e.target.value),
              fullWidth: true,
              required: true,
              inputMode: "numeric",
              autoComplete: "off",
              helperText: "Minutes to prepare",
              InputProps: {
                startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TimerRoundedIcon, { sx: { fontSize: 18, color: brand.orange } }) }),
                endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: "min" })
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: isMobile ? "column" : "row", spacing: 2, alignItems: "center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outlined",
              component: "label",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddPhotoAlternateRoundedIcon, {}),
              sx: { borderColor: brand.border, color: brand.text },
              children: [
                "Upload Image",
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { hidden: true, accept: "image/*", type: "file", onChange: handleImageChange })
              ]
            }
          ),
          imagePreview ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 96, height: 64, borderRadius: 1.5, overflow: "hidden", border: `1px solid ${brand.border}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: imagePreview, alt: "preview", style: { width: "100%", height: "100%", objectFit: "cover" } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
            width: 96,
            height: 64,
            borderRadius: 1.5,
            backgroundColor: brand.orangeLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AddPhotoAlternateRoundedIcon, { sx: { color: brand.orange, opacity: 0.5 } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: available, onChange: (e) => setAvailable(e.target.checked), color: "primary" }),
              label: available ? "Available" : "Unavailable"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1.5, sx: { pt: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "submit",
              variant: "contained",
              disabled: loading,
              startIcon: loading ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(SaveRoundedIcon, {}),
              sx: { background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`, fontWeight: 700, px: 3 },
              children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20, sx: { color: "white" } }) : "Save Food"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", onClick: () => navigate(-1), sx: { borderColor: brand.border }, children: "Cancel" })
        ] })
      ] }) })
    ] }) })
  ] }) });
}
export {
  AddFoodPage as default
};
