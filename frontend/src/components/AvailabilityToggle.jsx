import { useState } from "react";
import {
  Box, Typography, Switch, Chip, CircularProgress,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PauseCircleRoundedIcon from "@mui/icons-material/PauseCircleRounded";
import { brand } from "../theme";

export default function AvailabilityToggle({ status, onChange, loading }) {
  const isReady  = status === "READY";

  return (
    <Box
      sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        p: 2, borderRadius: 3,
        border: `1.5px solid ${isReady ? brand.green : brand.border}`,
        backgroundColor: isReady ? brand.greenLight : "#fafafa",
        transition: "all 0.2s",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        {isReady
          ? <CheckCircleRoundedIcon sx={{ color: brand.green, fontSize: 22 }} />
          : <PauseCircleRoundedIcon sx={{ color: brand.muted, fontSize: 22 }} />
        }
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Ready For Orders
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {isReady ? "Customers can place orders" : "Not accepting orders"}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip
          size="small"
          label={isReady ? "READY" : "NOT READY"}
          sx={{
            fontWeight: 700, fontSize: "0.7rem",
            backgroundColor: isReady ? brand.green : "#9e9e9e",
            color: "white",
          }}
        />
        {loading
          ? <CircularProgress size={20} sx={{ color: brand.orange }} />
          : (
            <Switch
              checked={isReady}
              onChange={(e) => onChange(e.target.checked ? "READY" : "NOT_READY")}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: brand.green },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: brand.green },
              }}
            />
          )
        }
      </Box>
    </Box>
  );
}
