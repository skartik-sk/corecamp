/**
 * Comprehensive Onboarding Flow for Camp Network
 * Handles wallet connection and Origin SDK authentication
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CampConnectButton } from '@/components/CampConnectButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useOriginSDK } from '@/hooks/useOriginSDK';
import { useAccount } from 'wagmi';

const { width } = Dimensions.get('window');

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const colorScheme = useColorScheme();
  const originSDK = useOriginSDK();
  const { isConnected, address } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Camp Network',
      description: 'The premier marketplace for intellectual property trading with blockchain security and escrow protection.',
      icon: 'house.fill',
      color: Colors.camp.orange[500],
    },
    {
      id: 'wallet',
      title: 'Connect Your Wallet',
      description: 'Connect your crypto wallet to start creating and trading IP assets securely on the blockchain.',
      icon: 'wallet.pass.fill',
      color: Colors.camp.blue[500],
    },
    {
      id: 'authenticate',
      title: 'Authenticate with Camp Network',
      description: 'Sign a message to authenticate with Camp Network and access all platform features.',
      icon: 'shield.checkered.fill',
      color: Colors.camp.green[500],
    },
    {
      id: 'features',
      title: 'Explore Features',
      description: 'Create IP assets, negotiate prices, participate in auctions, and build your digital portfolio.',
      icon: 'star.fill',
      color: Colors.camp.purple[500],
    },
  ];

  // Auto-advance steps based on connection status
  useEffect(() => {
    if (isConnected && !completedSteps.includes(1)) {
      setCompletedSteps(prev => [...prev, 1]);
      if (currentStep <= 1) {
        setCurrentStep(2);
      }
    }
    
    if (originSDK.isAuthenticated && !completedSteps.includes(2)) {
      setCompletedSteps(prev => [...prev, 2]);
      if (currentStep <= 2) {
        setCurrentStep(3);
      }
    }
  }, [isConnected, originSDK.isAuthenticated, currentStep, completedSteps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepPress = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const handleAuthenticate = async () => {
    if (!isConnected) {
      Alert.alert('Wallet Required', 'Please connect your wallet first.');
      return;
    }

    try {
      await originSDK.authenticate();
      // Step will auto-advance via useEffect
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.message || 'Failed to authenticate with Camp Network');
    }
  };

  const currentStepData = steps[currentStep];
  const isStepCompleted = (stepIndex: number) => completedSteps.includes(stepIndex);
  const canProceed = () => {
    switch (currentStep) {
      case 1: return isConnected;
      case 2: return originSDK.isAuthenticated;
      default: return true;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {steps.map((step, index) => (
            <TouchableOpacity
              key={step.id}
              style={styles.progressStep}
              onPress={() => handleStepPress(index)}
              disabled={index > currentStep && !completedSteps.includes(index)}
            >
              <View style={[
                styles.progressDot,
                {
                  backgroundColor: 
                    index === currentStep 
                      ? step.color
                      : isStepCompleted(index)
                      ? Colors.camp.green[500]
                      : Colors[colorScheme ?? 'light'].text + '30'
                }
              ]}>
                {isStepCompleted(index) && (
                  <IconSymbol size={12} name="checkmark" color="white" />
                )}
              </View>
              {index < steps.length - 1 && (
                <View style={[
                  styles.progressLine,
                  {
                    backgroundColor: isStepCompleted(index)
                      ? Colors.camp.green[500]
                      : Colors[colorScheme ?? 'light'].text + '20'
                  }
                ]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Step Content */}
        <LinearGradient
          colors={[
            currentStepData.color + '20',
            currentStepData.color + '10',
          ]}
          style={styles.stepCard}
        >
          <View style={[styles.iconContainer, { backgroundColor: currentStepData.color + '20' }]}>
            <IconSymbol size={64} name={currentStepData.icon as any} color={currentStepData.color} />
          </View>
          
          <ThemedText type="title" style={styles.stepTitle}>
            {currentStepData.title}
          </ThemedText>
          
          <ThemedText style={styles.stepDescription}>
            {currentStepData.description}
          </ThemedText>

          {/* Step-specific Content */}
          {currentStep === 0 && (
            <View style={styles.featuresGrid}>
              <View style={styles.featureRow}>
                <View style={styles.feature}>
                  <IconSymbol size={24} name="plus.circle.fill" color={Colors.camp.green[500]} />
                  <ThemedText style={styles.featureText}>Create IP Assets</ThemedText>
                </View>
                <View style={styles.feature}>
                  <IconSymbol size={24} name="message.fill" color={Colors.camp.blue[500]} />
                  <ThemedText style={styles.featureText}>Negotiate Prices</ThemedText>
                </View>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.feature}>
                  <IconSymbol size={24} name="storefront.fill" color={Colors.camp.purple[500]} />
                  <ThemedText style={styles.featureText}>Marketplace Trading</ThemedText>
                </View>
                <View style={styles.feature}>
                  <IconSymbol size={24} name="hammer.fill" color={Colors.camp.orange[500]} />
                  <ThemedText style={styles.featureText}>Auctions & Lottery</ThemedText>
                </View>
              </View>
            </View>
          )}

          {currentStep === 1 && (
            <View style={styles.walletSection}>
              <View style={styles.walletStatus}>
                <IconSymbol 
                  size={20} 
                  name={isConnected ? "checkmark.circle.fill" : "exclamationmark.circle.fill"} 
                  color={isConnected ? Colors.camp.green[500] : Colors.camp.orange[500]} 
                />
                <ThemedText style={styles.statusText}>
                  {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Wallet not connected'}
                </ThemedText>
              </View>
              <CampConnectButton style={styles.connectButton} />
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.authSection}>
              <View style={styles.authStatus}>
                <IconSymbol 
                  size={20} 
                  name={originSDK.isAuthenticated ? "checkmark.circle.fill" : "shield.fill"} 
                  color={originSDK.isAuthenticated ? Colors.camp.green[500] : Colors.camp.blue[500]} 
                />
                <ThemedText style={styles.statusText}>
                  {originSDK.isAuthenticated ? 'Authenticated with Camp Network' : 'Ready to authenticate'}
                </ThemedText>
              </View>
              
              {!originSDK.isAuthenticated && (
                <TouchableOpacity
                  style={styles.authButton}
                  onPress={handleAuthenticate}
                  disabled={originSDK.isLoading}
                >
                  <LinearGradient
                    colors={[Colors.camp.green[500], Colors.camp.green[600]]}
                    style={styles.authButtonGradient}
                  >
                    <IconSymbol size={20} name="shield.checkered" color="white" />
                    <ThemedText style={styles.authButtonText}>
                      {originSDK.isLoading ? 'Authenticating...' : 'Authenticate Now'}
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.completionSection}>
              <ThemedText style={styles.completionText}>
                🎉 You're all set! Start exploring Camp Network and building your IP portfolio.
              </ThemedText>
            </View>
          )}
        </LinearGradient>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
              <ThemedText style={styles.backButtonText}>Back</ThemedText>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              { opacity: canProceed() ? 1 : 0.5 }
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <LinearGradient
              colors={[currentStepData.color, currentStepData.color + 'DD']}
              style={styles.nextButtonGradient}
            >
              <ThemedText style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
              </ThemedText>
              <IconSymbol size={16} name="arrow.right" color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressStep: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  stepCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresGrid: {
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  featureText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  walletSection: {
    width: '100%',
    alignItems: 'center',
  },
  walletStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  connectButton: {
    minWidth: 200,
  },
  authSection: {
    width: '100%',
    alignItems: 'center',
  },
  authStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  authButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 200,
  },
  authButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  completionSection: {
    width: '100%',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    marginLeft: 16,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
