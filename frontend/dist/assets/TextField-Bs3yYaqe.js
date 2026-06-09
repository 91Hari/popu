import { g as generateUtilityClass, a as generateUtilityClasses, r as reactExports, b as useDefaultProps, j as jsxRuntimeExports, c as clsx, p as capitalize, e as composeClasses, s as styled, m as memoTheme, w as useId } from "./index-EstIw0RN.js";
import { d as useSlot } from "./Logo-DCDhUauE.js";
import { O as OutlinedInput, a as FilledInput, I as Input, S as Select, F as FormControl } from "./Select-4eHc_Vcc.js";
import { I as InputLabel } from "./InputLabel-DA7QQiD4.js";
import { f as formControlState } from "./InputBase-e5CItqOA.js";
import { u as useFormControl } from "./useFormControl-CRnBRMMH.js";
function getFormHelperTextUtilityClasses(slot) {
  return generateUtilityClass("MuiFormHelperText", slot);
}
const formHelperTextClasses = generateUtilityClasses("MuiFormHelperText", ["root", "error", "disabled", "sizeSmall", "sizeMedium", "contained", "focused", "filled", "required"]);
var _span;
const useUtilityClasses$1 = (ownerState) => {
  const {
    classes,
    contained,
    size,
    disabled,
    error,
    filled,
    focused,
    required
  } = ownerState;
  const slots = {
    root: ["root", disabled && "disabled", error && "error", size && `size${capitalize(size)}`, contained && "contained", focused && "focused", filled && "filled", required && "required"]
  };
  return composeClasses(slots, getFormHelperTextUtilityClasses, classes);
};
const FormHelperTextRoot = styled("p", {
  name: "MuiFormHelperText",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, ownerState.size && styles[`size${capitalize(ownerState.size)}`], ownerState.contained && styles.contained, ownerState.filled && styles.filled];
  }
})(memoTheme(({
  theme
}) => ({
  color: (theme.vars || theme).palette.text.secondary,
  ...theme.typography.caption,
  textAlign: "left",
  marginTop: 3,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  [`&.${formHelperTextClasses.disabled}`]: {
    color: (theme.vars || theme).palette.text.disabled
  },
  [`&.${formHelperTextClasses.error}`]: {
    color: (theme.vars || theme).palette.error.main
  },
  variants: [{
    props: {
      size: "small"
    },
    style: {
      marginTop: 4
    }
  }, {
    props: ({
      ownerState
    }) => ownerState.contained,
    style: {
      marginLeft: 14,
      marginRight: 14
    }
  }]
})));
const FormHelperText = /* @__PURE__ */ reactExports.forwardRef(function FormHelperText2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiFormHelperText"
  });
  const {
    children,
    className,
    component = "p",
    disabled,
    error,
    filled,
    focused,
    margin,
    required,
    variant,
    ...other
  } = props;
  const muiFormControl = useFormControl();
  const fcs = formControlState({
    props,
    muiFormControl,
    states: ["variant", "size", "disabled", "error", "filled", "focused", "required"]
  });
  const ownerState = {
    ...props,
    component,
    contained: fcs.variant === "filled" || fcs.variant === "outlined",
    variant: fcs.variant,
    size: fcs.size,
    disabled: fcs.disabled,
    error: fcs.error,
    filled: fcs.filled,
    focused: fcs.focused,
    required: fcs.required
  };
  delete ownerState.ownerState;
  const classes = useUtilityClasses$1(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperTextRoot, {
    as: component,
    className: clsx(classes.root, className),
    ref,
    ...other,
    ownerState,
    children: children === " " ? (
      // notranslate needed while Google Translate will not fix zero-width space issue
      _span || (_span = /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
        className: "notranslate",
        "aria-hidden": true,
        children: "​"
      }))
    ) : children
  });
});
function getTextFieldUtilityClass(slot) {
  return generateUtilityClass("MuiTextField", slot);
}
generateUtilityClasses("MuiTextField", ["root"]);
const variantComponent = {
  standard: Input,
  filled: FilledInput,
  outlined: OutlinedInput
};
const useUtilityClasses = (ownerState) => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ["root"]
  };
  return composeClasses(slots, getTextFieldUtilityClass, classes);
};
const TextFieldRoot = styled(FormControl, {
  name: "MuiTextField",
  slot: "Root"
})({});
const TextField = /* @__PURE__ */ reactExports.forwardRef(function TextField2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiTextField"
  });
  const {
    autoComplete,
    autoFocus = false,
    children,
    className,
    color = "primary",
    defaultValue,
    disabled = false,
    error = false,
    FormHelperTextProps: FormHelperTextPropsProp,
    fullWidth = false,
    helperText,
    id: idOverride,
    InputLabelProps: InputLabelPropsProp,
    inputProps: inputPropsProp,
    InputProps: InputPropsProp,
    inputRef,
    label,
    maxRows,
    minRows,
    multiline = false,
    name,
    onBlur,
    onChange,
    onFocus,
    placeholder,
    required = false,
    rows,
    select = false,
    SelectProps: SelectPropsProp,
    slots = {},
    slotProps = {},
    type,
    value,
    variant = "outlined",
    ...other
  } = props;
  const ownerState = {
    ...props,
    autoFocus,
    color,
    disabled,
    error,
    fullWidth,
    multiline,
    required,
    select,
    variant
  };
  const classes = useUtilityClasses(ownerState);
  const id = useId(idOverride);
  const helperTextId = helperText && id ? `${id}-helper-text` : void 0;
  const inputLabelId = label && id ? `${id}-label` : void 0;
  const InputComponent = variantComponent[variant];
  const externalForwardedProps = {
    slots,
    slotProps: {
      input: InputPropsProp,
      inputLabel: InputLabelPropsProp,
      htmlInput: inputPropsProp,
      formHelperText: FormHelperTextPropsProp,
      select: SelectPropsProp,
      ...slotProps
    }
  };
  const inputAdditionalProps = {};
  const inputLabelSlotProps = externalForwardedProps.slotProps.inputLabel;
  if (variant === "outlined") {
    if (inputLabelSlotProps && typeof inputLabelSlotProps.shrink !== "undefined") {
      inputAdditionalProps.notched = inputLabelSlotProps.shrink;
    }
    inputAdditionalProps.label = label;
  }
  if (select) {
    if (!SelectPropsProp || !SelectPropsProp.native) {
      inputAdditionalProps.id = void 0;
    }
    inputAdditionalProps["aria-describedby"] = void 0;
  }
  const [RootSlot, rootProps] = useSlot("root", {
    elementType: TextFieldRoot,
    shouldForwardComponentProp: true,
    externalForwardedProps: {
      ...externalForwardedProps,
      ...other
    },
    ownerState,
    className: clsx(classes.root, className),
    ref,
    additionalProps: {
      disabled,
      error,
      fullWidth,
      required,
      color,
      variant
    }
  });
  const [InputSlot, inputProps] = useSlot("input", {
    elementType: InputComponent,
    externalForwardedProps,
    additionalProps: inputAdditionalProps,
    ownerState
  });
  const [InputLabelSlot, inputLabelProps] = useSlot("inputLabel", {
    elementType: InputLabel,
    externalForwardedProps,
    ownerState
  });
  const [HtmlInputSlot, htmlInputProps] = useSlot("htmlInput", {
    elementType: "input",
    externalForwardedProps,
    ownerState
  });
  const [FormHelperTextSlot, formHelperTextProps] = useSlot("formHelperText", {
    elementType: FormHelperText,
    externalForwardedProps,
    ownerState
  });
  const [SelectSlot, selectProps] = useSlot("select", {
    elementType: Select,
    externalForwardedProps,
    ownerState
  });
  const InputElement = /* @__PURE__ */ jsxRuntimeExports.jsx(InputSlot, {
    "aria-describedby": helperTextId,
    autoComplete,
    autoFocus,
    defaultValue,
    fullWidth,
    multiline,
    name,
    rows,
    maxRows,
    minRows,
    type,
    value,
    id,
    inputRef,
    onBlur,
    onChange,
    onFocus,
    placeholder,
    inputProps: htmlInputProps,
    slots: {
      input: slots.htmlInput ? HtmlInputSlot : void 0
    },
    ...inputProps
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(RootSlot, {
    ...rootProps,
    children: [label != null && label !== "" && /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabelSlot, {
      htmlFor: id,
      id: inputLabelId,
      ...inputLabelProps,
      children: label
    }), select ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectSlot, {
      "aria-describedby": helperTextId,
      id,
      labelId: inputLabelId,
      value,
      input: InputElement,
      ...selectProps,
      children
    }) : InputElement, helperText && /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperTextSlot, {
      id: helperTextId,
      ...formHelperTextProps,
      children: helperText
    })]
  });
});
export {
  TextField as T
};
