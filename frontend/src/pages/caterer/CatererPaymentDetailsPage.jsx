import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Box, Typography, IconButton, Card, CardContent,
  Stack, TextField, Button, CircularProgress, Alert,
  Snackbar, Divider, InputAdornment,
} from "@mui/material";
import PhonelinkRoundedIcon     from "@mui/icons-material/PhonelinkRounded";
import QrCodeRoundedIcon        from "@mui/icons-material/QrCodeRounded";
import SaveRoundedIcon          from "@mui/icons-material/SaveRounded";
import CheckCircleRoundedIcon   from "@mui/icons-material/CheckCircleRounded";
import UploadFileRoundedIcon    from "@mui/icons-material/UploadFileRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import api from "../../services/api";

const UPI_REGEX = /^[\w.\-]+@[\w]+$/;

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

const QR_MAX_BYTES = 3 * 1024 * 1024; // 3 MB

export default function CatererPaymentDetailsPage() {
  const navigate   = useNavigate();
  const qrInputRef = useRef(null);
  const [fetching, setFetching] = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [snack,    setSnack]    = useState({ open: false, message: "", severity: "success" });
  const [errors,   setErrors]   = useState({ phonepe_id: false, upi_id: false });
  const [form, setForm] = useState({
    phonepe_id: "", upi_id: "", payment_name: "", qr_code_image_url: "", bank_account_name: "",
  });

  useEffect(() => {
    api.request("/caterers/me")
      .then(({ profile: p }) => {
        setForm({
          phonepe_id:        p.phonepe_id        || "",
          upi_id:            p.upi_id            || "",
          payment_name:      p.payment_name      || "",
          qr_code_image_url: p.qr_code_image_url || "",
          bank_account_name: p.bank_account_name || "",
        });
      })
      .catch(() => setSnack({ open: true, message: "Failed to load payment details.", severity: "error" }))
      .finally(() => setFetching(false));
  }, []);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: false }));
  };

  const validateFormat = (field) => {
    const v = form[field].trim();
    if (v && !UPI_REGEX.test(v)) {
      setErrors((err) => ({ ...err, [field]: true }));
    }
  };

  const handleQrFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSnack({ open: true, message: "Only image files are accepted.", severity: "error" });
      return;
    }
    if (file.size > QR_MAX_BYTES) {
      setSnack({ open: true, message: "Image must be under 3 MB.", severity: "error" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, qr_code_image_url: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const pp = form.phonepe_id.trim();
    const ui = form.upi_id.trim();
    const newErrors = {
      phonepe_id: pp ? !UPI_REGEX.test(pp) : false,
      upi_id:     ui ? !UPI_REGEX.test(ui) : false,
    };
    setErrors(newErrors);
    if (newErrors.phonepe_id || newErrors.upi_id) return;

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

  const upiAdornment = (field) => {
    const v = form[field].trim();
    if (!v || errors[field]) return null;
    if (UPI_REGEX.test(v)) return <CheckCircleRoundedIcon sx={{ color: "#2e7d32", fontSize: 18 }} />;
    return null;
  };

  const validFieldSx = (field) => {
    const v = form[field].trim();
    if (v && UPI_REGEX.test(v) && !errors[field]) return {
      "& .MuiOutlinedInput-root fieldset": { borderColor: "#2e7d32" },
      "& .MuiOutlinedInput-root:hover fieldset": { borderColor: "#2e7d32" },
    };
    return {};
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 6 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <PhonelinkRoundedIcon sx={{ color: brand.orange, fontSize: 24 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Payment Details</Typography>
        </Box>

        <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5 }}>
              Customers use these details to pay you directly via UPI.
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
                    onBlur={() => validateFormat("phonepe_id")}
                    error={errors.phonepe_id}
                    helperText={errors.phonepe_id ? "Invalid UPI ID format" : "Your PhonePe UPI address (found in PhonePe app → Profile)"}
                    sx={validFieldSx("phonepe_id")}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PhonePeIcon /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">{upiAdornment("phonepe_id")}</InputAdornment>
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
                  onBlur={() => validateFormat("upi_id")}
                  error={errors.upi_id}
                  helperText={errors.upi_id ? "Invalid UPI ID format" : "Any UPI ID — GooglePay, Paytm, BHIM, etc."}
                  sx={validFieldSx("upi_id")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">{upiAdornment("upi_id")}</InputAdornment>
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

                {/* QR Code upload */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                    <QrCodeRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Payment QR Code</Typography>
                  </Box>
                  <input
                    ref={qrInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleQrFileChange}
                  />
                  {form.qr_code_image_url ? (
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                      <Box
                        component="img"
                        src={form.qr_code_image_url}
                        alt="Payment QR"
                        sx={{ width: 120, height: 120, objectFit: "contain", borderRadius: 2, border: `1px solid ${brand.border}`, p: 0.5 }}
                      />
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Customers will scan this QR to pay you.
                        </Typography>
                        <Button
                          size="small" variant="outlined"
                          startIcon={<UploadFileRoundedIcon />}
                          onClick={() => qrInputRef.current?.click()}
                          sx={{ alignSelf: "flex-start", fontWeight: 600 }}
                        >
                          Replace Image
                        </Button>
                        <Button
                          size="small" variant="outlined" color="error"
                          startIcon={<DeleteOutlineRoundedIcon />}
                          onClick={() => setForm((f) => ({ ...f, qr_code_image_url: "" }))}
                          sx={{ alignSelf: "flex-start", fontWeight: 600 }}
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <Box
                      onClick={() => qrInputRef.current?.click()}
                      sx={{
                        border: `2px dashed ${brand.border}`, borderRadius: 2,
                        p: 3, textAlign: "center", cursor: "pointer",
                        "&:hover": { borderColor: brand.orange, backgroundColor: brand.orangeLight },
                        transition: "all 0.15s",
                      }}
                    >
                      <QrCodeRoundedIcon sx={{ fontSize: 36, color: brand.border, mb: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                        Upload QR Code
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>
                        PNG / JPG / WEBP · Max 3 MB
                      </Typography>
                    </Box>
                  )}
                </Box>

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
