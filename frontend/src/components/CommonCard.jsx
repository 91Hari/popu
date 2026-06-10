import { Box, Card, Tooltip, Typography } from "@mui/material";
import DinnerDiningRoundedIcon from "@mui/icons-material/DinnerDiningRounded";
import { brand } from "../theme";

export const CARD_IMG_HEIGHT  = 120;
export const CARD_BODY_HEIGHT = 110;
export const CARD_BTN_HEIGHT  = 44;
export const CARD_TOTAL_HEIGHT = CARD_IMG_HEIGHT + CARD_BODY_HEIGHT + CARD_BTN_HEIGHT;

export default function CommonCard({
  imageSrc,
  imageAlt,
  placeholderIcon,
  title,
  subtitle,
  meta,
  badge,
  action,
  onClick,
  disabled = false,
  sx = {},
}) {
  return (
    <Card
      onClick={!disabled && onClick ? onClick : undefined}
      sx={{
        height: CARD_TOTAL_HEIGHT,
        display: "flex",
        flexDirection: "column",
        cursor: onClick && !disabled ? "pointer" : "default",
        opacity: disabled ? 0.6 : 1,
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": onClick && !disabled
          ? { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(27,94,32,0.15)" }
          : {},
        ...sx,
      }}
    >
      {/* Image area */}
      <Box
        sx={{
          height: CARD_IMG_HEIGHT,
          flexShrink: 0,
          background: imageSrc
            ? `url(${imageSrc}) center/cover no-repeat`
            : `linear-gradient(135deg, ${brand.orangeLight}, #A5D6A7)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {!imageSrc && (placeholderIcon || (
          <DinnerDiningRoundedIcon sx={{ fontSize: 42, color: brand.orange, opacity: 0.65 }} />
        ))}
        {badge && (
          <Box sx={{ position: "absolute", top: 8, right: 8 }}>{badge}</Box>
        )}
      </Box>

      {/* Body area */}
      <Box
        sx={{
          flex: 1,
          px: 1.5,
          pt: 1.25,
          pb: 0.5,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Tooltip title={title || ""} placement="top" enterDelay={600} disableHoverListener={!title || title.length < 22}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              lineHeight: 1.25,
              mb: 0.4,
            }}
          >
            {title}
          </Typography>
        </Tooltip>

        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              display: "block",
              mb: 0.25,
            }}
          >
            {subtitle}
          </Typography>
        )}

        {meta && (
          <Box sx={{ mt: "auto" }}>
            {meta}
          </Box>
        )}
      </Box>

      {/* Action area — pinned to bottom */}
      {action && (
        <Box
          sx={{
            height: CARD_BTN_HEIGHT,
            flexShrink: 0,
            px: 1.5,
            pb: 1.25,
            display: "flex",
            alignItems: "flex-end",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {action}
        </Box>
      )}
    </Card>
  );
}
