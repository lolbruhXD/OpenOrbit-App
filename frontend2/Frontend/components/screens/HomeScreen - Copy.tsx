import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import OptionsMenu from './OptionsMenu';
import { LoggingService } from '../../services/LoggingService';
import AnimatedIconButton from '../AnimatedIconButton';
import TagFilterModal from './TagFilterModal'; // Import the new modal

// --- TYPES ---
interface TrendingPost {
    id: string; author: string; tags: string[];
}
interface FollowedCreator {
    id: string; name: string; newPosts: number; profilePicture: string; bannerColors: string[];
}
interface Quickie {
    id: string;
}
interface MenuIconProps {
    onPress?: () => void;
}

// --- COLORS & MOCK DATA ---
const colors = {
    bg: '#0D0D0D', primaryText: '#EAEAEA', secondaryText: '#8A8A8E',
    cardBg: '#1C1C1E', cardBorder: '#2D2D2F', bubbleBg: '#2C2C2E',
    accent: '#0A84FF', white: '#FFFFFF', black: '#000000', red: '#FF3B30',
    likeRed: '#FF6B6B', commentBlue: '#1DA1F2'
};

const trendingPosts: TrendingPost[] = [
    { id: 'trend-1', author: 'ModernArt', tags: ['digital-art', 'ui-ux', 'design', 'Java'] },
    { id: 'trend-2', author: 'TechGuru', tags: ['coding', 'devops', 'ai', 'Python'] },
    { id: 'trend-3', author: 'TravelVibes', tags: ['photography', 'nature', 'explore', 'CPP'] },
];

const followedCreators: FollowedCreator[] = [
    // Each object represents a creator the user follows.
    {
        id: 'creator-1',
        name: 'NeuralNetNerd',
        newPosts: 3, // Shows the red notification badge
        profilePicture: 'https://placehold.co/100x100/AF52DE/FFFFFF/png?text=NNN',
        bannerColors: ['#AF52DE', '#3A3A3C'] // A purple to dark grey gradient
    },
    {
        id: 'creator-2',
        name: 'PixelPerfect',
        newPosts: 0, // No notification badge
        profilePicture: 'https://placehold.co/100x100/0A84FF/FFFFFF/png?text=PP',
        bannerColors: ['#0A84FF', '#34C759'] // A blue to green gradient
    },
    {
        id: 'creator-3',
        name: 'GodotGamer',
        newPosts: 1,
        profilePicture: 'https://placehold.co/100x100/FF9500/FFFFFF/png?text=GG',
        bannerColors: ['#FF9500', '#FF3B30'] // An orange to red gradient
    },
    {
        id: 'creator-4',
        name: 'KernelPanic',
        newPosts: 5,
        profilePicture: 'https://placehold.co/100x100/34C759/000000/png?text=KP',
        bannerColors: ['#34C759', '#0D0D0D'] // A green to black gradient
    },
    {
        id: 'creator-5',
        name: 'DeployMaster',
        newPosts: 0,
        profilePicture: 'https://placehold.co/100x100/1DA1F2/FFFFFF/png?text=DM',
        bannerColors: ['#1DA1F2', '#EAEAEA'] // A light blue to light grey gradient
    },
];

const quickies: Quickie[] = [{ id: 'quickie-1' }, { id: 'quickie-2' }, { id: 'quickie-3' }];

// --- SUB-COMPONENTS ---
const MenuIcon: React.FC<MenuIconProps> = ({ onPress }) => (
    <Pressable onPress={onPress} hitSlop={20} style={styles.menuIconWrapper}>
        <Ionicons name="ellipsis-horizontal" size={24} color={colors.secondaryText} />
    </Pressable>
);
const AppIcon = () => (<View style={styles.appIconContainer}><FontAwesome5 name="cube" size={20} color={colors.black} /></View>);

