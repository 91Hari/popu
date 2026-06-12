import { Box, Card, CardActionArea, CardContent, Typography, Chip } from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import DirectionsBikeRoundedIcon from "@mui/icons-material/DirectionsBikeRounded";
import { brand } from "../theme";
import { haversineKm, etaMinutes, formatDistance, formatEta } from "../utils/geoUtils";

export const CATERER_CARD_HEIGHT = 230;

export default function CatererCard({ caterer = {}, onClick, customerCoords }) {
  const { catererName, businessName, location, address, latitude, longitude, rating, foodCount, email } = caterer;

  const hasDistance = customerCoords && latitude != null && longitude != null;
  const distKm      = hasDistance ? haversineKm(customerCoords.lat, customerCoords.lng, Number(latitude), Number(longitude)) : null;
  const eta         = distKm != null ? etaMinutes(distKm) : null;

  return (
    <Card
      sx={{
        height: CATERER_CARD_HEIGHT,
        minHeight: CATERER_CARD_HEIGHT,
        maxHeight: CATERER_CARD_HEIGHT,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 24px rgba(27,94,32,0.18)",
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        {/* Banner image */}
        <Box
          sx={{
            height: 80,
            minHeight: 80,
            flexShrink: 0,
            background: `linear-gradient(135deg, ${brand.orange} 0%, ${brand.orangeMid} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RestaurantMenuRoundedIcon sx={{ fontSize: 36, color: "white", opacity: 0.6 }} />
        </Box>

        {/* Content */}
        <CardContent sx={{ flex: 1, overflow: "hidden", p: 2, "&:last-child": { pb: 2 }, display: "flex", flexDirection: "column" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.25 }} noWrap>
            {catererName || "Caterer"}
          </Typography>

          {businessName && (
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.25 }} noWrap>
              {businessName}
            </Typography>
          )}

          {(address || location) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.5, overflow: "hidden" }}>
              <LocationOnRoundedIcon sx={{ fontSize: 13, color: "text.secondary", flexShrink: 0 }} />
              <Typography
                variant="caption"
                noWrap
                sx={{ color: "text.secondary", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {address || location}
              </Typography>
            </Box>
          )}

          {distKm != null && (
            <Box sx={{ mt: 0.75 }}>
              <Chip
                icon={<DirectionsBikeRoundedIcon sx={{ fontSize: "13px !important" }} />}
                label={`${formatDistance(distKm)} · ${formatEta(eta)}`}
                size="small"
                sx={{
                  height: 22, fontSize: "0.7rem",
                  backgroundColor: brand.greenLight, color: brand.green,
                  "& .MuiChip-icon": { color: brand.green },
                }}
              />
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto", pt: 0.75 }}>
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
              sx={{ height: 22, fontSize: "0.7rem", backgroundColor: brand.goldLight, color: brand.text }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
