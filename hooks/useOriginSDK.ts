/**
 * Origin SDK Integration Hook
 * Proper integration with @campnetwork/origin SDK for React Native
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
  const { connector } = useAccount();
import { Auth } from '@campnetwork/origin';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  address: string;
  isAuthenticated: boolean;
  accessToken?: string;
  profile?: any;
  originData?: any;
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

interface IPAsset {
  id: string;
  title: string;
  type: string;
  description: string;
  price: string;
  creator: string;
  status: string;
  metadata: any;
}

export function useOriginSDK() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [auth, setAuth] = useState<Auth | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ipAssets, setIPAssets] = useState<IPAsset[]>([]);
  const authInitialized = useRef(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize Auth instance when component mounts
  useEffect(() => {
    if (!authInitialized.current) {
      const initializeAuth = async () => {
        try {
          const clientId = process.env.EXPO_PUBLIC_ORIGIN_CLIENT_ID || 'fce77d7a-8085-47ca-adff-306a933e76aa';
          
          console.log('🚀 Initializing Origin SDK with proper configuration...');
          
          const authInstance = new Auth({
            clientId,
            redirectUri: 'campnetwork://auth-callback',
            allowAnalytics: true, // Enable analytics for better functionality
          });

          // Check for persisted authentication state
          const storedAuth = await AsyncStorage.getItem('camp_auth_state');
          if (storedAuth) {
            const authState = JSON.parse(storedAuth);
            console.log('📱 Found persisted auth state:', authState);
            if (authState.isAuthenticated && authState.address === address) {
              setIsAuthenticated(true);
              setUser({
                address: authState.address,
                isAuthenticated: true,
                accessToken: authState.accessToken,
                profile: authState.profile,
                originData: authState.originData,
              });
              
              // Restore JWT and state, but do not instantiate Origin directly
              if (authState.jwt) {
                authInstance.jwt = authState.jwt;
                authInstance.isAuthenticated = true;
                authInstance.walletAddress = authState.address;
                // Only load IP assets if origin is available (after SDK sets it)
                if (authInstance.origin) {
                  loadIPAssets(authInstance.origin);
                }
              }
            }
          }

          setAuth(authInstance);
          authInitialized.current = true;
          
          console.log('✅ Origin SDK Auth initialized successfully');

          // Setup event listeners for Origin SDK state changes
          authInstance.on('state', (state: string) => {
            console.log('🔄 Origin SDK state changed:', state);
            
            if (state === 'authenticated') {
              setIsLoading(false);
              setError(null);
            } else if (state === 'unauthenticated') {
              setUser(null);
              setIsAuthenticated(false);
              setIPAssets([]);
              setIsLoading(false);
              setError(null);
              
              // Clear persisted state
              AsyncStorage.removeItem('camp_auth_state').catch(console.error);
            } else if (state === 'loading') {
              setIsLoading(true);
              setError(null);
            }
          });

        } catch (err) {
          console.error('❌ Failed to initialize Auth:', err);
          setError('Failed to initialize Origin SDK: ' + (err as Error).message);
          authInitialized.current = false;
        }
      };

      initializeAuth();
    }
  }, [address]);

  // Load IP assets from Origin API
  const loadIPAssets = useCallback(async (originInstance: any) => {
    if (!originInstance) return;
    
    try {
      console.log('� Loading user IP assets from Origin...');
      const uploads = await originInstance.getOriginUploads();
      
      if (uploads && uploads.data) {
        const assets = uploads.data.map((upload: any) => ({
          id: upload.tokenId || upload.id,
          title: upload.metadata?.name || upload.title || 'Untitled IP Asset',
          type: upload.source || 'file',
          description: upload.metadata?.description || '',
          price: upload.terms?.price ? `${upload.terms.price} ETH` : 'Not for sale',
          creator: upload.creator || address,
          status: upload.status || 'owned',
          metadata: upload.metadata,
        }));
        
        setIPAssets(assets);
        console.log(`✅ Loaded ${assets.length} IP assets`);
      }
    } catch (err) {
      console.error('❌ Failed to load IP assets:', err);
      // Don't show error for IP assets loading failure
      setIPAssets([]);
    }
  }, [address]);

  // Set wallet provider when wallet is connected
  useEffect(() => {
    const setupProvider = async () => {
      if (auth && isConnected && address && connector) {
        try {
          const eipProvider = await connector.getProvider();
          console.log('🔗 Setting up Origin SDK with EIP-1193 provider:', address);
          auth.setWalletAddress(address);
          auth.setProvider({
            provider: eipProvider,
            info: { name: 'AppKit Wallet' },
            address,
          });
          console.log('✅ Origin SDK configured with EIP-1193 provider');
        } catch (err) {
          console.error('❌ Failed to configure Origin SDK with EIP-1193 provider:', err);
        }
      }
    };
    setupProvider();
  }, [auth, isConnected, address, connector]);

  // Authenticate user with Camp Network using connect method
  const authenticate = useCallback(async () => {
    if (!auth || !address) {
      setError('Authentication not available - wallet not connected');
      return;
    }

    if (isLoading) {
      console.log('Authentication already in progress');
      return;
    }

    let retries = 0;
    const maxRetries = 2;
    const retryDelay = 1500; // ms

    const tryAuthenticate = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the Origin SDK connect method for proper authentication
        const result = await auth.connect();
        if (result.success) {
          console.log('✅ Origin SDK connected successfully:', result);
          const userData = {
            address: result.walletAddress || address,
            isAuthenticated: true,
            accessToken: auth.jwt || 'authenticated',
            profile: null,
            originData: result,
          };
          // Store authentication data
          await AsyncStorage.setItem('camp_auth_state', JSON.stringify({
            ...userData,
            jwt: auth.jwt,
          }));
          setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
          // Load user's IP assets if Origin instance is available
          if (auth.origin) {
            loadIPAssets(auth.origin);
          }
        } else {
          throw new Error(result.message || 'Authentication failed');
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        console.error('❌ Origin SDK authentication failed:', errMsg);
        if (errMsg.includes('Request expired')) {
          if (retries < maxRetries) {
            retries++;
            setError('Request expired. Retrying... (' + retries + '/' + maxRetries + ')');
            setTimeout(tryAuthenticate, retryDelay);
            return;
          } else {
            setError('Request expired. Please try again.');
          }
        } else if (errMsg.includes('User rejected')) {
          setError('Authentication cancelled by user');
        } else if (errMsg.includes('already pending')) {
          setError('Please wait - another authentication is in progress');
        } else if (errMsg.includes('network')) {
          setError('Network error - please check connection');
        } else {
          setError(errMsg || 'Authentication failed');
        }
        setIsLoading(false);
      }
    };

    tryAuthenticate();
  }, [auth, address, isLoading, loadIPAssets]);

  // Sign out user using disconnect method
  const signOut = useCallback(async () => {
    if (auth) {
      try {
        await auth.disconnect();
        console.log('🚪 Origin SDK disconnected');
      } catch (err) {
        console.error('Sign out failed:', err);
      }
    }
    
    // Clear local state
    setUser(null);
    setIsAuthenticated(false);
    setIPAssets([]);
    setError(null);
    
    // Clear persisted state
    await AsyncStorage.removeItem('camp_auth_state');
  }, [auth]);

  // Get usage data from Camp Network using Origin API
  const getUsage = useCallback(async (): Promise<UsageData | null> => {
    if (!auth?.origin || !isAuthenticated) {
      console.warn('No authenticated Origin instance for usage data');
      return null;
    }

    try {
      console.log('🔍 Fetching Origin usage data...');
      const originUsage = await auth.origin.getOriginUsage();
      
      if (originUsage && originUsage.user) {
        console.log('✅ Origin usage data received:', originUsage);
        
        // Calculate usage based on available data
        const totalUsage = originUsage.user.points || 0;
        const usageLimit = 1000;
        const remainingUsage = Math.max(usageLimit - totalUsage, 0);
        
        return {
          totalUsage,
          remainingUsage,
          usageLimit,
          refreshDate: new Date().toISOString(),
          multiplier: originUsage.user.multiplier,
          points: originUsage.user.points,
          active: originUsage.user.active,
        };
      }
      
      // Return default data if usage info not available
      return {
        totalUsage: 0,
        remainingUsage: 1000,
        usageLimit: 1000,
        refreshDate: new Date().toISOString(),
        multiplier: 1.0,
        points: 0,
        active: true,
      };
    } catch (err) {
      console.error('❌ Failed to fetch usage data:', err);
      
      // Return fallback data on error
      return {
        totalUsage: 0,
        remainingUsage: 1000,
        usageLimit: 1000,
        refreshDate: new Date().toISOString(),
        multiplier: 1.0,
        points: 0,
        active: false,
      };
    }
  }, [auth?.origin, isAuthenticated]);

  // Get user's Camp Network profile
  const getProfile = useCallback(async () => {
    if (!auth || !isAuthenticated) {
      console.warn('No authenticated user for profile data');
      return null;
    }

    try {
      // Use Origin SDK's profile methods if available
      const linkedSocials = await auth.getLinkedSocials();
      return {
        address: user?.address || address,
        linkedSocials,
        isAuthenticated: true,
        method: 'origin-sdk',
      };
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      return {
        address: user?.address || address,
        linkedSocials: null,
        isAuthenticated: true,
        method: 'origin-sdk',
      };
    }
  }, [auth, isAuthenticated, user?.address, address]);

  // Get linked socials
  const getLinkedSocials = useCallback(async () => {
    if (!auth || !isAuthenticated) {
      return null;
    }

    try {
      return await auth.getLinkedSocials();
    } catch (err) {
      console.error('Failed to fetch linked socials:', err);
      return null;
    }
  }, [auth, isAuthenticated]);

  // Get user's IP assets
  const getIPAssets = useCallback(() => {
    return ipAssets;
  }, [ipAssets]);

  // Create new IP asset (upload file or register social media content)
  const createIPAsset = useCallback(async (
    source: 'file' | 'twitter' | 'spotify' | 'tiktok',
    metadata: Record<string, unknown>,
    licenseTerms: any,
    file?: File
  ) => {
    if (!auth?.origin || !isAuthenticated) {
      throw new Error('Not authenticated with Origin SDK');
    }

    // Ensure provider is set before minting (fix for MetaMask popup not showing)
    try {
      if (connector && address) {
        const eipProvider = await connector.getProvider();
        console.log('🔄 [Mint] Setting EIP-1193 provider before minting:', address);
        auth.setWalletAddress(address);
        auth.setProvider({
          provider: eipProvider,
          info: { name: 'AppKit Wallet' },
          address,
        });
      } else {
        throw new Error('Wallet not connected');
      }

      console.log('🎨 Creating new IP asset:', { source, metadata });

      let result;
      if (source === 'file' && file) {
        result = await auth.origin.mintFile(file, metadata, licenseTerms);
      } else {
        result = await auth.origin.mintSocial(source as any, metadata, licenseTerms);
      }

      console.log('✅ IP asset created:', result);

      // Refresh IP assets list
      await loadIPAssets(auth.origin);

      return result;
    } catch (err) {
      console.error('❌ Failed to create IP asset:', err);
      throw err;
    }
  }, [auth, isAuthenticated, loadIPAssets, connector, address]);

  // Check if user should authenticate (wallet connected but not authenticated)
  const shouldAuthenticate = isConnected && !!auth && !isAuthenticated && !isLoading;

  return {
    auth,
    user,
    isLoading,
    error,
    authenticate,
    signOut,
    getUsage,
    getProfile,
    getLinkedSocials,
    getIPAssets,
    createIPAsset,
    ipAssets,
    shouldAuthenticate,
    isInitialized: !!auth,
    isAuthenticated,
  };
}
