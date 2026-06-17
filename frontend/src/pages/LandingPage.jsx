import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, Stack, Card, CardContent,
  Grid, AppBar, Toolbar, IconButton, Accordion, AccordionSummary,
  AccordionDetails, Avatar, Chip, Divider, Drawer, List, ListItem,
  ListItemButton, ListItemText,
} from "@mui/material";
import MenuRoundedIcon              from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon             from "@mui/icons-material/CloseRounded";
import ExpandMoreRoundedIcon        from "@mui/icons-material/ExpandMoreRounded";
import CheckCircleRoundedIcon       from "@mui/icons-material/CheckCircleRounded";
import RestaurantRoundedIcon        from "@mui/icons-material/RestaurantRounded";
import StorefrontRoundedIcon        from "@mui/icons-material/StorefrontRounded";
import LunchDiningRoundedIcon       from "@mui/icons-material/LunchDiningRounded";
import PeopleRoundedIcon            from "@mui/icons-material/PeopleRounded";
import HomeRoundedIcon              from "@mui/icons-material/HomeRounded";
import SchoolRoundedIcon            from "@mui/icons-material/SchoolRounded";
import VerifiedRoundedIcon          from "@mui/icons-material/VerifiedRounded";
import MoneyOffRoundedIcon          from "@mui/icons-material/MoneyOffRounded";
import GpsFixedRoundedIcon          from "@mui/icons-material/GpsFixedRounded";
import StarRoundedIcon              from "@mui/icons-material/StarRounded";
import PhoneIphoneRoundedIcon       from "@mui/icons-material/PhoneIphoneRounded";
import PlayCircleFilledRoundedIcon  from "@mui/icons-material/PlayCircleFilledRounded";
import FacebookRoundedIcon          from "@mui/icons-material/FacebookRounded";
import InstagramIcon                from "@mui/icons-material/Instagram";
import LinkedInIcon                 from "@mui/icons-material/LinkedIn";
import YouTubeIcon                  from "@mui/icons-material/YouTube";
import ArrowForwardRoundedIcon      from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackIosNewRoundedIcon   from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon   from "@mui/icons-material/ArrowForwardIosRounded";
import TwoWheelerRoundedIcon        from "@mui/icons-material/TwoWheelerRounded";
import KitchenRoundedIcon           from "@mui/icons-material/KitchenRounded";
import EmojiPeopleRoundedIcon       from "@mui/icons-material/EmojiPeopleRounded";
import AccessTimeRoundedIcon        from "@mui/icons-material/AccessTimeRounded";
import PaymentRoundedIcon           from "@mui/icons-material/PaymentRounded";
import TaskAltRoundedIcon           from "@mui/icons-material/TaskAltRounded";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const G  = "#166A1F";   // Forest Green (primary)
const GM = "#1B5E20";   // Deep Forest Green (hover)
const GL = "#E8F5E9";   // Light green
const Y  = "#F2BE00";   // Golden Yellow
const YL = "#FFFBEA";   // Light yellow

// ── Static data ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Home",        href: "#home"        },
  { label: "Services",    href: "#services"    },
  { label: "How It Works",href: "#how-it-works"},
  { label: "About Us",    href: "#why-popu"    },
  { label: "Contact",     href: "#contact"     },
];

const SERVICES = [
  {
    icon: <RestaurantRoundedIcon sx={{ fontSize: 32 }} />,
    title: "Catering",
    desc: "Wedding, Corporate & Birthday Catering from verified professionals.",
    color: "#1B5E20",
  },
  {
    icon: <StorefrontRoundedIcon sx={{ fontSize: 32 }} />,
    title: "Food Marketplace",
    desc: "Browse fresh food from multiple trusted vendors near you.",
    color: "#2E7D32",
  },
  {
    icon: <LunchDiningRoundedIcon sx={{ fontSize: 32 }} />,
    title: "Lunch Box Services",
    desc: "Daily and monthly meal plans delivered to your doorstep.",
    color: "#166A1F",
  },
  {
    icon: <KitchenRoundedIcon sx={{ fontSize: 32 }} />,
    title: "Book a Cook",
    desc: "Hire verified professional cooks for home or events.",
    color: "#388E3C",
  },
  {
    icon: <HomeRoundedIcon sx={{ fontSize: 32 }} />,
    title: "Home Food",
    desc: "Authentic homemade healthy meals from trusted home chefs.",
    color: "#2E7D32",
  },
  {
    icon: <SchoolRoundedIcon sx={{ fontSize: 32 }} />,
    title: "Training",
    desc: "Cooking and catering training by certified culinary experts.",
    color: "#1B5E20",
  },
];

