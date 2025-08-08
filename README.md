# 🏕️ Camp Network IP Marketplace

A beautiful React Native app for creating, trading, and managing intellectual property on Camp Network. Built with Expo, WalletConnect AppKit, and Wagmi.

## ✨ Features

### 🎨 Beautiful UI & UX
- **Light, Modern Design**: Clean whitish background with Camp Network's signature orange (#FF6B35) and complementary colors
- **Stunning Sign-in Screen**: Beautiful onboarding experience with feature highlights
- **Responsive Layout**: Optimized for mobile devices with smooth animations
- **Camp Network Branding**: Consistent use of Camp's color palette and branding

### 🔗 Wallet Integration
- **Multiple Wallets**: Support for MetaMask, Rainbow, Coinbase, and more via WalletConnect
- **AppKit Integration**: Seamless wallet connection experience
- **Network Switching**: Automatic Camp Network (Base testnet) switching
- **Real-time Connection Status**: Live wallet and network status updates

### 💎 IP Marketplace Features
- **Create IP NFTs**: Transform your intellectual property into tradeable digital assets
- **Browse & Search**: Discover IP assets with filtering by category and type
- **Live Auctions**: Participate in time-limited auctions for premium content
- **Lottery System**: Try your luck with lottery-style IP acquisitions
- **Chat & Negotiate**: Direct messaging with creators and collectors

### 🛠 Technical Excellence
- **Camp Network Integration**: Built-in support for Camp Network's deployed contracts
- **Smart Contract Interaction**: Direct interaction with IP NFT, Marketplace, and other contracts
- **Type Safety**: Full TypeScript support throughout the application
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance**: Optimized for smooth mobile experience

## 📱 App Structure

### Core Screens
1. **Sign-in Screen** (`/sign-in`) - Beautiful onboarding with wallet connection
2. **Home Dashboard** (`/`) - Overview of user's IP assets and quick actions
3. **Create IP** (`/create`) - Form to mint new IP NFTs with licensing terms
4. **Marketplace** (`/marketplace`) - Browse and purchase IP assets
5. **Chat & Trade** (`/chat`) - Negotiate with other users
6. **Auctions** (`/auctions`) - Participate in IP auctions

### Smart Contracts Integration
- **IP NFT Contract**: `0x5a3f832b47b948dA27aE788E96A0CD7BB0dCd1c1`
- **Marketplace Contract**: `0xBe611BFBDcb45C5E8C3E81a3ec36CBee31E52981`
- **Dispute Module**: `0x84EAac1B2dc3f84D92Ff84c3ec205B1FA74671fC`
- **wCAMP Token**: `0x1aE9c40eCd2DD6ad5858E5430A556d7aff28A44b`

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

### Environment Setup
Create a `.env` file with your configuration:
```env
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
EXPO_PUBLIC_ORIGIN_CLIENT_ID=your_camp_client_id
EXPO_PUBLIC_ORIGIN_API=https://camp-network-api-url
EXPO_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/your-subgraph
```

---

**Built with ❤️ for the Camp Network community**

🏕️ **Making IP programmable, collaborative, and composable**
# corecamp
