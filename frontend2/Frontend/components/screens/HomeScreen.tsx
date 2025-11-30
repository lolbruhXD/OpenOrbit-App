import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import OptionsMenu from './OptionsMenu';
import { LoggingService } from '../../services/LoggingService';
import AnimatedIconButton from '../AnimatedIconButton';
import TagFilterModal from './TagFilterModal'; // Make sure this file exists

// --- TYPES (Consolidated for HomeScreen) ---
interface TrendingPost {
    id: string; author: string; tags: string[]; title?: string; summary?: string; username?: string;
}
interface FollowedCreator {
    id: string; name: string; newPosts: number; profilePicture: string; bannerColors: string[];
}
interface Quickie { id: string; }
interface MenuIconProps { onPress?: () => void; }
interface PostCardProps { post: TrendingPost; onCommentPress: () => void; onMenuPress: () => void; }

// --- COLORS & MOCK DATA ---
const colors = {
    bg: '#0D0D0D', primaryText: '#EAEAEA', secondaryText: '#8A8A8E',
    cardBg: '#1C1C1E', cardBorder: '#2D2D2F', bubbleBg: '#2C2C2E',
    accent: '#0A84FF', white: '#FFFFFF', black: '#000000', red: '#FF3B30',
    likeRed: '#FF6B6B', commentBlue: '#1DA1F2'
};

const trendingPosts: TrendingPost[] = [
    { id: 'trend-1', author: 'ModernArt', username: 'ModernArt', title: 'Exploring Modern UI', summary: 'A deep dive into the principles of modern user interface design...', tags: ['digital-art', 'ui-ux', 'design', 'Java'] },
    { id: 'trend-2', author: 'TechGuru', username: 'TechGuru', title: 'AI in 2025', summary: 'Reviewing the latest advancements in artificial intelligence and machine learning...', tags: ['coding', 'devops', 'ai', 'Python'] },
    { id: 'trend-3', author: 'TravelVibes', username: 'TravelVibes', title: 'Into the Wild', summary: 'Capturing the beauty of untouched landscapes through a photographic journey...', tags: ['photography', 'nature', 'explore', 'CPP'] },
    { id: 'trend-4', author: 'CodeWizard', username: 'CodeWizard', title: 'Mastering Rust', summary: 'A comprehensive guide to memory safety and performance with Rust...', tags: ['coding', 'rust', 'systems-programming'] },
];

const followedCreators: FollowedCreator[] = [
    { id: 'creator-1', name: 'NeuralNetNerd', newPosts: 3, profilePicture: 'https://placehold.co/100x100/AF52DE/FFFFFF/png?text=NNN', bannerColors: ['#AF52DE', '#3A3A3C'] },
    { id: 'creator-2', name: 'PixelPerfect', newPosts: 0, profilePicture: 'https://placehold.co/100x100/0A84FF/FFFFFF/png?text=PP', bannerColors: ['#0A84FF', '#34C759'] },
    { id: 'creator-3', name: 'GodotGamer', newPosts: 1, profilePicture: 'https://placehold.co/100x100/FF9500/FFFFFF/png?text=GG', bannerColors: ['#FF9500', '#FF3B30'] },
];

const quickies: Quickie[] = [{ id: 'quickie-1' }, { id: 'quickie-2' }, { id: 'quickie-3' }];

// --- SUB-COMPONENTS ---
const MenuIcon: React.FC<MenuIconProps> = ({ onPress }) => ( <Pressable onPress={onPress} hitSlop={20} style={styles.menuIconWrapper}><Ionicons name="ellipsis-horizontal" size={24} color={colors.secondaryText} /></Pressable> );
const AppIcon = () => (<View style={styles.appIconContainer}><FontAwesome5 name="cube" size={20} color={colors.black} /></View>);

