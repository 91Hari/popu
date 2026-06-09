import { Box, Card, CardActionArea, CardContent, Typography, Chip } from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import DirectionsBikeRoundedIcon from "@mui/icons-material/DirectionsBikeRounded";
import { brand } from "../theme";
import { haversineKm, etaMinutes, formatDistance, formatEta } from "../utils/geoUtils";

export default function CatererCard({ caterer = {}, onClick, customerCoords }) {
  const { catererName, businessName, location, address, latitude, longitude, rating, foodCount, email } = caterer;

  const hasDistance = customerCoords && latitude != null && longitude != null;
  const distKm      = hasDistance ? haversineKm(customerCoords.lat, customerCoords.lng, Number(latitude), Number(longitude)) : null;
  const eta         = distKm != null ? etaMinutes(distKm) : null;

  return (
    <Card
      sx={{
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 24px rgba(232,117,26,0.14)",
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 0 }}>
        <Box
          sx={{
            height: 80,
            background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RestaurantMenuRoundedIcon sx={{ fontSize: 36, color: "white", opacity: 0.6 }} />
        </Box>

        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }} noWrap>
            {catererName || "Caterer"}
          </Typography>
          {businessName && (
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }} noWrap>
              {businessName}
            </Typography>
          )}

          {(address || location) && (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.4, mt: 0.75 }}>
              <LocationOnRoundedIcon sx={{ fontSize: 13, color: "text.secondary", mt: "1px", flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.3 }}>
                {address || location}
              </Typography>
            </Box>
          )}

          {/* Distance + ETA chip */}
          {distKm != null && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 1 }}>
              <Chip
                icon={<DirectionsBikeRoundedIcon sx={{ fontSize: "13px !important" }} />}
                label={`${formatDistance(distKm)} · ${formatEta(eta)}`}
                size="small"
                sx={{
                  height: 22, fontSize: "0.7rem",
                  backgroundColor: "#E8F5E9", color: "#2e7d32",
                  "& .MuiChip-icon": { color: "#2e7d32" },
                }}
              />
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.25 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              {rating != null ? (
                <>
                  <StarRoundedIcon sx={{ fontSize: 15, color: brand.star }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {Number(rating).toFixed(1)}
                  </Typography>
                </>
              ) : (
                <Typography variant="caption" sx={{ color: "text.disabled" }}>No rating yet</Typography>
              )}
            </Box>
            <Chip
              icon={<RestaurantMenuRoundedIcon sx={{ fontSize: "14px !important" }} />}
              label={`${foodCount ?? 0} items`}
              size="small"
              sx={{ height: 22, fontSize: "0.7rem", backgroundColor: brand.orangeLight, color: brand.orange }}
            />
          </Box>

          {email && (
            <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 0.75 }} noWrap>
              {email}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
