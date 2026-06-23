import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Button,
  Alert, CircularProgress, Stack, TextField,
} from "@mui/material";

import Logo from "../../components/Logo";
import authService from "../../services/authService";
import { brand } from "../../theme";

const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mobile = searchParams.get("mobile") || "";

  const [otp, setOtp]           = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(OTP_EXPIRY_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) { setError("Enter the 6-digit OTP"); return; }

    setError("");
    setLoading(true);
    try {
      const res = await authService.verifyOtp({ identifier: mobile, otp });
      navigate(`/reset-password?token=${res.resetToken}`, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setOtp("");
    try {
      await authService.forgotPassword({ identifier: mobile });
      startTimer();
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!mobile) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2, backgroundColor: brand.bg }}>
        <Alert severity="error" sx={{ maxWidth: 420 }}>
          No mobile number provided.{" "}
          <Link to="/forgot-password" style={{ color: brand.orange }}>Go back</Link>
        </Alert>
      </Box>
    );
  }

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

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Verify OTP
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            A 6-digit OTP was sent to{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
              +91 {mobile}
            </Box>
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                fullWidth
                label="6-Digit OTP"
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                  setError("");
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                disabled={loading}
                slotProps={{
                  htmlInput: { maxLength: 6, style: { letterSpacing: "0.3em", fontSize: "1.2rem", textAlign: "center" } },
                }}
              />

              {/* Timer */}
              <Box sx={{ textAlign: "center" }}>
                {timeLeft > 0 ? (
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    OTP expires in{" "}
                    <Box component="span" sx={{ fontWeight: 700, color: timeLeft < 60 ? "error.main" : brand.orange }}>
                      {formatTime(timeLeft)}
                    </Box>
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ color: "error.main", fontWeight: 600 }}>
                    OTP expired
                  </Typography>
                )}
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || timeLeft === 0}
                sx={primaryBtnSx}
              >
                {loading
                  ? <CircularProgress size={22} sx={{ color: "white" }} />
                  : "Verify OTP"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleResend}
                  disabled={resending || (timeLeft > 0 && timeLeft < OTP_EXPIRY_SECONDS)}
                  sx={{ textTransform: "none", color: brand.orange, fontWeight: 600 }}
                >
                  {resending
                    ? <><CircularProgress size={14} sx={{ mr: 1, color: brand.orange }} /> Resending…</>
                    : "Resend OTP"}
                </Button>
              </Box>

              <Typography
                variant="body2"
                sx={{ textAlign: "center", color: "text.secondary" }}
              >
                Wrong number?{" "}
                <Box
                  component={Link}
                  to="/forgot-password"
                  sx={{ color: brand.orange, fontWeight: 700, textDecoration: "none" }}
                >
                  Go back
                </Box>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
