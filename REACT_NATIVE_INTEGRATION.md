<p align="center">
<img src="https://imgur.com/7nLZezD.png" height="200px"/>
</p>
<br/>

<p align="center">
  <a href="https://www.npmjs.com/package/@campnetwork/origin"><img src="https://img.shields.io/npm/v/@campnetwork/origin?style=for-the-badge" alt="npm version"/></a>
  <img alt="GitHub License" src="https://img.shields.io/github/license/campaign-layer/camp-sdk?style=for-the-badge">
  <img src="https://img.shields.io/npm/last-update/%40campnetwork%2Forigin?style=for-the-badge" alt="npm last update"/>
  <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40campnetwork%2Forigin?style=for-the-badge">
</p>

# Origin SDK

The Origin SDK currently exposes the following modules:

- `"@campnetwork/origin"` - The main entry point for the SDK, exposes the following classes:
  - `TwitterAPI` - For fetching user Twitter data from the Auth Hub
  - `SpotifyAPI` - For fetching user Spotify data from the Auth Hub
  - `Auth` - For authenticating users with the Origin SDK
- `"@campnetwork/origin/react"` - Exposes the CampProvider and CampContext, as well as React components and hooks for authentication and fetching user data via the Camp Auth Hub
- `"@campnetwork/origin/react-native"` - **Complete React Native/Expo compatibility** with full AppKit integration for wallet operations, native UI components, and mobile-optimized authentication flows

# Origin SDK

The Origin SDK currently exposes the following modules:

- `"@campnetwork/origin"` - The main entry point for the SDK, exposes the following classes:
  - `TwitterAPI` - For fetching user Twitter data from the Auth Hub
  - `SpotifyAPI` - For fetching user Spotify data from the Auth Hub
  - `Auth` - For authenticating users with the Origin SDK
- `"@campnetwork/origin/react"` - Exposes the CampProvider and CampContext, as well as React components and hooks for authentication and fetching user data via the Camp Auth Hub
- `"@campnetwork/origin/react-native"` - **Complete React Native/Expo compatibility** with full AppKit integration for wallet operations, native UI components, and mobile-optimized authentication flows

---

## 📱 React Native/Expo Integration

