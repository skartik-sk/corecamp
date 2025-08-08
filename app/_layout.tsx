// Import polyfills FIRST before any other imports
import '../utils/polyfills';

import React, { useEffect } from 'react';
import { AppKit } from "@reown/appkit-wagmi-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@walletconnect/react-native-compat";
import { WagmiProvider } from "wagmi";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

// Import Camp SDK components
import { CampProvider } from "../sdk/react-native";
import { AppKitProvider } from "../sdk/react-native/appkit";

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// Use React Native's built-in useColorScheme instead of custom hook
import { useColorScheme } from 'react-native';
import { wagmiConfig, initializeCampAppKit } from "@/config/campAppKit";

// Setup query client for React Query
const queryClient = new QueryClient();

// Apollo Client for GraphQL - with offline handling
const apollo = new ApolloClient({
  uri: process.env.EXPO_PUBLIC_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/your-subgraph',
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
    },
    query: {
      errorPolicy: 'ignore',
    },
  },
  connectToDevTools: false, // Disable dev tools to avoid connection issues
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize AppKit on component mount
  useEffect(() => {
    initializeCampAppKit();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppKitProvider
            config={{
              projectId: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || "83d0addc08296ab3d8a36e786dee7f48",
              metadata: {
                name: "Camp Network",
                description: "Decentralized IP Trading Platform with Camp Network Integration",
                url: "https://campnetwork.xyz",
                icons: ["https://imgur.com/7nLZezD.png"]
              }
            }}
          >
            <ApolloProvider client={apollo}>
              <CampProvider 
                clientId={process.env.EXPO_PUBLIC_ORIGIN_CLIENT_ID || 'fce77d7a-8085-47ca-adff-306a933e76aa'}
                redirectUri={{
                  twitter: "campnetwork://redirect/twitter",
                  discord: "campnetwork://redirect/discord", 
                  spotify: "campnetwork://redirect/spotify",
                  default: "campnetwork://auth-callback"
                }}
                allowAnalytics={true}
              >
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#F8FAFC' }
                  }}
                >
                  <Stack.Screen 
                    name="sign-in" 
                    options={{ 
                      headerShown: false,
                      presentation: 'modal'
                    }} 
                  />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <AppKit />
              </CampProvider>
            </ApolloProvider>
          </AppKitProvider>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
