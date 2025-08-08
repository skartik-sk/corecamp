import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useAccount } from 'wagmi';
import { useCampNetwork } from '@/hooks/useCampNetwork';
import { formatAddress } from '@/utils/polyfills';

const { width } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'offer' | 'system';
  offerDetails?: {
    tokenId: string;
    price: string;
    periods: number;
  };
}

interface ActiveNegotiation {
  id: string;
  tokenId: string;
  tokenTitle: string;
  buyer: string;
  seller: string;
  currentOffer: string;
  status: 'active' | 'accepted' | 'rejected' | 'completed';
  messages: ChatMessage[];
  lastActivity: Date;
}

const MOCK_NEGOTIATIONS: ActiveNegotiation[] = [
  {
    id: '1',
    tokenId: '1337',
    tokenTitle: '🎨 Digital Masterpiece Collection',
    buyer: '0x1234...5678',
    seller: '0x9876...5432',
    currentOffer: '15.5',
    status: 'active',
    lastActivity: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    messages: [
      {
        id: 'm1',
        sender: '0x1234...5678',
        content: 'Hi! I\'m interested in your Digital Masterpiece Collection. Would you accept 12 CAMP?',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        type: 'message'
      },
      {
        id: 'm2',
        sender: '0x9876...5432',
        content: 'Thanks for your interest! The listed price is 20 CAMP. I could do 18 CAMP minimum.',
        timestamp: new Date(Date.now() - 1000 * 60 * 40),
        type: 'message'
      },
      {
        id: 'm3',
        sender: '0x1234...5678',
        content: '',
        timestamp: new Date(Date.now() - 1000 * 60 * 35),
        type: 'offer',
        offerDetails: {
          tokenId: '1337',
          price: '15.5',
          periods: 30
        }
      }
    ]
  }
];

