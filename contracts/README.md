# IP Marketplace Smart Contracts

A comprehensive marketplace for intellectual property NFTs built with Foundry and Solidity.

## Features

### 🎨 **IP NFT Creation**
- Create IP NFTs with metadata and licensing terms
- Set access prices and total supply
- Content hash storage for IPFS integration
- Creator ownership and royalties

### 💰 **Access-Based Purchasing**
- Buy access to IP content (not ownership transfer)
- Flexible access duration (permanent or time-limited)
- Automatic fee distribution to platform and creators
- Refund excess payments

### 🔨 **Auction System**
- Time-based auctions for IP access rights
- Automatic bidder refunds
- Auction settlement with winner access granting
- Starting bid requirements

### 🎰 **Lottery System**
- Random IP access distribution
- Ticket-based entry system
- Configurable ticket prices and limits
- Pseudo-random winner selection

### 🛡️ **Security Features**
- Reentrancy protection
- Access control for creators
- Emergency pause/unpause functionality
- Safe ETH transfers with proper error handling

## Architecture

```
IPMarketplace.sol
├── IP Creation & Management
├── Access Token System
├── Auction Mechanics
├── Lottery System
├── Fee Distribution
└── Admin Functions
```

## Getting Started

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git

### Installation
```bash
forge install
```

### Testing
```bash
forge test -vvv
```

### Deployment
```bash
forge script script/Deploy.s.sol --rpc-url $ANVIL_RPC_URL --broadcast
```

## License
MIT License
