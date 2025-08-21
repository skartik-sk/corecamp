import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Platform,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAccount } from 'wagmi';
import { useCampNetworkSDK } from '@/hooks/useCampNetworkSDK';
import { useCampfireIntegration } from '@/hooks/useCampfireIntegration';
import { Colors } from '@/constants/Colors';
import Header from '@/components/ui/Header';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withDelay,
  withRepeat,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { 
  Zap, 
  Shield, 
  Users, 
  Flame, 
  ArrowRight, 
  Star,
  TrendingUp
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Data matching web design
const features = [
  {
    name: 'Create & Mint IP',
    description: 'Upload any content and turn it into a tokenized IP NFT with customizable licensing terms.',
    icon: Zap,
    gradient: [Colors['warm-1'], Colors['warm-2']],
  },
  {
    name: 'Secure Trading',
    description: 'Buy, sell, and negotiate IP rights with built-in escrow protection and smart contracts.',
    icon: Shield,
    gradient: [Colors['cool-1'], Colors['cool-2']],
  },
  {
    name: 'Community Driven',
    description: 'Connect with creators, collaborate on projects, and build the future of IP together.',
    icon: Users,
    gradient: [Colors['camp-orange'], Colors['warm-1']],
  },
];

const stats = [
  { name: 'Total IPs Created', value: '2.5K+' },
  { name: 'Active Creators', value: '850+' },
  { name: 'Total Volume', value: '$125K+' },
  { name: 'Successful Trades', value: '3.2K+' },
];

interface IPAsset {
  id: string;
  title?: string;
  createdAt?: string;
  url?: string;
  animation_url?: string | null;
  external_app_url?: string | null;
  image_url?: string | null;
  media_url?: string | null;
  is_unique?: boolean | null;
  media_type?: string | null;
  type?: 'video' | 'music' | 'image' | 'document' | 'design' | string;
  thumbnail?: string;
  status?: 'owned' | 'listed' | 'auction' | 'negotiating' | string;
  views?: number;
  offers?: number;
  category?: string;
  description?: string;
  image?: string;
  isDerivative?: boolean;
  mimeType?: string;
  owner?: string;
  parentId?: string;
  price?: string | number;
  size?: number;
  tags?: string[];
}

export default function HomeScreen() {
  const { address } = useAccount();
  const { getOriginData } = useCampfireIntegration();
  const campSDK = useCampNetworkSDK();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [userAssets, setUserAssets] = useState<IPAsset[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.9);
  const pulseAnim = useSharedValue(0);

  // Initialize animations
  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000 });
    slideUpAnim.value = withSpring(0, { damping: 20, stiffness: 100 });
    scaleAnim.value = withSpring(1, { damping: 20, stiffness: 100 });
    pulseAnim.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  // Animated styles
  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideUpAnim.value }],
  }));

  const scaleInStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(
      pulseAnim.value,
      [0, 1],
      [0.3, 0.8],
      Extrapolate.CLAMP
    ),
  }));

  // Fetch user assets
  useEffect(() => {
    const fetchAssets = async () => {
      if (!address) return;
      
      try {
        const res = await getOriginData(address);
        if (res.length > 0) {
          const assets = res.map((asset: any) => ({
            id: asset.id,
            title: asset.metadata?.name ?? `Asset ${asset.id}`,
            url: asset.animation_url ?? asset.metadata.image,
            type: asset.animation_url ? 'video' : 'image',
            thumbnail: asset.metadata?.image ?? asset.image_url,
            price: `${asset.metadata?.price ?? 0} CAMP`,
            owner: asset.owner,
            status: asset.owner !== address ? 'listed' : 'owned',
          }));
          setUserAssets(assets);
        }
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      }
    };

    fetchAssets();
  }, [address]);

  // Show onboarding for non-authenticated users
  useEffect(() => {
    setShowOnboarding(!campSDK.isAuthenticated && !address);
  }, [campSDK.isAuthenticated, address]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (campSDK.isAuthenticated) {
        await campSDK.refreshAssets();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAuth = () => {
    (global as any).openAppKit?.();
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[
          'rgba(249, 246, 242, 0.9)',
          'rgba(255, 255, 255, 0.8)',
          'rgba(162, 213, 209, 0.2)'
        ]}
        style={styles.backgroundGradient}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <Animated.View style={[styles.heroSection, fadeInStyle]}>
          <Animated.View style={[styles.heroIconContainer, pulseStyle]}>
            <LinearGradient
              colors={Colors.gradients.primary as any}
              style={styles.heroIcon}
            >
              <Flame size={40} color="white" />
            </LinearGradient>
          </Animated.View>

          <Text style={styles.heroTitle}>
            Where IP Meets{'\n'}
            <LinearGradient
              colors={[Colors['camp-orange'], Colors['warm-2'], Colors['warm-1']]}
              style={styles.gradientText}
            >
              <Text style={[styles.heroTitle, styles.gradientTextInner]}>
                Innovation
              </Text>
            </LinearGradient>
          </Text>

          <Text style={styles.heroSubtitle}>
            The ultimate marketplace for intellectual property. Create, trade, auction, and collaborate on IP assets powered by Camp Network's Origin SDK and blockchain technology.
          </Text>

          <View style={styles.heroActions}>
            {campSDK.isAuthenticated ? (
              <>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => router.push('/create')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={Colors.gradients.primary as any}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>Create Your First IP</Text>
                    <ArrowRight size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => router.push('/marketplace')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Explore Marketplace</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleAuth}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={Colors.gradients.primary as any}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>Connect Wallet to Start</Text>
                    <ArrowRight size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => router.push('/marketplace')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Browse IPs</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Everything You Need for IP Trading</Text>
            <Text style={styles.sectionSubtitle}>
              From creation to marketplace, auctions to negotiations - we've got you covered.
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.name}
                style={[
                  styles.featureCard,
                  {
                    opacity: withDelay(
                      index * 200,
                      withTiming(1, { duration: 600 })
                    ),
                  }
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.95}
                  style={styles.featureCardTouchable}
                  onPress={() => {
                    if (feature.name === 'Create & Mint IP') router.push('/create');
                    else if (feature.name === 'Secure Trading') router.push('/marketplace');
                    else if (feature.name === 'Community Driven') router.push('/chat');
                  }}
                >
                  <BlurView intensity={80} style={styles.featureBlur}>
                    <View style={styles.featureContent}>
                      {/* Feature Header with Icon and Trending Indicator */}
                      <View style={styles.featureHeader}>
                        <LinearGradient
                          colors={feature.gradient as any}
                          style={styles.featureIcon}
                        >
                          <feature.icon size={28} color="white" />
                        </LinearGradient>
                        <View style={styles.featureTrendIndicator}>
                          <TrendingUp size={16} color={Colors.success} />
                        </View>
                      </View>

                      {/* Feature Title and Badge */}
                      <View style={styles.featureTitleContainer}>
                        <Text style={styles.featureTitle}>{feature.name}</Text>
                        <View style={styles.featureBadge}>
                          <Text style={styles.featureBadgeText}>HOT</Text>
                        </View>
                      </View>

                      {/* Feature Description */}
                      <Text style={styles.featureDescription}>{feature.description}</Text>

                      {/* Feature Stats */}
                      <View style={styles.featureStats}>
                        <View style={styles.featureStatItem}>
                          <Text style={styles.featureStatValue}>
                            {index === 0 ? '2.5K+' : index === 1 ? '125K+' : '850+'}
                          </Text>
                          <Text style={styles.featureStatLabel}>
                            {index === 0 ? 'Created' : index === 1 ? 'Volume' : 'Users'}
                          </Text>
                        </View>
                        <View style={styles.featureStatDivider} />
                        <View style={styles.featureStatItem}>
                          <Text style={styles.featureStatValue}>98%</Text>
                          <Text style={styles.featureStatLabel}>Success</Text>
                        </View>
                      </View>

                      {/* Action Arrow */}
                      <View style={styles.featureAction}>
                        <View style={styles.featureActionButton}>
                          <ArrowRight size={20} color={feature.gradient[0]} />
                        </View>
                      </View>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <LinearGradient
          colors={Colors.gradients.primary as any}
          style={styles.statsSection}
        >
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Animated.View
                key={stat.name}
                style={[
                  styles.statItem,
                  {
                    transform: [
                      {
                        scale: withDelay(
                          index * 100,
                          withSpring(1, { damping: 15 })
                        )
                      }
                    ]
                  }
                ]}
              >
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statName}>{stat.name}</Text>
              </Animated.View>
            ))}
          </View>
        </LinearGradient>

        {/* Recent Activity Section */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Activity</Text>
            <Text style={styles.sectionSubtitle}>
              See what's happening in the CoreCamp community
            </Text>
          </View>

          <View style={styles.activityGrid}>
            {[
              {
                id: 1,
                type: 'listing',
                title: 'AI Art Collection #001',
                description: 'A unique collection of AI-generated artwork ready for licensing and collaboration.',
                price: '125',
                currency: 'CAMP',
                trend: '+15%',
                time: '2 hours ago',
                category: 'Digital Art',
                likes: 24,
                views: 156,
                image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop',
              },
              {
                id: 2,
                type: 'sale',
                title: 'Smart Contract Template',
                description: 'Production-ready smart contract for DeFi applications with comprehensive documentation.',
                price: '89',
                currency: 'CAMP',
                trend: '+8%',
                time: '4 hours ago',
                category: 'Code',
                likes: 18,
                views: 89,
                image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
              },
              {
                id: 3,
                type: 'auction',
                title: 'Music Producer Pack',
                description: 'Professional music samples and loops from award-winning producers.',
                price: '67',
                currency: 'CAMP',
                trend: '+22%',
                time: '6 hours ago',
                category: 'Music',
                likes: 32,
                views: 203,
                image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
              }
            ].map((item, index) => (
              <Animated.View
                key={item.id}
                style={[
                  styles.activityCard,
                  {
                    opacity: withDelay(
                      index * 150,
                      withTiming(1, { duration: 600 })
                    ),
                  }
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.95}
                  style={styles.activityCardTouchable}
                  onPress={() => router.push('/marketplace')}
                >
                  <BlurView intensity={80} style={styles.activityBlur}>
                    <View style={styles.activityContent}>
                      {/* Activity Media */}
                      <View style={styles.activityMediaContainer}>
                        <View style={styles.activityImageContainer}>
                          <LinearGradient
                            colors={[Colors['cool-1'], Colors['camp-orange']]}
                            style={styles.activityImagePlaceholder}
                          >
                            <Star size={24} color="white" />
                          </LinearGradient>
                          <View style={styles.activityTypeIndicator}>
                            <Text style={styles.activityTypeText}>
                              {item.type.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.activityCategoryBadge}>
                          <Text style={styles.activityCategoryText}>{item.category}</Text>
                        </View>
                      </View>

                      {/* Activity Header */}
                      <View style={styles.activityHeader}>
                        <View style={styles.activityHeaderLeft}>
                          <Text style={styles.activityTitle}>{item.title}</Text>
                          <Text style={styles.activityTime}>{item.time}</Text>
                        </View>
                        <View style={styles.activityTrend}>
                          <TrendingUp size={16} color={Colors.success} />
                          <Text style={styles.activityTrendText}>{item.trend}</Text>
                        </View>
                      </View>

                      {/* Activity Description */}
                      <Text style={styles.activityDescription}>{item.description}</Text>

                      {/* Activity Stats */}
                      <View style={styles.activityStatsContainer}>
                        <View style={styles.activityStatsRow}>
                          <View style={styles.activityStatItem}>
                            <Text style={styles.activityStatValue}>{item.likes}</Text>
                            <Text style={styles.activityStatLabel}>Likes</Text>
                          </View>
                          <View style={styles.activityStatDivider} />
                          <View style={styles.activityStatItem}>
                            <Text style={styles.activityStatValue}>{item.views}</Text>
                            <Text style={styles.activityStatLabel}>Views</Text>
                          </View>
                        </View>
                      </View>

                      {/* Activity Footer */}
                      <View style={styles.activityFooter}>
                        <View style={styles.activityPriceContainer}>
                          <Text style={styles.activityPrice}>{item.price} {item.currency}</Text>
                          <Text style={styles.activityPriceLabel}>Current Price</Text>
                        </View>
                        <View style={styles.activityActionButton}>
                          <ArrowRight size={20} color={Colors['camp-orange']} />
                        </View>
                      </View>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        {!campSDK.isAuthenticated && (
          <LinearGradient
            colors={[Colors['cool-1'], Colors['camp-dark']]}
            style={styles.ctaSection}
          >
            <Text style={styles.ctaTitle}>Ready to Start Your IP Journey?</Text>
            <Text style={styles.ctaSubtitle}>
              Join thousands of creators building the future of intellectual property on the blockchain.
            </Text>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={handleAuth}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Connect Wallet to Begin</Text>
              <ArrowRight size={20} color={Colors['cool-1']} />
            </TouchableOpacity>
          </LinearGradient>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  
  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: 'center',
  },
  heroIconContainer: {
    marginBottom: 32,
    shadowColor: Colors['camp-orange'],
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: Platform.OS === 'ios' ? 36 : 32,
    fontWeight: '800',
    color: Colors['camp-dark'],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: Platform.OS === 'ios' ? 44 : 40,
    fontFamily: 'Inter_800ExtraBold',
  },
  gradientText: {
    borderRadius: 8,
  },
  gradientTextInner: {
    color: 'transparent',
  },
  heroSubtitle: {
    fontSize: 18,
    color: Colors['cool-1'],
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
    maxWidth: width * 0.9,
    fontFamily: 'Inter_400Regular',
  },
  heroActions: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    shadowColor: Colors['camp-orange'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors['cool-1'],
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Colors['cool-1'],
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors['camp-dark'],
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors['cool-1'],
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
    fontFamily: 'Inter_400Regular',
  },
  featuresGrid: {
    gap: 24,
  },
  featureCard: {
    marginBottom: 8,
  },
  featureCardTouchable: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors['camp-orange'],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  featureBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureContent: {
    padding: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    position: 'relative',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  featureTrendIndicator: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  featureBadge: {
    backgroundColor: Colors['camp-orange'],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  featureStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(162, 213, 209, 0.2)',
  },
  featureStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors['camp-dark'],
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  featureStatLabel: {
    fontSize: 12,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },
  featureStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(162, 213, 209, 0.3)',
    marginHorizontal: 16,
  },
  featureAction: {
    alignItems: 'flex-end',
  },
  featureActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(162, 213, 209, 0.2)',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors['camp-dark'],
    marginBottom: 0,
    fontFamily: 'Inter_700Bold',
    flex: 1,
  },
  featureDescription: {
    fontSize: 15,
    color: Colors['cool-1'],
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
    textAlign: 'left',
  },

  // Stats Section
  statsSection: {
    paddingVertical: 48,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    width: '50%',
    marginBottom: 32,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  statName: {
    fontSize: 14,
    color: 'rgba(255, 180, 0, 0.8)',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },

  // Activity Section
  activitySection: {
    paddingHorizontal: 20,
    paddingVertical: 80,
  },
  activityGrid: {
    gap: 24,
  },
  activityCard: {
    marginBottom: 8,
  },
  activityCardTouchable: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors['camp-orange'],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  activityBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activityContent: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  activityMediaContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  activityImageContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  activityImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  activityTypeIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors['camp-orange'],
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activityTypeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  activityCategoryBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(162, 213, 209, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(162, 213, 209, 0.3)',
  },
  activityCategoryText: {
    color: Colors['cool-1'],
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityHeaderLeft: {
    flex: 1,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityTime: {
    fontSize: 12,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors['camp-dark'],
    marginBottom: 0,
    fontFamily: 'Inter_700Bold',
    lineHeight: 24,
  },
  activityDescription: {
    fontSize: 14,
    color: Colors['cool-1'],
    lineHeight: 22,
    marginBottom: 20,
    fontFamily: 'Inter_400Regular',
  },
  activityStatsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(162, 213, 209, 0.2)',
  },
  activityStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  activityStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors['camp-dark'],
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  activityStatLabel: {
    fontSize: 11,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },
  activityStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(162, 213, 209, 0.3)',
    marginHorizontal: 16,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityPriceContainer: {
    flex: 1,
  },
  activityPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors['camp-orange'],
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  activityPriceLabel: {
    fontSize: 11,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },
  activityTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activityTrendText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  activityActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(162, 213, 209, 0.2)',
    marginLeft: 16,
  },

  // CTA Section
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 64,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: Colors['cool-3'],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: width * 0.8,
    fontFamily: 'Inter_400Regular',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors['cool-1'],
    fontFamily: 'Inter_600SemiBold',
  },
});

