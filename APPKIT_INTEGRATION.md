# AppKit Integration for Camp Network Origin SDK

This guide shows how to integrate AppKit with the Camp Network Origin SDK for complete wallet functionality including connection, signing, and transactions.

## Why AppKit Integration?

The Camp Network SDK provides authentication and social features, while AppKit handles:
- Wallet connection and management
- Message and transaction signing  
- Network switching
- Direct wallet operations
- Multi-wallet support

## Installation

```bash
# Install the base SDK
npm install @campnetwork/origin-sdk

# Choose your AppKit implementation:

# Option 1: Web3Modal (Recommended)
npm install @web3modal/ethers5-react-native @web3modal/react-native

# Option 2: WalletConnect
npm install @walletconnect/react-native-dapp @walletconnect/client

# Option 3: Rainbow Kit (if available for RN)
npm install @rainbow-me/rainbowkit-react-native
```

## Configuration

### 1. AppKit Setup

```typescript
// config/appkit.ts
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5-react-native';

const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // Get from cloud.walletconnect.com

const chains = [
  {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_KEY'
  },
  {
    chainId: 137,
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com'
  }
];

const ethersConfig = defaultConfig({
  metadata: {
    name: 'Your App Name',
    description: 'Your App Description',
    url: 'https://yourapp.com',
    icons: ['https://yourapp.com/icon.png'],
    redirect: {
      native: 'yourapp://'
    }
  }
});

export const appKit = createWeb3Modal({
  projectId,
  chains,
  config: ethersConfig,
  enableAnalytics: true,
});
```

### 2. App Root Setup

```typescript
// App.tsx
import React from 'react';
import { CampProvider } from '@campnetwork/origin-sdk/react-native';
import { AppKitProvider } from '@campnetwork/origin-sdk/react-native/appkit';
import { appKit } from './config/appkit';
import MainApp from './src/MainApp';

export default function App() {
  return (
    <AppKitProvider appKit={appKit}>
      <CampProvider 
        clientId="your-camp-client-id"
        appKit={appKit} // Pass AppKit for wallet operations
        redirectUri={{
          twitter: "yourapp://redirect/twitter",
          discord: "yourapp://redirect/discord", 
          spotify: "yourapp://redirect/spotify"
        }}
      >
        <MainApp />
      </CampProvider>
    </AppKitProvider>
  );
}
```

## Usage Examples

### Basic Wallet Connection

```typescript
// components/WalletConnection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  CampButton, 
  AppKitButton,
  useCampAuth, 
  useAppKit 
} from '@campnetwork/origin-sdk/react-native';

export default function WalletConnection() {
  const { 
    isAuthenticated, 
    walletAddress, 
    connect: campConnect,
    disconnect: campDisconnect 
  } = useCampAuth();
  
  const { 
    isConnected, 
    address, 
    openAppKit,
    disconnect 
  } = useAppKit();

  return (
    <View style={styles.container}>
      {/* Camp Network Authentication */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Camp Network</Text>
        <Text>Status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</Text>
        {walletAddress && <Text>Address: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</Text>}
        
        <CampButton 
          onPress={isAuthenticated ? campDisconnect : campConnect}
          style={styles.button}
        >
          {isAuthenticated ? 'Disconnect Camp' : 'Connect to Camp'}
        </CampButton>
      </View>

      {/* Direct AppKit Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallet Connection</Text>
        <Text>Wallet: {isConnected ? 'Connected' : 'Not connected'}</Text>
        {address && <Text>Address: {address.slice(0, 6)}...{address.slice(-4)}</Text>}
        
        <AppKitButton style={styles.button} />
        
        {/* Alternative: Custom button */}
        <CampButton 
          onPress={isConnected ? disconnect : openAppKit}
          style={[styles.button, { backgroundColor: '#3B82F6' }]}
        >
          {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
        </CampButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  button: {
    marginTop: 12,
  },
});
```

### Message Signing

```typescript
// components/MessageSigning.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { CampButton, useAppKit } from '@campnetwork/origin-sdk/react-native';

export default function MessageSigning() {
  const [message, setMessage] = useState('Hello from Camp Network!');
  const [signature, setSignature] = useState('');
  const { signMessage, isConnected } = useAppKit();

  const handleSign = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    try {
      const sig = await signMessage(message);
      setSignature(sig);
      Alert.alert('Success', 'Message signed successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign message');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Message Signing
      </Text>
      
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}
        value={message}
        onChangeText={setMessage}
        placeholder="Enter message to sign"
        multiline
      />
      
      <CampButton 
        onPress={handleSign}
        disabled={!isConnected}
        style={{ marginBottom: 16 }}
      >
        Sign Message
      </CampButton>
      
      {signature && (
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Signature:</Text>
          <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>
            {signature}
          </Text>
        </View>
      )}
    </View>
  );
}
```

