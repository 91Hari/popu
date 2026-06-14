import { useNavigate } from "react-router-dom";
import { Box, Container, Toolbar, Typography, Card } from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import DiningIcon from "@mui/icons-material/Dining";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { brand } from "../../theme";
import AppLayout from "../../components/AppLayout";

const SERVICES = [
  {
    icon: <RestaurantRoundedIcon sx={{ fontSize: 28, color: brand.orange }} />,
    title: "Catering Services",
    subtitle: "For weddings, parties & events",
    to: "/customer/search",
  },
  {
    icon: <DiningIcon sx={{ fontSize: 28, color: brand.orange }} />,
    title: "Tiffin Services",
    subtitle: "Daily healthy meals at your door",
    to: "/customer/search",
  },
  {
    icon: <PeopleAltRoundedIcon sx={{ fontSize: 28, color: brand.orange }} />,
    title: "Book a Cook",
    subtitle: "Hire expert cooks for your event",
    to: "/customer/search",
  },
  {
    icon: <HomeRoundedIcon sx={{ fontSize: 28, color: brand.orange }} />,
    title: "Home Food",
    subtitle: "Homemade with love",
    to: "/customer/search",
  },
  {
    icon: <SchoolRoundedIcon sx={{ fontSize: 28, color: brand.orange }} />,
    title: "Cook Training Academy",
    subtitle: "Learn, Upskill, Grow",
    to: "/customer/search",
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>

      <Container maxWidth="md" sx={{ pt: 3, pb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2.5 }}>
          What would you like to do?
        </Typography>

        {SERVICES.map((s) => (
          <Card
            key={s.title}
            onClick={() => navigate(s.to)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              mb: 1.5,
              cursor: "pointer",
              transition: "border-color 0.15s, transform 0.15s",
              "&:hover": { borderColor: brand.orange, transform: "translateY(-2px)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2.5,
                  backgroundColor: brand.orangeLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {s.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {s.subtitle}
                </Typography>
              </Box>
            </Box>
            <ChevronRightRoundedIcon sx={{ color: brand.orange, flexShrink: 0 }} />
          </Card>
        ))}
      </Container>
    </AppLayout>
  );
}
