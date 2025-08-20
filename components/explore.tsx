import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

interface Chat {
  id: string;
  ipName: string;
  owner: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  unread: boolean;
}

interface IPListing {
  id: string;
  name: string;
  price: string;
  owner: string;
  description: string;
  category: string;
}

export default function ChatTradeScreen() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<'chats' | 'negotiate'>('chats');
  
  // Mock data for chats
  const chats: Chat[] = [
    {
      id: '1',
      ipName: 'Digital Art Collection #1',
      owner: '0x1234...5678',
      lastMessage: 'How about 0.5 ETH?',
      timestamp: '2m ago',
      avatar: '🎨',
      unread: true,
    },
    {
      id: '2',
      ipName: 'Music Track "Sunset"',
      owner: '0x9876...4321',
      lastMessage: 'That works for me!',
      timestamp: '1h ago',
      avatar: '🎵',
      unread: false,
    },
    {
      id: '3',
      ipName: 'Patent Document Draft',
      owner: '0xabcd...efgh',
      lastMessage: 'Can we discuss licensing terms?',
      timestamp: '3h ago',
      avatar: '📄',
      unread: true,
    },
  ];

  // Mock data for IP listings to negotiate
  const ipListings: IPListing[] = [
    {
      id: '1',
      name: 'Abstract Digital Art',
      price: '1.2 ETH',
      owner: '0x1111...2222',
      description: 'Unique abstract digital artwork with commercial rights',
      category: 'Art',
    },
    {
      id: '2',
      name: 'AI Generated Music',
      price: '0.8 ETH',
      owner: '0x3333...4444',
      description: 'AI-composed instrumental track for commercial use',
      category: 'Music',
    },
    {
      id: '3',
      name: 'Software Documentation',
      price: '0.3 ETH',
      owner: '0x5555...6666',
      description: 'Comprehensive technical documentation template',
      category: 'Documents',
    },
  ];

  const renderChatItem = (chat: Chat) => (
    <TouchableOpacity
      key={chat.id}
      style={[styles.chatItem, { backgroundColor: Colors.brand.light }]}
      activeOpacity={0.7}
    >
      <View style={styles.chatAvatar}>
        <ThemedText style={styles.avatarEmoji}>{chat.avatar}</ThemedText>
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <ThemedText style={styles.chatTitle}>{chat.ipName}</ThemedText>
          <ThemedText style={styles.chatTime}>{chat.timestamp}</ThemedText>
        </View>
        
        <ThemedText style={styles.chatOwner}>Owner: {chat.owner}</ThemedText>
        <ThemedText style={styles.chatMessage}>{chat.lastMessage}</ThemedText>
      </View>
      
      {chat.unread && <View style={[styles.unreadDot, { backgroundColor: Colors.brand.campOrange }]} />}
    </TouchableOpacity>
  );

  const renderIPListing = (ip: IPListing) => (
    <View
      key={ip.id}
      style={[styles.ipCard, { backgroundColor: Colors.brand.light }]}
    >
      <View style={styles.ipHeader}>
        <ThemedText style={styles.ipName}>{ip.name}</ThemedText>
        <View style={[styles.categoryTag, { backgroundColor: Colors.brand.cool3 }]}>
          <ThemedText style={styles.categoryText}>{ip.category}</ThemedText>
        </View>
      </View>
      
      <ThemedText style={styles.ipDescription}>{ip.description}</ThemedText>
      <ThemedText style={styles.ipOwner}>Owner: {ip.owner}</ThemedText>
      
      <View style={styles.ipFooter}>
        <ThemedText style={styles.ipPrice}>{ip.price}</ThemedText>
        <TouchableOpacity
          style={[styles.negotiateButton, { backgroundColor: Colors.brand.campOrange }]}
        >
          <ThemedText style={styles.negotiateButtonText}>Start Chat</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Chat & Trade</ThemedText>
        <ThemedText style={styles.subtitle}>
          Negotiate prices with IP owners through secure 1:1 chat
        </ThemedText>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'chats' && { backgroundColor: Colors.brand.campOrange },
          ]}
          onPress={() => setActiveTab('chats')}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'chats' && { color: 'white' },
            ]}
          >
            My Chats ({chats.filter(c => c.unread).length})
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'negotiate' && { backgroundColor: Colors.brand.campOrange },
          ]}
          onPress={() => setActiveTab('negotiate')}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'negotiate' && { color: 'white' },
            ]}
          >
            Find IPs
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'chats' ? (
          <View>
            {chats.length > 0 ? (
              chats.map(renderChatItem)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={64} color={Colors.brand.gray} />
                <ThemedText style={styles.emptyTitle}>No active chats</ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  Start negotiating with IP owners to see your chats here
                </ThemedText>
              </View>
            )}
          </View>
        ) : (
          <View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={Colors.brand.gray} />
              <TextInput
                style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
                placeholder="Search IP by name, category..."
                placeholderTextColor={Colors.brand.gray}
              />
            </View>
            
            {ipListings.map(renderIPListing)}
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
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: Colors.brand.light,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    position: 'relative',
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.brand.cool3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  chatOwner: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  chatMessage: {
    fontSize: 14,
    opacity: 0.8,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  ipCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  ipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ipName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
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
  ipDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  ipOwner: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 12,
  },
  ipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ipPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.brand.campOrange,
  },
  negotiateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  negotiateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});