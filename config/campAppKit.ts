/**
 * Camp Network AppKit Configuration
 * This module sets up the AppKit integration for wallet operations
 */

import { createAppKit, defaultWagmiConfig } from "@reown/appkit-wagmi-react-native";
import { campNetwork } from "@/config/chains";

// WalletConnect Project ID - get from https://cloud.walletconnect.com
const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || "83d0addc08296ab3d8a36e786dee7f48";

const metadata = {
  name: "Camp Network",
  description: "Decentralized IP Trading Platform with Camp Network Integration",
  url: "https://campnetwork.xyz",
  icons: ["https://imgur.com/7nLZezD.png"],
  redirect: {
    native: "campnetwork://",
    universal: "campnetwork.xyz",
  },
};

// Define supported chains
const chains = [campNetwork] as const;

// Create wagmi config for AppKit
export const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata
});

// Global flag to track initialization
declare global {
  var __CAMP_APPKIT_SINGLETON_INITIALIZED__: boolean | undefined;
}

// Create and configure AppKit instance
export const initializeCampAppKit = () => {
  // Check if already initialized globally
  if (global.__CAMP_APPKIT_SINGLETON_INITIALIZED__) {
    console.log('✅ Camp AppKit already initialized, skipping...');
    return;
  }

  try {
    createAppKit({
      projectId,
      wagmiConfig,
      defaultChain: campNetwork,
      enableAnalytics: true, // Enable analytics for better UX
      featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
        '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger Live
      ],
      // Camp Network specific theming
      themeMode: 'light'
    });
    
    // Mark as initialized globally
    global.__CAMP_APPKIT_SINGLETON_INITIALIZED__ = true;
    console.log('✅ Camp AppKit initialized successfully');
    
  } catch (error: any) {
    if (error.message?.includes('already initialized')) {
      // If it's already initialized, just mark our flag as true
      global.__CAMP_APPKIT_SINGLETON_INITIALIZED__ = true;
      console.log('✅ Camp AppKit already initialized, continuing...');
    } else {
      console.warn('❌ Camp AppKit initialization failed:', error);
      throw error;
    }
  }
};
