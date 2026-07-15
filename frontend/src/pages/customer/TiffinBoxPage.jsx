import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Button, Stack,
  CircularProgress, Alert, Chip,
  Divider, IconButton, Stepper, Step, StepLabel,
  ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import ArrowBackRoundedIcon        from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon      from "@mui/icons-material/CheckCircleRounded";
import StorefrontRoundedIcon       from "@mui/icons-material/StorefrontRounded";
import TodayRoundedIcon            from "@mui/icons-material/TodayRounded";
import DateRangeRoundedIcon        from "@mui/icons-material/DateRangeRounded";
import DinnerDiningRoundedIcon     from "@mui/icons-material/DinnerDiningRounded";
import LocalShippingRoundedIcon    from "@mui/icons-material/LocalShipping";
import DirectionsWalkRoundedIcon   from "@mui/icons-material/DirectionsWalk";
import CreditCardRoundedIcon       from "@mui/icons-material/CreditCardRounded";
import MoneyRoundedIcon            from "@mui/icons-material/Money";
import QrCode2RoundedIcon          from "@mui/icons-material/QrCode2";
import AppLayout                   from "../../components/AppLayout";
import RazorpayButton              from "../../components/RazorpayButton";
import tiffinService               from "../../services/tiffinService";
import { brand }                   from "../../theme";

const STEPS = ["Caterer", "Schedule", "Box Type", "Food Items", "Fulfillment", "Review"];
const DELIVERY_CHARGE = 30; // must match backend TIFFIN_DELIVERY_CHARGE

const BOX_CONFIGS = [
  { key: "ONE_CARRIAGE",   label: "1 Carriage Box", slots: 1, description: "1 food compartment — perfect for a light meal" },
  { key: "TWO_CARRIAGE",   label: "2 Carriage Box", slots: 2, description: "2 food compartments — a balanced meal combination" },
  { key: "THREE_CARRIAGE", label: "3 Carriage Box", slots: 3, description: "3 food compartments — a complete hearty meal" },
];

const ALL_DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
const DAY_LABELS = { MONDAY:"Mon", TUESDAY:"Tue", WEDNESDAY:"Wed", THURSDAY:"Thu", FRIDAY:"Fri", SATURDAY:"Sat", SUNDAY:"Sun" };

