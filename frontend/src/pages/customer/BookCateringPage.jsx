import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Stack, Button,
  CircularProgress, Alert, TextField, Chip, Stepper, Step, StepLabel,
  Snackbar,
} from "@mui/material";
import EventRoundedIcon          from "@mui/icons-material/EventRounded";
import PeopleAltRoundedIcon      from "@mui/icons-material/PeopleAltRounded";
import CheckCircleRoundedIcon    from "@mui/icons-material/CheckCircleRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import AppLayout from "../../components/AppLayout";
import BackButton from "../../components/BackButton";
import { brand } from "../../theme";
import cateringService from "../../services/cateringService";

const STEPS = ["Select Occasion", "Date & Guests", "Special Requests", "Confirm"];

export default function BookCateringPage() {
  const { catererId } = useParams();
  const navigate       = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [step, setStep]         = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack]       = useState({ open: false, message: "", severity: "error" });
  const [done, setDone]         = useState(false);

  const [selected, setSelected]       = useState(null);
  const [eventDate, setEventDate]     = useState("");
  const [guests, setGuests]           = useState("");
  const [specialFood, setSpecialFood] = useState("");
  const [notes, setNotes]             = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await cateringService.getServicesByCaterer(catererId);
        setServices(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load catering services.");
      } finally {
        setLoading(false);
      }
    })();
  }, [catererId]);

  const minDate = (() => {
    if (!selected) return "";
    const d = new Date();
    d.setDate(d.getDate() + (selected.advance_booking_days || 1));
    return d.toISOString().split("T")[0];
  })();

  const estimate = selected && guests
    ? parseFloat(selected.price_per_person) * parseInt(guests || 0)
    : 0;

  const canNext = () => {
    if (step === 0) return !!selected;
    if (step === 1) return !!eventDate && !!guests && parseInt(guests) >= (selected?.minimum_people || 1) && parseInt(guests) <= (selected?.maximum_people || 9999);
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await cateringService.bookCatering({
        catering_service_id: selected.id,
        event_date:          eventDate,
        number_of_people:    parseInt(guests),
        special_food_request: specialFood || null,
        special_instructions: notes || null,
      });
      setDone(true);
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to book. Please try again.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AppLayout>
        <Container maxWidth="sm" sx={{ pt: 6, pb: 6, textAlign: "center" }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 80, color: brand.orange, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Booking Submitted!</Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
            Your catering request for <strong>{selected?.occasion_name}</strong> on <strong>{eventDate}</strong> has been sent to the caterer. They will confirm shortly.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/customer/catering-bookings")}
            sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none", fontWeight: 700, mr: 2 }}
          >
            View My Bookings
          </Button>
          <Button variant="outlined" onClick={() => navigate("/services/catering")}
            sx={{ textTransform: "none", fontWeight: 700, color: brand.orange, borderColor: brand.orange }}>
            Browse More Caterers
          </Button>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 5 }}>
        <BackButton sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <EventRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Book Catering</Typography>
        </Box>

        <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ "& .MuiStepLabel-label": { fontSize: "0.75rem" } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : (
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {/* Step 0: Select Occasion */}
              {step === 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Which occasion are you celebrating?
                  </Typography>
                  {services.length === 0 ? (
                    <Alert severity="info">This caterer has no catering services available at the moment.</Alert>
                  ) : (
                    <Stack spacing={1.5}>
                      {services.map((svc) => (
                        <Card
                          key={svc.id}
                          elevation={0}
                          onClick={() => setSelected(svc)}
                          sx={{
                            border: `2px solid ${selected?.id === svc.id ? brand.orange : brand.border}`,
                            borderRadius: 2, cursor: "pointer", p: 1.5,
                            backgroundColor: selected?.id === svc.id ? brand.orangeLight : "white",
                            transition: "all 0.15s",
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 700 }}>{svc.occasion_name}</Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {svc.minimum_people}–{svc.maximum_people} people · {svc.advance_booking_days} days notice
                              </Typography>
                            </Box>
                            <Chip
                              label={`₹${Number(svc.price_per_person).toFixed(0)}/person`}
                              sx={{ backgroundColor: brand.orange, color: "white", fontWeight: 700 }}
                            />
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}

              {/* Step 1: Date & Guests */}
              {step === 1 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    When and how many guests?
                  </Typography>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Event Date</Typography>
                      <TextField
                        fullWidth size="small" type="date"
                        value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                        inputProps={{ min: minDate }}
                        helperText={`Requires ${selected?.advance_booking_days} days advance booking`}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
                        Number of Guests
                      </Typography>
                      <TextField
                        fullWidth size="small" type="number"
                        value={guests} onChange={(e) => setGuests(e.target.value)}
                        inputProps={{ min: selected?.minimum_people, max: selected?.maximum_people }}
                        helperText={`Min: ${selected?.minimum_people} · Max: ${selected?.maximum_people}`}
                        error={!!guests && (parseInt(guests) < selected?.minimum_people || parseInt(guests) > selected?.maximum_people)}
                      />
                    </Box>
                    {estimate > 0 && (
                      <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: brand.orangeLight }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {guests} guests × ₹{Number(selected?.price_per_person).toFixed(0)}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: brand.orange }}>
                            ₹{estimate.toFixed(2)}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Estimated total (advance payment may be required)
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              )}

              {/* Step 2: Special Requests */}
              {step === 2 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Any special requirements?
                  </Typography>
                  <Stack spacing={2}>
                    {selected?.menu_items && (
                      <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: brand.bg, border: `1px solid ${brand.border}` }}>
                        <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 0.75 }}>
                          <RestaurantMenuRoundedIcon sx={{ fontSize: 15, color: brand.orange }} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: brand.orange }}>
                            Menu included for {selected.occasion_name}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: "text.primary", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                          {selected.menu_items}
                        </Typography>
                      </Box>
                    )}
                    <TextField
                      fullWidth size="small" multiline rows={3}
                      label="Special Food Requests"
                      placeholder="e.g. Vegetarian only, no nuts, specific cuisines…"
                      value={specialFood}
                      onChange={(e) => setSpecialFood(e.target.value)}
                    />
                    <TextField
                      fullWidth size="small" multiline rows={2}
                      label="Other Instructions (optional)"
                      placeholder="Venue details, setup requirements, timing…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </Stack>
                </Box>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Review your booking
                  </Typography>
                  <Stack spacing={1.25}>
                    {[
                      ["Occasion",  selected?.occasion_name],
                      ["Event Date", eventDate],
                      ["Guests",    `${guests} people`],
                      ["Price",     `₹${Number(selected?.price_per_person).toFixed(0)}/person`],
                      ["Estimated Total", `₹${estimate.toFixed(2)}`],
                      ["Special Food", specialFood || "None"],
                    ].map(([k, v]) => (
                      <Stack key={k} direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>{k}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{v}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Alert severity="info" sx={{ mt: 2, fontSize: "0.8rem" }}>
                    The caterer will confirm your booking. Payment terms will be discussed upon confirmation.
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        {!loading && services.length > 0 && (
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button
              variant="outlined" onClick={() => step > 0 ? setStep((s) => s - 1) : navigate(-1)}
              sx={{ fontWeight: 700, color: brand.orange, borderColor: brand.orange, textTransform: "none" }}
            >
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                variant="contained" onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none", fontWeight: 700 }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained" onClick={handleSubmit}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}
                sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none", fontWeight: 700 }}
              >
                Confirm Booking
              </Button>
            )}
          </Stack>
        )}
      </Container>

      <Snackbar
        open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
