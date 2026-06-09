import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Drawer, AppBar, Toolbar, IconButton, Typography,
  List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Badge, Avatar, useTheme, useMediaQuery,
} from "@mui/material";
import MenuRoundedIcon              from "@mui/icons-material/MenuRounded";
import HomeRoundedIcon              from "@mui/icons-material/HomeRounded";
import SearchRoundedIcon            from "@mui/icons-material/SearchRounded";
import ReceiptLongRoundedIcon       from "@mui/icons-material/ReceiptLongRounded";
import PersonRoundedIcon            from "@mui/icons-material/PersonRounded";
import DashboardRoundedIcon         from "@mui/icons-material/DashboardRounded";
import AddCircleOutlineRoundedIcon  from "@mui/icons-material/AddCircleOutlineRounded";
import RestaurantMenuRoundedIcon    from "@mui/icons-material/RestaurantMenuRounded";
import ListAltRoundedIcon           from "@mui/icons-material/ListAltRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ShoppingCartRoundedIcon      from "@mui/icons-material/ShoppingCartRounded";
import LogoutRoundedIcon            from "@mui/icons-material/LogoutRounded";
import RoomServiceRoundedIcon       from "@mui/icons-material/RoomServiceRounded";
import LunchDiningRoundedIcon       from "@mui/icons-material/LunchDiningRounded";
import CircleRoundedIcon            from "@mui/icons-material/CircleRounded";
import PeopleRoundedIcon            from "@mui/icons-material/PeopleRounded";
import StorefrontRoundedIcon        from "@mui/icons-material/StorefrontRounded";
import AssessmentRoundedIcon        from "@mui/icons-material/AssessmentRounded";
import SettingsRoundedIcon          from "@mui/icons-material/SettingsRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import Logo from "./Logo";
import { brand } from "../theme";
import { useCart }          from "../contexts/CartContext";
import { useNotifications } from "../contexts/NotificationContext";

export const DRAWER_WIDTH = 240;

const CUSTOMER_NAV = [
  { label: "Dashboard",     path: "/customer",               icon: <HomeRoundedIcon /> },
  { label: "Services",      path: "/services",               icon: <RoomServiceRoundedIcon /> },
  { label: "Tiffins",       path: "/services/tiffins",       icon: <LunchDiningRoundedIcon /> },
  { label: "My Cart",       path: "/cart",                   icon: <ShoppingCartRoundedIcon />, cartBadge: true },
  { label: "My Orders",     path: "/customer/orders",        icon: <ReceiptLongRoundedIcon /> },
  { label: "Notifications", path: "/customer/notifications", icon: <NotificationsNoneRoundedIcon />, notifBadge: true },
  { label: "Profile",       path: "/customer/profile",       icon: <PersonRoundedIcon /> },
];

const CATERER_NAV = [
  { label: "Dashboard",       path: "/caterer",                  icon: <DashboardRoundedIcon /> },
  { label: "Food Management", path: "/caterer/foods",            icon: <RestaurantMenuRoundedIcon /> },
  { label: "Add Food",        path: "/caterer/add-food",         icon: <AddCircleOutlineRoundedIcon /> },
  { label: "Orders",          path: "/caterer/orders",           icon: <ListAltRoundedIcon /> },
  { label: "Notifications",   path: "/caterer/notifications",    icon: <NotificationsNoneRoundedIcon />, notifBadge: true },
  { label: "Availability",    path: "/caterer/availability",     icon: <CircleRoundedIcon /> },
  { label: "Profile",         path: "/caterer/profile",          icon: <PersonRoundedIcon /> },
];

const ADMIN_NAV = [
  { label: "Dashboard",    path: "/admin",              icon: <DashboardRoundedIcon /> },
  { label: "Customers",    path: "/admin/customers",    icon: <PeopleRoundedIcon /> },
  { label: "Caterers",     path: "/admin/caterers",     icon: <StorefrontRoundedIcon /> },
  { label: "Food Catalog", path: "/admin/foods",        icon: <RestaurantMenuRoundedIcon /> },
  { label: "Orders",       path: "/admin/orders",       icon: <ReceiptLongRoundedIcon /> },
  { label: "Notifications",path: "/admin/notifications",icon: <NotificationsNoneRoundedIcon /> },
  { label: "Reports",      path: "/admin/reports",      icon: <AssessmentRoundedIcon /> },
  { label: "Settings",     path: "/admin/settings",     icon: <SettingsRoundedIcon /> },
];

function matchActive(path, currentPath) {
  if (["/customer", "/caterer", "/admin"].includes(path)) return currentPath === path;
  return currentPath.startsWith(path);
}

