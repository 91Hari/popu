import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Alert, CircularProgress, Stack, InputAdornment, IconButton,
} from "@mui/material";
import VisibilityRoundedIcon    from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import Logo from "../../components/Logo";
import authService from "../../services/authService";
import { brand } from "../../theme";

function roleRoute(role) {
  switch ((role || "").toLowerCase()) {
    case "rider":   return "/rider";
    case "caterer": return "/caterer";
    case "admin":   return "/admin";
    default:        return "/customer";
  }
}

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
  "&.Mui-disabled": { background: "#E0E0E0" },
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const registered = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) { setError("Enter your email or mobile number"); return; }
    if (!password)        { setError("Enter your password"); return; }

    setError("");
    setLoading(true);
    try {
      const data = await authService.login({ username: username.trim(), password });
      const user = { ...data.user, role: data.user.role.toLowerCase() };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(roleRoute(user.role), { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
            Welcome back!
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Sign in with your email or mobile number
          </Typography>

          {registered && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Account created! Please sign in.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Email or Mobile Number"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                disabled={loading}
                autoComplete="username"
                placeholder="email@example.com or 10-digit mobile"
                inputProps={{ inputMode: "email" }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                disabled={loading}
                autoComplete="current-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          size="small"
                          tabIndex={-1}
                        >
                          {showPassword
                            ? <VisibilityOffRoundedIcon fontSize="small" />
                            : <VisibilityRoundedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box sx={{ textAlign: "right", mt: -1 }}>
                <Button
                  component={Link}
                  to="/forgot-password"
                  variant="text"
                  size="small"
                  sx={{
                    textTransform: "none",
                    color: brand.orange,
                    fontWeight: 600,
                    p: 0,
                    minWidth: 0,
                    fontSize: "0.82rem",
                  }}
                >
                  Forgot password?
                </Button>
              </Box>

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
                  : "Sign In"}
              </Button>

              <Typography
                variant="body2"
                sx={{ textAlign: "center", color: "text.secondary" }}
              >
                Don't have an account?{" "}
                <Box
                  component={Link}
                  to="/register"
                  sx={{ color: brand.orange, fontWeight: 700, textDecoration: "none" }}
                >
                  Register
                </Box>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
