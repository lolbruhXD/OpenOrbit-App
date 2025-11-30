import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ActivityIndicator, Button, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image, Linking } from 'react-native';
import CommentsSheet from './CommentsSheet';
import OptionsMenu from './OptionsMenu';
import { PostModal } from './PostDetailScreen';
import { DatabaseService, Post } from '../../services/Database';
import { LoggingService } from '../../services/LoggingService';
import { postService, Post as ApiPost } from '../../services/PostService';
// import { webSocketService } from '../../services/WebSocketService'; // Disabled to prevent connection errors
import TagFilterModal from './TagFilterModal'; // Import the filter modal

// --- TYPES ---
interface BouncingIconProps {
    name: string; size: number; lib: React.ComponentType<any>; style?: object; onPress?: () => void;
}
interface PostCardProps {
    post: ApiPost; onCommentPress: () => void; onMenuPress: () => void;
}

// --- COLOR PALETTE & MOCK DATA ---
const colors = {
    bg: '#0D0D0D', primaryText: '#EAEAEA', secondaryText: '#8A8A8E',
    cardBg: '#1C1C1E', cardBorder: '#2D2D2F', bubbleBg: '#2C2C2E',
    accent: '#0A84FF', white: '#FFFFFF', black: '#000000',
};
const topics: string[] = ['For you', 'Python', 'C++', 'ML', 'AI', 'Data Science', 'Web Dev'];

// --- SUB-COMPONENTS ---
const AppIcon = () => (<View style={styles.appIconContainer}><FontAwesome5 name="cube" size={20} color={colors.black} /></View>);

const BouncingIcon: React.FC<BouncingIconProps> = ({ name, size, lib, style, onPress }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const handlePress = () => {
        if (onPress) onPress();
        scaleValue.setValue(0.8);
        Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true, tension: 180, friction: 5 }).start();
    };
    const IconComponent = lib;
    return (
        <Pressable onPress={handlePress}>
            <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
                <IconComponent name={name} size={size} color={colors.secondaryText} />
            </Animated.View>
        </Pressable>
    );
};

const PostCard: React.FC<PostCardProps> = ({ post, onCommentPress, onMenuPress }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    // Helper to detect document file types so we don't try to render them as images
    const isDocument = (url: string | undefined) => {
        if (!url) return false;
        const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls', '.ppt', '.pptx'];
        return documentExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };
    return (
    <View style={styles.postCard}>
        <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.profilePicPlaceholder} />
                <Text style={styles.username}>{post.user.name}</Text>
            </View>
            <Pressable onPress={onMenuPress} hitSlop={20}>
                <Ionicons name="ellipsis-horizontal" size={24} color={colors.secondaryText} />
            </Pressable>
        </View>
        <View style={styles.textContent}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postSummary} numberOfLines={3}>{post.summary}</Text>
        </View>
        {post.media_url ? (
            !isDocument(post.media_url) ? (
                <>
                    <View style={{ position: 'relative' }}>
                        <Image
                            source={{ uri: post.media_url }}
                            style={[styles.mediaPreviewPlaceholder, { width: '100%' }]}
                            resizeMode="cover"
                            onLoad={() => { setImageLoading(false); setImageError(false); }}
                            onError={(e: any) => { console.error('Image load error:', e.nativeEvent?.error || e, post.media_url); setImageLoading(false); setImageError(true); }}
                        />
                        {imageLoading && (
                            <View style={styles.imageOverlay}>
                                <ActivityIndicator size="small" color={colors.primaryText} />
                            </View>
                        )}
                    </View>
                    <View style={styles.mediaActionsRow}>
                        {imageError ? (
                            <Text style={styles.imageErrorText}>Image failed to load</Text>
                        ) : null}
                        <Pressable onPress={() => post.media_url && Linking.openURL(post.media_url)} style={styles.viewImageButton}>
                            <Text style={styles.viewImageButtonText}>View image</Text>
                        </Pressable>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.documentContainer}>
                        <Pressable onPress={() => post.media_url && Linking.openURL(post.media_url)} style={styles.documentPreview}>
                            <FontAwesome5 name="file-alt" size={28} color={colors.primaryText} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.documentName} numberOfLines={1}>{post.media_url.split('/').pop()}</Text>
                                <Text style={styles.documentHint}>Tap to open document</Text>
                            </View>
                        </Pressable>
                    </View>
                    <View style={styles.mediaActionsRow}>
                        <Pressable onPress={() => post.media_url && Linking.openURL(post.media_url)} style={styles.viewImageButton}>
                            <Text style={styles.viewImageButtonText}>Open file</Text>
                        </Pressable>
                    </View>
                </>
            )
        ) : null}
        <View style={styles.tagsContainer}>
            {post.tags.map(tag => (
                <Pressable
                    key={tag}
                    onPress={() => LoggingService.logEvent('tag_press', { id: post._id, username: post.user.name }, { tagClicked: tag, allTags: post.tags })}
                    style={styles.tagChip}
                >
                    <Text style={styles.tagChipText}>#{tag}</Text>
                </Pressable>
            ))}
        </View>
        <View style={styles.cardActions}>
            <BouncingIcon name="arrow-up" size={20} lib={FontAwesome5} onPress={() => LoggingService.logEvent('upvote_post', { id: post._id, username: post.user.name }, { tags: post.tags })} />
            <BouncingIcon name="comment-dots" size={20} lib={FontAwesome5} onPress={onCommentPress} />
            <BouncingIcon name="bookmark" size={20} lib={FontAwesome} onPress={() => LoggingService.logEvent('bookmark_post', { id: post._id, username: post.user.name }, { tags: post.tags })} />
        </View>
    </View>
    );
};

