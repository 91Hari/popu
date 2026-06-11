import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Typography, Card, CardContent, Stack, Chip,
  Button, CircularProgress, Alert, Divider, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Snackbar,
} from "@mui/material";
import EventRoundedIcon         from "@mui/icons-material/EventRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteRoundedIcon         from "@mui/icons-material/DeleteRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import cateringService from "../../services/cateringService";

const DEFAULT_OCCASIONS = [
  "Birthday Party", "Family Gathering", "House Warming",
  "Corporate Event", "Wedding Function", "Religious Event", "Other",
];

const EMPTY_FORM = {
  occasion_name: "", price_per_person: "",
  minimum_people: 10, maximum_people: 500, advance_booking_days: 7,
};

export default function CatererCateringServicesPage() {
  const [services, setServices]     = useState([]);
  const [available, setAvailable]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const [snack, setSnack]           = useState({ open: false, message: "", severity: "success" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cateringService.getMyServices();
      setServices(Array.isArray(data) ? data : []);
      if (data.length > 0) setAvailable(true);
    } catch {
      setSnack({ open: true, message: "Failed to load services.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (e) => {
    const val = e.target.checked;
    setAvailable(val);
    try {
      await cateringService.toggleCatering(val);
    } catch {
      setAvailable(!val);
      setSnack({ open: true, message: "Failed to update availability.", severity: "error" });
    }
  };

  const handleSave = async () => {
    if (!form.occasion_name || !form.price_per_person) return;
    setSaving(true);
    try {
      await cateringService.createService({
        occasion_name:        form.occasion_name,
        price_per_person:     parseFloat(form.price_per_person),
        minimum_people:       parseInt(form.minimum_people),
        maximum_people:       parseInt(form.maximum_people),
        advance_booking_days: parseInt(form.advance_booking_days),
      });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setAvailable(true);
      setSnack({ open: true, message: "Catering service added!", severity: "success" });
      await load();
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to save.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await cateringService.deleteService(id);
      setSnack({ open: true, message: "Service removed.", severity: "info" });
      await load();
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to delete.", severity: "error" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <EventRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Catering Services</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Configure the catering occasions you offer
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={() => { setForm(EMPTY_FORM); setDialogOpen(true); }}
            sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none", fontWeight: 700 }}
          >
            Add Occasion
          </Button>
        </Stack>

        {/* Catering available toggle */}
        <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Accept Catering Bookings</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Customers can see and book your catering services when enabled.
                </Typography>
              </Box>
              <Switch
                checked={available}
                onChange={handleToggle}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: brand.orange },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: brand.orange },
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : services.length === 0 ? (
          <Card elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <EventRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No services added yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Add your first catering occasion to start receiving bookings.
            </Typography>
            <Button variant="contained" onClick={() => setDialogOpen(true)}
              sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none" }}>
              Add Your First Occasion
            </Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            {services.map((svc) => (
              <Card key={svc.id} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{svc.occasion_name}</Typography>
                        <Chip
                          label={svc.status}
                          size="small"
                          color={svc.status === "ACTIVE" ? "success" : "default"}
                          sx={{ fontSize: "0.65rem", fontWeight: 600 }}
                        />
                      </Stack>
                      <Stack direction="row" gap={2} flexWrap="wrap">
                        <Typography variant="body2" sx={{ color: brand.orange, fontWeight: 700 }}>
                          ₹{Number(svc.price_per_person).toFixed(0)}/person
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {svc.minimum_people}–{svc.maximum_people} people
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {svc.advance_booking_days} days notice
                        </Typography>
                      </Stack>
                    </Box>
                    <Button
                      size="small" color="error" variant="outlined"
                      startIcon={deleting === svc.id ? <CircularProgress size={12} color="inherit" /> : <DeleteRoundedIcon fontSize="small" />}
                      disabled={deleting === svc.id}
                      onClick={() => handleDelete(svc.id)}
                      sx={{ fontWeight: 600, fontSize: "0.75rem", ml: 1 }}
                    >
                      Remove
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>

      {/* Add Service Dialog */}
      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Catering Occasion</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Occasion</InputLabel>
              <Select
                label="Occasion"
                value={DEFAULT_OCCASIONS.includes(form.occasion_name) ? form.occasion_name : form.occasion_name ? "Other" : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({ ...f, occasion_name: val === "Other" ? "" : val }));
                }}
              >
                {DEFAULT_OCCASIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
            {(!DEFAULT_OCCASIONS.includes(form.occasion_name) || form.occasion_name === "") && (
              <TextField
                size="small" label="Custom Occasion Name" fullWidth
                value={form.occasion_name}
                onChange={(e) => setForm((f) => ({ ...f, occasion_name: e.target.value }))}
              />
            )}
            <TextField
              size="small" label="Price Per Person (₹)" fullWidth type="number"
              value={form.price_per_person}
              onChange={(e) => setForm((f) => ({ ...f, price_per_person: e.target.value }))}
              inputProps={{ min: 1 }}
            />
            <Stack direction="row" spacing={1}>
              <TextField
                size="small" label="Min People" fullWidth type="number"
                value={form.minimum_people}
                onChange={(e) => setForm((f) => ({ ...f, minimum_people: e.target.value }))}
                inputProps={{ min: 1 }}
              />
              <TextField
                size="small" label="Max People" fullWidth type="number"
                value={form.maximum_people}
                onChange={(e) => setForm((f) => ({ ...f, maximum_people: e.target.value }))}
                inputProps={{ min: 1 }}
              />
            </Stack>
            <TextField
              size="small" label="Advance Booking (days)" fullWidth type="number"
              value={form.advance_booking_days}
              onChange={(e) => setForm((f) => ({ ...f, advance_booking_days: e.target.value }))}
              inputProps={{ min: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained" onClick={handleSave}
            disabled={saving || !form.occasion_name || !form.price_per_person}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})` }}
          >
            Add Service
          </Button>
        </DialogActions>
      </Dialog>

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
