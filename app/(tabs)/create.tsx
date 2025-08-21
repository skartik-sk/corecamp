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
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { useCampfireIntegration } from '@/hooks/useCampfireIntegration';
import { useAccount } from 'wagmi';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
} from 'react-native-reanimated';
import { 
  Upload, 
  FileText, 
  Music, 
  Video,
  Image as ImageIcon,
  Code,
  Palette,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface IPFormData {
  title: string;
  description: string;
  category: string;
  priceInCAMP: string;
  royaltyPercentage: string;
  duration: string;
  tags: string;
  isDerivative: boolean;
  parentId: string;
}

interface FileData {
  uri: string;
  name: string;
  type: string;
  size: number;
}

const IP_CATEGORIES = [
  { id: 'art', name: '🎨 Digital Art', icon: Palette, color: [Colors['camp-orange'], Colors['warm-1']] },
  { id: 'music', name: '🎵 Music & Audio', icon: Music, color: [Colors['cool-1'], Colors['cool-2']] },
  { id: 'video', name: '🎬 Video Content', icon: Video, color: [Colors['warm-2'], Colors['warm-3']] },
  { id: 'text', name: '📝 Written Content', icon: FileText, color: [Colors.success, Colors['cool-3']] },
  { id: 'code', name: '💻 Software & Code', icon: Code, color: [Colors.error, Colors['warm-1']] },
  { id: 'design', name: '🎨 Design', icon: ImageIcon, color: [Colors.info, Colors['cool-2']] },
];

export default function CreateIPScreen() {
  const { address, isConnected } = useAccount();
  const {
    mintIPWithOrigin,
    loading,
    error,
    success,
    clearError,
    clearSuccess,
  } = useCampfireIntegration();

  const [isCreating, setIsCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState<IPFormData>({
    title: '',
    description: '',
    category: '',
    priceInCAMP: '0.001',
    royaltyPercentage: '5',
    duration: '0',
    tags: '',
    isDerivative: false,
    parentId: '',
  });

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  React.useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(0);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const handleInputChange = (field: keyof IPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    handleInputChange('category', categoryId);
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
          size: file.size || 0,
        });
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
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
    if (!selectedFile) {
      Alert.alert('Validation Error', 'Please select a file to upload');
      return false;
    }
    if (!formData.priceInCAMP || parseFloat(formData.priceInCAMP) < 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return false;
    }
    return true;
  };

  const handleCreateIP = async () => {
    if (!isConnected) {
      Alert.alert('Wallet Connection Required', 'Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'No file selected');
      return;
    }

    setIsCreating(true);
    clearError();
    clearSuccess();

    try {
      // Convert React Native file to web File object
      const fileInfo = await FileSystem.getInfoAsync(selectedFile.uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Read file as base64 and convert to blob
      const base64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Convert base64 to Uint8Array
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create File object
      const file = new File([bytes], selectedFile.name, {
        type: selectedFile.type,
      });

      const metadata = {
        name: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        mimeType: selectedFile.type,
        size: selectedFile.size,
        isDerivative: formData.isDerivative,
      };

      const licenseTerms = {
        price: formData.priceInCAMP,
        duration: formData.duration,
        royalty: formData.royaltyPercentage,
        paymentToken: '0x0000000000000000000000000000000000000000',
      };

      const parentId = formData.isDerivative && formData.parentId ? formData.parentId : '';

      const tokenId = await mintIPWithOrigin(file, metadata, licenseTerms, parentId);

      if (tokenId) {
        Alert.alert(
          'IP Created Successfully! 🎉',
          `Your intellectual property "${formData.title}" has been registered on Camp Network with Token ID: ${tokenId}`,
          [
            {
              text: 'Create Another',
              onPress: () => {
                setFormData({
                  title: '',
                  description: '',
                  category: '',
                  priceInCAMP: '0.001',
                  royaltyPercentage: '5',
                  duration: '0',
                  tags: '',
                  isDerivative: false,
                  parentId: '',
                });
                setSelectedCategory('');
                setSelectedFile(null);
              },
            },
            { text: 'View Marketplace', style: 'default' },
          ]
        );
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

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[Colors['camp-light'], Colors['cool-3'] + '20']}
          style={styles.notConnectedContainer}
        >
          <BlurView intensity={60} style={styles.notConnectedBlur}>
            <View style={styles.notConnectedContent}>
              <LinearGradient
                colors={[Colors['camp-orange'], Colors['warm-1']]}
                style={styles.connectIcon}
              >
                <Sparkles size={32} color="white" />
              </LinearGradient>
              <Text style={styles.notConnectedTitle}>Connect Wallet to Start Creating</Text>
              <Text style={styles.notConnectedText}>
                Connect your wallet to create and register intellectual property on Camp Network
              </Text>
              <TouchableOpacity
                style={styles.connectButton}
                onPress={() => (global as any).openAppKit?.()}
              >
                <LinearGradient
                  colors={[Colors['camp-orange'], Colors['warm-1']]}
                  style={styles.connectButtonGradient}
                >
                  <Text style={styles.connectButtonText}>Connect Wallet</Text>
                  <ArrowRight size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors['camp-light'], Colors['cool-3'] + '10']}
        style={styles.backgroundGradient}
      />
      
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View style={[styles.header, animatedStyle]}>
            <LinearGradient
              colors={[Colors['camp-orange'], Colors['warm-1']]}
              style={styles.headerIcon}
            >
              <Upload size={28} color="white" />
            </LinearGradient>
            <Text style={styles.headerTitle}>Create IP NFT</Text>
            <Text style={styles.headerSubtitle}>
              Transform your intellectual property into a valuable blockchain asset
            </Text>
          </Animated.View>

          <View style={styles.formContainer}>
            {/* File Upload Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Upload File *</Text>
              <TouchableOpacity
                style={[styles.fileUploadContainer, selectedFile && styles.fileUploadActive]}
                onPress={pickFile}
                activeOpacity={0.8}
              >
                <BlurView intensity={80} style={styles.fileUploadBlur}>
                  {selectedFile ? (
                    <View style={styles.fileSelectedContainer}>
                      <LinearGradient
                        colors={[Colors['camp-orange'], Colors['warm-1']]}
                        style={styles.fileIcon}
                      >
                        <CheckCircle size={24} color="white" />
                      </LinearGradient>
                      <View style={styles.fileInfo}>
                        <Text style={styles.fileName}>{selectedFile.name}</Text>
                        <Text style={styles.fileSize}>
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.fileUploadPrompt}>
                      <Upload size={48} color={Colors['cool-1']} />
                      <Text style={styles.fileUploadText}>Tap to Upload File</Text>
                      <Text style={styles.fileUploadHint}>
                        Support all file types (images, videos, audio, documents, code)
                      </Text>
                    </View>
                  )}
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter the title of your IP"
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                placeholderTextColor={Colors['cool-1']}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your intellectual property in detail..."
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholderTextColor={Colors['cool-1']}
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
                    activeOpacity={0.8}
                  >
                    <BlurView 
                      intensity={60} 
                      style={[
                        styles.categoryBlur,
                        selectedCategory === category.id && styles.categoryBlurSelected
                      ]}
                    >
                      <LinearGradient
                        colors={selectedCategory === category.id ? category.color as any : [Colors['cool-3'], Colors['cool-2']] as any}
                        style={styles.categoryIconContainer}
                      >
                        <category.icon size={20} color="white" />
                      </LinearGradient>
                      <Text style={[
                        styles.categoryName,
                        selectedCategory === category.id && styles.categoryNameSelected
                      ]}>
                        {category.name}
                      </Text>
                    </BlurView>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Pricing Section */}
            <View style={styles.pricingSection}>
              <Text style={styles.sectionTitle}>License Terms</Text>
              
              <View style={styles.pricingGrid}>
                <View style={styles.pricingItem}>
                  <Text style={styles.inputLabel}>Price (CAMP) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0.001"
                    value={formData.priceInCAMP}
                    onChangeText={(value) => handleInputChange('priceInCAMP', value)}
                    placeholderTextColor={Colors['cool-1']}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.pricingItem}>
                  <Text style={styles.inputLabel}>Royalty (%)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="5"
                    value={formData.royaltyPercentage}
                    onChangeText={(value) => handleInputChange('royaltyPercentage', value)}
                    placeholderTextColor={Colors['cool-1']}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (seconds, 0 = perpetual)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  value={formData.duration}
                  onChangeText={(value) => handleInputChange('duration', value)}
                  placeholderTextColor={Colors['cool-1']}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Advanced Options */}
            <View style={styles.advancedSection}>
              <TouchableOpacity
                style={styles.derivativeToggle}
                onPress={() => handleInputChange('isDerivative', (!formData.isDerivative).toString())}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, formData.isDerivative && styles.checkboxActive]}>
                  {formData.isDerivative && <CheckCircle size={16} color="white" />}
                </View>
                <Text style={styles.derivativeText}>This is a derivative work</Text>
              </TouchableOpacity>

              {formData.isDerivative && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Parent IP Token ID</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter parent token ID"
                    value={formData.parentId}
                    onChangeText={(value) => handleInputChange('parentId', value)}
                    placeholderTextColor={Colors['cool-1']}
                  />
                </View>
              )}
            </View>

            {/* Tags */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tags</Text>
              <TextInput
                style={styles.textInput}
                placeholder="ai, art, digital, nft (comma-separated)"
                value={formData.tags}
                onChangeText={(value) => handleInputChange('tags', value)}
                placeholderTextColor={Colors['cool-1']}
              />
              <Text style={styles.inputHint}>
                Add comma-separated tags to help others discover your IP
              </Text>
            </View>

            {/* Error/Success Messages */}
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {success && (
              <View style={styles.successContainer}>
                <CheckCircle size={20} color={Colors.success} />
                <Text style={styles.successText}>{success}</Text>
              </View>
            )}

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, (isCreating || loading) && styles.createButtonDisabled]}
              onPress={handleCreateIP}
              disabled={isCreating || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={(isCreating || loading) ? 
                  [Colors['cool-1'], Colors['cool-2']] : 
                  [Colors['camp-orange'], Colors['warm-1']]
                }
                style={styles.createButtonGradient}
              >
                {(isCreating || loading) ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.createButtonText}>Creating IP NFT...</Text>
                  </View>
                ) : (
                  <View style={styles.loadingContainer}>
                    <Sparkles size={20} color="white" />
                    <Text style={styles.createButtonText}>Create IP NFT</Text>
                  </View>
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
    backgroundColor: Colors['camp-light'],
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  notConnectedBlur: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  notConnectedContent: {
    alignItems: 'center',
  },
  connectIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  notConnectedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors['camp-dark'],
    textAlign: 'center',
    marginBottom: 10,
  },
  notConnectedText: {
    fontSize: 16,
    color: Colors['cool-1'],
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  connectButton: {
    width: 200,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors['camp-orange'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  connectButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: Colors['camp-orange'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors['camp-dark'],
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors['cool-1'],
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: width * 0.8,
  },
  formContainer: {
    padding: 24,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors['camp-dark'],
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors['cool-3'],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors['camp-dark'],
    backgroundColor: 'white',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 14,
    color: Colors['cool-1'],
    marginTop: 6,
    lineHeight: 20,
  },
  fileUploadContainer: {
    borderWidth: 2,
    borderColor: Colors['cool-3'],
    borderRadius: 16,
    borderStyle: 'dashed',
    overflow: 'hidden',
    minHeight: 140,
  },
  fileUploadActive: {
    borderColor: Colors['camp-orange'],
    borderStyle: 'solid',
  },
  fileUploadBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fileSelectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors['camp-dark'],
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: Colors['cool-1'],
  },
  fileUploadPrompt: {
    alignItems: 'center',
    gap: 12,
  },
  fileUploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors['camp-dark'],
  },
  fileUploadHint: {
    fontSize: 14,
    color: Colors['cool-1'],
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryScroll: {
    marginVertical: 8,
  },
  categoryCard: {
    borderRadius: 16,
    marginRight: 12,
    minWidth: 160,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryCardSelected: {
    elevation: 6,
    shadowColor: Colors['camp-orange'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryBlur: {
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  categoryBlurSelected: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors['camp-dark'],
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: Colors['camp-orange'],
  },
  pricingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors['camp-dark'],
    marginBottom: 16,
  },
  pricingGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  pricingItem: {
    flex: 1,
  },
  advancedSection: {
    marginBottom: 24,
  },
  derivativeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors['cool-3'],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxActive: {
    backgroundColor: Colors['camp-orange'],
    borderColor: Colors['camp-orange'],
  },
  derivativeText: {
    fontSize: 16,
    color: Colors['camp-dark'],
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF4444' + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00CC66' + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    flex: 1,
    color: '#00CC66',
    fontSize: 14,
    fontWeight: '500',
  },
  createButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: Colors['camp-orange'],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  createButtonDisabled: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  createButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
