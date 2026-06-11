import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Card, CardContent, Stack, Chip,
  Button, CircularProgress, Alert, Divider,
} from "@mui/material";
import EventRoundedIcon    from "@mui/icons-material/EventRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PhoneRoundedIcon     from "@mui/icons-material/PhoneRounded";
import AppLayout from "../../components/AppLayout";
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
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </AppLayout>
  );
}
