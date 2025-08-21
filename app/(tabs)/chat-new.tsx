import React, { useState, useEffect, useRef } from 'react';
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
  KeyboardAvoidingView,
  Alert,
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
  MessageCircle,
  Send,
  DollarSign,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Shield,
  Plus,
  ArrowLeft,
  FileText,
  Paperclip,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'offer' | 'system' | 'file';
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
  offerDetails?: {
    tokenId: string;
    price: string;
    duration: number;
    type: 'license' | 'purchase';
  };
  fileDetails?: {
    fileName: string;
    fileSize: string;
    fileType: string;
  };
}

interface ActiveChat {
  id: string;
  tokenId?: string;
  tokenTitle?: string;
  participant: string;
  participantName?: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'negotiating' | 'completed' | 'disputed';
  isOnline: boolean;
  messages: ChatMessage[];
  currentOffer?: {
    price: string;
    from: string;
    status: 'pending' | 'accepted' | 'rejected';
  };
}

export default function ChatScreen() {
  const { address, isConnected } = useAccount();
  const campfire = useCampfireIntegration();
  const router = useRouter();
  
  const [chats, setChats] = useState<ActiveChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<ActiveChat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [newOffer, setNewOffer] = useState({
    price: '',
    duration: '30',
    type: 'license' as 'license' | 'purchase'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<FlatList>(null);

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
    const generateMockChats = (): ActiveChat[] => {
      const mockChats: ActiveChat[] = [];
      const participants = [
        { name: 'Alice Creator', address: '0x1234...5678' },
        { name: 'Bob Investor', address: '0x9876...5432' },
        { name: 'Charlie Dev', address: '0xabcd...efgh' },
        { name: 'Diana Artist', address: '0x5555...7777' },
        { name: 'Eve Designer', address: '0x2222...8888' },
      ];

      const tokens = [
        'AI Model Collection',
        'Music Rights Bundle',
        'Digital Art Series',
        'Code Repository Access',
        'Patent Portfolio'
      ];

      for (let i = 0; i < 5; i++) {
        const participant = participants[i];
        const isOnline = Math.random() > 0.4;
        const hasUnread = Math.random() > 0.6;
        const unreadCount = hasUnread ? Math.floor(Math.random() * 5) + 1 : 0;
        
        const messages: ChatMessage[] = [];
        const messageCount = Math.floor(Math.random() * 10) + 3;
        
        for (let j = 0; j < messageCount; j++) {
          const isOwn = Math.random() > 0.5;
          const messageTypes = ['message', 'offer', 'system'];
          const type = j === messageCount - 2 && Math.random() > 0.7 ? 'offer' : 'message';
          
          messages.push({
            id: `msg-${i}-${j}`,
            sender: isOwn ? address || 'You' : participant.address,
            content: type === 'offer' ? '' : [
              'Hi! I\'m interested in your IP asset.',
              'Thanks for reaching out. Let me know what you\'re looking for.',
              'I can offer licensing terms that work for both of us.',
              'The current market rate is around this range.',
              'Let\'s discuss the technical requirements.',
              'I have some questions about the implementation.',
              'This looks perfect for my project needs.',
              'Can we schedule a call to discuss details?'
            ][Math.floor(Math.random() * 8)],
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            type: type as any,
            isOwn,
            status: ['sent', 'delivered', 'read'][Math.floor(Math.random() * 3)] as any,
            offerDetails: type === 'offer' ? {
              tokenId: `${i + 1}`,
              price: (Math.random() * 20 + 1).toFixed(2),
              duration: Math.floor(Math.random() * 60) + 30,
              type: Math.random() > 0.5 ? 'license' : 'purchase'
            } : undefined,
          });
        }

        const lastMessage = messages[messages.length - 1];
        
        mockChats.push({
          id: `chat-${i}`,
          tokenId: `${i + 1}`,
          tokenTitle: tokens[i],
          participant: participant.address,
          participantName: participant.name,
          participantAvatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${participant.name}`,
          lastMessage: lastMessage.content || 'Made an offer',
          lastMessageTime: lastMessage.timestamp,
          unreadCount,
          status: ['active', 'negotiating', 'completed'][Math.floor(Math.random() * 3)] as any,
          isOnline,
          messages: messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
          currentOffer: Math.random() > 0.7 ? {
            price: (Math.random() * 15 + 5).toFixed(2),
            from: Math.random() > 0.5 ? address || 'You' : participant.address,
            status: 'pending'
          } : undefined,
        });
      }

      return mockChats.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    };

    setChats(generateMockChats());
  }, [address]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic would go here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const formatAddress = (address: string) => {
    if (!address || address.length < 6) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: address || 'You',
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'message',
      isOwn: true,
      status: 'sent'
    };

    // Update chat with new message
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, message],
      lastMessage: message.content,
      lastMessageTime: message.timestamp
    };

    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id ? updatedChat : chat
    ));
    
    setSelectedChat(updatedChat);
    setNewMessage('');

    // Auto-scroll to bottom
    setTimeout(() => {
      messagesRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate response
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1000).toString(),
        sender: selectedChat.participant,
        content: [
          'Thanks for your message!',
          'Let me review this and get back to you.',
          'That sounds interesting. Tell me more.',
          'I think we can work something out.',
          'Let me check the details and respond soon.'
        ][Math.floor(Math.random() * 5)],
        timestamp: new Date(),
        type: 'message',
        isOwn: false,
        status: 'delivered'
      };

      const chatWithResponse = {
        ...updatedChat,
        messages: [...updatedChat.messages, response],
        lastMessage: response.content,
        lastMessageTime: response.timestamp
      };

      setChats(prev => prev.map(chat => 
        chat.id === selectedChat.id ? chatWithResponse : chat
      ));
      
      setSelectedChat(chatWithResponse);
    }, 2000 + Math.random() * 3000);
  };

  const sendOffer = () => {
    if (!newOffer.price || !selectedChat) return;

    const offer: ChatMessage = {
      id: Date.now().toString(),
      sender: address || 'You',
      content: '',
      timestamp: new Date(),
      type: 'offer',
      isOwn: true,
      status: 'sent',
      offerDetails: {
        tokenId: selectedChat.tokenId || '1',
        price: newOffer.price,
        duration: parseInt(newOffer.duration),
        type: newOffer.type
      }
    };

    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, offer],
      lastMessage: 'Made an offer',
      lastMessageTime: offer.timestamp,
      currentOffer: {
        price: newOffer.price,
        from: address || 'You',
        status: 'pending' as const
      }
    };

    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id ? updatedChat : chat
    ));
    
    setSelectedChat(updatedChat);
    setNewOffer({ price: '', duration: '30', type: 'license' });
    setShowOfferForm(false);
  };

  const acceptOffer = async (message: ChatMessage) => {
    if (!message.offerDetails) return;

    setIsLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Offer Accepted! 🎉',
        `Successfully accepted offer for ${message.offerDetails.price} CAMP`,
        [{ text: 'Continue', style: 'default' }]
      );

      // Update chat status
      if (selectedChat) {
        const updatedChat = {
          ...selectedChat,
          status: 'completed' as const,
          currentOffer: undefined
        };
        
        setChats(prev => prev.map(chat => 
          chat.id === selectedChat.id ? updatedChat : chat
        ));
        
        setSelectedChat(updatedChat);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    if (item.type === 'offer' && item.offerDetails) {
      return (
        <Animated.View
          style={[
            styles.messageContainer,
            item.isOwn ? styles.ownMessage : styles.otherMessage,
            {
              transform: [
                {
                  translateY: withDelay(
                    index * 50,
                    withSpring(0, { damping: 15 })
                  )
                }
              ]
            }
          ]}
        >
          <BlurView intensity={60} style={styles.offerBlur}>
            <View style={[styles.offerContainer, item.isOwn && styles.ownOfferContainer]}>
              <View style={styles.offerHeader}>
                <DollarSign size={20} color={Colors['camp-orange']} />
                <Text style={styles.offerTitle}>
                  {item.offerDetails.type === 'license' ? 'License Offer' : 'Purchase Offer'}
                </Text>
              </View>
              
              <View style={styles.offerDetails}>
                <Text style={styles.offerPrice}>{item.offerDetails.price} CAMP</Text>
                <Text style={styles.offerDuration}>
                  {item.offerDetails.duration} days access
                </Text>
              </View>

              {!item.isOwn && (
                <View style={styles.offerActions}>
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => {}}
                  >
                    <XCircle size={16} color="white" />
                    <Text style={styles.rejectText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={() => acceptOffer(item)}
                    disabled={isLoading}
                  >
                    <CheckCircle size={16} color="white" />
                    <Text style={styles.acceptText}>
                      {isLoading ? 'Processing...' : 'Accept'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </BlurView>
          <Text style={[styles.messageTime, item.isOwn && styles.ownMessageTime]}>
            {formatTimeAgo(item.timestamp)}
          </Text>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          item.isOwn ? styles.ownMessage : styles.otherMessage,
          {
            transform: [
              {
                translateY: withDelay(
                  index * 50,
                  withSpring(0, { damping: 15 })
                )
              }
            ]
          }
        ]}
      >
        <View style={[
          styles.messageBubble,
          item.isOwn ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            item.isOwn ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.messageTime, item.isOwn && styles.ownMessageTime]}>
          {formatTimeAgo(item.timestamp)}
        </Text>
      </Animated.View>
    );
  };

  const renderChatItem = ({ item, index }: { item: ActiveChat; index: number }) => (
    <Animated.View
      style={[
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
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => setSelectedChat(item)}
      >
        <BlurView intensity={60} style={styles.chatItemBlur}>
          <View style={styles.chatItemContent}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: item.participantAvatar }} 
                style={styles.avatar}
              />
              {item.isOnline && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.chatInfo}>
              <View style={styles.chatItemHeader}>
                <Text style={styles.participantName}>
                  {item.participantName || formatAddress(item.participant)}
                </Text>
                <Text style={styles.lastMessageTime}>
                  {formatTimeAgo(item.lastMessageTime)}
                </Text>
              </View>

              {item.tokenTitle && (
                <Text style={styles.tokenTitle} numberOfLines={1}>
                  Re: {item.tokenTitle}
                </Text>
              )}

              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>

              <View style={styles.chatFooter}>
                <View style={[
                  styles.statusBadge, 
                  item.status === 'active' ? styles.activeStatus :
                  item.status === 'negotiating' ? styles.negotiatingStatus :
                  item.status === 'completed' ? styles.completedStatus :
                  styles.activeStatus
                ]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
                
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );

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
              <MessageCircle size={40} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.authTitle}>Connect Your Wallet</Text>
          <Text style={styles.authSubtitle}>
            Connect your wallet to start chatting with IP creators and negotiate licensing deals directly.
          </Text>
        </View>
      </View>
    );
  }

  if (selectedChat) {
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

        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Chat Header */}
          <BlurView intensity={60} style={styles.chatHeaderBlur}>
            <View style={styles.chatHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setSelectedChat(null)}
              >
                <ArrowLeft size={24} color={Colors['camp-dark']} />
              </TouchableOpacity>

              <View style={styles.chatHeaderInfo}>
                <Image 
                  source={{ uri: selectedChat.participantAvatar }} 
                  style={styles.headerAvatar}
                />
                <View style={styles.headerTextInfo}>
                  <Text style={styles.headerName}>
                    {selectedChat.participantName || formatAddress(selectedChat.participant)}
                  </Text>
                  <Text style={styles.headerStatus}>
                    {selectedChat.isOnline ? 'Online' : `Last seen ${formatTimeAgo(selectedChat.lastMessageTime)}`}
                  </Text>
                </View>
              </View>

              <View style={styles.chatHeaderActions}>
                <TouchableOpacity style={styles.headerActionButton}>
                  <Phone size={20} color={Colors['cool-1']} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerActionButton}>
                  <Video size={20} color={Colors['cool-1']} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerActionButton}>
                  <MoreVertical size={20} color={Colors['cool-1']} />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>

          {/* Messages */}
          <FlatList
            ref={messagesRef}
            data={selectedChat.messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => messagesRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Input Area */}
          <BlurView intensity={60} style={styles.inputAreaBlur}>
            <View style={styles.inputArea}>
              {showOfferForm ? (
                <View style={styles.offerForm}>
                  <Text style={styles.offerFormTitle}>Make an Offer</Text>
                  
                  <View style={styles.offerFormRow}>
                    <View style={styles.offerInputGroup}>
                      <Text style={styles.inputLabel}>Price (CAMP)</Text>
                      <TextInput
                        style={styles.offerInput}
                        placeholder="0.00"
                        value={newOffer.price}
                        onChangeText={(text) => setNewOffer(prev => ({ ...prev, price: text }))}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.offerInputGroup}>
                      <Text style={styles.inputLabel}>Duration (days)</Text>
                      <TextInput
                        style={styles.offerInput}
                        placeholder="30"
                        value={newOffer.duration}
                        onChangeText={(text) => setNewOffer(prev => ({ ...prev, duration: text }))}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.offerTypeRow}>
                    <TouchableOpacity
                      style={[
                        styles.offerTypeButton,
                        newOffer.type === 'license' && styles.offerTypeButtonActive
                      ]}
                      onPress={() => setNewOffer(prev => ({ ...prev, type: 'license' }))}
                    >
                      <Text style={[
                        styles.offerTypeText,
                        newOffer.type === 'license' && styles.offerTypeTextActive
                      ]}>
                        License
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.offerTypeButton,
                        newOffer.type === 'purchase' && styles.offerTypeButtonActive
                      ]}
                      onPress={() => setNewOffer(prev => ({ ...prev, type: 'purchase' }))}
                    >
                      <Text style={[
                        styles.offerTypeText,
                        newOffer.type === 'purchase' && styles.offerTypeTextActive
                      ]}>
                        Purchase
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.offerFormActions}>
                    <TouchableOpacity 
                      style={styles.cancelOfferButton}
                      onPress={() => setShowOfferForm(false)}
                    >
                      <Text style={styles.cancelOfferText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.sendOfferButton}
                      onPress={sendOffer}
                      disabled={!newOffer.price}
                    >
                      <LinearGradient
                        colors={Colors.gradients.primary as any}
                        style={styles.sendOfferButtonGradient}
                      >
                        <Text style={styles.sendOfferText}>Send Offer</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.messageInputRow}>
                  <TouchableOpacity style={styles.attachButton}>
                    <Paperclip size={20} color={Colors['cool-1']} />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.messageInput}
                    placeholder="Type a message..."
                    placeholderTextColor={Colors['cool-1']}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                  />
                  
                  <TouchableOpacity 
                    style={styles.offerButton}
                    onPress={() => setShowOfferForm(true)}
                  >
                    <DollarSign size={20} color={Colors['camp-orange']} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <LinearGradient
                      colors={newMessage.trim() ? Colors.gradients.primary as any : ['#ccc', '#999']}
                      style={styles.sendButtonGradient}
                    >
                      <Send size={20} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </BlurView>
        </KeyboardAvoidingView>
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
            Chat & <Text style={styles.gradientTitle}>Negotiate</Text>
          </Text>
          <Text style={styles.pageSubtitle}>
            Connect directly with IP creators and negotiate licensing deals. Secure, transparent, and efficient.
          </Text>
        </Animated.View>

        {/* Search */}
        <Animated.View style={[styles.searchContainer, fadeInStyle]}>
          <BlurView intensity={60} style={styles.searchBlur}>
            <View style={styles.searchContent}>
              <Search size={20} color={Colors['cool-1']} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search conversations..."
                placeholderTextColor={Colors['cool-1']}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
          </BlurView>
        </Animated.View>

        {/* Chat List */}
        <View style={styles.chatListContainer}>
          {chats.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <MessageCircle size={40} color={Colors['cool-2']} />
              </View>
              <Text style={styles.emptyTitle}>No Active Chats</Text>
              <Text style={styles.emptySubtitle}>
                Start exploring the marketplace to connect with IP creators and begin negotiations
              </Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => router.push('/marketplace' as any)}
              >
                <LinearGradient
                  colors={Colors.gradients.primary as any}
                  style={styles.exploreButtonGradient}
                >
                  <Text style={styles.exploreButtonText}>Explore Marketplace</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={chats}
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chatListContent}
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

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors['camp-dark'],
    fontFamily: 'Inter_400Regular',
  },

  // Chat List
  chatListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  chatListContent: {
    paddingBottom: 20,
  },
  chatItem: {
    marginBottom: 16,
  },
  chatItemBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  chatItemContent: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors['cool-3'] + '20',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: 'white',
  },
  chatInfo: {
    flex: 1,
  },
  chatItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors['camp-dark'],
    fontFamily: 'Inter_600SemiBold',
  },
  lastMessageTime: {
    fontSize: 12,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },
  tokenTitle: {
    fontSize: 14,
    color: Colors['camp-orange'],
    marginBottom: 4,
    fontFamily: 'Inter_500Medium',
  },
  lastMessage: {
    fontSize: 14,
    color: Colors['cool-1'],
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeStatus: {
    backgroundColor: Colors.success + '20',
  },
  negotiatingStatus: {
    backgroundColor: Colors['camp-orange'] + '20',
  },
  completedStatus: {
    backgroundColor: Colors['cool-1'] + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors['camp-dark'],
    fontFamily: 'Inter_600SemiBold',
  },
  unreadBadge: {
    backgroundColor: Colors['camp-orange'],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  exploreButton: {
    borderRadius: 12,
  },
  exploreButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },

  // Chat Header
  chatHeaderBlur: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTextInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors['camp-dark'],
    fontFamily: 'Inter_600SemiBold',
  },
  headerStatus: {
    fontSize: 12,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },
  chatHeaderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
  },

  // Messages
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ownMessageBubble: {
    backgroundColor: Colors['camp-orange'],
  },
  otherMessageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: Colors['camp-dark'],
  },
  messageTime: {
    fontSize: 12,
    color: Colors['cool-1'],
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  ownMessageTime: {
    textAlign: 'right',
  },

  // Offers
  offerBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  offerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: Colors['camp-orange'] + '30',
    padding: 16,
  },
  ownOfferContainer: {
    backgroundColor: Colors['camp-orange'] + '10',
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors['camp-orange'],
    fontFamily: 'Inter_600SemiBold',
  },
  offerDetails: {
    marginBottom: 16,
  },
  offerPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors['camp-dark'],
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  offerDuration: {
    fontSize: 14,
    color: Colors['cool-1'],
    fontFamily: 'Inter_400Regular',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors['cool-1'],
    borderRadius: 12,
    gap: 6,
  },
  rejectText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.success,
    borderRadius: 12,
    gap: 6,
  },
  acceptText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },

  // Input Area
  inputAreaBlur: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputArea: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  messageInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  attachButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
  },
  messageInput: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    fontSize: 16,
    color: Colors['camp-dark'],
    fontFamily: 'Inter_400Regular',
  },
  offerButton: {
    padding: 12,
    backgroundColor: Colors['camp-orange'] + '20',
    borderRadius: 20,
  },
  sendButton: {
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Offer Form
  offerForm: {
    gap: 16,
  },
  offerFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors['camp-dark'],
    fontFamily: 'Inter_600SemiBold',
  },
  offerFormRow: {
    flexDirection: 'row',
    gap: 16,
  },
  offerInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors['cool-1'],
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  offerInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    fontSize: 16,
    color: Colors['camp-dark'],
    fontFamily: 'Inter_400Regular',
  },
  offerTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  offerTypeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  offerTypeButtonActive: {
    backgroundColor: Colors['camp-orange'],
    borderColor: Colors['camp-orange'],
  },
  offerTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors['cool-1'],
    fontFamily: 'Inter_500Medium',
  },
  offerTypeTextActive: {
    color: 'white',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  offerFormActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelOfferButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors['cool-1'],
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelOfferText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  sendOfferButton: {
    flex: 1,
    borderRadius: 12,
  },
  sendOfferButtonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOfferText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
