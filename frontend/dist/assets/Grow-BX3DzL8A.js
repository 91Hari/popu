import { A as resolveComponentProps, C as mergeSlotProps, c as useForkRef, D as appendOwnerState, b as useTimeout, u as useTheme, j as getReactElementRef, a as Transition, E as getTransitionChildStyle, n as normalizedTransitionCallback, g as getTransitionProps, G as reflow } from "./Logo-DCDhUauE.js";
import { r as reactExports, j as jsxRuntimeExports } from "./index-EstIw0RN.js";
function useSlotProps(parameters) {
  const {
    elementType,
    externalSlotProps,
    ownerState,
    skipResolvingSlotProps = false,
    ...other
  } = parameters;
  const resolvedComponentsProps = skipResolvingSlotProps ? {} : resolveComponentProps(externalSlotProps, ownerState);
  const {
    props: mergedProps,
    internalRef
  } = mergeSlotProps({
    ...other,
    externalSlotProps: resolvedComponentsProps
  });
  const ref = useForkRef(internalRef, resolvedComponentsProps?.ref, parameters.additionalProps?.ref);
  const props = appendOwnerState(elementType, {
    ...mergedProps,
    ref
  }, ownerState);
  return props;
}
function getScale(value) {
  return `scale(${value}, ${value ** 2})`;
}
const styles = {
  entering: {
    opacity: 1,
    transform: getScale(1)
  },
  entered: {
    opacity: 1,
    transform: "none"
  },
  exiting: {
    opacity: 0,
    transform: getScale(0.75)
  },
  exited: {
    opacity: 0,
    transform: getScale(0.75)
  }
};
const hiddenStyles = {
  opacity: 0,
  transform: getScale(0.75),
  visibility: "hidden"
};
const Grow = /* @__PURE__ */ reactExports.forwardRef(function Grow2(props, ref) {
  const {
    addEndListener,
    appear = true,
    children,
    easing,
    in: inProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    style,
    timeout = "auto",
    ...other
  } = props;
  const timer = useTimeout();
  const autoTimeout = reactExports.useRef();
  const theme = useTheme();
  const nodeRef = reactExports.useRef(null);
  const handleRef = useForkRef(nodeRef, getReactElementRef(children), ref);
  const handleEntering = normalizedTransitionCallback(nodeRef, onEntering);
  const handleEnter = normalizedTransitionCallback(nodeRef, (node, isAppearing) => {
    reflow(node);
    const {
      duration: transitionDuration,
      delay,
      easing: transitionTimingFunction
    } = getTransitionProps({
      style,
      timeout,
      easing
    }, {
      mode: "enter"
    });
    let duration;
    if (timeout === "auto") {
      duration = theme.transitions.getAutoHeightDuration(node.clientHeight);
      autoTimeout.current = duration;
    } else {
      duration = transitionDuration;
    }
    node.style.transition = [theme.transitions.create("opacity", {
      duration,
      delay
    }), theme.transitions.create("transform", {
      duration: duration * 0.666,
      delay,
      easing: transitionTimingFunction
    })].join(",");
    if (onEnter) {
      onEnter(node, isAppearing);
    }
  });
  const handleEntered = normalizedTransitionCallback(nodeRef, onEntered);
  const handleExiting = normalizedTransitionCallback(nodeRef, onExiting);
  const handleExit = normalizedTransitionCallback(nodeRef, (node) => {
    const {
      duration: transitionDuration,
      delay,
      easing: transitionTimingFunction
    } = getTransitionProps({
      style,
      timeout,
      easing
    }, {
      mode: "exit"
    });
    let duration;
    if (timeout === "auto") {
      duration = theme.transitions.getAutoHeightDuration(node.clientHeight);
      autoTimeout.current = duration;
    } else {
      duration = transitionDuration;
    }
    node.style.transition = [theme.transitions.create("opacity", {
      duration,
      delay
    }), theme.transitions.create("transform", {
      duration: duration * 0.666,
      delay: delay || duration * 0.333,
      easing: transitionTimingFunction
    })].join(",");
    node.style.opacity = 0;
    node.style.transform = getScale(0.75);
    if (onExit) {
      onExit(node);
    }
  });
  const handleExited = normalizedTransitionCallback(nodeRef, (node) => {
    node.style.transition = "";
    if (onExited) {
      onExited(node);
    }
  });
  const handleAddEndListener = (next) => {
    if (timeout === "auto") {
      timer.start(autoTimeout.current || 0, next);
    }
    if (addEndListener) {
      addEndListener(nodeRef.current, next);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Transition, {
    appear,
    in: inProp,
    nodeRef,
    onEnter: handleEnter,
    onEntered: handleEntered,
    onEntering: handleEntering,
    onExit: handleExit,
    onExited: handleExited,
    onExiting: handleExiting,
    addEndListener: handleAddEndListener,
    timeout: timeout === "auto" ? null : timeout,
    ...other,
    children: (state, {
      ownerState,
      ...restChildProps
    }) => {
      const childStyle = getTransitionChildStyle(state, inProp, styles, hiddenStyles, style, children.props.style);
      return /* @__PURE__ */ reactExports.cloneElement(children, {
        style: childStyle,
        ref: handleRef,
        ...restChildProps
      });
    }
  });
});
if (Grow) {
  Grow.muiSupportAuto = true;
}
export {
  Grow as G,
  useSlotProps as u
};
