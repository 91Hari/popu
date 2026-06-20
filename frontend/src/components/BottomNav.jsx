import { useLocation, useNavigate } from "react-router-dom";
import { Paper, BottomNavigation, BottomNavigationAction, Badge } from "@mui/material";
import HomeRoundedIcon        from "@mui/icons-material/HomeRounded";
import SearchRoundedIcon      from "@mui/icons-material/SearchRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PersonRoundedIcon      from "@mui/icons-material/PersonRounded";
import { brand } from "../theme";
import { useCart } from "../contexts/CartContext";

const NAV_ITEMS = [
  { label: "Home",    value: "/customer",               icon: <HomeRoundedIcon />,          exact: true },
  { label: "Search",  value: "/customer/search",        icon: <SearchRoundedIcon /> },
  { label: "Cart",    value: "/cart",                   icon: <ShoppingCartRoundedIcon />,  cart: true },
  { label: "Orders",  value: "/customer/master-orders", icon: <ReceiptLongRoundedIcon /> },
  { label: "Profile", value: "/customer/profile",       icon: <PersonRoundedIcon /> },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const current =
    NAV_ITEMS.map((i) => i.value)
      .filter((v) => {
        const item = NAV_ITEMS.find((n) => n.value === v);
        return item?.exact
          ? location.pathname === v
          : location.pathname === v || location.pathname.startsWith(v + "/");
      })
      .sort((a, b) => b.length - a.length)[0] || false;

  return (
    <Paper
      elevation={4}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        borderTop: `1px solid ${brand.border}`,
      }}
    >
      <BottomNavigation
        showLabels
        value={current}
        onChange={(_, value) => navigate(value)}
        sx={{
          height: 62,
          "& .MuiBottomNavigationAction-root": {
            color: brand.muted,
            minWidth: 0,
            fontSize: "0.68rem",
            py: 0.5,
          },
          "& .Mui-selected": {
            color: `${brand.orange} !important`,
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.65rem",
            "&.Mui-selected": { fontSize: "0.68rem" },
          },
        }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={
              item.cart && cartCount > 0 ? (
                <Badge
                  badgeContent={cartCount}
                  max={99}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: brand.gold,
                      color: brand.text,
                      fontSize: "0.6rem",
                      minWidth: 16,
                      height: 16,
                    },
                  }}
                >
                  {item.icon}
                </Badge>
              ) : item.icon
            }
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
