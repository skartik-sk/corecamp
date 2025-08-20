import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CAMP_NETWORK_CONFIG, LicenseTerms, createMetadataURI, createContentHash, handleContractError } from '../utils/campNetworkHelpers';

// Contract ABIs
const IPNFT_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'creatorContentHash', type: 'bytes32' },
      { name: 'uri', type: 'string' },
      { name: 'licenseTerms', type: 'tuple', components: [
        { name: 'price', type: 'uint256' },
        { name: 'duration', type: 'uint256' },
        { name: 'royaltyBps', type: 'uint16' },
        { name: 'paymentToken', type: 'address' }
      ]},
      { name: 'deadline', type: 'uint256' },
      { name: 'parents', type: 'uint256[]' },
      { name: 'signature', type: 'bytes' }
    ],
    name: 'mintWithSignature',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getTerms',
    outputs: [{ 
      name: '', 
      type: 'tuple',
      components: [
        { name: 'price', type: 'uint256' },
        { name: 'duration', type: 'uint256' },
        { name: 'royaltyBps', type: 'uint16' },
        { name: 'paymentToken', type: 'address' }
      ]
    }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'dataStatus',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

const MARKETPLACE_ABI = [
  {
    inputs: [
      { name: 'buyer', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'periods', type: 'uint32' }
    ],
    name: 'buyAccess',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
    name: 'hasAccess',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'user', type: 'address' }
    ],
    name: 'subscriptionExpiry',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export const useCampNetwork = () => {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isOnCampNetwork, setIsOnCampNetwork] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract write hooks
  const { writeContract: writeMintIPNFT, data: mintHash } = useWriteContract();
  const { writeContract: writeBuyAccess, data: buyAccessHash } = useWriteContract();

  // Transaction receipt hooks
  const { isLoading: isMintPending } = useWaitForTransactionReceipt({
    hash: mintHash,
  });
  const { isLoading: isBuyAccessPending } = useWaitForTransactionReceipt({
    hash: buyAccessHash,
  });

  useEffect(() => {
    setIsOnCampNetwork(chain?.id === CAMP_NETWORK_CONFIG.chainId);
  }, [chain?.id]);

  const switchToCampNetwork = async () => {
    if (!walletClient) return false;
    
    try {
      await walletClient.switchChain({ id: CAMP_NETWORK_CONFIG.chainId });
      return true;
    } catch (error) {
      console.error('Failed to switch to Camp Network:', error);
      setError('Failed to switch to Camp Network');
      return false;
    }
  };

  const getNetworkStatus = () => {
    if (!isConnected) return 'disconnected';
    if (!isOnCampNetwork) return 'wrong-network';
    return 'connected';
  };

  // Check if user has access to a specific IP NFT
  const useHasAccess = (tokenId: bigint | undefined) => {
    return useReadContract({
      address: CAMP_NETWORK_CONFIG.contracts.Marketplace as `0x${string}`,
      abi: MARKETPLACE_ABI,
      functionName: 'hasAccess',
      args: address && tokenId ? [address, tokenId] : undefined,
    });
  };

  // Get subscription expiry for a specific IP NFT
  const useSubscriptionExpiry = (tokenId: bigint | undefined) => {
    return useReadContract({
      address: CAMP_NETWORK_CONFIG.contracts.Marketplace as `0x${string}`,
      abi: MARKETPLACE_ABI,
      functionName: 'subscriptionExpiry',
      args: address && tokenId ? [tokenId, address] : undefined,
    });
  };

  // Get license terms for an IP NFT
  const useGetTerms = (tokenId: bigint | undefined) => {
    return useReadContract({
      address: CAMP_NETWORK_CONFIG.contracts.IpNFT as `0x${string}`,
      abi: IPNFT_ABI,
      functionName: 'getTerms',
      args: tokenId ? [tokenId] : undefined,
    });
  };

  // Get data status of an IP NFT
  const useDataStatus = (tokenId: bigint | undefined) => {
    return useReadContract({
      address: CAMP_NETWORK_CONFIG.contracts.IpNFT as `0x${string}`,
      abi: IPNFT_ABI,
      functionName: 'dataStatus',
      args: tokenId ? [tokenId] : undefined,
    });
  };

  // Mint a new IP NFT (requires signature from backend)
  const mintIPNFT = useCallback(async (params: {
    tokenId: number;
    name: string;
    description: string;
    category: string;
    licenseTerms: LicenseTerms;
    parentTokenIds?: bigint[];
    signature?: `0x${string}`;
  }) => {
    if (!address || !isOnCampNetwork) {
      setError('Please connect to Camp Network');
      return false;
    }

    try {
      const { tokenId, name, description, category, licenseTerms, parentTokenIds = [], signature = '0x' } = params;
      
      const contentHash = createContentHash(`${name}:${description}:${category}`);
      const metadataURI = createMetadataURI({
        name,
        description,
        category
      });
      
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

    writeMintIPNFT({
        address: CAMP_NETWORK_CONFIG.contracts.IpNFT as `0x${string}`,
        abi: IPNFT_ABI,
        functionName: 'mintWithSignature',
        args: [
          address,
          BigInt(tokenId),
          contentHash,
      metadataURI,
      // licenseTerms shape can be complex; cast to any to satisfy ABI tuple typing
      licenseTerms as any,
          deadline,
          parentTokenIds,
          signature
        ]
      });

      return true;
    } catch (error: any) {
      const errorMessage = handleContractError(error);
      setError(errorMessage);
      return false;
    }
  }, [address, isOnCampNetwork, writeMintIPNFT]);

  // Buy access to an IP NFT
  const buyAccess = useCallback(async (tokenId: bigint, periods: number, pricePerPeriod: bigint) => {
    if (!address || !isOnCampNetwork) {
      setError('Please connect to Camp Network');
      return false;
    }

    try {
      const totalPrice = pricePerPeriod * BigInt(periods);

      writeBuyAccess({
        address: CAMP_NETWORK_CONFIG.contracts.Marketplace as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'buyAccess',
        args: [address, tokenId, periods],
        value: totalPrice
      });

      return true;
    } catch (error: any) {
      const errorMessage = handleContractError(error);
      setError(errorMessage);
      return false;
    }
  }, [address, isOnCampNetwork, writeBuyAccess]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Basic connection info
    address,
    isConnected,
    isOnCampNetwork,
    switchToCampNetwork,
    getNetworkStatus,
    publicClient,
    walletClient,
    chainId: chain?.id,

    // Contract interaction
    mintIPNFT,
    buyAccess,
    
    // Contract read hooks
    useHasAccess,
    useSubscriptionExpiry,
    useGetTerms,
    useDataStatus,

    // Transaction states
    isMintPending,
    isBuyAccessPending,
    mintHash,
    buyAccessHash,

    // Error handling
    error,
    clearError,

    // Contract addresses
    contracts: CAMP_NETWORK_CONFIG.contracts
  };
};
