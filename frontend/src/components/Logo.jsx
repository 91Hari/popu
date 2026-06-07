import { Box, Typography } from "@mui/material";
import { brand } from "../theme";

/**
 * popu brand logo mark — orange circle with "po.[tomato]/pan/pu" SVG.
 * Props:
 *  size          - diameter of the circle mark in px (default 44)
 *  showWordmark  - render "popu" text beside the mark (default true)
 *  showTagline   - render "pure · fresh · trusted" under wordmark
 *  color         - override brand orange
 */
export default function Logo({
  size = 44,
  showWordmark = true,
  showTagline = false,
  color = brand.orange,
}) {
  const innerSize = size - 8;

  const mark = (
    <Box
      sx={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 72 72"
        width={innerSize}
        height={innerSize}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Row 1: "p" "o" ── */}
        <text x="2" y="26" fontSize="22" fontWeight="900" fill="white" fontFamily="Arial, Helvetica, sans-serif">p</text>
        <text x="15" y="26" fontSize="22" fontWeight="900" fill="white" fontFamily="Arial, Helvetica, sans-serif">o</text>

        {/* ── Tomato ── */}
        {/* Stem */}
        <line x1="43" y1="2" x2="43" y2="6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Calyx leaves */}
        <path d="M43 7 C43 4.5 40.5 3 39 4 C40.5 5.5 42 6.5 43 7Z" fill="white"/>
        <path d="M43 7 C43 4.5 45.5 3 47 4 C45.5 5.5 44 6.5 43 7Z" fill="white"/>
        <path d="M43 7 C40.5 5.5 38 4 38 5.5 C39.5 6 41.5 6.5 43 7Z" fill="white"/>
        <path d="M43 7 C45.5 5.5 48 4 48 5.5 C46.5 6 44.5 6.5 43 7Z" fill="white"/>
        {/* Tomato body */}
        <circle cx="43" cy="17" r="9.5" fill="white"/>

        {/* ── Dot "." ── */}
        <circle cx="57.5" cy="17" r="3.5" fill="white"/>

        {/* ── Frying pan ── */}
        {/* Pan body */}
        <ellipse cx="30" cy="36.5" rx="28" ry="5" fill="white"/>
        {/* Handle extending right */}
        <rect x="57" y="33.5" width="13" height="6" rx="3" fill="white"/>

        {/* ── Row 2: "p" "u" ── */}
        <text x="2" y="63" fontSize="22" fontWeight="900" fill="white" fontFamily="Arial, Helvetica, sans-serif">p</text>
        <text x="15" y="63" fontSize="22" fontWeight="900" fill="white" fontFamily="Arial, Helvetica, sans-serif">u</text>
      </svg>
    </Box>
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
          popu
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
