import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Box, Typography, Button, IconButton, Card,
  CardContent, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert, Snackbar,
} from "@mui/material";
import PaymentRoundedIcon     from "@mui/icons-material/PaymentRounded";
import EditRoundedIcon        from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon      from "@mui/icons-material/DeleteRounded";
import ArrowBackRoundedIcon   from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon         from "@mui/icons-material/AddRounded";
import AppLayout from "../../components/AppLayout";
import api       from "../../services/api";
import { brand } from "../../theme";

const UPI_REGEX = /^[\w.\-]+@[\w]+$/;

function formatDate(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const EMPTY_FORM = { phonepe_id: "" };

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const [methods,  setMethods]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [dialog,   setDialog]   = useState({ open: false, mode: "add", data: null });
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [snack,    setSnack]    = useState({ open: false, message: "", severity: "success" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    try {
      const list = await api.request("/profile/payment-methods");
      setMethods(Array.isArray(list) ? list : []);
    } catch {
      showSnack("Failed to load payment methods.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const validate = () => {
    const e = {};
    if (!form.phonepe_id.trim())         e.phonepe_id = "PhonePe ID is required";
    else if (!UPI_REGEX.test(form.phonepe_id.trim())) e.phonepe_id = "Enter a valid UPI ID (e.g. name@ybl)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const hasPhonePe = methods.some((m) => m.payment_type === "phonepe");

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setDialog({ open: true, mode: "add", data: null });
  };

  const openEdit = (method) => {
    setForm({ phonepe_id: method.phonepe_id || "" });
    setErrors({});
    setDialog({ open: true, mode: "edit", data: method });
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { payment_type: "phonepe", phonepe_id: form.phonepe_id.trim() };
      if (dialog.mode === "add") {
        const created = await api.request("/profile/payment-methods", {
          method: "POST", body: JSON.stringify(payload),
        });
        setMethods((prev) => [...prev, created]);
        showSnack("PhonePe ID saved successfully.");
      } else {
        const updated = await api.request(`/profile/payment-methods/${dialog.data.id}`, {
          method: "PUT", body: JSON.stringify(payload),
        });
        setMethods((prev) => prev.map((m) => m.id === updated.id ? updated : m));
        showSnack("PhonePe ID updated.");
      }
      setDialog({ open: false, mode: "add", data: null });
    } catch (err) {
      showSnack(err?.message || "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.request(`/profile/payment-methods/${id}`, { method: "DELETE" });
      setMethods((prev) => prev.filter((m) => m.id !== id));
      showSnack("Payment method removed.");
    } catch {
      showSnack("Failed to delete payment method.", "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <IconButton size="small" onClick={() => navigate(-1)} sx={{ color: brand.orange }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <PaymentRoundedIcon sx={{ color: brand.orange, fontSize: 24 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Payment Methods</Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : (
          <Stack spacing={2}>
            {/* PhonePe card */}
            {(() => {
              const pp = methods.find((m) => m.payment_type === "phonepe");
              return (
                <Card elevation={0} sx={{ border: `2px solid ${pp ? brand.orange : brand.border}`, borderRadius: 3 }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: "linear-gradient(135deg, #5f259f, #8a2be2)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.75rem" }}>Pe</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>PhonePe</Typography>
                        {pp ? (
                          <>
                            <Typography variant="body2" sx={{ color: "text.secondary", fontFamily: "monospace" }}>
                              {pp.phonepe_id}
                            </Typography>
                            {pp.updated_at && (
                              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                                Updated {formatDate(pp.updated_at)}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>Not added</Typography>
                        )}
                      </Box>
                      {pp ? (
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => openEdit(pp)} sx={{ color: brand.orange }}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => setDeleteConfirm(pp.id)} sx={{ color: "#EF5350" }}>
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Button size="small" variant="contained" startIcon={<AddRoundedIcon />}
                          onClick={openAdd} sx={{ fontWeight: 700 }}>
                          Add
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Future-ready placeholder cards */}
            {[
              { label: "Google Pay", color: ["#4285F4", "#34A853"], initials: "G" },
              { label: "Paytm",      color: ["#00BAF2", "#0073c6"], initials: "P" },
            ].map((item) => (
              <Card key={item.label} elevation={0} sx={{
                border: `1px solid ${brand.border}`, borderRadius: 3, opacity: 0.55,
              }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${item.color[0]}, ${item.color[1]})`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "0.75rem" }}>{item.initials}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>Coming soon</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>

      {/* Add / Edit PhonePe dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, mode: "add", data: null })}
        maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {dialog.mode === "add" ? "Add PhonePe ID" : "Edit PhonePe ID"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth size="small"
            label="PhonePe UPI ID *"
            placeholder="e.g. yourname@ybl"
            value={form.phonepe_id}
            onChange={(e) => {
              setForm((f) => ({ ...f, phonepe_id: e.target.value }));
              setErrors({});
            }}
            error={!!errors.phonepe_id}
            helperText={errors.phonepe_id || "Format: name@ybl, name@ibl, name@axl, etc."}
            sx={{ mt: 0.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialog({ open: false, mode: "add", data: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ fontWeight: 700 }}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Remove PhonePe ID?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Your saved PhonePe ID will be removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(deleteConfirm)}>Remove</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
