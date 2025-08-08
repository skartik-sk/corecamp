import { keccak256, toBytes, encodePacked, parseEther } from 'viem';

// Camp Network Chain Configuration
export const CAMP_NETWORK_CONFIG = {
  chainId: 123420001114,
  name: 'BaseCamp Testnet',
  rpcUrl: 'https://rpc-camp-network-4xje7wy105.t.conduit.xyz/',
  blockExplorer: 'https://explorer-camp-network-4xje7wy105.t.conduit.xyz/',
  contracts: {
    WCAMP: '0x1aE9c40eCd2DD6ad5858E5430A556d7aff28A44b',
    IpNFT: '0x5a3f832b47b948dA27aE788E96A0CD7BB0dCd1c1',
    Marketplace: '0xBe611BFBDcb45C5E8C3E81a3ec36CBee31E52981',
    DisputeModule: '0x84EAac1B2dc3f84D92Ff84c3ec205B1FA74671fC'
  }
};

// Data status enum from the contract
export enum DataStatus {
  ACTIVE = 0,
  DELETED = 1,
  DISPUTED = 2
}

// License terms interface
export interface LicenseTerms {
  price: bigint;
  duration: bigint;
  royaltyBps: number;
  paymentToken: `0x${string}`;
}

// IP NFT metadata interface
export interface IPNFTMetadata {
  name: string;
  description: string;
  category: string;
  contentType?: string;
  tags?: string[];
  externalUrl?: string;
  image?: string;
}

// Create metadata URI for IP NFT
export function createMetadataURI(metadata: IPNFTMetadata): string {
  const metadataJson = {
    name: metadata.name,
    description: metadata.description,
    category: metadata.category,
    content_type: metadata.contentType || 'text',
    tags: metadata.tags || [],
    external_url: metadata.externalUrl || '',
    image: metadata.image || '',
    properties: {
      category: metadata.category,
      content_type: metadata.contentType || 'text'
    }
  };

  return `data:application/json,${encodeURIComponent(JSON.stringify(metadataJson))}`;
}

// Create content hash from content
export function createContentHash(content: string): `0x${string}` {
  const contentBytes = toBytes(content);
  return keccak256(contentBytes);
}

// Helper to generate token ID (in production, this should come from backend)
export function generateTokenId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// Helper to create license terms
export function createLicenseTerms(
  priceEth: string,
  durationDays: number,
  royaltyPercent: number,
  paymentToken: string = '0x0000000000000000000000000000000000000000'
): LicenseTerms {
  return {
    price: parseEther(priceEth),
    duration: BigInt(durationDays * 24 * 60 * 60), // Convert days to seconds
    royaltyBps: royaltyPercent * 100, // Convert percentage to basis points
    paymentToken: paymentToken as `0x${string}`
  };
}

// Helper to format subscription expiry
export function formatSubscriptionExpiry(expiry: bigint): string {
  const expiryDate = new Date(Number(expiry) * 1000);
  const now = new Date();
  
  if (expiryDate <= now) {
    return 'Expired';
  }
  
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '1 day remaining';
  } else if (diffDays < 30) {
    return `${diffDays} days remaining`;
  } else {
    return expiryDate.toLocaleDateString();
  }
}

// Helper to calculate subscription cost
export function calculateSubscriptionCost(pricePerPeriod: bigint, periods: number): bigint {
  return pricePerPeriod * BigInt(periods);
}

// Categories for IP NFTs
export const IP_CATEGORIES = [
  'Art',
  'Music', 
  'Writing',
  'Code',
  'Research',
  'Photography',
  'Video',
  'Design',
  'Patent',
  'Trademark',
  'Other'
] as const;

export type IPCategory = typeof IP_CATEGORIES[number];

// Contract event types
export interface IPCreatedEvent {
  tokenId: bigint;
  creator: string;
  name: string;
  category: string;
  contentHash: `0x${string}`;
}

export interface AccessPurchasedEvent {
  tokenId: bigint;
  buyer: string;
  periods: number;
  expiry: bigint;
  totalPrice: bigint;
}

export interface DisputeRaisedEvent {
  disputeId: bigint;
  initiator: string;
  targetId: bigint;
  disputeTag: `0x${string}`;
}

// Helper to parse contract events
export function parseIPCreatedEvent(log: any): IPCreatedEvent | null {
  try {
    return {
      tokenId: log.args.tokenId,
      creator: log.args.creator,
      name: log.args.name || '',
      category: log.args.category || '',
      contentHash: log.args.contentHash
    };
  } catch (error) {
    console.error('Error parsing IP created event:', error);
    return null;
  }
}

export function parseAccessPurchasedEvent(log: any): AccessPurchasedEvent | null {
  try {
    return {
      tokenId: log.args.tokenId,
      buyer: log.args.buyer,
      periods: log.args.periods,
      expiry: log.args.expiry,
      totalPrice: log.args.totalPrice
    };
  } catch (error) {
    console.error('Error parsing access purchased event:', error);
    return null;
  }
}

// Error handling helpers
export function handleContractError(error: any): string {
  if (error?.message) {
    // Common contract errors
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for this transaction';
    }
    if (error.message.includes('user rejected')) {
      return 'Transaction was rejected by user';
    }
    if (error.message.includes('Not token owner')) {
      return 'You are not the owner of this IP NFT';
    }
    if (error.message.includes('Invalid signature')) {
      return 'Invalid signature provided';
    }
    if (error.message.includes('Token already exists')) {
      return 'This IP NFT already exists';
    }
    if (error.message.includes('Sold out')) {
      return 'All access tokens for this IP have been sold';
    }
    if (error.message.includes('Insufficient payment')) {
      return 'Payment amount is too low';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// Validation helpers
export function validateIPNFTForm(form: {
  name: string;
  description: string;
  price: string;
  duration: string;
  royalty: string;
}): string | null {
  if (!form.name.trim()) {
    return 'Name is required';
  }
  if (!form.description.trim()) {
    return 'Description is required';
  }
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
    return 'Valid price is required';
  }
  if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) <= 0) {
    return 'Valid duration is required';
  }
  if (!form.royalty || isNaN(Number(form.royalty)) || Number(form.royalty) < 0 || Number(form.royalty) > 100) {
    return 'Royalty must be between 0 and 100';
  }
  return null;
}

// Storage helpers for caching
export const STORAGE_KEYS = {
  USER_IPNFTS: 'user_ipnfts',
  USER_SUBSCRIPTIONS: 'user_subscriptions',
  MARKETPLACE_CACHE: 'marketplace_cache'
} as const;