### Prerequisites
- React Native 0.64+ or Expo SDK 45+
- Node.js and npm/yarn installed
- Camp Network client ID (get from [Camp Network Dashboard](https://dashboard.campnetwork.xyz))
- AppKit setup for wallet operations

### Installation & Dependencies

```bash
# Core SDK (if published)
npm install @campnetwork/origin-sdk

# OR copy built files to your project:
# FROM: /path/to/origin-sdk/dist/react-native/
# TO: /your-expo-app/src/camp-sdk/

# Required dependencies
npm install @react-native-async-storage/async-storage
npm install react-native-svg

# AppKit dependencies (choose your preferred solution)
npm install @web3modal/ethers5-react-native @web3modal/react-native
# OR
npm install @walletconnect/react-native-dapp
# OR other wallet connection solution

# If using Expo
npx expo install @react-native-async-storage/async-storage react-native-svg
```

### AppKit Configuration

First, set up AppKit for wallet operations:

```typescript
// config/appkit.ts
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5-react-native';

// Get your project ID from https://cloud.walletconnect.com
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID';

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
  },
  {
    chainId: 8453,
    name: 'Base',
    currency: 'ETH',
    explorerUrl: 'https://basescan.org',
    rpcUrl: 'https://mainnet.base.org'
  }
];

const ethersConfig = defaultConfig({
  metadata: {
    name: 'Your App Name',
    description: 'Your App Description',
    url: 'https://yourapp.com',
    icons: ['https://yourapp.com/icon.png'],
    redirect: {
      native: 'yourapp://', // Your app's deep link scheme
      universal: 'https://yourapp.com'
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

### App Setup

Wrap your app with both AppKit and Camp providers:

```typescript
// App.tsx
import React from 'react';
import { CampProvider } from './src/camp-sdk'; // or '@campnetwork/origin-sdk/react-native'
import { AppKitProvider } from './src/camp-sdk/appkit'; // or '@campnetwork/origin-sdk/react-native/appkit'
import { appKit } from './config/appkit';
import MainApp from './src/MainApp';

export default function App() {
  return (
    <AppKitProvider appKit={appKit}>
      <CampProvider 
        clientId="your-camp-client-id" // Get from Camp Network Dashboard
        appKit={appKit} // Pass AppKit for wallet operations
        redirectUri={{
          twitter: "yourapp://redirect/twitter",
          discord: "yourapp://redirect/discord", 
          spotify: "yourapp://redirect/spotify"
        }}
        allowAnalytics={true}
      >
        <MainApp />
      </CampProvider>
    </AppKitProvider>
  );
}
```

### Basic Usage

```typescript
// components/CampIntegration.tsx
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { 
  CampButton, 
  CampModal,
  useCampAuth, 
  useAppKit,
  AppKitButton,
  useSocials
} from './src/camp-sdk'; // or '@campnetwork/origin-sdk/react-native'

export default function CampIntegration() {
  const { 
    isAuthenticated, 
    isLoading, 
    walletAddress, 
    error,
    connect: campConnect,
    disconnect: campDisconnect,
    clearError 
  } = useCampAuth();

  const { 
    isConnected: isWalletConnected,
    address: appKitAddress,
    openAppKit,
    disconnect: disconnectWallet,
    signMessage,
    sendTransaction,
    switchNetwork,
    getAppKit // Direct AppKit access
  } = useAppKit();

  const { data: socials, linkSocial, unlinkSocial } = useSocials();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camp Network Integration</Text>
      
      {/* Camp Authentication Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Camp Authentication</Text>
        <Text style={styles.status}>
          Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}
        </Text>
        {walletAddress && (
          <Text style={styles.address}>
            Camp Address: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </Text>
        )}
        
        <CampButton 
          onPress={isAuthenticated ? campDisconnect : campConnect}
          loading={isLoading}
          style={styles.button}
        >
          {isAuthenticated ? 'Disconnect from Camp' : 'Connect to Camp'}
        </CampButton>
      </View>

      {/* Wallet Connection Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallet Connection</Text>
        <Text style={styles.status}>
          Wallet: {isWalletConnected ? '✅ Connected' : '❌ Not connected'}
        </Text>
        {appKitAddress && (
          <Text style={styles.address}>
            Wallet Address: {appKitAddress.slice(0, 6)}...{appKitAddress.slice(-4)}
          </Text>
        )}
        
        {/* Pre-built AppKit Button */}
        <AppKitButton style={styles.button} />
        
        {/* OR Custom button */}
        <CampButton 
          onPress={isWalletConnected ? disconnectWallet : openAppKit}
          style={[styles.button, { backgroundColor: '#3B82F6' }]}
        >
          {isWalletConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
        </CampButton>
      </View>

      {/* Wallet Operations */}
      {isWalletConnected && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Operations</Text>
          
          <CampButton 
            onPress={async () => {
              try {
                const signature = await signMessage("Hello from Camp Network!");
                Alert.alert('Success', `Message signed: ${signature.slice(0, 20)}...`);
              } catch (error: any) {
                Alert.alert('Error', error.message);
              }
            }}
            style={styles.button}
          >
            Sign Message
          </CampButton>

          <CampButton 
            onPress={async () => {
              try {
                await switchNetwork(137); // Switch to Polygon
                Alert.alert('Success', 'Switched to Polygon');
              } catch (error: any) {
                Alert.alert('Error', error.message);
              }
            }}
            style={styles.button}
          >
            Switch to Polygon
          </CampButton>

          <CampButton 
            onPress={async () => {
              try {
                const tx = await sendTransaction({
                  to: '0x742d35Cc6339C4532CE58b46419b9cAe7d1B7E1F',
                  value: '0.001' // 0.001 ETH
                });
                Alert.alert('Success', `Transaction sent: ${tx.hash}`);
              } catch (error: any) {
                Alert.alert('Error', error.message);
              }
            }}
            style={styles.button}
          >
            Send Test Transaction
          </CampButton>
        </View>
      )}

      {/* Social Account Linking */}
      {isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Accounts</Text>
          
          {socials && Object.entries(socials).map(([platform, isLinked]) => (
            <View key={platform} style={styles.socialRow}>
              <Text style={styles.socialText}>
                {platform}: {isLinked ? '✅ Linked' : '❌ Not linked'}
              </Text>
              <CampButton 
                onPress={() => isLinked ? unlinkSocial(platform) : linkSocial(platform)}
                style={[styles.smallButton, { backgroundColor: isLinked ? '#EF4444' : '#10B981' }]}
              >
                {isLinked ? 'Unlink' : 'Link'}
              </CampButton>
            </View>
          ))}
        </View>
      )}

      {/* Direct AppKit Access Example */}
      {isWalletConnected && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Direct AppKit Access</Text>
          
          <CampButton 
            onPress={async () => {
              const appKit = getAppKit();
              
              try {
                // Use any AppKit method directly
                const account = appKit.getAccount();
                const chainId = appKit.getChainId();
                const isConnected = appKit.getIsConnected();
                
                Alert.alert('AppKit Info', `
                  Account: ${account.address?.slice(0, 6)}...${account.address?.slice(-4)}
                  Chain ID: ${chainId}
                  Connected: ${isConnected}
                `);
              } catch (error: any) {
                Alert.alert('Error', error.message);
              }
            }}
            style={styles.button}
          >
            Get AppKit Info
          </CampButton>

          <CampButton 
            onPress={async () => {
              const appKit = getAppKit();
              
              try {
                // Subscribe to AppKit events
                const unsubscribe = appKit.subscribeAccount((account: any) => {
                  console.log('Account changed:', account);
                  Alert.alert('Account Changed', `New account: ${account.address}`);
                });
                
                // Clean up after 10 seconds for demo
                setTimeout(() => {
                  unsubscribe?.();
                  Alert.alert('Info', 'Unsubscribed from account changes');
                }, 10000);
                
                Alert.alert('Success', 'Subscribed to account changes for 10 seconds');
              } catch (error: any) {
                Alert.alert('Error', error.message);
              }
            }}
            style={styles.button}
          >
            Subscribe to Account Changes
          </CampButton>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <CampButton onPress={clearError} style={styles.smallButton}>
            Clear Error
          </CampButton>
        </View>
      )}
      
      {/* Camp Modal for advanced UI */}
      <CampModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1F2937',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  status: {
    fontSize: 16,
    marginBottom: 8,
    color: '#6B7280',
  },
  address: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 12,
    color: '#9CA3AF',
  },
  button: {
    marginVertical: 6,
  },
  smallButton: {
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  socialText: {
    fontSize: 16,
    color: '#374151',
  },
  errorSection: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 8,
  },
});
```

### Advanced AppKit Usage

For complete control over wallet operations, access AppKit directly:

```typescript
// components/AdvancedWalletOperations.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { CampButton, useCamp } from './src/camp-sdk';

