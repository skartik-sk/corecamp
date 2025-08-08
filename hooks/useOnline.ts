import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * useOnline
 * Lightweight hook to determine if the device has internet connectivity.
 * Defaults to true to avoid blocking dev flows; updates on changes.
 */
export function useOnline() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      // Treat connected + internetReachable as online
      const isOnline = Boolean(state.isConnected && (state.isInternetReachable ?? true));
      setOnline(isOnline);
    });
    // Fetch current status once
    NetInfo.fetch().then((state) => {
      const isOnline = Boolean(state.isConnected && (state.isInternetReachable ?? true));
      setOnline(isOnline);
    }).catch(() => {
      // If NetInfo fails, don't block: assume online
      setOnline(true);
    });
    return () => sub();
  }, []);

  return online;
}