const FeedHeader: React.FC = () => (
    <View style={styles.headerContainer}>
        <View style={styles.topHeader}><AppIcon /><Text style={styles.headerTitle}>Coders-Flow</Text><FontAwesome5 name="bell" size={24} color={colors.primaryText} /></View>
        <View style={styles.searchBar}><FontAwesome5 name="search" size={18} color={colors.secondaryText} /><TextInput placeholder="Search posts and projects..." placeholderTextColor={colors.secondaryText} style={styles.searchInput} /></View>
    </View>
);

const TopicFilters: React.FC = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicFilters}>
        {topics.map((topic, index) => (<View key={index} style={[styles.topicBubble, index === 0 && styles.topicBubbleActive]}><Text style={[styles.topicText, index === 0 && styles.topicTextActive]}>{topic}</Text></View>))}
    </ScrollView>
);

interface TagFiltersProps { selectedTags: string[]; onOpenModal: () => void }
const TagFilters: React.FC<TagFiltersProps> = ({ selectedTags, onOpenModal }) => (
    <View style={styles.tagFilterContainer}>
        <Text style={styles.tagFilterLabel}>Filter by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            {selectedTags.length > 0 ? (selectedTags.map((tag: string) => (<View key={tag} style={styles.tagDisplayBubble}><Text style={styles.tagDisplayBubbleText}>{tag}</Text></View>))) : (<Text style={styles.tagPlaceholder}>All Posts</Text>)}
        </ScrollView>
        <Pressable onPress={onOpenModal} style={styles.filterSettingsButton}><Ionicons name="options" size={24} color={colors.primaryText} /></Pressable>
    </View>
);

interface AppHeaderProps { selectedTags: string[]; onOpenModal: () => void }
const AppHeader: React.FC<AppHeaderProps> = ({ selectedTags, onOpenModal }) => (
    <>
        <FeedHeader />
        <TopicFilters />
        <TagFilters selectedTags={selectedTags} onOpenModal={onOpenModal} />
    </>
);
// --- MAIN FEED SCREEN ---
interface FeedScreenProps { setPagerEnabled?: (enabled: boolean) => void }
export default function FeedScreen({ setPagerEnabled }: FeedScreenProps) {
    const [allPosts, setAllPosts] = useState<ApiPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<ApiPost[]>([]);
    const [isCommentSheetVisible, setCommentSheetVisible] = useState(false);
    const [isPostModalVisible, setPostModalVisible] = useState(false);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<ApiPost | null>(null);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePosts, setHasMorePosts] = useState(true);

    const fetchPosts = async (page: number = 1, append: boolean = false) => {
        try {
            setIsLoading(true);
            const response = await postService.getAllPosts(page, 10);
            
            if (append) {
                setAllPosts(prev => [...prev, ...response.posts]);
            } else {
                setAllPosts(response.posts);
            }
            
            setCurrentPage(response.currentPage);
            setHasMorePosts(response.currentPage < response.totalPages);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMorePosts = () => {
        if (!isLoading && hasMorePosts) {
            fetchPosts(currentPage + 1, true);
        }
    };

    useEffect(() => {
        fetchPosts();
        
        // WebSocket listeners disabled to prevent connection errors
        // Real-time features can be re-enabled later if needed
    }, []);

    useEffect(() => {
        if (selectedTags.length === 0) {
            setFilteredPosts(allPosts);
        } else {
            const filtered = allPosts.filter(post => post.tags.some(tag => selectedTags.includes(tag)));
            setFilteredPosts(filtered);
        }
    }, [selectedTags, allPosts]);

    const handleApplyFilters = (tags: string[]) => {
        setSelectedTags(tags);
        setFilterModalVisible(false);
    };

    const openModal = (setter: (v: boolean) => void, post: ApiPost, disablePager = true) => {
        setSelectedPost(post);
        setter(true);
        if (disablePager && setPagerEnabled) setPagerEnabled(false);
    };

    const closeModal = (setter: (v: boolean) => void, enablePager = true) => {
        setter(false);
        setSelectedPost(null);
        if (enablePager && setPagerEnabled) setPagerEnabled(true);
    };

    const handleRefresh = () => {
        fetchPosts(1, false);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredPosts}
                renderItem={({ item }) => (
                    <Pressable onPress={() => openModal(setPostModalVisible, item)}>
                        <PostCard post={item} onCommentPress={() => openModal(setCommentSheetVisible, item)} onMenuPress={() => openModal(setMenuVisible, item, false)} />
                    </Pressable>
                )}
                keyExtractor={(item) => item._id}
                onEndReached={loadMorePosts}
                onEndReachedThreshold={0.5}
                refreshing={isLoading}
                onRefresh={handleRefresh}
                ListHeaderComponent={
                    <AppHeader selectedTags={selectedTags} onOpenModal={() => setFilterModalVisible(true)} />
                }
                ListFooterComponent={
                    isLoading && hasMorePosts ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading more posts...</Text>
                        </View>
                    ) : null
                }
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 40 }}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            />
            {selectedPost && (
                <CommentsSheet
                    visible={isCommentSheetVisible}
                    onClose={() => closeModal(setCommentSheetVisible)}
                    post={{ _id: selectedPost._id, user: { name: selectedPost.user?.name || '' } }}
                />
            )}
            <OptionsMenu visible={isMenuVisible} onClose={() => closeModal(setMenuVisible, false)} />
            {selectedPost && (
                <PostModal visible={isPostModalVisible} onClose={() => closeModal(setPostModalVisible)} post={selectedPost} />
            )}
            <TagFilterModal visible={isFilterModalVisible} onClose={() => setFilterModalVisible(false)} selectedTags={selectedTags} onApply={handleApplyFilters} />
        </View>
    );
}