export default function AdvancedWalletOperations() {
  const { getAppKit } = useCamp();
  const [message, setMessage] = useState('Custom message from my app');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.01');
  const [result, setResult] = useState('');

  const appKit = getAppKit();

  useEffect(() => {
    if (!appKit) return;

    // Subscribe to all AppKit events
    const unsubscribeAccount = appKit.subscribeAccount((account: any) => {
      console.log('Account changed:', account);
    });

    const unsubscribeChainId = appKit.subscribeChainId((chainId: any) => {
      console.log('Network changed:', chainId);
    });

    return () => {
      unsubscribeAccount?.();
      unsubscribeChainId?.();
    };
  }, [appKit]);

  const handleAdvancedOperations = async () => {
    if (!appKit) {
      Alert.alert('Error', 'AppKit not initialized');
      return;
    }

    try {
      // 1. Check connection status
      const isConnected = appKit.getIsConnected();
      if (!isConnected) {
        await appKit.open(); // Open wallet connection modal
        return;
      }

      // 2. Get current network and account info
      const account = appKit.getAccount();
      const chainId = appKit.getChainId();
      
      console.log('Current account:', account);
      console.log('Current network:', chainId);

      // 3. Switch to Polygon if not already there
      if (chainId !== 137) {
        await appKit.switchNetwork({ chainId: 137 });
        Alert.alert('Network Changed', 'Switched to Polygon');
      }

      // 4. Sign a custom message
      const signature = await appKit.signMessage({ 
        message: message || "Hello from Camp Network!" 
      });

      // 5. Send a transaction (if recipient provided)
      let txHash = null;
      if (recipient && amount) {
        txHash = await appKit.sendTransaction({
          to: recipient,
          value: amount, // ETH amount
        });
      }

      // 6. Get balance (if available in your AppKit implementation)
      let balance = 'Not available';
      try {
        balance = await appKit.getBalance?.() || 'Not available';
      } catch (e) {
        console.log('Balance not available:', e);
      }

      setResult(`
✅ Advanced Operations Complete:

🏦 Account: ${account.address?.slice(0, 6)}...${account.address?.slice(-4)}
🌐 Network: ${chainId} (${chainId === 137 ? 'Polygon' : 'Other'})
💰 Balance: ${balance}
✍️  Signature: ${signature.slice(0, 20)}...
${txHash ? `📤 Transaction: ${txHash}` : ''}
      `.trim());

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Operation failed');
    }
  };

  const handleContractInteraction = async () => {
    if (!appKit) return;

    try {
      // Example: Interact with a smart contract
      const result = await appKit.writeContract({
        address: '0x...', // Contract address
        abi: [
          // Contract ABI
          {
            name: 'mint',
            type: 'function',
            inputs: [{ name: 'amount', type: 'uint256' }],
            outputs: []
          }
        ],
        functionName: 'mint',
        args: [1] // Mint 1 NFT
      });

      Alert.alert('Contract Interaction', `Transaction: ${result.hash}`);
    } catch (error: any) {
      Alert.alert('Contract Error', error.message);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Advanced AppKit Operations
      </Text>
      
      {/* Custom Message Input */}
      <Text style={{ fontSize: 16, marginBottom: 8 }}>Custom Message:</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          backgroundColor: '#fff'
        }}
        value={message}
        onChangeText={setMessage}
        placeholder="Enter message to sign"
        multiline
      />

      {/* Transaction Inputs */}
      <Text style={{ fontSize: 16, marginBottom: 8 }}>Transaction (Optional):</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          marginBottom: 8,
          backgroundColor: '#fff'
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
          backgroundColor: '#fff'
        }}
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount in ETH"
        keyboardType="numeric"
      />

      {/* Action Buttons */}
      <CampButton 
        onPress={handleAdvancedOperations}
        style={{ marginBottom: 12 }}
      >
        Run Advanced Operations
      </CampButton>

      <CampButton 
        onPress={handleContractInteraction}
        style={{ marginBottom: 12, backgroundColor: '#8B5CF6' }}
      >
        Contract Interaction Example
      </CampButton>

      <CampButton 
        onPress={async () => {
          if (!appKit) return;
          try {
            await appKit.disconnect();
            Alert.alert('Disconnected', 'Wallet disconnected');
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        }}
        style={{ backgroundColor: '#EF4444' }}
      >
        Disconnect Wallet
      </CampButton>

      {/* Results Display */}
      {result && (
        <View style={{
          marginTop: 20,
          padding: 16,
          backgroundColor: '#F0FDF4',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#BBF7D0'
        }}>
          <Text style={{ 
            fontFamily: 'monospace', 
            fontSize: 12, 
            color: '#166534'
          }}>
            {result}
          </Text>
        </View>
      )}
    </View>
  );
}
```

### Complete Hook Reference

```typescript
// Available hooks and their usage
import { 
  useCampAuth,     // Camp authentication state and actions
  useAppKit,       // AppKit wallet operations
  useCamp,         // Combined access to both
  useSocials,      // Social account linking
  useOrigin        // Origin NFT operations
} from './src/camp-sdk';

// useCampAuth
const {
  isAuthenticated,  // boolean
  isLoading,       // boolean  
  walletAddress,   // string | null
  error,          // string | null
  connect,        // () => Promise<void>
  disconnect,     // () => Promise<void>
  clearError,     // () => void
  auth            // AuthRN instance
} = useCampAuth();

// useAppKit  
const {
  isConnected,     // boolean
  isConnecting,    // boolean
  address,         // string | null
  chainId,         // number | null
  openAppKit,      // () => Promise<void>
  disconnect,      // () => Promise<void>
  switchNetwork,   // (chainId: number) => Promise<void>
  signMessage,     // (message: string) => Promise<string>
  sendTransaction, // (tx: TransactionRequest) => Promise<TransactionResponse>
  appKit          // Direct AppKit instance
} = useAppKit();

// useCamp (combines both)
const {
  auth,           // AuthRN instance
  getAppKit,      // () => any - Direct AppKit access
  isAuthenticated, // boolean
  // ... all other Camp and AppKit properties
} = useCamp();

// useSocials
const {
  data,           // { twitter: boolean, discord: boolean, ... }
  isLoading,      // boolean
  error,          // Error | null
  linkSocial,     // (platform: string) => Promise<void>
  unlinkSocial    // (platform: string) => Promise<void>
} = useSocials();
```

### Direct AppKit Methods Available

When you call `getAppKit()`, you get access to ALL AppKit methods:

```typescript
const appKit = getAppKit();

// Connection Management
await appKit.open();                    // Open wallet selection modal
await appKit.close();                   // Close modal
await appKit.disconnect();              // Disconnect wallet
const isConnected = appKit.getIsConnected(); // Check connection status

// Account Information  
const account = appKit.getAccount();    // Get current account
const chainId = appKit.getChainId();    // Get current network
const balance = appKit.getBalance();    // Get wallet balance

// Network Operations
await appKit.switchNetwork({ chainId: 137 }); // Switch to Polygon
await appKit.switchNetwork({ chainId: 1 });   // Switch to Ethereum
const networks = appKit.getCaipNetworks();    // Get supported networks

// Message Signing
const signature = await appKit.signMessage({ 
  message: "Hello World" 
});

const typedSignature = await appKit.signTypedData({
  domain: { name: 'MyApp', version: '1' },
  types: { Message: [{ name: 'content', type: 'string' }] },
  message: { content: 'Hello' }
});

// Transaction Operations
const tx = await appKit.sendTransaction({
  to: '0x742d35Cc6339C4532CE58b46419b9cAe7d1B7E1F',
  value: '0.1', // 0.1 ETH
  data: '0x...' // Optional transaction data
});

// Smart Contract Interactions
const contractResult = await appKit.writeContract({
  address: '0x...', // Contract address
  abi: [...],       // Contract ABI
  functionName: 'mint',
  args: [1, '0x...'] // Function arguments
});

const readResult = await appKit.readContract({
  address: '0x...',
  abi: [...],
  functionName: 'balanceOf',
  args: ['0x...']
});

// Event Subscriptions
const unsubscribeAccount = appKit.subscribeAccount((account) => {
  console.log('Account changed:', account);
});

const unsubscribeNetwork = appKit.subscribeChainId((chainId) => {
  console.log('Network changed:', chainId);
});

