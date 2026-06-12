import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Drawer, AppBar, Toolbar, IconButton, Typography,
  List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Badge, Snackbar, Alert, useTheme, useMediaQuery,
} from "@mui/material";
import MenuRoundedIcon              from "@mui/icons-material/MenuRounded";
import HomeRoundedIcon              from "@mui/icons-material/HomeRounded";
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
import StorefrontRoundedIcon        from "@mui/icons-material/StorefrontRounded";
import LunchDiningRoundedIcon       from "@mui/icons-material/LunchDiningRounded";
import CircleRoundedIcon            from "@mui/icons-material/CircleRounded";
import PeopleRoundedIcon            from "@mui/icons-material/PeopleRounded";
import AssessmentRoundedIcon        from "@mui/icons-material/AssessmentRounded";
import SettingsRoundedIcon          from "@mui/icons-material/SettingsRounded";
import TuneRoundedIcon              from "@mui/icons-material/TuneRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import TwoWheelerRoundedIcon        from "@mui/icons-material/TwoWheelerRounded";
import EventRoundedIcon             from "@mui/icons-material/EventRounded";
import EventNoteRoundedIcon         from "@mui/icons-material/EventNoteRounded";
import SearchRoundedIcon            from "@mui/icons-material/SearchRounded";
import Logo from "./Logo";
import { brand } from "../theme";
import { useCart }          from "../contexts/CartContext";
import { useNotifications } from "../contexts/NotificationContext";
import LogoutConfirmationDialog from "./LogoutConfirmationDialog";
import Footer from "./Footer";

export const DRAWER_WIDTH = 240;

const CUSTOMER_NAV = [
  { label: "Dashboard",     path: "/customer",                    icon: <HomeRoundedIcon />,                   exact: true  },
  { label: "Services",      path: "/services",                    icon: <RoomServiceRoundedIcon />,            exact: true  },
  { label: "Food Marketplace", path: "/services/food-marketplace",icon: <LunchDiningRoundedIcon />,            exact: false },
  { label: "My Cart",       path: "/cart",                        icon: <ShoppingCartRoundedIcon />,           cartBadge: true  },
  { label: "My Orders",     path: "/customer/master-orders",       icon: <ReceiptLongRoundedIcon /> },
  { label: "My Bookings",   path: "/customer/catering-bookings",   icon: <EventRoundedIcon /> },
  { label: "Notifications", path: "/customer/notifications",      icon: <NotificationsNoneRoundedIcon />,      notifBadge: true },
  { label: "Profile",       path: "/customer/profile",            icon: <PersonRoundedIcon /> },
];

const CATERER_NAV = [
  { label: "Dashboard",        path: "/caterer",                  icon: <DashboardRoundedIcon />,         exact: true  },
  { label: "Food Management",  path: "/caterer/foods",            icon: <RestaurantMenuRoundedIcon /> },
  { label: "Add Food",         path: "/caterer/add-food",         icon: <AddCircleOutlineRoundedIcon /> },
  { label: "Orders",           path: "/caterer/sub-orders",       icon: <ListAltRoundedIcon /> },
  { label: "Catering Services",path: "/caterer/catering",          icon: <EventRoundedIcon /> },
  { label: "Event Bookings",   path: "/caterer/catering-bookings", icon: <EventNoteRoundedIcon /> },
  { label: "My Riders",        path: "/caterer/riders",            icon: <TwoWheelerRoundedIcon /> },
  { label: "Notifications",    path: "/caterer/notifications",    icon: <NotificationsNoneRoundedIcon />, notifBadge: true },
  { label: "Availability",     path: "/caterer/availability",     icon: <CircleRoundedIcon /> },
  { label: "Profile",          path: "/caterer/profile",          icon: <PersonRoundedIcon /> },
];

