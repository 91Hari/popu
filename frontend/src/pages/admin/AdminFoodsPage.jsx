import { useEffect, useState, useCallback } from "react";
import {
  Container, Box, Typography, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Paper, Chip, Button, CircularProgress, Alert, Stack,
} from "@mui/material";
import SearchRoundedIcon         from "@mui/icons-material/SearchRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import StarRoundedIcon           from "@mui/icons-material/StarRounded";
import AppLayout    from "../../components/AppLayout";
import adminService from "../../services/adminService";
import { brand }    from "../../theme";

export default function AdminFoodsPage() {
  const [foods, setFoods]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState("");
  const [busy, setBusy]     = useState({});

  const load = useCallback(async (q) => {
    setLoad(true);
    try {
      const data = await adminService.getFoods({ search: q, limit: 50 });
      setFoods(data.foods || []);
      setTotal(data.total || 0);
    } catch { setError("Failed to load foods."); }
    finally { setLoad(false); }
  }, []);

  useEffect(() => { load(""); }, [load]);
  const handleSearch = (e) => { e.preventDefault(); load(search); };

  const toggleStatus = async (id, current) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const updated = await adminService.setFoodStatus(id, !current);
      setFoods((prev) => prev.map((f) => f.id === id ? { ...f, is_available: updated.is_available } : f));
    } catch { setError("Failed to update."); }
    finally { setBusy((b) => { const n = { ...b }; delete n[id]; return n; }); }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <RestaurantMenuRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Food Catalog</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{total} items</Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2, maxWidth: 400 }}>
          <TextField fullWidth size="small" placeholder="Search foods…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment> } }} />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress sx={{ color: brand.orange }} /></Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: brand.orange }}>
                  <TableCell sx={{ fontWeight: 700, color: "#fff" }}>Food Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#fff" }}>Caterer</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#fff" }}>Category</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#fff" }}>Serves</TableCell>
                  <TableCell align="right"  sx={{ fontWeight: 700, color: "#fff" }}>Price</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#fff" }}>Rating</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#fff" }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#fff" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {foods.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{f.food_name}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{f.caterer_name}</TableCell>
                    <TableCell>
                      {f.food_category ? (
                        <Chip
                          label={f.food_category === "VEG" ? "🟢 Veg" : "🔴 Non-Veg"}
                          size="small"
                          sx={{
                            fontWeight: 700, fontSize: "0.7rem",
                            backgroundColor: f.food_category === "VEG" ? "#E8F5E9" : "#FFEBEE",
                            color:           f.food_category === "VEG" ? "#2E7D32" : "#B71C1C",
                          }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ color: "text.disabled" }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                      {f.serves_count != null ? `${f.serves_count} ${f.serves_count === 1 ? "Person" : "Persons"}` : "—"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: brand.orange }}>₹{f.price}</TableCell>
                    <TableCell align="center">
                      {f.avg_rating != null ? (
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.4}>
                          <StarRoundedIcon sx={{ fontSize: 15, color: brand.star ?? "#F4B400" }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1 }}>
                            {Number(f.avg_rating).toFixed(1)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            ({f.review_count})
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="caption" sx={{ color: "text.disabled" }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={f.is_available ? "Available" : "Disabled"}
                        color={f.is_available ? "success" : "default"} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined"
                        color={f.is_available ? "error" : "success"} disabled={!!busy[f.id]}
                        onClick={() => toggleStatus(f.id, f.is_available)}
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        {busy[f.id] ? <CircularProgress size={14} /> : (f.is_available ? "Disable" : "Enable")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </AppLayout>
  );
}
