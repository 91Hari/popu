import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container, Card, CardContent, TextField, Button, Box, Typography,
  Alert, CircularProgress, Stack, FormControl, InputLabel, Select,
  MenuItem, useMediaQuery, useTheme, Collapse, Divider, Chip,
  InputAdornment,
} from "@mui/material";
import MyLocationRoundedIcon   from "@mui/icons-material/MyLocationRounded";
import CheckCircleRoundedIcon  from "@mui/icons-material/CheckCircleRounded";
import QrCodeRoundedIcon       from "@mui/icons-material/QrCodeRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import authService from "../../services/authService";
import Logo from "../../components/Logo";

import { brand } from "../../theme";
const BRAND_GREEN = brand.orange;
const UPI_REGEX   = /^[\w.\-]+@[\w]+$/;
const QR_MAX_BYTES = 3 * 1024 * 1024;

export default function RegisterPage() {
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [phone, setPhone]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole]               = useState("customer");

  // caterer-only fields
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress]           = useState("");
  const [latitude, setLatitude]         = useState(null);
  const [longitude, setLongitude]       = useState(null);
  const [geoStatus, setGeoStatus]       = useState("idle"); // idle | detecting | detected | denied
  const [upiId, setUpiId]               = useState("");
  const [upiName, setUpiName]           = useState("");
  const [qrDataUrl, setQrDataUrl]       = useState("");
  const qrInputRef = useRef(null);

  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate  = useNavigate();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down("sm"));
  const isCaterer = role === "caterer";

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGeoStatus("detected");
      },
      () => setGeoStatus("denied"),
      { timeout: 10000 }
    );
  };

  const validateForm = () => {
    const e = {};

    if (!name.trim())              e.name = "Name is required";
    else if (name.trim().length < 2) e.name = "Name must be at least 2 characters";

    if (!email.trim())             e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";

    if (!phone.trim())             e.phone = "Mobile number is required";
    else if (!/^[+]?[\d\s\-]{10,15}$/.test(phone.trim())) e.phone = "Enter a valid mobile number";

    if (!password.trim())          e.password = "Password is required";
    else if (password.length < 6)  e.password = "Password must be at least 6 characters";

    if (!confirmPassword.trim())   e.confirmPassword = "Confirm password is required";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";

    if (!role) e.role = "Please select a role";

    if (isCaterer) {
      if (!businessName.trim())    e.businessName = "Business name is required";
      if (!address.trim())         e.address = "Address is required";
      if (upiId.trim() && !UPI_REGEX.test(upiId.trim())) e.upiId = "Invalid UPI ID format (e.g. name@ybl)";
    }

    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setErrors({});
    setApiError("");
    setLoading(true);

    try {
      await authService.register({
        name,
        email,
        phone,
        password,
        role,
        latitude,
        longitude,
        ...(isCaterer && {
          business_name: businessName,
          address,
          upi_id:            upiId.trim()   || undefined,
          upi_name:          upiName.trim()  || undefined,
          qr_code_image_url: qrDataUrl       || undefined,
        }),
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQrFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setApiError("QR code must be an image file."); return; }
    if (file.size > QR_MAX_BYTES) { setApiError("QR image must be under 3 MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setQrDataUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 1 } };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", py: isMobile ? 2 : 4,
        }}
      >
        <Card sx={{ width: "100%", boxShadow: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: isMobile ? 3 : 4 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
                <Logo size={44} showTagline />
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: isMobile ? "0.875rem" : "1rem" }}>
                Create Your Account
              </Typography>
            </Box>

            {apiError && <Alert severity="error" sx={{ mb: 3 }}>{apiError}</Alert>}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth label="Full Name" type="text"
                  value={name} onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: "" }); }}
                  error={!!errors.name} helperText={errors.name}
                  placeholder="John Doe" disabled={loading} autoComplete="name" sx={fieldSx}
                />

                <TextField
                  fullWidth label="Email Address" type="email"
                  value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: "" }); }}
                  error={!!errors.email} helperText={errors.email}
                  placeholder="example@email.com" disabled={loading} autoComplete="email" sx={fieldSx}
                />

                <TextField
                  fullWidth label="Mobile Number" type="tel"
                  value={phone} onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: "" }); }}
                  error={!!errors.phone} helperText={errors.phone}
                  placeholder="e.g. 9876543210" disabled={loading} autoComplete="tel" sx={fieldSx}
                />

                <TextField
                  fullWidth label="Password" type="password"
                  value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: "" }); }}
                  error={!!errors.password} helperText={errors.password}
                  placeholder="••••••••" disabled={loading} autoComplete="new-password" sx={fieldSx}
                />

                <TextField
                  fullWidth label="Confirm Password" type="password"
                  value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" }); }}
                  error={!!errors.confirmPassword} helperText={errors.confirmPassword}
                  placeholder="••••••••" disabled={loading} autoComplete="new-password" sx={fieldSx}
                />

                <FormControl fullWidth error={!!errors.role} disabled={loading}>
                  <InputLabel id="role-label">Select Role</InputLabel>
                  <Select
                    labelId="role-label" value={role} label="Select Role"
                    onChange={(e) => { setRole(e.target.value); if (errors.role) setErrors({ ...errors, role: "" }); }}
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="customer">🛒 Customer</MenuItem>
                    <MenuItem value="caterer">👨‍🍳 Caterer</MenuItem>
                  </Select>
                  {errors.role && (
                    <Typography variant="caption" sx={{ color: "#d32f2f", mt: 0.5 }}>{errors.role}</Typography>
                  )}
                </FormControl>

                {/* GPS location capture — all roles */}
                <Box
                  sx={{
                    p: 1.5, borderRadius: 1, border: `1px solid`,
                    borderColor: geoStatus === "detected" ? brand.green : brand.border,
                    backgroundColor: geoStatus === "detected" ? brand.greenLight : brand.bg,
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }}>
                      {isCaterer ? "Business Location (GPS)" : "Your Delivery Location (GPS)"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {geoStatus === "idle"      && (isCaterer ? "Used to show delivery distance to customers" : "Used to calculate accurate delivery time for your orders")}
                      {geoStatus === "detecting" && "Detecting your location…"}
                      {geoStatus === "detected"  && `Detected — lat ${latitude?.toFixed(4)}, lng ${longitude?.toFixed(4)}`}
                      {geoStatus === "denied"    && (isCaterer ? "Location access denied — customers won't see distance" : "Location access denied — delivery time estimates may be less accurate")}
                    </Typography>
                  </Box>
                  {geoStatus === "detected" ? (
                    <CheckCircleRoundedIcon sx={{ color: brand.green, flexShrink: 0 }} />
                  ) : (
                    <Button
                      size="small" variant="outlined"
                      startIcon={geoStatus === "detecting" ? <CircularProgress size={12} color="inherit" /> : <MyLocationRoundedIcon />}
                      onClick={detectLocation}
                      disabled={loading || geoStatus === "detecting"}
                      sx={{ borderColor: BRAND_GREEN, color: BRAND_GREEN, fontWeight: 600, flexShrink: 0, fontSize: "0.75rem" }}
                    >
                      {geoStatus === "detecting" ? "Detecting…" : "Detect"}
                    </Button>
                  )}
                </Box>

                {/* Caterer-specific fields */}
                <Collapse in={isCaterer} unmountOnExit>
                  <Stack spacing={2.5}>
                    <Divider>
                      <Chip label="Caterer Details" size="small" sx={{ backgroundColor: brand.goldLight, color: BRAND_GREEN, fontWeight: 600 }} />
                    </Divider>

                    <TextField
                      fullWidth label="Business Name" type="text"
                      value={businessName}
                      onChange={(e) => { setBusinessName(e.target.value); if (errors.businessName) setErrors({ ...errors, businessName: "" }); }}
                      error={!!errors.businessName} helperText={errors.businessName}
                      placeholder="e.g. Amma's Kitchen" disabled={loading} sx={fieldSx}
                    />

                    <TextField
                      fullWidth label="Full Address" multiline rows={2}
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors({ ...errors, address: "" }); }}
                      error={!!errors.address} helperText={errors.address || "Street, area, city and pincode"}
                      placeholder="e.g. 12 MG Road, Banjara Hills, Hyderabad 500034"
                      disabled={loading} sx={fieldSx}
                    />

                    <Divider>
                      <Chip label="Payment Details (Optional)" size="small" sx={{ backgroundColor: brand.goldLight, color: BRAND_GREEN, fontWeight: 600, fontSize: "0.72rem" }} />
                    </Divider>

                    <TextField
                      fullWidth label="UPI ID" size="small"
                      placeholder="e.g. satvikfoods@ybl"
                      value={upiId}
                      onChange={(e) => { setUpiId(e.target.value); if (errors.upiId) setErrors({ ...errors, upiId: "" }); }}
                      error={!!errors.upiId}
                      helperText={errors.upiId || "Customers will use this to pay you (PhonePe, GPay, Paytm…)"}
                      disabled={loading}
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <QrCodeRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                          </InputAdornment>
                        ),
                        endAdornment: upiId.trim() && UPI_REGEX.test(upiId.trim()) ? (
                          <InputAdornment position="end">
                            <CheckCircleRoundedIcon sx={{ color: "#2e7d32", fontSize: 18 }} />
                          </InputAdornment>
                        ) : null,
                      }}
                    />

                    <TextField
                      fullWidth label="UPI Display Name" size="small"
                      placeholder="e.g. Satvik Foods"
                      value={upiName}
                      onChange={(e) => setUpiName(e.target.value)}
                      helperText="Name shown to customer on their UPI payment screen"
                      disabled={loading}
                      sx={fieldSx}
                    />

                    {/* QR Code upload */}
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.75 }}>
                        Payment QR Code (optional)
                      </Typography>
                      <input ref={qrInputRef} type="file" accept="image/*" hidden onChange={handleQrFile} />
                      {qrDataUrl ? (
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                          <Box
                            component="img" src={qrDataUrl} alt="QR preview"
                            sx={{ width: 72, height: 72, objectFit: "contain", borderRadius: 1.5, border: `1px solid ${brand.border}`, p: 0.5 }}
                          />
                          <Stack spacing={0.75}>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>QR code uploaded</Typography>
                            <Button size="small" variant="outlined" startIcon={<QrCodeRoundedIcon />}
                              onClick={() => qrInputRef.current?.click()} disabled={loading}
                              sx={{ fontSize: "0.72rem", textTransform: "none" }}>
                              Replace
                            </Button>
                            <Button size="small" variant="outlined" color="error" startIcon={<DeleteOutlineRoundedIcon />}
                              onClick={() => setQrDataUrl("")} disabled={loading}
                              sx={{ fontSize: "0.72rem", textTransform: "none" }}>
                              Remove
                            </Button>
                          </Stack>
                        </Box>
                      ) : (
                        <Box
                          onClick={() => !loading && qrInputRef.current?.click()}
                          sx={{
                            border: `2px dashed ${brand.border}`, borderRadius: 1.5,
                            p: 2, textAlign: "center", cursor: loading ? "default" : "pointer",
                            "&:hover": loading ? {} : { borderColor: BRAND_GREEN, backgroundColor: brand.greenLight },
                            transition: "all 0.15s",
                          }}
                        >
                          <QrCodeRoundedIcon sx={{ fontSize: 30, color: brand.border, mb: 0.25 }} />
                          <Typography variant="caption" sx={{ display: "block", fontWeight: 600, color: "text.secondary" }}>
                            Upload QR Code
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.disabled" }}>
                            PNG / JPG · Max 3 MB
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </Collapse>

                <Box sx={{ p: 2, backgroundColor: brand.goldLight, borderRadius: 1, border: `1px solid ${brand.border}` }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    <strong>Customer:</strong> Browse and order food from caterers
                    <br />
                    <strong>Caterer:</strong> Add and manage food offerings
                  </Typography>
                </Box>

                <Button
                  fullWidth variant="contained" size={isMobile ? "medium" : "large"}
                  onClick={handleSubmit} disabled={loading}
                  sx={{
                    mt: 2,
                    background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
                    textTransform: "none",
                    fontSize: isMobile ? "0.95rem" : "1rem",
                    fontWeight: 600, py: isMobile ? 1.2 : 1.5, borderRadius: 1,
                    "&:hover": { background: `linear-gradient(135deg, ${brand.orangeMid} 0%, ${brand.orangeMid} 100%)` },
                    "&:disabled": { background: "#ccc" },
                  }}
                >
                  {loading ? (
                    <><CircularProgress size={20} sx={{ mr: 1, color: "white" }} /> Creating Account…</>
                  ) : "Register"}
                </Button>

                <Button
                  fullWidth variant="outlined" size={isMobile ? "medium" : "large"}
                  component={Link} to="/login" disabled={loading}
                  sx={{
                    textTransform: "none", fontSize: isMobile ? "0.95rem" : "1rem",
                    fontWeight: 600, py: isMobile ? 1.2 : 1.5, borderRadius: 1,
                    borderColor: BRAND_GREEN, color: BRAND_GREEN,
                    "&:hover": { backgroundColor: brand.greenLight, borderColor: BRAND_GREEN },
                  }}
                >
                  Back To Login
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
