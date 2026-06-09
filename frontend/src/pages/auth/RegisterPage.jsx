import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container, Card, CardContent, TextField, Button, Box, Typography,
  Alert, CircularProgress, Stack, FormControl, InputLabel, Select,
  MenuItem, useMediaQuery, useTheme, Collapse, Divider, Chip,
} from "@mui/material";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import authService from "../../services/authService";
import Logo from "../../components/Logo";

const BRAND_ORANGE = "#E8751A";

export default function RegisterPage() {
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole]               = useState("customer");

  // caterer-only fields
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress]           = useState("");
  const [latitude, setLatitude]         = useState(null);
  const [longitude, setLongitude]       = useState(null);
  const [geoStatus, setGeoStatus]       = useState("idle"); // idle | detecting | detected | denied

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

    if (!password.trim())          e.password = "Password is required";
    else if (password.length < 6)  e.password = "Password must be at least 6 characters";

    if (!confirmPassword.trim())   e.confirmPassword = "Confirm password is required";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";

    if (!role) e.role = "Please select a role";

    if (isCaterer) {
      if (!businessName.trim())    e.businessName = "Business name is required";
      if (!address.trim())         e.address = "Address is required";
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
        password,
        role,
        ...(isCaterer && {
          business_name: businessName,
          address,
          latitude,
          longitude,
        }),
      });
      navigate("/login");
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

                {/* Caterer-specific fields */}
                <Collapse in={isCaterer} unmountOnExit>
                  <Stack spacing={2.5}>
                    <Divider>
                      <Chip label="Caterer Details" size="small" sx={{ backgroundColor: "#FFF3E0", color: BRAND_ORANGE, fontWeight: 600 }} />
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

                    {/* GPS capture */}
                    <Box
                      sx={{
                        p: 1.5, borderRadius: 1, border: `1px solid`,
                        borderColor: geoStatus === "detected" ? "#4caf50" : "#e0e0e0",
                        backgroundColor: geoStatus === "detected" ? "#f1f8e9" : "#fafafa",
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }}>
                          Business Location (GPS)
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {geoStatus === "idle"      && "Used to show delivery distance to customers"}
                          {geoStatus === "detecting" && "Detecting your location…"}
                          {geoStatus === "detected"  && `Detected — lat ${latitude?.toFixed(4)}, lng ${longitude?.toFixed(4)}`}
                          {geoStatus === "denied"    && "Location access denied — customers won't see distance"}
                        </Typography>
                      </Box>
                      {geoStatus === "detected" ? (
                        <CheckCircleRoundedIcon sx={{ color: "#4caf50", flexShrink: 0 }} />
                      ) : (
                        <Button
                          size="small" variant="outlined"
                          startIcon={geoStatus === "detecting" ? <CircularProgress size={12} color="inherit" /> : <MyLocationRoundedIcon />}
                          onClick={detectLocation}
                          disabled={loading || geoStatus === "detecting"}
                          sx={{ borderColor: BRAND_ORANGE, color: BRAND_ORANGE, fontWeight: 600, flexShrink: 0, fontSize: "0.75rem" }}
                        >
                          {geoStatus === "detecting" ? "Detecting…" : "Detect"}
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </Collapse>

                <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1, border: "1px solid #e0e0e0" }}>
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
                    background: "linear-gradient(135deg, #E8751A 0%, #F5A05A 100%)",
                    textTransform: "none",
                    fontSize: isMobile ? "0.95rem" : "1rem",
                    fontWeight: 600, py: isMobile ? 1.2 : 1.5, borderRadius: 1,
                    "&:hover": { background: "linear-gradient(135deg, #D2680F 0%, #D2680F 100%)" },
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
                    borderColor: BRAND_ORANGE, color: BRAND_ORANGE,
                    "&:hover": { backgroundColor: "rgba(232,117,26,0.06)", borderColor: BRAND_ORANGE },
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
