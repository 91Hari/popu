import { r as reactExports } from "./index-EstIw0RN.js";
function useControlled(props) {
  const {
    controlled,
    default: defaultProp,
    name,
    state = "value"
  } = props;
  const {
    current: isControlled
  } = reactExports.useRef(controlled !== void 0);
  const [valueState, setValue] = reactExports.useState(defaultProp);
  const value = isControlled ? controlled : valueState;
  const setValueIfUncontrolled = reactExports.useCallback((newValue) => {
    if (!isControlled) {
      setValue(newValue);
    }
  }, []);
  return [value, setValueIfUncontrolled];
}
export {
  useControlled as u
};
