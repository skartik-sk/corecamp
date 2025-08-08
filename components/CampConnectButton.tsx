/**
 * React Native Compatible Camp Connect Button
 * This replaces the web-based CampButton from Origin SDK
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppKit } from '@reown/appkit-wagmi-react-native';
import { useAccount } from 'wagmi';
import { Colors } from '@/constants/Colors';
import { useOriginSDK } from '@/hooks/useOriginSDK';

interface CampConnectButtonProps {
  style?: any;
  textStyle?: any;
}

export const CampConnectButton: React.FC<CampConnectButtonProps> = ({
  style,
  textStyle,
}) => {
  const { open } = useAppKit();
  const { isConnected } = useAccount();
  const originSDK = useOriginSDK();

  const handlePress = async () => {
    try {
      if (isConnected) {
        // If wallet is connected but Origin SDK is not authenticated, try to authenticate
        if (!originSDK.user?.isAuthenticated && !originSDK.isLoading) {
          await originSDK.authenticate();
        } else if (originSDK.user?.isAuthenticated) {
          // If already authenticated with Origin SDK, show disconnect option
          await originSDK.signOut();
        }
      } else {
        // If wallet is not connected, open AppKit modal
        open();
      }
    } catch (error) {
      console.error('Camp Connect Button error:', error);
    }
  };

  const getButtonText = () => {
    if (originSDK.isLoading) {
      return 'Connecting...';
    }
    
    if (!isConnected) {
      return 'Connect Wallet';
    }
    
    if (isConnected && !originSDK.user?.isAuthenticated) {
      return 'Connect Camp Network';
    }
    
    return 'Connected';
  };

  const isLoading = originSDK.isLoading;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          isConnected && originSDK.user?.isAuthenticated
            ? [Colors.camp.green[500], Colors.camp.green[600]]
            : [Colors.camp.orange[500], Colors.camp.orange[600]]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.icon}>
                {isConnected && originSDK.user?.isAuthenticated ? '✅' : '🏕️'}
              </Text>
              <Text style={[styles.text, textStyle]}>
                {getButtonText()}
              </Text>
            </>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  gradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
