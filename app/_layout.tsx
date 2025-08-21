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
import { useFonts, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
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
  const colorScheme = useColorScheme();

  // Load Inter fonts and SpaceMono as fallback
  const [loaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize AppKit on component mount
  useEffect(() => {
    initializeCampAppKit();
    
    // Expose global AppKit helper
    (global as any).openAppKit = () => {
      try {
        const { open } = require('@reown/appkit-wagmi-react-native');
        open?.();
      } catch (e) {
        console.log('AppKit not available for opening');
      }
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Stack 
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#FFFFFF' }
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
          <StatusBar style="auto" />
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
