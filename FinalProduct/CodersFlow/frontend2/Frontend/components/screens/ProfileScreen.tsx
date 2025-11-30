import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

// --- COLOR PALETTE AND MOCK DATA ---
const colors = {
    bg: '#0D0D0D', primaryText: '#EAEAEA', secondaryText: '#8A8A8E',
    cardBg: '#1C1C1E', cardBorder: '#2D2D2F', bubbleBg: '#2C2C2E',
    accent: '#0A84FF', green: '#34C759', orange: '#FF9500', purple: '#AF52DE',
};

const userProfile = {
    profilePicture: 'https://via.placeholder.com/150',
    displayName: 'CodeNinja',
    bio: 'Passionate about AI & Open Source',
  codingPlatforms: [
    // Retains its unique brand color
    { platform: 'LeetCode', username: 'codeninja_lc', solved: 350, rating: 1980, icon: 'keyboard-o' as const, lib: FontAwesome, color: colors.orange },
    
    // Uses the default primary text color (black)
    { platform: 'GitHub', username: 'codeninja-dev', solved: '1.2k Contributions', rating: null, icon: 'github' as const, lib: FontAwesome5, color: colors.primaryText },

    // Retains its unique brand color
    { platform: 'HackerRank', username: 'codeninja_hr', solved: 420, rating: '5 Stars', icon: 'hackerrank' as const, lib: FontAwesome5, color: colors.green },
    
    // The rest are now set to the default primary text color
    { platform: 'CodeChef', username: 'codeninja_chef', solved: 280, rating: 2055, icon: 'code' as const, lib: FontAwesome, color: colors.primaryText },
    { platform: 'Codeforces', username: 'codeninja_cf', solved: 610, rating: 1950, icon: 'trophy' as const, lib: FontAwesome, color: colors.primaryText },
    { platform: 'HackerEarth', username: 'codeninja_he', solved: 195, rating: 1850, icon: 'globe' as const, lib: FontAwesome, color: colors.primaryText },
    { platform: 'GeeksforGeeks', username: 'codeninja_gfg', solved: 550, rating: 2300, icon: 'brain' as const, lib: FontAwesome5, color: colors.primaryText },
    { platform: 'ResearchGate', username: 'codeninja.phd', solved: '15 Publications', rating: '25.4 RG Score', icon: 'book' as const, lib: FontAwesome, color: colors.primaryText }
],
    pinnedPosts: [
    { id: '1', title: 'Building a Neural Network from Scratch', upvotes: 350, comments: 45 },
    { id: '2', title: 'A Novel Approach to Encrypted Data Storage', upvotes: 480, comments: 62 },
    { id: '3', title: 'Visualizing Climate Change: A D3.js Project', upvotes: 590, comments: 88 },
    { id: '4', title: 'My Open-Source Rust Project for WebAssembly', upvotes: 410, comments: 51 },
    { id: '5', title: 'Research Paper: The Impact of AI on Algorithmic Trading', upvotes: 325, comments: 76 },
    { id: '6', title: 'Creating a Real-time Chat App with Node.js and Socket.IO', upvotes: 520, comments: 102 }
],
    skills: ['React Native', 'TypeScript', 'Python', 'AI/ML', 'Cloud Computing', 'GAN', 'Firebase', 'Supabase','Android App Development', 'Web Development', 'HTML','CSS','JavaScript'],
    // ADDED: New data for the Job Experience section
    jobExperience: [
        { id: 'job-1', company: 'Google', role: 'Software Engineer Intern', duration: 'Jun 2025 - Aug 2025', icon: 'google' as const },
        { id: 'job-2', company: 'Microsoft', role: 'AI Research Intern', duration: 'Jan 2025 - Mar 2025', icon: 'microsoft' as const },
    ],
    certifications: [
        { id: 'cert-1', platform: 'AWS', title: 'Certified Cloud Practitioner', date: 'Issued Oct 2025', icon: 'aws' as const },
        { id: 'cert-2', platform: 'Google Cloud', title: 'Associate Cloud Engineer', date: 'Issued Jun 2025', icon: 'google' as const },
        { id: 'cert-3', platform: 'Microsoft Azure', title: 'AZ-900 Fundamentals', date: 'Issued Feb 2025', icon: 'microsoft' as const },
    ],
    socials: [
    { platform: 'GitHub', icon: 'github' as const, url: '#' },
    { platform: 'Linkedin', icon: 'linkedin' as const, url: '#' },
    { platform: 'Twitter', icon: 'twitter' as const, url: '#' },
    { platform: 'Portfolio', icon: 'globe' as const, url: '#' },
    { platform: 'YouTube', icon: 'youtube' as const, url: '#' },
    { platform: 'Medium', icon: 'medium' as const, url: '#' },
    { platform: 'ResearchGate', icon: 'researchgate' as const, url: '#' },
    { platform: 'Dribbble', icon: 'dribbble' as const, url: '#' }
],
};