const HOW_STEPS = [
  { icon: <RestaurantRoundedIcon />,    label: "Choose Service",         desc: "Pick the service you need." },
  { icon: <StorefrontRoundedIcon />,    label: "Select Vendor",          desc: "Browse verified vendors." },
  { icon: <EmojiPeopleRoundedIcon />,   label: "Customize Requirement",  desc: "Set your preferences." },
  { icon: <PaymentRoundedIcon />,       label: "Secure Payment",         desc: "Pay safely online." },
  { icon: <GpsFixedRoundedIcon />,      label: "Track Order Live",       desc: "Real-time GPS tracking." },
  { icon: <TaskAltRoundedIcon />,       label: "Enjoy Quality Food",     desc: "Savor fresh delivery!" },
];

const WHY_CARDS = [
  {
    icon: <VerifiedRoundedIcon sx={{ fontSize: 36 }} />,
    title: "Verified Vendors",
    desc: "Background checks, certifications and community ratings for every vendor.",
    bg: GL,
  },
  {
    icon: <MoneyOffRoundedIcon sx={{ fontSize: 36 }} />,
    title: "Transparent Pricing",
    desc: "No hidden charges. What you see is exactly what you pay.",
    bg: YL,
  },
  {
    icon: <GpsFixedRoundedIcon sx={{ fontSize: 36 }} />,
    title: "Live Tracking",
    desc: "Track your rider and delivery in real-time on Google Maps.",
    bg: GL,
  },
  {
    icon: <LunchDiningRoundedIcon sx={{ fontSize: 36 }} />,
    title: "Multiple Options",
    desc: "Home food, catering, lunch boxes, cooks — all in one platform.",
    bg: YL,
  },
];

const STATS = [
  { value: 1000, suffix: "+", label: "Happy Customers",       icon: <PeopleRoundedIcon sx={{ fontSize: 28 }} /> },
  { value: 500,  suffix: "+", label: "Food Items",            icon: <RestaurantRoundedIcon sx={{ fontSize: 28 }} /> },
  { value: 100,  suffix: "+", label: "Verified Vendors",      icon: <VerifiedRoundedIcon sx={{ fontSize: 28 }} /> },
  { value: 50,   suffix: "+", label: "Cities",                icon: <HomeRoundedIcon sx={{ fontSize: 28 }} /> },
  { value: 98,   suffix: "%", label: "Customer Satisfaction", icon: <StarRoundedIcon sx={{ fontSize: 28 }} /> },
];

const VENDORS = [
  { name: "Asha's Kitchen",    specialty: "South Indian & Homemade",  location: "Bangalore", rating: 4.9, bg: "#E8F5E9" },
  { name: "Royal Caterers",   specialty: "Wedding & Event Catering",  location: "Hyderabad", rating: 4.8, bg: "#FFF8E1" },
  { name: "FreshBox Daily",   specialty: "Lunch Boxes & Meal Plans",  location: "Chennai",   rating: 4.7, bg: "#E8F5E9" },
  { name: "Chef Ravi",        specialty: "Professional Cook",          location: "Mumbai",    rating: 4.9, bg: "#FFF8E1" },
  { name: "Green Leaf Foods", specialty: "Vegan & Healthy Meals",     location: "Pune",      rating: 4.8, bg: "#E8F5E9" },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Home Customer",
    review: "PO.PU changed how I order food. Fresh, on-time, and the caterers are incredibly professional. Highly recommended!",
    rating: 5,
    initials: "PS",
    bg: G,
  },
  {
    name: "Rahul Verma",
    role: "Corporate Client",
    review: "We used PO.PU for our company event catering. The experience was seamless from booking to delivery. Will use again!",
    rating: 5,
    initials: "RV",
    bg: "#2E7D32",
  },
  {
    name: "Anita Krishnan",
    role: "Regular Customer",
    review: "The lunch box service is a lifesaver. Fresh homemade food delivered every day at a very affordable price.",
    rating: 5,
    initials: "AK",
    bg: "#1B5E20",
  },
];

const FAQS = [
  {
    q: "How does PO.PU work?",
    a: "Choose a service, browse verified vendors, customize your order, pay securely online, and track your delivery live on Google Maps. It's that simple!",
  },
  {
    q: "How are vendors verified?",
    a: "All vendors go through background verification, FSSAI compliance checks, community ratings, and periodic quality audits before they are listed on PO.PU.",
  },
  {
    q: "Can I book catering online?",
    a: "Yes! Browse our caterers, select your event type, customize your menu, confirm the date, and pay securely — all in a few taps on the app or website.",
  },
  {
    q: "How do refunds work?",
    a: "Refunds are processed within 5–7 business days for cancelled orders. For disputes, our support team resolves issues within 24 hours.",
  },
  {
    q: "Is live tracking available?",
    a: "Yes. Once your order is out for delivery, you can track your rider's real-time location on Google Maps directly from the PO.PU app.",
  },
];

