// Import polyfills FIRST before any other imports
import '../utils/polyfills';

import React, { useEffect } from 'react';
import {AppKit} from "@reown/appkit-wagmi-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@walletconnect/react-native-compat";
import { WagmiProvider } from "wagmi";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

// Import Camp SDK components

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {  useCampAuth } from '@/hooks/useCampAuth';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// Use React Native's built-in useColorScheme instead of custom hook
import { useColorScheme } from 'react-native';
import { wagmiConfig, initializeCampAppKit } from "@/config/campAppKit";
import { useCampfireIntegration } from '@/hooks/useCampfireIntegration';

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

  // Only load the fonts that exist in this repo to avoid bundling failures.
  // The repo contains SpaceMono; Inter TTFs are optional and may not be checked in.
  const [loaded] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize AppKit on component mount
  useEffect(() => {
    initializeCampAppKit();
  }, []);

  // Defensive AppKit wrapper: try to require the native AppKit component and
  // expose an `openAppKit` helper on global so UI components can open wallet UI.


  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }
// const {authenticated} = useCampAuth();



  return (
    <ThemeProvider value={ DarkTheme }>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {/* AppKit provider is exposed as a default AppKit component in some builds */}
            {/* <ApolloProvider client={apollo}> */}
           
                <Stack 
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#F8FAFC' }
                  }}
                >
                  <Stack>

                  <Stack.Screen  name="(tabs)" options={{ headerShown: false }} />
                  </Stack>
                  <Stack.Screen 
                    name="sign-in" 
                    options={{ 
                      headerShown: false,
                      presentation: 'modal'
                    }} 
                  />
                    <Stack.Screen name="+not-found" />
                </Stack>

                <AppKit/>

            {/* </ApolloProvider> */}
          
          <StatusBar style="auto" />
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
