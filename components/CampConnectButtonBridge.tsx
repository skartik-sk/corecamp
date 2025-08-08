import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit-wagmi-react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useOriginSDKBridge } from '@/hooks/useOriginSDKBridge';
import { Ionicons } from '@expo/vector-icons';

export function CampConnectButton() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const campBridge = useOriginSDKBridge();

  // If wallet is not connected, show AppKit connect button
  if (!isConnected) {
    return (
      <TouchableOpacity style={styles.connectButton} onPress={() => open()}>
        <Ionicons name="wallet" size={20} color="#FFFFFF" />
        <ThemedText style={styles.connectButtonText}>Connect Wallet</ThemedText>
      </TouchableOpacity>
    );
  }

  // If wallet is connected but not authenticated with Camp Network
  if (!campBridge.user?.isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.walletConnected}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.functional.success} />
          <ThemedText style={styles.walletConnectedText}>
            Wallet Connected
          </ThemedText>
        </View>
        
        <TouchableOpacity 
          style={[styles.authButton, campBridge.isLoading && styles.authButtonLoading]} 
          onPress={() => {
            if (!campBridge.isLoading) {
              campBridge.authenticate();
            }
          }}
          disabled={campBridge.isLoading}
        >
          {campBridge.isLoading ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <ThemedText style={styles.authButtonText}>Authenticating...</ThemedText>
            </>
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
              <ThemedText style={styles.authButtonText}>Connect to Camp Network</ThemedText>
            </>
          )}
        </TouchableOpacity>

        {campBridge.error && (
          <ThemedText style={styles.errorText}>{campBridge.error}</ThemedText>
        )}
      </View>
    );
  }

  // If authenticated with Camp Network, show success state
  return (
    <View style={styles.authenticatedContainer}>
      <View style={styles.statusRow}>
        <Ionicons name="shield-checkmark" size={20} color={Colors.functional.success} />
        <ThemedText style={styles.authenticatedText}>Camp Network Connected</ThemedText>
      </View>
      
      <ThemedText style={styles.addressText}>
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </ThemedText>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={campBridge.signOut}
        >
          <ThemedText style={styles.signOutButtonText}>Sign Out Camp</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.disconnectButton} 
          onPress={() => disconnect()}
        >
          <Ionicons name="exit" size={16} color="#FFFFFF" />
          <ThemedText style={styles.disconnectButtonText}>Disconnect</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  connectButton: {
    backgroundColor: Colors.brand.campOrange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 160,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  authContainer: {
    alignItems: 'center',
    gap: 12,
    minWidth: 250,
  },
  walletConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.functional.success + '20',
    borderRadius: 15,
  },
  walletConnectedText: {
    color: Colors.functional.success,
    fontSize: 14,
    fontWeight: '500',
  },
  authButton: {
    backgroundColor: Colors.brand.campOrange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 200,
  },
  authButtonLoading: {
    opacity: 0.8,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: Colors.functional.error,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 200,
  },
  authenticatedContainer: {
    alignItems: 'center',
    gap: 8,
    minWidth: 220,
    padding: 16,
    backgroundColor: Colors.functional.success + '10',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.functional.success + '30',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authenticatedText: {
    color: Colors.functional.success,
    fontSize: 16,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.brand.gray,
  },
  signOutButtonText: {
    fontSize: 12,
    opacity: 0.8,
  },
  disconnectButton: {
    backgroundColor: Colors.functional.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
