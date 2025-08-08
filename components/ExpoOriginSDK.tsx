import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAccount } from 'wagmi';
import { useCampNetwork } from '../hooks/useCampNetwork';
import { createLicenseTerms, validateIPNFTForm, generateTokenId, CAMP_NETWORK_CONFIG, IP_CATEGORIES } from '../utils/campNetworkHelpers';
import { requestMintSignature } from '../utils/backendHelpers';

interface IPNFTData {
  id: number;
  name: string;
  description: string;
  category: string;
  price: string;
  duration: string;
  owner: string;
  hasAccess: boolean;
  subscriptionExpiry: number;
}

export const ExpoOriginSDK: React.FC = () => {
  const { address, isConnected } = useAccount();
  const campNetwork = useCampNetwork();
  const [selectedTab, setSelectedTab] = useState<'create' | 'marketplace' | 'myNFTs'>('create');
  const [isLoading, setIsLoading] = useState(false);

  // Create IP Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: 'Art' as typeof IP_CATEGORIES[number],
    price: '0.001',
    duration: '30',
    royalty: '5'
  });

  // Check access for sample token
  const sampleTokenId = BigInt(1);
  const { data: hasAccessData } = campNetwork.useHasAccess(sampleTokenId);
  const { data: subscriptionExpiry } = campNetwork.useSubscriptionExpiry(sampleTokenId);
  const { data: licenseTerms } = campNetwork.useGetTerms(sampleTokenId);

  const createIPNFT = async () => {
    if (!address || !isConnected) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    const validationError = validateIPNFTForm(createForm);
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    if (!campNetwork.isOnCampNetwork) {
      const switched = await campNetwork.switchToCampNetwork();
      if (!switched) {
        Alert.alert('Error', 'Please switch to Camp Network');
        return;
      }
    }

    try {
      setIsLoading(true);
      
      // Request signature from backend
      const signatureResponse = await requestMintSignature({
        walletAddress: address,
        name: createForm.name,
        description: createForm.description,
        category: createForm.category,
        contentHash: `${createForm.name}:${createForm.description}`,
        price: createForm.price,
        durationDays: parseInt(createForm.duration),
        royaltyPercent: parseInt(createForm.royalty)
      });

      if (!signatureResponse.success) {
        throw new Error(signatureResponse.error || 'Failed to get signature');
      }

      // Create license terms
      const licenseTerms = createLicenseTerms(
        createForm.price,
        parseInt(createForm.duration),
        parseInt(createForm.royalty)
      );

      // Call mint function with signature
      const success = await campNetwork.mintIPNFT({
        tokenId: signatureResponse.tokenId,
        name: createForm.name,
        description: createForm.description,
        category: createForm.category,
        licenseTerms,
        parentTokenIds: [],
        signature: signatureResponse.signature
      });

      if (success) {
        Alert.alert('Success', 'IP NFT creation initiated! Check your wallet for transaction.');
        setCreateForm({
          name: '',
          description: '',
          category: 'Art',
          price: '0.001',
          duration: '30',
          royalty: '5'
        });
      }
    } catch (error) {
      console.error('Error creating IP NFT:', error);
      Alert.alert('Error', campNetwork.error || 'Failed to create IP NFT');
    } finally {
      setIsLoading(false);
    }
  };

  const buyAccess = async (tokenId: number, priceEth: string) => {
    if (!address || !isConnected) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    if (!campNetwork.isOnCampNetwork) {
      const switched = await campNetwork.switchToCampNetwork();
      if (!switched) {
        Alert.alert('Error', 'Please switch to Camp Network');
        return;
      }
    }

    try {
      setIsLoading(true);
      
      const priceWei = BigInt(Math.floor(parseFloat(priceEth) * 1e18));
      const success = await campNetwork.buyAccess(BigInt(tokenId), 1, priceWei); // 1 period

      if (success) {
        Alert.alert('Success', 'Access purchase initiated! Check your wallet for transaction.');
      }
    } catch (error) {
      console.error('Error buying access:', error);
      Alert.alert('Error', campNetwork.error || 'Failed to purchase access');
    } finally {
      setIsLoading(false);
    }
  };

  const renderNetworkStatus = () => {
    const status = campNetwork.getNetworkStatus();
    
    if (status === 'disconnected') {
      return (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Wallet Not Connected</Text>
          <Text style={styles.statusText}>Please connect your wallet to use Camp Network features</Text>
        </View>
      );
    }
    
    if (status === 'wrong-network') {
      return (
        <View style={[styles.statusCard, styles.warningCard]}>
          <Text style={styles.statusTitle}>Wrong Network</Text>
          <Text style={styles.statusText}>Please switch to Camp Network (BaseCamp Testnet)</Text>
          <TouchableOpacity 
            style={styles.switchButton}
            onPress={campNetwork.switchToCampNetwork}
          >
            <Text style={styles.switchButtonText}>Switch to Camp Network</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderCreateTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Create IP NFT on Camp Network</Text>
      
      {renderNetworkStatus()}
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Name *</Text>
        <TextInput
          style={styles.input}
          value={createForm.name}
          onChangeText={(text) => setCreateForm({...createForm, name: text})}
          placeholder="Enter IP name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={createForm.description}
          onChangeText={(text) => setCreateForm({...createForm, description: text})}
          placeholder="Describe your intellectual property"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <View style={styles.categoryContainer}>
            {IP_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  createForm.category === category && styles.categoryButtonActive
                ]}
                onPress={() => setCreateForm({...createForm, category})}
              >
                <Text style={[
                  styles.categoryButtonText,
                  createForm.category === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Access Price (ETH) *</Text>
        <TextInput
          style={styles.input}
          value={createForm.price}
          onChangeText={(text) => setCreateForm({...createForm, price: text})}
          placeholder="0.001"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Access Duration (Days) *</Text>
        <TextInput
          style={styles.input}
          value={createForm.duration}
          onChangeText={(text) => setCreateForm({...createForm, duration: text})}
          placeholder="30"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Royalty (%) *</Text>
        <TextInput
          style={styles.input}
          value={createForm.royalty}
          onChangeText={(text) => setCreateForm({...createForm, royalty: text})}
          placeholder="5"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity 
        style={[styles.createButton, (isLoading || !campNetwork.isOnCampNetwork) && styles.createButtonDisabled]}
        onPress={createIPNFT}
        disabled={isLoading || !campNetwork.isOnCampNetwork}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gradientButton}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating...' : 'Create IP NFT'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {campNetwork.error && (
        <View style={[styles.statusCard, styles.errorCard]}>
          <Text style={styles.errorText}>{campNetwork.error}</Text>
          <TouchableOpacity onPress={campNetwork.clearError}>
            <Text style={styles.clearErrorText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderMarketplaceTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>IP Marketplace</Text>
      
      {renderNetworkStatus()}
      
      <Text style={styles.infoText}>
        Marketplace items will appear here once IP NFTs are created on Camp Network.
      </Text>

      <View style={styles.marketplaceGrid}>
        {/* Sample marketplace item for demonstration */}
        <View style={styles.marketplaceItem}>
          <LinearGradient
            colors={['#ffecd2', '#fcb69f']}
            style={styles.itemGradient}
          >
            <Text style={styles.itemName}>Sample IP NFT</Text>
            <Text style={styles.itemCategory}>Art</Text>
            <Text style={styles.itemPrice}>0.005 ETH</Text>
            <Text style={styles.itemCreator}>Demo Creator</Text>
            
            <TouchableOpacity 
              style={[styles.buyButton, !campNetwork.isOnCampNetwork && styles.buyButtonDisabled]}
              onPress={() => buyAccess(1, '0.005')}
              disabled={!campNetwork.isOnCampNetwork}
            >
              <Text style={styles.buyButtonText}>
                {isLoading ? 'Buying...' : 'Buy Access'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );

  const renderMyNFTsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>My IP NFTs & Access</Text>
      
      {renderNetworkStatus()}

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Sample Access Status</Text>
        <Text style={styles.statusText}>
          Token #1 Access: {hasAccessData ? 'Active ✅' : 'No Access ❌'}
        </Text>
        {subscriptionExpiry && (
          <Text style={styles.statusSubtext}>
            Expires: {new Date(Number(subscriptionExpiry) * 1000).toLocaleDateString()}
          </Text>
        )}
        {licenseTerms && (
          <Text style={styles.statusSubtext}>
            Price: {(Number(licenseTerms.price) / 1e18).toFixed(4)} ETH
          </Text>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Camp Network Integration</Text>
        <Text style={styles.infoTextDetail}>
          Connected to Camp Network contracts:
        </Text>
        <Text style={styles.contractAddress}>IpNFT: {CAMP_NETWORK_CONFIG.contracts.IpNFT}</Text>
        <Text style={styles.contractAddress}>Marketplace: {CAMP_NETWORK_CONFIG.contracts.Marketplace}</Text>
        <Text style={styles.contractAddress}>DisputeModule: {CAMP_NETWORK_CONFIG.contracts.DisputeModule}</Text>
        <Text style={styles.contractAddress}>wCAMP: {CAMP_NETWORK_CONFIG.contracts.WCAMP}</Text>
      </View>

      {campNetwork.isMintPending && (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Transaction Pending</Text>
          <Text style={styles.statusText}>IP NFT creation is being processed...</Text>
        </View>
      )}

      {campNetwork.isBuyAccessPending && (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Transaction Pending</Text>
          <Text style={styles.statusText}>Access purchase is being processed...</Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Camp Network IP Marketplace</Text>
        <Text style={styles.headerSubtitle}>
          {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
        </Text>
        {campNetwork.isOnCampNetwork && (
          <Text style={styles.networkStatus}>✅ Camp Network Connected</Text>
        )}
      </LinearGradient>

      <View style={styles.tabBar}>
        {[
          { key: 'create', label: 'Create IP' },
          { key: 'marketplace', label: 'Marketplace' },
          { key: 'myNFTs', label: 'My NFTs' }
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, selectedTab === key && styles.activeTab]}
            onPress={() => setSelectedTab(key as any)}
          >
            <Text style={[styles.tabText, selectedTab === key && styles.activeTabText]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'create' && renderCreateTab()}
      {selectedTab === 'marketplace' && renderMarketplaceTab()}
      {selectedTab === 'myNFTs' && renderMyNFTsTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  createButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  marketplaceGrid: {
    gap: 15,
  },
  marketplaceItem: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemGradient: {
    padding: 20,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  itemCreator: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 15,
  },
  buyButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 5,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  infoTextDetail: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
    textAlign: 'center',
  },
  contractAddress: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  switchButton: {
    backgroundColor: '#667eea',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  switchButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  categoryScroll: {
    marginTop: 5,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 10,
  },
  clearErrorText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  buyButtonDisabled: {
    opacity: 0.5,
  },
  networkStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
});

export default ExpoOriginSDK;
