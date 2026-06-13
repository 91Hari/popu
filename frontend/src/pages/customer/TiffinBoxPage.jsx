import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Button, Stack,
  CircularProgress, Alert, Chip, Checkbox, FormControlLabel,
  Divider, IconButton, Stepper, Step, StepLabel,
} from "@mui/material";
import ArrowBackRoundedIcon      from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon    from "@mui/icons-material/CheckCircleRounded";
import StorefrontRoundedIcon     from "@mui/icons-material/StorefrontRounded";
import TodayRoundedIcon          from "@mui/icons-material/TodayRounded";
import DateRangeRoundedIcon      from "@mui/icons-material/DateRangeRounded";
import DinnerDiningRoundedIcon   from "@mui/icons-material/DinnerDiningRounded";
import AddRoundedIcon            from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon         from "@mui/icons-material/RemoveRounded";
import AppLayout                 from "../../components/AppLayout";
import tiffinService             from "../../services/tiffinService";
import { brand }                 from "../../theme";

const STEPS = ["Caterer", "Schedule", "Box Type", "Food Items", "Review"];

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
    <Alert severity="info">No caterers are offering Tiffin Box service right now. Check back soon!</Alert>
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
                <Chip label="Tiffin Available" size="small"
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
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>How would you like your Tiffin Box?</Typography>

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
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Choose Your Tiffin Box</Typography>

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

  const [foods,    setFoods]    = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [warn,     setWarn]     = useState("");

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
  if (!foods.length) return <Alert severity="info">No food items available for tiffin from this caterer.</Alert>;

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

      <Stack spacing={1.25} sx={{ mb: 2.5 }}>
        {foods.map((food) => {
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

// ─── Step 5: Review ───────────────────────────────────────────────────────────
function StepReview({ caterer, serviceType, days, boxType, boxPrice, selectedItems, onPlaceOrder, placing, error }) {
  const boxLabel = { ONE_CARRIAGE: "1 Carriage Box", TWO_CARRIAGE: "2 Carriage Box", THREE_CARRIAGE: "3 Carriage Box" }[boxType];

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Review Your Order</Typography>

      <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2, mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={1.25}>
            <Row label="Caterer"   value={caterer.name} />
            <Row label="Service"   value={serviceType === "TODAY" ? "Today" : "Daily Subscription"} />
            {serviceType === "DAILY" && (
              <Row label="Days" value={days.map((d) => DAY_LABELS[d]).join(", ")} />
            )}
            <Row label="Box Type"  value={boxLabel} />
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: brand.orange }}>₹{Number(boxPrice).toFixed(2)}</Typography>
            </Box>
            {serviceType === "TODAY" && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                One-time payment for today's tiffin box.
              </Typography>
            )}
            {serviceType === "DAILY" && (
              <Alert severity="info" sx={{ fontSize: "0.75rem", py: 0.25 }}>
                Daily subscription starts from next week. Payment per delivery.
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

      <Alert severity="info" sx={{ mb: 2, fontSize: "0.8rem" }}>
        Pay via the caterer's UPI ID after placing your order.
      </Alert>

      <Button fullWidth variant="contained" size="large" onClick={onPlaceOrder} disabled={placing}
        startIcon={placing ? <CircularProgress size={18} color="inherit" /> : null}
        sx={{ fontWeight: 700, py: 1.4 }}>
        {placing ? "Placing Order…" : "Place Order"}
      </Button>
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
function StepConfirmation({ navigate }) {
  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 72, color: brand.orange, mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Order Placed!</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        Your tiffin box order has been placed successfully. The caterer will start preparing your meal.
      </Typography>
      <Stack spacing={1.5}>
        <Button variant="contained" fullWidth onClick={() => navigate("/customer/tiffin-orders")}
          sx={{ fontWeight: 700 }}>
          View My Tiffin Orders
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

  const [step,          setStep]         = useState(0);
  const [done,          setDone]         = useState(false);
  const [caterer,       setCaterer]      = useState(null);
  const [serviceType,   setServiceType]  = useState(null);
  const [days,          setDays]         = useState([]);
  const [boxType,       setBoxType]      = useState(null);
  const [boxPrice,      setBoxPrice]     = useState(0);
  const [selectedItems, setSelectedItems]= useState([]);
  const [placing,       setPlacing]      = useState(false);
  const [placeError,    setPlaceError]   = useState("");

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setPlaceError("");
    try {
      await tiffinService.createOrder({
        caterer_id:   caterer.id,
        service_type: serviceType,
        box_type:     boxType,
        days:         serviceType === "DAILY" ? days : [],
        items:        selectedItems.map((f) => ({ food_item_id: f.id })),
      });
      setDone(true);
    } catch (err) {
      setPlaceError(err?.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: 2, backgroundColor: brand.orangeLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DinnerDiningRoundedIcon sx={{ color: brand.orange, fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>Tiffin Box</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>Fresh meals delivered daily</Typography>
          </Box>
        </Box>

        {!done && <StepHeader step={step} onBack={goBack} />}

        {done ? (
          <StepConfirmation navigate={navigate} />
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
        ) : (
          <StepReview
            caterer={caterer}
            serviceType={serviceType}
            days={days}
            boxType={boxType}
            boxPrice={boxPrice}
            selectedItems={selectedItems}
            onPlaceOrder={handlePlaceOrder}
            placing={placing}
            error={placeError}
          />
        )}
      </Container>
    </AppLayout>
  );
}
