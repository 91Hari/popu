import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  Chip,
  Switch,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import foodService from "../../services/foodService";
import AppLayout from "../../components/AppLayout";
import { brand } from "../../theme";

export default function FoodListPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toggling, setToggling] = useState({});
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const data = await foodService.getFoods();
        const mine = user.id ? (data || []).filter((f) => f.caterer_id === user.id) : (data || []);
        const mapped = mine.map((f) => ({
          id: f.id,
          name: f.food_name || "",
          price: Number(f.price ?? 0),
          available: !!f.is_available,
          raw: f,
        }));
        setRows(mapped);
      } catch (err) {
        console.error("Failed to load foods:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  const handleEdit = (id) => navigate(`/caterer/edit-food/${id}`);

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    const id = deleteId;
    setDialogOpen(false);
    if (!id) return;

    try {
      if (foodService && typeof foodService.deleteFood === "function") {
        await foodService.deleteFood(id);
        setRows((prev) => prev.filter((r) => r.id !== id));
      } else {
        await fetch(
          (import.meta.env.VITE_API_URL || "http://localhost:3000/api") + `/foods/${id}`,
          { method: "DELETE" },
        );
        setRows((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggle = async (id, name, currentAvailable) => {
    setToggling((t) => ({ ...t, [id]: true }));
    const newStatus = currentAvailable ? "UNAVAILABLE" : "AVAILABLE";
    try {
      await foodService.patchAvailability(id, newStatus);
      setRows((prev) =>
        prev.map((r) => r.id === id ? { ...r, available: !currentAvailable } : r)
      );
      const msg = currentAvailable
        ? `${name} marked as unavailable.`
        : `${name} is now available.`;
      setSnack({ open: true, message: msg, severity: "success" });
    } catch (err) {
      console.error("Toggle failed:", err);
      setSnack({ open: true, message: "Failed to update availability. Please try again.", severity: "error" });
    } finally {
      setToggling((t) => { const n = { ...t }; delete n[id]; return n; });
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 800, color: brand.orange }}>
              My Foods
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {rows.length} item{rows.length !== 1 ? "s" : ""} in your menu
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddCircleOutlineRoundedIcon />}
            sx={{
              background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
              fontWeight: 700,
            }}
            onClick={() => navigate("/caterer/add-food")}
          >
            {isMobile ? "Add" : "Add Food"}
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Food Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Price (₹)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Availability</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    Loading…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No food items yet. Add your first item.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                    <TableCell align="right">₹{r.price}</TableCell>

                    {/* Availability column: chip + toggle */}
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                        <Chip
                          label={r.available ? "AVAILABLE" : "UNAVAILABLE"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            backgroundColor: r.available ? brand.greenLight : "#FFEBEE",
                            color: r.available ? brand.green : "#C62828",
                          }}
                        />
                        {toggling[r.id] ? (
                          <CircularProgress size={16} sx={{ color: brand.orange }} />
                        ) : (
                          <Switch
                            size="small"
                            checked={r.available}
                            onChange={() => handleToggle(r.id, r.name, r.available)}
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": { color: brand.green },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                backgroundColor: brand.green,
                              },
                            }}
                          />
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(r.id)}
                          sx={{ color: brand.orange }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => confirmDelete(r.id)}
                          sx={{ color: "#D32F2F" }}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle sx={{ fontWeight: 700 }}>Delete Food Item</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this food item? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ fontWeight: 600 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