const ADMIN_NAV = [
  { label: "Dashboard",         path: "/admin",                    icon: <DashboardRoundedIcon />,         exact: true },
  { label: "Customers",         path: "/admin/customers",          icon: <PeopleRoundedIcon /> },
  { label: "Caterers",          path: "/admin/caterers",           icon: <StorefrontRoundedIcon /> },
  { label: "Food Catalog",      path: "/admin/foods",              icon: <RestaurantMenuRoundedIcon /> },
  { label: "Orders",            path: "/admin/orders",             icon: <ReceiptLongRoundedIcon /> },
  { label: "Riders",            path: "/admin/riders",             icon: <TwoWheelerRoundedIcon /> },
  { label: "Catering Bookings", path: "/admin/catering-bookings",  icon: <EventRoundedIcon /> },
  { label: "Notifications",     path: "/admin/notifications",      icon: <NotificationsNoneRoundedIcon /> },
  { label: "Reports",            path: "/admin/reports",             icon: <AssessmentRoundedIcon /> },
  { label: "Platform Settings", path: "/admin/platform-settings",  icon: <TuneRoundedIcon /> },
  { label: "Settings",          path: "/admin/settings",            icon: <SettingsRoundedIcon /> },
];

const RIDER_NAV = [
  { label: "Dashboard",   path: "/rider",         icon: <TwoWheelerRoundedIcon />, exact: true },
  { label: "Order Lookup",path: "/rider/lookup",  icon: <SearchRoundedIcon /> },
  { label: "Profile",     path: "/rider/profile", icon: <PersonRoundedIcon /> },
];

function matchActive(item, currentPath) {
  if (item.exact) return currentPath === item.path;
  return currentPath === item.path || currentPath.startsWith(item.path + "/");
}