// Reusable PostCard component (ideally in its own file)
const PostCard: React.FC<PostCardProps> = ({ post, onCommentPress, onMenuPress }) => (
    <View style={styles.postCard}>
        <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.profilePicPlaceholder} />
                <Text style={styles.username}>{post.username}</Text>
            </View>
            <Pressable onPress={onMenuPress} hitSlop={20}>
                <Ionicons name="ellipsis-horizontal" size={24} color={colors.secondaryText} />
            </Pressable>
        </View>
        <View style={styles.textContent}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postSummary} numberOfLines={3}>{post.summary}</Text>
        </View>
        <View style={styles.tagsContainer}>
            {post.tags.map(tag =>
                <Pressable key={tag} onPress={() => LoggingService.logEvent('tag_press', post, { tagClicked: tag, allTags: post.tags })}>
                    <Text style={styles.tagBubble}>#{tag}</Text>
                </Pressable>
            )}
        </View>
        <View style={styles.cardActions}>
            <FontAwesome5 name="arrow-up" size={20} color={colors.secondaryText} />
            <FontAwesome5 name="comment-dots" size={20} color={colors.secondaryText} />
            <FontAwesome name="bookmark" size={20} color={colors.secondaryText} />
        </View>
    </View>
);

// --- SCREEN SECTIONS (Reorganized) ---
const TopHeader = () => (
    <View style={styles.headerContainer}>
        <View style={styles.topHeader}><AppIcon /><Text style={styles.headerTitle}>Coders-Flow</Text><FontAwesome5 name="bell" size={24} color={colors.primaryText} /></View>
        <View style={styles.searchBar}><FontAwesome5 name="search" size={18} color={colors.secondaryText} /><TextInput placeholder="Search Creators & Content" placeholderTextColor={colors.secondaryText} style={styles.searchInput} /></View>
    </View>
);

const TagFilters = ({ selectedTags, onOpenModal }) => (
    <View style={styles.tagFilterContainer}>
        <Text style={styles.tagFilterLabel}>Filter by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            {selectedTags.length > 0 ? (selectedTags.map(tag => (<View key={tag} style={styles.tagDisplayBubble}><Text style={styles.tagDisplayBubbleText}>{tag}</Text></View>))) : (<Text style={styles.tagPlaceholder}>All Posts</Text>)}
        </ScrollView>
        <Pressable onPress={onOpenModal} style={styles.filterSettingsButton}><Ionicons name="options" size={24} color={colors.primaryText} /></Pressable>
    </View>
);

const SortBySection = () => (
    <View style={styles.sortByContainer}>
        <Text style={styles.sortByText}>Sort by</Text>
        <View style={[styles.sortButton, styles.sortButtonActive]}><Text style={styles.sortButtonActiveText}>Today</Text></View>
        <View style={styles.sortButton}><Text style={styles.sortButtonText}>Month</Text></View>
        <View style={styles.sortButton}><Text style={styles.sortButtonText}>Year</Text></View>
        <View style={styles.sortButton}><Text style={styles.sortButtonText}>All-Time</Text></View>
    </View>
);

const TrendingCard = ({ item, onOpenMenu }: { item: TrendingPost, onOpenMenu: (post: TrendingPost) => void }) => (
    <Pressable onPress={() => LoggingService.logEvent('view_trending_post', { id: item.id, username: item.author }, { tags: item.tags })}>
        <View style={styles.trendingCard}><LinearGradient colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} /><View><Text style={styles.trendingCardAuthor}>@{item.author}</Text><Text style={styles.trendingCardTitle}>{item.title}</Text></View><View style={styles.trendingActions}><AnimatedIconButton initialIcon="heart-outline" filledIcon="heart" initialColor={colors.primaryText} filledColor={colors.likeRed} /><AnimatedIconButton initialIcon="chatbubble-outline" filledIcon="chatbubble" initialColor={colors.primaryText} filledColor={colors.commentBlue} /><AnimatedIconButton initialIcon="bookmark-outline" filledIcon="bookmark" initialColor={colors.primaryText} filledColor={colors.white} /><View style={{ marginLeft: 'auto' }}><MenuIcon onPress={() => onOpenMenu(item)} /></View></View></View>
    </Pressable>
);

