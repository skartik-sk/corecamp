/**
 * React Native Wrapper for Origin SDK
 * This file provides React Native compatible wrappers for Origin SDK components
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
// Avoid importing the heavy Origin SDK in mobile app; treat auth as any to use shim
import { Colors } from '@/constants/Colors';

const { width: screenWidth } = Dimensions.get('window');

// Mock the problematic web components that Origin SDK tries to render
const mockWebComponent = () => null;

// Override the web components with React Native compatible ones
// @ts-ignore
if (typeof global.document !== 'undefined') {
  // @ts-ignore
  global.document.createElement = (tagName: string) => {
    console.log(`[Origin SDK] Creating mock element: ${tagName}`);
    return {
      tagName,
      addEventListener: () => {},
      removeEventListener: () => {},
      setAttribute: () => {},
      getAttribute: () => null,
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {},
      },
      style: {},
      innerHTML: '',
      textContent: '',
      appendChild: (child: any) => child,
      removeChild: (child: any) => child,
      querySelector: () => null,
      querySelectorAll: () => [],
      click: () => {},
      focus: () => {},
      blur: () => {},
    };
  };
}

// Create our own Camp Context for React Native
interface CampContextType {
  clientId: string;
  auth: any | null;
  setAuth: (auth: any | null) => void;
  wagmiAvailable: boolean;
}

const CampContext = createContext<CampContextType>({
  clientId: '',
  auth: null,
  setAuth: () => {},
  wagmiAvailable: false,
});

// Camp Provider for React Native
interface CampProviderProps {
  clientId: string;
  redirectUri?: string;
  children: ReactNode;
  allowAnalytics?: boolean;
}

export const CampProvider: React.FC<CampProviderProps> = ({
  clientId,
  redirectUri,
  children,
  allowAnalytics = false,
}) => {
  const [auth, setAuth] = useState<any | null>(null);

  return (
    <CampContext.Provider 
      value={{ 
        clientId, 
        auth, 
        setAuth, 
        wagmiAvailable: false 
      }}
    >
      {children}
    </CampContext.Provider>
  );
};

// Custom Auth Hook
const useCampAuth = () => {
  const { auth } = useContext(CampContext);
  return auth;
};

// Custom Auth State Hook
const useCampAuthState = () => {
  const { auth } = useContext(CampContext);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Check if user is already authenticated
    const checkAuthState = async () => {
      try {
        setLoading(true);
        // Check if we have a stored session
        const isAuth = auth.isAuthenticated;
        setAuthenticated(!!isAuth);
      } catch (error) {
        console.error('Error checking auth state:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();

    // Listen for auth state changes
    if (auth.on) {
      auth.on('state', (state: any) => {
        setAuthenticated(state.authenticated || false);
        setLoading(false);
      });
    }
  }, [auth]);

  return { authenticated, loading };
};

// Custom Connect Hook
const useCampConnect = () => {
  const { auth } = useContext(CampContext);

  const connect = async () => {
    if (!auth) {
      Alert.alert('Error', 'Authentication not initialized');
      return { success: false, message: 'Auth not initialized', walletAddress: '' };
    }

    try {
      const result = await auth.connect();
      return result;
    } catch (error: any) {
      Alert.alert('Connection Error', error.message || 'Failed to connect');
      return { success: false, message: error.message, walletAddress: '' };
    }
  };

  const disconnect = async () => {
    if (!auth) return;

    try {
      await auth.disconnect();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return { connect, disconnect };
};

// Custom Socials Hook
const useCampSocials = () => {
  const { auth } = useContext(CampContext);
  const [socials, setSocials] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    if (!auth) return;

    try {
      setIsLoading(true);
      const linkedSocials = await auth.getLinkedSocials();
      setSocials(linkedSocials || {});
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [auth]);

  return { socials, isLoading, error, refetch };
};

// Custom Origin Hook
const useCampOrigin = () => {
  const { auth } = useContext(CampContext);
  const [stats, setStats] = useState<any>({ data: null, isLoading: true, isError: false });
  const [uploads, setUploads] = useState<any>({ data: [], isLoading: true, isError: false });

  useEffect(() => {
    if (!auth?.origin) return;

    const fetchStats = async () => {
      try {
        const statsData = await auth.origin!.getOriginUsage();
        setStats({ data: statsData, isLoading: false, isError: false });
      } catch (error) {
        setStats({ data: null, isLoading: false, isError: true });
      }
    };

    const fetchUploads = async () => {
      try {
        const uploadsData = await auth.origin!.getOriginUploads();
        setUploads({ data: uploadsData || [], isLoading: false, isError: false });
      } catch (error) {
        setUploads({ data: [], isLoading: false, isError: true });
      }
    };

    fetchStats();
    fetchUploads();
  }, [auth]);

  return {
    stats: {
      ...stats,
      refetch: () => {
        // Refetch logic here
      },
    },
    uploads: {
      ...uploads,
      refetch: () => {
        // Refetch logic here
      },
    },
  };
};

// React Native Compatible Camp Button
export const CampButton: React.FC<{
  onPress?: () => void;
  title?: string;
  style?: any;
}> = ({ onPress, title, style }) => {
  const { authenticated, loading } = useCampAuthState();
  const { connect, disconnect } = useCampConnect();

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    if (authenticated) {
      Alert.alert(
        'Disconnect',
        'Are you sure you want to disconnect?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disconnect', style: 'destructive', onPress: disconnect },
        ]
      );
    } else {
      const result = await connect();
      if (result.success) {
        Alert.alert('Success', 'Connected successfully!');
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.button, styles.loadingButton, style]}>
        <ActivityIndicator color="white" size="small" />
        <Text style={styles.buttonText}>Loading...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[Colors.brand.campOrange, Colors.brand.warm1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.buttonGradient}
      >
        <Text style={styles.buttonText}>
          {title || (authenticated ? 'Connected' : 'Connect Wallet')}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// React Native Compatible Camp Modal
interface CampModalProps {
  visible?: boolean;
  onClose?: () => void;
}

export const CampModal: React.FC<CampModalProps> = ({ visible = false, onClose }) => {
  const { authenticated } = useCampAuthState();
  const { connect } = useCampConnect();
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    setModalVisible(visible);
  }, [visible]);

  const handleConnect = async () => {
    const result = await connect();
    if (result.success) {
      setModalVisible(false);
      if (onClose) onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
        if (onClose) onClose();
      }}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connect to Camp Network</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  if (onClose) onClose();
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Connect your wallet to start creating and trading IP on Camp Network
              </Text>

              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>💡</Text>
                  <Text style={styles.featureText}>Create IP NFTs</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🛍️</Text>
                  <Text style={styles.featureText}>Trade in Marketplace</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🎯</Text>
                  <Text style={styles.featureText}>Join Auctions</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>💬</Text>
                  <Text style={styles.featureText}>Chat & Collaborate</Text>
                </View>
              </View>

              <CampButton
                title="Connect Wallet"
                onPress={handleConnect}
                style={styles.modalConnectButton}
              />
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 160,
    height: 48,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingButton: {
    backgroundColor: Colors.brand.gray,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: screenWidth > 400 ? '80%' : '90%',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.brand.dark,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.brand.dark,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.brand.dark,
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 24,
  },
  featuresContainer: {
    marginVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  featureText: {
    fontSize: 16,
    color: Colors.brand.dark,
    fontWeight: '500',
  },
  modalConnectButton: {
    marginVertical: 20,
    width: '100%',
  },
});

// Export all components and hooks
export {
  CampContext,
  useCampAuth,
  useCampAuthState,
  useCampConnect,
  useCampSocials,
  useCampOrigin,
};
