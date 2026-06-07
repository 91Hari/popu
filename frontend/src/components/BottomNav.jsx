import { useLocation, useNavigate } from "react-router-dom";
import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

const NAV_ITEMS = [
  { label: "Home", value: "/customer", icon: <HomeRoundedIcon /> },
  { label: "Search", value: "/customer/search", icon: <SearchRoundedIcon /> },
  {
    label: "Bookings",
    value: "/customer/orders",
    icon: <ReceiptLongRoundedIcon />,
  },
  {
    label: "Offers",
    value: "/customer/offers",
    icon: <LocalOfferRoundedIcon />,
  },
  {
    label: "Profile",
    value: "/customer/profile",
    icon: <PersonRoundedIcon />,
  },
];

/**
 * Fixed bottom navigation for the customer-facing app, centered to a
 * mobile-width column on larger screens to match the popu mockup.
 */
export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Highlight the item whose route best matches the current path.
  const current =
    NAV_ITEMS.map((i) => i.value)
      .filter((v) => location.pathname === v || location.pathname.startsWith(v + "/"))
      .sort((a, b) => b.length - a.length)[0] || false;

  return (
    <Paper
      elevation={0}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderTop: "1px solid",
        borderColor: "divider",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <BottomNavigation
        showLabels
        value={current}
        onChange={(_, value) => navigate(value)}
        sx={{
          width: "100%",
          maxWidth: 600,
          height: 62,
          "& .MuiBottomNavigationAction-root": {
            color: "text.secondary",
            minWidth: 0,
          },
          "& .Mui-selected": { color: "primary.main" },
        }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
