import { Box, Typography } from "@mui/material";
import { brand } from "../theme";

const logoImg = "/popuLogo.png";

export default function Logo({
  size = 64,
  width,
  height,
  showWordmark = true,
  showTagline = false,
  color = brand.orange,
  blendMode,
}) {
  const imgHeight = height ?? size;
  const imgWidth  = width  ?? size;

  const mark = (
    <Box
      component="img"
      src={logoImg}
      alt="PO.PU"
      loading="lazy"
      sx={{
        height: imgHeight,
        width: imgWidth,
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
        imageRendering: "high-quality",
        ...(blendMode && { mixBlendMode: blendMode }),
      }}
    />
  );

  if (!showWordmark) return mark;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {mark}
      <Box sx={{ lineHeight: 1 }}>
        <Typography
          component="span"
          sx={{
            fontSize: size * 0.55,
            fontWeight: 900,
            color,
            letterSpacing: "-0.04em",
            display: "block",
            lineHeight: 1,
          }}
        >
          PO.PU
        </Typography>
        {showTagline && (
          <Typography
            component="span"
            sx={{
              fontSize: size * 0.24,
              color: brand.muted,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              display: "block",
              mt: 0.25,
            }}
          >
            pure · fresh · trusted
          </Typography>
        )}
      </Box>
    </Box>
  );
}
