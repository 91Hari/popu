import { j as jsxRuntimeExports, g as generateUtilityClass, a as generateUtilityClasses, r as reactExports, b as useDefaultProps, c as clsx, e as composeClasses, s as styled, m as memoTheme, u as useNavigate, h as brand } from "./index-EstIw0RN.js";
import { C as ChevronRightRoundedIcon } from "./ChevronRightRounded-7MdecKvC.js";
import { A as AppLayout, L as ListItemButton, a as ListItemIcon, c as ListItemText, d as LogoutRoundedIcon, R as ReceiptLongRoundedIcon, e as SettingsRoundedIcon } from "./AppLayout-DH-wOGjI.js";
import { L as LocationOnRoundedIcon } from "./LocationOnRounded-DboijKjd.js";
import { e as createSvgIcon, d as useSlot, T as Typography, f as List } from "./Logo-DCDhUauE.js";
import { C as Container } from "./index-BIPustA6.js";
import { C as Card } from "./Card-XJvyk6-3.js";
import { B as Button } from "./Button-DPTwUjxe.js";
const Person = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
}));
function getAvatarUtilityClass(slot) {
  return generateUtilityClass("MuiAvatar", slot);
}
generateUtilityClasses("MuiAvatar", ["root", "colorDefault", "circular", "rounded", "square", "img", "fallback"]);
const useUtilityClasses = (ownerState) => {
  const {
    classes,
    variant,
    colorDefault
  } = ownerState;
  const slots = {
    root: ["root", variant, colorDefault && "colorDefault"],
    img: ["img"],
    fallback: ["fallback"]
  };
  return composeClasses(slots, getAvatarUtilityClass, classes);
};
const AvatarRoot = styled("div", {
  name: "MuiAvatar",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, styles[ownerState.variant], ownerState.colorDefault && styles.colorDefault];
  }
})(memoTheme(({
  theme
}) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: 40,
  height: 40,
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.pxToRem(20),
  lineHeight: 1,
  borderRadius: "50%",
  overflow: "hidden",
  userSelect: "none",
  variants: [{
    props: {
      variant: "rounded"
    },
    style: {
      borderRadius: (theme.vars || theme).shape.borderRadius
    }
  }, {
    props: {
      variant: "square"
    },
    style: {
      borderRadius: 0
    }
  }, {
    props: {
      colorDefault: true
    },
    style: {
      color: (theme.vars || theme).palette.background.default,
      ...theme.vars ? {
        backgroundColor: theme.vars.palette.Avatar.defaultBg
      } : {
        backgroundColor: theme.palette.grey[400],
        ...theme.applyStyles("dark", {
          backgroundColor: theme.palette.grey[600]
        })
      }
    }
  }]
})));
const AvatarImg = styled("img", {
  name: "MuiAvatar",
  slot: "Img"
})({
  width: "100%",
  height: "100%",
  textAlign: "center",
  // Handle non-square image.
  objectFit: "cover",
  // Hide alt text.
  color: "transparent",
  // Hide the image broken icon, only works on Chrome.
  textIndent: 1e4
});
const AvatarFallback = styled(Person, {
  name: "MuiAvatar",
  slot: "Fallback"
})({
  width: "75%",
  height: "75%"
});
function useLoaded({
  crossOrigin,
  referrerPolicy,
  src,
  srcSet
}) {
  const [loaded, setLoaded] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!src && !srcSet) {
      return void 0;
    }
    setLoaded(false);
    let active = true;
    const image = new Image();
    image.onload = () => {
      if (!active) {
        return;
      }
      setLoaded("loaded");
    };
    image.onerror = () => {
      if (!active) {
        return;
      }
      setLoaded("error");
    };
    image.crossOrigin = crossOrigin;
    image.referrerPolicy = referrerPolicy;
    image.src = src;
    if (srcSet) {
      image.srcset = srcSet;
    }
    return () => {
      active = false;
    };
  }, [crossOrigin, referrerPolicy, src, srcSet]);
  return loaded;
}
const Avatar = /* @__PURE__ */ reactExports.forwardRef(function Avatar2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiAvatar"
  });
  const {
    alt,
    children: childrenProp,
    className,
    component = "div",
    slots = {},
    slotProps = {},
    imgProps,
    sizes,
    src,
    srcSet,
    variant = "circular",
    ...other
  } = props;
  let children = null;
  const ownerState = {
    ...props,
    component,
    variant
  };
  const loaded = useLoaded({
    ...imgProps,
    ...typeof slotProps.img === "function" ? slotProps.img(ownerState) : slotProps.img,
    src,
    srcSet
  });
  const hasImg = src || srcSet;
  const hasImgNotFailing = hasImg && loaded !== "error";
  ownerState.colorDefault = !hasImgNotFailing;
  delete ownerState.ownerState;
  const classes = useUtilityClasses(ownerState);
  const [RootSlot, rootSlotProps] = useSlot("root", {
    ref,
    className: clsx(classes.root, className),
    elementType: AvatarRoot,
    externalForwardedProps: {
      slots,
      slotProps,
      component,
      ...other
    },
    ownerState
  });
  const [ImgSlot, imgSlotProps] = useSlot("img", {
    className: classes.img,
    elementType: AvatarImg,
    externalForwardedProps: {
      slots,
      slotProps: {
        img: {
          ...imgProps,
          ...slotProps.img
        }
      }
    },
    additionalProps: {
      alt,
      src,
      srcSet,
      sizes
    },
    ownerState
  });
  const [FallbackSlot, fallbackSlotProps] = useSlot("fallback", {
    className: classes.fallback,
    elementType: AvatarFallback,
    externalForwardedProps: {
      slots,
      slotProps
    },
    shouldForwardComponentProp: true,
    ownerState
  });
  if (hasImgNotFailing) {
    children = /* @__PURE__ */ jsxRuntimeExports.jsx(ImgSlot, {
      ...imgSlotProps
    });
  } else if (!!childrenProp || childrenProp === 0) {
    children = childrenProp;
  } else if (hasImg && alt) {
    children = alt[0];
  } else {
    children = /* @__PURE__ */ jsxRuntimeExports.jsx(FallbackSlot, {
      ...fallbackSlotProps
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RootSlot, {
    ...rootSlotProps,
    children
  });
});
const PaymentRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2m-1 14H5c-.55 0-1-.45-1-1v-5h16v5c0 .55-.45 1-1 1m1-10H4V7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1z"
}));
const LocalOfferRoundedIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "m21.41 11.58-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42M5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7"
}));
const MENU = [
  { label: "My Bookings", to: "/customer/orders", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptLongRoundedIcon, { fontSize: "small" }) },
  { label: "My Orders", to: "/customer/orders", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptLongRoundedIcon, { fontSize: "small" }) },
  { label: "My Addresses", to: null, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LocationOnRoundedIcon, { fontSize: "small" }) },
  { label: "Payment Methods", to: null, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentRoundedIcon, { fontSize: "small" }) },
  { label: "Wallet & Offers", to: "/customer/offers", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LocalOfferRoundedIcon, { fontSize: "small" }) },
  { label: "Settings", to: null, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsRoundedIcon, { fontSize: "small" }) }
];
function ProfilePage() {
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "sm", sx: { pt: 3, pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { sx: { textAlign: "center", p: 3, mb: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Avatar,
        {
          sx: {
            width: 80,
            height: 80,
            mx: "auto",
            mb: 1.5,
            bgcolor: brand.orange,
            fontSize: "2rem",
            fontWeight: 700
          },
          children: (user.name || "P")[0].toUpperCase()
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 800 }, children: user.name || "Priya Sharma" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: user.email || "priya@email.com" }),
      user.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "text.secondary" }, children: [
        "+91 ",
        user.phone
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(List, { disablePadding: true, children: MENU.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      ListItemButton,
      {
        onClick: () => item.to && navigate(item.to),
        sx: {
          px: 1,
          py: 1.5,
          borderBottom: `1px solid ${brand.border}`,
          "& .MuiListItemIcon-root": { color: brand.orange, minWidth: 38 },
          "&:hover": { backgroundColor: brand.orangeLight }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: item.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListItemText,
            {
              primary: item.label,
              primaryTypographyProps: { fontSize: "0.95rem", fontWeight: 500 }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRightRoundedIcon, { sx: { color: "text.secondary", fontSize: 20 } })
        ]
      },
      item.label
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        fullWidth: true,
        variant: "outlined",
        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(LogoutRoundedIcon, {}),
        onClick: handleLogout,
        sx: { mt: 3 },
        children: "Log Out"
      }
    )
  ] }) });
}
export {
  ProfilePage as default
};
