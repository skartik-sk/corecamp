import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit-wagmi-react-native';
import { Colors } from '@/constants/Colors';
import { useOriginSDK } from '@/hooks/useOriginSDK';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface ConnectWalletScreenProps {
  onBack: () => void;
}

export default function ConnectWalletScreen({ onBack }: ConnectWalletScreenProps) {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const [isLoading, setIsLoading] = useState(false);
  const originSDK = useOriginSDK();

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      await open();
    } catch (error) {
      console.error('Wallet connection error:', error);
      Alert.alert('Connection Error', 'Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#F8FAFC', '#E2E8F0']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Success Header */}
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Wallet Connected!</Text>
              <Text style={styles.successAddress}>{formatAddress(address || '')}</Text>
            </View>

            {/* Origin SDK Status */}
            <View style={styles.originStatusCard}>
              <View style={styles.originStatusHeader}>
                <Ionicons 
                  name={originSDK.isConnected ? "checkmark-circle" : originSDK.isLoading ? "time" : "alert-circle"} 
                  size={24} 
                  color={originSDK.isConnected ? "#10B981" : originSDK.isLoading ? "#F59E0B" : "#EF4444"} 
                />
                <Text style={styles.originStatusTitle}>Origin SDK</Text>
              </View>
              
              <Text style={styles.originStatusText}>
                {originSDK.isConnected 
                  ? "✅ Connected - Ready for IP creation"
                  : originSDK.isLoading 
                  ? "🔄 Connecting to Origin services..."
                  : originSDK.error
                  ? `❌ Error: ${originSDK.error}`
                  : "⏳ Waiting to connect..."
                }
              </Text>
              
              {originSDK.isConnected && (
                <View style={styles.originFeatures}>
                  <Text style={styles.originFeaturesTitle}>Now you can:</Text>
                  <Text style={styles.originFeature}>🎨 Create IP NFTs</Text>
                  <Text style={styles.originFeature}>📄 Manage licenses</Text>
                  <Text style={styles.originFeature}>💰 Track royalties</Text>
                  <Text style={styles.originFeature}>🔒 Upload files securely</Text>
                </View>
              )}
              
              {!originSDK.isConnected && !originSDK.isLoading && (
                <TouchableOpacity 
                  style={styles.connectOriginButton}
                  onPress={() => originSDK.connect()}
                >
                  <Text style={styles.connectOriginText}>Connect Origin SDK</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Continue Button */}
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => {
                // Navigate to main app
                Alert.alert('Success', 'Welcome to Camp Network!', [
                  { 
                    text: 'Continue', 
                    onPress: () => {
                      // This will be handled by the useEffect in sign-in.tsx
                    }
                  }
                ]);
              }}
            >
              <LinearGradient
                colors={[Colors.brand.campOrange, Colors.brand.warm1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueGradient}
              >
                <Text style={styles.continueText}>Continue to Camp Network</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color={Colors.brand.cool1} />
            </TouchableOpacity>
            <View style={styles.progressContainer}>
              <View style={[styles.progressDot, styles.progressActive]} />
              <View style={[styles.progressDot, styles.progressActive]} />
              <View style={[styles.progressDot, styles.progressActive]} />
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Connect Your Wallet</Text>
            <Text style={styles.subtitle}>
              Connect your wallet to start creating and trading IP NFTs on Camp Network
            </Text>
          </View>

          {/* Wallet Connection */}
          <View style={styles.walletSection}>
            <View style={styles.walletCard}>
              <View style={styles.walletIconContainer}>
                <Text style={styles.walletIcon}>🔗</Text>
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletTitle}>WalletConnect</Text>
                <Text style={styles.walletDescription}>
                  Connect with 350+ wallets including MetaMask, Rainbow, and more
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.connectButton}
              onPress={handleConnectWallet}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.brand.campOrange, Colors.brand.warm1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.connectGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={styles.connectText}>Connect Wallet</Text>
                    <Ionicons name="wallet" size={20} color="white" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.functional.success} />
            <Text style={styles.securityText}>
              Your wallet connection is secure and encrypted
            </Text>
          </View>

          {/* Steps Preview */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>What happens next?</Text>
            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Connect your wallet</Text>
              </View>
              <View style={styles.stepItem}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>Initialize Origin SDK</Text>
              </View>
              <View style={styles.stepItem}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>Start creating IP NFTs</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  progressActive: {
    backgroundColor: Colors.brand.campOrange,
  },

  // Title
  titleContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.brand.cool1,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },

  // Wallet Section
  walletSection: {
    marginBottom: 32,
  },
  walletCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: Colors.brand.campOrange + '20',
  },
  walletIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.brand.campOrange + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  walletIcon: {
    fontSize: 28,
  },
  walletInfo: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  walletDescription: {
    fontSize: 14,
    color: Colors.brand.cool1,
    lineHeight: 20,
    fontWeight: '500',
  },

  // Connect Button
  connectButton: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: Colors.brand.campOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  connectGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  connectText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },

  // Security Note
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.functional.success + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: Colors.functional.success,
    fontWeight: '600',
  },

  // Steps
  stepsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brand.campOrange,
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  stepText: {
    fontSize: 14,
    color: Colors.brand.cool1,
    fontWeight: '500',
  },

  // Success State
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 60,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  successAddress: {
    fontSize: 16,
    color: Colors.brand.cool1,
    fontWeight: '600',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  // Origin SDK Status
  originStatusCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  originStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  originStatusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  originStatusText: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 16,
    fontWeight: '500',
  },
  originFeatures: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  originFeaturesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  originFeature: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 20,
  },
  connectOriginButton: {
    backgroundColor: Colors.brand.campOrange,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectOriginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Continue Button
  continueButton: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: Colors.brand.campOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
});