function SidebarContent({ navItems, onNavigate, cartCount, unreadCount, onClose }) {
  const location = useLocation();
  const navigate  = useNavigate();

  const go = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Logo size={36} showWordmark={false} />
        <Typography variant="h6" sx={{ fontWeight: 900, color: brand.orange, letterSpacing: "-0.03em" }}>
          PO.PU
        </Typography>
      </Box>
      <Divider />

      {/* Nav items */}
      <List sx={{ flex: 1, pt: 1, px: 1 }}>
        {navItems.map((item) => {
          const active = matchActive(item.path, location.pathname);
          let icon = item.icon;
          if (item.cartBadge && cartCount > 0) {
            icon = <Badge badgeContent={cartCount} color="primary" max={99}
              sx={{ "& .MuiBadge-badge": { backgroundColor: brand.orange, fontSize: "0.6rem", minWidth: 16, height: 16 } }}>
              {item.icon}
            </Badge>;
          }
          if (item.notifBadge && unreadCount > 0) {
            icon = <Badge badgeContent={unreadCount} color="error" max={99}
              sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16 } }}>
              {item.icon}
            </Badge>;
          }
          return (
            <ListItemButton
              key={item.path}
              onClick={() => go(item.path)}
              sx={{
                borderRadius: 2, mb: 0.25, px: 1.5,
                backgroundColor: active ? brand.orangeLight : "transparent",
                color: active ? brand.orange : "text.primary",
                "& .MuiListItemIcon-root": { color: active ? brand.orange : "text.secondary", minWidth: 38 },
                "&:hover": { backgroundColor: brand.orangeLight, color: brand.orange,
                  "& .MuiListItemIcon-root": { color: brand.orange } },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>{icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: "0.88rem" }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />
      {/* Logout */}
      <List sx={{ px: 1, pb: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2, px: 1.5,
            color: "text.secondary",
            "& .MuiListItemIcon-root": { color: "text.secondary", minWidth: 38 },
            "&:hover": { backgroundColor: "#FFF0F0", color: "error.main",
              "& .MuiListItemIcon-root": { color: "error.main" } },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38 }}><LogoutRoundedIcon /></ListItemIcon>
          <ListItemText primary="Log Out" primaryTypographyProps={{ fontSize: "0.88rem" }} />
        </ListItemButton>
      </List>
    </Box>
  );
}

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location  = useLocation();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down("md"));

  const { cartCount }   = useCart();
  const { unreadCount } = useNotifications();

  const path = location.pathname;
  const role = (() => {
    try { return JSON.parse(localStorage.getItem("user"))?.role || "customer"; } catch { return "customer"; }
  })();

  let navItems;
  if (path.startsWith("/admin") || role === "admin") navItems = ADMIN_NAV;
  else if (path.startsWith("/caterer") || role === "caterer") navItems = CATERER_NAV;
  else navItems = CUSTOMER_NAV;

  const sidebarProps = { navItems, cartCount, unreadCount };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: brand.bg }}>
      {/* Permanent sidebar — desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH, flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH, boxSizing: "border-box",
              borderRight: `1px solid ${brand.border}`,
              bgcolor: brand.white,
            },
          }}
        >
          <SidebarContent {...sidebarProps} />
        </Drawer>
      )}

      {/* Temporary drawer — mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH, boxSizing: "border-box",
              borderRight: `1px solid ${brand.border}`,
              bgcolor: brand.white,
            },
          }}
        >
          <SidebarContent {...sidebarProps} onClose={() => setMobileOpen(false)} />
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          bgcolor: brand.bg,
          ...(isMobile ? {} : { ml: 0 }),
        }}
      >
        {/* Mobile top bar */}
        {isMobile && (
          <>
            <AppBar
              position="fixed"
              elevation={0}
              sx={{
                bgcolor: brand.white, borderBottom: `1px solid ${brand.border}`,
                color: brand.text, zIndex: theme.zIndex.drawer + 1,
              }}
            >
              <Toolbar sx={{ justifyContent: "space-between", minHeight: 56 }}>
                <IconButton size="small" onClick={() => setMobileOpen(true)} sx={{ color: brand.text }}>
                  <MenuRoundedIcon />
                </IconButton>
                <Logo size={32} showWordmark={false} />
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {navItems === CUSTOMER_NAV && (
                    <>
                      <IconButton size="small" sx={{ color: brand.muted }}
                        onClick={() => { /* notifications */ }}>
                        <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
                          <NotificationsNoneRoundedIcon fontSize="small" />
                        </Badge>
                      </IconButton>
                      <IconButton size="small" sx={{ color: brand.muted }}
                        onClick={() => { /* cart */ }}>
                        <Badge badgeContent={cartCount > 0 ? cartCount : null} color="primary" max={99}
                          sx={{ "& .MuiBadge-badge": { backgroundColor: brand.orange } }}>
                          <ShoppingCartRoundedIcon fontSize="small" />
                        </Badge>
                      </IconButton>
                    </>
                  )}
                  {(navItems === ADMIN_NAV) && (
                    <AdminPanelSettingsRoundedIcon sx={{ color: brand.orange }} />
                  )}
                </Box>
              </Toolbar>
            </AppBar>
            <Toolbar sx={{ minHeight: "56px !important" }} />
          </>
        )}
        {children}
      </Box>
    </Box>
  );
}
