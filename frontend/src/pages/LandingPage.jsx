import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Container, Typography, Button, Stack, Card, CardContent, CardMedia,
  Grid, AppBar, Toolbar, IconButton, Avatar, Chip, Divider, Drawer,
  List, ListItem, ListItemButton, ListItemText, Skeleton, Rating,
} from "@mui/material";
import MenuRoundedIcon              from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon             from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon       from "@mui/icons-material/CheckCircleRounded";
import StorefrontRoundedIcon        from "@mui/icons-material/StorefrontRounded";
import PeopleRoundedIcon            from "@mui/icons-material/PeopleRounded";
import VerifiedRoundedIcon          from "@mui/icons-material/VerifiedRounded";
import GpsFixedRoundedIcon          from "@mui/icons-material/GpsFixedRounded";
import PhoneAndroidRoundedIcon      from "@mui/icons-material/PhoneAndroidRounded";
import FacebookRoundedIcon          from "@mui/icons-material/FacebookRounded";
import InstagramIcon                from "@mui/icons-material/Instagram";
import LinkedInIcon                 from "@mui/icons-material/LinkedIn";
import YouTubeIcon                  from "@mui/icons-material/YouTube";
import RestaurantRoundedIcon        from "@mui/icons-material/RestaurantRounded";
import ReceiptLongRoundedIcon       from "@mui/icons-material/ReceiptLongRounded";
import TwoWheelerRoundedIcon        from "@mui/icons-material/TwoWheelerRounded";
import LocationOnRoundedIcon        from "@mui/icons-material/LocationOnRounded";
import LocalDiningRoundedIcon       from "@mui/icons-material/LocalDiningRounded";
import ShieldRoundedIcon            from "@mui/icons-material/ShieldRounded";
import CurrencyRupeeRoundedIcon     from "@mui/icons-material/CurrencyRupeeRounded";
import StarRoundedIcon              from "@mui/icons-material/StarRounded";
import ArrowForwardRoundedIcon      from "@mui/icons-material/ArrowForwardRounded";
import Logo                         from "../components/Logo";
import publicService                from "../services/publicService";
import { brand }                    from "../theme";

// ─── Constants ────────────────────────────────────────────────────────────────
const G  = brand.orange;
const GL = brand.orangeLight;

const WHY_ITEMS = [
  { icon: <LocalDiningRoundedIcon />,     label: "Fresh Home-style Food",       desc: "Every dish made with love by local home chefs and cloud kitchens." },
  { icon: <VerifiedRoundedIcon />,        label: "Trusted Local Caterers",       desc: "FSSAI-verified caterers with real ratings from real customers." },
  { icon: <ShieldRoundedIcon />,          label: "Secure Online Payments",       desc: "PhonePe, UPI, COD — multiple payment options with full security." },
  { icon: <GpsFixedRoundedIcon />,        label: "Live Order Tracking",          desc: "Track your rider's real-time location on Google Maps." },
  { icon: <StorefrontRoundedIcon />,      label: "Self Pickup & Delivery",       desc: "Pick up yourself or get it delivered — your choice." },
  { icon: <CurrencyRupeeRoundedIcon />,   label: "Transparent Pricing",          desc: "No hidden charges. What you see is exactly what you pay." },
];

const SERVICE_ICONS = {
  FOOD:        <RestaurantRoundedIcon sx={{ fontSize: 32 }} />,
  LUNCH_BOX:   <LocalDiningRoundedIcon sx={{ fontSize: 32 }} />,
  CATERING:    <StorefrontRoundedIcon sx={{ fontSize: 32 }} />,
  BOOK_A_COOK: <PeopleRoundedIcon sx={{ fontSize: 32 }} />,
  HOME_FOOD:   <LocalDiningRoundedIcon sx={{ fontSize: 32 }} />,
};

// ─── Animated counter ─────────────────────────────────────────────────────────
function StatCounter({ value, label, icon }) {
  const [count, setCount] = useState(0);
  const ref       = useRef(null);
  const animated  = useRef(false);

  useEffect(() => {
    if (!value) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        let start = 0;
        const step = Math.ceil(value / 60);
        const timer = setInterval(() => {
          start += step;
          if (start >= value) { setCount(value); clearInterval(timer); }
          else setCount(start);
        }, 20);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <Box ref={ref} sx={{ textAlign: "center", p: 3 }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: "50%",
        background: "rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        mx: "auto", mb: 1.5, color: brand.gold,
      }}>
        {icon}
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 900, color: "#fff", lineHeight: 1 }}>
        {count.toLocaleString("en-IN")}{value >= 100 ? "+" : ""}
      </Typography>
      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", mt: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Veg dot ──────────────────────────────────────────────────────────────────
