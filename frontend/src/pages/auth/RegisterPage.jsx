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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import authService from "../../services/authService";
import Logo from "../../components/Logo";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!role) {
      newErrors.role = "Please select a role";
    }

    return newErrors;
  };

  // Handle registration submission
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
      await authService.register({ name, email, password, role });
      navigate("/auth/login");
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
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
              <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
                <Logo size={44} showTagline />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: isMobile ? "0.875rem" : "1rem",
                }}
              >
                Create Your Account
              </Typography>
            </Box>

            {/* Error Alert */}
            {apiError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {apiError}
              </Alert>
            )}

            {/* Register Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                {/* Name Field */}
                <TextField
                  fullWidth
                  id="name"
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="John Doe"
                  variant="outlined"
                  disabled={loading}
                  autoComplete="name"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />

                {/* Email Field */}
                <TextField
                  fullWidth
                  id="email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  error={!!errors.password}
                  helperText={errors.password}
                  placeholder="••••••••"
                  variant="outlined"
                  disabled={loading}
                  autoComplete="new-password"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />

                {/* Confirm Password Field */}
                <TextField
                  fullWidth
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: "" });
                  }}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  placeholder="••••••••"
                  variant="outlined"
                  disabled={loading}
                  autoComplete="new-password"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />

                {/* Role Select */}
                <FormControl fullWidth error={!!errors.role} disabled={loading}>
                  <InputLabel id="role-label">Select Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    value={role}
                    label="Select Role"
                    onChange={(e) => {
                      setRole(e.target.value);
                      if (errors.role) setErrors({ ...errors, role: "" });
                    }}
                    sx={{
                      borderRadius: 1,
                    }}
                  >
                    <MenuItem value="customer">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        🛒 Customer
                      </Box>
                    </MenuItem>
                    <MenuItem value="caterer">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        👨‍🍳 Caterer
                      </Box>
                    </MenuItem>
                  </Select>
                  {errors.role && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#d32f2f", mt: 0.5 }}
                    >
                      {errors.role}
                    </Typography>
                  )}
                </FormControl>

                {/* Role Description */}
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    <strong>Customer:</strong> Browse and order food from
                    caterers
                    <br />
                    <strong>Caterer:</strong> Add and manage food offerings
                  </Typography>
                </Box>

                {/* Register Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    mt: 2,
                    background:
                      "linear-gradient(135deg, #E8751A 0%, #F5A05A 100%)",
                    textTransform: "none",
                    fontSize: isMobile ? "0.95rem" : "1rem",
                    fontWeight: 600,
                    py: isMobile ? 1.2 : 1.5,
                    borderRadius: 1,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #D2680F 0%, #D2680F 100%)",
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
                      Creating Account...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>

                {/* Back to Login Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  size={isMobile ? "medium" : "large"}
                  component={Link}
                  to="/auth/login"
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    fontSize: isMobile ? "0.95rem" : "1rem",
                    fontWeight: 600,
                    py: isMobile ? 1.2 : 1.5,
                    borderRadius: 1,
                    borderColor: "#E8751A",
                    color: "#E8751A",
                    "&:hover": {
                      backgroundColor: "rgba(47, 168, 79, 0.1)",
                      borderColor: "#E8751A",
                    },
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
