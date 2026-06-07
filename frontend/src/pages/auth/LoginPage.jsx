import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  InputBase,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import FacebookIcon from "@mui/icons-material/Facebook";
import { brand } from "../../theme";
import Logo from "../../components/Logo";
import authService from "../../services/authService";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

// Backend is mock email/password auth; the OTP flow is a front-end demo that
// signs into the seeded customer account so the rest of the app works.
const DEMO_CREDENTIALS = { email: "customer@test.com", password: "password123" };

export default function LoginPage() {
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Sign Up
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const phoneValid = /^\d{10}$/.test(phone);
  const otpComplete = otp.every((d) => d !== "");

  const resetFlow = () => {
    setOtpSent(false);
    setOtp(Array(OTP_LENGTH).fill(""));
    setTimer(0);
    setError("");
  };

  const handleSendOtp = () => {
    if (!phoneValid) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (tab === 1 && !name.trim()) {
      setError("Please enter your name");
      return;
    }
    setError("");
    setOtpSent(true);
    setTimer(RESEND_SECONDS);
    // Prefill a demo OTP so the flow is easy to walk through.
    setOtp(["1", "2", "3", "4", "5", "6"]);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!otpComplete) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await authService.login(DEMO_CREDENTIALS);
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...data.user, name: name || "Priya", phone }),
      );
      navigate("/customer");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    border: `1px solid ${brand.border}`,
    borderRadius: 2,
    px: 1.5,
    py: 1.25,
    fontSize: "0.95rem",
    width: "100%",
    "&:focus-within": { borderColor: brand.orange },
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
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Logo size={44} showTagline />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            {tab === 0 ? "Welcome Back! 👋" : "Create your account"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {tab === 0 ? "Login to continue" : "Sign up to get started"}
          </Typography>

          <Tabs
            value={tab}
            onChange={(_, v) => {
              setTab(v);
              resetFlow();
            }}
            sx={{
              mb: 3,
              minHeight: 40,
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
            }}
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            {tab === 1 && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
                >
                  Full Name
                </Typography>
                <InputBase
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  sx={inputSx}
                  disabled={otpSent}
                />
              </Box>
            )}

            <Box>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
              >
                Mobile Number
              </Typography>
              <Box sx={{ ...inputSx, display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ color: "text.secondary", fontWeight: 600 }}>
                  +91
                </Typography>
                <InputBase
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="98765 43210"
                  disabled={otpSent}
                  sx={{ flex: 1, fontSize: "0.95rem" }}
                  inputProps={{ inputMode: "numeric" }}
                />
                {otpSent && (
                  <Button size="small" onClick={resetFlow} sx={{ minWidth: 0 }}>
                    Edit
                  </Button>
                )}
              </Box>
            </Box>

            {otpSent && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
                >
                  Enter OTP
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {otp.map((digit, i) => (
                    <InputBase
                      key={i}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      inputRef={(el) => (otpRefs.current[i] = el)}
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 1,
                        style: { textAlign: "center", padding: 0 },
                      }}
                      sx={{
                        flex: 1,
                        height: 48,
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        borderRadius: 2,
                        border: `1.5px solid ${digit ? brand.orange : brand.border}`,
                        color: brand.orange,
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ mt: 1 }}>
                  {timer > 0 ? (
                    <Typography variant="caption" sx={{ color: brand.orange }}>
                      Resend OTP in 0:{String(timer).padStart(2, "0")}
                    </Typography>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => setTimer(RESEND_SECONDS)}
                      sx={{ p: 0, minWidth: 0 }}
                    >
                      Resend OTP
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              onClick={otpSent ? handleVerify : handleSendOtp}
              sx={{ py: 1.25 }}
            >
              {loading ? (
                <CircularProgress size={22} sx={{ color: "white" }} />
              ) : otpSent ? (
                tab === 0 ? "Login" : "Create Account"
              ) : (
                "Get OTP"
              )}
            </Button>
          </Stack>

          <Divider sx={{ my: 3, fontSize: "0.75rem", color: "text.secondary" }}>
            or continue with
          </Divider>

          <Stack direction="row" spacing={1.5}>
            {[
              { label: "Google", icon: <GoogleIcon fontSize="small" /> },
              { label: "Apple", icon: <AppleIcon fontSize="small" /> },
              { label: "Facebook", icon: <FacebookIcon fontSize="small" /> },
            ].map((p) => (
              <Button
                key={p.label}
                fullWidth
                variant="outlined"
                startIcon={p.icon}
                onClick={handleVerify}
                sx={{
                  color: "text.primary",
                  borderColor: "divider",
                  textTransform: "none",
                  fontSize: "0.8rem",
                  "&:hover": { borderColor: brand.orange },
                }}
              >
                {p.label}
              </Button>
            ))}
          </Stack>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              color: "text.secondary",
              mt: 2,
            }}
          >
            By continuing you agree to our Terms & Privacy Policy
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
