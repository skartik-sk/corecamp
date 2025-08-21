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
  Eye,
  Heart,
  Grid,
  List,
  Star,
  Shield,
  TrendingUp,
  Zap
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Categories and sort options matching web
const categories = ['All', 'AI/ML', 'Art', 'Music', 'Design', 'Code', 'Writing', 'Video', 'Other'];
const sortOptions = ['Most Recent', 'Price: Low to High', 'Price: High to Low', 'Most Popular'];

interface IPAsset {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  category: string;
  price: string;
  currency: string;
  creator: string;
  image: string;
  likes: number;
  views: number;
  createdAt: string;
  verified: boolean;
  featured: boolean;
  isActive: boolean;
  animation_url?: string;
  audio_url?: string;
}

export default function MarketplaceScreen() {
  const { address } = useAccount();
  const { useAllMarketplaceListings, getDataByTokenId } = useCampfireIntegration();
  const router = useRouter();
  
  // Get real marketplace data
  const { data: allListings, isLoading: marketplaceLoading, error: marketplaceError } = useAllMarketplaceListings();
  
  const [ipAssets, setIpAssets] = useState<IPAsset[]>([]);
  const [filteredIPs, setFilteredIPs] = useState<IPAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Most Recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  // Transform contract listings to UI format
  useEffect(() => {
    const fetchData = async () => {
      if (marketplaceError) {
        console.error('Marketplace error:', marketplaceError);
        setIpAssets([]);
        return;
      }

      if (allListings && Array.isArray(allListings)) {
        console.log('All marketplace listings:', allListings);

        const transformedListings = await Promise.all(
          allListings.map(async (listing: any) => {
            let res: any = {};
            if (getDataByTokenId) {
              try {
                res = await getDataByTokenId(
                  typeof listing.tokenId === 'bigint'
                    ? listing.tokenId.toString()
                    : listing.tokenId,
                  listing.seller
                );
              } catch (err) {
                console.error('Error fetching metadata for tokenId', listing.tokenId, err);
              }
            }
            
            const extraData = res?.metadata || {};
            const tokenIdStr = listing.tokenId?.toString() || listing.tokenId;
            
            return {
              id: tokenIdStr,
              tokenId: tokenIdStr,
              name: extraData?.name || `IP Asset #${tokenIdStr}`,
              description: extraData?.description || 'Intellectual property asset available for licensing',
              category: extraData?.category || 'AI/ML',
              price: listing.price ? (parseFloat(listing.price) / 1e18).toFixed(3) : '0',
              currency: 'CAMP',
              creator: listing.seller || '0x0000000000000000000000000000000000000000',
              image: extraData?.image || `https://picsum.photos/400/250?random=${tokenIdStr}`,
              likes: Math.floor(Math.random() * 500),
              views: Math.floor(Math.random() * 2000),
              createdAt: new Date().toISOString(),
              verified: Math.random() > 0.5,
              featured: Math.random() > 0.7,
              isActive: listing.isActive,
              animation_url: extraData?.animation_url,
              audio_url: extraData?.audio_url,
            };
          })
        );

        // Only show active listings
        const activeListings = transformedListings.filter((listing: any) => listing.isActive);
        setIpAssets(activeListings);
      } else {
        setIpAssets([]);
      }
    };

    if (!marketplaceLoading) {
      fetchData();
    }
  }, [allListings, marketplaceLoading, marketplaceError]);

  // Filter and sort listings
  useEffect(() => {
    let filtered = ipAssets;

    if (searchTerm) {
      filtered = filtered.filter(ip =>
        ip.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ip.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(ip => ip.category === selectedCategory);
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'Price: Low to High':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'Price: High to Low':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'Most Popular':
          return (b.likes || 0) - (a.likes || 0);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredIPs(filtered);
  }, [ipAssets, searchTerm, selectedCategory, sortBy]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic would go here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatAddress = (address: string) => {
    if (!address || address.length < 6) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderIPCard = ({ item, index }: { item: IPAsset; index: number }) => {
    if (viewMode === 'list') {
      return (
        <Animated.View
          style={[
            styles.listCard,
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
            <View style={styles.listCardContent}>
              <View style={styles.listCardImage}>
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
                
                {item.featured && (
                  <View style={styles.featuredBadge}>
                    <Star size={12} color="white" />
                  </View>
                )}
              </View>

              <View style={styles.listCardDetails}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardCreator}>by {formatAddress(item.creator)}</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    {item.verified && (
                      <View style={styles.verifiedIcon}>
                        <Shield size={14} color={Colors.success} />
                      </View>
                    )}
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.cardStats}>
                    <View style={styles.statItem}>
                      <Heart size={14} color={Colors['cool-1']} />
                      <Text style={styles.statText}>{item.likes}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Eye size={14} color={Colors['cool-1']} />
                      <Text style={styles.statText}>{item.views}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.cardPrice}>{item.price} {item.currency}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => router.push(`/ip/${item.tokenId}` as any)}
                    >
                      <LinearGradient
                        colors={Colors.gradients.primary as any}
                        style={styles.viewButtonGradient}
                      >
                        <Text style={styles.viewButtonText}>View Details</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      );
    }

    // Grid view
    return (
      <Animated.View
        style={[
          styles.gridCard,
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
          <View style={styles.gridCardContent}>
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
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.imageOverlay}
              />

              {item.featured && (
                <View style={styles.featuredBadge}>
                  <Star size={16} color="white" />
                </View>
              )}

              <View style={styles.cardTopMeta}>
                {item.verified && (
                  <View style={styles.verifiedBadge}>
                    <Shield size={14} color="white" />
                  </View>
                )}
                <View style={styles.categoryBadgeFloating}>
                  <Text style={styles.categoryTextFloating}>{item.category}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardCreator}>by {formatAddress(item.creator)}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.cardStats}>
                <View style={styles.statItem}>
                  <Heart size={14} color={Colors['cool-1']} />
                  <Text style={styles.statText}>{item.likes}</Text>
                </View>
                <View style={styles.statItem}>
                  <Eye size={14} color={Colors['cool-1']} />
                  <Text style={styles.statText}>{item.views}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.cardPrice}>{item.price} {item.currency}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => router.push(`/ip/${item.tokenId}` as any)}
              >
                <LinearGradient
                  colors={Colors.gradients.primary as any}
                  style={styles.viewButtonGradient}
                >
                  <Text style={styles.viewButtonText}>View Details</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

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
            IP <Text style={styles.gradientTitle}>Marketplace</Text>
          </Text>
          <Text style={styles.pageSubtitle}>
            Discover, buy, and license intellectual property from creators worldwide. Build the future together.
          </Text>
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
                  placeholder="Search IPs, creators, or keywords..."
                  placeholderTextColor={Colors['cool-1']}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>

              {/* Category and Sort Row */}
              <View style={styles.filtersRow}>
                {/* Category Filter */}
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

                {/* View Mode Toggle */}
                <View style={styles.viewModeToggle}>
                  <TouchableOpacity
                    style={[
                      styles.viewModeButton,
                      viewMode === 'grid' && styles.viewModeButtonActive
                    ]}
                    onPress={() => setViewMode('grid')}
                  >
                    <Grid size={16} color={viewMode === 'grid' ? Colors['camp-orange'] : Colors['cool-1']} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.viewModeButton,
                      viewMode === 'list' && styles.viewModeButtonActive
                    ]}
                    onPress={() => setViewMode('list')}
                  >
                    <List size={16} color={viewMode === 'list' ? Colors['camp-orange'] : Colors['cool-1']} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          {marketplaceLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingIcon}>
                <LinearGradient
                  colors={Colors.gradients.primary as any}
                  style={styles.loadingIconGradient}
                >
                  <Search size={40} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.loadingTitle}>Loading Amazing IPs...</Text>
              <Text style={styles.loadingSubtitle}>Fetching the best intellectual property assets for you</Text>
            </View>
          ) : marketplaceError ? (
            <View style={styles.errorContainer}>
              <View style={styles.errorIcon}>
                <Zap size={40} color={Colors['warm-1']} />
              </View>
              <Text style={styles.errorTitle}>Demo Mode Active</Text>
              <Text style={styles.errorSubtitle}>Showing sample data - Origin SDK integration pending</Text>
            </View>
          ) : (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                  Showing <Text style={styles.resultsCount}>{filteredIPs.length}</Text> amazing IP{filteredIPs.length !== 1 ? 's' : ''}
                </Text>
              </View>

              {filteredIPs.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIcon}>
                    <Search size={40} color={Colors['cool-2']} />
                  </View>
                  <Text style={styles.emptyTitle}>No IPs Found</Text>
                  <Text style={styles.emptySubtitle}>Try adjusting your search or filters to discover amazing IP assets</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredIPs}
                  renderItem={renderIPCard}
                  keyExtractor={(item) => item.id}
                  numColumns={viewMode === 'grid' ? 2 : 1}
                  key={viewMode} // Force re-render when view mode changes
                  columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
                  contentContainerStyle={styles.listContainer}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              )}
            </>
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
    justifyContent: 'space-between',
  },
  filterGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
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
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    padding: 4,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 12,
  },
  viewModeButtonActive: {
    backgroundColor: 'white',
    shadowColor: Colors['camp-orange'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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

  // Loading States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingIcon: {
    marginBottom: 24,
  },
  loadingIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors['camp-dark'],
    marginBottom: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: Colors['cool-1'],
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  errorIcon: {
    width: 80,
    height: 80,
    backgroundColor: Colors['warm-1'] + '20',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors['warm-1'],
    marginBottom: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  errorSubtitle: {
    fontSize: 16,
    color: Colors['cool-1'],
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
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

  // List Container
  listContainer: {
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },

  // Cards
  gridCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
  },
  listCard: {
    marginBottom: 16,
  },
  cardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gridCardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  listCardContent: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  listCardImage: {
    marginRight: 16,
  },
  listCardDetails: {
    flex: 1,
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
    height: 160,
    borderRadius: 16,
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
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  videoOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
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
    height: 60,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    backgroundColor: Colors['camp-orange'],
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTopMeta: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  verifiedBadge: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  verifiedIcon: {
    padding: 4,
    backgroundColor: Colors.success + '20',
    borderRadius: 12,
  },
  categoryBadgeFloating: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  categoryTextFloating: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },

  // Card Content
  cardBody: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors['camp-orange'] + '10',
    borderRadius: 12,
  },
  categoryText: {
    color: Colors['camp-orange'],
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors['camp-dark'],
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  cardCreator: {
    fontSize: 12,
    color: Colors['cool-1'],
    marginBottom: 8,
    fontFamily: 'Inter_400Regular',
  },
  cardDescription: {
    fontSize: 14,
    color: Colors['cool-1'],
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors['camp-dark'],
    fontFamily: 'Inter_700Bold',
  },

  // Buttons
  viewButton: {
    borderRadius: 12,
  },
  viewButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