function StepHeader({ step, onBack }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
      {step > 0 && (
        <IconButton size="small" onClick={onBack} sx={{ color: brand.orange }}>
          <ArrowBackRoundedIcon />
        </IconButton>
      )}
      <Stepper activeStep={step} alternativeLabel sx={{ flex: 1 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel sx={{ "& .MuiStepLabel-label": { fontSize: "0.65rem" } }}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

// ─── Step 1: Choose Caterer ───────────────────────────────────────────────────
function StepCaterer({ onSelect }) {
  const [caterers, setCaterers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    tiffinService.getCaterers()
      .then((r) => setCaterers(r.caterers || []))
      .catch((e) => setError(e.message || "Failed to load caterers"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress sx={{ color: brand.orange }} /></Box>;
  if (error)   return <Alert severity="error">{error}</Alert>;
  if (!caterers.length) return (
    <Alert severity="info">No caterers are offering Lunch Box service right now. Check back soon!</Alert>
  );

  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Choose a Caterer</Typography>
      {caterers.map((c) => (
        <Card key={c.id} elevation={0}
          onClick={() => onSelect(c)}
          sx={{
            border: `1px solid ${brand.border}`, borderRadius: 2, cursor: "pointer",
            transition: "border-color 0.15s, transform 0.15s",
            "&:hover": { borderColor: brand.orange, transform: "translateY(-2px)" },
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "14px !important" }}>
            <Box sx={{
              width: 46, height: 46, borderRadius: 2, backgroundColor: brand.orangeLight,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <StorefrontRoundedIcon sx={{ color: brand.orange, fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{c.name}</Typography>
              <Box sx={{ display: "flex", gap: 0.75, mt: 0.5, flexWrap: "wrap" }}>
                <Chip label="Lunch Box Available" size="small"
                  sx={{ backgroundColor: brand.greenLight, color: brand.green, fontWeight: 600, fontSize: "0.6rem" }} />
                {c.availability_status === "READY" && (
                  <Chip label="Open Now" size="small" color="success" sx={{ fontSize: "0.6rem" }} />
                )}
              </Box>
            </Box>
            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>from</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brand.orange }}>
                ₹{Number(c.one_carriage_price).toFixed(0)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

// ─── Step 2: Today or Daily ───────────────────────────────────────────────────
function StepSchedule({ onNext }) {
  const [mode,     setMode]     = useState(null);
  const [days,     setDays]     = useState([]);
  const [error,    setError]    = useState("");

  const toggleDay = (d) => setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const handleNext = () => {
    if (!mode) { setError("Please select Today or Daily."); return; }
    if (mode === "DAILY" && days.length === 0) { setError("Please select at least one day."); return; }
    setError("");
    onNext({ serviceType: mode, days });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>How would you like your Lunch Box?</Typography>

      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        {[
          { key: "TODAY", icon: <TodayRoundedIcon sx={{ fontSize: 28, color: brand.orange }} />, label: "Today", sub: "One-time order for today" },
          { key: "DAILY", icon: <DateRangeRoundedIcon sx={{ fontSize: 28, color: brand.orange }} />, label: "Daily Subscription", sub: "Recurring on selected days" },
        ].map(({ key, icon, label, sub }) => (
          <Card key={key} elevation={0} onClick={() => { setMode(key); setError(""); }}
            sx={{
              border: `2px solid ${mode === key ? brand.orange : brand.border}`,
              borderRadius: 2, cursor: "pointer",
              backgroundColor: mode === key ? brand.orangeLight : "transparent",
              transition: "all 0.15s",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "14px !important" }}>
              <Box sx={{ width: 46, height: 46, borderRadius: 2, backgroundColor: brand.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{label}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>{sub}</Typography>
              </Box>
              {mode === key && <CheckCircleRoundedIcon sx={{ color: brand.orange }} />}
            </CardContent>
          </Card>
        ))}
      </Stack>

      {mode === "DAILY" && (
        <Box sx={{ mb: 2, p: 2, borderRadius: 2, backgroundColor: brand.greenLight, border: `1px solid ${brand.border}` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.25 }}>Select Days</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.25 }}>
            {ALL_DAYS.map((d) => (
              <Box key={d}
                onClick={() => toggleDay(d)}
                sx={{
                  px: 1.5, py: 0.5, borderRadius: 5, cursor: "pointer", fontWeight: 700,
                  fontSize: "0.78rem", border: `2px solid`,
                  borderColor: days.includes(d) ? brand.orange : brand.border,
                  backgroundColor: days.includes(d) ? brand.orange : "white",
                  color: days.includes(d) ? "white" : "text.primary",
                  transition: "all 0.15s",
                  userSelect: "none",
                }}
              >
                {DAY_LABELS[d]}
              </Box>
            ))}
          </Box>
          <Alert severity="info" sx={{ fontSize: "0.75rem", py: 0.25 }}>
            Daily subscriptions start from next week.
          </Alert>
        </Box>
      )}

      {error && <Alert severity="warning" sx={{ mb: 1.5 }}>{error}</Alert>}

      <Button fullWidth variant="contained" size="large" onClick={handleNext}
        sx={{ fontWeight: 700, py: 1.4 }}>
        Continue
      </Button>
    </Box>
  );
}

// ─── Step 3: Box Type ─────────────────────────────────────────────────────────
function StepBoxType({ caterer, onNext }) {
  const [settings, setSettings] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    tiffinService.getCatererSettings(caterer.id)
      .then((r) => setSettings(r.settings))
      .catch(() => setSettings({ one_carriage_price: 80, two_carriage_price: 120, three_carriage_price: 180 }))
      .finally(() => setLoading(false));
  }, [caterer.id]);

  const priceMap = settings ? {
    ONE_CARRIAGE:   Number(settings.one_carriage_price),
    TWO_CARRIAGE:   Number(settings.two_carriage_price),
    THREE_CARRIAGE: Number(settings.three_carriage_price),
  } : {};

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress sx={{ color: brand.orange }} /></Box>;

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Choose Your Lunch Box</Typography>

      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        {BOX_CONFIGS.map((box) => (
          <Card key={box.key} elevation={0} onClick={() => setSelected(box.key)}
            sx={{
              border: `2px solid ${selected === box.key ? brand.orange : brand.border}`,
              borderRadius: 2, cursor: "pointer",
              backgroundColor: selected === box.key ? brand.orangeLight : "transparent",
              transition: "all 0.15s",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "14px !important" }}>
              <Box sx={{ width: 46, height: 46, borderRadius: 2, backgroundColor: brand.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <DinnerDiningRoundedIcon sx={{ color: brand.orange, fontSize: 24 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{box.label}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>{box.description}</Typography>
                <Typography variant="caption" sx={{ color: brand.orange, fontWeight: 700, display: "block", mt: 0.25 }}>
                  Exactly {box.slots} food item{box.slots > 1 ? "s" : ""}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: brand.orange }}>
                  ₹{(priceMap[box.key] || 0).toFixed(0)}
                </Typography>
              </Box>
              {selected === box.key && <CheckCircleRoundedIcon sx={{ color: brand.orange }} />}
            </CardContent>
          </Card>
        ))}
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 1.5 }}>{error}</Alert>}

      <Button fullWidth variant="contained" size="large"
        disabled={!selected}
        onClick={() => {
          if (!selected) { setError("Please select a box type."); return; }
          onNext({ boxType: selected, boxPrice: priceMap[selected] });
        }}
        sx={{ fontWeight: 700, py: 1.4 }}>
        Continue
      </Button>
    </Box>
  );
}

// ─── Step 4: Food Selection ───────────────────────────────────────────────────
function StepFoodSelect({ caterer, boxType, onNext }) {
  const slots    = { ONE_CARRIAGE: 1, TWO_CARRIAGE: 2, THREE_CARRIAGE: 3 }[boxType];
  const boxLabel = { ONE_CARRIAGE: "1 Carriage", TWO_CARRIAGE: "2 Carriage", THREE_CARRIAGE: "3 Carriage" }[boxType];

  const [foods,          setFoods]         = useState([]);
  const [selected,       setSelected]      = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [error,          setError]         = useState("");
  const [warn,           setWarn]          = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // "" | "VEG" | "NON_VEG"

  useEffect(() => {
    tiffinService.getCatererItems(caterer.id)
      .then((r) => setFoods(r.items || []))
      .catch((e) => setError(e.message || "Failed to load food items"))
      .finally(() => setLoading(false));
  }, [caterer.id]);

  const toggle = (food) => {
    if (!food.is_available) return;
    setWarn("");
    if (selected.find((s) => s.id === food.id)) {
      setSelected((prev) => prev.filter((s) => s.id !== food.id));
    } else {
      if (selected.length >= slots) {
        setWarn(`Maximum ${slots} item${slots > 1 ? "s" : ""} allowed for this box.`);
        return;
      }
      setSelected((prev) => [...prev, food]);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress sx={{ color: brand.orange }} /></Box>;
  if (error)   return <Alert severity="error">{error}</Alert>;
  if (!foods.length) return <Alert severity="info">No food items available for Lunch Box from this caterer.</Alert>;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Select Food Items</Typography>
        <Chip
          label={`${selected.length} / ${slots} selected`}
          size="small"
          sx={{
            fontWeight: 700,
            backgroundColor: selected.length === slots ? brand.orange : brand.orangeLight,
            color: selected.length === slots ? "white" : brand.orange,
          }}
        />
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
        {boxLabel} Box — choose exactly {slots} item{slots > 1 ? "s" : ""}
      </Typography>

      {warn && <Alert severity="warning" sx={{ mb: 1.5, fontSize: "0.8rem" }}>{warn}</Alert>}

      <ToggleButtonGroup size="small" exclusive value={categoryFilter}
        onChange={(_, v) => { if (v !== null) setCategoryFilter(v); }}
        sx={{ mb: 1.5 }}
      >
        {[
          { value: "", label: "All" },
          { value: "VEG",     label: "🟢 Veg" },
          { value: "NON_VEG", label: "🔴 Non-Veg" },
        ].map((o) => (
          <ToggleButton key={o.value} value={o.value}
            sx={{
              px: 2, fontWeight: 700, fontSize: "0.75rem", textTransform: "none",
              "&.Mui-selected": {
                backgroundColor: o.value === "VEG" ? "#E8F5E9" : o.value === "NON_VEG" ? "#FFEBEE" : brand.orangeLight,
                color:           o.value === "VEG" ? "#2E7D32" : o.value === "NON_VEG" ? "#B71C1C" : brand.orange,
              },
            }}
          >
            {o.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Stack spacing={1.25} sx={{ mb: 2.5 }}>
        {foods.filter((f) => !categoryFilter || (f.food_category || "VEG") === categoryFilter).map((food) => {
          const isSelected = !!selected.find((s) => s.id === food.id);
          const disabled   = !food.is_available;
          return (
            <Card key={food.id} elevation={0}
              onClick={() => toggle(food)}
              sx={{
                border: `2px solid ${isSelected ? brand.orange : brand.border}`,
                borderRadius: 2,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                backgroundColor: isSelected ? brand.orangeLight : "transparent",
                transition: "all 0.15s",
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 1.5, py: "12px !important" }}>
                <Box sx={{
                  width: 52, height: 52, borderRadius: 1.5, flexShrink: 0, overflow: "hidden",
                  background: `linear-gradient(135deg, ${brand.orangeLight}, #A5D6A7)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {food.imageUrl ? (
                    <Box component="img" src={food.imageUrl} alt={food.food_name}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <DinnerDiningRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{food.food_name}</Typography>
                  {food.food_category && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                      <Box sx={{
                        width: 8, height: 8, flexShrink: 0,
                        borderRadius: food.food_category === "VEG" ? "50%" : "2px",
                        backgroundColor: food.food_category === "VEG" ? "#4CAF50" : "#E53935",
                        border: `1.5px solid ${food.food_category === "VEG" ? "#2E7D32" : "#B71C1C"}`,
                      }} />
                      <Typography variant="caption" sx={{
                        fontWeight: 700, fontSize: "0.58rem",
                        color: food.food_category === "VEG" ? "#2E7D32" : "#B71C1C",
                        lineHeight: 1,
                      }}>
                        {food.food_category === "VEG" ? "Veg" : "Non-Veg"}
                      </Typography>
                    </Box>
                  )}
                  {food.serves_count != null && (
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.6rem", display: "block" }}>
                      Serves {food.serves_count} {food.serves_count === 1 ? "Person" : "Persons"}
                    </Typography>
                  )}
                  {food.description && (
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1.3, mt: 0.25 }}
                      noWrap>
                      {food.description}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: brand.orange, fontWeight: 700 }}>
                    ₹{Number(food.price).toFixed(0)}
                  </Typography>
                  {disabled && <Chip label="Unavailable" size="small" sx={{ ml: 0.75, fontSize: "0.55rem", height: 16 }} />}
                </Box>
                {isSelected && <CheckCircleRoundedIcon sx={{ color: brand.orange, flexShrink: 0 }} />}
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Button fullWidth variant="contained" size="large"
        disabled={selected.length !== slots}
        onClick={() => onNext({ selectedItems: selected })}
        sx={{ fontWeight: 700, py: 1.4 }}>
        Review Order ({selected.length}/{slots})
      </Button>
    </Box>
  );
}

// ─── Step 5: Fulfillment & Payment ───────────────────────────────────────────
function StepFulfillment({ onNext }) {
  const [fulfillment, setFulfillment] = useState(null);
  const [payment,     setPayment]     = useState(null);
  const [error,       setError]       = useState("");

  const handleFulfillmentChange = (type) => {
    setFulfillment(type);
    if (type === "SELF_PICKUP" && payment === "COD") setPayment(null);
    setError("");
  };

  const handleNext = () => {
    if (!fulfillment) { setError("Please choose how you'd like to receive your order."); return; }
    if (!payment)     { setError("Please select a payment method."); return; }
    setError("");
    onNext({ fulfillmentType: fulfillment, paymentMethod: payment });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Delivery & Payment</Typography>

      {/* Fulfillment type */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary", mb: 1, textTransform: "uppercase", letterSpacing: "0.07em", fontSize: "0.7rem" }}>
        How to receive your order
      </Typography>
      <Stack spacing={1.25} sx={{ mb: 2.5 }}>
        {[
          {
            key: "DELIVERY",
            icon: <LocalShippingRoundedIcon sx={{ color: brand.orange, fontSize: 24 }} />,
            label: "Home Delivery",
            sub:   `Delivered to your door — +₹${DELIVERY_CHARGE} delivery charge`,
          },
          {
            key: "SELF_PICKUP",
            icon: <DirectionsWalkRoundedIcon sx={{ color: "#1565C0", fontSize: 24 }} />,
            label: "Self Pickup",
            sub:   `Pick up from caterer & save ₹${DELIVERY_CHARGE}`,
            savingLabel: `Save ₹${DELIVERY_CHARGE}`,
          },
        ].map(({ key, icon, label, sub, savingLabel }) => (
          <Card key={key} elevation={0} onClick={() => handleFulfillmentChange(key)}
            sx={{
              border: `2px solid ${fulfillment === key ? (key === "SELF_PICKUP" ? "#1565C0" : brand.orange) : brand.border}`,
              borderRadius: 2, cursor: "pointer",
              backgroundColor: fulfillment === key ? (key === "SELF_PICKUP" ? "#E3F2FD" : brand.orangeLight) : "transparent",
              transition: "all 0.15s",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "14px !important" }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, backgroundColor: key === "SELF_PICKUP" ? "#E3F2FD" : brand.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{label}</Typography>
                  {savingLabel && (
                    <Chip label={savingLabel} size="small"
                      sx={{ fontSize: "0.6rem", fontWeight: 800, backgroundColor: "#E8F5E9", color: "#2E7D32", height: 18, "& .MuiChip-label": { px: 0.75 } }} />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>{sub}</Typography>
              </Box>
              {fulfillment === key && <CheckCircleRoundedIcon sx={{ color: key === "SELF_PICKUP" ? "#1565C0" : brand.orange, flexShrink: 0 }} />}
            </CardContent>
          </Card>
        ))}
      </Stack>

      {fulfillment === "SELF_PICKUP" && (
        <Alert severity="success" sx={{ mb: 2, fontSize: "0.8rem" }}>
          Smart choice! You save ₹{DELIVERY_CHARGE} by picking up your order. Advance payment required.
        </Alert>
      )}

      {/* Payment method */}
      {fulfillment && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary", mb: 1, textTransform: "uppercase", letterSpacing: "0.07em", fontSize: "0.7rem" }}>
            Payment Method
          </Typography>
          <Stack spacing={1.25} sx={{ mb: 2.5 }}>
            {[
              {
                key: "COD",
                icon: <MoneyRoundedIcon sx={{ color: "#558B2F", fontSize: 24 }} />,
                label: "Cash on Delivery",
                sub:   "Pay when your order arrives",
                disabled: fulfillment === "SELF_PICKUP",
                disabledReason: "Not available for Self Pickup",
              },
              {
                key: "RAZORPAY",
                icon: <CreditCardRoundedIcon sx={{ color: "#B45309", fontSize: 24 }} />,
                label: "Razorpay",
                sub:   "UPI, Cards, Net Banking — pay now",
              },
            ].map(({ key, icon, label, sub, disabled: isDisabled, disabledReason }) => (
              <Card key={key} elevation={0}
                onClick={() => !isDisabled && setPayment(key)}
                sx={{
                  border: `2px solid ${payment === key ? "#F59E0B" : brand.border}`,
                  borderRadius: 2,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled ? 0.45 : 1,
                  backgroundColor: payment === key ? "#FFF8E1" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "14px !important" }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, backgroundColor: key === "COD" ? "#F9FBE7" : "#FFF8E1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{label}</Typography>
                    <Typography variant="caption" sx={{ color: isDisabled ? "error.main" : "text.secondary" }}>
                      {isDisabled ? disabledReason : sub}
                    </Typography>
                  </Box>
                  {payment === key && <CheckCircleRoundedIcon sx={{ color: "#F59E0B", flexShrink: 0 }} />}
                </CardContent>
              </Card>
            ))}
          </Stack>
        </>
      )}

      {error && <Alert severity="warning" sx={{ mb: 1.5 }}>{error}</Alert>}

      <Button fullWidth variant="contained" size="large" onClick={handleNext}
        sx={{ fontWeight: 700, py: 1.4 }}>
        Continue
      </Button>
    </Box>
  );
}

// ─── Step 6: Review ───────────────────────────────────────────────────────────
function StepReview({
  caterer, serviceType, days, boxType, boxPrice, selectedItems,
  fulfillmentType, paymentMethod,
  onPlaceOrder, onRazorpayVerified,
  placing, error,
}) {
  const boxLabel   = { ONE_CARRIAGE: "1 Carriage Box", TWO_CARRIAGE: "2 Carriage Box", THREE_CARRIAGE: "3 Carriage Box" }[boxType];
  const daysCount  = serviceType === "DAILY" ? days.length : 1;
  const boxTotal   = boxPrice * daysCount;
  const charge     = fulfillmentType === "DELIVERY" ? DELIVERY_CHARGE : 0;
  const saving     = fulfillmentType === "SELF_PICKUP" ? DELIVERY_CHARGE : 0;
  const grandTotal = boxTotal + charge;

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Review Your Order</Typography>

      <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2, mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={1.25}>
            <Row label="Caterer"     value={caterer.name} />
            <Row label="Service"     value={serviceType === "TODAY" ? "Today" : "Daily Subscription"} />
            {serviceType === "DAILY" && (
              <Row label="Days" value={`${days.map((d) => DAY_LABELS[d]).join(", ")} (${daysCount} days)`} />
            )}
            <Row label="Box Type"    value={boxLabel} />
            <Row label="Fulfillment" value={fulfillmentType === "DELIVERY" ? "Home Delivery" : "Self Pickup"} />
            <Row label="Payment"     value={paymentMethod === "RAZORPAY" ? "Razorpay (pay now)" : "Cash on Delivery"} />
            <Divider />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Food Items
            </Typography>
            {selectedItems.map((item, i) => (
              <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{
                    width: 22, height: 22, borderRadius: 11, backgroundColor: brand.orange,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Typography sx={{ color: "white", fontWeight: 900, fontSize: "0.6rem" }}>{i + 1}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.food_name}</Typography>
                </Box>
              </Box>
            ))}
            <Divider />
            {serviceType === "DAILY" && daysCount > 1 && (
              <Row label={`Box (₹${boxPrice} × ${daysCount} days)`} value={`₹${boxTotal.toFixed(2)}`} />
            )}
            {charge > 0 && <Row label="Delivery Charge" value={`+₹${charge.toFixed(2)}`} />}
            {saving > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>Pickup Saving</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#2E7D32" }}>−₹{saving.toFixed(2)}</Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: brand.orange }}>₹{grandTotal.toFixed(2)}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

      {paymentMethod === "RAZORPAY" ? (
        <RazorpayButton
          totalRupees={grandTotal}
          onVerified={onRazorpayVerified}
          onError={(msg) => onPlaceOrder({}, msg)}
          label={`Pay ₹${grandTotal.toFixed(2)} & Confirm Order`}
        />
      ) : (
        <Button fullWidth variant="contained" size="large" onClick={() => onPlaceOrder({}, null)} disabled={placing}
          startIcon={placing ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ fontWeight: 700, py: 1.4 }}>
          {placing ? "Placing Order…" : "Place Order"}
        </Button>
      )}
    </Box>
  );
}

function Row({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Typography variant="body2" sx={{ color: "text.secondary", flexShrink: 0, mr: 1 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>{value}</Typography>
    </Box>
  );
}

// ─── Confirmation ─────────────────────────────────────────────────────────────
function StepConfirmation({ navigate, placedOrder }) {
  const pickupCode     = placedOrder?.pickup_code;
  const fulfillment    = placedOrder?.fulfillment_type;

  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 72, color: brand.orange, mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Order Placed!</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        {fulfillment === "SELF_PICKUP"
          ? "Your Lunch Box is confirmed! Show the pickup code at the caterer."
          : "Your Lunch Box order has been placed. The caterer will start preparing your meal."}
      </Typography>

      {pickupCode && (
        <Box sx={{
          mb: 3, p: 2.5, borderRadius: 3,
          background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
          border: "2px dashed #1565C0",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.5 }}>
            <QrCode2RoundedIcon sx={{ color: "#1565C0", fontSize: 20 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#1565C0", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Your Pickup Code
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "0.25em", color: "#0D47A1" }}>
            {pickupCode}
          </Typography>
          <Typography variant="caption" sx={{ color: "#1565C0", mt: 0.5, display: "block" }}>
            Show this code at the caterer to collect your order
          </Typography>
        </Box>
      )}

      <Stack spacing={1.5}>
        <Button variant="contained" fullWidth onClick={() => navigate("/customer/tiffin-orders")}
          sx={{ fontWeight: 700 }}>
          View My Lunch Box Orders
        </Button>
        <Button variant="outlined" fullWidth onClick={() => navigate("/services/tiffin-box")}
          sx={{ fontWeight: 700, borderColor: brand.orange, color: brand.orange }}>
          Order Again
        </Button>
      </Stack>
    </Box>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function TiffinBoxPage() {
  const navigate = useNavigate();

  const [step,            setStep]          = useState(0);
  const [done,            setDone]          = useState(false);
  const [caterer,         setCaterer]       = useState(null);
  const [serviceType,     setServiceType]   = useState(null);
  const [days,            setDays]          = useState([]);
  const [boxType,         setBoxType]       = useState(null);
  const [boxPrice,        setBoxPrice]      = useState(0);
  const [selectedItems,   setSelectedItems] = useState([]);
  const [fulfillmentType, setFulfillmentType] = useState(null);
  const [paymentMethod,   setPaymentMethod]   = useState(null);
  const [placing,         setPlacing]       = useState(false);
  const [placeError,      setPlaceError]    = useState("");
  const [placedOrder,     setPlacedOrder]   = useState(null);

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const placeOrder = async ({ razorpay_order_id, razorpay_payment_id } = {}, errorOverride) => {
    if (errorOverride) { setPlaceError(errorOverride); return; }
    setPlacing(true);
    setPlaceError("");
    try {
      const order = await tiffinService.createOrder({
        caterer_id:          caterer.id,
        service_type:        serviceType,
        box_type:            boxType,
        days:                serviceType === "DAILY" ? days : [],
        items:               selectedItems.map((f) => ({ food_item_id: f.id })),
        fulfillment_type:    fulfillmentType,
        payment_method:      paymentMethod,
        razorpay_order_id:   razorpay_order_id   || undefined,
        razorpay_payment_id: razorpay_payment_id || undefined,
      });
      setPlacedOrder(order.order || order);
      setDone(true);
    } catch (err) {
      setPlaceError(err?.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const handleRazorpayVerified = (rzpResponse) => {
    placeOrder({
      razorpay_order_id:   rzpResponse.razorpay_order_id,
      razorpay_payment_id: rzpResponse.razorpay_payment_id,
    });
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: 2, backgroundColor: brand.orangeLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DinnerDiningRoundedIcon sx={{ color: brand.orange, fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>Lunch Box</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>Fresh meals delivered daily</Typography>
          </Box>
        </Box>

        {!done && <StepHeader step={step} onBack={goBack} />}

        {done ? (
          <StepConfirmation navigate={navigate} placedOrder={placedOrder} />
        ) : step === 0 ? (
          <StepCaterer onSelect={(c) => { setCaterer(c); setStep(1); }} />
        ) : step === 1 ? (
          <StepSchedule onNext={({ serviceType: st, days: d }) => {
            setServiceType(st); setDays(d); setStep(2);
          }} />
        ) : step === 2 ? (
          <StepBoxType caterer={caterer} onNext={({ boxType: bt, boxPrice: bp }) => {
            setBoxType(bt); setBoxPrice(bp); setStep(3);
          }} />
        ) : step === 3 ? (
          <StepFoodSelect caterer={caterer} boxType={boxType} onNext={({ selectedItems: si }) => {
            setSelectedItems(si); setStep(4);
          }} />
        ) : step === 4 ? (
          <StepFulfillment onNext={({ fulfillmentType: ft, paymentMethod: pm }) => {
            setFulfillmentType(ft); setPaymentMethod(pm); setStep(5);
          }} />
        ) : (
          <StepReview
            caterer={caterer}
            serviceType={serviceType}
            days={days}
            boxType={boxType}
            boxPrice={boxPrice}
            selectedItems={selectedItems}
            fulfillmentType={fulfillmentType}
            paymentMethod={paymentMethod}
            onPlaceOrder={placeOrder}
            onRazorpayVerified={handleRazorpayVerified}
            placing={placing}
            error={placeError}
          />
        )}
      </Container>
    </AppLayout>
  );
}
