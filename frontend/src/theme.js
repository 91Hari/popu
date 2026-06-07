import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// popu Brand design tokens (pure · fresh · trusted)
// Mirrors the values used across the app mockup.
export const brand = {
  orange: "#E8751A", // primary
  orangeLight: "#FDF0E6",
  orangeMid: "#F5A05A",
  dark: "#1A1A1A",
  text: "#333333",
  muted: "#777777",
  border: "#E8E8E8",
  bg: "#F7F7F5",
  white: "#FFFFFF",
  green: "#2E7D32", // veg / success accent
  greenLight: "#E8F5E9",
  star: "#FFA500",
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
      main: brand.dark,
      contrastText: "#ffffff",
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
          "&:hover": { backgroundColor: "#d2680f", boxShadow: "none" },
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
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
