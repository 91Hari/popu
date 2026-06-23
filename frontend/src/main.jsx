import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

async function initCapacitor() {
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const { App } = await import("@capacitor/app");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#1B5E20" });
    await SplashScreen.hide({ fadeOutDuration: 300 });
    // Handle Android hardware back button — navigate within the app instead of exiting
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch {
    // Not running in Capacitor (web browser) — ignore
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

initCapacitor();
