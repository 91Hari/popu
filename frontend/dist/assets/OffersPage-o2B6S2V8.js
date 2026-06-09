import { j as jsxRuntimeExports, B as Box, h as brand } from "./index-EstIw0RN.js";
import { C as ChevronRightRoundedIcon } from "./ChevronRightRounded-7MdecKvC.js";
import { e as createSvgIcon, T as Typography } from "./Logo-DCDhUauE.js";
import { A as AppLayout } from "./AppLayout-DH-wOGjI.js";
import { C as Container } from "./index-BIPustA6.js";
const AccountBalanceWalletRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M10 16V8c0-1.1.89-2 2-2h9V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-1h-9c-1.11 0-2-.9-2-2m3-8c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h9V8zm3 5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5"
}));
const OFFERS = [
  {
    title: "₹300 OFF",
    detail: "On orders above ₹2000",
    code: "POPU300",
    valid: "Valid till 31 May 2024"
  },
  {
    title: "10% OFF",
    detail: "On Catering Bookings",
    code: "CATERER10",
    valid: "Valid till 30 Jun 2024"
  }
];
function OffersPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "sm", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 800, mb: 2 }, children: "My Wallet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        sx: {
          backgroundImage: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`,
          color: "white",
          borderRadius: 4,
          p: 3,
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { opacity: 0.85 }, children: "Total Balance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", sx: { fontWeight: 900, lineHeight: 1.1 }, children: "₹2,450" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mt: 0.5, opacity: 0.85, cursor: "pointer" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", children: "Transaction History" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRightRoundedIcon, { sx: { fontSize: 16 } })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccountBalanceWalletRoundedIcon, { sx: { fontSize: 56, opacity: 0.3 } })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        sx: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 800 }, children: "Available Offers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: brand.orange, cursor: "pointer" }, children: "View All" })
        ]
      }
    ),
    OFFERS.map((offer) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        sx: {
          backgroundColor: brand.orangeLight,
          border: `1.5px dashed ${brand.orange}`,
          borderRadius: 2.5,
          p: 2,
          mb: 1.5
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 800, color: brand.orange }, children: offer.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: offer.detail }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Box,
            {
              sx: {
                display: "inline-block",
                mt: 0.75,
                px: 1.25,
                py: 0.35,
                borderRadius: 1,
                backgroundColor: brand.white,
                fontFamily: "monospace",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: brand.orange,
                letterSpacing: "0.05em",
                border: `1px solid ${brand.border}`
              },
              children: offer.code
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { display: "block", color: "text.secondary", mt: 0.5 }, children: offer.valid })
        ]
      },
      offer.code
    ))
  ] }) });
}
export {
  OffersPage as default
};