const unsubscribeState = appKit.subscribeState((state) => {
  console.log('AppKit state changed:', state);
});

// Cleanup subscriptions
unsubscribeAccount();
unsubscribeNetwork(); 
unsubscribeState();
```

### Platform-Specific Configuration

#### Expo Configuration

Add to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "scheme": "yourapp",
    "web": {
      "bundler": "metro"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "yourapp"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    }
  }
}
```

#### React Native Configuration

For Android, add to `android/app/src/main/AndroidManifest.xml`:

```xml
<activity
  android:name=".MainActivity"
  android:launchMode="singleTask">
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="yourapp" />
  </intent-filter>
</activity>
```

For iOS, add to `ios/YourApp/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>yourapp</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>yourapp</string>
    </array>
  </dict>
</array>
```

### Troubleshooting

#### Common Issues

1. **"AppKit not found"**
   - Ensure AppKitProvider wraps CampProvider
   - Verify AppKit instance is properly configured
   - Check project ID is valid

2. **Wallet connection fails**
   - Test on physical device (not simulator)
   - Verify deep link configuration
   - Check wallet apps are installed

3. **Signing fails**
   - Ensure wallet is connected
   - Check network compatibility
   - Handle user rejection gracefully

4. **Authentication loop**
   - Clear AsyncStorage: `await Storage.multiRemove([...])`
   - Check wallet address consistency between AppKit and Camp

5. **Social linking fails**
   - Verify redirect URIs match your configuration
   - Test deep links work correctly
   - Check Camp Network dashboard settings

#### Debug Mode

Enable detailed logging:

```typescript
// Add to your app for debugging
const { getAppKit } = useCamp();

useEffect(() => {
  const appKit = getAppKit();
  console.log('AppKit instance:', appKit);
  console.log('AppKit methods:', Object.getOwnPropertyNames(appKit));
}, []);
```

---

# Installation

```bash
npm install @campnetwork/origin
```

# Core

The core modules can be imported either as a CommonJS module or as an ES6 module.

### CommonJS

```js
const { TwitterAPI, SpotifyAPI, Auth } = require("@campnetwork/origin");
```

### ES6

```js
import { TwitterAPI, SpotifyAPI, Auth } from "@campnetwork/origin";
```

## Socials

### TwitterAPI

The TwitterAPI class is the entry point for fetching user Twitter data from the Auth Hub. It requires an API key to be instantiated.

**Note: The methods for fetching data will only return data for users who have authenticated to your app via the Origin SDK.**

#### Constructor

`apiKey` - The API key of your app.

```js
const twitter = new TwitterAPI({
  apiKey: string,
});
```

#### Methods

##### fetchUserByUsername

`fetchUserByUsername(twitterUserName: string)`

```js
const user = await twitter.fetchUserByUsername("jack");
```

##### fetchTweetsByUsername

`fetchTweetsByUsername(twitterUserName: string, page: number, limit: number)`

```js
const tweets = await twitter.fetchTweetsByUsername("jack", 1, 10);
```

##### fetchFollowersByUsername

`fetchFollowersByUsername(twitterUserName: string, page: number, limit: number)`

```js
const followers = await twitter.fetchFollowersByUsername("jack", 1, 10);
```

##### fetchFollowingByUsername

`fetchFollowingByUsername(twitterUserName: string, page: number, limit: number)`

```js
const following = await twitter.fetchFollowingByUsername("jack", 1, 10);
```

##### fetchTweetById

`fetchTweetById(tweetId: string)`

```js
const tweet = await twitter.fetchTweetById("1234567890");
```

##### fetchUserByWalletAddress

`fetchUserByWalletAddress(walletAddress: string, page: number, limit: number)`

```js
const user = await twitter.fetchUserByWalletAddress("0x1234567890", 1, 10);
```

##### fetchRepostedByUsername

`fetchRepostedByUsername(twitterUserName: string, page: number, limit: number)`

```js
const reposts = await twitter.fetchRepostedByUsername("jack", 1, 10);
```

##### fetchRepliesByUsername

`fetchRepliesByUsername(twitterUserName: string, page: number, limit: number)`

```js
const replies = await twitter.fetchRepliesByUsername("jack", 1, 10);
```

##### fetchLikesByUsername

`fetchLikesByUsername(twitterUserName: string, page: number, limit: number)`

```js
const likes = await twitter.fetchLikesByUsername("jack", 1, 10);
```

##### fetchFollowsByUsername

`fetchFollowsByUsername(twitterUserName: string, page: number, limit: number)`

```js
const follows = await twitter.fetchFollowsByUsername("jack", 1, 10);
```

##### fetchViewedTweetsByUsername

`fetchViewedTweetsByUsername(twitterUserName: string, page: number, limit: number)`

```js
const viewedTweets = await twitter.fetchViewedTweetsByUsername("jack", 1, 10);
```

### SpotifyAPI

The SpotifyAPI class is the entry point for fetching user Spotify data from the Auth Hub. It requires an API key to be instantiated.

**Note: The methods for fetching data will only return data for users who have authenticated to your app via the Origin SDK.**

#### Constructor

`apiKey` - The API key of your app.

```js
const spotify = new SpotifyAPI({
  apiKey: string,
});
```

#### Methods

##### fetchSavedTracksById

`fetchSavedTracksById(spotifyId: string)`

```js
const savedTracks = await spotify.fetchSavedTracksById("1234567890");
```

##### fetchPlayedTracksById

`fetchPlayedTracksById(spotifyId: string)`

```js
const playedTracks = await spotify.fetchPlayedTracksById("1234567890");
```

##### fetchSavedAlbumsById

`fetchSavedAlbumsById(spotifyId: string)`

```js
const savedAlbums = await spotify.fetchSavedAlbumsById("1234567890");
```

##### fetchSavedPlaylistsById

`fetchSavedPlaylistsById(spotifyId: string)`

```js
const savedPlaylists = await spotify.fetchSavedPlaylistsById("1234567890");
```

##### fetchTracksInAlbum

`fetchTracksInAlbum(spotifyId: string, albumId: string)`

```js
const tracks = await spotify.fetchTracksInAlbum("1234567890", "1234567890");
```

##### fetchTracksInPlaylist

`fetchTracksInPlaylist(spotifyId: string, playlistId: string)`

```js
const tracks = await spotify.fetchTracksInPlaylist("1234567890", "1234567890");
```

##### fetchUserByWalletAddress

`fetchUserByWalletAddress(walletAddress: string)`