// --- REUSABLE SUB-COMPONENTS ---
const ProfileHeader = ({ onLogout }) => (
    <LinearGradient colors={['#2A2A2E', colors.bg]} style={styles.header}>
        <Image source={{ uri: userProfile.profilePicture }} style={styles.profilePicture} />
        <Text style={styles.displayName}>{userProfile.displayName}</Text>
        <Text style={styles.bio}>{userProfile.bio}</Text>
        <View style={styles.headerActions}>
            <Pressable style={[styles.actionButton, { backgroundColor: colors.accent }]}>
                <Text style={styles.actionButtonText}>Follow</Text>
            </Pressable>
            <Pressable style={styles.actionButton}>
                <Ionicons name="mail" size={20} color={colors.primaryText} />
            </Pressable>
            <Pressable style={[styles.actionButton, { backgroundColor: colors.red }]} onPress={onLogout}>
                <Text style={[styles.actionButtonText, { color: '#fff' }]}>Logout</Text>
            </Pressable>
        </View>
    </LinearGradient>
);

const StatsCard = ({ platform, username, solved, rating, icon, lib: IconLib, color }) => (
    <View style={styles.statCard}>
        <View style={styles.statCardHeader}>
            <IconLib name={icon} size={20} color={color} />
            <Text style={[styles.platformName, { color }]}>{platform}</Text>
        </View>
        <Text style={styles.statUsername}>@{username}</Text>
        <View style={styles.statRow}><Text style={styles.statValue}>{solved}</Text>{rating && <Text style={styles.statLabel}>Problems Solved</Text>}</View>
        {rating && <View style={styles.statRow}><Text style={styles.statValue}>{rating}</Text><Text style={styles.statLabel}>Rating</Text></View>}
    </View>
);
const PinnedPostCard = ({ title, upvotes, comments }) => (
    <View style={styles.pinnedPostCard}><Text style={styles.pinnedPostTitle} numberOfLines={2}>{title}</Text><View style={styles.pinnedPostStats}><View style={styles.pinnedPostStatItem}><Ionicons name="arrow-up" size={16} color={colors.green} /><Text style={styles.pinnedPostStatText}>{upvotes}</Text></View><View style={styles.pinnedPostStatItem}><Ionicons name="chatbubble-ellipses" size={16} color={colors.accent} /><Text style={styles.pinnedPostStatText}>{comments}</Text></View></View></View>
);
const Section = ({ title, children }) => (<View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>);
const CertificationCard = ({ platform, title, date, icon }) => (
    <View style={styles.certificationCard}>
        <View style={styles.certificationHeader}><FontAwesome5 name={icon} size={20} color={colors.secondaryText} /><Text style={styles.certificationPlatform}>{platform}</Text></View>
        <Text style={styles.certificationTitle}>{title}</Text>
        <Text style={styles.certificationDate}>{date}</Text>
    </View>
);

// ADDED: New component for rendering job experience cards
const ExperienceCard = ({ company, role, duration, icon }) => (
    <View style={styles.experienceCard}>
        <FontAwesome5 name={icon} size={28} color={colors.primaryText} style={styles.experienceIcon} />
        <View style={styles.experienceDetails}>
            <Text style={styles.experienceRole}>{role}</Text>
            <Text style={styles.experienceCompany}>{company}</Text>
            <Text style={styles.experienceDuration}>{duration}</Text>
        </View>
    </View>
);


// --- SCENE COMPONENTS ---
const ProfileDetailsScene = ({ scrollY }) => (
    <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 250 + 48 }} // Header height + TabBar height
        onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
    >
        <Section title="Stats & Achievements"><View style={styles.statsGrid}>{userProfile.codingPlatforms.map(p => <StatsCard key={p.platform} {...p} />)}</View></Section>
        <Section title="Pinned Projects">{userProfile.pinnedPosts.map(p => <PinnedPostCard key={p.id} {...p} />)}</Section>
        
        {/* ADDED: New Job Experience section */}
        <Section title="Job Experience">
            {userProfile.jobExperience.map(job => (
                <ExperienceCard key={job.id} {...job} />
            ))}
        </Section>
        
        <Section title="Certifications">{userProfile.certifications.map(cert => <CertificationCard key={cert.id} {...cert} />)}</Section>
        <Section title="Skills"><View style={styles.skillsGrid}>{userProfile.skills.map(s => (<View key={s} style={styles.skillBadge}><Text style={styles.skillText}>{s}</Text></View>))}</View></Section>
        <Section title="Connect"><View style={styles.socialsContainer}>{userProfile.socials.map(social => (<Pressable key={social.platform} style={styles.socialIcon}><FontAwesome5 name={social.icon} size={24} color={colors.secondaryText} /></Pressable>))}</View></Section>
    </Animated.ScrollView>
);

const UserPostsScene = () => (<View style={[styles.sceneContainer, { alignItems: 'center', paddingTop: 40 }]}><Text style={styles.bio}>User Posts Appear Here</Text></View>);
const UserCommentsScene = () => (<View style={[styles.sceneContainer, { alignItems: 'center', paddingTop: 40 }]}><Text style={styles.bio}>User Comments Appear Here</Text></View>);


