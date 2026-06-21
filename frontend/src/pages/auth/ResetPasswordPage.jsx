import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Alert, CircularProgress, Stack, InputAdornment, IconButton,
} from "@mui/material";
import VisibilityRoundedIcon     from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon  from "@mui/icons-material/VisibilityOffRounded";
import CheckCircleRoundedIcon    from "@mui/icons-material/CheckCircleRounded";
import PhoneAndroidRoundedIcon   from "@mui/icons-material/PhoneAndroidRounded";

import Logo from "../../components/Logo";
import authService from "../../services/authService";
import { brand } from "../../theme";

// Detect if running inside the Capacitor Android/iOS shell
function isNativeApp() {
  return (
    typeof window !== "undefined" &&
    (window.Capacitor?.isNativePlatform?.() ||
     window.location.hostname === "localhost")
  );
}

function SuccessScreen({ navigate }) {
  const [countdown, setCountdown] = useState(5);
  const [appOpened, setAppOpened] = useState(false);

  // Try to open the native app via custom URL scheme
  useEffect(() => {
    if (!isNativeApp()) {
      // We're in a browser — try to open the installed app
      try {
        window.location.href = "popu://login";
        setAppOpened(true);
      } catch {
        // Ignore — app might not be installed
      }
    }
  }, []);

  // Countdown then navigate to login (browser fallback)
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/login", { replace: true });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  return (
    <Stack spacing={3} alignItems="center" sx={{ textAlign: "center" }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 64, color: "#2E7D32" }} />

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
          Password Reset Successful!
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Your password has been updated. All existing sessions have been signed out.
        </Typography>
      </Box>

      {!isNativeApp() && (
        <Alert
          severity="info"
          icon={<PhoneAndroidRoundedIcon />}
          sx={{ textAlign: "left", width: "100%" }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Have the PO.PU app?
          </Typography>
          <Typography variant="body2">
            {appOpened
              ? "The app should have opened. If not, tap the button below."
              : "Tap below to open the PO.PU app directly."}
          </Typography>
        </Alert>
      )}

      <Stack spacing={1.5} sx={{ width: "100%" }}>
        {!isNativeApp() && (
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<PhoneAndroidRoundedIcon />}
            onClick={() => { window.location.href = "popu://login"; }}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
              "&:hover": { background: `linear-gradient(135deg, ${brand.orangeMid} 0%, ${brand.orangeMid} 100%)` },
            }}
          >
            Open PO.PU App
          </Button>
        )}

        <Button
          fullWidth
          variant={isNativeApp() ? "contained" : "outlined"}
          size="large"
          onClick={() => navigate("/login", { replace: true })}
          sx={isNativeApp() ? {
            fontWeight: 700,
            textTransform: "none",
            background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
            "&:hover": { background: `linear-gradient(135deg, ${brand.orangeMid} 0%, ${brand.orangeMid} 100%)` },
          } : {
            fontWeight: 600,
            textTransform: "none",
            borderColor: brand.orange,
            color: brand.orange,
            "&:hover": { backgroundColor: brand.greenLight },
          }}
        >
          Sign In ({countdown}s)
        </Button>
      </Stack>
    </Stack>
  );
}

export default function ResetPasswordPage() {
  const [searchParams]                = useSearchParams();
  const token                         = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState(false);
  const [loading, setLoading]         = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword)              { setError("Enter a new password"); return; }
    if (newPassword !== confirm)   { setError("Passwords do not match"); return; }

    setError("");
    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  const eyeAdornment = (show, toggle) => ({
    endAdornment: (
      <InputAdornment position="end">
        <IconButton onClick={toggle} edge="end" size="small" tabIndex={-1}>
          {show
            ? <VisibilityOffRoundedIcon fontSize="small" />
            : <VisibilityRoundedIcon fontSize="small" />}
        </IconButton>
      </InputAdornment>
    ),
  });

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
      <Card sx={{ width: "100%", maxWidth: 420, boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Logo size={52} height={90} width={90} showTagline />
          </Box>

          {success ? (
            <SuccessScreen navigate={navigate} />
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                Set New Password
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                Choose a strong password for your account
              </Typography>

              {!token && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Invalid reset link. Please request a new one.{" "}
                  <Link to="/forgot-password" style={{ color: brand.orange }}>Try again</Link>
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                  {error && <Alert severity="error">{error}</Alert>}

                  <TextField
                    fullWidth
                    label="New Password"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                    disabled={loading || !token}
                    autoComplete="new-password"
                    helperText="Min 8 chars, uppercase, lowercase, number, special char"
                    slotProps={{ input: eyeAdornment(showNew, () => setShowNew((v) => !v)) }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                    disabled={loading || !token}
                    autoComplete="new-password"
                    slotProps={{ input: eyeAdornment(showConfirm, () => setShowConfirm((v) => !v)) }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || !token}
                    sx={primaryBtnSx}
                  >
                    {loading
                      ? <CircularProgress size={22} sx={{ color: "white" }} />
                      : "Reset Password"}
                  </Button>

                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", color: "text.secondary" }}
                  >
                    <Box
                      component={Link}
                      to="/login"
                      sx={{ color: brand.orange, fontWeight: 700, textDecoration: "none" }}
                    >
                      Back to Sign In
                    </Box>
                  </Typography>
                </Stack>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