```js
const user = await spotify.fetchUserByWalletAddress("0x1234567890");
```

### TikTokAPI

The TikTokAPI class is the entry point for fetching user TikTok data from the Auth Hub. It requires an API key to be instantiated.

**Note: The methods for fetching data will only return data for users who have authenticated to your app via the Origin SDK.**

#### Constructor

`apiKey` - The API key of your app.

```js
const tiktok = new TikTokAPI({
  apiKey: string,
});
```

#### Methods

##### fetchUserByUsername

`fetchUserByUsername(tiktokUserName: string)`

```js
const user = await tiktok.fetchUserByUsername("jack");
```

##### fetchVideoById

`fetchVideoById(userHandle: string, videoId: string)`

```js
const video = await tiktok.fetchVideo("jack", "1234567890");
```

## Auth

The Auth class is the entry point for authenticating users with the Origin SDK. It requires a clientId to be instantiated.

**Note: The Auth class is only to be used on the client side.**

### Constructor

- `clientId` - The client ID of your app. This is required to authenticate users with the Origin SDK.
- `redirectUri` - The URI to redirect to after the user completes oauth for any of the socials. Defaults to `window.location.href`.
  The `redirectUri` can also be an object with the following optional properties:
  - `twitter` - The URI to redirect to after the user completes oauth for Twitter.
  - `discord` - The URI to redirect to after the user completes oauth for Discord.
  - `spotify` - The URI to redirect to after the user completes oauth for Spotify.
- `allowAnalytics` - Whether to allow analytics to be collected. Defaults to `true`.

You may use the `redirectUri` object to redirect the user to different pages based on the social they are linking.
You may only define the URIs for the socials you are using, the rest will default to `window.location.href`.

```js
import { Auth } from "@campnetwork/origin";

const auth = new Auth({
  clientId: string,
  redirectUri: string | object,
  allowAnalytics: boolean,
});
```

```js
const auth = new Auth({
  clientId: "your-client-id",
  redirectUri: {
    twitter: "https://your-website.com/twitter",
    discord: "https://your-website.com/discord",
    spotify: "https://your-website.com/spotify",
  },
});
```

### Methods

#### connect

`connect() => void`

The `connect` method prompts the user to sign a message with their wallet in order to authenticate with the Origin SDK.
The wallet provider can be set by calling the `setProvider` method on the Auth instance beforehand. The default provider used is `window.ethereum`.

```js
auth.connect();
```

#### disconnect

`disconnect() => void`

The `disconnect` method logs the user out of the Origin SDK on the client side.

```js
auth.disconnect();
```

#### setProvider

`setProvider(provider: { provider: EIP1193Provider, info: EIP6963ProviderInfo }) => void`

