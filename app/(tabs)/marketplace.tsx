import { StyleSheet, ScrollView, View, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useCampNetwork } from '@/hooks/useCampNetwork';

interface IPNFTItem {
  id: string;
  title: string;
  description: string;
  creator: string;
  price: string;
  image: string;
  category: string;
  tags: string[];
  isAuction: boolean;
  isLottery: boolean;
  endTime?: Date;
  currentBid?: string;
  ticketPrice?: string;
}

export default function MarketplaceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { address, isConnected } = useAccount();
  const campNetwork = useCampNetwork();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [ipItems, setIpItems] = useState<IPNFTItem[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Art', 'Music', 'Video', 'Document', 'Software', 'Design', 'Photography'];

  // Mock data for demonstration
  const mockItems: IPNFTItem[] = [
    {
      id: '1',
      title: 'Digital Art Collection #001',
      description: 'Beautiful abstract digital art piece',
      creator: '0x1234...5678',
      price: '0.1',
      image: 'https://via.placeholder.com/300x300',
      category: 'Art',
      tags: ['digital', 'abstract'],
      isAuction: false,
      isLottery: false,
    },
    {
      id: '2',
      title: 'Music Track - Electronic Beat',
      description: 'Original electronic music composition',
      creator: '0x9876...4321',
      price: '0.05',
      image: 'https://via.placeholder.com/300x300',
      category: 'Music',
      tags: ['music', 'electronic'],
      isAuction: true,
      isLottery: false,
      currentBid: '0.08',
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Photography Collection',
      description: 'Stunning landscape photography',
      creator: '0x5555...7777',
      price: '0.2',
      image: 'https://via.placeholder.com/300x300',
      category: 'Photography',
      tags: ['photography', 'landscape'],
      isAuction: false,
      isLottery: true,
      ticketPrice: '0.01',
    },
  ];

  useEffect(() => {
    // Simulate loading IP items
    setTimeout(() => {
      setIpItems(mockItems);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredItems = ipItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    // Only show regular marketplace items (not auctions or lottery)
    return matchesSearch && matchesCategory && !item.isAuction && !item.isLottery;
  });

  const handleBuyAccess = async (item: IPNFTItem) => {
    if (!campNetwork || !address) return;
    
    try {
      // Implementation for buying access to IP
      const tokenId = BigInt(item.id);
      const priceWei = parseFloat(item.price) * 1e18; // Convert to Wei
      
      // Assuming the campNetwork has a method that takes address, tokenId, and price
      await campNetwork.buyAccess(address, tokenId.toString(), priceWei.toString());
      // Show success message
      alert(`Successfully purchased access to "${item.title}"!`);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  const renderIPItem = ({ item }: { item: IPNFTItem }) => (
    <View style={[styles.ipCard, { backgroundColor: colors.card }]}>
      <Image source={{ uri: item.image }} style={styles.ipImage} />
      
      <View style={styles.ipContent}>
        <View style={styles.ipHeader}>
          <ThemedText style={styles.ipTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View style={[styles.categoryBadge, { backgroundColor: Colors.brand.cool3 }]}>
            <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.ipDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
        
        <ThemedText style={styles.ipCreator}>
          by {item.creator.substring(0, 8)}...{item.creator.substring(item.creator.length - 6)}
        </ThemedText>
        
        <View style={styles.ipFooter}>
          {item.isAuction ? (
            <View>
              <ThemedText style={styles.priceLabel}>Current Bid</ThemedText>
              <ThemedText style={styles.priceValue}>{item.currentBid} ETH</ThemedText>
            </View>
          ) : item.isLottery ? (
            <View>
              <ThemedText style={styles.priceLabel}>Ticket Price</ThemedText>
              <ThemedText style={styles.priceValue}>{item.ticketPrice} ETH</ThemedText>
            </View>
          ) : (
            <View>
              <ThemedText style={styles.priceLabel}>Price</ThemedText>
              <ThemedText style={styles.priceValue}>{item.price} ETH</ThemedText>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.brand.campOrange }]}
            onPress={() => handleBuyAccess(item)}
          >
            <ThemedText style={styles.actionButtonText}>
              {item.isAuction ? 'Bid' : item.isLottery ? 'Buy Ticket' : 'Buy Access'}
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        {item.endTime && (
          <View style={styles.timeRemaining}>
            <Ionicons name="time" size={14} color={Colors.brand.warm2} />
            <ThemedText style={styles.timeText}>
              Ends in {Math.ceil((item.endTime.getTime() - Date.now()) / (1000 * 60 * 60))}h
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );

  if (!isConnected) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
        <View style={styles.centeredContent}>
          <Ionicons name="lock-closed" size={48} color="#64748B" style={styles.lockIcon} />
          <ThemedText type="title" style={[styles.lockTitle, { color: '#1E293B' }]}>
            Connect Your Wallet
          </ThemedText>
          <ThemedText style={[styles.lockDescription, { color: '#64748B' }]}>
            Connect your wallet to browse and purchase IP from the marketplace
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          IP Marketplace
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Discover and trade intellectual property
        </ThemedText>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search marketplace..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && { backgroundColor: Colors.brand.campOrange }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <ThemedText
              style={[
                styles.categoryChipText,
                { color: selectedCategory === category ? '#FFFFFF' : colors.text }
              ]}
            >
              {category}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* IP Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderIPItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        numColumns={1}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color={colors.icon} />
            <ThemedText style={styles.emptyText}>
              {loading ? 'Loading...' : 'No marketplace items found'}
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  lockIcon: {
    marginBottom: 16,
  },
  lockTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  lockDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    color: Colors.brand.campOrange,
    marginBottom: 8,
  },
  headerSubtitle: {
    opacity: 0.7,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginHorizontal: 4,
  },
  tabText: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.brand.gray,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  ipCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  ipImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.brand.gray,
  },
  ipContent: {
    padding: 16,
  },
  ipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ipTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.brand.cool1,
  },
  ipDescription: {
    marginBottom: 8,
    opacity: 0.7,
    lineHeight: 20,
  },
  ipCreator: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 16,
  },
  ipFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.brand.campOrange,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  timeRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.brand.gray,
  },
  timeText: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.brand.warm2,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    opacity: 0.6,
    fontSize: 16,
  },
});
