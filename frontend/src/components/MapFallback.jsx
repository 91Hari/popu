import { Box, Button, Typography } from "@mui/material";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { brand } from "../theme";

/**
 * MapFallback — shown when Google Maps fails or is unavailable.
 * Props:
 *   catererAddress  {string}  — caterer address text
 *   customerAddress {string}  — customer address text
 *   lat             {number}  — latitude for maps link
 *   lng             {number}  — longitude for maps link
 */
export default function MapFallback({ catererAddress, customerAddress, lat, lng }) {
  function buildMapsUrl() {
    if (lat != null && lng != null) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    const query = encodeURIComponent(catererAddress || customerAddress || "");
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        borderRadius: 3,
        border: `1px solid ${brand.border}`,
        bgcolor: brand.orangeLight,
        textAlign: "center",
        gap: 1.5,
      }}
    >
      <MapRoundedIcon sx={{ fontSize: 48, color: brand.orange, opacity: 0.7 }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brand.text }}>
        Map unavailable
      </Typography>

      {catererAddress && (
        <Typography variant="body2" sx={{ color: brand.muted, maxWidth: 280 }}>
          {catererAddress}
        </Typography>
      )}

      {customerAddress && catererAddress && (
        <Typography variant="caption" sx={{ color: brand.muted }}>
          Delivery to: {customerAddress}
        </Typography>
      )}

      {!catererAddress && customerAddress && (
        <Typography variant="body2" sx={{ color: brand.muted, maxWidth: 280 }}>
          {customerAddress}
        </Typography>
      )}

      <Button
        variant="outlined"
        size="small"
        endIcon={<OpenInNewRoundedIcon fontSize="small" />}
        href={buildMapsUrl()}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ mt: 1, fontWeight: 600 }}
      >
        Open in Google Maps
      </Button>
    </Box>
  );
}
