import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Box, IconButton, Button, Drawer,
  List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Badge, useTheme, useMediaQuery, Tooltip,
} from "@mui/material";
import MenuRoundedIcon            from "@mui/icons-material/MenuRounded";
import HomeRoundedIcon            from "@mui/icons-material/HomeRounded";
import SearchRoundedIcon          from "@mui/icons-material/SearchRounded";
import ReceiptLongRoundedIcon     from "@mui/icons-material/ReceiptLongRounded";
import LocalOfferRoundedIcon      from "@mui/icons-material/LocalOfferRounded";
import PersonRoundedIcon          from "@mui/icons-material/PersonRounded";
import DashboardRoundedIcon       from "@mui/icons-material/DashboardRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import ListAltRoundedIcon         from "@mui/icons-material/ListAltRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import ShoppingCartRoundedIcon    from "@mui/icons-material/ShoppingCartRounded";
import LogoutRoundedIcon          from "@mui/icons-material/LogoutRounded";
import RestaurantMenuRoundedIcon  from "@mui/icons-material/RestaurantMenuRounded";

import Logo from "./Logo";
import { brand } from "../theme";
import { useCart } from "../contexts/CartContext";
import { useNotifications } from "../contexts/NotificationContext";

const CUSTOMER_NAV = [
  { label: "Home",     path: "/customer",        icon: <HomeRoundedIcon /> },
  { label: "Search",   path: "/customer/search",  icon: <SearchRoundedIcon /> },
  { label: "Bookings", path: "/customer/orders",  icon: <ReceiptLongRoundedIcon /> },
  { label: "Offers",   path: "/customer/offers",  icon: <LocalOfferRoundedIcon /> },
  { label: "Profile",  path: "/customer/profile", icon: <PersonRoundedIcon /> },
];

const CATERER_NAV = [
  { label: "Dashboard", path: "/caterer",           icon: <DashboardRoundedIcon /> },
  { label: "Add Food",  path: "/caterer/add-food",  icon: <AddCircleOutlineRoundedIcon /> },
  { label: "My Foods",  path: "/caterer/foods",     icon: <RestaurantMenuRoundedIcon /> },
  { label: "Orders",    path: "/caterer/orders",    icon: <ListAltRoundedIcon /> },
];

function matchActive(path, currentPath) {
  if (path === "/customer" || path === "/caterer") return currentPath === path;
  return currentPath.startsWith(path);
}

export default function TopNav() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isCaterer = location.pathname.startsWith("/caterer");
  const navItems  = isCaterer ? CATERER_NAV : CUSTOMER_NAV;
  const homeRoute = isCaterer ? "/caterer" : "/customer";

  const { cartCount }    = useCart();
  const { unreadCount }  = useNotifications();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const drawerContent = (
    <Box sx={{ width: 260 }} role="presentation" onClick={() => setDrawerOpen(false)}>
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Logo size={40} showWordmark={false} />
      </Box>
      <Divider />
      <List sx={{ pt: 1 }}>
        {navItems.map((item) => {
          const active = matchActive(item.path, location.pathname);
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2, mx: 1, mb: 0.5,
                backgroundColor: active ? brand.greenLight : "transparent",
                color: active ? brand.orange : "text.primary",
                "& .MuiListItemIcon-root": { color: active ? brand.orange : "text.secondary", minWidth: 40 },
                "&:hover": { backgroundColor: brand.greenLight },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: "0.95rem" }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2, mx: 1,
            color: "text.secondary",
            "& .MuiListItemIcon-root": { color: "text.secondary", minWidth: 40 },
            "&:hover": { backgroundColor: "#FFF0F0", color: "error.main" },
          }}
        >
          <ListItemIcon><LogoutRoundedIcon /></ListItemIcon>
          <ListItemText primary="Log Out" primaryTypographyProps={{ fontSize: "0.95rem" }} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: brand.white,
          borderBottom: `1px solid ${brand.border}`,
          color: brand.text,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: { xs: 56, md: 64 } }}>
          {/* Logo */}
          <Box
            onClick={() => navigate(homeRoute)}
            sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <Logo size={isMobile ? 36 : 40} showWordmark={false} />
          </Box>

          {/* Desktop nav */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {navItems.map((item) => {
                const active = matchActive(item.path, location.pathname);
                return (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    sx={{
                      fontWeight: active ? 700 : 500,
                      color: active ? brand.orange : brand.muted,
                      backgroundColor: active ? brand.greenLight : "transparent",
                      borderRadius: 2, px: 1.5,
                      "&:hover": { backgroundColor: brand.greenLight, color: brand.orange },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Right icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
            {!isCaterer && (
              <>
                {/* Notification bell */}
                <Tooltip title="Notifications">
                  <IconButton
                    size="small"
                    sx={{ color: brand.muted }}
                    onClick={() => navigate("/customer/notifications")}
                  >
                    <Badge
                      badgeContent={unreadCount > 0 ? unreadCount : null}
                      color="error"
                      max={99}
                      sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16 } }}
                    >
                      <NotificationsNoneRoundedIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Cart */}
                <Tooltip title="Cart">
                  <IconButton
                    size="small"
                    sx={{ color: brand.muted }}
                    onClick={() => navigate("/cart")}
                  >
                    <Badge
                      badgeContent={cartCount > 0 ? cartCount : null}
                      color="primary"
                      max={99}
                      sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16, backgroundColor: brand.gold, color: brand.text } }}
                    >
                      <ShoppingCartRoundedIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </>
            )}

            {isMobile && (
              <IconButton size="small" onClick={() => setDrawerOpen(true)} sx={{ color: brand.text }}>
                <MenuRoundedIcon />
              </IconButton>
            )}
            {!isMobile && (
              <Button
                size="small"
                startIcon={<LogoutRoundedIcon fontSize="small" />}
                onClick={handleLogout}
                sx={{ color: brand.muted, ml: 0.5, fontSize: "0.82rem" }}
              >
                Log Out
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawerContent}
      </Drawer>
    </>
  );
}
