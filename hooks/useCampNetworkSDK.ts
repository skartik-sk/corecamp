/**
 * Camp Network React Native SDK Integration Hook
 * Uses the custom React Native SDK with proper AppKit integration
 */

import { useCallback, useEffect, useState } from 'react';
import { 
  useCampAuth, 
  useAppKit, 
  useOrigin, 
  useSocials 
} from '../sdk/react-native';

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

interface UsageData {
  totalUsage: number;
  remainingUsage: number;
  usageLimit: number;
  refreshDate: string;
  multiplier?: number;
  points?: number;
  active?: boolean;
}

export function useCampNetworkSDK() {
  const { 
    auth, 
    authenticated, 
    loading, 
    walletAddress, 
    connect, 
    disconnect 
  } = useCampAuth();
  
  const { 
    isAppKitConnected, 
    appKitAddress, 
    openAppKit, 
    disconnectAppKit 
  } = useAppKit();
  
  const { 
    stats, 
    uploads 
  } = useOrigin();
  
  const { socials, isLoading: socialsLoading, refetch: refetchSocials } = useSocials();
  
  const [ipAssets, setIPAssets] = useState<IPAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Process uploads data into IP assets format
  useEffect(() => {
    if (uploads.data && Array.isArray(uploads.data)) {
      const assets = uploads.data.map((upload: any) => ({
        id: upload.tokenId || upload.id,
        title: upload.metadata?.name || upload.title || 'Untitled IP Asset',
        type: upload.source || 'file',
        description: upload.metadata?.description || '',
        price: upload.terms?.price ? `${upload.terms.price} ETH` : 'Not for sale',
        creator: upload.creator || walletAddress,
        status: upload.status || 'owned',
        metadata: upload.metadata,
      }));
      setIPAssets(assets);
    } else {
      setIPAssets([]);
    }
  }, [uploads.data, walletAddress]);

  // Authenticate with Camp Network
  const authenticate = useCallback(async () => {
    setError(null);
    try {
      // First ensure AppKit wallet is connected
      if (!isAppKitConnected) {
        console.log('🔗 Connecting AppKit wallet...');
        await openAppKit();
      }
      
      // Then authenticate with Camp Network
      console.log('🚀 Authenticating with Camp Network...');
      const result = await connect();
      
      if (!result.success) {
        throw new Error(result.message || 'Authentication failed');
      }
      
      console.log('✅ Camp Network authentication successful');
      return result;
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error('❌ Camp Network authentication failed:', errMsg);
      setError(errMsg);
      throw err;
    }
  }, [connect, openAppKit, isAppKitConnected]);

  // Sign out from Camp Network
  const signOut = useCallback(async () => {
    setError(null);
    try {
      await disconnect();
      // Optionally disconnect AppKit as well
      if (isAppKitConnected) {
        await disconnectAppKit();
      }
      console.log('🚪 Signed out from Camp Network');
    } catch (err: any) {
      console.error('❌ Sign out failed:', err);
      setError(err?.message || 'Sign out failed');
    }
  }, [disconnect, disconnectAppKit, isAppKitConnected]);

  // Get usage data from Camp Network
  const getUsage = useCallback(async (): Promise<UsageData | null> => {
    if (!authenticated || !stats.data) {
      return null;
    }

    try {
      // Process stats data into usage format
      const statsData = stats.data;
      const totalUsage = statsData.points || 0;
      const usageLimit = 1000;
      const remainingUsage = Math.max(usageLimit - totalUsage, 0);
      
      return {
        totalUsage,
        remainingUsage,
        usageLimit,
        refreshDate: new Date().toISOString(),
        multiplier: statsData.multiplier,
        points: statsData.points,
        active: statsData.active,
      };
    } catch (err) {
      console.error('❌ Failed to fetch usage data:', err);
      return null;
    }
  }, [authenticated, stats.data]);

  // Get user profile
  const getProfile = useCallback(async () => {
    if (!authenticated) {
      return null;
    }

    try {
      return {
        address: walletAddress || appKitAddress,
        linkedSocials: socials,
        isAuthenticated: authenticated,
        method: 'camp-rn-sdk',
      };
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      return null;
    }
  }, [authenticated, walletAddress, appKitAddress, socials]);

  // Get linked socials
  const getLinkedSocials = useCallback(async () => {
    if (!authenticated) {
      return null;
    }
    
    await refetchSocials();
    return socials;
  }, [authenticated, socials, refetchSocials]);

  // Get user's IP assets
  const getIPAssets = useCallback(() => {
    return ipAssets;
  }, [ipAssets]);

  // Create new IP asset using Origin API
  const createIPAsset = useCallback(async (
    source: 'file' | 'twitter' | 'spotify' | 'tiktok',
    metadata: Record<string, unknown>,
    licenseTerms: any,
    file?: File
  ) => {
    if (!auth?.origin || !authenticated) {
      throw new Error('Not authenticated with Camp Network Origin');
    }

    try {
      console.log('🎨 Creating new IP asset via Camp RN SDK:', { source, metadata });
      
      let result;
      if (source === 'file' && file) {
        result = await auth.origin.mintFile(file, metadata, licenseTerms);
      } else {
        result = await auth.origin.mintSocial(source as any, metadata, licenseTerms);
      }

      console.log('✅ IP asset created successfully:', result);
      
      // Refresh uploads to get the new asset
      await uploads.refetch();
      
      return result;
    } catch (err) {
      console.error('❌ Failed to create IP asset:', err);
      throw err;
    }
  }, [auth?.origin, authenticated, uploads.refetch]);

  // Refresh IP assets
  const refreshAssets = useCallback(async () => {
    if (authenticated) {
      await uploads.refetch();
    }
  }, [authenticated, uploads.refetch]);

  return {
    // Auth state
    auth,
    user: authenticated ? {
      address: walletAddress || appKitAddress,
      isAuthenticated: authenticated,
      accessToken: auth?.jwt || 'authenticated',
    } : null,
    isLoading: loading || uploads.isLoading,
    isAuthenticated: authenticated,
    error,
    
    // Methods
    authenticate,
    signOut,
    getUsage,
    getProfile,
    getLinkedSocials,
    getIPAssets,
    createIPAsset,
    refreshAssets,
    
    // Data
    ipAssets,
    socials,
    socialsLoading,
    
    // AppKit integration
    isAppKitConnected,
    appKitAddress,
    openAppKit,
    
    // Compatibility
    shouldAuthenticate: isAppKitConnected && !authenticated && !loading,
    isInitialized: !!auth,
  };
}
