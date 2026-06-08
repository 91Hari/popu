import { useState, useEffect, useCallback } from "react";
import { useCustomerGeo } from "../../utils/geoUtils";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Toolbar, Typography, InputBase, IconButton,
  Grid, CircularProgress, Alert, Pagination, Select, MenuItem,
  FormControl, Stack,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import { brand } from "../../theme";
import TopNav from "../../components/TopNav";
import CatererCard from "../../components/CatererCard";
import catererService from "../../services/catererService";

const LOCATIONS = ["All", "Hyderabad", "Bangalore", "Chennai", "Mumbai", "Delhi", "Pune"];

export default function CateringPage() {
  const navigate      = useNavigate();
  const customerCoords = useCustomerGeo();
  const [caterers, setCaterers]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [location, setLocation]   = useState("");
  const [inputVal, setInputVal]   = useState("");

  const LIMIT = 12;

  const fetchCaterers = useCallback(async (s, loc, pg) => {
    setLoading(true);
    setError("");
    try {
      const data = await catererService.getCaterers({
        search:   s   || undefined,
        location: loc || undefined,
        page:     pg,
        limit:    LIMIT,
      });
      setCaterers(data.caterers || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err?.message || "Failed to load caterers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCaterers(search, location, page); }, [fetchCaterers, search, location, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(inputVal.trim());
  };

  const handleLocation = (e) => {
    const val = e.target.value === "All" ? "" : e.target.value;
    setLocation(val);
    setPage(1);
  };

  const pageCount = Math.ceil(total / LIMIT);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: brand.bg }}>
      <TopNav />
      <Toolbar />

      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
          <IconButton size="small" onClick={() => navigate("/services")} sx={{ color: brand.muted }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <RestaurantRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>Catering</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {total} caterer{total !== 1 ? "s" : ""} available
            </Typography>
          </Box>
        </Stack>

        {/* Filters */}
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ mb: 3 }}>
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              flex: 1, display: "flex", alignItems: "center", gap: 1,
              backgroundColor: brand.white, border: `1px solid ${brand.border}`,
              borderRadius: 6, px: 2,
              "&:focus-within": { borderColor: brand.orange },
            }}
          >
            <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <InputBase
              fullWidth
              placeholder="Search caterer name…"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              sx={{ py: 1.1, fontSize: "0.9rem" }}
            />
            <IconButton type="submit" size="small" sx={{ color: brand.orange }}>
              <SearchRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              displayEmpty
              value={location || "All"}
              onChange={handleLocation}
              sx={{ borderRadius: 6, backgroundColor: brand.white, fontSize: "0.9rem" }}
            >
              {LOCATIONS.map((l) => (
                <MenuItem key={l} value={l}>{l === "All" ? "All Locations" : l}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : caterers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <RestaurantRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No caterers found</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Try a different search or location</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {caterers.map((c) => (
                <Grid item key={c.id} xs={12} sm={6} md={4} lg={3}>
                  <CatererCard caterer={c} onClick={() => navigate(`/services/catering/${c.id}`)} customerCoords={customerCoords} />
                </Grid>
              ))}
            </Grid>

            {pageCount > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  sx={{ "& .MuiPaginationItem-root.Mui-selected": { backgroundColor: brand.orange, color: "white" } }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
