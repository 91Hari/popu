import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Typography, Card, CardContent, Stack, Chip,
  Button, CircularProgress, Alert, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar,
} from "@mui/material";
import TwoWheelerRoundedIcon       from "@mui/icons-material/TwoWheelerRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteRoundedIcon           from "@mui/icons-material/DeleteRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import riderService from "../../services/riderService";

const EMPTY_FORM = {
  name: "", email: "", password: "", phone: "", vehicle_type: "", vehicle_number: "",
};

export default function CatererRidersPage() {
  const [riders, setRiders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [snack, setSnack]         = useState({ open: false, message: "", severity: "success" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await riderService.listMyRiders();
      setRiders(Array.isArray(data) ? data : []);
    } catch {
      setSnack({ open: true, message: "Failed to load riders.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) return;
    setSaving(true);
    try {
      await riderService.createRider(form);
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setSnack({ open: true, message: `Rider ${form.name} added successfully!`, severity: "success" });
      await load();
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to create rider.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    setDeleting(id);
    try {
      await riderService.deleteRider(id);
      setSnack({ open: true, message: `${name} removed.`, severity: "info" });
      await load();
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to remove rider.", severity: "error" });
    } finally {
      setDeleting(null);
    }
  };

  const F = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <TwoWheelerRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>My Riders</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Manage delivery riders for your orders
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={() => { setForm(EMPTY_FORM); setDialogOpen(true); }}
            sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none", fontWeight: 700 }}
          >
            Add Rider
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : riders.length === 0 ? (
          <Card elevation={0} sx={{ p: 5, textAlign: "center", border: `1px solid ${brand.border}` }}>
            <TwoWheelerRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No riders yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Add riders to assign them to orders for delivery.
            </Typography>
            <Button variant="contained" onClick={() => setDialogOpen(true)}
              sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, textTransform: "none" }}>
              Add First Rider
            </Button>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {riders.map((rider) => (
              <Card key={rider.id} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: brand.orangeLight, color: brand.orange, width: 40, height: 40, fontWeight: 700 }}>
                      {rider.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{rider.name}</Typography>
                        <Chip
                          label={rider.is_active ? "Active" : "Inactive"}
                          size="small"
                          color={rider.is_active ? "success" : "default"}
                          sx={{ fontSize: "0.6rem" }}
                        />
                      </Stack>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {rider.email}
                        {rider.vehicle_type && ` · ${rider.vehicle_type}`}
                        {rider.vehicle_number && ` · ${rider.vehicle_number}`}
                      </Typography>
                    </Box>
                    <Button
                      size="small" color="error" variant="outlined"
                      startIcon={deleting === rider.id ? <CircularProgress size={12} color="inherit" /> : <DeleteRoundedIcon fontSize="small" />}
                      disabled={deleting === rider.id}
                      onClick={() => handleDelete(rider.id, rider.name)}
                      sx={{ fontWeight: 600, fontSize: "0.75rem" }}
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

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Rider</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size="small" label="Full Name *" fullWidth value={form.name} onChange={F("name")} />
            <TextField size="small" label="Email Address *" fullWidth type="email" value={form.email} onChange={F("email")} />
            <TextField size="small" label="Password *" fullWidth type="password" value={form.password} onChange={F("password")}
              helperText="Minimum 8 characters" />
            <TextField size="small" label="Phone" fullWidth value={form.phone} onChange={F("phone")} />
            <Stack direction="row" spacing={1}>
              <TextField size="small" label="Vehicle Type" fullWidth
                placeholder="e.g. Bike, Scooter"
                value={form.vehicle_type} onChange={F("vehicle_type")} />
              <TextField size="small" label="Vehicle Number" fullWidth
                placeholder="e.g. TN01AB1234"
                value={form.vehicle_number} onChange={F("vehicle_number")} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained" onClick={handleSave}
            disabled={saving || !form.name || !form.email || !form.password}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})` }}
          >
            Add Rider
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
