/**
 * Origin SDK AppKit Bridge Hook
 * Uses AppKit for wallet operations and bridges with Camp Network authentication
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

interface User {
  address: string;
  isAuthenticated: boolean;
  accessToken?: string;
  method: string;
}

interface UsageData {
  totalUsage: number;
  remainingUsage: number;
  usageLimit: number;
  refreshDate: string;
  multiplier?: number;
  points?: number;
  active?: boolean;
}

export function useOriginSDKBridge() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false); // Prevent multiple auth attempts
  const [lastAuthAttempt, setLastAuthAttempt] = useState<number>(0); // Cooldown tracking

  // Reset user when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setUser(null);
      setError(null);
      setIsAuthenticating(false); // Reset authentication state
      setLastAuthAttempt(0); // Reset cooldown
    }
  }, [isConnected]);

  // Authenticate using AppKit bridge method
  const authenticate = useCallback(async () => {
    const now = Date.now();
    const cooldownPeriod = 10000; // 10 second cooldown between attempts
    
    // Prevent multiple simultaneous authentication attempts
    if (isAuthenticating) {
      console.warn('🔄 Authentication already in progress, skipping...');
      return;
    }

    // Enforce cooldown period to prevent spam
    if (lastAuthAttempt && (now - lastAuthAttempt) < cooldownPeriod) {
      console.warn(`⏳ Cooldown active, please wait ${Math.ceil((cooldownPeriod - (now - lastAuthAttempt)) / 1000)} more seconds`);
      return;
    }

    if (!address || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!signMessageAsync) {
      setError('Wallet does not support message signing');
      return;
    }

    setIsLoading(true);
    setIsAuthenticating(true);
    setLastAuthAttempt(now);
    setError(null);

    try {
      console.log('🌉 Starting Camp Network authentication via AppKit bridge...');
      
      // Create authentication message
      const timestamp = Date.now();
      const message = `Welcome to Camp Network!

This signature authenticates your wallet with Camp Network services.

Wallet: ${address}
Timestamp: ${timestamp}
Action: Authentication

This request will not trigger a blockchain transaction or cost any gas fees.`;
      
      console.log('📝 Requesting signature for Camp Network authentication...');
      
      // Sign message using AppKit with focus error handling
      let signature: string;
      try {
        // Add longer timeout for signing
        const signPromise = signMessageAsync({ message });
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Signature request timed out after 5 minutes')), 5 * 60 * 1000)
        );
        
        signature = await Promise.race([signPromise, timeoutPromise]);
      } catch (signError: any) {
        // Check for focus-related errors and retry
        if (signError.message && signError.message.includes('hasFocus')) {
          console.warn('🔧 Focus error during signing, retrying after delay...');
          await new Promise(resolve => setTimeout(resolve, 200));
          try {
            signature = await signMessageAsync({ message });
          } catch (retryError: any) {
            console.error('❌ Retry failed:', retryError);
            throw retryError;
          }
        } else {
          throw signError;
        }
      }
      
      if (signature) {
        console.log('✅ Message signed successfully');
        
        // Simulate Camp Network API call
        // In real implementation, send signature + message to Camp Network backend
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        setUser({
          address,
          isAuthenticated: true,
          accessToken: signature,
          method: 'appkit-bridge',
        });
        
        console.log('🎉 Camp Network authentication successful!');
        setError(null);
      }
    } catch (err: any) {
      console.error('❌ Camp Network authentication failed:', err);
      
      if (err?.message?.includes('User rejected')) {
        setError('Authentication cancelled by user');
      } else if (err?.message?.includes('already pending')) {
        setError('Please wait - another signature request is in progress');
      } else if (err?.message?.includes('Request expired')) {
        setError('Request timed out - please try again');
      } else if (err?.code === -32002) {
        setError('Previous request still pending - please wait or restart app');
        console.error('🚨 WalletConnect session conflict - may need to clear session');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsAuthenticating(false); // Always reset authentication state
    }
  }, [address, isConnected, signMessageAsync, isAuthenticating, lastAuthAttempt]);

  // Sign out user
  const signOut = useCallback(async () => {
    setUser(null);
    setError(null);
    setIsAuthenticating(false); // Reset authentication state
    setLastAuthAttempt(0); // Reset cooldown
    console.log('🚪 Signed out from Camp Network');
  }, []);

  // Get usage data
  const getUsage = useCallback(async (): Promise<UsageData | null> => {
    if (!user?.isAuthenticated) {
      return null;
    }

    try {
      // Simulate API call to Camp Network
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        totalUsage: Math.floor(Math.random() * 300),
        remainingUsage: Math.floor(Math.random() * 700 + 300),
        usageLimit: 1000,
        refreshDate: new Date().toISOString(),
        multiplier: 1.5,
        points: Math.floor(Math.random() * 1000),
        active: true,
      };
    } catch (err) {
      console.error('Failed to fetch usage data:', err);
      return null;
    }
  }, [user?.isAuthenticated]);

  // Get user profile
  const getProfile = useCallback(async () => {
    if (!user?.isAuthenticated) {
      return null;
    }

    return {
      address: user.address,
      isAuthenticated: true,
      method: 'appkit-bridge',
      linkedSocials: {
        twitter: false,
        discord: false,
        spotify: false,
      },
    };
  }, [user]);

  // Get linked socials
  const getLinkedSocials = useCallback(async () => {
    if (!user?.isAuthenticated) {
      return null;
    }

    return {
      twitter: false,
      discord: false,
      spotify: false,
    };
  }, [user?.isAuthenticated]);

  return {
    user,
    isLoading: isLoading || isAuthenticating, // Show loading during authentication
    error,
    authenticate,
    signOut,
    getUsage,
    getProfile,
    getLinkedSocials,
    shouldAuthenticate: isConnected && !user?.isAuthenticated && !isAuthenticating,
    isInitialized: true,
    isAppKitBridge: true,
  };
}
