import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
} from 'react-native';
import { FontAwesome5, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// --- Constants (No Changes Here) ---
const colors = {
  bg: '#000000',
  primaryText: '#f0f0f0',
  secondaryText: '#a0a0a0',
  cardBg: '#1c1c1e',
  cardBorder: '#3a3a3c',
  bubbleBg: '#2c2c2e',
};

type PostType = {
  id: string;
  username: string;
  hasMedia: boolean;
  title?: string;
  summary?: string;
};

const posts: PostType[] = [
  { id: '1', username: 'CodeNinja', hasMedia: true },
  { id: '2', username: 'DataQueen', hasMedia: true },
  {
    id: '3',
    username: 'AnotherUser',
    hasMedia: false,
    title: 'Project Title: Text-Only Post',
    summary: 'This is an example of how a post without a media preview would look.',
  },
  { id: '4', username: 'ReactDev', hasMedia: true },
];

const topics = ['Python', 'C++', 'ML', 'AI', 'Data Science', 'Web Dev'];


// --- Components (No Changes Here) ---
const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>CodersFlow</Text>
    <View style={styles.headerIcons}>
      <FontAwesome5 name="bell" size={20} color={colors.primaryText} style={{ marginRight: 20 }} />
      <FontAwesome5 name="search" size={20} color={colors.primaryText} />
    </View>
  </View>
);

const TopicFilters = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicFilters}>
      {topics.map((topic, index) => (
        <View key={index} style={styles.topicBubble}>
          <Text style={styles.topicText}>{topic}</Text>
        </View>
      ))}
    </ScrollView>
);

const PostCard = ({ post }: { post: PostType }) => (
  <View style={styles.postCard}>
    <View style={styles.cardHeader}>
      <View style={styles.profilePicPlaceholder} />
      <Text style={styles.username}>{post.username}</Text>
    </View>
    {post.hasMedia ? (
      <View style={styles.mediaPreview}>
        <View style={styles.mediaPreviewImgPlaceholder} />
        <View style={styles.mediaPreviewTextPlaceholder}>
          <View style={styles.line} />
          <View style={styles.line} />
          <View style={[styles.line, { width: '60%' }]} />
        </View>
      </View>
    ) : (
      <View style={styles.textContent}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postSummary}>{post.summary}</Text>
      </View>
    )}
    <View style={styles.cardActions}>
      <View style={styles.actionItem}>
        <FontAwesome5 name="arrow-up" size={16} color={colors.secondaryText} />
        <Text style={styles.actionText}>Upvote</Text>
      </View>
      <View style={styles.actionItem}>
        <FontAwesome name="comment-o" size={16} color={colors.secondaryText} />
        <Text style={styles.actionText}>Discuss</Text>
      </View>
      <View style={styles.actionItem}>
        <FontAwesome name="bookmark-o" size={16} color={colors.secondaryText} />
        <Text style={styles.actionText}>Save</Text>
      </View>
    </View>
  </View>
);


// +++ NEW COMPONENT TO GROUP OUR HEADERS +++
const AppHeader = () => {
    return (
        <View>
            <Header />
            <TopicFilters />
        </View>
    );
};


// === UPDATED MAIN SCREEN COMPONENT ===
export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id}
        // This is the magic prop!
        ListHeaderComponent={<AppHeader />}
        // This makes sure the content starts below the status bar
        contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 16 }}
      />
    </View>
  );
}


// --- Styles (No Changes Here) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    color: colors.primaryText,
    fontSize: 24,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  topicFilters: {
    paddingHorizontal: 1,
    paddingBottom: 16,
  },
  topicBubble: {
    backgroundColor: colors.bubbleBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 12,
  },
  topicText: {
    color: colors.primaryText,
  },
  postCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePicPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 12,
  },
  username: {
    color: colors.primaryText,
    fontWeight: '500',
  },
  mediaPreview: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    height: 120,
    padding: 12,
    flexDirection: 'row',
  },
  mediaPreviewImgPlaceholder: {
    width: '40%',
    height: '100%',
    borderRightWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 12,
  },
  mediaPreviewTextPlaceholder: {
    flex: 1,
  },
  line: {
    height: 10,
    backgroundColor: colors.cardBorder,
    borderRadius: 5,
    marginBottom: 12,
  },
  textContent: {
    paddingVertical: 4,
  },
  postTitle: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  postSummary: {
    color: colors.secondaryText,
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: colors.secondaryText,
    fontSize: 14,
    marginLeft: 8,
  },
});