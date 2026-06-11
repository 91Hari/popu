import { Box, Typography } from "@mui/material";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import { brand } from "../theme";

export default function EmptyState({
  icon,
  title = "0 Results Found",
  message = "No food items match your search.",
  hint = "Try another food name, caterer, location, or price range.",
  sx = {},
}) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 8,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        ...sx,
      }}
    >
      {icon || (
        <SearchOffRoundedIcon sx={{ fontSize: 64, color: brand.border, mb: 0.5 }} />
      )}
      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 360 }}>
          {message}
        </Typography>
      )}
      {hint && (
        <Typography variant="caption" sx={{ color: brand.muted, maxWidth: 360, display: "block" }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}
