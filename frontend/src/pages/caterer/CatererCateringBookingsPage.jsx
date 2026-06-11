import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Typography, Card, CardContent, Stack, Chip,
  Button, CircularProgress, Alert, Divider, Snackbar,
} from "@mui/material";
import EventNoteRoundedIcon   from "@mui/icons-material/EventNoteRounded";
import PeopleAltRoundedIcon   from "@mui/icons-material/PeopleAltRounded";
import EventRoundedIcon       from "@mui/icons-material/EventRounded";
import CheckRoundedIcon       from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon       from "@mui/icons-material/CloseRounded";
import TaskAltRoundedIcon     from "@mui/icons-material/TaskAltRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import cateringService from "../../services/cateringService";

const STATUS_CFG = {
  PENDING:   { label: "Pending",   color: "info"    },
  CONFIRMED: { label: "Confirmed", color: "success" },
  REJECTED:  { label: "Rejected",  color: "error"   },
  CANCELLED: { label: "Cancelled", color: "default" },
  COMPLETED: { label: "Completed", color: "success" },
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function CatererCateringBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [updating, setUpdating] = useState({});
  const [snack, setSnack]       = useState({ open: false, message: "", severity: "success" });

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

  const handleAction = async (id, status) => {
    setUpdating((u) => ({ ...u, [id]: true }));
    try {
      const updated = await cateringService.updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, ...updated } : b));
      const msg = status === "CONFIRMED" ? "Booking confirmed!"
        : status === "REJECTED" ? "Booking rejected."
        : "Booking marked as completed.";
      setSnack({ open: true, message: msg, severity: status === "REJECTED" ? "info" : "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to update.", severity: "error" });
    } finally {
      setUpdating((u) => { const n = { ...u }; delete n[id]; return n; });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: brand.orange }} />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <EventNoteRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Event Bookings</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Catering requests from customers
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {bookings.length === 0 ? (
          <Card elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <EventNoteRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No catering bookings yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Bookings from customers will appear here once they request your catering services.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {bookings.map((b) => {
              const cfg        = STATUS_CFG[b.status] || STATUS_CFG.PENDING;
              const isUpdating = !!updating[b.id];

              return (
                <Card
                  key={b.id}
                  elevation={0}
                  sx={{
                    border: `2px solid ${b.status === "PENDING" ? brand.gold : brand.border}`,
                    borderRadius: 2,
                    transition: "border-color 0.2s",
                  }}
                >
                  <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                    {/* Header row */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <Box>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.25 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: brand.orange }}>
                            {b.occasion_name}
                          </Typography>
                          <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 700 }} />
                        </Stack>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {b.customer_name}
                          {b.customer_email ? ` · ${b.customer_email}` : ""}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: brand.orange, flexShrink: 0, ml: 1 }}>
                        ₹{Number(b.total_amount).toFixed(2)}
                      </Typography>
                    </Stack>

                    <Divider sx={{ mb: 1.5 }} />

                    {/* Details row */}
                    <Stack direction="row" gap={3} flexWrap="wrap" sx={{ mb: 1.25 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <EventRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Event: <strong>{fmtDate(b.event_date)}</strong>
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PeopleAltRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {b.number_of_people} guests · ₹{Number(b.price_per_person).toFixed(0)}/person
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Booked: {fmtDate(b.created_at)}
                      </Typography>
                    </Stack>

                    {/* Special requests */}
                    {(b.special_food_request || b.special_instructions) && (
                      <Box sx={{ mb: 1.25, p: 1, borderRadius: 1.5, backgroundColor: brand.orangeLight, border: `1px solid ${brand.gold}` }}>
                        {b.special_food_request && (
                          <Typography variant="caption" sx={{ display: "block", fontWeight: 600 }}>
                            Food request: {b.special_food_request}
                          </Typography>
                        )}
                        {b.special_instructions && (
                          <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                            Instructions: {b.special_instructions}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Actions */}
                    {b.status === "PENDING" && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small" variant="outlined" color="error"
                          startIcon={isUpdating ? <CircularProgress size={12} color="inherit" /> : <CloseRoundedIcon fontSize="small" />}
                          disabled={isUpdating}
                          onClick={() => handleAction(b.id, "REJECTED")}
                          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="small" variant="contained"
                          startIcon={isUpdating ? <CircularProgress size={12} color="inherit" /> : <CheckRoundedIcon fontSize="small" />}
                          disabled={isUpdating}
                          onClick={() => handleAction(b.id, "CONFIRMED")}
                          sx={{ fontWeight: 600, fontSize: "0.75rem", background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})` }}
                        >
                          Confirm
                        </Button>
                      </Stack>
                    )}

                    {b.status === "CONFIRMED" && (
                      <Stack direction="row" justifyContent="flex-end">
                        <Button
                          size="small" variant="outlined"
                          startIcon={isUpdating ? <CircularProgress size={12} color="inherit" /> : <TaskAltRoundedIcon fontSize="small" />}
                          disabled={isUpdating}
                          onClick={() => handleAction(b.id, "COMPLETED")}
                          sx={{ fontWeight: 600, fontSize: "0.75rem", color: brand.orange, borderColor: brand.orange }}
                        >
                          Mark Completed
                        </Button>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>

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