// --- MAIN HOME SCREEN ---
export default function HomeScreen({ setPagerEnabled }: { setPagerEnabled: (enabled: boolean) => void }) {
    const [menuVisible, setMenuVisible] = useState(false);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [allTrendingPosts] = useState<TrendingPost[]>(trendingPosts);
    const [filteredTrendingPosts, setFilteredTrendingPosts] = useState<TrendingPost[]>(trendingPosts);

    useEffect(() => {
        if (selectedTags.length === 0) {
            setFilteredTrendingPosts(allTrendingPosts);
        } else {
            const filtered = allTrendingPosts.filter(post => post.tags.some(tag => selectedTags.includes(tag)));
            setFilteredTrendingPosts(filtered);
        }
    }, [selectedTags, allTrendingPosts]);
    
    const handleApplyFilters = (tags: string[]) => { setSelectedTags(tags); setFilterModalVisible(false); };
    const handleOpenMenu = (item: any) => { setMenuVisible(true); setPagerEnabled(false); };
    const handleCloseMenu = () => { setMenuVisible(false); setPagerEnabled(true); };

    // This component combines all the top sections into one for the FlatList header
    const HomeHeader = () => (
        <>
            <TopHeader />
            <Section title="People You Follow">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContainer}>
                    {followedCreators.map((creator) => (
                        <Pressable key={creator.id} style={styles.creatorCard}><LinearGradient colors={creator.bannerColors} style={styles.creatorBanner} /><View style={styles.creatorMenuIcon}><MenuIcon onPress={() => handleOpenMenu(creator)} /></View><View style={styles.creatorPfpContainer}><Image source={{ uri: creator.profilePicture }} style={styles.creatorPfp} /></View><Text style={styles.creatorName} numberOfLines={1}>{creator.name}</Text>{creator.newPosts > 0 && (<View style={styles.notificationBadge}><Text style={styles.notificationText}>{creator.newPosts}</Text></View>)}</Pressable>
                    ))}
                </ScrollView>
            </Section>
            <Section title="Trending Today">
                {/* This carousel is NOT affected by filters */}
                <FlatList horizontal data={allTrendingPosts} showsHorizontalScrollIndicator={false} pagingEnabled snapToInterval={Dimensions.get('window').width - 60} decelerationRate="fast" contentContainerStyle={styles.trendingListContainer} keyExtractor={(item) => item.id} renderItem={({ item }) => <TrendingCard item={item} onOpenMenu={handleOpenMenu} />} />
            </Section>
            <Section title="Quickies">
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContainer}>
                    {quickies.map((quickie) => (
                        <Pressable key={quickie.id} style={styles.quickieCard}><LinearGradient colors={['#FBC2EB', '#A6C1EE']} style={styles.quickieBorder} /><View style={styles.quickieContent}><View style={styles.quickieOptions}><MenuIcon onPress={() => handleOpenMenu(quickie)} /></View><View><View style={styles.quickiePfp} /><Text style={styles.quickieName}>@username</Text></View></View></Pressable>
                    ))}
                </ScrollView>
            </Section>
            <SortBySection />
            <TagFilters selectedTags={selectedTags} onOpenModal={() => setFilterModalVisible(true)} />
        </>
    );

    const Section = ({ title, children }) => (<View style={styles.sectionContainer}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>);
