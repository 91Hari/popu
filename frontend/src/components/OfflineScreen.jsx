import { Box, Button, Typography } from "@mui/material";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import { brand } from "../theme";
import { useNetwork } from "../contexts/NetworkContext";

/**
 * OfflineScreen — full-screen experience shown when the app cannot reach the network.
 * Props:
 *   onRetry {function} — called when user taps "Try Again"
 */
export default function OfflineScreen({ onRetry }) {
  let lastOnlineAt = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ({ lastOnlineAt } = useNetwork());
  } catch { /* graceful fallback */ }

  const isCapacitor =
    typeof window !== "undefined" &&
    window.Capacitor !== undefined &&
    window.Capacitor.getPlatform() === "android";

  function formatTime(date) {
    if (!date) return null;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 4,
        textAlign: "center",
        bgcolor: brand.bg,
      }}
    >
      <WifiOffRoundedIcon
        sx={{ fontSize: 80, color: brand.orange, mb: 3, opacity: 0.85 }}
      />

      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: brand.text }}>
        You're Offline
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: brand.muted, mb: 4, maxWidth: 300 }}
      >
        Unable to connect. Please check your connection.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={onRetry}
        sx={{ fontWeight: 700, px: 5, mb: 2 }}
      >
        Try Again
      </Button>

      {isCapacitor && (
        <Button
          variant="outlined"
          size="medium"
          onClick={() => {
            // On Android Capacitor, open device settings
            try {
              if (window.cordova?.plugins?.diagnostic) {
                window.cordova.plugins.diagnostic.switchToWifiSettings();
              } else {
                // Fallback: try deep link
                window.open("android.settings.WIFI_SETTINGS", "_system");
              }
            } catch { /* ignore */ }
          }}
          sx={{ fontWeight: 600, mb: 3 }}
        >
          Open Settings
        </Button>
      )}

      {lastOnlineAt && (
        <Typography variant="caption" sx={{ color: brand.muted, mt: 1 }}>
          Last seen online: {formatTime(lastOnlineAt)}
        </Typography>
      )}
    </Box>
  );
}
