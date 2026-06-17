import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, Grid,
  Card, CardContent, CardMedia, CardActions,
  IconButton, Stack, Chip, Switch, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Snackbar, Alert,
} from "@mui/material";
import EditRoundedIcon             from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon           from "@mui/icons-material/DeleteRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DinnerDiningRoundedIcon     from "@mui/icons-material/DinnerDiningRounded";
import foodService            from "../../services/foodService";
import { StarDisplay }        from "../../components/StarRating";
import AppLayout              from "../../components/AppLayout";
import { brand }              from "../../theme";

export default function FoodListPage() {
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deleteId,   setDeleteId]   = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toggling,   setToggling]   = useState({});
  const [snack,      setSnack]      = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const data = await foodService.getFoods();
        const mine = user.id ? (data || []).filter((f) => f.caterer_id === user.id) : (data || []);
        setRows(mine.map((f) => ({
          id:            f.id,
          name:          f.food_name || "",
          price:         Number(f.price ?? 0),
          available:     !!f.is_available,
          food_category: f.food_category || "VEG",
          imageUrl:      f.imageUrl || f.image_url || null,
          avg_rating:    f.avg_rating != null ? Number(f.avg_rating) : null,
          review_count:  f.review_count != null ? Number(f.review_count) : 0,
        })));
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const confirmDelete = (id) => { setDeleteId(id); setDialogOpen(true); };

  const handleDelete = async () => {
    const id = deleteId;
    setDialogOpen(false);
    if (!id) return;
    try {
      await foodService.deleteFood(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      setSnack({ open: true, message: "Food item deleted.", severity: "success" });
    } catch {
      setSnack({ open: true, message: "Failed to delete item.", severity: "error" });
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggle = async (id, name, currentAvailable) => {
    setToggling((t) => ({ ...t, [id]: true }));
    try {
      await foodService.patchAvailability(id, currentAvailable ? "UNAVAILABLE" : "AVAILABLE");
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, available: !currentAvailable } : r));
      setSnack({
        open: true,
        message: currentAvailable ? `${name} marked as unavailable.` : `${name} is now available.`,
        severity: "success",
      });
    } catch {
      setSnack({ open: true, message: "Failed to update availability.", severity: "error" });
    } finally {
      setToggling((t) => { const n = { ...t }; delete n[id]; return n; });
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: brand.orange }}>My Foods</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {rows.length} item{rows.length !== 1 ? "s" : ""} in your menu
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={() => navigate("/caterer/add-food")}
            sx={{ background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`, fontWeight: 700 }}
          >
            Add Food
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{
            textAlign: "center", py: 8,
            border: `1px dashed ${brand.border}`, borderRadius: 3,
          }}>
            <DinnerDiningRoundedIcon sx={{ fontSize: 56, color: brand.orange, opacity: 0.3, mb: 1.5 }} />
            <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600 }}>No food items yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5 }}>Add your first item to start receiving orders</Typography>
            <Button variant="contained" onClick={() => navigate("/caterer/add-food")}
              sx={{ background: `linear-gradient(135deg, ${brand.orange}, ${brand.orangeMid})`, fontWeight: 700 }}>
              Add Food
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {rows.map((r) => (
              <Grid item xs={12} sm={6} md={4} key={r.id}>
                <Card elevation={0} sx={{
                  border: `1px solid ${brand.border}`, borderRadius: 2.5,
                  height: "100%", display: "flex", flexDirection: "column",
                  opacity: r.available ? 1 : 0.75,
                }}>
                  {/* Image */}
                  {r.imageUrl ? (
                    <CardMedia
                      component="img"
                      image={r.imageUrl}
                      alt={r.name}
                      sx={{ height: 160, objectFit: "cover" }}
                    />
                  ) : (
                    <Box sx={{
                      height: 160, display: "flex", alignItems: "center", justifyContent: "center",
                      background: `linear-gradient(135deg, ${brand.orangeLight}, #A5D6A7)`,
                    }}>
                      <DinnerDiningRoundedIcon sx={{ fontSize: 56, color: brand.orange, opacity: 0.5 }} />
                    </Box>
                  )}

                  <CardContent sx={{ flex: 1, pb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.25, lineHeight: 1.3 }}>
                      {r.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                      <Box sx={{
                        width: 9, height: 9,
                        borderRadius: r.food_category === "VEG" ? "50%" : "2px",
                        backgroundColor: r.food_category === "VEG" ? "#4CAF50" : "#E53935",
                        border: `1.5px solid ${r.food_category === "VEG" ? "#2E7D32" : "#B71C1C"}`,
                        flexShrink: 0,
                      }} />
                      <Typography variant="caption" sx={{
                        fontWeight: 700, fontSize: "0.6rem",
                        color: r.food_category === "VEG" ? "#2E7D32" : "#B71C1C",
                      }}>
                        {r.food_category === "VEG" ? "Veg" : "Non-Veg"}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: brand.orange, mb: 0.5 }}>
                      ₹{r.price}
                    </Typography>
                    <StarDisplay rating={r.avg_rating} count={r.review_count || null} size={14} />
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 1.5, pt: 0, justifyContent: "space-between", alignItems: "center" }}>
                    {/* Availability toggle */}
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      {toggling[r.id] ? (
                        <CircularProgress size={16} sx={{ color: brand.orange }} />
                      ) : (
                        <Switch
                          size="small"
                          checked={r.available}
                          onChange={() => handleToggle(r.id, r.name, r.available)}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": { color: brand.green },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: brand.green },
                          }}
                        />
                      )}
                      <Chip
                        label={r.available ? "Available" : "Off"}
                        size="small"
                        sx={{
                          fontWeight: 700, fontSize: "0.62rem",
                          backgroundColor: r.available ? brand.greenLight : "#FFEBEE",
                          color: r.available ? brand.green : "#C62828",
                        }}
                      />
                    </Stack>

                    {/* Edit / Delete */}
                    <Stack direction="row" spacing={0.25}>
                      <IconButton size="small" onClick={() => navigate(`/caterer/edit-food/${r.id}`)}
                        sx={{ color: brand.orange }}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => confirmDelete(r.id)}
                        sx={{ color: "#D32F2F" }}>
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Delete confirmation */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle sx={{ fontWeight: 700 }}>Delete Food Item</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this food item? This cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>

      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity} variant="filled" sx={{ fontWeight: 600 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
