import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Box, Typography, Button, IconButton, Card,
  TextField, CircularProgress, Alert, Snackbar, MenuItem, Stack,
} from "@mui/material";
import SettingsRoundedIcon   from "@mui/icons-material/SettingsRounded";
import ArrowBackRoundedIcon  from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon        from "@mui/icons-material/SaveRounded";
import AppLayout from "../../components/AppLayout";
import api       from "../../services/api";
import { brand } from "../../theme";

const GENDER_OPTIONS = ["male", "female", "non-binary", "prefer not to say"];

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [snack,   setSnack]   = useState({ open: false, message: "", severity: "success" });
  const [errors,  setErrors]  = useState({});
  const [form, setForm] = useState({
    name: "", phone: "", email: "", date_of_birth: "", gender: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.request("/profile");
        setForm({
          name:          data.name          || "",
          phone:         data.phone         || "",
          email:         data.email         || "",
          date_of_birth: data.date_of_birth ? data.date_of_birth.slice(0, 10) : "",
          gender:        data.gender        || "",
        });
      } catch {
        showSnack("Failed to load profile.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e2) => ({ ...e2, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Full name is required";
    if (!form.phone.trim()) e.phone = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter a valid 10-digit mobile number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email.trim())) e.email = "Enter a valid email address";
    if (form.date_of_birth) {
      const dob = new Date(form.date_of_birth);
      if (isNaN(dob.getTime())) e.date_of_birth = "Enter a valid date";
      else if (dob > new Date()) e.date_of_birth = "Date of birth cannot be in the future";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name:          form.name.trim(),
        phone:         form.phone.trim(),
        email:         form.email.trim(),
        date_of_birth: form.date_of_birth || null,
        gender:        form.gender        || null,
      };
      const updated = await api.request("/profile", {
        method: "PUT", body: JSON.stringify(payload),
      });
      // Sync localStorage so nav avatar/name reflects change
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, name: updated.name, email: updated.email, phone: updated.phone }));
      } catch {}
      showSnack("Profile updated successfully.");
    } catch (err) {
      showSnack(err?.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <IconButton size="small" onClick={() => navigate("/customer/profile")} sx={{ color: brand.orange }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <SettingsRoundedIcon sx={{ color: brand.orange, fontSize: 24 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Settings</Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : (
          <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, p: 3 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: 1 }}>
                  Personal Info
                </Typography>
                <Stack spacing={2}>
                  <TextField fullWidth size="small" label="Full Name *"
                    value={form.name} onChange={set("name")}
                    error={!!errors.name} helperText={errors.name} />
                  <TextField fullWidth size="small" label="Mobile Number *"
                    value={form.phone} onChange={set("phone")}
                    inputProps={{ maxLength: 10 }}
                    error={!!errors.phone} helperText={errors.phone} />
                  <TextField fullWidth size="small" label="Email Address *"
                    type="email" value={form.email} onChange={set("email")}
                    error={!!errors.email} helperText={errors.email} />
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: 1 }}>
                  Optional Details
                </Typography>
                <Stack spacing={2}>
                  <TextField fullWidth size="small" label="Date of Birth"
                    type="date" value={form.date_of_birth} onChange={set("date_of_birth")}
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.date_of_birth} helperText={errors.date_of_birth} />
                  <TextField fullWidth size="small" select label="Gender"
                    value={form.gender} onChange={set("gender")}>
                    <MenuItem value=""><em>Prefer not to say</em></MenuItem>
                    {GENDER_OPTIONS.map((g) => (
                      <MenuItem key={g} value={g} sx={{ textTransform: "capitalize" }}>{g}</MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Box>

              <Button
                fullWidth variant="contained" size="large"
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{ fontWeight: 700, mt: 1 }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </Stack>
          </Card>
        )}
      </Container>

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
