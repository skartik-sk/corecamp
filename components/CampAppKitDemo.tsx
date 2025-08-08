/**
 * Camp Network AppKit Demo Component
 * Demonstrates full integration with AppKit features as documented
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { 
  useCampAuth, 
  useAppKit, 
  useSocials, 
  useOrigin,
  CampButton,
  CampModal,
  AppKitButton
} from '../sdk/react-native';

const { width } = Dimensions.get('window');

interface WalletOperationResult {
  type: string;
  result: string;
  timestamp: string;
}

export default function CampAppKitDemo() {
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
    isAppKitConnected, 
    appKitAddress, 
    openAppKit,
    disconnectAppKit
  } = useAppKit();

  const { socials, linkSocial, unlinkSocial } = useSocials();
  const { stats, uploads } = useOrigin();

  // Local state for demo operations
  const [operationResults, setOperationResults] = useState<WalletOperationResult[]>([]);
  const [isPerformingOperation, setIsPerformingOperation] = useState(false);
  const [customMessage, setCustomMessage] = useState('Hello from Camp Network!');

  // Add operation result to history
  const addOperationResult = (type: string, result: string) => {
    const newResult: WalletOperationResult = {
      type,
      result: result.length > 50 ? `${result.slice(0, 50)}...` : result,
      timestamp: new Date().toLocaleTimeString(),
    };
    setOperationResults(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10
  };

  // Demonstrate wallet operations
  const performWalletOperation = async (operation: string) => {
    if (!isAppKitConnected) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }

    setIsPerformingOperation(true);
    try {
      switch (operation) {
        case 'signMessage':
          // Note: This would need to be implemented in the actual useAppKit hook
          Alert.alert('Sign Message', `Would sign: "${customMessage}"`);
          addOperationResult('Sign Message', `Message: ${customMessage}`);
          break;

        case 'switchNetwork':
          // Note: This would need to be implemented in the actual useAppKit hook
          Alert.alert('Switch Network', 'Would switch to Polygon (Chain ID: 137)');
          addOperationResult('Switch Network', 'Switched to Polygon');
          break;

        case 'getBalance':
          // Note: This would need to be implemented in the actual useAppKit hook
          Alert.alert('Get Balance', `Address: ${appKitAddress}`);
          addOperationResult('Get Balance', '1.23 ETH');
          break;

        case 'sendTransaction':
          // Demo transaction
          Alert.alert('Send Transaction', 'Would send 0.01 ETH to demo address');
          addOperationResult('Send Transaction', 'Sent 0.01 ETH');
          break;

        default:
          Alert.alert('Unknown Operation', operation);
      }
    } catch (error: any) {
      Alert.alert('Operation Failed', error.message);
    } finally {
      setIsPerformingOperation(false);
    }
  };

  // Social account operations
  const handleSocialOperation = async (platform: 'twitter' | 'discord' | 'spotify', action: 'link' | 'unlink') => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Must be authenticated to manage social accounts');
      return;
    }

    try {
      if (action === 'link') {
        await linkSocial(platform);
        Alert.alert('Success', `${platform} account linked successfully!`);
      } else {
        await unlinkSocial(platform);
        Alert.alert('Success', `${platform} account unlinked successfully!`);
      }
      addOperationResult(`${action} ${platform}`, `${platform} ${action}ed`);
    } catch (error: any) {
      Alert.alert('Error', `Failed to ${action} ${platform}: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.brand.campOrange + '20', Colors.light.background]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Camp Network AppKit Demo</Text>
        <Text style={styles.headerSubtitle}>
          Complete integration showcase with wallet operations
        </Text>
      </LinearGradient>

      {/* Authentication Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏕️ Camp Authentication</Text>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[
            styles.statusValue, 
            { color: isAuthenticated ? Colors.brand.green : Colors.brand.red }
          ]}>
            {isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}
          </Text>
        </View>
        
        {walletAddress && (
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Camp Address:</Text>
            <Text style={styles.addressText}>
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </Text>
          </View>
        )}

        <CampButton 
          onPress={isAuthenticated ? campDisconnect : campConnect}
          loading={isLoading}
          style={styles.actionButton}
        >
          {isAuthenticated ? 'Disconnect from Camp' : 'Connect to Camp'}
        </CampButton>
      </View>

      {/* Wallet Connection Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Wallet Connection</Text>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Wallet:</Text>
          <Text style={[
            styles.statusValue,
            { color: isAppKitConnected ? Colors.brand.green : Colors.brand.red }
          ]}>
            {isAppKitConnected ? '✅ Connected' : '❌ Not connected'}
          </Text>
        </View>

        {appKitAddress && (
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Wallet Address:</Text>
            <Text style={styles.addressText}>
              {appKitAddress.slice(0, 8)}...{appKitAddress.slice(-6)}
            </Text>
          </View>
        )}

        {/* Pre-built AppKit Button */}
        <AppKitButton style={styles.actionButton} />
        
        {/* Custom AppKit Controls */}
        <View style={styles.buttonRow}>
          <CampButton 
            onPress={isAppKitConnected ? disconnectAppKit : openAppKit}
            style={[styles.actionButton, { backgroundColor: Colors.brand.blue, flex: 1 }]}
          >
            {isAppKitConnected ? 'Disconnect' : 'Connect Wallet'}
          </CampButton>
        </View>
      </View>

      {/* Wallet Operations */}
      {isAppKitConnected && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Wallet Operations</Text>
          
          <View style={styles.operationGrid}>
            <TouchableOpacity
              style={styles.operationButton}
              onPress={() => performWalletOperation('signMessage')}
              disabled={isPerformingOperation}
            >
              <Text style={styles.operationButtonText}>✍️ Sign Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.operationButton}
              onPress={() => performWalletOperation('switchNetwork')}
              disabled={isPerformingOperation}
            >
              <Text style={styles.operationButtonText}>🔄 Switch Network</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.operationButton}
              onPress={() => performWalletOperation('getBalance')}
              disabled={isPerformingOperation}
            >
              <Text style={styles.operationButtonText}>💰 Get Balance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.operationButton}
              onPress={() => performWalletOperation('sendTransaction')}
              disabled={isPerformingOperation}
            >
              <Text style={styles.operationButtonText}>📤 Send TX</Text>
            </TouchableOpacity>
          </View>

          {isPerformingOperation && (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color={Colors.brand.campOrange} />
              <Text style={styles.loadingText}>Performing operation...</Text>
            </View>
          )}
        </View>
      )}

      {/* Social Account Management */}
      {isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Social Accounts</Text>
          
          {socials && Object.entries(socials).map(([platform, isLinked]) => (
            <View key={platform} style={styles.socialRow}>
              <View style={styles.socialInfo}>
                <Text style={styles.socialPlatform}>
                  {platform === 'twitter' ? '🐦 Twitter' :
                   platform === 'discord' ? '💬 Discord' :
                   platform === 'spotify' ? '🎵 Spotify' : platform}
                </Text>
                <Text style={[
                  styles.socialStatus,
                  { color: isLinked ? Colors.brand.green : Colors.brand.gray }
                ]}>
                  {isLinked ? 'Linked' : 'Not linked'}
                </Text>
              </View>
              
              <CampButton
                onPress={() => handleSocialOperation(
                  platform as 'twitter' | 'discord' | 'spotify',
                  isLinked ? 'unlink' : 'link'
                )}
                style={[
                  styles.socialButton,
                  { backgroundColor: isLinked ? Colors.brand.red : Colors.brand.campOrange }
                ]}
              >
                {isLinked ? 'Unlink' : 'Link'}
              </CampButton>
            </View>
          ))}
        </View>
      )}

      {/* Operation Results */}
      {operationResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Recent Operations</Text>
          <View style={styles.resultsContainer}>
            {operationResults.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultType}>{result.type}</Text>
                  <Text style={styles.resultTime}>{result.timestamp}</Text>
                </View>
                <Text style={styles.resultText}>{result.result}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* User Stats */}
      {isAuthenticated && stats.data && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Camp Network Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.data.points || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.data.multiplier || '1.0'}x</Text>
              <Text style={styles.statLabel}>Multiplier</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{uploads.data?.length || 0}</Text>
              <Text style={styles.statLabel}>IP Assets</Text>
            </View>
          </View>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>❌ Error: {error}</Text>
          <CampButton onPress={clearError} style={styles.clearErrorButton}>
            Clear Error
          </CampButton>
        </View>
      )}

      {/* Camp Modal Integration */}
      <CampModal />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.brand.gray,
    lineHeight: 22,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.brand.gray,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: Colors.light.text,
  },
  actionButton: {
    marginVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  operationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  operationButton: {
    backgroundColor: Colors.brand.campOrange,
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: (width - 64) / 2,
    alignItems: 'center',
  },
  operationButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  loadingText: {
    color: Colors.brand.gray,
    fontStyle: 'italic',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  socialInfo: {
    flex: 1,
  },
  socialPlatform: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  socialStatus: {
    fontSize: 14,
    marginTop: 2,
  },
  socialButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brand.campOrange,
  },
  resultTime: {
    fontSize: 12,
    color: Colors.brand.gray,
  },
  resultText: {
    fontSize: 14,
    color: Colors.light.text,
    fontFamily: 'monospace',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.brand.campOrange,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.brand.gray,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  errorSection: {
    margin: 20,
    backgroundColor: Colors.brand.red + '10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.brand.red + '30',
  },
  errorText: {
    color: Colors.brand.red,
    fontSize: 14,
    marginBottom: 12,
  },
  clearErrorButton: {
    backgroundColor: Colors.brand.red,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
