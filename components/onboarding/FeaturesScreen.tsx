import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeaturesScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function FeaturesScreen({ onNext, onBack }: FeaturesScreenProps) {
  const features = [
    {
      icon: '💎',
      title: 'Create IP NFTs',
      description: 'Transform your intellectual property into tradeable digital assets with verified ownership.',
      color: '#FF6B35',
    },
    {
      icon: '🔥',
      title: 'Live Auctions',
      description: 'Participate in exciting auctions for premium intellectual property and rare digital assets.',
      color: '#E11D48',
    },
    {
      icon: '🎰',
      title: 'IP Lottery',
      description: 'Try your luck with lottery-style IP acquisitions and win exclusive rights.',
      color: '#7C3AED',
    },
    {
      icon: '💬',
      title: 'Chat & Trade',
      description: 'Negotiate directly with creators and collectors in real-time trading conversations.',
      color: '#4ECDC4',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Powerful Features</Text>
          <View style={styles.backButton} />
        </View>

        {/* Features List */}
        <ScrollView style={styles.featuresContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Everything you need to succeed in the IP marketplace</Text>
          
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                <Text style={styles.featureEmoji}>{feature.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <View style={[styles.featureAccent, { backgroundColor: feature.color }]} />
            </View>
          ))}

          {/* Additional Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Plus Additional Benefits</Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                <Text style={styles.benefitText}>Secure blockchain transactions</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="flash" size={20} color="#F59E0B" />
                <Text style={styles.benefitText}>Low-cost, fast transfers</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="people" size={20} color="#3B82F6" />
                <Text style={styles.benefitText}>Thriving creator community</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="trending-up" size={20} color="#8B5CF6" />
                <Text style={styles.benefitText}>Royalty earning opportunities</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navigation}>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>
        
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  featuresContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  featureAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
  },
  benefitsSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 16,
    color: '#475569',
    marginLeft: 12,
    fontWeight: '500',
  },
  navigation: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF6B35',
    width: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});
