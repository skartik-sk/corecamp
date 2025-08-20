import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface IPFormData {
  title: string;
  description: string;
  category: string;
  sourceUrl: string;
  priceInCAMP: string;
  accessPeriods: string;
  tags: string;
}

const IP_CATEGORIES = [
  { id: 'art', name: '🎨 Digital Art', description: 'Images, illustrations, designs' },
  { id: 'music', name: '🎵 Music & Audio', description: 'Songs, beats, sound effects' },
  { id: 'video', name: '🎬 Video Content', description: 'Videos, animations, clips' },
  { id: 'text', name: '📝 Written Content', description: 'Articles, stories, scripts' },
  { id: 'code', name: '💻 Software & Code', description: 'Apps, libraries, tools' },
  { id: 'data', name: '📊 Data & Research', description: 'Datasets, research, analytics' },
];

export default function CreateIPScreen() {

  const [isCreating, setIsCreating] = useState(false);
  // campSDK shim that provides authenticate/openAppKit/createIPAsset surface
  const campSDK = require('@/hooks/useCampNetworkSDK').useCampNetworkSDK?.() || require('@/hooks/useCampNetworkSDK').default?.();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState<IPFormData>({
    title: '',
    description: '',
    category: '',
    sourceUrl: '',
    priceInCAMP: '',
    accessPeriods: '1',
    tags: '',
  });

  const handleInputChange = (field: keyof IPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    handleInputChange('category', categoryId);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your IP');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Validation Error', 'Please select a category');
      return false;
    }
    if (!formData.sourceUrl.trim()) {
      Alert.alert('Validation Error', 'Please enter the source URL');
      return false;
    }
    if (!formData.priceInCAMP || parseFloat(formData.priceInCAMP) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price in CAMP');
      return false;
    }
    return true;
  };

  const handleCreateIP = async () => {
    if (!campSDK.isAppKitConnected) {
      Alert.alert('Wallet Connection Required', 'Please connect your wallet first');
      return;
    }

    if (!campSDK.isAuthenticated) {
      Alert.alert('Not Authenticated', 'Please authenticate with Camp Network first.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    try {
      // Use Origin SDK to create IP asset
      const licenseTerms = {
        price: BigInt(Math.floor(parseFloat(formData.priceInCAMP) * 1e18)),
        duration: 30 * 24 * 60 * 60, // 30 days
        royaltyBps: 500, // 5%
        paymentToken: '0x0000000000000000000000000000000000000000',
      };
      const metadata = {
        name: formData.title,
        description: formData.description,
        category: formData.category,
        sourceUrl: formData.sourceUrl,
        tags: formData.tags,
      };
      const result = await campSDK.createIPAsset('file', metadata, licenseTerms);
      if (result) {
        Alert.alert(
          'IP Created Successfully! 🎉',
          `Your intellectual property "${formData.title}" has been registered on Camp Network.`,
          [
            {
              text: 'Create Another',
              onPress: () => {
                setFormData({
                  title: '',
                  description: '',
                  category: '',
                  sourceUrl: '',
                  priceInCAMP: '',
                  accessPeriods: '1',
                  tags: '',
                });
                setSelectedCategory('');
              },
            },
            { text: 'Go to Marketplace', style: 'default' },
          ]
        );
        // Refresh IP asset list
        await campSDK.refreshAssets();
      }
    } catch (error: any) {
      console.error('Error creating IP NFT:', error);
      Alert.alert(
        'Creation Failed',
        `Failed to create IP NFT: ${error?.message || 'Unknown error'}. Please try again.`
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (!campSDK.isAppKitConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[Colors.light.background, Colors.brand.warm2]}
          style={styles.notConnectedContainer}
        >
          <Text style={styles.notConnectedTitle}>🏕️ Connect Wallet to Start Creating</Text>
          <Text style={styles.notConnectedText}>
            Connect your wallet to create and register intellectual property on Camp Network
          </Text>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={campSDK.openAppKit}
          >
            <LinearGradient
              colors={[Colors.brand.campOrange, Colors.brand.warm1]}
              style={styles.connectButtonGradient}
            >
              <Text style={styles.connectButtonText}>Connect Wallet</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={[Colors.brand.campOrange + '10', Colors.light.background]}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Create IP NFT</Text>
            <Text style={styles.headerSubtitle}>
              Register your intellectual property on Camp Network blockchain
            </Text>
          </LinearGradient>

          <View style={styles.formContainer}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter the title of your IP"
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                placeholderTextColor={Colors.brand.gray}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your intellectual property..."
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholderTextColor={Colors.brand.gray}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {IP_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      selectedCategory === category.id && styles.categoryCardSelected
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <Text style={[
                      styles.categoryName,
                      selectedCategory === category.id && styles.categoryNameSelected
                    ]}>
                      {category.name}
                    </Text>
                    <Text style={[
                      styles.categoryDescription,
                      selectedCategory === category.id && styles.categoryDescriptionSelected
                    ]}>
                      {category.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Source URL */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Source URL *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://your-ip-source.com"
                value={formData.sourceUrl}
                onChangeText={(value) => handleInputChange('sourceUrl', value)}
                placeholderTextColor={Colors.brand.gray}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={styles.inputHint}>
                URL where your intellectual property can be accessed
              </Text>
            </View>

            {/* Pricing */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price per Access (CAMP) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="10.0"
                value={formData.priceInCAMP}
                onChangeText={(value) => handleInputChange('priceInCAMP', value)}
                placeholderTextColor={Colors.brand.gray}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Access Periods */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Default Access Periods</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1"
                value={formData.accessPeriods}
                onChangeText={(value) => handleInputChange('accessPeriods', value)}
                placeholderTextColor={Colors.brand.gray}
                keyboardType="number-pad"
              />
              <Text style={styles.inputHint}>
                Number of time periods buyers get access for
              </Text>
            </View>

            {/* Tags */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tags</Text>
              <TextInput
                style={styles.textInput}
                placeholder="ai, art, digital, nft"
                value={formData.tags}
                onChangeText={(value) => handleInputChange('tags', value)}
                placeholderTextColor={Colors.brand.gray}
              />
              <Text style={styles.inputHint}>
                Comma-separated tags to help people discover your IP
              </Text>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, isCreating && styles.createButtonDisabled]}
              onPress={handleCreateIP}
              disabled={isCreating}
            >
              <LinearGradient
                colors={isCreating ? 
                  [Colors.brand.gray, Colors.brand.gray] : 
                  [Colors.brand.campOrange, Colors.brand.warm1]
                }
                style={styles.createButtonGradient}
              >
                {isCreating ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.createButtonText}>Creating IP NFT...</Text>
                  </View>
                ) : (
                  <Text style={styles.createButtonText}>🚀 Create IP NFT</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notConnectedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  notConnectedText: {
    fontSize: 16,
    color: Colors.brand.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    padding: 20,
    paddingTop: 40,
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
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 14,
    color: Colors.brand.gray,
    marginTop: 8,
    fontStyle: 'italic',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryCard: {
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 160,
  },
  categoryCardSelected: {
    borderColor: Colors.brand.campOrange,
    backgroundColor: Colors.brand.campOrange + '10',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  categoryNameSelected: {
    color: Colors.brand.campOrange,
  },
  categoryDescription: {
    fontSize: 14,
    color: Colors.brand.gray,
  },
  categoryDescriptionSelected: {
    color: Colors.brand.campOrange,
  },
  createButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonGradient: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connectButton: {
    marginTop: 24,
  },
  connectButtonGradient: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    minWidth: 200,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
