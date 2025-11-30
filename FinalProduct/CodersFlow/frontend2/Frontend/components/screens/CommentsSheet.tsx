import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { CurrentUser } from '../../services/CurrentUser';
import { DatabaseService } from '../../services/Database';
import { authService } from '../../services/AuthService';
import { Alert } from 'react-native';

// --- COLOR PALETTE ---
const colors = {
  bg: '#0D0D0D',
  primaryText: '#EAEAEA',
  secondaryText: '#8A8A8E',
  cardBg: '#1C1C1E',
  cardBorder: '#2D2D2F',
  bubbleBg: '#2C2C2E',
  accent: '#0A84FF',
};

// --- TYPES ---
interface CommentRenderItem { id: number; username: string; text: string }
interface CommentsSheetProps { visible: boolean; onClose: () => void; post: any | null; onCommentAdded?: () => void }
interface CommentItemProps { comment: CommentRenderItem }

const SCREEN_HEIGHT = Dimensions.get('window').height;

// --- State-backed comments (loaded from SQLite or backend) ---
const useCommentsState = (postLocalId?: number, postServerId?: string) => {
  const [items, setItems] = useState<CommentRenderItem[]>([]);

  const refreshLocal = () => {
    if (!postLocalId) return;
    // DatabaseService.getCommentsForPost expects a setter; wrap our mapper and cast to any
    DatabaseService.getCommentsForPost(postLocalId, ((rows: any) => {
      const mapped = (rows || []).map((r: any) => ({ id: r.id!, username: `user#${r.user_id}`, text: r.content }));
      setItems(mapped);
    }) as any);
  };

  const refreshServer = async () => {
    if (!postServerId) return;
    try {
      const axios = require('axios');
      const base = (require('../../config/api').API_CONFIG as any).BASE_URL;
      const res = await axios.get(`${base}/posts/${postServerId}/comments`);
      const comments = res.data || [];
      const mapped = (comments || []).map((c: any, idx: number) => ({ id: idx, username: c.user?.name || 'user', text: c.text || c.content }));
      setItems(mapped);
    } catch (e) {
      console.error('Error loading server comments', e);
    }
  };

  const refresh = () => { if (postServerId) refreshServer(); else refreshLocal(); };

  return { items, setItems, refresh, refreshServer };
};

// --- Sub-components for the Sheet ---

const CommentRow: React.FC<CommentItemProps> = ({ comment }) => (
    <View style={styles.commentContainer}>
        <View style={styles.commentAuthorPfp} />
        <View style={styles.commentBody}>
            <Text style={styles.commentUsername}>{comment.username}</Text>
            <Text style={styles.commentText}>{comment.text}</Text>
        </View>
        <Pressable style={styles.likeButton}>
            <FontAwesome name="heart-o" size={16} color={colors.secondaryText} />
        </Pressable>
    </View>
);

// --- MAIN COMPONENT ---
const CommentsSheet: React.FC<CommentsSheetProps> = ({ visible, onClose, post, onCommentAdded }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [inputText, setInputText] = useState('');
  // Support both local posts (numeric id) and server posts (_id string)
  const localId = post && typeof (post as any).id === 'number' ? (post as any).id : undefined;
  const serverId = post && (post as any)._id ? (post as any)._id : undefined;
  const { items, refresh, refreshServer } = useCommentsState(localId, serverId);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > SCREEN_HEIGHT / 3 || gestureState.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 15,
      }).start();
      // Load comments when opening
      refresh();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handlePost = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const user = CurrentUser.get();

    if (serverId) {
      // Post to backend
      try {
          if (!authService.isAuthenticated()) {
            Alert.alert('Login required', 'You must be logged in to post comments.');
            return;
          }
          const axios = require('axios');
          const base = (require('../../config/api').API_CONFIG as any).BASE_URL;
          const token = authService.getToken();
          const headers: any = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;
          await axios.post(`${base}/posts/${serverId}/comments`, { text: trimmed }, { headers });
          setInputText('');
          // Refresh server comments
          refreshServer();
          // Notify parent to refresh inline comments if present
          onCommentAdded && onCommentAdded();
      } catch (e) {
          console.error('Error posting server comment', e);
          const err: any = e;
          Alert.alert('Error', err?.response?.data?.message || 'Failed to post comment');
      }
      return;
    }

    if (!localId) return;
    DatabaseService.addComment({ post_id: localId, user_id: user.id || -1, content: trimmed });
    setInputText('');
    refresh();
    // Notify parent to refresh inline comments if present
    onCommentAdded && onCommentAdded();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={[styles.sheetContainer, { transform: [{ translateY: slideAnim }] }]}
          {...panResponder.panHandlers}>
          
          <View style={styles.handleBar} />
          <Text style={styles.headerTitle}>Comments</Text>
          
          <FlatList
            data={items}
            renderItem={({ item }) => <CommentRow comment={item} />}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.inputContainer}>
            <View style={styles.currentUserPfp} />
            <TextInput
              style={styles.textInput}
              placeholder={`Add a comment...`}
              placeholderTextColor={colors.secondaryText}
              value={inputText}
              onChangeText={setInputText}
            />
            <Pressable onPress={handlePost}>
                <Text style={styles.postButton}>Post</Text>
            </Pressable>
          </View>

        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default CommentsSheet;

// --- STYLES ---
const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    sheetContainer: {
      height: '85%',
      width: '100%',
      backgroundColor: colors.cardBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 12,
    },
    handleBar: {
      width: 40,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.cardBorder,
      alignSelf: 'center',
      marginBottom: 10,
    },
    headerTitle: {
        color: colors.primaryText,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
        paddingBottom: 12,
    },
    commentContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    commentAuthorPfp: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.cardBorder,
        marginRight: 12,
    },
    commentBody: {
        flex: 1,
        marginRight: 12,
    },
    commentUsername: {
        color: colors.primaryText,
        fontWeight: '600',
        marginBottom: 2,
    },
    commentText: {
        color: colors.primaryText,
        fontSize: 15,
        lineHeight: 22,
    },
    likeButton: {
        padding: 4,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder,
      backgroundColor: colors.cardBg,
    },
    currentUserPfp: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.cardBorder,
    },
    textInput: {
      flex: 1,
      height: 40,
      backgroundColor: colors.bubbleBg,
      borderRadius: 20,
      paddingHorizontal: 16,
      marginHorizontal: 12,
      color: colors.primaryText,
      fontSize: 15,
    },
    postButton: {
        color: colors.accent,
        fontSize: 16,
        fontWeight: '600',
    }
});