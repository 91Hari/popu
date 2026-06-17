import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Alert, CircularProgress, Stack,
} from "@mui/material";
import Logo from "../../components/Logo";
import authService from "../../services/authService";
import { brand } from "../../theme";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) { setError("Enter your email or mobile number"); return; }

    setError("");
    setLoading(true);
    try {
      await authService.forgotPassword({ username: username.trim() });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
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
            Enter your email or mobile number and we'll send a reset link
          </Typography>

          {success ? (
            <Stack spacing={2}>
              <Alert severity="success">
                If an account exists, a reset link has been sent. Check the server
                console for the link during development.
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
            </Stack>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                  fullWidth
                  label="Email or Mobile Number"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  disabled={loading}
                  autoComplete="username"
                  placeholder="email@example.com or 10-digit mobile"
                  autoFocus
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
