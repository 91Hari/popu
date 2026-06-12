import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Box, Typography, IconButton, Card, CardContent,
  Stack, TextField, Button, CircularProgress, Alert,
  Snackbar, Divider, InputAdornment,
} from "@mui/material";
import ArrowBackRoundedIcon   from "@mui/icons-material/ArrowBackRounded";
import PhonelinkRoundedIcon   from "@mui/icons-material/PhonelinkRounded";
import QrCodeRoundedIcon      from "@mui/icons-material/QrCodeRounded";
import SaveRoundedIcon        from "@mui/icons-material/SaveRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon       from "@mui/icons-material/ErrorRounded";
import WarningRoundedIcon     from "@mui/icons-material/WarningRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import api from "../../services/api";

const UPI_REGEX = /^[\w.\-]+@[\w]+$/;

// status: null | 'checking' | 'valid' | 'error' | 'unavailable'
const EMPTY_VPA = { status: null, name: null };

function PhonePeIcon() {
  return (
    <Box sx={{
      width: 20, height: 20, borderRadius: "50%",
      background: "linear-gradient(135deg, #5A4EE8, #7B6CF0)",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Typography sx={{ color: "#fff", fontSize: "0.55rem", fontWeight: 900, lineHeight: 1 }}>Pe</Typography>
    </Box>
  );
}

function vpaHelperText(state, defaultText) {
  if (!state || state.status === null) return defaultText;
  if (state.status === "checking")     return "Validating UPI ID…";
  if (state.status === "valid")        return `✓ ${state.name ? state.name : "Valid UPI ID"}`;
  if (state.status === "unavailable")  return "⚠ Validation service unavailable — you can still save";
  return "UPI ID not found or not registered";
}

function vpaHelperSx(state) {
  if (!state) return {};
  if (state.status === "valid")       return { color: "#2e7d32", fontWeight: 600 };
  if (state.status === "unavailable") return { color: "#e65100", fontWeight: 500 };
  return {};
}

function vpaFieldSx(state) {
  if (!state) return {};
  if (state.status === "valid") return {
    "& .MuiOutlinedInput-root fieldset": { borderColor: "#2e7d32" },
    "& .MuiOutlinedInput-root:hover fieldset": { borderColor: "#2e7d32" },
  };
  return {};
}

function VpaEndAdornment({ state }) {
  if (!state || state.status === null) return null;
  if (state.status === "checking")    return <CircularProgress size={16} />;
  if (state.status === "valid")       return <CheckCircleRoundedIcon sx={{ color: "#2e7d32", fontSize: 18 }} />;
  if (state.status === "unavailable") return <WarningRoundedIcon sx={{ color: "#e65100", fontSize: 18 }} />;
  return <ErrorRoundedIcon sx={{ color: "error.main", fontSize: 18 }} />;
}

export default function CatererPaymentDetailsPage() {
  const navigate = useNavigate();
  const [fetching, setFetching] = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [snack,    setSnack]    = useState({ open: false, message: "", severity: "success" });
  const [vpa,      setVpa]      = useState({ phonepe_id: EMPTY_VPA, upi_id: EMPTY_VPA });
  const [form, setForm] = useState({
    phonepe_id: "", upi_id: "", payment_name: "", qr_code_image_url: "", bank_account_name: "",
  });

  useEffect(() => {
    api.request("/caterers/me")
      .then(({ profile: p }) => {
        const phonepe_id = p.phonepe_id || "";
        const upi_id     = p.upi_id     || "";
        setForm({
          phonepe_id, upi_id,
          payment_name:      p.payment_name      || "",
          qr_code_image_url: p.qr_code_image_url || "",
          bank_account_name: p.bank_account_name || "",
        });
        // Seed format-only green for pre-saved values without hitting API on load
        setVpa({
          phonepe_id: phonepe_id && UPI_REGEX.test(phonepe_id.trim()) ? { status: "valid", name: null } : EMPTY_VPA,
          upi_id:     upi_id     && UPI_REGEX.test(upi_id.trim())     ? { status: "valid", name: null } : EMPTY_VPA,
        });
      })
      .catch(() => setSnack({ open: true, message: "Failed to load payment details.", severity: "error" }))
      .finally(() => setFetching(false));
  }, []);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (field === "phonepe_id" || field === "upi_id") {
      setVpa((v) => ({ ...v, [field]: EMPTY_VPA }));
    }
  };

  const validateVpaField = async (field, value) => {
    const v = value.trim();
    if (!v) { setVpa((s) => ({ ...s, [field]: EMPTY_VPA })); return; }
    if (!UPI_REGEX.test(v)) {
      setVpa((s) => ({ ...s, [field]: { status: "error", name: null } }));
      return;
    }
    setVpa((s) => ({ ...s, [field]: { status: "checking", name: null } }));
    try {
      const result = await api.request(`/profile/validate-upi?upi=${encodeURIComponent(v)}`);
      if (result.valid === true) {
        setVpa((s) => ({ ...s, [field]: { status: "valid", name: result.name || null } }));
      } else if (result.valid === null) {
        setVpa((s) => ({ ...s, [field]: { status: "unavailable", name: null } }));
      } else {
        setVpa((s) => ({ ...s, [field]: { status: "error", name: null } }));
      }
    } catch {
      setVpa((s) => ({ ...s, [field]: { status: "unavailable", name: null } }));
    }
  };

  const handleSave = async () => {
    // Re-validate any non-empty UPI fields with format check before saving
    const pp = form.phonepe_id.trim();
    const ui = form.upi_id.trim();
    const newVpa = { ...vpa };
    if (pp && !UPI_REGEX.test(pp)) { newVpa.phonepe_id = { status: "error", name: null }; }
    if (ui && !UPI_REGEX.test(ui)) { newVpa.upi_id     = { status: "error", name: null }; }
    setVpa(newVpa);
    if (newVpa.phonepe_id.status === "error" || newVpa.upi_id.status === "error") return;
    if (newVpa.phonepe_id.status === "checking" || newVpa.upi_id.status === "checking") {
      setSnack({ open: true, message: "Please wait for UPI validation to finish.", severity: "warning" });
      return;
    }
    setSaving(true);
    try {
      const { profile: updated } = await api.request("/caterers/me/payment-profile", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setForm({
        phonepe_id:        updated.phonepe_id        || "",
        upi_id:            updated.upi_id            || "",
        payment_name:      updated.payment_name      || "",
        qr_code_image_url: updated.qr_code_image_url || "",
        bank_account_name: updated.bank_account_name || "",
      });
      setSnack({ open: true, message: "Payment details saved.", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to save.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 6 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <IconButton size="small" onClick={() => navigate(-1)} sx={{ color: brand.orange }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <PhonelinkRoundedIcon sx={{ color: brand.orange, fontSize: 24 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Payment Details</Typography>
        </Box>

        <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5 }}>
              Customers use these details to pay you directly.
            </Typography>

            {fetching ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress sx={{ color: brand.orange }} />
              </Box>
            ) : (
              <Stack spacing={2.5}>
                {/* PhonePe ID */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                    <PhonePeIcon />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>PhonePe ID</Typography>
                  </Box>
                  <TextField
                    fullWidth size="small"
                    placeholder="e.g. 9876543210@ybl"
                    value={form.phonepe_id}
                    onChange={set("phonepe_id")}
                    onBlur={() => validateVpaField("phonepe_id", form.phonepe_id)}
                    error={vpa.phonepe_id.status === "error"}
                    helperText={vpaHelperText(vpa.phonepe_id, "Your PhonePe UPI address (found in PhonePe app → Profile)")}
                    FormHelperTextProps={{ sx: vpaHelperSx(vpa.phonepe_id) }}
                    sx={vpaFieldSx(vpa.phonepe_id)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PhonePeIcon /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <VpaEndAdornment state={vpa.phonepe_id} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Divider />

                {/* UPI ID other */}
                <TextField
                  fullWidth size="small"
                  label="UPI ID (other)"
                  placeholder="e.g. name@upi"
                  value={form.upi_id}
                  onChange={set("upi_id")}
                  onBlur={() => validateVpaField("upi_id", form.upi_id)}
                  error={vpa.upi_id.status === "error"}
                  helperText={vpaHelperText(vpa.upi_id, "Any UPI ID — GooglePay, Paytm, BHIM, etc.")}
                  FormHelperTextProps={{ sx: vpaHelperSx(vpa.upi_id) }}
                  sx={vpaFieldSx(vpa.upi_id)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <VpaEndAdornment state={vpa.upi_id} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth size="small"
                  label="Payment Display Name"
                  placeholder="Name shown on payment screen"
                  value={form.payment_name}
                  onChange={set("payment_name")}
                />

                <TextField
                  fullWidth size="small"
                  label="QR Code Image URL"
                  placeholder="https://..."
                  value={form.qr_code_image_url}
                  onChange={set("qr_code_image_url")}
                  helperText="Upload your QR to an image host and paste the URL here."
                />

                <TextField
                  fullWidth size="small"
                  label="Bank Account Name"
                  placeholder="Name on your bank account"
                  value={form.bank_account_name}
                  onChange={set("bank_account_name")}
                />

                <Button
                  variant="contained" size="large" onClick={handleSave} disabled={saving}
                  startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
                  sx={{ fontWeight: 700 }}
                >
                  {saving ? "Saving…" : "Save Payment Details"}
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
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
