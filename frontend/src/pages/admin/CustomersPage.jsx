import { useEffect, useState, useCallback } from "react";
import {
  Container, Box, Typography, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Paper, Chip, Button, CircularProgress, Alert, Stack,
} from "@mui/material";
import SearchRoundedIcon  from "@mui/icons-material/SearchRounded";
import PeopleRoundedIcon  from "@mui/icons-material/PeopleRounded";
import AppLayout          from "../../components/AppLayout";
import adminService       from "../../services/adminService";
import { brand }          from "../../theme";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [busy, setBusy]           = useState({});

  const load = useCallback(async (q) => {
    setLoading(true);
    try {
      const data = await adminService.getCustomers({ search: q, limit: 50 });
      setCustomers(data.customers || []);
      setTotal(data.total || 0);
    } catch { setError("Failed to load customers."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(""); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const toggleStatus = async (id, currentActive) => {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const updated = await adminService.setCustomerStatus(id, !currentActive);
      setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, is_active: updated.is_active } : c));
    } catch { setError("Failed to update status."); }
    finally { setBusy((b) => { const n = { ...b }; delete n[id]; return n; }); }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <PeopleRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Customers</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{total} total</Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2, maxWidth: 400 }}>
          <TextField
            fullWidth size="small" placeholder="Search by name or email…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${brand.border}`, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{c.email}</TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                      {new Date(c.created_at).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={c.is_active ? "Active" : "Inactive"}
                        color={c.is_active ? "success" : "default"} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined"
                        color={c.is_active ? "error" : "success"}
                        disabled={!!busy[c.id]}
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
