import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container, Box, Card, CardContent, Typography,
  TextField, Button, Stack, Switch, FormControlLabel,
  CircularProgress, Alert, useTheme, useMediaQuery, InputAdornment,
  ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import SaveRoundedIcon              from "@mui/icons-material/SaveRounded";
import TimerRoundedIcon             from "@mui/icons-material/TimerRounded";
import DeleteOutlineRoundedIcon     from "@mui/icons-material/DeleteOutlineRounded";
import foodService from "../../services/foodService";
import AppLayout   from "../../components/AppLayout";
import { brand }   from "../../theme";

export default function EditFoodPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down("sm"));

  const [name,          setName]         = useState("");
  const [description,   setDescription]  = useState("");
  const [price,         setPrice]        = useState("");
  const [prepTime,      setPrepTime]     = useState("20");
  const [available,     setAvailable]    = useState(true);
  const [foodCategory,  setFoodCategory] = useState("VEG");
  const [servesCount,   setServesCount]  = useState(1);
  const [imagePreview,  setImagePreview] = useState(null); // null = no image
  const [fetching,      setFetching]     = useState(true);
  const [loading,       setLoading]      = useState(false);
  const [error,         setError]        = useState("");
  const [success,       setSuccess]      = useState("");

  useEffect(() => {
    foodService.getFoodById(id)
      .then((food) => {
        setName(food.food_name        || "");
        setDescription(food.description || "");
        setPrice(String(food.price    ?? ""));
        setPrepTime(String(food.preparation_time_minutes ?? 20));
        setAvailable(!!food.is_available);
        setFoodCategory(food.food_category || "VEG");
        setServesCount(food.serves_count != null ? Number(food.serves_count) : 1);
        setImagePreview(food.imageUrl || null);
      })
      .catch(() => setError("Failed to load food item."))
      .finally(() => setFetching(false));
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        setImagePreview(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!name.trim()) return "Food name is required";
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return "Enter a valid positive price";
    const pt = parseInt(prepTime, 10);
    if (isNaN(pt) || pt < 1 || pt > 180) return "Preparation time must be between 1 and 180 minutes";
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) { setError(v); return; }

    setLoading(true);
    try {
      await foodService.updateFood(id, {
        food_name:                name.trim(),
        description:              description.trim(),
        price:                    Number(price),
        is_available:             !!available,
        food_category:            foodCategory,
        serves_count:             servesCount,
        preparation_time_minutes: parseInt(prepTime, 10),
        image_url:                imagePreview ?? null,
      });
      setSuccess("Food updated successfully.");
      setTimeout(() => navigate("/caterer/foods"), 900);
    } catch (err) {
      setError(err?.message || "Failed to update food. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: brand.orange }} />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ py: isMobile ? 2 : 4 }}>
        <Card elevation={0} sx={{ border: `1px solid ${brand.border}` }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: brand.orange, mb: 0.5 }}>
              Edit Food Item
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Update the details for this menu item.
            </Typography>

            {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSave} noValidate>
              <Stack spacing={2.5}>
                <TextField
                  label="Food Name" value={name} onChange={(e) => setName(e.target.value)}
                  fullWidth required autoComplete="off"
                />

                <TextField
                  label="Description" value={description} onChange={(e) => setDescription(e.target.value)}
                  fullWidth multiline rows={3} autoComplete="off"
                />

                {/* Food Category */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                    Food Category *
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    value={foodCategory}
                    onChange={(_, v) => v && setFoodCategory(v)}
                    size="small"
                  >
                    <ToggleButton value="VEG" sx={{
                      px: 3, fontWeight: 700, textTransform: "none",
                      "&.Mui-selected": { backgroundColor: "#E8F5E9", color: "#2E7D32", borderColor: "#4CAF50" },
                    }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#4CAF50", border: "1.5px solid #2E7D32", mr: 0.75 }} />
                      Veg
                    </ToggleButton>
                    <ToggleButton value="NON_VEG" sx={{
                      px: 3, fontWeight: 700, textTransform: "none",
                      "&.Mui-selected": { backgroundColor: "#FFEBEE", color: "#B71C1C", borderColor: "#E53935" },
                    }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "2px", backgroundColor: "#E53935", border: "1.5px solid #B71C1C", mr: 0.75 }} />
                      Non-Veg
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <TextField
                  label="Serves (Number of Persons)"
                  value={servesCount}
                  onChange={(e) => {
                    const v = Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1));
                    setServesCount(v);
                  }}
                  fullWidth inputMode="numeric" autoComplete="off" type="number"
                  helperText="How many persons this item serves (1–100)"
                  slotProps={{ htmlInput: { min: 1, max: 100 } }}
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)}
                    fullWidth required inputMode="decimal" autoComplete="off"
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                  <TextField
                    label="Prep Time" value={prepTime} onChange={(e) => setPrepTime(e.target.value)}
                    fullWidth required inputMode="numeric" autoComplete="off"
                    helperText="Minutes to prepare"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><TimerRoundedIcon sx={{ fontSize: 18, color: brand.orange }} /></InputAdornment>,
                      endAdornment:   <InputAdornment position="end">min</InputAdornment>,
                    }}
                  />
                </Stack>

                {/* Image section */}
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                    Food Image
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                    {/* Preview */}
                    <Box sx={{
                      width: 96, height: 64, borderRadius: 1.5, overflow: "hidden",
                      border: `1px solid ${brand.border}`, flexShrink: 0,
                      backgroundColor: brand.orangeLight,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {imagePreview
                        ? <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <AddPhotoAlternateRoundedIcon sx={{ color: brand.orange, opacity: 0.5 }} />
                      }
                    </Box>

                    <Button variant="outlined" component="label"
                      startIcon={<AddPhotoAlternateRoundedIcon />}
                      sx={{ borderColor: brand.border, color: brand.text }}
                    >
                      {imagePreview ? "Change Image" : "Upload Image"}
                      <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                    </Button>

                    {imagePreview && (
                      <Button variant="text" color="error" size="small"
                        startIcon={<DeleteOutlineRoundedIcon />}
                        onClick={() => setImagePreview(null)}
                      >
                        Remove
                      </Button>
                    )}
                  </Stack>
                </Box>

                <FormControlLabel
                  control={<Switch checked={available} onChange={(e) => setAvailable(e.target.checked)} color="primary" />}
                  label={available ? "Available" : "Unavailable"}
                />

                <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                  <Button
                    type="submit" variant="contained" disabled={loading}
                    startIcon={loading ? null : <SaveRoundedIcon />}
                    sx={{ background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`, fontWeight: 700, px: 3 }}
                  >
                    {loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Save Changes"}
                  </Button>
                  <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderColor: brand.border }}>
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </AppLayout>
  );
}
