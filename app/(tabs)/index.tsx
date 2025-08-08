import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useCampNetworkSDK } from '@/hooks/useCampNetworkSDK';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface IPAsset {
  id: string;
  title: string;
  type: 'document' | 'image' | 'product' | 'design';
  thumbnail?: string;
  price: string;
  status: 'owned' | 'listed' | 'auction' | 'negotiating';
  views: number;
  offers: number;
}

interface Activity {
  id: string;
  type: 'created' | 'listed' | 'sold' | 'bid' | 'offer';
  title: string;
  timestamp: string;
  amount?: string;
}

export default function HomeScreen() {
  const campSDK = useCampNetworkSDK();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [userAssets, setUserAssets] = useState<IPAsset[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [usageData, setUsageData] = useState<any>(null);
  const [autoAuthTriggered, setAutoAuthTriggered] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auto-authenticate with Camp Network when wallet is connected
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (campSDK.shouldAuthenticate && !campSDK.isLoading && !autoAuthTriggered) {
      console.log('🔄 Auto-authentication triggered - scheduling Camp SDK authentication...');
      setAutoAuthTriggered(true);
      
      timeoutId = setTimeout(() => {
        console.log('🚀 Executing one-time Camp SDK authentication...');
        campSDK.authenticate().catch((error: any) => {
          console.error('❌ Auto-authentication failed:', error);
          setAutoAuthTriggered(false);
        });
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        console.log('🧹 Clearing auto-authentication timeout');
        clearTimeout(timeoutId);
      }
    };
  }, [campSDK.shouldAuthenticate, autoAuthTriggered]);

  // Reset auto-auth flag when wallet disconnects
  useEffect(() => {
    if (!campSDK.shouldAuthenticate && !campSDK.user) {
      setAutoAuthTriggered(false);
    }
  }, [campSDK.shouldAuthenticate, campSDK.user]);

  // Fetch usage data when authenticated with Camp Network
  useEffect(() => {
    if (campSDK.isAuthenticated) {
      console.log('🔍 Fetching Camp usage data...');
      campSDK.getUsage().then(setUsageData).catch(console.error);
    }
  }, [campSDK.isAuthenticated]);

  // Update user assets when IP assets are loaded
  useEffect(() => {
    if (campSDK.ipAssets.length > 0) {
      console.log('📦 Loading IP assets from Camp SDK:', campSDK.ipAssets);
      const assets = campSDK.ipAssets.map((asset: any) => ({
        id: asset.id,
        title: asset.title,
        type: asset.type as 'document' | 'image' | 'product' | 'design',
        thumbnail: asset.metadata?.image,
        price: asset.price,
        status: asset.status as 'owned' | 'listed' | 'auction' | 'negotiating',
        views: Math.floor(Math.random() * 50),
        offers: Math.floor(Math.random() * 10),
      }));
      setUserAssets(assets);
    } else if (campSDK.isAuthenticated) {
      setUserAssets([]);
    }
  }, [campSDK.ipAssets, campSDK.isAuthenticated]);

  // Show onboarding only if not authenticated
  useEffect(() => {
    if (!campSDK.isAuthenticated && !showOnboarding) {
      setShowOnboarding(true);
    } else if (campSDK.isAuthenticated && showOnboarding) {
      setShowOnboarding(false);
    }
  }, [campSDK.isAuthenticated, showOnboarding]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Mock recent activity data
  useEffect(() => {
    if (campSDK.isAuthenticated) {
      setRecentActivity([
        {
          id: '1',
          type: 'bid',
          title: 'New bid on Mobile App Concept',
          timestamp: '2 hours ago',
          amount: '0.25 ETH',
        },
        {
          id: '2',
          type: 'offer',
          title: 'Offer received on Product Design',
          timestamp: '1 day ago',
          amount: '0.4 ETH',
        },
        {
          id: '3',
          type: 'listed',
          title: 'Product Design listed on marketplace',
          timestamp: '2 days ago',
        },
      ]);
    }
  }, [campSDK.isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (campSDK.isAuthenticated) {
        console.log('🔄 Refreshing Camp SDK data...');
        const usage = await campSDK.getUsage();
        if (usage) setUsageData(usage);
        await campSDK.refreshAssets();
      }
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: IPAsset['status']) => {
    switch (status) {
      case 'listed':
        return Colors.camp.green[500];
      case 'auction':
        return Colors.camp.orange[500];
      case 'negotiating':
        return Colors.camp.blue[500];
      default:
        return Colors[colorScheme ?? 'light'].text;
    }
  };

  const getStatusText = (status: IPAsset['status']) => {
    switch (status) {
      case 'listed':
        return 'Listed';
      case 'auction':
        return 'On Auction';
      case 'negotiating':
        return 'Negotiating';
      default:
        return 'Owned';
    }
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText type="title">Your IP Portfolio</ThemedText>
            <ThemedText style={styles.addressText}>
              {campSDK.user?.address ? `${campSDK.user.address.slice(0, 6)}...${campSDK.user.address.slice(-4)}` : 'Not Connected'}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <IconSymbol size={24} name="person.circle" color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/create')}
          >
            <LinearGradient
              colors={[Colors.camp.green[500], Colors.camp.green[600]]}
              style={styles.quickActionGradient}
            >
              <IconSymbol size={28} name="plus.circle.fill" color="white" />
              <ThemedText style={styles.quickActionText}>Create IP</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/chat')}
          >
            <LinearGradient
              colors={[Colors.camp.blue[500], Colors.camp.blue[600]]}
              style={styles.quickActionGradient}
            >
              <IconSymbol size={28} name="message.fill" color="white" />
              <ThemedText style={styles.quickActionText}>Chat & Trade</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/marketplace')}
          >
            <LinearGradient
              colors={[Colors.camp.purple[500], Colors.camp.purple[600]]}
              style={styles.quickActionGradient}
            >
              <IconSymbol size={28} name="storefront.fill" color="white" />
              <ThemedText style={styles.quickActionText}>Marketplace</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/auctions')}
          >
            <LinearGradient
              colors={[Colors.camp.orange[500], Colors.camp.orange[600]]}
              style={styles.quickActionGradient}
            >
              <IconSymbol size={28} name="hammer.fill" color="white" />
              <ThemedText style={styles.quickActionText}>Auctions</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Your IP Assets */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Your IP Assets</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assetsScroll}>
            {userAssets.map((asset) => (
              <TouchableOpacity key={asset.id} style={styles.assetCard}>
                <View style={styles.assetThumbnail}>
                  <IconSymbol 
                    size={40} 
                    name={
                      asset.type === 'document' ? 'doc.fill' :
                      asset.type === 'image' ? 'photo.fill' :
                      asset.type === 'design' ? 'paintbrush.fill' :
                      'cube.fill'
                    } 
                    color={Colors[colorScheme ?? 'light'].text} 
                  />
                </View>
                <ThemedText style={styles.assetTitle} numberOfLines={2}>
                  {asset.title}
                </ThemedText>
                <ThemedText style={styles.assetPrice}>{asset.price}</ThemedText>
                <View style={styles.assetStatus}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(asset.status) }]} />
                  <ThemedText style={styles.statusText}>{getStatusText(asset.status)}</ThemedText>
                </View>
                <View style={styles.assetStats}>
                  <View style={styles.assetStat}>
                    <IconSymbol size={14} name="eye.fill" color={Colors[colorScheme ?? 'light'].text} />
                    <ThemedText style={styles.assetStatText}>{asset.views}</ThemedText>
                  </View>
                  <View style={styles.assetStat}>
                    <IconSymbol size={14} name="hand.raised.fill" color={Colors[colorScheme ?? 'light'].text} />
                    <ThemedText style={styles.assetStatText}>{asset.offers}</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.addAssetCard}
              onPress={() => router.push('/create')}
            >
              <IconSymbol size={32} name="plus.circle.fill" color={Colors.camp.orange[500]} />
              <ThemedText style={styles.addAssetText}>Create New IP</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Activity</ThemedText>
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <TouchableOpacity key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <IconSymbol 
                    size={20} 
                    name={
                      activity.type === 'bid' ? 'hammer.fill' :
                      activity.type === 'offer' ? 'hand.raised.fill' :
                      activity.type === 'sold' ? 'checkmark.circle.fill' :
                      activity.type === 'listed' ? 'storefront.fill' :
                      'plus.circle.fill'
                    }
                    color={
                      activity.type === 'bid' ? Colors.camp.orange[500] :
                      activity.type === 'offer' ? Colors.camp.blue[500] :
                      activity.type === 'sold' ? Colors.camp.green[500] :
                      activity.type === 'listed' ? Colors.camp.purple[500] :
                      Colors.camp.green[500]
                    }
                  />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>{activity.title}</ThemedText>
                  <ThemedText style={styles.activityTime}>{activity.timestamp}</ThemedText>
                </View>
                {activity.amount && (
                  <ThemedText style={styles.activityAmount}>{activity.amount}</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    flex: 1,
  },
  addressText: {
    opacity: 0.6,
    fontSize: 14,
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickAction: {
    width: (width - 60) / 2,
    marginRight: 20,
    marginBottom: 16,
  },
  quickActionGradient: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  quickActionText: {
    color: 'white',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  assetsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  assetCard: {
    width: 160,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  assetThumbnail: {
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  assetTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    minHeight: 36,
  },
  assetPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  assetStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    opacity: 0.8,
  },
  assetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  assetStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetStatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  addAssetCard: {
    width: 160,
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.camp.orange[500] + '50',
  },
  addAssetText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.camp.orange[500],
  },
  activityList: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.camp.green[500],
  },
});
