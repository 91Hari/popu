import { useEffect, useState, useCallback } from "react";
import {
  Container, Box, Typography, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Paper, Chip, Button, CircularProgress, Alert,
} from "@mui/material";
import SearchRoundedIcon     from "@mui/icons-material/SearchRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import AppLayout    from "../../components/AppLayout";
import adminService from "../../services/adminService";
import { brand }    from "../../theme";

export default function CaterersPage() {
  const [caterers, setCaterers] = useState([]);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [busy, setBusy]         = useState({});

  const load = useCallback(async (q) => {
    setLoading(true);
    try {
      const data = await adminService.getCaterers({ search: q, limit: 50 });
      setCaterers(data.caterers || []);
      setTotal(data.total || 0);
    } catch { setError("Failed to load caterers."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(""); }, [load]);

  const handleSearch = (e) => { e.preventDefault(); load(search); };

  const toggleStatus = async (id, currentActive) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const updated = await adminService.setCatererStatus(id, !currentActive);
      setCaterers((prev) => prev.map((c) => c.id === id ? { ...c, is_active: updated.is_active } : c));
    } catch { setError("Failed to update status."); }
    finally { setBusy((b) => { const n = { ...b }; delete n[id]; return n; }); }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <StorefrontRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Caterers</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{total} total</Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2, maxWidth: 400 }}>
          <TextField fullWidth size="small" placeholder="Search caterers…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment> }} />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: brand.orangeLight }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Business</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Availability</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {caterers.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{c.business_name || "—"}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{c.location || "—"}</TableCell>
                    <TableCell align="center">
                      <Chip label={c.availability_status || "READY"}
                        size="small" sx={{ fontWeight: 700, fontSize: "0.7rem",
                          backgroundColor: c.availability_status === "NOT_READY" ? "#9e9e9e" : brand.green, color: "white" }} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={c.is_active ? "Active" : "Inactive"}
                        color={c.is_active ? "success" : "default"} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined"
                        color={c.is_active ? "error" : "success"} disabled={!!busy[c.id]}
                        onClick={() => toggleStatus(c.id, c.is_active)}
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        {busy[c.id] ? <CircularProgress size={14} /> : (c.is_active ? "Deactivate" : "Activate")}
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
