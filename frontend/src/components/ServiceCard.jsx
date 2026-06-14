import { Box, Card, CardActionArea, CardContent, Chip, Typography } from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { brand } from "../theme";

export default function ServiceCard({ icon, title, subtitle, comingSoon = false, onClick }) {
  return (
    <Card
      sx={{
        opacity: comingSoon ? 0.72 : 1,
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": comingSoon ? {} : {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 24px rgba(27,94,32,0.18)",
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ p: 0 }}
      >
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            "&:last-child": { pb: 2 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2.5,
                backgroundColor: comingSoon ? brand.border : brand.orangeLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {title}
                </Typography>
                {comingSoon && (
                  <Chip
                    label="Coming Soon"
                    size="small"
                    sx={{ height: 20, fontSize: "0.65rem", backgroundColor: brand.border, color: brand.muted }}
                  />
                )}
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {subtitle}
              </Typography>
            </Box>
          </Box>
          {!comingSoon && (
            <ChevronRightRoundedIcon sx={{ color: brand.orange, flexShrink: 0 }} />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