function VegDot({ isVeg, category }) {
  const veg = isVeg !== null ? isVeg : category === "VEG";
  return (
    <Box sx={{
      width: 14, height: 14, flexShrink: 0,
      border: `2px solid ${veg ? "#2E7D32" : "#B71C1C"}`,
      borderRadius: veg ? "50%" : "2px",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Box sx={{ width: 7, height: 7, borderRadius: veg ? "50%" : "1px", background: veg ? "#4CAF50" : "#E53935" }} />
    </Box>
  );
}

// ─── Food Card ────────────────────────────────────────────────────────────────
function FoodCard({ food }) {
  const name    = food.food_name || "—";
  const caterer = food.caterer_business || food.caterer_name || "—";
  const price   = Number(food.price);
  const orders  = Number(food.order_count) || 0;
  const rating  = Number(food.avg_rating)  || 0;

  return (
    <Card elevation={0} sx={{
      border: `1px solid ${brand.border}`, borderRadius: 3,
      height: "100%", display: "flex", flexDirection: "column",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(27,94,32,0.12)" },
    }}>
      {food.image_url ? (
        <CardMedia component="img" height="160" image={food.image_url} alt={name}
          sx={{ objectFit: "cover", borderRadius: "12px 12px 0 0" }} />
      ) : (
        <Box sx={{ height: 160, background: GL, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px 12px 0 0" }}>
          <RestaurantRoundedIcon sx={{ fontSize: 48, color: brand.border }} />
        </Box>
      )}
      <CardContent sx={{ flex: 1, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3 }}>{name}</Typography>
          <VegDot isVeg={food.is_veg} category={food.food_category} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>{caterer}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: G }}>
            ₹{price.toLocaleString("en-IN")}
          </Typography>
          {rating > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
              <StarRoundedIcon sx={{ fontSize: 14, color: brand.gold }} />
              <Typography variant="caption" fontWeight={700}>{rating.toFixed(1)}</Typography>
            </Box>
          )}
        </Box>
        {orders > 0 && (
          <Typography variant="caption" color="text.secondary">
            {orders.toLocaleString("en-IN")} order{orders !== 1 ? "s" : ""}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Caterer Card ─────────────────────────────────────────────────────────────
function CatererCard({ caterer }) {
  const name    = caterer.business_name || caterer.name || "—";
  const city    = caterer.city || caterer.location || "India";
  const orders  = Number(caterer.orders_completed) || 0;
  const rating  = Number(caterer.avg_rating)  || 0;
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <Card elevation={0} sx={{
      border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5,
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(27,94,32,0.12)" },
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        {caterer.photo ? (
          <Avatar src={caterer.photo} sx={{ width: 52, height: 52 }} />
        ) : (
          <Avatar sx={{ width: 52, height: 52, background: GL, color: G, fontWeight: 800, fontSize: 18 }}>
            {initials}
          </Avatar>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={800} noWrap>{name}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LocationOnRoundedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">{city}</Typography>
          </Box>
        </Box>
        {rating > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
            <StarRoundedIcon sx={{ fontSize: 14, color: brand.gold }} />
            <Typography variant="caption" fontWeight={700}>{rating.toFixed(1)}</Typography>
          </Box>
        )}
      </Box>
      <Divider sx={{ mb: 1.5 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ color: G }}>
            {orders > 0 ? orders.toLocaleString("en-IN") : "New"}
          </Typography>
          <Typography variant="caption" color="text.secondary">Orders</Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ color: G }}>
            {caterer.food_count || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary">Menu Items</Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Chip label="Active" size="small" sx={{ background: GL, color: G, fontWeight: 700, fontSize: 10 }} />
        </Box>
      </Box>
    </Card>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ tag, title, subtitle }) {
  return (
    <Box sx={{ textAlign: "center", mb: 5 }}>
      {tag && (
        <Chip label={tag} size="small" sx={{ mb: 1.5, background: GL, color: G, fontWeight: 700, letterSpacing: 1 }} />
      )}
      <Typography variant="h4" fontWeight={900} sx={{ color: brand.dark, mb: 1 }}>{title}</Typography>
      {subtitle && (
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: "auto" }}>{subtitle}</Typography>
      )}
    </Box>
  );
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────
function FoodSkeleton() {
  return (
    <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3 }}>
      <Skeleton variant="rectangular" height={160} sx={{ borderRadius: "12px 12px 0 0" }} />
      <CardContent>
        <Skeleton width="70%" height={20} sx={{ mb: 1 }} />
        <Skeleton width="50%" height={16} sx={{ mb: 1 }} />
        <Skeleton width="40%" height={20} />
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService.getHomeData()
      .then(setData)
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  const stats       = data?.stats              || {};
  const foods       = data?.popularFoods       || [];
  const caterers    = data?.featuredCaterers   || [];
  const services    = data?.services           || [];
  const locations   = data?.locations          || [];
  const reviews     = data?.reviews            || [];

  const NAV = [
    { label: "Foods",     href: "#foods" },
    { label: "Caterers",  href: "#caterers" },
    { label: "Services",  href: "#services" },
    { label: "Locations", href: "#locations" },
  ];

  return (
    <Box sx={{ background: brand.bg, minHeight: "100vh" }}>

      {/* ─── TOP NAV ─────────────────────────────────────────────────────── */}
      <AppBar position="sticky" elevation={0} sx={{
        background: "rgba(250,250,247,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${brand.border}`,
      }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Logo />
          <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            {NAV.map(n => (
              <Button key={n.label} href={n.href}
                sx={{ color: brand.dark, fontWeight: 600, textTransform: "none", fontSize: 14,
                  "&:hover": { color: G, background: GL } }}>
                {n.label}
              </Button>
            ))}
            <Button variant="outlined" onClick={() => navigate("/login")}
              sx={{ ml: 1, fontWeight: 700, textTransform: "none", borderColor: G, color: G,
                "&:hover": { background: GL } }}>
              Login
            </Button>
            <Button variant="contained" onClick={() => navigate("/register")}
              sx={{ fontWeight: 700, textTransform: "none", background: G,
                "&:hover": { background: brand.orangeMid } }}>
              Sign Up
            </Button>
          </Stack>
          <IconButton sx={{ display: { md: "none" } }} onClick={() => setDrawerOpen(true)}>
            <MenuRoundedIcon sx={{ color: brand.dark }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <IconButton onClick={() => setDrawerOpen(false)}><CloseRoundedIcon /></IconButton>
          </Box>
          <List>
            {NAV.map(n => (
              <ListItem key={n.label} disablePadding>
                <ListItemButton component="a" href={n.href} onClick={() => setDrawerOpen(false)}>
                  <ListItemText primary={n.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Stack spacing={1.5} sx={{ mt: 2, px: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => { navigate("/login"); setDrawerOpen(false); }}
              sx={{ fontWeight: 700, textTransform: "none", borderColor: G, color: G }}>
              Login
            </Button>
            <Button fullWidth variant="contained" onClick={() => { navigate("/register"); setDrawerOpen(false); }}
              sx={{ fontWeight: 700, textTransform: "none", background: G }}>
              Sign Up
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* ─── SECTION 1 — HERO ────────────────────────────────────────────── */}
      <Box sx={{
        background: `linear-gradient(135deg, ${G} 0%, ${brand.orangeMid} 60%, #388E3C 100%)`,
        pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 14 },
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        {[
          { size: 400, top: -100, right: -100, opacity: 0.06 },
          { size: 250, bottom: -80, left: -80,  opacity: 0.08 },
          { size: 150, top: "30%", right: "10%", opacity: 0.05 },
        ].map((c, i) => (
          <Box key={i} sx={{
            position: "absolute", width: c.size, height: c.size, borderRadius: "50%",
            border: "2px solid white", opacity: c.opacity,
            top: c.top, bottom: c.bottom, left: c.left, right: c.right,
            pointerEvents: "none",
          }} />
        ))}

        <Container maxWidth="md" sx={{ position: "relative", textAlign: "center" }}>
          <Chip label="🌿 Pure · Fresh · Trusted" sx={{
            mb: 3, background: "rgba(255,255,255,0.15)", color: "#fff",
            fontWeight: 700, fontSize: 13, px: 1,
          }} />
          <Typography variant="h2" sx={{
            fontWeight: 900, color: "#fff", lineHeight: 1.15,
            fontSize: { xs: "2.2rem", sm: "3rem", md: "3.8rem" }, mb: 2.5,
          }}>
            Fresh Homemade Food,{" "}
            <Box component="span" sx={{ color: brand.gold }}>Delivered with Love</Box>
          </Typography>
          <Typography variant="h6" sx={{
            color: "rgba(255,255,255,0.85)", maxWidth: 560, mx: "auto",
            mb: 5, fontWeight: 400, lineHeight: 1.6,
          }}>
            Discover trusted local caterers, daily lunch boxes, catering services and more.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button variant="contained" size="large" onClick={() => navigate("/login")}
              sx={{
                fontWeight: 800, textTransform: "none", fontSize: "1rem",
                py: 1.5, px: 4, borderRadius: 3,
                background: brand.gold, color: brand.dark,
                boxShadow: "0 4px 20px rgba(244,180,0,0.4)",
                "&:hover": { background: "#e0a800", boxShadow: "0 6px 24px rgba(244,180,0,0.5)" },
              }}>
              Get Started — Login
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate("/register")}
              sx={{
                fontWeight: 700, textTransform: "none", fontSize: "1rem",
                py: 1.5, px: 4, borderRadius: 3,
                borderColor: "rgba(255,255,255,0.6)", color: "#fff",
                "&:hover": { background: "rgba(255,255,255,0.1)", borderColor: "#fff" },
              }}>
              Create Account — Free
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ─── SECTION 2 — LIVE STATS ──────────────────────────────────────── */}
      <Box sx={{ background: `linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)`, py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={0}>
            {loading ? (
              [0,1,2,3,4].map(i => (
                <Grid key={i} size={{ xs: 6, sm: 4, md: 2.4 }}>
                  <Box sx={{ textAlign: "center", p: 3 }}>
                    <Skeleton variant="circular" width={56} height={56} sx={{ mx: "auto", mb: 1, bgcolor: "rgba(255,255,255,0.1)" }} />
                    <Skeleton width={80} height={40} sx={{ mx: "auto", bgcolor: "rgba(255,255,255,0.1)" }} />
                    <Skeleton width={100} height={20} sx={{ mx: "auto", mt: 1, bgcolor: "rgba(255,255,255,0.1)" }} />
                  </Box>
                </Grid>
              ))
            ) : (
              [
                { value: stats.total_caterers,         label: "Verified Caterers",      icon: <StorefrontRoundedIcon /> },
                { value: stats.total_food_items,       label: "Food Items",             icon: <RestaurantRoundedIcon /> },
                { value: stats.total_orders_delivered, label: "Orders Delivered",       icon: <ReceiptLongRoundedIcon /> },
                { value: stats.total_customers,        label: "Happy Customers",        icon: <PeopleRoundedIcon /> },
                { value: stats.active_riders,          label: "Active Riders",          icon: <TwoWheelerRoundedIcon /> },
              ].map((s, i) => (
                <Grid key={i} size={{ xs: 6, sm: 4, md: 2.4 }}>
                  <StatCounter value={s.value || 0} label={s.label} icon={s.icon} />
                </Grid>
              ))
            )}
          </Grid>
        </Container>
      </Box>

      {/* ─── SECTION 3 — POPULAR FOODS ───────────────────────────────────── */}
      {(loading || foods.length > 0) && (
        <Box id="foods" sx={{ py: 8, background: brand.bg }}>
          <Container maxWidth="lg">
            <SectionHeading
              tag="MOST ORDERED"
              title="Popular Food Items"
              subtitle="Real dishes, real orders. These are the most loved meals on PO.PU right now."
            />
            <Grid container spacing={2.5}>
              {loading
                ? [0,1,2,3,4,5,6,7,8,9].map(i => <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}><FoodSkeleton /></Grid>)
                : foods.map(food => (
                  <Grid key={food.id} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
                    <FoodCard food={food} />
                  </Grid>
                ))
              }
            </Grid>
            <Box sx={{ textAlign: "center", mt: 5 }}>
              <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate("/login")}
                sx={{ fontWeight: 700, textTransform: "none", background: G, borderRadius: 3, px: 4,
                  "&:hover": { background: brand.orangeMid } }}>
                View All Food Items
              </Button>
            </Box>
          </Container>
        </Box>
      )}

      {/* ─── SECTION 4 — FEATURED CATERERS ──────────────────────────────── */}
      {(loading || caterers.length > 0) && (
        <Box id="caterers" sx={{ py: 8, background: "#F0F7F0" }}>
          <Container maxWidth="lg">
            <SectionHeading
              tag="FEATURED"
              title="Meet Our Caterers"
              subtitle="Trusted home chefs and professional caterers verified on PO.PU."
            />
            <Grid container spacing={2.5}>
              {loading
                ? [0,1,2,3].map(i => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5 }}>
                      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Skeleton variant="circular" width={52} height={52} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width="60%" height={20} />
                          <Skeleton width="40%" height={16} />
                        </Box>
                      </Box>
                      <Skeleton height={1} />
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                        <Skeleton width={50} height={30} />
                        <Skeleton width={50} height={30} />
                        <Skeleton width={50} height={30} />
                      </Box>
                    </Card>
                  </Grid>
                ))
                : caterers.map(c => (
                  <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <CatererCard caterer={c} />
                  </Grid>
                ))
              }
            </Grid>
            <Box sx={{ textAlign: "center", mt: 5 }}>
              <Button variant="outlined" endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate("/register")}
                sx={{ fontWeight: 700, textTransform: "none", borderColor: G, color: G, borderRadius: 3, px: 4,
                  "&:hover": { background: GL } }}>
                Join as a Caterer
              </Button>
            </Box>
          </Container>
        </Box>
      )}

      {/* ─── SECTION 5 — OUR SERVICES ────────────────────────────────────── */}
      {(loading || services.length > 0) && (
        <Box id="services" sx={{ py: 8, background: brand.bg }}>
          <Container maxWidth="lg">
            <SectionHeading
              tag="SERVICES"
              title="What We Offer"
              subtitle="Services currently available on PO.PU."
            />
            <Grid container spacing={3} justifyContent="center">
              {services.map(s => (
                <Grid key={s.service_code} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Card elevation={0} onClick={() => navigate("/login")}
                    sx={{
                      border: `1px solid ${brand.border}`, borderRadius: 3, p: 3,
                      textAlign: "center", cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 24px rgba(27,94,32,0.15)`,
                        background: GL,
                        borderColor: G,
                      },
                    }}>
                    <Box sx={{ color: G, mb: 1.5 }}>
                      {SERVICE_ICONS[s.service_code] || <LocalDiningRoundedIcon sx={{ fontSize: 32 }} />}
                    </Box>
                    <Typography variant="subtitle2" fontWeight={700}>{s.service_name}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* ─── SECTION 6 — WHY CHOOSE PO.PU ───────────────────────────────── */}
      <Box sx={{ py: 8, background: "#F0F7F0" }}>
        <Container maxWidth="lg">
          <SectionHeading
            tag="WHY PO.PU"
            title="The PO.PU Difference"
            subtitle="Everything you need for a great food experience — all in one platform."
          />
          <Grid container spacing={3}>
            {WHY_ITEMS.map((item, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={{ display: "flex", gap: 2, p: 2.5, borderRadius: 3, background: "#fff",
                  border: `1px solid ${brand.border}`,
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 4px 16px rgba(27,94,32,0.1)" },
                }}>
                  <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: 2,
                    background: GL, color: G, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── SECTION 7 — REVIEWS ─────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <Box sx={{ py: 8, background: brand.bg }}>
          <Container maxWidth="lg">
            <SectionHeading
              tag="CUSTOMER REVIEWS"
              title="What Our Customers Say"
              subtitle="Real reviews from real PO.PU customers."
            />
            <Grid container spacing={2.5}>
              {reviews.map(r => (
                <Grid key={r.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 2.5, height: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                      <Avatar sx={{ width: 40, height: 40, background: G, fontWeight: 800, fontSize: 15 }}>
                        {r.reviewer_first_name?.[0] || "?"}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{r.reviewer_first_name}</Typography>
                        <Rating value={r.rating} size="small" readOnly sx={{ color: brand.gold }} />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      "{r.comment}"
                    </Typography>
                    {r.subject_name && (
                      <Chip label={r.subject_name} size="small" sx={{ mt: 1.5, background: GL, color: G, fontWeight: 600 }} />
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* ─── SECTION 8 — LOCATIONS ───────────────────────────────────────── */}
      {(loading || locations.length > 0) && (
        <Box id="locations" sx={{ py: 8, background: "#F0F7F0" }}>
          <Container maxWidth="lg">
            <SectionHeading
              tag="LOCATIONS"
              title="We're Serving These Cities"
              subtitle="Active caterers delivering fresh food in your area."
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "center" }}>
              {loading
                ? [80, 110, 90, 130, 100, 85, 120, 95].map((w, i) => (
                  <Skeleton key={i} variant="rounded" width={w} height={36} sx={{ borderRadius: 5 }} />
                ))
                : locations.map(loc => (
                  <Chip
                    key={loc.city}
                    icon={<LocationOnRoundedIcon sx={{ fontSize: 16 }} />}
                    label={`${loc.city} (${loc.caterer_count})`}
                    onClick={() => navigate("/login")}
                    sx={{
                      fontWeight: 600, px: 1, height: 36, background: "#fff",
                      border: `1px solid ${brand.border}`, cursor: "pointer",
                      "&:hover": { background: GL, borderColor: G, color: G },
                    }}
                  />
                ))
              }
            </Box>
          </Container>
        </Box>
      )}

      {/* ─── SECTION 9 — DOWNLOAD APP ────────────────────────────────────── */}
      <Box sx={{
        py: 8,
        background: `linear-gradient(135deg, ${G} 0%, ${brand.orangeMid} 100%)`,
      }}>
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
          <PhoneAndroidRoundedIcon sx={{ fontSize: 52, color: brand.gold, mb: 2 }} />
          <Typography variant="h4" fontWeight={900} sx={{ color: "#fff", mb: 1.5 }}>
            Get the PO.PU App
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)", mb: 4 }}>
            Order food, track delivery, and manage your tiffin box — all from your phone.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button variant="contained" size="large" startIcon={<PhoneAndroidRoundedIcon />}
              component="a"
              href="https://play.google.com/store/apps"
              target="_blank"
              sx={{
                fontWeight: 700, textTransform: "none", borderRadius: 3,
                background: brand.gold, color: brand.dark,
                "&:hover": { background: "#e0a800" },
              }}>
              Download for Android
            </Button>
            <Button variant="outlined" size="large" disabled
              sx={{
                fontWeight: 700, textTransform: "none", borderRadius: 3,
                borderColor: "rgba(255,255,255,0.5)", color: "rgba(255,255,255,0.6)",
              }}>
              iOS — Coming Soon
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ─── SECTION 10 — FOOTER ─────────────────────────────────────────── */}
      <Box component="footer" sx={{ background: "#0A2E0A", color: "rgba(255,255,255,0.7)", pt: 7, pb: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} sx={{ mb: 5 }}>
            {/* Brand */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Logo color={brand.gold} />
              <Typography variant="body2" sx={{ mt: 2, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, maxWidth: 300 }}>
                PO.PU connects you with trusted local caterers for fresh homemade food, daily lunch boxes, and catering services across India.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                {[
                  { icon: <InstagramIcon />,     href: "#" },
                  { icon: <FacebookRoundedIcon />, href: "#" },
                  { icon: <YouTubeIcon />,         href: "#" },
                  { icon: <LinkedInIcon />,        href: "#" },
                ].map((s, i) => (
                  <IconButton key={i} component="a" href={s.href} size="small"
                    sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: brand.gold, background: "rgba(244,180,0,0.1)" } }}>
                    {s.icon}
                  </IconButton>
                ))}
              </Stack>
            </Grid>

            {/* Company */}
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#fff", mb: 2, letterSpacing: 1, fontSize: 11, textTransform: "uppercase" }}>
                Company
              </Typography>
              {["About Us", "Contact Us", "Help Center"].map(t => (
                <Typography key={t} variant="body2" component="a" href="#"
                  sx={{ display: "block", mb: 1.5, color: "rgba(255,255,255,0.55)", textDecoration: "none",
                    "&:hover": { color: brand.gold } }}>
                  {t}
                </Typography>
              ))}
            </Grid>

            {/* Legal */}
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#fff", mb: 2, letterSpacing: 1, fontSize: 11, textTransform: "uppercase" }}>
                Legal
              </Typography>
              {["Privacy Policy", "Terms & Conditions", "Refund Policy", "Cancellation Policy"].map(t => (
                <Typography key={t} variant="body2" component="a" href="#"
                  sx={{ display: "block", mb: 1.5, color: "rgba(255,255,255,0.55)", textDecoration: "none",
                    "&:hover": { color: brand.gold } }}>
                  {t}
                </Typography>
              ))}
            </Grid>

            {/* Locations */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#fff", mb: 2, letterSpacing: 1, fontSize: 11, textTransform: "uppercase" }}>
                Serving
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {locations.slice(0, 8).map(loc => (
                  <Chip key={loc.city} label={loc.city} size="small"
                    sx={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: 11 }} />
                ))}
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 3 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
              © {new Date().getFullYear()} PO.PU. All rights reserved.
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
              Pure · Fresh · Trusted
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