function SidebarContent({ navItems, cartCount, unreadCount, onClose, onLogoutRequest }) {
  const location = useLocation();
  const navigate  = useNavigate();

  const go = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Logo size={60} showWordmark={false} src="/popuLogoHomePage.png" />
        <Typography variant="h6" sx={{ fontWeight: 900, color: brand.goldLight, letterSpacing: "-0.03em" }}>
          PO.PU
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />

      {/* Logout — immediately below brand for easy access */}
      <List sx={{ px: 1, pt: 1, pb: 0.5 }}>
        <ListItemButton
          onClick={onLogoutRequest}
          sx={{
            borderRadius: 2, px: 1.5,
            color: "rgba(255,255,255,0.85)",
            "& .MuiListItemIcon-root": { color: "rgba(255,255,255,0.7)", minWidth: 38 },
            "&:hover": {
              backgroundColor: brand.orangeMid,
              color: "white",
              "& .MuiListItemIcon-root": { color: "white" },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38 }}><LogoutRoundedIcon /></ListItemIcon>
          <ListItemText
            primary="Log Out"
            slotProps={{ primary: { style: { fontSize: "0.88rem", fontWeight: 500 } } }}
          />
        </ListItemButton>
      </List>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />

      {/* Nav items */}
      <List sx={{ flex: 1, pt: 1, px: 1, overflowY: "auto" }}>
        {navItems.map((item) => {
          const active = matchActive(item, location.pathname);
          let icon = item.icon;
          if (item.cartBadge && cartCount > 0) {
            icon = (
              <Badge badgeContent={cartCount} max={99}
                sx={{ "& .MuiBadge-badge": { backgroundColor: brand.gold, color: brand.text, fontSize: "0.6rem", minWidth: 16, height: 16 } }}>
                {item.icon}
              </Badge>
            );
          }
          if (item.notifBadge && unreadCount > 0) {
            icon = (
              <Badge badgeContent={unreadCount} max={99}
                sx={{ "& .MuiBadge-badge": { backgroundColor: brand.gold, color: brand.text, fontSize: "0.6rem", minWidth: 16, height: 16 } }}>
                {item.icon}
              </Badge>
            );
          }
          return (
            <ListItemButton
              key={item.path}
              onClick={() => go(item.path)}
              sx={{
                borderRadius: 2, mb: 0.25, px: 1.5,
                backgroundColor: active ? brand.gold : "transparent",
                color: active ? brand.text : "rgba(255,255,255,0.85)",
                "& .MuiListItemIcon-root": {
                  color: active ? brand.text : "rgba(255,255,255,0.7)",
                  minWidth: 38,
                },
                "&:hover": {
                  backgroundColor: active ? brand.gold : brand.orangeMid,
                  color: active ? brand.text : "white",
                  "& .MuiListItemIcon-root": { color: active ? brand.text : "white" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>{icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { style: { fontWeight: active ? 700 : 500, fontSize: "0.88rem" } } }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export default function AppLayout({ children }) {
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [logoutOpen,   setLogoutOpen]   = useState(false);
  const [toastOpen,    setToastOpen]    = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down("md"));

  const { cartCount }   = useCart();
  const { unreadCount } = useNotifications();

  const path = location.pathname;
  const role = (() => {
    try { return JSON.parse(localStorage.getItem("user"))?.role || "customer"; } catch { return "customer"; }
  })();

  let navItems;
  if      (path.startsWith("/admin")   || role === "admin")   navItems = ADMIN_NAV;
  else if (path.startsWith("/caterer") || role === "caterer") navItems = CATERER_NAV;
  else if (path.startsWith("/rider")   || role === "rider")   navItems = RIDER_NAV;
  else navItems = CUSTOMER_NAV;

  const handleLogoutRequest = () => setLogoutOpen(true);

  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToastOpen(true);
    setTimeout(() => navigate("/login"), 1500);
  };

  const sidebarProps = { navItems, cartCount, unreadCount, onLogoutRequest: handleLogoutRequest };

  const drawerSx = {
    width: DRAWER_WIDTH, boxSizing: "border-box",
    borderRight: "none",
    bgcolor: brand.orange,
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column", bgcolor: brand.bg }}>
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Permanent sidebar — desktop */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: DRAWER_WIDTH, flexShrink: 0,
              "& .MuiDrawer-paper": drawerSx,
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
            sx={{ "& .MuiDrawer-paper": { ...drawerSx, width: DRAWER_WIDTH } }}
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
            maxWidth: "100%",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            bgcolor: brand.bg,
          }}
        >
          {/* Mobile top bar */}
          {isMobile && (
            <>
              <AppBar
                position="fixed"
                elevation={0}
                sx={{
                  bgcolor: brand.white,
                  borderBottom: `1px solid ${brand.border}`,
                  color: brand.text,
                }}
              >
                <Toolbar sx={{ justifyContent: "space-between", minHeight: 56 }}>
                  <IconButton size="small" onClick={() => setMobileOpen(true)} sx={{ color: brand.text }}>
                    <MenuRoundedIcon />
                  </IconButton>
                  <Logo size={28} showWordmark src="/popuLogoHomePage.png" />
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {navItems === CUSTOMER_NAV && (
                      <>
                        <IconButton size="small" sx={{ color: brand.orange }}
                          onClick={() => navigate("/customer/notifications")}>
                          <Badge badgeContent={unreadCount > 0 ? unreadCount : null} max={99}
                            sx={{ "& .MuiBadge-badge": { backgroundColor: brand.gold, color: brand.text, fontSize: "0.6rem", minWidth: 16, height: 16 } }}>
                            <NotificationsNoneRoundedIcon fontSize="small" />
                          </Badge>
                        </IconButton>
                        <IconButton size="small" sx={{ color: brand.orange }}
                          onClick={() => navigate("/cart")}>
                          <Badge badgeContent={cartCount > 0 ? cartCount : null} max={99}
                            sx={{ "& .MuiBadge-badge": { backgroundColor: brand.gold, color: brand.text, fontSize: "0.6rem", minWidth: 16, height: 16 } }}>
                            <ShoppingCartRoundedIcon fontSize="small" />
                          </Badge>
                        </IconButton>
                      </>
                    )}
                    {navItems === CATERER_NAV && (
                      <IconButton size="small" sx={{ color: brand.orange }}
                        onClick={() => navigate("/caterer/notifications")}>
                        <Badge badgeContent={unreadCount > 0 ? unreadCount : null} max={99}
                          sx={{ "& .MuiBadge-badge": { backgroundColor: brand.gold, color: brand.text, fontSize: "0.6rem", minWidth: 16, height: 16 } }}>
                          <NotificationsNoneRoundedIcon fontSize="small" />
                        </Badge>
                      </IconButton>
                    )}
                    {navItems === ADMIN_NAV && (
                      <AdminPanelSettingsRoundedIcon sx={{ color: brand.orange }} />
                    )}
                  </Box>
                </Toolbar>
              </AppBar>
              <Toolbar sx={{ minHeight: "56px !important" }} />
            </>
          )}

          <Box sx={{ minHeight: "100vh" }}>{children}</Box>
          <Footer />
        </Box>
      </Box>

      {/* Logout confirmation dialog */}
      <LogoutConfirmationDialog
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />

      {/* Post-logout toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600 }}>
          Thank you for visiting PO.PU. See you again soon!
        </Alert>
      </Snackbar>
    </Box>
  );
}