### Transaction Sending

```typescript
// components/TransactionSending.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { CampButton, useAppKit } from '@campnetwork/origin-sdk/react-native';

export default function TransactionSending() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.01');
  const [txHash, setTxHash] = useState('');
  
  const { sendTransaction, isConnected, address } = useAppKit();

  const handleSendTransaction = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    try {
      const tx = await sendTransaction({
        to: recipient,
        value: amount, // ETH amount
      });
      
      setTxHash(tx.hash);
      Alert.alert('Success', `Transaction sent: ${tx.hash}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send transaction');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Send Transaction
      </Text>
      
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
        value={recipient}
        onChangeText={setRecipient}
        placeholder="Recipient address (0x...)"
      />
      
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount in ETH"
        keyboardType="numeric"
      />
      
      <CampButton 
        onPress={handleSendTransaction}
        disabled={!isConnected || !recipient}
        style={{ marginBottom: 16 }}
      >
        Send Transaction
      </CampButton>
      
      {txHash && (
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Transaction Hash:</Text>
          <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>
            {txHash}
          </Text>
        </View>
      )}
    </View>
  );
}
```

### Advanced: Custom Hook

```typescript
// hooks/useCampWithWallet.ts
import { useCampAuth, useAppKit } from '@campnetwork/origin-sdk/react-native';

export function useCampWithWallet() {
  const campAuth = useCampAuth();
  const appKit = useAppKit();
  
  const connectBoth = async () => {
    try {
      // First connect wallet via AppKit
      if (!appKit.isConnected) {
        await appKit.openAppKit();
      }
      
      // Then authenticate with Camp
      if (!campAuth.isAuthenticated) {
        await campAuth.connect();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to connect both:', error);
      throw error;
    }
  };
  
  const disconnectBoth = async () => {
    try {
      await campAuth.disconnect();
      await appKit.disconnect();
    } catch (error) {
      console.error('Failed to disconnect both:', error);
      throw error;
    }
  };
  
  return {
    // Combined status
    isFullyConnected: campAuth.isAuthenticated && appKit.isConnected,
    isLoading: campAuth.isLoading || appKit.isConnecting,
    
    // Individual states
    camp: campAuth,
    wallet: appKit,
    
    // Combined actions
    connectBoth,
    disconnectBoth,
  };
}
```

## API Reference

### AppKit Provider Props
```typescript
interface AppKitProviderProps {
  appKit: any; // Your AppKit instance
  children: ReactNode;
}
```

### useAppKit Hook
```typescript
interface UseAppKitReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  chainId: number | null;
  
  // Actions
  openAppKit: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  
  // Signing & Transactions
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (tx: TransactionRequest) => Promise<TransactionResponse>;
  
  // Direct access
  appKit: any; // Direct AppKit instance access
}
```

### CampProvider with AppKit
```typescript
interface CampProviderProps {
  clientId: string;
  redirectUri?: string | Record<string, string>;
  allowAnalytics?: boolean;
  appKit?: any; // AppKit instance for wallet operations
  children: ReactNode;
}
```

## Best Practices

1. **Always wrap AppKitProvider outside CampProvider**
2. **Handle connection errors gracefully**
3. **Check both wallet and camp authentication states**
4. **Use the combined hook for better UX**
5. **Test on multiple wallets (MetaMask, WalletConnect, etc.)**

## Troubleshooting

### Common Issues

1. **"AppKit not found"**
   - Ensure AppKitProvider wraps your app
   - Check AppKit instance is properly configured

2. **Signing fails**
   - Verify wallet is connected
   - Check network compatibility
   - Handle user rejection gracefully

3. **Authentication loop**
   - Clear AsyncStorage if needed
   - Check wallet address consistency

### Debug Tools

```typescript
// Add to your component for debugging
const { getAppKit } = useCamp();
console.log('AppKit instance:', getAppKit());
```

## Platform-Specific Notes

### Expo
- Use `expo install` for dependencies
- Configure deep linking in `app.json`
- Test on physical devices for wallet apps

### React Native
- Link native dependencies properly
- Configure Android deep linking
- Test wallet app redirections

This integration provides a complete wallet solution alongside Camp Network's authentication and social features.
