import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { router } from 'expo-router';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import FeaturesScreen from '@/components/onboarding/FeaturesScreen';
import ConnectWalletScreen from '@/components/onboarding/ConnectWalletScreen';
import { useCampAuth } from '@/hooks/useCampAuth';

export default function SignInScreen() {
  const { isConnected,address } = useAccount();
const {connect }= useCampAuth()
  const [currentStep, setCurrentStep] = useState(0);

  // Redirect if already connected
  React.useEffect(() => {
    if (isConnected) {
      console.log("first")
      // connect(address|| '0x')

      router.replace('/(tabs)');
    }
  }, [isConnected]);

  if (isConnected) {
    return null;
  }

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderScreen = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onNext={handleNext} />;
      case 1:
        return <FeaturesScreen onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <ConnectWalletScreen onBack={handleBack} />;
      default:
        return <WelcomeScreen onNext={handleNext} />;
    }
  };

  return renderScreen();
}

