import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import CommentsSheet from './CommentsSheet';
import axios from 'axios';
import { API_CONFIG } from '../../config/api';
import { Post } from '../../services/PostService';

// --- STYLING & MOCK DATA ---
const colors = {
    bg: '#0D0D0D', primaryText: '#EAEAEA', secondaryText: '#8A8A8E',
    cardBg: '#1C1C1E', cardBorder: '#2D2D2F', bubbleBg: '#2C2C2E', accent: '#0A84FF',
    white: '#FFFFFF',
};

interface PostModalProps {
    visible: boolean;
    onClose: () => void;
    post: Post;
}

// --- MAIN POST MODAL COMPONENT ---
export const PostModal: React.FC<PostModalProps> = ({ visible, onClose, post }) => {
    const slideAnim = useRef(new Animated.Value(300)).current;
    const [showComments, setShowComments] = useState(false);
    const [inlineComments, setInlineComments] = useState<Array<{ id: string; user: { name?: string }; text: string }>>([]);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post?.likes?.length || 0);

    // Helper function to check if media is a document
    const isDocument = (url: string) => {
        const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls', '.ppt', '.pptx'];
        return documentExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };

    // Animation for sliding the modal up and down
    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? 0 : 300,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    // Load inline comments for server-backed posts
    const loadInlineComments = async () => {
        if (!post || !post._id) return;
        try {
            const base = API_CONFIG.BASE_URL;
            const res = await axios.get(`${base}/posts/${post._id}/comments`);
            setInlineComments((res.data || []).map((c: any) => ({ id: c._id || c.id || Math.random().toString(), user: c.user || {}, text: c.text || c.content })));
        } catch (e) {
            console.error('Failed to load inline comments', e);
        }
    };

    useEffect(() => {
        if (visible) {
            loadInlineComments();
        }
    }, [visible]);

    // Pan gesture handler for swipe-down-to-close
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    slideAnim.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100 || gestureState.vy > 0.5) {
                    onClose();
                } else {
                    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
                }
            },
        })
    ).current;

    const handleLikePress = () => {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
        // TODO: Call your API to update like status
    };

    const handleShare = () => {
        // TODO: Implement share functionality
    };

    if (!post) return null;

    return (
        <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
            <View style={styles.modalOverlay}>
                <Animated.View 
                    style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]} 
                    {...panResponder.panHandlers}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable onPress={onClose} hitSlop={20}>
                            <Ionicons name="close" size={28} color={colors.primaryText} />
                        </Pressable>
                        <Text style={styles.headerTitle} numberOfLines={1}>{post.title}</Text>
                        <Pressable hitSlop={20}>
                            <Ionicons name="ellipsis-horizontal" size={24} color={colors.primaryText} />
                        </Pressable>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* Author Info */}
                        <View style={styles.authorSection}>
                            <View style={styles.authorInfo}>
                                <View style={styles.avatarPlaceholder} />
                                <Text style={styles.authorName}>{post.user.name}</Text>
                            </View>
                            <Text style={styles.postDate}>
                                {new Date(post.createdAt).toLocaleDateString()}
                            </Text>
                        </View>

                        {/* Media Content */}
                        {post.media_url && (
                            <View style={styles.mediaContainer}>
                                <Image 
                                    source={{ uri: post.media_url }} 
                                    style={styles.mediaContent}
                                    resizeMode="contain"
                                />
                            </View>
                        )}

                        {/* Post Content */}
                        <View style={styles.contentContainer}>
                            {post.summary && (
                                <Text style={styles.summary}>{post.summary}</Text>
                            )}
                            {post.code && (
                                <View style={styles.codeBlock}>
                                    <Text style={styles.codeText}>{post.code}</Text>
                                </View>
                            )}
                        </View>


                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                style={styles.tagsContainer}
                            >
                                {post.tags.map((tag, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>#{tag}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        )}

                        {/* Action Bar */}
                        <View style={styles.actionBar}>
                            <Pressable 
                                style={styles.actionButton} 
                                onPress={handleLikePress}
                            >
                                <Ionicons 
                                    name={isLiked ? "heart" : "heart-outline"} 
                                    size={24} 
                                    color={isLiked ? colors.accent : colors.primaryText} 
                                />
                                <Text style={styles.actionText}>{likesCount}</Text>
                            </Pressable>
                            
                            <Pressable 
                                style={styles.actionButton} 
                                onPress={() => setShowComments(true)}
                            >
                                <Ionicons name="chatbubble-outline" size={24} color={colors.primaryText} />
                                <Text style={styles.actionText}>Comments</Text>
                            </Pressable>
                            
                            <Pressable 
                                style={styles.actionButton} 
                                onPress={handleShare}
                            >
                                <Ionicons name="share-outline" size={24} color={colors.primaryText} />
                                <Text style={styles.actionText}>Share</Text>
                            </Pressable>
                        </View>

                        {/* Inline comments displayed below the action bar */}
                        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                            {inlineComments.map((c) => (
                                <View key={c.id} style={styles.inlineComment}>
                                    <View style={styles.commentPfp} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inlineCommentAuthor}>{c.user?.name || 'User'}</Text>
                                        <Text style={styles.inlineCommentText}>{c.text}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Comments Sheet */}
                    <CommentsSheet
                        visible={showComments}
                        onClose={() => setShowComments(false)}
                        post={post}
                        onCommentAdded={loadInlineComments}
                    />
                </Animated.View>
            </View>
        </Modal>
    );
}

// --- STYLESHEETS ---
const markdownStyles = StyleSheet.create({
    heading1: { color: colors.primaryText, borderBottomWidth: 1, borderColor: colors.cardBorder, marginBottom: 10, paddingBottom: 5 },
    heading3: { color: colors.primaryText, marginBottom: 5 },
    body: { color: colors.secondaryText, fontSize: 16, lineHeight: 24 },
    bullet_list: { marginBottom: 15 },
    strong: { color: colors.accent, fontWeight: 'bold' },
});

const styles = StyleSheet.create({
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        justifyContent: 'flex-end' 
    },
    modalContainer: { 
        height: '95%', 
        backgroundColor: colors.cardBg, 
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: colors.cardBorder 
    },
    headerTitle: { 
        flex: 1, 
        textAlign: 'center', 
        color: colors.primaryText, 
        fontSize: 18, 
        fontWeight: '600', 
        marginHorizontal: 16 
    },
    scrollContent: { 
        padding: 16 
    },
    authorSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.bubbleBg,
        marginRight: 12
    },
    authorName: {
        color: colors.primaryText,
        fontSize: 16,
        fontWeight: '500'
    },
    postDate: {
        color: colors.secondaryText,
        fontSize: 14
    },
    mediaContainer: {
        width: '100%',
        height: 300,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.bg
    },
    mediaContent: {
        width: '100%',
        height: '100%'
    },
    contentContainer: {
        marginBottom: 16
    },
    summary: {
        color: colors.primaryText,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16
    },
    codeBlock: { 
        backgroundColor: colors.bg, 
        padding: 16, 
        borderRadius: 8,
        marginBottom: 16
    },
    codeText: {
        color: colors.primaryText,
        fontFamily: 'monospace',
        fontSize: 14
    },
    tagsContainer: {
        flexDirection: 'row',
        marginBottom: 16
    },
    tag: {
        backgroundColor: colors.bubbleBg,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8
    },
    tagText: {
        color: colors.accent,
        fontSize: 14
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    actionText: {
        color: colors.primaryText,
        fontSize: 14
    },
    embedContainer: { 
        flexDirection: 'row', 
        marginVertical: 16, 
        gap: 12 
    },
    embedPreview: { 
        width: 120, 
        backgroundColor: colors.bubbleBg, 
        borderRadius: 8, 
        padding: 10, 
        alignItems: 'center', 
        justifyContent: 'center', 
        alignSelf: 'flex-start' 
    },
    embedText: { 
        color: colors.secondaryText, 
        fontSize: 12, 
        textAlign: 'center', 
        marginTop: 8 
    },
    embedContent: { 
        flex: 1 
    }
    ,
    inlineComment: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#222' },
    commentPfp: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.cardBorder, marginRight: 12 },
    inlineCommentAuthor: { color: colors.primaryText, fontWeight: '600', marginBottom: 2 },
    inlineCommentText: { color: colors.primaryText, fontSize: 15, lineHeight: 22 },
});