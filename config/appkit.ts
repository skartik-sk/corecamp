/**
 * AppKit Configuration - Singleton Pattern
 * This module ensures AppKit is initialized only once across the entire app
 */

import { createAppKit, defaultWagmiConfig } from "@reown/appkit-wagmi-react-native";
import { campNetwork } from "@/config/chains";

// Global flag to track initialization
declare global {
  var __APPKIT_SINGLETON_INITIALIZED__: boolean | undefined;
}

const projectId = "83d0addc08296ab3d8a36e786dee7f48";

const metadata = {
  name: "IP Marketplace",
  description: "Decentralized IP Trading Platform",
  url: "http://localhost:8081",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "ipmarketplace://",
    universal: "ipmarketplace.com",
  },
};

const chains = [campNetwork] as const;

export const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata
});

// Singleton initialization function
export const initializeAppKitSingleton = () => {
  // Check if already initialized globally
  if (global.__APPKIT_SINGLETON_INITIALIZED__) {
    return;
  }

  try {
    createAppKit({
      projectId,
      wagmiConfig,
      defaultChain: campNetwork,
      enableAnalytics: false,
      featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
      ]
    });
    
    // Mark as initialized globally
    global.__APPKIT_SINGLETON_INITIALIZED__ = true;
    console.log('✅ AppKit initialized successfully (singleton)');
    
  } catch (error: any) {
    if (error.message?.includes('already initialized')) {
      // If it's already initialized, just mark our flag as true
      global.__APPKIT_SINGLETON_INITIALIZED__ = true;
      console.log('✅ AppKit already initialized, continuing...');
    } else {
      console.warn('❌ AppKit initialization failed:', error);
    }
  }
};

// Initialize immediately when this module is imported
initializeAppKitSingleton();
