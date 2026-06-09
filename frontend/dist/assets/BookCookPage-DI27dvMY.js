import { u as useNavigate, j as jsxRuntimeExports, h as brand, B as Box } from "./index-EstIw0RN.js";
import { P as PeopleAltRoundedIcon } from "./PeopleAltRounded-D7_mpwkS.js";
import { A as ArrowBackRoundedIcon } from "./ArrowBackRounded-B6uNaBio.js";
import { A as AppLayout } from "./AppLayout-DH-wOGjI.js";
import { C as Container } from "./index-BIPustA6.js";
import { S as Stack } from "./Stack-nL6lUL_x.js";
import { I as IconButton, T as Typography } from "./Logo-DCDhUauE.js";
import { B as Button } from "./Button-DPTwUjxe.js";
function BookCookPage() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "sm", sx: { pt: 3, pb: 5 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", alignItems: "center", gap: 1, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: () => navigate("/services"), sx: { color: brand.muted }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBackRoundedIcon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800 }, children: "Book Cook" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            width: 100,
            height: 100,
            borderRadius: "50%",
            backgroundColor: brand.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleAltRoundedIcon, { sx: { fontSize: 48, color: brand.muted } })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 800, mb: 1 }, children: "Coming Soon" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", sx: { color: "text.secondary", mb: 3, lineHeight: 1.7 }, children: [
        "Book expert cooks for your home or event.",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "We're working hard to bring this to you soon."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          onClick: () => navigate("/services"),
          sx: { borderColor: brand.orange, color: brand.orange },
          children: "Back to Services"
        }
      )
    ] })
  ] }) });
}
export {
  BookCookPage as default
};
