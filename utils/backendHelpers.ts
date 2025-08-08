// Backend service helpers for Camp Network integration
// This would typically run on a backend server with the signer private key

import { keccak256, toBytes, encodePacked, Signature, hashTypedData } from 'viem';

// EIP-712 Domain for Camp Network IpNFT contract
export const EIP712_DOMAIN = {
  name: 'IpNFT',
  version: '1',
  chainId: 123420001114, // BaseCamp Testnet
  verifyingContract: '0x5a3f832b47b948dA27aE788E96A0CD7BB0dCd1c1' as `0x${string}`
};

// EIP-712 Types for minting
export const MINT_TYPES = {
  MintRequest: [
    { name: 'to', type: 'address' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'parents', type: 'uint256[]' },
    { name: 'deadline', type: 'uint256' },
    { name: 'contentHash', type: 'bytes32' },
    { name: 'uri', type: 'string' },
    { name: 'licenseTerms', type: 'LicenseTerms' }
  ],
  LicenseTerms: [
    { name: 'price', type: 'uint256' },
    { name: 'duration', type: 'uint256' },
    { name: 'royaltyBps', type: 'uint16' },
    { name: 'paymentToken', type: 'address' }
  ]
};

export interface MintRequestData {
  to: `0x${string}`;
  tokenId: bigint;
  parents: bigint[];
  deadline: bigint;
  contentHash: `0x${string}`;
  uri: string;
  licenseTerms: {
    price: bigint;
    duration: bigint;
    royaltyBps: number;
    paymentToken: `0x${string}`;
  };
}

// Create typed data hash for minting (this would be done on backend)
export function createMintTypedDataHash(data: MintRequestData): `0x${string}` {
  return hashTypedData({
    domain: EIP712_DOMAIN,
    types: MINT_TYPES,
    primaryType: 'MintRequest',
    message: data as any
  });
}

// Simulate backend signature generation
export function simulateBackendSignature(data: MintRequestData): {
  signature: `0x${string}`;
  hash: `0x${string}`;
} {
  // In production, this would be signed with the backend's private key
  const hash = createMintTypedDataHash(data);
  
  // Mock signature - replace with actual signing in production
  const mockSignature = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1c';
  
  return {
    signature: mockSignature as `0x${string}`,
    hash
  };
}

// Backend API endpoints that would be implemented
export const BACKEND_ENDPOINTS = {
  // Request signature for minting
  REQUEST_MINT_SIGNATURE: '/api/camp/mint-signature',
  // Verify content and generate metadata
  VERIFY_CONTENT: '/api/camp/verify-content',
  // Get IP NFT metadata
  GET_METADATA: '/api/camp/metadata',
  // Upload content to IPFS/storage
  UPLOAD_CONTENT: '/api/camp/upload'
};

// Example backend request for mint signature
export interface MintSignatureRequest {
  walletAddress: `0x${string}`;
  name: string;
  description: string;
  category: string;
  contentHash: string;
  price: string; // in ETH
  durationDays: number;
  royaltyPercent: number;
  parentTokenIds?: number[];
}

export interface MintSignatureResponse {
  success: boolean;
  tokenId: number;
  signature: `0x${string}`;
  deadline: number;
  hash: `0x${string}`;
  error?: string;
}

// Example: Mock backend mint signature service
export async function requestMintSignature(
  request: MintSignatureRequest
): Promise<MintSignatureResponse> {
  try {
    // In production, this would make an API call to your backend
    const tokenId = Date.now(); // Generate unique token ID
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    
    const mintData: MintRequestData = {
      to: request.walletAddress,
      tokenId: BigInt(tokenId),
      parents: request.parentTokenIds?.map(id => BigInt(id)) || [],
      deadline: BigInt(deadline),
      contentHash: keccak256(toBytes(request.contentHash)),
      uri: `data:application/json,${encodeURIComponent(JSON.stringify({
        name: request.name,
        description: request.description,
        category: request.category
      }))}`,
      licenseTerms: {
        price: BigInt(Math.floor(parseFloat(request.price) * 1e18)), // Convert ETH to wei
        duration: BigInt(request.durationDays * 24 * 60 * 60), // Convert days to seconds
        royaltyBps: request.royaltyPercent * 100, // Convert percent to basis points
        paymentToken: '0x0000000000000000000000000000000000000000' // ETH
      }
    };
    
    const { signature, hash } = simulateBackendSignature(mintData);
    
    return {
      success: true,
      tokenId,
      signature,
      deadline,
      hash
    };
  } catch (error) {
    return {
      success: false,
      tokenId: 0,
      signature: '0x' as `0x${string}`,
      deadline: 0,
      hash: '0x' as `0x${string}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Content verification helpers
export function validateContentHash(content: string, providedHash: string): boolean {
  const computedHash = keccak256(toBytes(content));
  return computedHash === providedHash;
}

export function generateContentHash(content: string): `0x${string}` {
  return keccak256(toBytes(content));
}

// IPFS/Storage helpers (mock implementation)
export async function uploadToIPFS(content: any): Promise<string> {
  // In production, this would upload to IPFS or other decentralized storage
  // For now, return a mock IPFS hash
  const mockHash = `Qm${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
  return `https://ipfs.io/ipfs/${mockHash}`;
}

export async function uploadMetadataToIPFS(metadata: any): Promise<string> {
  // Upload JSON metadata to IPFS
  return uploadToIPFS(JSON.stringify(metadata, null, 2));
}

// Rate limiting and security helpers
export const RATE_LIMITS = {
  MINT_REQUESTS_PER_HOUR: 10,
  SIGNATURE_REQUESTS_PER_MINUTE: 5
};

export function checkRateLimit(userAddress: string, action: string): boolean {
  // In production, implement proper rate limiting logic
  // Check against Redis/database for user's recent requests
  return true; // Mock: always allow for demo
}

// Validation helpers
export function validateMintRequest(request: MintSignatureRequest): string | null {
  if (!request.walletAddress || !request.walletAddress.startsWith('0x')) {
    return 'Invalid wallet address';
  }
  
  if (!request.name || request.name.trim().length === 0) {
    return 'Name is required';
  }
  
  if (!request.description || request.description.trim().length === 0) {
    return 'Description is required';
  }
  
  if (!request.price || isNaN(parseFloat(request.price)) || parseFloat(request.price) <= 0) {
    return 'Valid price is required';
  }
  
  if (!request.durationDays || request.durationDays <= 0) {
    return 'Valid duration is required';
  }
  
  if (request.royaltyPercent < 0 || request.royaltyPercent > 100) {
    return 'Royalty must be between 0 and 100 percent';
  }
  
  return null;
}
