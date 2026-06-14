import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, CircularProgress } from "@mui/material";
import RestaurantRoundedIcon   from "@mui/icons-material/RestaurantRounded";
import LunchDiningRoundedIcon  from "@mui/icons-material/LunchDiningRounded";
import BentoIcon               from "@mui/icons-material/Bento";
import PeopleAltRoundedIcon    from "@mui/icons-material/PeopleAltRounded";
import HomeRoundedIcon         from "@mui/icons-material/HomeRounded";
import SchoolRoundedIcon       from "@mui/icons-material/SchoolRounded";
import { brand } from "../../theme";
import AppLayout from "../../components/AppLayout";
import ServiceCard from "../../components/ServiceCard";
import ComingSoonModal from "../../components/ComingSoonModal";
import serviceConfigService from "../../services/serviceConfigService";

const SERVICE_DEFINITIONS = [
  {
    serviceCode: "CATERING",
    icon:     <RestaurantRoundedIcon sx={{ fontSize: 28, color: brand.orange }} />,
    title:    "Catering",
    subtitle: "Professional catering for weddings, parties & events",
    to:       "/services/catering",
  },
  {
    serviceCode: "FOOD",
    icon:     <LunchDiningRoundedIcon sx={{ fontSize: 28, color: brand.orange }} />,
    title:    "Food Marketplace",
    subtitle: "Daily fresh meals delivered to your door",
    to:       "/services/food-marketplace",
  },
  {
    serviceCode: "LUNCH_BOX",
    icon:     <BentoIcon sx={{ fontSize: 28, color: brand.orange }} />,
    title:    "Lunch Box",
    subtitle: "Fresh daily meal boxes from your favorite caterers",
    to:       "/services/tiffin-box",
  },
  {
    serviceCode: "BOOK_A_COOK",
    icon:     <PeopleAltRoundedIcon sx={{ fontSize: 28, color: brand.muted }} />,
    title:    "Book A Cook",
    subtitle: "Hire expert cooks for your home or event",
    to:       "/services/book-cook",
  },
  {
    serviceCode: "HOME_FOOD",
    icon:     <HomeRoundedIcon sx={{ fontSize: 28, color: brand.muted }} />,
    title:    "Home Food",
    subtitle: "Homemade food made with love",
    to:       "/services/home-food",
  },
  {
    serviceCode: "TRAINING",
    icon:     <SchoolRoundedIcon sx={{ fontSize: 28, color: brand.muted }} />,
    title:    "Training",
    subtitle: "Culinary training & upskilling courses",
    to:       "/services/training",
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const [enabledMap, setEnabledMap]     = useState({});
  const [loadingCfg, setLoadingCfg]     = useState(true);
  const [modalOpen, setModalOpen]       = useState(false);

  useEffect(() => {
    serviceConfigService.getServices()
      .then((configs) => {
        const map = {};
        configs.forEach((c) => { map[c.serviceCode] = c.isEnabled; });
        setEnabledMap(map);
      })
      .catch(() => {
        // On error fall back to enabled for live services, disabled for others
        setEnabledMap({ CATERING: true, FOOD: true, LUNCH_BOX: true });
      })
      .finally(() => setLoadingCfg(false));
  }, []);

  const handleServiceClick = (service) => {
    const enabled = enabledMap[service.serviceCode] ?? false;
    if (enabled) {
      navigate(service.to);
    } else {
      setModalOpen(true);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Our Services
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Choose a service to explore
        </Typography>

        {loadingCfg ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} size={28} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {SERVICE_DEFINITIONS.map((s) => {
              const enabled = enabledMap[s.serviceCode] ?? false;
              return (
                <ServiceCard
                  key={s.serviceCode}
                  icon={s.icon}
                  title={s.title}
                  subtitle={s.subtitle}
                  comingSoon={!enabled}
                  onClick={() => handleServiceClick(s)}
                />
              );
            })}
          </Box>
        )}
      </Container>

      <ComingSoonModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AppLayout>
  );
}
