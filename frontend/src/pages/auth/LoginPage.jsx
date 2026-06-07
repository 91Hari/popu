import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import authService from "../../services/authService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setApiError("");
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setApiError(err.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors({ ...errors, email: "" });
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) setErrors({ ...errors, password: "" });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: isMobile ? 2 : 4,
        }}
      >
        <Card
          sx={{
            width: "100%",
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: isMobile ? 3 : 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #F5A623 0%, #FFA500 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                  fontSize: isMobile ? "2rem" : "2.5rem",
                }}
              >
                PO.PU
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: isMobile ? "0.875rem" : "1rem",
                }}
              >
                Food Catering Platform
              </Typography>
            </Box>

            {/* Error Alert */}
            {apiError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {apiError}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                {/* Email Field */}
                <TextField
                  fullWidth
                  id="email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="example@email.com"
                  variant="outlined"
                  disabled={loading}
                  autoComplete="email"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />

                {/* Password Field */}
                <TextField
                  fullWidth
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  placeholder="••••••••"
                  variant="outlined"
                  disabled={loading}
                  autoComplete="current-password"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />

                {/* Login Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    mt: 2,
                    background:
                      "linear-gradient(135deg, #F5A623 0%, #FFA500 100%)",
                    textTransform: "none",
                    fontSize: isMobile ? "0.95rem" : "1rem",
                    fontWeight: 600,
                    py: isMobile ? 1.2 : 1.5,
                    borderRadius: 1,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #E89410 0%, #FF9500 100%)",
                    },
                    "&:disabled": {
                      background: "#ccc",
                    },
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress
                        size={20}
                        sx={{ mr: 1, color: "white" }}
                      />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                {/* Register Link */}
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Don't have an account?{" "}
                    <Link
                      to="/auth/register"
                      style={{
                        color: "#F5A623",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.textDecoration = "underline")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.textDecoration = "none")
                      }
                    >
                      Register here
                    </Link>
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Demo Credentials */}
            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: "1px solid #eee",
                backgroundColor: "#f9f9f9",
                p: 2,
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                Demo Credentials
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  lineHeight: 1.8,
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                }}
              >
                <strong>Customer:</strong> customer@test.com / password123
                <br />
                <strong>Caterer:</strong> caterer@test.com / password123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