// --- MAIN PROFILE SCREEN COMPONENT ---
import { authService } from '../../services/AuthService';
import { router } from 'expo-router';

export default function ProfileScreen() {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'profile', title: 'Profile' },
        { key: 'posts', title: 'Posts' },
        { key: 'comments', title: 'Comments' },
    ]);
    
    const scrollY = useRef(new Animated.Value(0)).current;

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'profile': return <ProfileDetailsScene scrollY={scrollY} />;
            case 'posts': return <UserPostsScene />;
            case 'comments': return <UserCommentsScene />;
            default: return null;
        }
    };
    
    const HEADER_HEIGHT = 250;
    const tabBarY = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT], outputRange: [HEADER_HEIGHT, 0], extrapolate: 'clamp',
    });
    
    const renderTabBar = (props) => (
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, transform: [{ translateY: tabBarY }] }}>
            <TabBar {...props} indicatorStyle={{ backgroundColor: colors.accent }} style={{ backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }} labelStyle={{ color: colors.primaryText, fontWeight: '600' }} />
        </Animated.View>
    );

    const handleLogout = async () => {
        await authService.logout();
        // Replace to app root so top-level index.tsx will re-run auth check and show login
        router.replace('/');
    };
    return (
        <View style={styles.container}>
            <TabView navigationState={{ index, routes }} renderScene={renderScene} onIndexChange={setIndex} initialLayout={{ width: layout.width }} renderTabBar={renderTabBar} />
            <Animated.View style={[styles.headerAbsolute, { transform: [{ translateY: scrollY.interpolate({ inputRange: [0, HEADER_HEIGHT], outputRange: [0, -HEADER_HEIGHT], extrapolate: 'clamp' }) }] }]}>
                <ProfileHeader onLogout={handleLogout} />
            </Animated.View>
        </View>
    );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { alignItems: 'center', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, height: 250 },
    headerAbsolute: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 },
    profilePicture: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: colors.primaryText, marginBottom: 10 },
    displayName: { fontSize: 24, fontWeight: 'bold', color: colors.primaryText },
    bio: { fontSize: 15, color: colors.secondaryText, marginTop: 4, textAlign: 'center' },
    headerActions: { flexDirection: 'row', gap: 12, marginVertical: 12 },
    actionButton: { backgroundColor: colors.bubbleBg, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    actionButtonText: { color: colors.primaryText, fontWeight: '600', fontSize: 16 },
    sceneContainer: { flex: 1, paddingHorizontal: 16 },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: colors.primaryText, marginBottom: 16, paddingTop: 16 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { backgroundColor: colors.cardBg, borderRadius: 12, padding: 16, flexGrow: 1, minWidth: 150 },
    statCardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
    platformName: { marginLeft: 8, fontSize: 16, fontWeight: 'bold' },
    statUsername: { color: colors.secondaryText, fontSize: 14, marginBottom: 12 },
    statRow: { flexDirection: 'row', alignItems: 'baseline' },
    statValue: { color: colors.primaryText, fontSize: 20, fontWeight: 'bold', marginRight: 6 },
    statLabel: { color: colors.secondaryText, fontSize: 12 },
    pinnedPostCard: { backgroundColor: colors.cardBg, borderRadius: 12, padding: 16, marginBottom: 12 },
    pinnedPostTitle: { color: colors.primaryText, fontSize: 16, fontWeight: '600', marginBottom: 12 },
    pinnedPostStats: { flexDirection: 'row', gap: 20 },
    pinnedPostStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    pinnedPostStatText: { color: colors.secondaryText, fontSize: 14 },
    // ADDED: Styles for the new Job Experience section
    experienceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    experienceIcon: {
        marginRight: 16,
    },
    experienceDetails: {
        flex: 1,
    },
    experienceRole: {
        color: colors.primaryText,
        fontSize: 16,
        fontWeight: 'bold',
    },
    experienceCompany: {
        color: colors.secondaryText,
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
    },
    experienceDuration: {
        color: colors.secondaryText,
        fontSize: 12,
        marginTop: 4,
    },
    certificationCard: { backgroundColor: colors.cardBg, borderRadius: 12, padding: 16, marginBottom: 12 },
    certificationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    certificationPlatform: { color: colors.secondaryText, fontSize: 14, fontWeight: '600', marginLeft: 10 },
    certificationTitle: { color: colors.primaryText, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    certificationDate: { color: colors.secondaryText, fontSize: 12 },
    skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    skillBadge: { backgroundColor: colors.bubbleBg, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
    skillText: { color: colors.primaryText, fontSize: 14, fontWeight: '500' },
    socialsContainer: { flexDirection: 'row', gap: 24, backgroundColor: colors.cardBg, borderRadius: 12, padding: 20, justifyContent: 'center' },
    socialIcon: {},
});