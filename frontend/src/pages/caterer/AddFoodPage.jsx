import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Toolbar,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import foodService from "../../services/foodService";
import TopNav from "../../components/TopNav";
import { brand } from "../../theme";

export default function AddFoodPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!name.trim()) return "Food name is required";
    if (!price || Number.isNaN(Number(price)) || Number(price) <= 0)
      return "Enter a valid positive price";
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        available: !!available,
      };

      if (foodService && typeof foodService.createFood === "function") {
        await foodService.createFood(payload, imageFile);
      } else {
        const form = new FormData();
        form.append("name", payload.name);
        form.append("description", payload.description);
        form.append("price", String(payload.price));
        form.append("available", String(payload.available));
        if (imageFile) form.append("image", imageFile);

        await fetch(
          (import.meta.env.VITE_API_URL || "http://localhost:3000/api") + "/foods",
          { method: "POST", body: form },
        );
      }

      setSuccess("Food saved successfully.");
      setTimeout(() => navigate("/caterer/foods"), 900);
    } catch (err) {
      console.error("Save food failed:", err);
      setError(err?.message || "Failed to save food. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: brand.bg }}>
      <TopNav />
      <Toolbar />

      <Container maxWidth="sm" sx={{ py: isMobile ? 2 : 4 }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2, color: brand.muted }}
        >
          Back
        </Button>

        <Card elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: brand.orange, mb: 0.5 }}>
              Add New Food
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Add a new food item to your menu. Provide an image (optional) and set availability.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSave} noValidate>
              <Stack spacing={2.5}>
                <TextField
                  label="Food Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                  autoComplete="off"
                />

                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  autoComplete="off"
                />

                <TextField
                  label="Price (₹)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  fullWidth
                  required
                  inputMode="decimal"
                  autoComplete="off"
                />

                <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddPhotoAlternateRoundedIcon />}
                    sx={{ borderColor: brand.border, color: brand.text }}
                  >
                    Upload Image
                    <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                  </Button>

                  {imagePreview ? (
                    <Box
                      sx={{
                        width: 96,
                        height: 64,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        border: `1px solid ${brand.border}`,
                      }}
                    >
                      <img
                        src={imagePreview}
                        alt="preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: 96,
                        height: 64,
                        borderRadius: 1.5,
                        backgroundColor: brand.orangeLight,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AddPhotoAlternateRoundedIcon sx={{ color: brand.orange, opacity: 0.5 }} />
                    </Box>
                  )}

                  <FormControlLabel
                    control={
                      <Switch
                        checked={available}
                        onChange={(e) => setAvailable(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={available ? "Available" : "Unavailable"}
                  />
                </Stack>

                <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? null : <SaveRoundedIcon />}
                    sx={{
                      background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
                      fontWeight: 700,
                      px: 3,
                    }}
                  >
                    {loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Save Food"}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    sx={{ borderColor: brand.border }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
