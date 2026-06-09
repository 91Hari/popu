import { j as jsxRuntimeExports, B as Box, h as brand } from "./index-EstIw0RN.js";
import { A as AppLayout, e as SettingsRoundedIcon, a as ListItemIcon, c as ListItemText } from "./AppLayout-DH-wOGjI.js";
import { e as createSvgIcon, T as Typography, f as List } from "./Logo-DCDhUauE.js";
import { C as Container, D as Divider } from "./index-BIPustA6.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { C as CardContent } from "./CardContent-B0kSQA4W.js";
import { L as ListItem } from "./ListItem--KqQhZmu.js";
import "./isMuiElement-CVFCK7HK.js";
const SecurityRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "m11.19 1.36-7 3.11C3.47 4.79 3 5.51 3 6.3V11c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6.3c0-.79-.47-1.51-1.19-1.83l-7-3.11c-.51-.23-1.11-.23-1.62 0M12 11.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11z"
}));
const StorageRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M4 20h16c1.1 0 2-.9 2-2s-.9-2-2-2H4c-1.1 0-2 .9-2 2s.9 2 2 2m0-3h2v2H4zM2 6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2s-.9-2-2-2H4c-1.1 0-2 .9-2 2m4 1H4V5h2zm-2 7h16c1.1 0 2-.9 2-2s-.9-2-2-2H4c-1.1 0-2 .9-2 2s.9 2 2 2m0-3h2v2H4z"
}));
const InfoRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 15c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1m1-8h-2V7h2z"
}));
const SETTINGS = [
  { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRoundedIcon, {}), primary: "Platform Version", secondary: "PO.PU v1.0.0 — pure · fresh · trusted" },
  { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SecurityRoundedIcon, {}), primary: "Authentication", secondary: "JWT-based, 7-day token expiry" },
  { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(StorageRoundedIcon, {}), primary: "Database", secondary: "PostgreSQL 16 with pgcrypto, pg_trgm" }
];
function SettingsPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "md", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1.5, mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsRoundedIcon, { sx: { color: brand.orange, fontSize: 26 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "Settings" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { elevation: 0, sx: { border: `1px solid ${brand.border}` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { p: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { disablePadding: true, children: SETTINGS.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { py: 2, px: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { color: brand.orange, minWidth: 40 }, children: s.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ListItemText,
          {
            primary: s.primary,
            secondary: s.secondary,
            primaryTypographyProps: { fontWeight: 700 }
          }
        )
      ] }),
      i < SETTINGS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
    ] }, s.primary)) }) }) })
  ] }) });
}
export {
  SettingsPage as default
};
