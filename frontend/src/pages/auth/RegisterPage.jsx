import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Alert, CircularProgress, Stack, InputAdornment, IconButton,
} from "@mui/material";
import VisibilityRoundedIcon    from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import Logo from "../../components/Logo";
import authService from "../../services/authService";
import { brand } from "../../theme";

function validatePassword(pw) {
  if (!pw || pw.length < 8)  return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw))    return "Must contain at least one uppercase letter";
  if (!/[a-z]/.test(pw))    return "Must contain at least one lowercase letter";
  if (!/[0-9]/.test(pw))    return "Must contain at least one number";
  return null;
}

export default function RegisterPage() {
  const [name, setName]                 = useState("");
  const [mobile, setMobile]             = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirm]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [errors, setErrors]             = useState({});
  const [apiError, setApiError]         = useState("");
  const [loading, setLoading]           = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!name.trim())                   e.name   = "Name is required";
    else if (name.trim().length < 2)    e.name   = "Name must be at least 2 characters";
    if (!mobile)                        e.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(mobile))  e.mobile = "Enter a valid 10-digit mobile number";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
                                        e.email  = "Enter a valid email address";
    const pwErr = validatePassword(password);
    if (pwErr)                          e.password = pwErr;
    if (!confirmPassword)               e.confirm  = "Please confirm your password";
    else if (password !== confirmPassword) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      await authService.register({
        name:         name.trim(),
        mobileNumber: mobile,
        email:        email.trim() || undefined,
        password,
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clrErr = (key) => () => {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const primaryBtnSx = {
    py: 1.5,
    background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
    textTransform: "none",
    fontWeight: 700,
    fontSize: "1rem",
    borderRadius: 1,
    "&:hover": { background: `linear-gradient(135deg, ${brand.orangeMid} 0%, ${brand.orangeMid} 100%)` },
    "&.Mui-disabled": { background: "#E0E0E0" },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: brand.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 440, boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Logo size={52} height={90} width={90} showTagline />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Create Account
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Join Popu to order food from local caterers
          </Typography>

          {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => { setName(e.target.value); clrErr("name")(); }}
                disabled={loading}
                autoComplete="name"
                placeholder="e.g. Priya Sharma"
                autoFocus
                error={!!errors.name}
                helperText={errors.name}
              />

              <TextField
                fullWidth
                label="Mobile Number"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                  clrErr("mobile")();
                }}
                disabled={loading}
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit mobile number"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.9rem" }}>
                          +91
                        </Typography>
                      </InputAdornment>
                    ),
                  },
                }}
                error={!!errors.mobile}
                helperText={errors.mobile}
              />

              <TextField
                fullWidth
                label="Email Address (Optional)"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clrErr("email")(); }}
                disabled={loading}
                autoComplete="email"
                placeholder="example@email.com"
                error={!!errors.email}
                helperText={errors.email || "Used to receive order confirmations"}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clrErr("password")(); }}
                disabled={loading}
                autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password || "Min 8 chars, uppercase, lowercase, number"}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small" tabIndex={-1}>
                          {showPassword
                            ? <VisibilityOffRoundedIcon fontSize="small" />
                            : <VisibilityRoundedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirm(e.target.value); clrErr("confirm")(); }}
                disabled={loading}
                autoComplete="new-password"
                error={!!errors.confirm}
                helperText={errors.confirm}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" size="small" tabIndex={-1}>
                          {showConfirm
                            ? <VisibilityOffRoundedIcon fontSize="small" />
                            : <VisibilityRoundedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={primaryBtnSx}
              >
                {loading
                  ? <CircularProgress size={22} sx={{ color: "white" }} />
                  : "Create Account"}
              </Button>

              <Typography
                variant="body2"
                sx={{ textAlign: "center", color: "text.secondary" }}
              >
                Already have an account?{" "}
                <Box
                  component={Link}
                  to="/login"
                  sx={{ color: brand.orange, fontWeight: 700, textDecoration: "none" }}
                >
                  Sign In
                </Box>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
