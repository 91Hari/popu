import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Alert, CircularProgress, Stack,
} from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";

import Logo from "../../components/Logo";
import authService from "../../services/authService";
import { brand } from "../../theme";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [error, setError]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = email.trim();
    if (!val) { setError("Enter your email address"); return; }
    if (!val.includes("@")) { setError("Enter a valid email address"); return; }

    setError("");
    setLoading(true);
    try {
      await authService.forgotPassword({ email: val });
      // Always show success — backend never reveals whether account exists
      setSubmitted(true);
    } catch (err) {
      // Show generic message even on network error — don't expose internals
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
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
      <Card sx={{ width: "100%", maxWidth: 420, boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Logo size={52} height={90} width={90} showTagline />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Forgot Password
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Enter your registered email address and we'll send you a reset link.
          </Typography>

          {submitted ? (
            <Stack spacing={2.5}>
              {/* Consistent message regardless of whether account exists */}
              <Alert
                severity="success"
                icon={<EmailRoundedIcon />}
                sx={{ alignItems: "flex-start" }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Check your inbox
                </Typography>
                <Typography variant="body2">
                  If an account exists with <strong>{email}</strong>, password reset
                  instructions have been sent. The link expires in 15 minutes.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                  Don't see it? Check your spam or junk folder.
                </Typography>
              </Alert>

              <Button
                fullWidth
                component={Link}
                to="/login"
                variant="outlined"
                size="large"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: brand.orange,
                  color: brand.orange,
                  borderRadius: 1,
                  "&:hover": { backgroundColor: brand.greenLight, borderColor: brand.orange },
                }}
              >
                Back to Sign In
              </Button>

              <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>
                Wrong email?{" "}
                <Box
                  component="span"
                  onClick={() => { setSubmitted(false); setError(""); }}
                  sx={{ color: brand.orange, fontWeight: 700, cursor: "pointer" }}
                >
                  Try again
                </Box>
              </Typography>
            </Stack>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  disabled={loading}
                  autoComplete="email"
                  placeholder="you@example.com"
                  autoFocus
                  slotProps={{
                    input: {
                      startAdornment: (
                        <EmailRoundedIcon sx={{ color: "text.disabled", mr: 1, fontSize: 20 }} />
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
                    : "Send Reset Link"}
                </Button>

                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", color: "text.secondary" }}
                >
                  Remembered it?{" "}
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
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