_Read more about the [EIP1193Provider](https://eips.ethereum.org/EIPS/eip-1193) and [EIP6963ProviderInfo](https://eips.ethereum.org/EIPS/eip-6963) interfaces._

The `setProvider` method sets the wallet provider to be used for authentication.

```js
auth.setProvider({
  provider: window.ethereum,
  info: { name: "MetaMask", icon: "https://..." },
});
```

#### setWalletAddress

`setWalletAddress(walletAddress: string) => void`

The `setWalletAddress` method sets the wallet address to be used for authentication (via the `connect` method).

**This is only needed if the provider does not support the `eth_requestAccounts` method. Only use this method if you are sure you need to set the wallet address manually.**

```js
auth.setWalletAddress("0x1234567890");
```

#### on

`on(event: string, callback: (data: any) => void) => void`

The `on` method listens for events emitted by the Auth module of the Origin SDK.

The following events are emitted:

##### "state"

Possible states:

- `authenticated` - The user has successfully authenticated.
- `unauthenticated` - The user has been logged out.
- `loading` - The user is in the process of authenticating.

```js
auth.on("state", (data) => {
  console.log(data); // "authenticated" | "unauthenticated" | "loading"
});
```

##### "provider"

Returns the provider that has been set via the `setProvider` method.
If using the Origin SDK React components, this event is emitted when the user selects a provider in the Auth modal.

```js
auth.on("provider", (data) => {
  console.log(data); // { provider: EIP1193Provider, info: EIP6963ProviderInfo }
});
```

##### "providers"

Returns the list of providers that have been injected via EIP6963 and that the user can select from.

```js
auth.on("providers", (data) => {
  console.log(data); // [{ provider: EIP1193Provider, info: EIP6963ProviderInfo }]
});
```

You may use this event to update the UI with the available providers. The user can then select a provider to authenticate with, and the `setProvider` method can be called with the selected provider. The `connect` method can then be called to authenticate the user.

```js
auth.on("providers", (data) => {
  // Update UI with providers
  // User selects a provider
  const selectedProvider = data[0];

  auth.setProvider(selectedProvider);

  auth.connect();
});
```

#### getLinkedSocials

`getLinkedSocials() => Promise<{ twitter: boolean, discord: boolean, spotify: boolean }>`

The `getLinkedSocials` method returns a promise that resolves to an object containing the possible socials that the user can link and whether they are linked or not.

```js
const linkedSocials = await auth.getLinkedSocials();

console.log(linkedSocials); // { twitter: true, discord: false, spotify: true }
```

---

After the user has authenticated, the following methods can be used to link and unlink social accounts.
When linking a social account, the user will be redirected to the OAuth flow for that social platform.
Afterwards, the user will be redirected back to the `redirectUri` specified in the Auth constructor.

#### linkTwitter

`linkTwitter() => void`

The `linkTwitter` method redirects the user to the Twitter OAuth flow to link their Twitter account to the Auth Hub.

```js
auth.linkTwitter();
```

#### linkDiscord

`linkDiscord() => void`

The `linkDiscord` method redirects the user to the Discord OAuth flow to link their Discord account to the Auth Hub.

```js
auth.linkDiscord();
```

#### linkSpotify

`linkSpotify() => void`

The `linkSpotify` method redirects the user to the Spotify OAuth flow to link their Spotify account to the Auth Hub.

```js
auth.linkSpotify();
```

#### linkTikTok

`linkTikTok(handle: string) => Promise<void>`

The `linkTikTok` method links the provided TikTok handle to the Auth Hub.

```js
auth.linkTikTok("tiktokhandle");
```

#### sendTelegramOTP

`sendTelegramOTP(phoneNumber: string) => Promise<void>`
The `sendTelegramOTP` method sends an OTP to the provided phone number via Telegram. The OTP can be used via the `linkTelegram` method to link the user's Telegram account to the Auth Hub.

```js
const { phone_code_hash } = await auth.sendTelegramOTP("+1234567890");
```

#### linkTelegram

`linkTelegram(phoneNumber: string, otp: string, phoneCodeHash: string) => Promise<void>`

The `linkTelegram` method links the provided phone number to the Auth Hub using the OTP and phone code hash received from the `sendTelegramOTP` method.

```js
await auth.linkTelegram("+1234567890", "123456", "abc123");
```

---

#### unlinkTwitter

`unlinkTwitter() => Promise<void>`

The `unlinkTwitter` method unlinks the user's Twitter account from the Auth Hub.

```js
await auth.unlinkTwitter();
```

#### unlinkDiscord

`unlinkDiscord() => Promise<void>`

The `unlinkDiscord` method unlinks the user's Discord account from the Auth Hub.

```js
await auth.unlinkDiscord();
```

#### unlinkSpotify

`unlinkSpotify() => Promise<void>`

The `unlinkSpotify` method unlinks the user's Spotify account from the Auth Hub.

```js
await auth.unlinkSpotify();
```

#### unlinkTikTok

`unlinkTikTok() => Promise<void>`

The `unlinkTikTok` method unlinks the user's TikTok account from the Auth Hub.

```js
await auth.unlinkTikTok();
```

#### unlinkTelegram

`unlinkTelegram() => Promise<void>`
The `unlinkTelegram` method unlinks the user's Telegram account from the Auth Hub.

```js
await auth.unlinkTelegram();
```

# React

The React components and hooks can be imported as ES6 modules. The example below shows how to set up the `CampProvider` component and subsequently use the provided hooks and components.

```js
// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CampProvider } from "@campnetwork/origin/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CampProvider clientId="your-client-id">
        <App />
      </CampProvider>
    </QueryClientProvider>
  </StrictMode>
);
```

## CampProvider

The `CampProvider` component requires a `clientId` prop to be passed in order link the users to your app.
It can also take the following optional props:

- `redirectUri` - `string | object` - Either a string that will be used as the redirect URI for all socials, or an object with the following optional properties: `twitter`, `discord`, `spotify`. This is used to redirect the user to different pages after they have completed the OAuth flow for a social.

```jsx
import { CampProvider } from "@campnetwork/origin/react";
// ...
function App() {
  return (
    <CampProvider
      clientId="your-client-id"
      redirectUri="https://your-website.com"
    >
      <div>Your app</div>
    </CampProvider>
  );
}
```

Or, with an object for the `redirectUri`:

```jsx
import { CampProvider } from "@campnetwork/origin/react";
// ...
function App() {
  return (
    <CampProvider
      clientId="your-client-id"
      redirectUri={{
        twitter: "https://your-website.com/twitter",
        discord: "https://your-website.com/discord",
        spotify: "https://your-website.com/spotify",
      }}
    >
      <div>Your app</div>
    </CampProvider>
  );
}
```

The `CampProvider` component sets up the context for the Origin SDK and provides the Auth instance to the rest of the app.

## CampModal

![@campnetwork/origin](https://imgur.com/n9o0rJ3.png)

The **CampModal** is a one-line\* solution for authenticating users with the Origin SDK. It can be used to connect users to the Auth Hub and link and unlink social accounts.

It works as follows:

The **CampModal** component displays a button with the text "**Connect**" that the user can click on in order to summon the modal. The modal shows a list of available providers that the user can select from. After a provider has been selected, the `connect` method is called on the Auth instance to authenticate the user.

If the user is already authenticated, the button will instead say "**My Camp**" and the modal will display the user's Camp profile information and allow them to link and unlink social accounts.

The **CampModal** can take the following props:

- `wcProjectId` - `string` - The WalletConnect project ID to use for authentication. Allows the users to authenticate via WalletConnect.
- `injectButton` - `boolean` - Whether to inject the button into the DOM or not. Defaults to `true`. If set to `false`, the button will not be rendered and the modal can be opened programmatically via the `openModal` function returned by the `useModal` hook.
- `onlyWagmi` - `boolean` - Whether to only show the provider that the user is currently authenticated with. Defaults to `false`.
- `defaultProvider` - `{ provider: EIP1193Provider, info: EIP6963ProviderInfo, exclusive: boolean }` - Custom provider to set as the highlighted provider in the modal. If not set, the wagmi provider will be highlighted if it is available. The `exclusive` property can be set to `true` to only show this provider in the modal.
- `allowAnalytics` - `boolean` - Whether to allow analytics to be collected. Defaults to `true`.

### Usage

Basic usage of the **CampModal** component:

```jsx
import { CampModal } from "@campnetwork/origin/react";

function App() {
  return (
    <div>
      <CampModal />
    </div>
  );
}
```

With custom props:

```jsx
import { CampModal } from "@campnetwork/origin/react";

function App() {
  return (
    <div>
      <CampModal
        wcProjectId="your-wc-project-id"
        defaultProvider={{
          provider: window.ethereum,
          info: { name: "MetaMask", icon: "https://..." },
          exclusive: false,
        }}
      />
    </div>
  );
}
```

You can find more [examples here](./examples/client-side/react/providers-configuration).

Only show the provider that the user is currently authenticated with (if using wagmi):

```jsx
import { CampModal } from "@campnetwork/origin/react";

function App() {
  return (
    <div>
      <CampModal onlyWagmi />
    </div>
  );
}
```

Users can be authenticated either via the Camp Modal as outlined above or programmatically by calling the `connect` method on the Auth instance.

### Usage with third party providers (Privy, Appkit, Magic, etc.)

The Camp Modal can be used in conjunction with providers such as Privy and Appkit to create a seamless authentication experience for users. When using wagmi, it will automatically detect if the user is authenticated via a third party provider and give them the option to connect to the Auth Hub using that provider. Otherwise, you can set up the default provider to be whatever provider you are using.

[Example usage with Privy](./examples/client-side/react/privy-connector/)

[Example usage with Appkit](./examples/client-side/react/appkit-connector/)

[Example usage with magic.link](./examples/client-side/react/magic-link-connector/)

After the user has authenticated, you can use the provided hooks to fetch user data and listen for events.

## LinkButton

The **LinkButton** component is a button that can be used to link and unlink social accounts. Under the hood it uses the `useLinkModal` hook to open the Link Socials modal.

The **LinkButton** can take the following props:

- `social` - `string` - The social account to link or unlink. Can be one of: `twitter`, `discord`, `spotify`.
- `variant` - `string` - The variant of the button. Can be one of: `default`, `icon`. Defaults to `default`.
- `theme` - `string` - The theme of the button. Can be one of: `default`, `camp`. Defaults to `default`.

**Note: The `<CampModal/>` component must be rendered in the component tree for the buttons to work.**

### Usage

Basic usage of the **LinkButton** component:

```jsx
import { LinkButton, CampModal } from "@campnetwork/origin/react";

function App() {
  return (
    <div>
      <CampModal />
      <LinkButton social="twitter" />
      <LinkButton social="discord" variant="icon" />
      <LinkButton social="spotify" theme="camp" />
      <LinkButton social="tiktok" variant="icon" theme="camp" />
      <LinkButton social="telegram" />
    </div>
  );
}
```

## Hooks

### useAuth

The `useAuth` hook returns the instance of the Auth class that is provided by the CampProvider.
It can be used as outlined in the Core section in order to build custom authentication flows, listen for events, and fetch user data.

```jsx
import { useAuth } from "@campnetwork/origin/react";

function App() {
  const auth = useAuth();

  return (
    <div>
      <button onClick={auth.connect}>Connect</button>
    </div>
  );
}
```

### useAuthState

The `useAuthState` hook returns the current authentication state of the user.

```jsx
import { useAuthState } from "@campnetwork/origin/react";

function App() {
  const { authenticated, loading } = useAuthState();

  return (
    <div>
      {loading && <div>Loading...</div>}
      {authenticated && <div>Authenticated</div>}
    </div>
  );
}
```

### useProvider

The `useProvider` hook returns the provider that has been set via the `setProvider` method, as well as a `setProvider` function that can be used to update the provider.

```jsx
import { useProvider } from "@campnetwork/origin/react";

function App() {
  const { provider, setProvider } = useProvider();

  return (
    <div>
      <div>Current provider: {provider.info.name}</div>
      <button
        onClick={() =>
          setProvider({ provider: window.ethereum, info: { name: "Metamask" } })
        }
      >
        Set Provider
      </button>
    </div>
  );
}
```

### useProviders

The `useProviders` hook returns the list of providers that have been injected via EIP6963 and that the user or app can select from.

```jsx
import { useProviders, useProvider } from "@campnetwork/origin/react";

function App() {
  const providers = useProviders();
  const { setProvider } = useProvider();

  return (
    <div>
      {providers.map((provider) => (
        <button key={provider.info.name} onClick={() => setProvider(provider)}>
          {provider.info.name}
        </button>
      ))}
    </div>
  );
}
```

### useConnect

The `useConnect` hook returns functions that can be used to connect and disconnect the user.

```jsx
import { useConnect, useAuthState } from "@campnetwork/origin/react";

function App() {
  const { connect, disconnect } = useConnect();
  const { authenticated } = useAuthState();

  return (
    <div>
      {authenticated ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={connect}>Connect</button>
      )}
    </div>
  );
}
```

### useSocials

The `useSocials` hook returns the state of the user's linked social accounts.

```jsx
import { useSocials } from "@campnetwork/origin/react";

function App() {
  const { data, error, isLoading } = useSocials();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div>Twitter: {data.twitter ? "Linked" : "Not linked"}</div>
      <div>Discord: {data.discord ? "Linked" : "Not linked"}</div>
      <div>Spotify: {data.spotify ? "Linked" : "Not linked"}</div>
    </div>
  );
}
```

### useLinkSocials

The `useLinkSocials` hook returns functions that can be used to link and unlink social accounts.

```jsx
import { useLinkSocials } from "@campnetwork/origin/react";

function App() {
  const {
    linkTwitter,
    linkDiscord,
    linkSpotify,
    linkTiktok,
    linkTelegram,
    sendTelegramOTP,
    unlinkTwitter,
    unlinkDiscord,
    unlinkSpotify,
    unlinkTiktok,
    unlinkTelegram,
  } = useLinkSocials();

  return (
    <div>
      <button onClick={linkTwitter}>Link Twitter</button>
      <button onClick={linkDiscord}>Link Discord</button>
      <button onClick={linkSpotify}>Link Spotify</button>
      <button onClick={() => linkTiktok("tiktokhandle")}>Link TikTok</button>
      <button onClick={() => sendTelegramOTP("+1234567890")}>
        Send Telegram OTP
      </button>
      <button onClick={() => linkTelegram("+1234567890", "123456", "abc123")}>
        Link Telegram
      </button>
      <button onClick={unlinkTwitter}>Unlink Twitter</button>
      <button onClick={unlinkDiscord}>Unlink Discord</button>
      <button onClick={unlinkSpotify}>Unlink Spotify</button>
      <button onClick={unlinkTiktok}>Unlink TikTok</button>
      <button onClick={unlinkTelegram}>Unlink Telegram</button>
    </div>
  );
}
```

### useModal

The `useModal` hook returns the state of the Auth and My Camp modals, as well as functions to show and hide them.

**Note: The `<CampModal/>` component must be rendered in the component tree for the modals to be displayed.**

```jsx
import { useModal, CampModal } from "@campnetwork/origin/react";

function App() {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div>
      <button onClick={openModal}>Open Modal</button>
      <button onClick={closeModal}>Close Modal</button>
      <CampModal injectButton={false} />
    </div>
  );
}
```

The state and functions returned by the `useModal` hook can be used to show and hide the Auth and My Camp modals, as well as to check if they are currently open. The modal being controlled is dictated by the user's authentication state.

### useLinkModal

The `useLinkModal` hook returns the state of the Link Socials modal, as well as functions to show and hide it.

**Note: The `<CampModal/>` component must be rendered in the component tree for the modal to be displayed.**

```jsx
import { useLinkModal, CampModal } from "@campnetwork/origin/react";

function App() {
  const { isLinkingOpen, openTwitterModal } = useLinkModal();

  return (
    <div>
      <CampModal />
      <button onClick={openTwitterModal}>Link Twitter</button>
    </div>
  );
}
```

It returns the following properties and functions:

- `isLinkingOpen` - `boolean` - Whether the Link Socials modal is open or not.
- `openTwitterModal` - `() => void`
- `openDiscordModal` - `() => void`
- `openSpotifyModal` - `() => void`
- `openTiktokModal` - `() => void`
- `openTelegramModal` - `() => void`
- `linkTwitter` - `() => void`
- `linkDiscord` - `() => void`
- `linkSpotify` - `() => void`
- `linkTiktok` - `() => void`
- `linkTelegram` - `() => void`
- `unlinkTwitter` - `() => void`
- `unlinkDiscord` - `() => void`
- `unlinkSpotify` - `() => void`
- `unlinkTiktok` - `() => void`
- `unlinkTelegram` - `() => void`
- `closeModal` - `() => void`

The difference between the `openXModal` functions and the `linkX / unlinkX` functions is that the former opens the modal regardless of the user's linking state, allowing them to either link or unlink their account, while the latter only opens the specified modal if the user's linking state allows for it.

For example, if the user is linked to Twitter, calling `openTwitterModal` will open the modal to _unlink_ their Twitter account, while calling `linkTwitter` will not do anything, and calling `unlinkTwitter` will open the modal to unlink their Twitter account.

## Origin Methods (`auth.origin`)

The `Origin` class provides methods for interacting with Origin IpNFTs, uploading files, managing user stats, and more. You can access these methods via `auth.origin` after authentication.

### Types

#### `LicenseTerms`

The license terms object used in minting and updating methods:

```typescript
type LicenseTerms = {
  price: bigint; // Price in wei
  duration: number; // Duration in seconds
  royaltyBps: number; // Royalty in basis points (0-10000)
  paymentToken: Address; // Payment token address (address(0) for native currency)
};
```

### File Upload & Minting

#### `mintFile(file: File, metadata: Record<string, unknown>, license: LicenseTerms, parentId?: bigint, options?: { progressCallback?: (percent: number) => void })`

Uploads a file and mints an IpNFT for it.

- `file`: The file to upload and mint.
- `metadata`: Additional metadata for the IpNFT.
- `license`: License terms for the IpNFT (price, duration, royalty, payment token).
- `parentId`: Optional parent token ID for derivative works.
- `options.progressCallback`: Optional progress callback.
- **Returns:** The minted token ID as a string, or throws an error on failure.

#### `mintSocial(source: "spotify" | "twitter" | "tiktok", license: LicenseTerms)`

Mints an IpNFT for a connected social account.

- `source`: The social platform.
- `license`: License terms for the IpNFT.
- **Returns:** The minted token ID as a string, or throws an error on failure.

### IpNFT & Marketplace Methods

The following methods are available for interacting with IpNFTs and the marketplace. All methods mirror the smart contract functions and require appropriate permissions.

#### Core IpNFT Methods

- `mintWithSignature(account: string, tokenId: bigint, parentId: bigint, creatorContentHash: string, uri: string, license: LicenseTerms, deadline: bigint, signature: string)` - Mint an IpNFT with a signature
- `registerIpNFT(source: string, deadline: bigint, license: LicenseTerms, metadata: Record<string, unknown>, fileKey?: string, parentId?: bigint)` - Register an IpNFT for minting
- `updateTerms(tokenId: bigint, license: LicenseTerms)` - Update license terms for an IpNFT
- `requestDelete(tokenId: bigint)` - Request deletion of an IpNFT
- `getTerms(tokenId: bigint)` - Get license terms for an IpNFT
- `ownerOf(tokenId: bigint)` - Get the owner of an IpNFT
- `balanceOf(owner: string)` - Get the balance of IpNFTs for an owner
- `contentHash(tokenId: bigint)` - Get the content hash of an IpNFT
- `tokenURI(tokenId: bigint)` - Get the metadata URI of an IpNFT
- `dataStatus(tokenId: bigint)` - Get the data status of an IpNFT
- `royaltyInfo(tokenId: bigint, value: bigint)` - Get royalty information
- `getApproved(tokenId: bigint)` - Get the approved address for an IpNFT
- `isApprovedForAll(owner: string, operator: string)` - Check if operator is approved for all tokens
- `transferFrom(from: string, to: string, tokenId: bigint)` - Transfer an IpNFT
- `safeTransferFrom(from: string, to: string, tokenId: bigint)` - Safely transfer an IpNFT
- `approve(to: string, tokenId: bigint)` - Approve an address for a specific IpNFT
- `setApprovalForAll(operator: string, approved: boolean)` - Set approval for all tokens

#### Marketplace Methods

- `buyAccess(tokenId: bigint, periods: number, value?: bigint)` - Buy access to an IpNFT
- `renewAccess(tokenId: bigint, periods: number)` - Renew access to an IpNFT
- `hasAccess(tokenId: bigint, user: string)` - Check if user has access to an IpNFT
- `subscriptionExpiry(tokenId: bigint, user: string)` - Get subscription expiry for a user

> See the SDK source or contract ABI for full parameter details.

#### `buyAccessSmart(tokenId: bigint, periods: number)`

Buys access to an asset, handling payment approval if needed.

- `tokenId`: The IpNFT token ID.
- `periods`: Number of periods to buy.
- **Returns:** Result of the buy access transaction.

#### `getData(tokenId: bigint)`

Fetches metadata for a given IpNFT.

- `tokenId`: The IpNFT token ID.
- **Returns:** Data object for the token.

### User Data & Stats

#### `getOriginUploads()`

Fetches the user's Origin file uploads.

- **Returns:** Array of upload data, or `null` on failure.

#### `getOriginUsage()`

Fetches the user's Origin stats (multiplier, points, usage, etc).

- **Returns:** Object with user stats including:
  - `user.multiplier` - User's Origin multiplier
  - `user.points` - User's Origin points
  - `user.active` - Whether user's Origin is active
  - `teams` - Array of team data
  - `dataSources` - Array of data source information

#### `setOriginConsent(consent: boolean)`

Sets the user's consent for Origin usage.

- `consent`: `true` or `false`.
- **Returns:** Promise that resolves on success, throws APIError on failure.

### Utility Methods

#### `getJwt()`

Gets the current JWT token.

- **Returns:** The JWT string.

#### `setViemClient(client: any)`

Sets the viem wallet client for blockchain interactions.

- `client`: The viem wallet client instance.

---

You can call these methods as `await auth.origin.methodName(...)` after authenticating with the SDK. For more details, see the inline code documentation.

# Contributing

Install the dependencies.

```bash
npm install
```

Build the SDK.

```bash
npm run build
```

This will generate the SDK in the `dist` folder.

You can also run the following command to watch for changes and rebuild the SDK automatically:

```bash
npm run dev
```

In order to use the sdk in a local project, you can link the sdk to the project.

```bash
npm link
```

Then, in the project you want to use the sdk in, run:

```bash
npm link @campnetwork/origin
```

This will link the local sdk to the project.
