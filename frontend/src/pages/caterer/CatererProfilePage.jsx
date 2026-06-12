import { useEffect, useState } from "react";
import {
  Container, Box, Typography, Avatar, Card, CardContent,
  Stack, TextField, Button, CircularProgress, Alert,
  Snackbar, Divider, InputAdornment,
} from "@mui/material";
import PersonRoundedIcon          from "@mui/icons-material/PersonRounded";
import PhonelinkRoundedIcon       from "@mui/icons-material/PhonelinkRounded";
import QrCodeRoundedIcon          from "@mui/icons-material/QrCodeRounded";
import SaveRoundedIcon            from "@mui/icons-material/SaveRounded";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";
import api from "../../services/api";

function PhonePeIcon() {
  return (
    <Box
      sx={{
        width: 20, height: 20, borderRadius: "50%",
        background: "linear-gradient(135deg, #5A4EE8, #7B6CF0)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Typography sx={{ color: "#fff", fontSize: "0.55rem", fontWeight: 900, lineHeight: 1 }}>
        Pe
      </Typography>
    </Box>
  );
}

export default function CatererProfilePage() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
  })();

  const [profile,  setProfile]  = useState(null);
  const [fetching, setFetching] = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [snack,    setSnack]    = useState({ open: false, message: "", severity: "success" });

  // Editable payment fields
  const [form, setForm] = useState({
    phonepe_id:        "",
    upi_id:            "",
    payment_name:      "",
    qr_code_image_url: "",
    bank_account_name: "",
  });

  useEffect(() => {
    api.request("/caterers/me")
      .then(({ profile: p }) => {
        setProfile(p);
        setForm({
          phonepe_id:        p.phonepe_id        || "",
          upi_id:            p.upi_id            || "",
          payment_name:      p.payment_name      || "",
          qr_code_image_url: p.qr_code_image_url || "",
          bank_account_name: p.bank_account_name || "",
        });
      })
      .catch(() => setSnack({ open: true, message: "Failed to load profile.", severity: "error" }))
      .finally(() => setFetching(false));
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
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
      setSnack({ open: true, message: "Payment profile saved.", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err?.message || "Failed to save.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ pt: 3, pb: 6 }}>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <PersonRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>My Profile</Typography>
        </Box>

        {/* Identity card */}
        <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: brand.orange, fontWeight: 800, fontSize: "1.4rem" }}>
              {(user.name || "C")[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {fetching ? "…" : (profile?.business_name || user.name || "—")}
              </Typography>
              {!fetching && profile?.business_name && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {profile.name || user.name}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {user.email}
              </Typography>
              {(user.phone || profile?.phone) && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  +91 {user.phone || profile?.phone}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Payment profile */}
        <Card elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <PhonelinkRoundedIcon sx={{ color: brand.orange, fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Payment Details</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5 }}>
              Customers use these details to pay you directly.
            </Typography>

            {fetching ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress sx={{ color: brand.orange }} />
              </Box>
            ) : (
              <Stack spacing={2.5}>

                {/* PhonePe ID — primary field */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                    <PhonePeIcon />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      PhonePe ID
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. 9876543210@ybl"
                    value={form.phonepe_id}
                    onChange={set("phonepe_id")}
                    helperText="Your PhonePe UPI address (found in PhonePe app → Profile)"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhonePeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Divider />

                {/* Other UPI / bank fields */}
                <TextField
                  fullWidth size="small"
                  label="UPI ID (other)"
                  placeholder="e.g. name@upi"
                  value={form.upi_id}
                  onChange={set("upi_id")}
                  helperText="Any UPI ID — GooglePay, Paytm, BHIM, etc."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
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
                  variant="contained"
                  size="large"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
                  sx={{ fontWeight: 700, alignSelf: "flex-end", px: 4 }}
                >
                  {saving ? "Saving…" : "Save Payment Details"}
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
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
