import { Component } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { brand } from "../theme";
import errorLogger from "../services/errorLogger";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught render error:", error);
    console.error("[ErrorBoundary] Component stack:", info.componentStack);

    // Log to persistent error store
    errorLogger.log("render", error?.message || String(error), {
      componentStack: info.componentStack,
      errorName: error?.name,
    });
  }

  /** Reset the error boundary programmatically */
  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, render it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            p: 4,
            textAlign: "center",
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 56, color: brand.orange, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Something went wrong.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Please reload the page or go back to the home screen.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() => { window.location.hash = "#/"; }}
              sx={{ fontWeight: 700 }}
            >
              Go to Home
            </Button>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ fontWeight: 700, px: 4 }}
            >
              Reload
            </Button>
          </Stack>
        </Box>
      );
    }
    return this.props.children;
  }
}
