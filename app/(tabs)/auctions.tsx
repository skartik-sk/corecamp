import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAccount } from 'wagmi';
import { useCampNetwork } from '@/hooks/useCampNetwork';
import { Ionicons } from '@expo/vector-icons';

interface AuctionItem {
  id: string;
  name: string;
  description: string;
  currentBid: string;
  startingBid: string;
  minIncrement: string;
  endTime: Date;
  creator: string;
  category: string;
  image: string;
  totalBids: number;
  highestBidder: string;
}

interface LotteryItem {
  id: string;
  name: string;
  description: string;
  ticketPrice: string;
  totalPool: string;
  ticketsSold: number;
  maxTickets: number;
  endTime: Date;
  creator: string;
  category: string;
  image: string;
}

export default function AuctionsScreen() {
  const colorScheme = useColorScheme();
  const { address, isConnected } = useAccount();
  const campNetwork = useCampNetwork();
  const [activeTab, setActiveTab] = useState<'auctions' | 'lottery'>('auctions');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock auction data
  const auctionItems: AuctionItem[] = [
    {
      id: '1',
      name: 'Rare Digital Artwork',
      description: 'One-of-a-kind digital masterpiece with exclusive commercial rights',
      currentBid: '2.5',
      startingBid: '1.0',
      minIncrement: '0.1',
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      creator: '0x1234...5678',
      category: 'Art',
      image: '🎨',
      totalBids: 12,
      highestBidder: '0x9876...4321',
    },
    {
      id: '2',
      name: 'Premium Music License',
      description: 'Exclusive licensing rights to award-winning electronic track',
      currentBid: '1.8',
      startingBid: '0.5',
      minIncrement: '0.05',
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
      creator: '0xabcd...efgh',
      category: 'Music',
      image: '🎵',
      totalBids: 8,
      highestBidder: '0x5555...7777',
    },
  ];

  // Mock lottery data
  const lotteryItems: LotteryItem[] = [
    {
      id: '1',
      name: 'Photo Collection Mystery Box',
      description: 'Win exclusive access to premium photography collection',
      ticketPrice: '0.01',
      totalPool: '0.5',
      ticketsSold: 45,
      maxTickets: 100,
      endTime: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
      creator: '0x2222...8888',
      category: 'Photography',
      image: '📸',
    },
    {
      id: '2',
      name: 'Software Package Lottery',
      description: 'Chance to win complete software development toolkit',
      ticketPrice: '0.005',
      totalPool: '0.15',
      ticketsSold: 28,
      maxTickets: 50,
      endTime: new Date(Date.now() + 36 * 60 * 60 * 1000), // 36 hours from now
      creator: '0x3333...9999',
      category: 'Software',
      image: '💻',
    },
  ];

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const renderAuctionItem = (item: AuctionItem) => (
    <View key={item.id} style={[styles.itemCard, { backgroundColor: Colors.brand.light }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.itemImage}>
          <ThemedText style={styles.itemEmoji}>{item.image}</ThemedText>
        </View>
        <View style={[styles.categoryTag, { backgroundColor: Colors.brand.cool3 }]}>
          <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
        <ThemedText style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>

        {/* Auction Details */}
        <View style={styles.auctionDetails}>
          <View style={styles.bidInfo}>
            <ThemedText style={styles.bidLabel}>Current Bid</ThemedText>
            <ThemedText style={styles.bidValue}>{item.currentBid} ETH</ThemedText>
          </View>
          <View style={styles.bidInfo}>
            <ThemedText style={styles.bidLabel}>Min. Increment</ThemedText>
            <ThemedText style={styles.bidIncrement}>+{item.minIncrement} ETH</ThemedText>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color={Colors.brand.gray} />
            <ThemedText style={styles.statText}>{item.totalBids} bids</ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color={Colors.brand.warm2} />
            <ThemedText style={[styles.statText, { color: Colors.brand.warm2 }]}>
              {formatTimeRemaining(item.endTime)}
            </ThemedText>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View>
            <ThemedText style={styles.creatorLabel}>Creator</ThemedText>
            <ThemedText style={styles.creatorAddress}>{item.creator}</ThemedText>
          </View>
          <TouchableOpacity 
            style={[styles.bidButton, { backgroundColor: Colors.brand.campOrange }]}
          >
            <ThemedText style={styles.bidButtonText}>Place Bid</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderLotteryItem = (item: LotteryItem) => (
    <View key={item.id} style={[styles.itemCard, { backgroundColor: Colors.brand.light }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.itemImage}>
          <ThemedText style={styles.itemEmoji}>{item.image}</ThemedText>
        </View>
        <View style={[styles.categoryTag, { backgroundColor: Colors.brand.warm3 }]}>
          <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
        <ThemedText style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>

        {/* Lottery Details */}
        <View style={styles.lotteryDetails}>
          <View style={styles.lotteryInfo}>
            <ThemedText style={styles.lotteryLabel}>Ticket Price</ThemedText>
            <ThemedText style={styles.ticketPrice}>{item.ticketPrice} ETH</ThemedText>
          </View>
          <View style={styles.lotteryInfo}>
            <ThemedText style={styles.lotteryLabel}>Total Pool</ThemedText>
            <ThemedText style={styles.poolValue}>{item.totalPool} ETH</ThemedText>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressLabel}>
              {item.ticketsSold}/{item.maxTickets} tickets sold
            </ThemedText>
            <ThemedText style={styles.progressPercentage}>
              {Math.round((item.ticketsSold / item.maxTickets) * 100)}%
            </ThemedText>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(item.ticketsSold / item.maxTickets) * 100}%`,
                  backgroundColor: Colors.brand.campOrange 
                }
              ]} 
            />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color={Colors.brand.warm2} />
            <ThemedText style={[styles.statText, { color: Colors.brand.warm2 }]}>
              {formatTimeRemaining(item.endTime)}
            </ThemedText>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View>
            <ThemedText style={styles.creatorLabel}>Creator</ThemedText>
            <ThemedText style={styles.creatorAddress}>{item.creator}</ThemedText>
          </View>
          <TouchableOpacity 
            style={[styles.ticketButton, { backgroundColor: Colors.brand.warm2 }]}
          >
            <ThemedText style={styles.ticketButtonText}>Buy Ticket</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!isConnected) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.authRequired}>
          <Ionicons name="lock-closed" size={64} color={Colors.brand.gray} />
          <ThemedText style={styles.authTitle}>Connect Your Wallet</ThemedText>
          <ThemedText style={styles.authSubtitle}>
            Connect your wallet to participate in auctions and lottery
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Auctions & Lottery</ThemedText>
        <ThemedText style={styles.subtitle}>
          Bid on exclusive IP or try your luck in our lottery system
        </ThemedText>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'auctions' && { backgroundColor: Colors.brand.campOrange },
          ]}
          onPress={() => setActiveTab('auctions')}
        >
          <Ionicons 
            name="hammer" 
            size={20} 
            color={activeTab === 'auctions' ? 'white' : Colors.brand.gray} 
          />
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'auctions' && { color: 'white' },
            ]}
          >
            Live Auctions ({auctionItems.length})
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'lottery' && { backgroundColor: Colors.brand.campOrange },
          ]}
          onPress={() => setActiveTab('lottery')}
        >
          <Ionicons 
            name="gift" 
            size={20} 
            color={activeTab === 'lottery' ? 'white' : Colors.brand.gray} 
          />
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'lottery' && { color: 'white' },
            ]}
          >
            IP Lottery ({lotteryItems.length})
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.brand.gray} />
        <TextInput
          style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder={`Search ${activeTab}...`}
          placeholderTextColor={Colors.brand.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'auctions' ? (
          <View>
            {auctionItems.map(renderAuctionItem)}
          </View>
        ) : (
          <View>
            {lotteryItems.map(renderLotteryItem)}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  authSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.brand.campOrange,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.brand.light,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 0,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.brand.cool3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 28,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    padding: 16,
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 16,
  },
  auctionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bidInfo: {
    flex: 1,
  },
  bidLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  bidValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.brand.campOrange,
  },
  bidIncrement: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brand.cool1,
  },
  lotteryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  lotteryInfo: {
    flex: 1,
  },
  lotteryLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.brand.warm2,
  },
  poolValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brand.campOrange,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brand.campOrange,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.brand.gray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    marginLeft: 4,
    opacity: 0.7,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  creatorAddress: {
    fontSize: 14,
    fontWeight: '500',
  },
  bidButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bidButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  ticketButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ticketButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