// --- STYLESHEET (Full) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    headerContainer: { paddingHorizontal: 16, paddingTop: 16 },
    topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    appIconContainer: { width: 32, height: 32, backgroundColor: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
    headerTitle: { color: colors.primaryText, fontSize: 22, fontWeight: 'bold' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 12, padding: 12 },
    searchInput: { color: colors.primaryText, marginLeft: 10, flex: 1, fontSize: 16 },
    topicFilters: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    topicBubble: { backgroundColor: colors.bubbleBg, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 16 },
    topicBubbleActive: { backgroundColor: colors.primaryText },
    topicText: { color: colors.primaryText, fontSize: 14, fontWeight: '500' },
    topicTextActive: { color: colors.bg, fontWeight: 'bold' },
    tagFilterContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, gap: 10 },
    tagFilterLabel: { color: colors.secondaryText, fontSize: 14, fontWeight: '500' },
    tagDisplayBubble: { backgroundColor: colors.bubbleBg, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 16, marginRight: 8 },
    tagDisplayBubbleText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
    tagPlaceholder: { color: colors.secondaryText, fontSize: 14, paddingHorizontal: 16 },
    filterSettingsButton: { marginLeft: 'auto', padding: 8, borderRadius: 20, backgroundColor: colors.cardBg },
    loadingContainer: { padding: 20, alignItems: 'center' },
    loadingText: { color: colors.secondaryText, fontSize: 16 },
    postCard: { backgroundColor: colors.cardBg, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 16 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    profilePicPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardBorder, marginRight: 12 },
    username: { color: colors.primaryText, fontWeight: '600', fontSize: 16 },
    mediaPreviewPlaceholder: { height: 200, backgroundColor: colors.cardBorder, borderRadius: 12, marginVertical: 8 },
    textContent: { paddingVertical: 4, marginBottom: 12 },
    postTitle: { color: colors.primaryText, fontSize: 18, fontWeight: '700', marginBottom: 8 },
    postSummary: { color: colors.secondaryText, fontSize: 15, lineHeight: 22 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 12 },
    tagBubble: { color: colors.accent, fontSize: 13, fontWeight: '500' },
    cardActions: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 12 },
    mediaActionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
    imageErrorText: { color: '#FF6B6B', fontSize: 13 },
    viewImageButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.accent, borderRadius: 8 },
    viewImageButtonText: { color: colors.bg, fontWeight: '700' },
    tagChip: { backgroundColor: colors.bubbleBg, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, marginRight: 8 },
    tagChipText: { color: colors.primaryText, fontSize: 13, fontWeight: '600' },
    documentContainer: { padding: 12, backgroundColor: colors.bg, borderRadius: 12, marginVertical: 8 },
    documentPreview: { flexDirection: 'row', alignItems: 'center' },
    documentName: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
    documentHint: { color: colors.secondaryText, fontSize: 13 },
});