return (
        <View style={styles.container}>
            <FlatList
                data={filteredTrendingPosts}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={<HomeHeader />}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onCommentPress={() => {}}
                        onMenuPress={() => handleOpenMenu(item)}
                    />
                )}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                contentContainerStyle={{ paddingBottom: 40 }}
            />
            
            <OptionsMenu visible={menuVisible} onClose={handleCloseMenu} />
            <TagFilterModal 
                visible={isFilterModalVisible} 
                onClose={() => setFilterModalVisible(false)}
                selectedTags={selectedTags}
                onApply={handleApplyFilters}
            />
        </View>
    );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    headerContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    appIconContainer: { width: 32, height: 32, backgroundColor: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
    headerTitle: { color: colors.primaryText, fontSize: 22, fontWeight: 'bold' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 12, padding: 12 },
    searchInput: { color: colors.primaryText, marginLeft: 10, flex: 1, fontSize: 16 },
    sortByContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 28 },
    sortByText: { color: colors.secondaryText, fontSize: 14, marginRight: 8 },
    sortButton: { backgroundColor: colors.bubbleBg, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 16 },
    sortButtonText: { color: colors.primaryText, fontSize: 14, fontWeight: '500' },
    sortButtonActive: { backgroundColor: colors.primaryText },
    sortButtonActiveText: { color: colors.bg, fontWeight: 'bold', fontSize: 14 },
    tagFilterContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.cardBorder, marginBottom: 16 },
    tagFilterLabel: { color: colors.secondaryText, fontSize: 14, fontWeight: '500' },
    tagDisplayBubble: { backgroundColor: colors.bubbleBg, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 16, marginRight: 8 },
    tagDisplayBubbleText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
    tagPlaceholder: { color: colors.secondaryText, fontSize: 14, paddingHorizontal: 16 },
    filterSettingsButton: { marginLeft: 'auto', padding: 8, borderRadius: 20, backgroundColor: colors.cardBg },
    trendingListContainer: { paddingLeft: 16, paddingRight: 6 },
    trendingCard: { width: Dimensions.get('window').width - 80, height: 450, borderRadius: 24, marginHorizontal: 10, justifyContent: 'space-between', padding: 20, backgroundColor: colors.cardBg, overflow: 'hidden' },
    trendingCardAuthor: { color: colors.secondaryText, fontSize: 14, fontWeight: '500' },
    trendingCardTitle: { color: colors.primaryText, fontSize: 22, fontWeight: '700', marginTop: 4, lineHeight: 28 },
    trendingActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 24, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 99, paddingHorizontal: 20, paddingVertical: 12 },
    sectionContainer: { marginTop: 28 },
    sectionTitle: { color: colors.primaryText, fontSize: 22, fontWeight: 'bold', marginBottom: 16, paddingHorizontal: 16 },
    horizontalScrollContainer: { paddingHorizontal: 16, gap: 12 },
    creatorCard: { width: 120, height: 160, backgroundColor: colors.cardBg, borderRadius: 20, padding: 8, alignItems: 'center', overflow: 'hidden' },
    creatorBanner: { position: 'absolute', top: 0, left: 0, right: 0, height: '60%' },
    creatorPfpContainer: { marginTop: '45%', width: '100%', justifyContent: 'center', alignItems: 'center' },
    creatorPfp: { width: 50, height: 50, borderRadius: 25, borderWidth: 3, borderColor: colors.cardBg },
    creatorName: { color: colors.primaryText, fontWeight: '600', marginTop: 14, textAlign: 'center' },
    creatorMenuIcon: { position: 'absolute', top: 4, right: 4, zIndex: 1 },
    notificationBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: colors.red, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.cardBg, zIndex: 1 },
    notificationText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    quickieCard: { width: 140, height: 220, borderRadius: 20, padding: 3 },
    quickieBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 20 },
    quickieContent: { flex: 1, backgroundColor: colors.cardBg, borderRadius: 18, justifyContent: 'space-between', padding: 8 },
    quickieOptions: { alignSelf: 'flex-end' },
    quickiePfp: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardBorder, alignSelf: 'center' },
    quickieName: { color: colors.secondaryText, fontSize: 12, fontWeight: '500', textAlign: 'center', marginTop: 8 },
    menuIconWrapper: { padding: 5, borderRadius: 99 },
    // Styles for the new vertical post list
    postCard: { backgroundColor: colors.cardBg, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 16 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    profilePicPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardBorder, marginRight: 12 },
    username: { color: colors.primaryText, fontWeight: '600', fontSize: 16 },
    textContent: { paddingVertical: 4, marginBottom: 12 },
    postTitle: { color: colors.primaryText, fontSize: 18, fontWeight: '700', marginBottom: 8 },
    postSummary: { color: colors.secondaryText, fontSize: 15, lineHeight: 22 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 12 },
    tagBubble: { color: colors.accent, fontSize: 13, fontWeight: '500' },
    cardActions: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
});