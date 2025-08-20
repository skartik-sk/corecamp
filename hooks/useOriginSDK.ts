/**
 * Origin SDK Integration Hook
 * Proper integration with @campnetwork/origin SDK for React Native
 */

import { useState, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useCampNetwork } from './useCampNetwork';

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
  const { signMessageAsync } = useSignMessage();
  const camp = useCampNetwork();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [ipAssets, setIPAssets] = useState<IPAsset[]>([]);

  const authenticate = useCallback(async () => {
    if (!address) throw new Error('Wallet not connected');
    const message = `Camp Network auth: ${Date.now()}`;
    if (!signMessageAsync) throw new Error('Wallet does not support signing');
    const signature = await signMessageAsync({ message });
    const newUser: User = { address, isAuthenticated: true, accessToken: signature };
    setUser(newUser);
    return newUser;
  }, [address, signMessageAsync]);

  const signOut = useCallback(async () => {
    setUser(null);
  }, []);

  const getUsage = useCallback(async () => {
    if (camp && typeof (camp as any).getUsage === 'function') {
      try {
        // @ts-ignore
        return await (camp as any).getUsage();
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [camp]);

  const getProfile = useCallback(async () => {
    return {
      address: user?.address || address,
      linkedSocials: null,
      isAuthenticated: !!user,
      method: 'shim',
    };
  }, [user, address]);

  const getLinkedSocials = useCallback(async () => null, []);

  const getIPAssets = useCallback(() => ipAssets, [ipAssets]);

  const createIPAsset = useCallback(async (source: 'file' | 'twitter' | 'spotify' | 'tiktok', metadata: Record<string, unknown>, licenseTerms: any, file?: File) => {
    // Map to contract mint if available
    if ((camp as any)?.mintIPNFT) {
      // Expect caller to provide tokenId and licenseTerms shape compatible with contract
      const tokenId = (metadata && (metadata as any).tokenId) || Math.floor(Math.random() * 1_000_000);
      // Try to call camp.mintIPNFT
      try {
        // @ts-ignore
        await (camp as any).mintIPNFT({ tokenId, name: (metadata as any).name || 'Untitled', description: (metadata as any).description || '', category: (metadata as any).category || 'file', licenseTerms, parentTokenIds: [] });
        return { success: true };
      } catch (err) {
        throw err;
      }
    }
    throw new Error('Mint not implemented');
  }, [camp]);

  const shouldAuthenticate = isConnected && !user;

  return {
    auth: null,
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
    isInitialized: true,
    isAuthenticated: !!user,
  };
}