// --- SCREEN SECTIONS ---
const HeaderSection = () => (
    <View style={styles.headerContainer}>
        <View style={styles.topHeader}>
            <AppIcon />
            <Text style={styles.headerTitle}>Coders-Flow</Text>
            <FontAwesome5 name="bell" size={24} color={colors.primaryText} />
        </View>
        <View style={styles.searchBar}>
            <FontAwesome5 name="search" size={18} color={colors.secondaryText} />
            <TextInput placeholder="Search Creators & Content" placeholderTextColor={colors.secondaryText} style={styles.searchInput} />
        </View>
        <View style={styles.sortByContainer}>
            <Text style={styles.sortByText}>Sort by</Text>
            <View style={[styles.sortButton, styles.sortButtonActive]}><Text style={styles.sortButtonActiveText}>Today</Text></View>
            <View style={styles.sortButton}><Text style={styles.sortButtonText}>Month</Text></View>
            <View style={styles.sortButton}><Text style={styles.sortButtonText}>Year</Text></View>
            <View style={styles.sortButton}><Text style={styles.sortButtonText}>All-Time</Text></View>
        </View>
    </View>
);

const TagFilters = ({ selectedTags, onOpenModal }) => (
    <View style={styles.tagFilterContainer}>
        <Text style={styles.tagFilterLabel}>Filter by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            {selectedTags.length > 0 ? (
                selectedTags.map(tag => (
                    <View key={tag} style={styles.tagBubble}>
                        <Text style={styles.tagBubbleText}>{tag}</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.tagPlaceholder}>All Posts</Text>
            )}
        </ScrollView>
        <Pressable onPress={onOpenModal} style={styles.filterSettingsButton}>
            <Ionicons name="options" size={24} color={colors.primaryText} />
        </Pressable>
    </View>
);

const TrendingCard = ({ item, onOpenMenu }: { item: TrendingPost, onOpenMenu: (post: TrendingPost) => void }) => {
    return (
        <Pressable onPress={() => LoggingService.logEvent('view_trending_post', { id: item.id, username: item.author }, { tags: item.tags })}>
            <View style={styles.trendingCard}>
                <LinearGradient colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
                <View>
                    <Text style={styles.trendingCardAuthor}>@{item.author}</Text>
                    <Text style={styles.trendingCardTitle}>Exploring the Depths of Modern Design</Text>
                </View>
                <View style={styles.trendingActions}>
                    <AnimatedIconButton initialIcon="heart-outline" filledIcon="heart" initialColor={colors.primaryText} filledColor={colors.likeRed} onPress={() => LoggingService.logEvent('like_post', { id: item.id, username: item.author })} />
                    <AnimatedIconButton initialIcon="chatbubble-outline" filledIcon="chatbubble" initialColor={colors.primaryText} filledColor={colors.commentBlue} onPress={() => LoggingService.logEvent('comment_on_post', { id: item.id, username: item.author })} />
                    <AnimatedIconButton initialIcon="bookmark-outline" filledIcon="bookmark" initialColor={colors.primaryText} filledColor={colors.white} onPress={() => LoggingService.logEvent('bookmark_post', { id: item.id, username: item.author })} />
                    <View style={{ marginLeft: 'auto' }}><MenuIcon onPress={() => onOpenMenu(item)} /></View>
                </View>
            </View>
        </Pressable>
    );
};

const TrendingSection = ({ posts, onOpenMenu }: { posts: TrendingPost[], onOpenMenu: (post: TrendingPost) => void }) => (
    <View>
        <FlatList
            horizontal
            data={posts}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={Dimensions.get('window').width - 60}
            decelerationRate="fast"
            contentContainerStyle={styles.trendingListContainer}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TrendingCard item={item} onOpenMenu={onOpenMenu} />}
        />
    </View>
);

const FollowedCreatorsSection = ({ onOpenMenu }: { onOpenMenu: (creator: FollowedCreator) => void }) => (
    <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>People You Follow</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContainer}>
            {followedCreators.map((creator) => (
                <Pressable key={creator.id} style={styles.creatorCard} onPress={() => LoggingService.logEvent('view_followed_creator', { id: creator.id, username: creator.name })}>
                    <LinearGradient colors={creator.bannerColors} style={styles.creatorBanner} />
                    <View style={styles.creatorMenuIcon}><MenuIcon onPress={() => onOpenMenu(creator)} /></View>
                    <View style={styles.creatorPfpContainer}><Image source={{ uri: creator.profilePicture }} style={styles.creatorPfp} placeholder={colors.cardBorder} transition={300} /></View>
                    <Text style={styles.creatorName} numberOfLines={1}>{creator.name}</Text>
                    {creator.newPosts > 0 && (<View style={styles.notificationBadge}><Text style={styles.notificationText}>{creator.newPosts}</Text></View>)}
                </Pressable>
            ))}
        </ScrollView>
    </View>
);

