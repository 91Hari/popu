import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
} from "@mui/material";
import PhoneRoundedIcon    from "@mui/icons-material/PhoneRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Logo from "../../components/Logo";
import authService from "../../services/authService";
import { brand } from "../../theme";

const RESEND_DELAY = 30;

function roleRoute(role) {
  switch (role.toLowerCase()) {
    case "rider":   return "/rider";
    case "caterer": return "/caterer";
    case "admin":   return "/admin";
    default:        return "/customer";
  }
}

export default function LoginPage() {
  const [step, setStep]         = useState("mobile"); // "mobile" | "otp"
  const [mobile, setMobile]     = useState("");
  const [otp, setOtp]           = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [countdown, setCountdown] = useState(0);

  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Start 30-second resend countdown whenever OTP step activates
  useEffect(() => {
    if (step === "otp") startCountdown();
    return () => clearInterval(timerRef.current);
  }, [step]);

  function startCountdown() {
    setCountdown(RESEND_DELAY);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authService.sendOtp(mobile);
      setOtp("");
      setStep("otp");
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setError("");
    setLoading(true);
    try {
      await authService.sendOtp(mobile);
      setOtp("");
      startCountdown();
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await authService.verifyOtp(mobile, otp);
      const user = {
        ...data.user,
        role: data.user.role.toLowerCase(),
      };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(roleRoute(user.role));
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBackToMobile = () => {
    clearInterval(timerRef.current);
    setStep("mobile");
    setOtp("");
    setError("");
  };

  const primaryBtnSx = {
    py: 1.5,
    background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
    textTransform: "none",
    fontWeight: 700,
    fontSize: "1rem",
    borderRadius: 1,
    "&:hover": {
      background: `linear-gradient(135deg, ${brand.orangeMid} 0%, ${brand.orangeMid} 100%)`,
    },
    "&.Mui-disabled": {
      background: "#E0E0E0",
    },
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

          {/* ── Step 1: Mobile number entry ─────────────────────────────── */}
          {step === "mobile" && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                Welcome!
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                Login or create an account with your mobile number
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSendOtp} noValidate>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    disabled={loading}
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    autoComplete="tel-national"
                    autoFocus
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneRoundedIcon sx={{ color: brand.orange, fontSize: 20 }} />
                            <Typography
                              sx={{ ml: 0.5, color: "text.secondary", fontWeight: 600, fontSize: "0.9rem" }}
                            >
                              +91
                            </Typography>
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
                    disabled={loading || mobile.length !== 10}
                    sx={primaryBtnSx}
                  >
                    {loading ? (
                      <CircularProgress size={22} sx={{ color: "white" }} />
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </Stack>
              </Box>

              <Typography
                variant="caption"
                sx={{ display: "block", textAlign: "center", mt: 3, color: "text.disabled" }}
              >
                By continuing, you agree to our Terms &amp; Privacy Policy.
                New users are registered automatically.
              </Typography>
            </>
          )}

          {/* ── Step 2: OTP verification ────────────────────────────────── */}
          {step === "otp" && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Button
                  size="small"
                  onClick={goBackToMobile}
                  disabled={loading}
                  sx={{ minWidth: 0, p: 0.5, color: "text.secondary" }}
                >
                  <ArrowBackRoundedIcon fontSize="small" />
                </Button>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Verify OTP
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                OTP sent to{" "}
                <Box
                  component="span"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  +91 {mobile}
                </Box>
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleVerifyOtp} noValidate>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    disabled={loading}
                    inputMode="numeric"
                    placeholder="6-digit OTP"
                    autoFocus
                    autoComplete="one-time-code"
                    slotProps={{
                      htmlInput: {
                        maxLength: 6,
                        style: {
                          letterSpacing: "0.4em",
                          fontSize: "1.5rem",
                          textAlign: "center",
                          fontWeight: 700,
                        },
                      },
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || otp.length !== 6}
                    sx={primaryBtnSx}
                  >
                    {loading ? (
                      <CircularProgress size={22} sx={{ color: "white" }} />
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  {/* Resend + Change Number */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || loading}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        color: countdown > 0 ? "text.disabled" : brand.orange,
                        p: 0,
                      }}
                    >
                      {countdown > 0
                        ? `Resend OTP in ${countdown}s`
                        : "Resend OTP"}
                    </Button>

                    <Button
                      variant="text"
                      size="small"
                      onClick={goBackToMobile}
                      disabled={loading}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        color: "text.secondary",
                        p: 0,
                      }}
                    >
                      Change Number
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
