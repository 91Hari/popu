import { Box, Button, Chip, CircularProgress, Typography } from "@mui/material";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { brand } from "../theme";

/**
 * ApiErrorState — reusable error + retry component for failed data fetches.
 * Props:
 *   message  {string}   — error message (default: "Unable to load data. Please try again.")
 *   onRetry  {function} — called when user clicks "Try Again"
 *   loading  {boolean}  — shows spinner on the button while retrying
 *   cached   {boolean}  — shows a "Showing cached data" chip
 *   sx       {object}   — additional MUI sx overrides
 */
export default function ApiErrorState({
  message = "Unable to load data. Please try again.",
  onRetry,
  loading = false,
  cached = false,
  sx = {},
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        px: 3,
        textAlign: "center",
        ...sx,
      }}
    >
      <CloudOffRoundedIcon sx={{ fontSize: 56, color: brand.muted, mb: 2, opacity: 0.6 }} />

      <Typography variant="body1" sx={{ color: brand.muted, mb: 3, maxWidth: 320 }}>
        {message}
      </Typography>

      {cached && (
        <Chip
          label="Showing cached data"
          size="small"
          sx={{ mb: 2, fontWeight: 600, bgcolor: brand.goldLight, color: brand.text }}
        />
      )}

      {onRetry && (
        <Button
          variant="outlined"
          size="medium"
          onClick={onRetry}
          disabled={loading}
          startIcon={
            loading
              ? <CircularProgress size={16} sx={{ color: brand.orange }} />
              : <RefreshRoundedIcon />
          }
          sx={{ fontWeight: 700 }}
        >
          {loading ? "Retrying…" : "Try Again"}
        </Button>
      )}
    </Box>
  );
}
