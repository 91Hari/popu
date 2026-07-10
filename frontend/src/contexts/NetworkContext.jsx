import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import networkService from "../services/networkService";
import NetworkBanner from "../components/NetworkBanner";

const NetworkContext = createContext(null);

/**
 * NetworkProvider — wraps the app and exposes real-time network state.
 * Also renders <NetworkBanner> automatically when the user goes offline mid-session.
 */
export function NetworkProvider({ children }) {
  const [isOnline,     setIsOnline]     = useState(networkService.isOnline());
  const [isSlowNetwork,setIsSlowNetwork]= useState(networkService.isSlowNetwork());
  const [isMaintenance,setIsMaintenance]= useState(
    typeof window !== "undefined" && window.__POPU_MAINTENANCE__ === true
  );
  // null = user has never been online in this session yet
  const [lastOnlineAt, setLastOnlineAt] = useState(
    networkService.isOnline() ? new Date() : null
  );

  // Track whether user was ever online so we know when to show the banner
  const wasEverOnline = useRef(networkService.isOnline());

  const handleNetworkChange = useCallback(({ online, slow }) => {
    setIsOnline(online);
    setIsSlowNetwork(slow);
    if (online) {
      wasEverOnline.current = true;
      setLastOnlineAt(new Date());
    }
  }, []);

  useEffect(() => {
    const unsubscribe = networkService.subscribe(handleNetworkChange);
    return unsubscribe;
  }, [handleNetworkChange]);

  // Listen for maintenance flag set globally by api.js after a 503
  useEffect(() => {
    function checkMaintenance() {
      if (typeof window !== "undefined" && window.__POPU_MAINTENANCE__ === true) {
        setIsMaintenance(true);
      }
    }
    // Poll window flag every 5 seconds (lightweight — only a property read)
    const interval = setInterval(checkMaintenance, 5000);
    return () => clearInterval(interval);
  }, []);

  const value = { isOnline, isSlowNetwork, isMaintenance, lastOnlineAt };

  return (
    <NetworkContext.Provider value={value}>
      <NetworkBanner />
      {children}
    </NetworkContext.Provider>
  );
}

/** Access network state from any component */
export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    // Graceful default when used outside provider (e.g., during SSR or testing)
    return { isOnline: true, isSlowNetwork: false, isMaintenance: false, lastOnlineAt: null };
  }
  return ctx;
}
