import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, InputBase, Paper, List, ListItemButton, ListItemText,
  ListItemIcon, Typography, CircularProgress, Divider,
} from "@mui/material";
import SearchRoundedIcon        from "@mui/icons-material/SearchRounded";
import DiningIcon   from "@mui/icons-material/Dining";
import StorefrontRoundedIcon    from "@mui/icons-material/StorefrontRounded";
import { brand } from "../theme";
import api from "../services/api";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchSuggestions({ placeholder = "Search food, caterers…", onSearch, fullWidth = false }) {
  const [query, setQuery]           = useState("");
  const [suggestions, setSuggestions] = useState({ foods: [], caterers: [] });
  const [open, setOpen]             = useState(false);
  const [fetching, setFetching]     = useState(false);
  const navigate                    = useNavigate();
  const containerRef                = useRef(null);
  const debouncedQuery              = useDebounce(query, 250);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.trim().length < 1) {
      setSuggestions({ foods: [], caterers: [] });
      setOpen(false);
      return;
    }
    setFetching(true);
    try {
      const data = await api.request(`/search/suggestions?q=${encodeURIComponent(q.trim())}`);
      setSuggestions(data || { foods: [], caterers: [] });
      setOpen(true);
    } catch {
      setSuggestions({ foods: [], caterers: [] });
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchSuggestions(debouncedQuery); }, [debouncedQuery, fetchSuggestions]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item) => {
    setOpen(false);
    setQuery(item.label);
    if (item.type === "food") {
      navigate(`/services/tiffins?foodName=${encodeURIComponent(item.label)}`);
    } else {
      navigate(`/services/catering?search=${encodeURIComponent(item.label)}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    if (onSearch) onSearch(query);
    else if (query.trim()) navigate(`/customer/search?q=${encodeURIComponent(query.trim())}`);
  };

  const hasResults = suggestions.foods.length > 0 || suggestions.caterers.length > 0;

  return (
    <Box ref={containerRef} sx={{ position: "relative", width: fullWidth ? "100%" : "auto" }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex", alignItems: "center", gap: 1,
          backgroundColor: brand.white,
          border: `1.5px solid ${open ? brand.orange : brand.border}`,
          borderRadius: 6, px: 2,
          transition: "border-color 0.15s",
          "&:focus-within": { borderColor: brand.orange },
        }}
      >
        <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 20, flexShrink: 0 }} />
        <InputBase
          fullWidth
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (hasResults) setOpen(true); }}
          sx={{ py: 1.1, fontSize: "0.9rem" }}
          inputProps={{ autoComplete: "off" }}
        />
        {fetching && <CircularProgress size={16} sx={{ color: brand.orange, flexShrink: 0 }} />}
      </Box>

      {open && hasResults && (
        <Paper
          elevation={8}
          sx={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
            zIndex: 1300, borderRadius: 2, overflow: "hidden",
            border: `1px solid ${brand.border}`,
            maxHeight: 360, overflowY: "auto",
          }}
        >
          <List disablePadding>
            {suggestions.foods.length > 0 && (
              <>
                <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: brand.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Food Items
                  </Typography>
                </Box>
                {suggestions.foods.map((item) => (
                  <ListItemButton key={item.id} onClick={() => handleSelect(item)} sx={{ py: 0.75, px: 2 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <DiningIcon sx={{ fontSize: 18, color: brand.orange }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={`By ${item.caterer_name} · ₹${item.price}`}
                      primaryTypographyProps={{ fontSize: "0.88rem", fontWeight: 600 }}
                      secondaryTypographyProps={{ fontSize: "0.75rem" }}
                    />
                    {item.availability_status === "NOT_READY" && (
                      <Typography variant="caption" sx={{ color: "text.disabled", flexShrink: 0 }}>
                        Unavailable
                      </Typography>
                    )}
                  </ListItemButton>
                ))}
              </>
            )}

            {suggestions.foods.length > 0 && suggestions.caterers.length > 0 && (
              <Divider />
            )}

            {suggestions.caterers.length > 0 && (
              <>
                <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: brand.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Caterers
                  </Typography>
                </Box>
                {suggestions.caterers.map((item) => (
                  <ListItemButton key={item.id} onClick={() => handleSelect(item)} sx={{ py: 0.75, px: 2 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <StorefrontRoundedIcon sx={{ fontSize: 18, color: brand.muted }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.location || item.business_name}
                      primaryTypographyProps={{ fontSize: "0.88rem", fontWeight: 600 }}
                      secondaryTypographyProps={{ fontSize: "0.75rem" }}
                    />
                  </ListItemButton>
                ))}
              </>
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
}
