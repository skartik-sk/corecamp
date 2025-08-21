import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAccount } from 'wagmi';
import { useCampfireIntegration } from '@/hooks/useCampfireIntegration';
import { Colors } from '@/constants/Colors';
import Header from '@/components/ui/Header';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { 
  Search, 
  Filter, 
  Clock,
  Gavel,
  Trophy,
  Users,
  Shield,
  TrendingUp,
  Gift,
  Ticket,
  Target,
  Timer,
  Zap
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Categories and sort options matching web
const categories = ['All', 'Live Auctions', 'Ending Soon', 'New Auctions', 'Featured'];
const sortOptions = ['Ending Soon', 'Highest Bid', 'Most Bids', 'Newest'];

interface AuctionItem {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  category: string;
  currentBid: string;
  startingBid: string;
  minIncrement: string;
  endTime: Date;
  startTime: Date;
  creator: string;
  image: string;
  totalBids: number;
  highestBidder: string;
  verified: boolean;
  featured: boolean;
  status: 'live' | 'upcoming' | 'ended';
  currency: string;
  animation_url?: string;
  audio_url?: string;
}

interface LotteryItem {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  category: string;
  ticketPrice: string;
  totalPool: string;
  ticketsSold: number;
  maxTickets: number;
  endTime: Date;
  startTime: Date;
  creator: string;
  image: string;
  verified: boolean;
  featured: boolean;
  status: 'active' | 'upcoming' | 'ended';
  currency: string;
  winners?: string[];
}

export default function AuctionsScreen() {
  const { address, isConnected } = useAccount();
  const { useAllAuctions, getDataByTokenId } = useCampfireIntegration();
  const router = useRouter();
  
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [lotteries, setLotteries] = useState<LotteryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Ending Soon');
  const [activeTab, setActiveTab] = useState<'auctions' | 'lottery'>('auctions');
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(30);

  // Initialize animations
  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideUpAnim.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  // Animated styles
  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideUpAnim.value }],
  }));

  // Mock data generation
  useEffect(() => {
    const generateMockAuctions = (): AuctionItem[] => {
      const mockAuctions: AuctionItem[] = [];
      const auctionNames = [
        'Premium AI Model License',
        'Exclusive Music Rights',
        'Digital Art Collection',
        'Code Repository Access',
        'Patent Portfolio',
        'Brand Trademark Bundle',
        'Video Content License',
        'Photography Collection',
        'Software Development Kit',
        'Research Data Package'
      ];

      for (let i = 0; i < 10; i++) {
        const endTime = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000); // Random end time within 7 days
        const startTime = new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000); // Random start time within last 2 days
        const currentBid = (Math.random() * 10 + 0.1).toFixed(2);
        
        mockAuctions.push({
          id: `auction-${i}`,
          tokenId: `${i + 1}`,
          name: auctionNames[i],
          description: `Exclusive licensing opportunity for ${auctionNames[i].toLowerCase()}. Gain commercial rights and access to premium intellectual property.`,
          category: ['AI/ML', 'Music', 'Art', 'Code', 'Patents'][Math.floor(Math.random() * 5)],
          currentBid,
          startingBid: (parseFloat(currentBid) * 0.5).toFixed(2),
          minIncrement: '0.01',
          endTime,
          startTime,
          creator: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
          image: `https://picsum.photos/400/250?random=${i + 100}`,
          totalBids: Math.floor(Math.random() * 50) + 1,
          highestBidder: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
          verified: Math.random() > 0.3,
          featured: Math.random() > 0.7,
          status: endTime > new Date() ? 'live' : 'ended',
          currency: 'CAMP',
          animation_url: Math.random() > 0.8 ? `video_${i}.mp4` : undefined,
          audio_url: Math.random() > 0.9 ? `audio_${i}.mp3` : undefined,
        });
      }
      return mockAuctions;
    };

    const generateMockLotteries = (): LotteryItem[] => {
      const mockLotteries: LotteryItem[] = [];
      const lotteryNames = [
        'Mystery IP Box',
        'Creative Commons Bundle',
        'Startup Asset Package',
        'Educational License Pool',
        'Entertainment Rights Draw',
        'Tech Patent Lottery',
        'Art Collection Raffle',
        'Music Rights Giveaway'
      ];

      for (let i = 0; i < 8; i++) {
        const endTime = new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000);
        const startTime = new Date(Date.now() - Math.random() * 1 * 24 * 60 * 60 * 1000);
        const maxTickets = Math.floor(Math.random() * 100) + 50;
        const ticketsSold = Math.floor(Math.random() * maxTickets);
        
        mockLotteries.push({
          id: `lottery-${i}`,
          tokenId: `${i + 100}`,
          name: lotteryNames[i],
          description: `Win exclusive access to ${lotteryNames[i].toLowerCase()}. Multiple winners possible with various prize tiers.`,
          category: ['Mixed', 'Art', 'Tech', 'Education', 'Entertainment'][Math.floor(Math.random() * 5)],
          ticketPrice: (Math.random() * 0.05 + 0.001).toFixed(3),
          totalPool: (ticketsSold * (Math.random() * 0.05 + 0.001)).toFixed(3),
          ticketsSold,
          maxTickets,
          endTime,
          startTime,
          creator: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
          image: `https://picsum.photos/400/250?random=${i + 200}`,
          verified: Math.random() > 0.4,
          featured: Math.random() > 0.8,
          status: endTime > new Date() ? 'active' : 'ended',
          currency: 'CAMP',
          winners: endTime <= new Date() ? [`0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`] : undefined,
        });
      }
      return mockLotteries;
    };

    // Generate mock data (in real app, this would come from contracts)
    setAuctions(generateMockAuctions());
    setLotteries(generateMockLotteries());
  }, []);

  // Filter and sort items
  useEffect(() => {
    let items: any[] = activeTab === 'auctions' ? auctions : lotteries;

    if (searchTerm) {
      items = items.filter((item: any) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Live Auctions' && activeTab === 'auctions') {
        items = items.filter((item: any) => item.status === 'live');
      } else if (selectedCategory === 'Ending Soon') {
        items = items.filter((item: any) => {
          const timeLeft = new Date(item.endTime).getTime() - Date.now();
          return timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000; // Less than 24 hours
        });
      } else if (selectedCategory === 'Featured') {
        items = items.filter((item: any) => item.featured);
      }
    }

    items = [...items].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'Ending Soon':
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        case 'Highest Bid':
          if (activeTab === 'auctions') {
            return parseFloat(b.currentBid) - parseFloat(a.currentBid);
          }
          return parseFloat(b.totalPool) - parseFloat(a.totalPool);
        case 'Most Bids':
          if (activeTab === 'auctions') {
            return b.totalBids - a.totalBids;
          }
          return b.ticketsSold - a.ticketsSold;
        default:
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      }
    });

    setFilteredItems(items);
  }, [auctions, lotteries, searchTerm, selectedCategory, sortBy, activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic would go here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatAddress = (address: string) => {
    if (!address || address.length < 6) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderAuctionCard = ({ item, index }: { item: AuctionItem; index: number }) => {
    const timeLeft = formatTimeRemaining(item.endTime);
    const isEndingSoon = new Date(item.endTime).getTime() - Date.now() < 24 * 60 * 60 * 1000;

    return (
      <Animated.View
        style={[
          styles.auctionCard,
          {
            transform: [
              {
                translateY: withDelay(
                  index * 100,
                  withSpring(0, { damping: 15 })
                )
              }
            ]
          }
        ]}
      >
        <BlurView intensity={60} style={styles.cardBlur}>
          <View style={styles.auctionCardContent}>
            <View style={styles.cardImageContainer}>
              {item.animation_url ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.image }} style={styles.cardImage} />
                  <View style={styles.videoOverlay}>
                    <Text style={styles.videoLabel}>Video</Text>
                  </View>
                </View>
              ) : item.audio_url ? (
                <View style={styles.imageContainer}>
                  <View style={[styles.cardImage, styles.audioContainer]}>
                    <Text style={styles.audioLabel}>Audio</Text>
                  </View>
                </View>
              ) : (
                <Image source={{ uri: item.image }} style={styles.cardImage} />
              )}

              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageOverlay}
              />

              {item.featured && (
                <View style={styles.featuredBadge}>
                  <Trophy size={16} color="white" />
                </View>
              )}

              <View style={styles.cardTopMeta}>
                {item.verified && (
                  <View style={styles.verifiedBadge}>
                    <Shield size={14} color="white" />
                  </View>
                )}
                <View style={[styles.statusBadge, item.status === 'live' ? styles.liveBadge : styles.endedBadge]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.timeContainer}>
                <View style={[styles.timeRemaining, isEndingSoon && styles.timeEndingSoon]}>
                  <Timer size={14} color="white" />
                  <Text style={styles.timeText}>{timeLeft}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardCreator}>by {formatAddress(item.creator)}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.auctionStats}>
                <View style={styles.bidSection}>
                  <Text style={styles.bidLabel}>Current Bid</Text>
                  <Text style={styles.currentBid}>{item.currentBid} {item.currency}</Text>
                </View>
                
                <View style={styles.statsSection}>
                  <View style={styles.statItem}>
                    <Gavel size={14} color={Colors['cool-1']} />
                    <Text style={styles.statText}>{item.totalBids} bids</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Users size={14} color={Colors['cool-1']} />
                    <Text style={styles.statText}>High: {formatAddress(item.highestBidder)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                <View style={styles.minBidInfo}>
                  <Text style={styles.minBidLabel}>Min. next bid: {(parseFloat(item.currentBid) + parseFloat(item.minIncrement)).toFixed(3)} {item.currency}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.bidButton}
                  onPress={() => router.push(`/auction/${item.tokenId}` as any)}
                  disabled={item.status !== 'live'}
                >
                  <LinearGradient
                    colors={item.status === 'live' ? Colors.gradients.primary as any : ['#ccc', '#999']}
                    style={styles.bidButtonGradient}
                  >
                    <Gavel size={16} color="white" />
                    <Text style={styles.bidButtonText}>
                      {item.status === 'live' ? 'Place Bid' : 'View Auction'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  const renderLotteryCard = ({ item, index }: { item: LotteryItem; index: number }) => {
    const timeLeft = formatTimeRemaining(item.endTime);
    const progressPercentage = (item.ticketsSold / item.maxTickets) * 100;

    return (
      <Animated.View
        style={[
          styles.lotteryCard,
          {
            transform: [
              {
                translateY: withDelay(
                  index * 100,
                  withSpring(0, { damping: 15 })
                )
              }
            ]
          }
        ]}
      >
        <BlurView intensity={60} style={styles.cardBlur}>
          <View style={styles.lotteryCardContent}>
            <View style={styles.cardImageContainer}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageOverlay}
              />

              {item.featured && (
                <View style={styles.featuredBadge}>
                  <Gift size={16} color="white" />
                </View>
              )}

              <View style={styles.cardTopMeta}>
                {item.verified && (
                  <View style={styles.verifiedBadge}>
                    <Shield size={14} color="white" />
                  </View>
                )}
                <View style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.endedBadge]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.timeContainer}>
                <View style={styles.timeRemaining}>
                  <Timer size={14} color="white" />
                  <Text style={styles.timeText}>{timeLeft}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardCreator}>by {formatAddress(item.creator)}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.lotteryStats}>
                <View style={styles.prizeSection}>
                  <Text style={styles.prizeLabel}>Total Prize Pool</Text>
                  <Text style={styles.prizeAmount}>{item.totalPool} {item.currency}</Text>
                </View>
                
                <View style={styles.ticketSection}>
                  <Text style={styles.ticketLabel}>Ticket Price</Text>
                  <Text style={styles.ticketPrice}>{item.ticketPrice} {item.currency}</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    {item.ticketsSold}/{item.maxTickets} tickets sold
                  </Text>
                  <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${progressPercentage}%` }
                    ]}
                  />
                </View>
              </View>

              {item.winners && (
                <View style={styles.winnersSection}>
                  <Text style={styles.winnersLabel}>🎉 Winners:</Text>
                  {item.winners.map((winner, idx) => (
                    <Text key={idx} style={styles.winnerAddress}>{formatAddress(winner)}</Text>
                  ))}
                </View>
              )}

              <View style={styles.cardActions}>
                <View style={styles.ticketsInfo}>
                  <Ticket size={16} color={Colors['cool-1']} />
                  <Text style={styles.ticketsText}>{item.maxTickets - item.ticketsSold} tickets left</Text>
                </View>
                <TouchableOpacity 
                  style={styles.ticketButton}
                  onPress={() => router.push(`/lottery/${item.tokenId}` as any)}
                  disabled={item.status !== 'active'}
                >
                  <LinearGradient
                    colors={item.status === 'active' ? Colors.gradients.primary as any : ['#ccc', '#999']}
                    style={styles.ticketButtonGradient}
                  >
                    <Ticket size={16} color="white" />
                    <Text style={styles.ticketButtonText}>
                      {item.status === 'active' ? 'Buy Ticket' : 'View Results'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[
            'rgba(249, 246, 242, 0.3)',
            'rgba(255, 255, 255, 1)',
            'rgba(162, 213, 209, 0.2)'
          ]}
          style={styles.backgroundGradient}
        />
        
        <Header />
        
        <View style={styles.authContainer}>
          <View style={styles.authIcon}>
            <LinearGradient
              colors={Colors.gradients.primary as any}
              style={styles.authIconGradient}
            >
              <Shield size={40} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.authTitle}>Connect Your Wallet</Text>
          <Text style={styles.authSubtitle}>
            Connect your wallet to participate in live auctions and IP lotteries. Bid on exclusive intellectual property and win amazing prizes.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[
          'rgba(249, 246, 242, 0.3)',
          'rgba(255, 255, 255, 1)',
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

        {/* Page Header */}
        <Animated.View style={[styles.pageHeader, fadeInStyle]}>
          <Text style={styles.pageTitle}>
            Live <Text style={styles.gradientTitle}>Auctions</Text> & Lottery
          </Text>
          <Text style={styles.pageSubtitle}>
            Bid on exclusive IP assets or try your luck in our lottery system. Win amazing intellectual property rights and licenses.
          </Text>
        </Animated.View>

        {/* Tab Selector */}
        <Animated.View style={[styles.tabContainer, fadeInStyle]}>
          <BlurView intensity={60} style={styles.tabBlur}>
            <View style={styles.tabContent}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'auctions' && styles.activeTab
                ]}
                onPress={() => setActiveTab('auctions')}
              >
                <Gavel size={20} color={activeTab === 'auctions' ? 'white' : Colors['cool-1']} />
                <Text style={[
                  styles.tabText,
                  activeTab === 'auctions' && styles.activeTabText
                ]}>
                  Live Auctions ({auctions.filter(a => a.status === 'live').length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'lottery' && styles.activeTab
                ]}
                onPress={() => setActiveTab('lottery')}
              >
                <Gift size={20} color={activeTab === 'lottery' ? 'white' : Colors['cool-1']} />
                <Text style={[
                  styles.tabText,
                  activeTab === 'lottery' && styles.activeTabText
                ]}>
                  IP Lottery ({lotteries.filter(l => l.status === 'active').length})
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>

        {/* Search and Filters */}
        <Animated.View style={[styles.filtersContainer, fadeInStyle]}>
          <BlurView intensity={60} style={styles.filtersBlur}>
            <View style={styles.filtersContent}>
              {/* Search */}
              <View style={styles.searchContainer}>
                <Search size={20} color={Colors['cool-1']} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${activeTab}...`}
                  placeholderTextColor={Colors['cool-1']}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>

              {/* Filters Row */}
              <View style={styles.filtersRow}>
                <View style={styles.filterGroup}>
                  <Filter size={16} color={Colors['cool-1']} />
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryButton,
                          selectedCategory === category && styles.categoryButtonActive
                        ]}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <Text style={[
                          styles.categoryButtonText,
                          selectedCategory === category && styles.categoryButtonTextActive
                        ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              Showing <Text style={styles.resultsCount}>{filteredItems.length}</Text> {activeTab}
            </Text>
          </View>

          {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                {activeTab === 'auctions' ? (
                  <Gavel size={40} color={Colors['cool-2']} />
                ) : (
                  <Gift size={40} color={Colors['cool-2']} />
                )}
              </View>
              <Text style={styles.emptyTitle}>No {activeTab} Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or check back later for new {activeTab}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={({ item, index }) => activeTab === 'auctions' ? renderAuctionCard({ item, index }) : renderLotteryCard({ item, index })}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
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

  // Auth
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  authIcon: {
    marginBottom: 24,
  },
  authIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors['camp-dark'],
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  authSubtitle: {
    fontSize: 16,
    color: Colors['cool-1'],
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },

  // Page Header
  pageHeader: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors['camp-dark'],
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  gradientTitle: {
    color: Colors['camp-orange'],
  },
  pageSubtitle: {
    fontSize: 18,
    color: Colors['cool-1'],
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: width * 0.9,
    fontFamily: 'Inter_400Regular',
  },

  // Tabs
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tabBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  tabContent: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors['camp-orange'],
    shadowColor: Colors['camp-orange'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors['cool-1'],
    fontFamily: 'Inter_600SemiBold',
  },
  activeTabText: {
    color: 'white',
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  filtersBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  filtersContent: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors['camp-dark'],
    fontFamily: 'Inter_400Regular',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryScroll: {
    marginLeft: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: Colors['camp-orange'],
    borderColor: Colors['camp-orange'],
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors['cool-1'],
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },

  // Results
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultsHeader: {
    marginBottom: 24,
  },
  resultsText: {
    fontSize: 16,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },
  resultsCount: {
    fontWeight: '600',
    color: Colors['camp-dark'],
    fontFamily: 'Inter_600SemiBold',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: Colors['cool-3'] + '20',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors['camp-dark'],
    marginBottom: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors['cool-1'],
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },

  // List
  listContainer: {
    paddingBottom: 20,
  },

  // Cards
  auctionCard: {
    marginBottom: 20,
  },
  lotteryCard: {
    marginBottom: 20,
  },
  cardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  auctionCardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  lotteryCardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },

  // Card Image
  cardImageContainer: {
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors['camp-light'] + '30',
  },
  audioContainer: {
    backgroundColor: Colors['camp-light'] + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioLabel: {
    color: Colors['camp-orange'],
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  videoOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 109, 1, 0.8)',
    borderRadius: 8,
  },
  videoLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    backgroundColor: Colors['camp-orange'],
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTopMeta: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  verifiedBadge: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
  },
  activeBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
  },
  endedBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.8)',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  timeContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  timeRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  timeEndingSoon: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },

  // Card Content
  cardBody: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors['camp-dark'],
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  cardCreator: {
    fontSize: 14,
    color: Colors['cool-1'],
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
  },
  cardDescription: {
    fontSize: 16,
    color: Colors['cool-1'],
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Inter_400Regular',
  },

  // Auction Stats
  auctionStats: {
    marginBottom: 24,
  },
  bidSection: {
    marginBottom: 16,
  },
  bidLabel: {
    fontSize: 14,
    color: Colors['cool-1'],
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
  currentBid: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors['camp-orange'],
    fontFamily: 'Inter_700Bold',
  },
  statsSection: {
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },

  // Lottery Stats
  lotteryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  prizeSection: {
    flex: 1,
  },
  prizeLabel: {
    fontSize: 14,
    color: Colors['cool-1'],
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
  prizeAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors['camp-orange'],
    fontFamily: 'Inter_700Bold',
  },
  ticketSection: {
    alignItems: 'flex-end',
  },
  ticketLabel: {
    fontSize: 14,
    color: Colors['cool-1'],
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors['camp-dark'],
    fontFamily: 'Inter_600SemiBold',
  },

  // Progress
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors['camp-orange'],
    fontFamily: 'Inter_600SemiBold',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors['cool-3'] + '30',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors['camp-orange'],
  },

  // Winners
  winnersSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors['camp-light'] + '20',
    borderRadius: 12,
  },
  winnersLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors['camp-dark'],
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  winnerAddress: {
    fontSize: 14,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },

  // Card Actions
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minBidInfo: {
    flex: 1,
    marginRight: 16,
  },
  minBidLabel: {
    fontSize: 12,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },
  ticketsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 16,
  },
  ticketsText: {
    fontSize: 14,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },

  // Buttons
  bidButton: {
    borderRadius: 12,
  },
  bidButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  bidButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  ticketButton: {
    borderRadius: 12,
  },
  ticketButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  ticketButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