export default function ChatScreen() {
  const { address, isConnected } = useAccount();
  const campNetwork = useCampNetwork();
  const [activeNegotiations, setActiveNegotiations] = useState<ActiveNegotiation[]>(MOCK_NEGOTIATIONS);
  const [selectedNegotiation, setSelectedNegotiation] = useState<ActiveNegotiation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newOffer, setNewOffer] = useState({ price: '', periods: '30' });
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<FlatList>(null);

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedNegotiation) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: address || 'You',
      content: newMessage,
      timestamp: new Date(),
      type: 'message'
    };

    setActiveNegotiations(prev => prev.map(neg => 
      neg.id === selectedNegotiation.id 
        ? { ...neg, messages: [...neg.messages, message], lastActivity: new Date() }
        : neg
    ));

    setSelectedNegotiation(prev => prev 
      ? { ...prev, messages: [...prev.messages, message] }
      : null
    );

    setNewMessage('');
    
    // Simulate response (in real app this would come from WebSocket)
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1000).toString(),
        sender: selectedNegotiation.buyer === address ? selectedNegotiation.seller : selectedNegotiation.buyer,
        content: 'Thanks for your message. Let me think about this offer.',
        timestamp: new Date(),
        type: 'message'
      };
      
      setActiveNegotiations(prev => prev.map(neg => 
        neg.id === selectedNegotiation.id 
          ? { ...neg, messages: [...neg.messages, response] }
          : neg
      ));
    }, 2000);
  };

  const sendOffer = () => {
    if (!newOffer.price || !selectedNegotiation) return;

    const offer: ChatMessage = {
      id: Date.now().toString(),
      sender: address || 'You',
      content: '',
      timestamp: new Date(),
      type: 'offer',
      offerDetails: {
        tokenId: selectedNegotiation.tokenId,
        price: newOffer.price,
        periods: parseInt(newOffer.periods)
      }
    };

    setActiveNegotiations(prev => prev.map(neg => 
      neg.id === selectedNegotiation.id 
        ? { ...neg, messages: [...neg.messages, offer], currentOffer: newOffer.price }
        : neg
    ));

    setSelectedNegotiation(prev => prev 
      ? { ...prev, messages: [...prev.messages, offer], currentOffer: newOffer.price }
      : null
    );

    setNewOffer({ price: '', periods: '30' });
    setShowOfferForm(false);
  };

  const acceptOffer = async (message: ChatMessage) => {
    if (!message.offerDetails) return;

    setIsLoading(true);
    try {
      // Use Camp Network to buy access
      const result = await campNetwork.buyAccess(
        BigInt(message.offerDetails.tokenId),
        message.offerDetails.periods,
        BigInt(parseFloat(message.offerDetails.price) * 1e18)
      );

      if (result) {
        Alert.alert(
          'Offer Accepted! 🎉',
          `Successfully purchased access to ${selectedNegotiation?.tokenTitle} for ${message.offerDetails.price} CAMP`,
          [
            { text: 'View Transaction', onPress: () => console.log('View tx:', result) },
            { text: 'Continue Trading', style: 'default' }
          ]
        );

        // Update negotiation status
        setActiveNegotiations(prev => prev.map(neg => 
          neg.id === selectedNegotiation?.id 
            ? { ...neg, status: 'completed' }
            : neg
        ));
      }
    } catch (error) {
      Alert.alert('Transaction Failed', `Could not complete purchase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.sender === address || item.sender === 'You';
    
    if (item.type === 'offer' && item.offerDetails) {
      return (
        <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
          <View style={styles.offerContainer}>
            <Text style={styles.offerTitle}>💰 New Offer</Text>
            <Text style={styles.offerDetails}>
              Price: {item.offerDetails.price} CAMP
            </Text>
            <Text style={styles.offerDetails}>
              Access Periods: {item.offerDetails.periods}
            </Text>
            {!isOwn && (
              <TouchableOpacity 
                style={styles.acceptOfferButton}
                onPress={() => acceptOffer(item)}
                disabled={isLoading}
              >
                <Text style={styles.acceptOfferText}>
                  {isLoading ? 'Processing...' : 'Accept Offer'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.messageTime}>{formatTimeAgo(item.timestamp)}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.messageTime}>{formatTimeAgo(item.timestamp)}</Text>
      </View>
    );
  };

  const renderNegotiation = ({ item }: { item: ActiveNegotiation }) => (
    <TouchableOpacity 
      style={styles.negotiationCard}
      onPress={() => setSelectedNegotiation(item)}
    >
      <View style={styles.negotiationHeader}>
        <Text style={styles.negotiationTitle}>{item.tokenTitle}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'active' ? Colors.functional.success : Colors.brand.gray }
        ]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.negotiationParties}>
        Buyer: {formatAddress(item.buyer)}
      </Text>
      <Text style={styles.negotiationParties}>
        Seller: {formatAddress(item.seller)}
      </Text>
      <View style={styles.negotiationFooter}>
        <Text style={styles.currentOffer}>Current Offer: {item.currentOffer} CAMP</Text>
        <Text style={styles.lastActivity}>{formatTimeAgo(item.lastActivity)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#F8FAFC', '#FFB400']}
          style={styles.notConnectedContainer}
        >
          <Text style={styles.notConnectedTitle}>💬 Connect to Start Trading</Text>
          <Text style={styles.notConnectedText}>
            Connect your wallet to chat with other users and negotiate IP trades
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (selectedNegotiation) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setSelectedNegotiation(null)}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatTitle}>{selectedNegotiation.tokenTitle}</Text>
              <Text style={styles.chatSubtitle}>
                With {formatAddress(
                  selectedNegotiation.buyer === address 
                    ? selectedNegotiation.seller 
                    : selectedNegotiation.buyer
                )}
              </Text>
            </View>
          </View>

          {/* Messages */}
          <FlatList
            ref={messagesRef}
            data={selectedNegotiation.messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            onLayout={() => messagesRef.current?.scrollToEnd()}
          />

          {/* Message Input */}
          <View style={styles.messageInputContainer}>
            {showOfferForm ? (
              <View style={styles.offerForm}>
                <View style={styles.offerInputRow}>
                  <TextInput
                    style={styles.offerInput}
                    placeholder="Price (CAMP)"
                    value={newOffer.price}
                    onChangeText={(text) => setNewOffer(prev => ({ ...prev, price: text }))}
                    keyboardType="decimal-pad"
                  />
                  <TextInput
                    style={styles.offerInput}
                    placeholder="Periods"
                    value={newOffer.periods}
                    onChangeText={(text) => setNewOffer(prev => ({ ...prev, periods: text }))}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.offerActions}>
                  <TouchableOpacity 
                    style={styles.cancelOfferButton}
                    onPress={() => setShowOfferForm(false)}
                  >
                    <Text style={styles.cancelOfferText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.sendOfferButton}
                    onPress={sendOffer}
                  >
                    <Text style={styles.sendOfferText}>Send Offer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.messageInputRow}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
                <TouchableOpacity 
                  style={styles.offerButton}
                  onPress={() => setShowOfferForm(true)}
                >
                  <Text style={styles.offerButtonText}>💰</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.brand.campOrange + '10', Colors.light.background]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Chat & Trade</Text>
        <Text style={styles.headerSubtitle}>
          Active negotiations and IP trading conversations
        </Text>
      </LinearGradient>

      <FlatList
        data={activeNegotiations}
        renderItem={renderNegotiation}
        keyExtractor={(item) => item.id}
        style={styles.negotiationsList}
        contentContainerStyle={styles.negotiationsContainer}
      />

      {activeNegotiations.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>💬 No Active Negotiations</Text>
          <Text style={styles.emptyStateText}>
            Start trading IP in the marketplace to begin conversations with buyers and sellers
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notConnectedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  notConnectedText: {
    fontSize: 16,
    color: Colors.brand.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.brand.gray,
    lineHeight: 22,
  },
  negotiationsList: {
    flex: 1,
  },
  negotiationsContainer: {
    padding: 20,
  },
  negotiationCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  negotiationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  negotiationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.light.card,
    fontSize: 12,
    fontWeight: 'bold',
  },
  negotiationParties: {
    fontSize: 14,
    color: Colors.brand.gray,
    marginBottom: 4,
  },
  negotiationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  currentOffer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.brand.campOrange,
  },
  lastActivity: {
    fontSize: 12,
    color: Colors.brand.gray,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.brand.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.brand.campOrange,
    fontWeight: '600',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 2,
  },
  chatSubtitle: {
    fontSize: 14,
    color: Colors.brand.gray,
  },
  messagesList: {
    flex: 1,
    padding: 20,
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
  messageText: {
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.card,
    padding: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  messageTime: {
    fontSize: 12,
    color: Colors.brand.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  offerContainer: {
    backgroundColor: Colors.brand.campOrange + '10',
    borderColor: Colors.brand.campOrange,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.brand.campOrange,
    marginBottom: 8,
  },
  offerDetails: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  acceptOfferButton: {
    backgroundColor: Colors.functional.success,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  acceptOfferText: {
    color: Colors.light.card,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageInputContainer: {
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    padding: 16,
  },
  messageInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  offerButton: {
    backgroundColor: Colors.brand.warm2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  offerButtonText: {
    fontSize: 18,
  },
  sendButton: {
    backgroundColor: Colors.brand.campOrange,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
  offerForm: {
    gap: 12,
  },
  offerInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  offerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  offerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelOfferButton: {
    flex: 1,
    backgroundColor: Colors.brand.gray,
    borderRadius: 12,
    paddingVertical: 12,
  },
  cancelOfferText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sendOfferButton: {
    flex: 1,
    backgroundColor: Colors.brand.campOrange,
    borderRadius: 12,
    paddingVertical: 12,
  },
  sendOfferText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
