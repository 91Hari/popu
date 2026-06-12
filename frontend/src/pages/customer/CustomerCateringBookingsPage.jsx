import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Stack, Chip,
  Button, CircularProgress, Alert, Divider, Snackbar,
} from "@mui/material";
import EventRoundedIcon      from "@mui/icons-material/EventRounded";
import PeopleAltRoundedIcon  from "@mui/icons-material/PeopleAltRounded";
import PhoneRoundedIcon      from "@mui/icons-material/PhoneRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import AppLayout from "../../components/AppLayout";
import ReviewDialog from "../../components/ReviewDialog";
import { brand } from "../../theme";
import cateringService from "../../services/cateringService";

const STATUS_CFG = {
  PENDING:   { label: "Pending",    color: "info"    },
  CONFIRMED: { label: "Confirmed",  color: "success" },
  REJECTED:  { label: "Rejected",   color: "error"   },
  CANCELLED: { label: "Cancelled",  color: "default" },
  COMPLETED: { label: "Completed",  color: "success" },
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CustomerCateringBookingsPage() {
  const navigate            = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [reviewDialog, setReviewDialog] = useState({ open: false, subjectType: "", subjectId: null, subjectName: "", orderRefId: null });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cateringService.getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <EventRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>My Catering Bookings</Typography>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : bookings.length === 0 ? (
          <Card elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <EventRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No catering bookings yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Browse caterers and book catering for your next event.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/services/catering")}
              sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none" }}>
              Browse Caterers
            </Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            {bookings.map((b) => {
              const cfg = STATUS_CFG[b.status] || STATUS_CFG.PENDING;
              return (
                <Card key={b.id} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
                  <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{b.occasion_name}</Typography>
                          <Chip label={cfg.label} size="small" color={cfg.color} sx={{ fontSize: "0.65rem", fontWeight: 700 }} />
                        </Stack>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {b.caterer_name}{b.caterer_business_name ? ` · ${b.caterer_business_name}` : ""}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: brand.orange }}>
                        ₹{Number(b.total_amount).toFixed(2)}
                      </Typography>
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    <Stack direction="row" gap={3} flexWrap="wrap">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <EventRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {fmtDate(b.event_date)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PeopleAltRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {b.number_of_people} guests · ₹{Number(b.price_per_person).toFixed(0)}/person
                        </Typography>
                      </Box>
                    </Stack>

                    {b.status === "CONFIRMED" && (
                      <Box sx={{ mt: 1, p: 1.25, borderRadius: 1.5, backgroundColor: "#E8F5E9", border: "1px solid #A5D6A7" }}>
                        <Stack direction="row" alignItems="center" gap={0.75}>
                          <PhoneRoundedIcon sx={{ fontSize: 15, color: "#2E7D32" }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: "#2E7D32", fontWeight: 700, display: "block" }}>
                              Caterer Contact
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: "#1B5E20" }}>
                              {b.caterer_phone || "Phone not added by caterer"}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    {b.special_food_request && (
                      <Box sx={{ mt: 1, p: 1, borderRadius: 1.5, backgroundColor: brand.orangeLight }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Special request: {b.special_food_request}
                        </Typography>
                      </Box>
                    )}

                    {b.status === "COMPLETED" && (
                      <Box sx={{ mt: 1.5 }}>
                        <Divider sx={{ mb: 1 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                          Rate your experience
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Button
                            size="small" variant="outlined"
                            startIcon={<RateReviewRoundedIcon fontSize="small" />}
                            onClick={() => setReviewDialog({ open: true, subjectType: "caterer", subjectId: b.caterer_id, subjectName: b.caterer_name, orderRefId: b.id })}
                            sx={{ fontWeight: 600, fontSize: "0.75rem", borderColor: brand.orange, color: brand.orange }}
                          >
                            Rate Caterer
                          </Button>
                          <Button
                            size="small" variant="outlined"
                            startIcon={<EventRoundedIcon fontSize="small" />}
                            onClick={() => setReviewDialog({ open: true, subjectType: "catering_service", subjectId: b.catering_service_id, subjectName: b.occasion_name, orderRefId: b.id })}
                            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                          >
                            Rate Service
                          </Button>
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
      <ReviewDialog
        open={reviewDialog.open}
        onClose={() => setReviewDialog((s) => ({ ...s, open: false }))}
        onDone={() => setSnack({ open: true, message: "Review saved! Thank you.", severity: "success" })}
        subjectType={reviewDialog.subjectType}
        subjectId={reviewDialog.subjectId}
        subjectName={reviewDialog.subjectName}
        orderRefId={reviewDialog.orderRefId}
      />

      <Snackbar
        open={snack.open} autoHideDuration={3500}
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
