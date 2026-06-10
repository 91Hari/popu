import { Box, Typography, Stack, Divider, Skeleton } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PauseCircleRoundedIcon from "@mui/icons-material/PauseCircleRounded";
import { brand } from "../theme";

function StatBox({ label, value, color, loading }) {
  return (
    <Box sx={{ textAlign: "center", flex: 1 }}>
      {loading
        ? <Skeleton width={48} height={36} sx={{ mx: "auto" }} />
        : <Typography variant="h4" sx={{ fontWeight: 900, color: color || brand.orange, lineHeight: 1 }}>
            {value}
          </Typography>
      }
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function WelcomeCard({ catererName, availabilityStatus, stats, loading }) {
  const isReady = availabilityStatus === "READY";

  return (
    <Box
      sx={{
        borderRadius: 3,
        background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
        color: "white",
        p: { xs: 2.5, md: 3 },
        mb: 3,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <Box sx={{
        position: "absolute", right: -24, top: -24,
        width: 140, height: 140, borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.1)",
      }} />

      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600, letterSpacing: 1 }}>
            WELCOME BACK
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.2, mt: 0.25 }}>
            {catererName || "Your Kitchen"}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex", alignItems: "center", gap: 0.75,
            backgroundColor: isReady ? "rgba(46,125,50,0.85)" : "rgba(0,0,0,0.25)",
            borderRadius: 6, px: 1.5, py: 0.5,
          }}
        >
          {isReady
            ? <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
            : <PauseCircleRoundedIcon sx={{ fontSize: 14 }} />
          }
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.7rem" }}>
            {isReady ? "READY FOR ORDERS" : "NOT READY"}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.25)", mb: 2 }} />

      <Stack direction="row" divider={<Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.25)" }} />} spacing={1}>
        <StatBox label="Today's Orders" value={loading ? "—" : (stats?.todayOrders ?? 0)} color="white" loading={loading} />
        <StatBox label="Food Items"     value={loading ? "—" : (stats?.totalFoods  ?? 0)} color="white" loading={loading} />
        <StatBox label="Pending"        value={loading ? "—" : (stats?.pendingOrders ?? 0)} color={stats?.pendingOrders > 0 ? brand.gold : "white"} loading={loading} />
      </Stack>
    </Box>
  );
}