const QuickiesSection = ({ onOpenMenu }: { onOpenMenu: (quickie: Quickie) => void }) => (
    <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quickies</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContainer}>
            {quickies.map((quickie) => (
                <Pressable key={quickie.id} style={styles.quickieCard} onPress={() => LoggingService.logEvent('view_quickie', { id: quickie.id, username: 'quickie_user' })}>
                    <LinearGradient colors={['#FBC2EB', '#A6C1EE']} style={styles.quickieBorder} />
                    <View style={styles.quickieContent}><View style={styles.quickieOptions}><MenuIcon onPress={() => onOpenMenu(quickie)} /></View><View><View style={styles.quickiePfp} /><Text style={styles.quickieName}>@username</Text></View></View>
                </Pressable>
            ))}
        </ScrollView>
    </View>
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
            const filtered = allTrendingPosts.filter(post => 
                post.tags.some(tag => selectedTags.includes(tag))
            );
            setFilteredTrendingPosts(filtered);
        }
    }, [selectedTags, allTrendingPosts]);
    
    const handleApplyFilters = (tags: string[]) => {
        setSelectedTags(tags);
        setFilterModalVisible(false);
    };

    const handleOpenMenu = (item: { id: string, author?: string, name?: string }) => {
        const username = item.author || item.name || 'unknown_user';
        LoggingService.logEvent('open_options_menu', { id: item.id, username });
        setMenuVisible(true);
        setPagerEnabled(false);
    };
    const handleCloseMenu = () => {
        setMenuVisible(false);
        setPagerEnabled(true);
    };
return (
        <View style={styles.container}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                <HeaderSection />
                <TagFilters selectedTags={selectedTags} onOpenModal={() => setFilterModalVisible(true)} />
                
                {/* Sections are now reordered and TrendingSection receives filtered data */}
                <FollowedCreatorsSection onOpenMenu={handleOpenMenu} />
                <TrendingSection posts={filteredTrendingPosts} onOpenMenu={handleOpenMenu} />
                
                <QuickiesSection onOpenMenu={handleOpenMenu} />
                <View style={{ height: 50 }} />
            </ScrollView>

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
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    appIconContainer: { width: 32, height: 32, backgroundColor: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
    headerTitle: {
        color: colors.primaryText,
        fontSize: 22,
        fontWeight: 'bold',
    },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 12, padding: 12, marginBottom: 20 },
    searchInput: { color: colors.primaryText, marginLeft: 10, flex: 1, fontSize: 16 },
    sortByContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sortByText: { color: colors.secondaryText, fontSize: 14, marginRight: 8 },
    sortButton: { backgroundColor: colors.bubbleBg, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 16 },
    sortButtonText: { color: colors.primaryText, fontSize: 14, fontWeight: '500' },
    sortButtonActive: { backgroundColor: colors.primaryText },
    sortButtonActiveText: { color: colors.bg, fontWeight: 'bold', fontSize: 14 },
    tagFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    tagFilterLabel: {
        color: colors.secondaryText,
        fontSize: 14,
        fontWeight: '500',
    },
    tagBubble: {
        backgroundColor: colors.bubbleBg,
        borderRadius: 18,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 8,
    },
    tagBubbleText: {
        color: colors.accent,
        fontSize: 14,
        fontWeight: '600',
    },
    tagPlaceholder: {
        color: colors.secondaryText,
        fontSize: 14,
        paddingHorizontal: 16,
    },
    filterSettingsButton: {
        marginLeft: 'auto',
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.cardBg,
    },
    trendingListContainer: { paddingHorizontal: 16 },
    trendingCard: { width: Dimensions.get('window').width - 80, height: 450, borderRadius: 24, marginHorizontal: 10, justifyContent: 'space-between', padding: 20, backgroundColor: colors.cardBg, overflow: 'hidden' },
    trendingCardAuthor: { color: colors.secondaryText, fontSize: 14, fontWeight: '500' },
    trendingCardTitle: { color: colors.primaryText, fontSize: 22, fontWeight: '700', marginTop: 4, lineHeight: 28 },
    trendingActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 24,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 99,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
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
});