// ── Animated stat counter ──────────────────────────────────────────────────────
function StatCounter({ value, suffix, label, icon }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          let start = 0;
          const duration = 1800;
          const step = Math.ceil(value / (duration / 16));
          const timer = setInterval(() => {
            start = Math.min(start + step, value);
            setCount(start);
            if (start >= value) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <Card
      ref={ref}
      elevation={0}
      sx={{
        border: "1px solid #E8F5E9",
        borderRadius: 3,
        p: 3,
        textAlign: "center",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(22,106,31,0.12)" },
      }}
    >
      <Box sx={{
        width: 52, height: 52, borderRadius: "50%",
        background: GL, display: "flex",
        alignItems: "center", justifyContent: "center",
        mx: "auto", mb: 1.5, color: G,
      }}>
        {icon}
      </Box>
      <Typography variant="h4" fontWeight={900} sx={{ color: G, lineHeight: 1 }}>
        {count}{suffix}
      </Typography>
      <Typography variant="body2" sx={{ color: "#555", fontWeight: 600, mt: 0.5 }}>
        {label}
      </Typography>
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate     = useNavigate();
  const [scrolled,   setScrolled]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [vendorIdx,  setVendorIdx]  = useState(0);
  const [testiIdx,   setTestiIdx]   = useState(0);
  const [expanded,   setExpanded]   = useState(false);

  // Refs for smooth scroll
  const sectionRefs = {
    home:         useRef(null),
    services:     useRef(null),
    "how-it-works": useRef(null),
    "why-popu":   useRef(null),
    contact:      useRef(null),
  };

  // Header scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-advance testimonials
  useEffect(() => {
    const t = setInterval(() => setTestiIdx((i) => (i + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (href) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setDrawerOpen(false);
  };

  const visibleVendors = VENDORS.slice(vendorIdx, vendorIdx + 3).concat(
    VENDORS.slice(0, Math.max(0, vendorIdx + 3 - VENDORS.length))
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ fontFamily: "'Segoe UI', system-ui, sans-serif", overflowX: "hidden" }}>

      {/* ══ HEADER ══════════════════════════════════════════════════════════════ */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: scrolled ? "1px solid #E8F5E9" : "none",
          transition: "all 0.3s ease",
          boxShadow: scrolled ? "0 2px 20px rgba(22,106,31,0.08)" : "none",
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, mx: "auto", width: "100%", px: { xs: 2, md: 4 }, py: 0.5 }}>
          {/* Logo */}
          <Box
            component="img"
            src="/popuLogoHomePage.png"
            alt="PO.PU"
            sx={{ height: 40, mr: 1.5, cursor: "pointer", objectFit: "contain" }}
            onClick={() => scrollTo("#home")}
          />

          {/* Desktop Nav */}
          <Stack direction="row" spacing={0.5} sx={{ flex: 1, display: { xs: "none", md: "flex" } }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.label}
                onClick={() => scrollTo(item.href)}
                sx={{
                  color: "#333", fontWeight: 600, fontSize: "0.88rem",
                  px: 1.5, py: 0.75,
                  "&:hover": { color: G, backgroundColor: GL },
                  borderRadius: 1.5,
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          {/* CTA Buttons */}
          <Stack direction="row" spacing={1.25} sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/login")}
              sx={{
                borderColor: G, color: G, fontWeight: 700,
                px: 2.5, borderRadius: 2,
                "&:hover": { backgroundColor: GL, borderColor: G },
              }}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                backgroundColor: G, fontWeight: 700, px: 2.5, borderRadius: 2,
                "&:hover": { backgroundColor: GM },
              }}
            >
              Get Started
            </Button>
          </Stack>

          {/* Mobile menu icon */}
          <IconButton
            sx={{ display: { md: "none" }, ml: "auto", color: G }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280, pt: 2 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, mb: 2 }}>
          <Box component="img" src="/popuLogoHomePage.png" alt="PO.PU" sx={{ height: 36 }} />
          <IconButton onClick={() => setDrawerOpen(false)}><CloseRoundedIcon /></IconButton>
        </Box>
        <Divider />
        <List>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton onClick={() => scrollTo(item.href)}>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ px: 2, pt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button fullWidth variant="outlined" onClick={() => navigate("/login")}
            sx={{ borderColor: G, color: G, fontWeight: 700 }}>Sign In</Button>
          <Button fullWidth variant="contained" onClick={() => navigate("/login")}
            sx={{ backgroundColor: G, fontWeight: 700, "&:hover": { backgroundColor: GM } }}>Get Started</Button>
        </Box>
      </Drawer>

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <Box
        id="home"
        ref={sectionRefs.home}
        sx={{
          pt: { xs: 12, md: 14 }, pb: { xs: 8, md: 10 },
          background: "linear-gradient(145deg, #FAFFF9 0%, #F0F9F0 50%, #FAFAF7 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{
          position: "absolute", width: 400, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(22,106,31,0.07) 0%, transparent 70%)",
          top: -100, right: -100, pointerEvents: "none",
        }} />
        <Box sx={{
          position: "absolute", width: 300, height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(242,190,0,0.08) 0%, transparent 70%)",
          bottom: 0, left: -50, pointerEvents: "none",
        }} />

        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">

            {/* Left: Text */}
            <Grid item xs={12} md={6}>
              <Chip
                label="🌿 India's Trusted Food Marketplace"
                size="small"
                sx={{
                  backgroundColor: GL, color: G, fontWeight: 700,
                  fontSize: "0.78rem", mb: 2.5, borderRadius: 2,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.4rem", sm: "3rem", md: "3.5rem" },
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  color: "#1A1A1A",
                  mb: 1,
                }}
              >
                Healthy Food
                <Box component="span" sx={{ color: G, display: "block" }}>
                  For Every Occasion
                </Box>
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#555", mb: 3.5, maxWidth: 500, lineHeight: 1.7, fontSize: "1.05rem" }}
              >
                PO.PU connects customers with trusted caterers, home chefs, food vendors,
                lunch box providers, and cooking professionals — all in one platform.
              </Typography>

              {/* CTA Buttons */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 4 }}>
                <Button
                  size="large"
                  variant="contained"
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={() => navigate("/login")}
                  sx={{
                    backgroundColor: G,
                    fontWeight: 800, px: 3.5, py: 1.5,
                    fontSize: "1rem", borderRadius: 2.5,
                    boxShadow: "0 4px 20px rgba(22,106,31,0.3)",
                    "&:hover": { backgroundColor: GM, boxShadow: "0 6px 24px rgba(22,106,31,0.4)" },
                  }}
                >
                  Explore Services
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  onClick={() => navigate("/login")}
                  sx={{
                    borderColor: G, color: G, fontWeight: 800,
                    px: 3.5, py: 1.5, fontSize: "1rem", borderRadius: 2.5,
                    borderWidth: 2,
                    "&:hover": { backgroundColor: GL, borderWidth: 2 },
                  }}
                >
                  Browse Food Marketplace
                </Button>
              </Stack>

              {/* Trust indicators */}
              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                {["Verified Vendors", "Fresh Food Daily", "Secure Payments", "Fast Delivery"].map((t) => (
                  <Stack key={t} direction="row" alignItems="center" spacing={0.5}>
                    <CheckCircleRoundedIcon sx={{ color: G, fontSize: 18 }} />
                    <Typography variant="body2" fontWeight={700} sx={{ color: "#333" }}>{t}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            {/* Right: Hero card */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative" }}>
                {/* Main food card */}
                <Box sx={{
                  borderRadius: 5,
                  overflow: "hidden",
                  background: `linear-gradient(145deg, ${G} 0%, #2E7D32 100%)`,
                  p: 0,
                  boxShadow: "0 24px 64px rgba(22,106,31,0.35)",
                  position: "relative",
                }}>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=640&q=80"
                    alt="Healthy food"
                    sx={{
                      width: "100%",
                      height: { xs: 280, md: 380 },
                      objectFit: "cover",
                      display: "block",
                      opacity: 0.92,
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.style.minHeight = "320px";
                    }}
                  />
                  {/* Overlay badge */}
                  <Box sx={{
                    position: "absolute", top: 16, right: 16,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: 2.5, px: 2, py: 1.25,
                    display: "flex", alignItems: "center", gap: 0.75,
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                  }}>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: "50%",
                      backgroundColor: G, display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <CheckCircleRoundedIcon sx={{ color: "#fff", fontSize: 16 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" fontWeight={800} sx={{ color: G, display: "block", lineHeight: 1 }}>
                        100% Pure
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#555", fontSize: "0.65rem" }}>
                        &amp; Fresh
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Floating cards */}
                <Box sx={{
                  position: "absolute", bottom: -20, left: -20,
                  backgroundColor: "#fff", borderRadius: 3,
                  p: 1.75, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", gap: 1.25,
                  minWidth: 160,
                }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: "50%",
                    backgroundColor: YL, display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <TwoWheelerRoundedIcon sx={{ color: Y, fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={800} sx={{ display: "block", lineHeight: 1.2 }}>
                      On-Time Delivery
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#888", fontSize: "0.7rem" }}>
                      Every Time
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{
                  position: "absolute", top: -16, left: -16,
                  backgroundColor: "#fff", borderRadius: 3,
                  p: 1.75, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", gap: 1.25,
                  minWidth: 160,
                }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: "50%",
                    backgroundColor: GL, display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <VerifiedRoundedIcon sx={{ color: G, fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={800} sx={{ display: "block", lineHeight: 1.2 }}>
                      Trusted Vendors
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#888", fontSize: "0.7rem" }}>
                      Background Verified
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ══ HOW IT WORKS (strip) ═════════════════════════════════════════════════ */}
      <Box
        id="how-it-works"
        ref={sectionRefs["how-it-works"]}
        sx={{
          background: `linear-gradient(135deg, ${G} 0%, #2E7D32 100%)`,
          py: { xs: 5, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={3}
          >
            <Box sx={{ minWidth: 160, flexShrink: 0 }}>
              <Typography variant="h5" fontWeight={900} sx={{ color: "#fff" }}>
                How It Works
              </Typography>
              <Box sx={{
                width: 36, height: 36, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                mt: 1,
              }}>
                <ArrowForwardRoundedIcon sx={{ color: "#fff", fontSize: 18 }} />
              </Box>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              flexWrap="wrap"
              gap={2}
              flex={1}
            >
              {HOW_STEPS.map((step, i) => (
                <Stack key={step.label} direction="row" alignItems="center" gap={1.5}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    border: "2px solid rgba(255,255,255,0.35)",
                    backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, color: "#fff",
                  }}>
                    {step.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={800} sx={{ color: "#fff", display: "block", lineHeight: 1.2 }}>
                      {step.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.68rem" }}>
                      {step.desc}
                    </Typography>
                  </Box>
                  {i < HOW_STEPS.length - 1 && (
                    <ArrowForwardRoundedIcon sx={{
                      color: "rgba(255,255,255,0.35)", fontSize: 18,
                      display: { xs: "none", lg: "block" }, flexShrink: 0,
                    }} />
                  )}
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ══ SERVICES ════════════════════════════════════════════════════════════ */}
      <Box id="services" ref={sectionRefs.services} sx={{ py: { xs: 8, md: 10 }, backgroundColor: "#FAFAF7" }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Chip label="What We Offer" size="small" sx={{ backgroundColor: GL, color: G, fontWeight: 700, mb: 1.5 }} />
            <Typography variant="h2" fontWeight={900} sx={{ color: "#1A1A1A", mb: 1 }}>
              Our Services
            </Typography>
            <Typography variant="body1" sx={{ color: "#666", maxWidth: 520, mx: "auto" }}>
              From everyday meals to grand events — PO.PU has you covered with 6 distinct food services.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {SERVICES.map((svc) => (
              <Grid item xs={12} sm={6} md={4} key={svc.title}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #E8F5E9",
                    borderRadius: 3, p: 0.5,
                    height: "100%",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: `0 16px 40px rgba(22,106,31,0.15)`,
                      borderColor: G,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{
                      width: 60, height: 60, borderRadius: 2.5,
                      backgroundColor: GL, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      color: G, mb: 2,
                    }}>
                      {svc.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 0.75 }}>
                      {svc.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", lineHeight: 1.6 }}>
                      {svc.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ══ WHY POPU ════════════════════════════════════════════════════════════ */}
      <Box id="why-popu" ref={sectionRefs["why-popu"]} sx={{ py: { xs: 8, md: 10 }, backgroundColor: "#fff" }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Chip label="Why Choose Us" size="small" sx={{ backgroundColor: YL, color: "#9A7200", fontWeight: 700, mb: 1.5 }} />
            <Typography variant="h2" fontWeight={900} sx={{ color: "#1A1A1A", mb: 1 }}>
              Why Choose PO.PU?
            </Typography>
            <Typography variant="body1" sx={{ color: "#666", maxWidth: 500, mx: "auto" }}>
              We're not just a food platform — we're a community committed to quality, safety, and freshness.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {WHY_CARDS.map((card) => (
              <Grid item xs={12} sm={6} md={3} key={card.title}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #F0F0F0",
                    borderRadius: 3, p: 0.5, height: "100%",
                    transition: "all 0.25s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{
                      width: 60, height: 60, borderRadius: 2.5,
                      backgroundColor: card.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: G, mb: 2,
                    }}>
                      {card.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 0.75 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", lineHeight: 1.6 }}>
                      {card.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ══ STATISTICS ══════════════════════════════════════════════════════════ */}
      <Box sx={{
        py: { xs: 8, md: 10 },
        background: "linear-gradient(145deg, #F0F9F0 0%, #FAFFF9 100%)",
      }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 5 }}>
            <Typography variant="h2" fontWeight={900} sx={{ color: "#1A1A1A", mb: 1 }}>
              Trusted by Thousands
            </Typography>
            <Typography variant="body1" sx={{ color: "#666" }}>
              Numbers that speak for themselves.
            </Typography>
          </Box>
          <Grid container spacing={2.5}>
            {STATS.map((s) => (
              <Grid item xs={6} sm={4} md key={s.label}>
                <StatCounter {...s} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ══ FEATURED VENDORS ════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 10 }, backgroundColor: "#fff" }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ mb: 5 }}>
            <Box>
              <Chip label="Top Rated" size="small" sx={{ backgroundColor: GL, color: G, fontWeight: 700, mb: 1 }} />
              <Typography variant="h2" fontWeight={900} sx={{ color: "#1A1A1A" }}>
                Featured Vendors
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, sm: 0 } }}>
              <IconButton
                onClick={() => setVendorIdx((i) => (i - 1 + VENDORS.length) % VENDORS.length)}
                sx={{ border: `1.5px solid ${G}`, color: G, "&:hover": { backgroundColor: GL } }}
              >
                <ArrowBackIosNewRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => setVendorIdx((i) => (i + 1) % VENDORS.length)}
                sx={{ border: `1.5px solid ${G}`, color: G, "&:hover": { backgroundColor: GL } }}
              >
                <ArrowForwardIosRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          <Grid container spacing={3}>
            {visibleVendors.map((v, i) => (
              <Grid item xs={12} sm={4} key={v.name + i}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #E8F5E9", borderRadius: 3,
                    transition: "all 0.25s",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 32px rgba(22,106,31,0.12)", borderColor: G },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{
                      height: 80, borderRadius: 2.5,
                      backgroundColor: v.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      mb: 2,
                    }}>
                      <RestaurantRoundedIcon sx={{ fontSize: 36, color: G }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.25 }}>
                      {v.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#666", display: "block", mb: 1 }}>
                      {v.specialty}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={0.4}>
                        <StarRoundedIcon sx={{ color: Y, fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={700}>{v.rating}</Typography>
                      </Stack>
                      <Chip label={v.location} size="small" sx={{ fontSize: "0.68rem", backgroundColor: GL, color: G, fontWeight: 600 }} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 10 }, background: "linear-gradient(145deg, #F0F9F0, #FAFAF7)" }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Chip label="What Customers Say" size="small" sx={{ backgroundColor: GL, color: G, fontWeight: 700, mb: 1.5 }} />
            <Typography variant="h2" fontWeight={900} sx={{ color: "#1A1A1A" }}>
              Loved by Customers
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {TESTIMONIALS.map((t, i) => (
              <Grid item xs={12} md={4} key={t.name}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid #E0F2E0",
                    borderRadius: 3, p: 0.5, height: "100%",
                    opacity: i === testiIdx ? 1 : 0.75,
                    transform: i === testiIdx ? "scale(1.02)" : "scale(1)",
                    transition: "all 0.5s ease",
                    cursor: "pointer",
                    "&:hover": { transform: "scale(1.02)", opacity: 1 },
                  }}
                  onClick={() => setTestiIdx(i)}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Stars */}
                    <Stack direction="row" spacing={0.25} sx={{ mb: 2 }}>
                      {[...Array(t.rating)].map((_, j) => (
                        <StarRoundedIcon key={j} sx={{ color: Y, fontSize: 18 }} />
                      ))}
                    </Stack>
                    <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.7, mb: 3, fontStyle: "italic" }}>
                      "{t.review}"
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: "#E8F5E9" }} />
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ backgroundColor: t.bg, fontWeight: 800, width: 42, height: 42 }}>
                        {t.initials}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={800}>{t.name}</Typography>
                        <Typography variant="caption" sx={{ color: "#888" }}>{t.role}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Dot indicators */}
          <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 3 }}>
            {TESTIMONIALS.map((_, i) => (
              <Box
                key={i}
                onClick={() => setTestiIdx(i)}
                sx={{
                  width: i === testiIdx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === testiIdx ? G : "#C8E6C9",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ══ MOBILE APP ══════════════════════════════════════════════════════════ */}
      <Box sx={{
        py: { xs: 8, md: 10 }, backgroundColor: "#fff",
        overflow: "hidden",
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            {/* Phone mockup */}
            <Grid item xs={12} md={5} sx={{ display: "flex", justifyContent: "center" }}>
              <Box sx={{
                width: { xs: 200, md: 240 },
                height: { xs: 360, md: 440 },
                borderRadius: 6,
                background: `linear-gradient(145deg, ${G} 0%, #2E7D32 100%)`,
                boxShadow: "0 24px 64px rgba(22,106,31,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
                flexDirection: "column",
                gap: 2,
              }}>
                <PhoneIphoneRoundedIcon sx={{ fontSize: 80, color: "rgba(255,255,255,0.3)" }} />
                <Typography variant="h6" fontWeight={900} sx={{ color: "#fff", textAlign: "center", px: 2 }}>
                  PO.PU App
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)", textAlign: "center", px: 2 }}>
                  Order food anytime, anywhere
                </Typography>
              </Box>
            </Grid>

            {/* Text */}
            <Grid item xs={12} md={7}>
              <Chip label="Mobile App" size="small" sx={{ backgroundColor: GL, color: G, fontWeight: 700, mb: 2 }} />
              <Typography variant="h2" fontWeight={900} sx={{ color: "#1A1A1A", mb: 1 }}>
                Order Food Anywhere
              </Typography>
              <Typography variant="body1" sx={{ color: "#666", mb: 3.5, lineHeight: 1.7 }}>
                Download the PO.PU app and get access to all services right from your phone.
                Browse vendors, track deliveries, and manage bookings on the go.
              </Typography>
              <Stack spacing={1.25} sx={{ mb: 4 }}>
                {[
                  { icon: <RestaurantRoundedIcon />,  t: "Order Catering for any occasion" },
                  { icon: <KitchenRoundedIcon />,      t: "Book professional cooks instantly" },
                  { icon: <GpsFixedRoundedIcon />,     t: "Track deliveries live on Google Maps" },
                  { icon: <AccessTimeRoundedIcon />,   t: "Manage bookings from anywhere" },
                ].map(({ icon, t }) => (
                  <Stack key={t} direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: 2,
                      backgroundColor: GL, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      color: G, flexShrink: 0,
                    }}>
                      {icon}
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: "#333" }}>{t}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1.5}>
                <Button
                  variant="contained"
                  startIcon={<PhoneIphoneRoundedIcon />}
                  sx={{
                    backgroundColor: "#000", fontWeight: 700, px: 2.5,
                    borderRadius: 2, "&:hover": { backgroundColor: "#222" },
                  }}
                >
                  App Store
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PlayCircleFilledRoundedIcon />}
                  sx={{
                    backgroundColor: "#1B5E20", fontWeight: 700, px: 2.5,
                    borderRadius: 2, "&:hover": { backgroundColor: GM },
                  }}
                >
                  Google Play
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ══ FAQ ══════════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 10 }, background: "linear-gradient(145deg, #FAFFF9, #F5F5F5)" }}>
        <Container maxWidth="md">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Chip label="FAQ" size="small" sx={{ backgroundColor: GL, color: G, fontWeight: 700, mb: 1.5 }} />
            <Typography variant="h2" fontWeight={900} sx={{ color: "#1A1A1A", mb: 1 }}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" sx={{ color: "#666" }}>
              Everything you need to know about PO.PU.
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            {FAQS.map((faq, i) => (
              <Accordion
                key={i}
                expanded={expanded === i}
                onChange={() => setExpanded(expanded === i ? false : i)}
                elevation={0}
                sx={{
                  border: "1px solid #E8F5E9",
                  borderRadius: "12px !important",
                  "&:before": { display: "none" },
                  "&.Mui-expanded": { borderColor: G },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreRoundedIcon sx={{ color: G }} />}
                  sx={{
                    px: 2.5, py: 0.5,
                    "& .MuiAccordionSummary-content": { my: 1.5 },
                  }}
                >
                  <Typography variant="body1" fontWeight={700} sx={{ color: expanded === i ? G : "#222" }}>
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                  <Typography variant="body2" sx={{ color: "#555", lineHeight: 1.7 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ══ FINAL CTA ════════════════════════════════════════════════════════════ */}
      <Box sx={{
        py: { xs: 8, md: 10 },
        background: `linear-gradient(135deg, #0D4710 0%, ${G} 50%, #2E7D32 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative */}
        <Box sx={{
          position: "absolute", width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
          top: -200, right: -200, pointerEvents: "none",
        }} />
        <Container maxWidth="md" sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <Typography variant="h2" fontWeight={900} sx={{ color: "#fff", mb: 1.5, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
            Ready to Experience Better Food Services?
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)", mb: 4, maxWidth: 480, mx: "auto" }}>
            Join thousands of happy customers who trust PO.PU for fresh, verified, on-time food services.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              size="large"
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                backgroundColor: Y, color: "#1A1A1A",
                fontWeight: 800, px: 4, py: 1.5,
                fontSize: "1rem", borderRadius: 2.5,
                "&:hover": { backgroundColor: "#E6B400" },
                boxShadow: "0 4px 20px rgba(242,190,0,0.4)",
              }}
            >
              Get Started — It's Free
            </Button>
            <Button
              size="large"
              variant="outlined"
              onClick={() => navigate("/login")}
              sx={{
                borderColor: "rgba(255,255,255,0.5)", color: "#fff",
                fontWeight: 700, px: 4, py: 1.5,
                fontSize: "1rem", borderRadius: 2.5,
                borderWidth: 1.5,
                "&:hover": { borderColor: "#fff", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1.5 },
              }}
            >
              Become a Vendor
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════════ */}
      <Box id="contact" ref={sectionRefs.contact} sx={{ backgroundColor: "#0D1F0F", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Brand */}
            <Grid item xs={12} md={4}>
              <Box
                component="img"
                src="/popuLogoHomePage.png"
                alt="PO.PU"
                sx={{ height: 40, mb: 2, filter: "brightness(1.1)" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  const fallback = document.createElement("div");
                  fallback.textContent = "PO.PU";
                  fallback.style.cssText = "color:#F2BE00;font-size:1.5rem;font-weight:900;margin-bottom:8px;";
                  e.target.parentElement.prepend(fallback);
                }}
              />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 280 }}>
                PO.PU connects customers with trusted food service providers across India.
                Fresh food, verified vendors, one platform.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
                {[
                  { icon: <FacebookRoundedIcon />, label: "Facebook" },
                  { icon: <InstagramIcon />,       label: "Instagram" },
                  { icon: <LinkedInIcon />,        label: "LinkedIn" },
                  { icon: <YouTubeIcon />,         label: "YouTube" },
                ].map(({ icon, label }) => (
                  <IconButton
                    key={label}
                    size="small"
                    aria-label={label}
                    sx={{
                      color: "rgba(255,255,255,0.55)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      "&:hover": { color: Y, borderColor: Y, backgroundColor: "rgba(242,190,0,0.08)" },
                    }}
                  >
                    {icon}
                  </IconButton>
                ))}
              </Stack>
            </Grid>

            {/* Company */}
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#fff", mb: 2 }}>Company</Typography>
              <Stack spacing={1.25}>
                {["About", "Careers", "Contact"].map((l) => (
                  <Typography key={l} variant="body2"
                    sx={{ color: "rgba(255,255,255,0.55)", cursor: "pointer", "&:hover": { color: Y } }}>
                    {l}
                  </Typography>
                ))}
              </Stack>
            </Grid>

            {/* Services */}
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#fff", mb: 2 }}>Services</Typography>
              <Stack spacing={1.25}>
                {["Catering", "Home Food", "Lunch Boxes", "Book a Cook"].map((l) => (
                  <Typography key={l} variant="body2"
                    sx={{ color: "rgba(255,255,255,0.55)", cursor: "pointer", "&:hover": { color: Y } }}>
                    {l}
                  </Typography>
                ))}
              </Stack>
            </Grid>

            {/* Legal */}
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#fff", mb: 2 }}>Legal</Typography>
              <Stack spacing={1.25}>
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
                  <Typography key={l} variant="body2"
                    sx={{ color: "rgba(255,255,255,0.55)", cursor: "pointer", "&:hover": { color: Y } }}>
                    {l}
                  </Typography>
                ))}
              </Stack>
            </Grid>

            {/* Contact */}
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#fff", mb: 2 }}>Contact</Typography>
              <Stack spacing={1.25}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)" }}>
                  hello@popu.in
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)" }}>
                  +91 98765 43210
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)" }}>
                  Bangalore, India
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 4 }} />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ sm: "center" }}
            spacing={1}
          >
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
              © 2026 PO.PU. All Rights Reserved.
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)" }}>
              Made with ♥ in India
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
