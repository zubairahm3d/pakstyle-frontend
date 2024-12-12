import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = ({ route, navigation, user }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    startPolling();

    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchConversations();
      startPolling();
    });

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      unsubscribe();
    };
  }, [navigation]);

  const startPolling = () => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Start new polling interval
    pollingIntervalRef.current = setInterval(() => {
      fetchConversations();
    }, 5000); // Poll every 5 seconds
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${process.env.API_URL}/chat/conversations/${user._id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If the message is from today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // If the message is from this year, show date without year
    else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    // Otherwise show full date
    return date.toLocaleDateString();
  };

  const renderConversationItem = ({ item }) => {
    const otherParticipant = item.participants.find(p => p._id !== user._id);
    const lastMessage = item.messages[item.messages.length - 1];

    if (!otherParticipant) return null;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation.navigate('ConversationDetail', { 
          conversationId: item._id, 
          recipient: otherParticipant 
        })}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {otherParticipant.name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.conversationInfo}>
          <Text style={styles.participantName}>{otherParticipant.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage?.content || 'No messages'}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {lastMessage ? formatTimestamp(lastMessage.timestamp) : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item) => item._id;

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No conversations yet</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conversations</Text>
        <View style={styles.headerButton}>
          <Ionicons name="chatbubble-ellipses" size={24} color="black" />
        </View>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={keyExtractor}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyListComponent}
        refreshing={isLoading}
        onRefresh={fetchConversations}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    flexGrow: 1,
    padding: 10,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50',
  },
  lastMessage: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  timestamp: {
    fontSize: 12,
    color: '#95a5a6',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default ChatScreen;