import { j as jsxRuntimeExports, B as Box, h as brand, C as CircularProgress } from "./index-EstIw0RN.js";
import { C as CheckCircleRoundedIcon } from "./CheckCircleRounded-CLWxVan5.js";
import { e as createSvgIcon, T as Typography } from "./Logo-DCDhUauE.js";
import { C as Chip } from "./Chip-yjaeJ34r.js";
import { S as Switch } from "./Switch-DcmvwebP.js";
const PauseCircleRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 14c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1m4 0c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1"
}));
function AvailabilityToggle({ status, onChange, loading }) {
  const isReady = status === "READY";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Box,
    {
      sx: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        borderRadius: 3,
        border: `1.5px solid ${isReady ? brand.green : brand.border}`,
        backgroundColor: isReady ? brand.greenLight : "#fafafa",
        transition: "all 0.2s"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.25 }, children: [
          isReady ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleRoundedIcon, { sx: { color: brand.green, fontSize: 22 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PauseCircleRoundedIcon, { sx: { color: brand.muted, fontSize: 22 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, lineHeight: 1.2 }, children: "Ready For Orders" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "text.secondary" }, children: isReady ? "Customers can place orders" : "Not accepting orders" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              size: "small",
              label: isReady ? "READY" : "NOT READY",
              sx: {
                fontWeight: 700,
                fontSize: "0.7rem",
                backgroundColor: isReady ? brand.green : "#9e9e9e",
                color: "white"
              }
            }
          ),
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20, sx: { color: brand.orange } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: isReady,
              onChange: (e) => onChange(e.target.checked ? "READY" : "NOT_READY"),
              sx: {
                "& .MuiSwitch-switchBase.Mui-checked": { color: brand.green },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: brand.green }
              }
            }
          )
        ] })
      ]
    }
  );
}
export {
  AvailabilityToggle as A,
  PauseCircleRoundedIcon as P
};
