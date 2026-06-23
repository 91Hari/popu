import { useState, useEffect, useCallback, useMemo } from "react";
import { useCustomerGeo, haversineKm } from "../../utils/geoUtils";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, InputBase, IconButton,
  Grid, CircularProgress, Alert, Pagination, Stack, Chip,
} from "@mui/material";
import SearchRoundedIcon      from "@mui/icons-material/SearchRounded";
import RestaurantRoundedIcon  from "@mui/icons-material/RestaurantRounded";
import NearMeRoundedIcon      from "@mui/icons-material/NearMeRounded";
import { brand } from "../../theme";
import AppLayout from "../../components/AppLayout";
import CatererCard from "../../components/CatererCard";
import catererService from "../../services/catererService";

export default function CateringPage() {
  const navigate       = useNavigate();
  const customerCoords = useCustomerGeo();

  const [caterers, setCaterers] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [inputVal, setInputVal] = useState("");

  const LIMIT = 50; // fetch more so we can sort by distance client-side

  const fetchCaterers = useCallback(async (s, pg) => {
    setLoading(true);
    setError("");
    try {
      const data = await catererService.getCaterers({
        search: s || undefined,
        page:   pg,
        limit:  LIMIT,
      });
      setCaterers(data.caterers || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err?.message || "Failed to load caterers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCaterers(search, page); }, [fetchCaterers, search, page]);

  // Sort caterers by distance when user coords are available
  const sortedCaterers = useMemo(() => {
    if (!customerCoords || caterers.length === 0) return caterers;
    return [...caterers].sort((a, b) => {
      const distA = (a.latitude != null && a.longitude != null)
        ? haversineKm(customerCoords.lat, customerCoords.lng, Number(a.latitude), Number(a.longitude))
        : Infinity;
      const distB = (b.latitude != null && b.longitude != null)
        ? haversineKm(customerCoords.lat, customerCoords.lng, Number(b.latitude), Number(b.longitude))
        : Infinity;
      return distA - distB;
    });
  }, [caterers, customerCoords]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(inputVal.trim());
  };

  const pageCount = Math.ceil(total / LIMIT);

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
          <RestaurantRoundedIcon sx={{ color: brand.orange, fontSize: 26 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>Catering</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {total} caterer{total !== 1 ? "s" : ""} available
            </Typography>
          </Box>
          {customerCoords && (
            <Chip
              icon={<NearMeRoundedIcon sx={{ fontSize: 14 }} />}
              label="Sorted by distance"
              size="small"
              sx={{ backgroundColor: brand.greenLight, color: brand.green, fontWeight: 600, fontSize: "0.7rem" }}
            />
          )}
        </Stack>

        {/* Search only */}
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            display: "flex", alignItems: "center", gap: 1, mb: 3,
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

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: brand.orange }} />
          </Box>
        ) : sortedCaterers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <RestaurantRoundedIcon sx={{ fontSize: 56, color: brand.border, mb: 1 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>No caterers found</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Try a different search term</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {sortedCaterers.map((c) => (
                <Grid item key={c.id} xs={12} sm={6} md={4} lg={3}>
                  <CatererCard
                    caterer={c}
                    onClick={() => navigate(`/services/catering/${c.id}`)}
                    customerCoords={customerCoords}
                  />
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
    </AppLayout>
  );
}
