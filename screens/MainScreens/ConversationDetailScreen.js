import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConversationDetailScreen = ({ route, navigation, user }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const conversationId = route?.params?.conversationId;
  const recipient = route?.params?.recipient;

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      startMessagePolling();
      markMessagesAsRead();
    }

    const unsubscribe = navigation.addListener('focus', () => {
      fetchMessages();
      startMessagePolling();
      markMessagesAsRead();
    });

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      unsubscribe();
    };
  }, [conversationId, navigation]);

  const startMessagePolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(false);
    }, 7000);
  };

  const formatMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    return messageDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const response = await fetch(`${process.env.API_URL}/chat/messages/${conversationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      
      setMessages(prevMessages => {
        const latestCurrentMessage = prevMessages[0];
        const latestNewMessage = data[data.length - 1];
        
        if (!latestCurrentMessage || !latestNewMessage || 
            new Date(latestCurrentMessage.timestamp).getTime() !== 
            new Date(latestNewMessage.timestamp).getTime()) {
          return data.reverse();
        }
        return prevMessages;
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await fetch(`${process.env.API_URL}/chat/mark-messages-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          conversationId: conversationId,
        }),
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim() === '' || !conversationId || !user?._id || isSending) return;

    const tempMessage = {
      sender: { _id: user._id },
      content: inputMessage,
      timestamp: new Date().toISOString(),
      pending: true
    };

    setMessages(prevMessages => [tempMessage, ...prevMessages]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch(`${process.env.API_URL}/chat/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          conversationId: conversationId,
          message: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setTimeout(() => {
        fetchMessages(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          (msg === tempMessage) ? { ...msg, error: true, pending: false } : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    if (!item?.sender?._id || !user) return null;

    const isOwnMessage = item.sender._id === user._id;

    return (
      <View style={styles.messageRow}>
        {isOwnMessage ? <View style={styles.messageSpacer} /> : null}
        <View 
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.sentMessage : styles.receivedMessage,
            item.error && styles.errorMessage,
            item.pending && styles.pendingMessage
          ]}
        >
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.sentMessageText : styles.receivedMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>
            {formatMessageTime(item.timestamp)}
            {item.pending && ' • Sending...'}
            {item.error && ' • Failed to send'}
          </Text>
        </View>
        {!isOwnMessage ? <View style={styles.messageSpacer} /> : null}
      </View>
    );
  };

  const keyExtractor = (item, index) => `${item.timestamp}-${index}`;

  if (!conversationId || !recipient || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Conversation details not provided</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{recipient.name}</Text>
          {/* Add online status if needed */}
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0084ff" style={styles.loader} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          inverted
          onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: false })}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity 
          onPress={sendMessage}
          style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
          disabled={isSending || inputMessage.trim().length === 0}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={isSending || inputMessage.trim().length === 0 ? '#B0BEC5' : 'white'} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  messageList: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  messageSpacer: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  sentMessage: {
    backgroundColor: '#0084ff',
    borderTopRightRadius: 4,
  },
  receivedMessage: {
    backgroundColor: 'white',
    borderTopLeftRadius: 4,
  },
  errorMessage: {
    backgroundColor: '#ffebee',
  },
  pendingMessage: {
    opacity: 0.7,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  sentMessageText: {
    color: 'white',
  },
  receivedMessageText: {
    color: '#2c3e50',
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.7,
    alignSelf: 'flex-end',
    marginTop: 2,
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#0084ff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: '#e74c3c',
    marginTop: 20,
  },
});

export default ConversationDetailScreen;