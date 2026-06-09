import { useNavigate } from "react-router-dom";
import { Box, Container, Toolbar, Typography } from "@mui/material";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import LunchDiningRoundedIcon from "@mui/icons-material/LunchDiningRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { brand } from "../../theme";
import AppLayout from "../../components/AppLayout";
import ServiceCard from "../../components/ServiceCard";

const SERVICES = [
  {
    icon: <RestaurantRoundedIcon sx={{ fontSize: 28, color: brand.orange }} />,
    title: "Catering",
    subtitle: "Professional catering for weddings, parties & events",
    to: "/services/catering",
    comingSoon: false,
  },
  {
    icon: <LunchDiningRoundedIcon sx={{ fontSize: 28, color: brand.orange }} />,
    title: "Tiffins",
    subtitle: "Daily fresh meals delivered to your door",
    to: "/services/tiffins",
    comingSoon: false,
  },
  {
    icon: <PeopleAltRoundedIcon sx={{ fontSize: 28, color: brand.muted }} />,
    title: "Book Cook",
    subtitle: "Hire expert cooks for your home or event",
    to: "/services/book-cook",
    comingSoon: true,
  },
  {
    icon: <HomeRoundedIcon sx={{ fontSize: 28, color: brand.muted }} />,
    title: "Home Food",
    subtitle: "Homemade food made with love",
    to: "/services/home-food",
    comingSoon: true,
  },
  {
    icon: <SchoolRoundedIcon sx={{ fontSize: 28, color: brand.muted }} />,
    title: "Training",
    subtitle: "Culinary training & upskilling courses",
    to: "/services/training",
    comingSoon: true,
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>

      <Container maxWidth="md" sx={{ pt: 3, pb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Our Services
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Choose a service to explore
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {SERVICES.map((s) => (
            <ServiceCard
              key={s.title}
              icon={s.icon}
              title={s.title}
              subtitle={s.subtitle}
              comingSoon={s.comingSoon}
              onClick={() => navigate(s.to)}
            />
          ))}
        </Box>
      </Container>
    </AppLayout>
  );
}
