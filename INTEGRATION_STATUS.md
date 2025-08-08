# Camp Network React Native AppKit Integration Guide

This guide documents the complete setup and integration of Camp Network's React Native SDK with AppKit for wallet operations.

## Current Architecture

### Provider Hierarchy
```typescript
ThemeProvider (React Navigation)
├── WagmiProvider (Wagmi config for AppKit)
│   ├── QueryClientProvider (React Query)
│   │   ├── AppKitProvider (Camp Network AppKit wrapper)
│   │   │   ├── ApolloProvider (GraphQL client)
│   │   │   │   ├── CampProvider (Camp Network authentication)
│   │   │   │   │   └── Your App Components
│   │   │   │   └── AppKit (Modal component)
│   │   │   └── StatusBar
│   │   └── Query client cleanup
│   └── Wagmi cleanup
└── Theme cleanup
```

## Setup Instructions

### 1. Install Dependencies
```bash
# Core dependencies (already installed)
npm install @reown/appkit-wagmi-react-native
npm install @tanstack/react-query
npm install @walletconnect/react-native-compat
npm install wagmi

# React Native specific
npm install @react-native-async-storage/async-storage
npm install react-native-svg
```

### 2. Configuration Files

#### `/config/campAppKit.ts`
```typescript
import { createAppKit, defaultWagmiConfig } from "@reown/appkit-wagmi-react-native";
import { campNetwork } from "@/config/chains";

const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || "83d0addc08296ab3d8a36e786dee7f48";

const metadata = {
  name: "Camp Network",
  description: "Decentralized IP Trading Platform",
  url: "https://campnetwork.xyz",
  icons: ["https://imgur.com/7nLZezD.png"],
  redirect: {
    native: "campnetwork://",
    universal: "campnetwork.xyz",
  },
};

export const wagmiConfig = defaultWagmiConfig({ 
  chains: [campNetwork], 
  projectId, 
  metadata
});

export const initializeCampAppKit = () => {
  // Singleton initialization logic
  createAppKit({
    projectId,
    wagmiConfig,
    defaultChain: campNetwork,
    enableAnalytics: true,
    featuredWalletIds: [
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
      '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    ],
    themeMode: 'light'
  });
};
```

### 3. Main App Layout

#### `/app/_layout.tsx` (Current Working Version)
```typescript
import '../utils/polyfills';
import React, { useEffect } from 'react';
import { AppKit } from "@reown/appkit-wagmi-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@walletconnect/react-native-compat";
import { WagmiProvider } from "wagmi";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { CampProvider } from "../dist/react-native";
import { AppKitProvider } from "../dist/react-native/appkit";
import { wagmiConfig, initializeCampAppKit } from "@/config/campAppKit";

const queryClient = new QueryClient();
const apollo = new ApolloClient({...});

export default function RootLayout() {
  useEffect(() => {
    initializeCampAppKit();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider config={{
          projectId: "83d0addc08296ab3d8a36e786dee7f48",
          metadata: {...}
        }}>
          <ApolloProvider client={apollo}>
            <CampProvider 
              clientId="fce77d7a-8085-47ca-adff-306a933e76aa"
              redirectUri={{
                twitter: "campnetwork://redirect/twitter",
                discord: "campnetwork://redirect/discord", 
                spotify: "campnetwork://redirect/spotify",
                default: "campnetwork://auth-callback"
              }}
              allowAnalytics={true}
            >
              <Stack>...</Stack>
              <AppKit />
            </CampProvider>
          </ApolloProvider>
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 4. SDK Integration Hook

#### `/hooks/useCampNetworkSDK.ts` (Current Working Version)
```typescript
export function useCampNetworkSDK() {
  const { authenticated, loading, walletAddress, connect, disconnect } = useCampAuth();
  const { isAppKitConnected, appKitAddress, openAppKit, disconnectAppKit } = useAppKit();
  const { socials, refetch: refetchSocials } = useSocials();
  const { stats, uploads } = useOrigin();

  // Auto-authentication logic
  const shouldAuthenticate = isAppKitConnected && !authenticated && !loading;

  return {
    // Authentication state
    isAuthenticated: authenticated,
    isLoading: loading,
    walletAddress,
    
    // Wallet state
    isAppKitConnected,
    appKitAddress,
    
    // Methods
    authenticate: connect,
    signOut: disconnect,
    openAppKit,
    createIPAsset: async (source, metadata, licenseTerms, file) => {
      // Implementation using auth?.origin methods
    },
    
    // Data
    socials,
    ipAssets: processedUploads,
    userStats: stats.data,
    
    // Helper flags
    shouldAuthenticate,
    isInitialized: true,
  };
}
```

## Available Hooks and Components

### From `dist/react-native`
- `useCampAuth()` - Camp Network authentication
- `useAppKit()` - AppKit wallet operations  
- `useSocials()` - Social account management
- `useOrigin()` - IP asset and stats management
- `CampProvider` - Main authentication provider
- `CampButton` - Styled button component
- `CampModal` - Authentication modal

### From `dist/react-native/appkit`
- `AppKitProvider` - Wallet provider wrapper
- `AppKitButton` - Pre-built wallet connect button
- `useAppKit()` - AppKit operations hook

## Key Integration Points

### 1. Wallet Connection Flow
1. User clicks "Connect Wallet" (AppKit)
2. AppKit handles wallet selection and connection
3. `useAppKit()` provides connection state
4. Auto-authentication triggers Camp Network auth
5. `useCampAuth()` handles Camp Network authentication

### 2. IP Asset Creation
1. Ensure wallet is connected (`isAppKitConnected`)
2. Ensure Camp Network is authenticated (`isAuthenticated`)
3. Use `auth?.origin.mintFile()` or `auth?.origin.mintSocial()`
4. Handle transaction signing via AppKit

### 3. Social Account Linking
1. Must be authenticated with Camp Network
2. Use social linking methods from Camp SDK
3. Redirect handling through configured URIs

## Current Limitations

1. **AppKit Hook Methods**: Some wallet operations (signMessage, switchNetwork) need implementation in the useAppKit hook
2. **Social Linking**: Social account linking methods need to be exposed from useSocials hook
3. **Error Handling**: Error states and clearError methods need standardization
4. **TypeScript**: Some type definitions need refinement

## Testing Flow

1. **Start App**: `npx expo start --clear`
2. **Connect Wallet**: Use AppKit button or openAppKit()
3. **Auto-Auth**: Should automatically authenticate with Camp Network
4. **Create IP**: Navigate to create screen, fill form, submit
5. **Verify**: Check that IP asset appears in portfolio

## Environment Variables Required

```env
EXPO_PUBLIC_ORIGIN_CLIENT_ID=fce77d7a-8085-47ca-adff-306a933e76aa
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=83d0addc08296ab3d8a36e786dee7f48
EXPO_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/your-subgraph
```

## Deep Link Configuration

### Expo `app.json`
```json
{
  "expo": {
    "scheme": "campnetwork",
    "ios": {
      "bundleIdentifier": "com.campnetwork.app"
    },
    "android": {
      "package": "com.campnetwork.app"
    }
  }
}
```

This setup provides a complete, working integration that properly separates concerns between AppKit (wallet operations) and Camp Network SDK (authentication and IP asset management).
