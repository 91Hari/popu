import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// PO.PU Brand design tokens — Deep Forest Green + Saffron Gold
export const brand = {
  // Primary — Deep Forest Green
  orange: "#1B5E20",       // PRIMARY (token kept as "orange" for backward compat)
  orangeLight: "#E8F5E9",  // Primary light — light green surface
  orangeMid: "#2E7D32",    // Primary mid — hover / secondary green

  // Secondary — Saffron Gold
  gold: "#F4B400",
  goldLight: "#FFF8E1",    // Cream accent

  // Neutrals
  dark: "#1A1A1A",
  text: "#212121",
  muted: "#777777",
  border: "#C8E6C9",       // Light green border
  bg: "#FAFAF7",
  white: "#FFFFFF",

  // Success (same green, explicit token)
  green: "#2E7D32",
  greenLight: "#E8F5E9",

  // Ratings
  star: "#F4B400",
};

let theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: brand.orange,
      light: brand.orangeMid,
      contrastText: "#ffffff",
    },
    secondary: {
      main: brand.gold,
      contrastText: "#212121",
    },
    success: {
      main: brand.green,
      light: brand.greenLight,
      contrastText: "#ffffff",
    },
    background: {
      default: brand.bg,
      paper: brand.white,
    },
    text: {
      primary: brand.text,
      secondary: brand.muted,
    },
    divider: brand.border,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: [
      "Segoe UI",
      "system-ui",
      "Inter",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 900, fontSize: "2.25rem", letterSpacing: "-0.03em" },
    h2: { fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.02em" },
    h3: { fontWeight: 800, fontSize: "1.375rem", letterSpacing: "-0.01em" },
    h4: { fontWeight: 800, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.9rem", lineHeight: 1.5 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: "none",
        },
        containedPrimary: {
          backgroundColor: brand.orange,
          "&:hover": { backgroundColor: brand.orangeMid, boxShadow: "none" },
        },
        outlinedPrimary: {
          borderWidth: 1.5,
          borderColor: brand.orange,
          color: brand.orange,
          "&:hover": {
            borderWidth: 1.5,
            backgroundColor: brand.orangeLight,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${brand.border}`,
          boxShadow: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: brand.white,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: brand.orange,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": { color: brand.orange },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: brand.orange,
          color: "#ffffff",
          fontWeight: 700,
          borderBottomColor: brand.orangeMid,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.MuiTableRow-hover:hover": {
            backgroundColor: `${brand.goldLight} !important`,
          },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
