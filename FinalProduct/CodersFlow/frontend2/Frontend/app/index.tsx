import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  Dimensions,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  interpolate,
  withRepeat,
  Easing,
  runOnJS,
  useAnimatedKeyboard,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import ViewShot from 'react-native-view-shot';
import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// --- Import Your Screen Components ---
import HomeScreen from '../components/screens/HomeScreen';
import FeedScreen from '../components/screens/FeedScreen';
import ProfileScreen from '../components/screens/ProfileScreen';
import CreatePostScreen from '../components/screens/CreatePostScreen';
import LoginScreen from '../components/screens/LoginScreen';
import RegisterScreen from '../components/screens/RegisterScreen';
// NetworkTest removed from unauthenticated view

// --- Import Services ---
import { authService, User } from '../services/AuthService';
// import { webSocketService } from '../services/WebSocketService'; // Disabled to prevent connection errors

// --- Constants ---
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHORTCUT_SIZE = { width: 70, height: 60 }; // Semicircle shape
const STARS_COUNT = 50;
const PROMPT_CONTAINER_COLLAPSED_BOTTOM = 40;
const KEYBOARD_OFFSET_PX = 5;

// --- Types ---
interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// --- Placeholder Components ---
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholderContainer}><Text style={styles.placeholderText}>{name} Screen</Text></View>
);

const screens = [
  { key: 'home', icon: 'home' as const, component: HomeScreen },
  { key: 'feed', icon: 'stream' as const, component: FeedScreen },
  { key: 'profile', icon: 'user-alt' as const, component: ProfileScreen },
];

// --- Star Component (Slow Drift) ---
const Star = ({ index }: { index: number }) => {
    const progress = useSharedValue(0);
    const path = React.useMemo(() => ({
        startX: Math.random() * SCREEN_WIDTH - SCREEN_WIDTH / 2,
        startY: Math.random() * SCREEN_HEIGHT - SCREEN_HEIGHT / 2,
        endX: Math.random() * SCREEN_WIDTH - SCREEN_WIDTH / 2,
        endY: Math.random() * SCREEN_HEIGHT - SCREEN_HEIGHT / 2,
    }), []);

    React.useEffect(() => {
        const delay = index * 200;
        setTimeout(() => {
            progress.value = withRepeat(
                withTiming(1, { duration: 20000 + Math.random() * 20000, easing: Easing.linear }),
                -1, false
            );
        }, delay);
    }, [index, progress]);

    const animatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(progress.value, [0, 1], [path.startX, path.endX]);
        const translateY = interpolate(progress.value, [0, 1], [path.startY, path.endY]);
        const scale = interpolate(progress.value, [0, 0.1, 0.9, 1], [0.2, 1, 1, 0.2]);
        const opacity = interpolate(progress.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
        return { opacity, transform: [{ translateX }, { translateY }, { scale }] };
    });

    return <Animated.View style={[styles.star, animatedStyle]} />;
};


// --- Main App Component ---
export default function MainApp() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const [isPagerEnabled, setIsPagerEnabled] = useState(true);

  // --- Authentication State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  // --- Modal States ---
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  // --- Chat State ---
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // --- Animation Hooks ---
  const agentProgress = useSharedValue(0);
  const stars = React.useMemo(() => Array.from({ length: STARS_COUNT }, (_, i) => i), []);
  const keyboard = useAnimatedKeyboard();

  // --- Authentication Effects ---
  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    // Log resolved API URL for debugging connectivity issues
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const API_CONFIG = require('../config/api').API_CONFIG;
      console.log('Resolved API_BASE_URL for device:', API_CONFIG.BASE_URL);
      // quick preflight to help diagnose network errors
      fetch(API_CONFIG.BASE_URL + '/posts/feed', { method: 'GET' }).then(res => console.log('Preflight status', res.status)).catch(err => console.warn('Preflight fetch failed', err));
    } catch (err) {
      console.warn('Failed to resolve API_CONFIG for preflight', err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // WebSocket connection disabled to prevent errors
      // Real-time features can be re-enabled later if needed
      console.log('User authenticated, WebSocket disabled');
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user && authService.isAuthenticated()) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userData: User) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleRegisterSuccess = (userData: User) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
      webSocketService.disconnect();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // --- API/Data Handlers ---
  const handlePromptSubmit = async () => {
    if (!userInput.trim()) return;
    const userMessage = userInput;
    
    runOnJS(setUserInput)('');
    runOnJS(setIsChatLoading)(true);
    runOnJS(setIsPromptExpanded)(true);
    agentProgress.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.exp) });

    try {
      const shouldCapture = chatHistory.length === 0;
      let base64ImageData;
      if (shouldCapture) {
        const uri = await viewShotRef.current?.capture?.();
        if (!uri) throw new Error('Failed to capture screen.');
        base64ImageData = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      }
      
      const newUserMessage: Message = { role: 'user', text: userMessage };
      runOnJS(setChatHistory)(h => [...h, newUserMessage]);

      // This URL should point to your secure backend or Cloud Function
      const YOUR_BACKEND_URL = 'YOUR_CLOUD_FUNCTION_OR_SERVER_URL';

      const requestData = {
          text: userMessage,
          base64ImageData: base64ImageData,
      };

      const response = await axios.post(YOUR_BACKEND_URL, requestData);

      const aiText = response.data.candidates[0].content.parts[0].text;
      const aiMessage: Message = { role: 'model', text: aiText || "Sorry, I couldn't process that." };
      
      runOnJS(setChatHistory)(h => [...h, aiMessage]);

    } catch (error) {
      console.error("Failed to process request:", error);
      setChatHistory(h => [...h, { role: 'model', text: "Failed to get response from server." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClose = () => {
    runOnJS(setIsPromptExpanded)(false);
    agentProgress.value = withTiming(0, { duration: 500 });
    setTimeout(() => {
      runOnJS(setUserInput)('');
      runOnJS(setChatHistory)([]);
    }, 500);
  };
  
  React.useEffect(() => {
    if (isPromptExpanded && scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatHistory, isPromptExpanded]);

  // --- Animated Styles ---
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < -40) {
        agentProgress.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.exp) });
      }
    });

  const animatedTextInputProps = useAnimatedProps(() => ({
    editable: agentProgress.value === 1,
  }));

  const agentContainerStyle = useAnimatedStyle(() => ({
    opacity: agentProgress.value,
    width: interpolate(agentProgress.value, [0, 1], [SHORTCUT_SIZE.width, SCREEN_WIDTH]),
    height: interpolate(agentProgress.value, [0, 1], [SHORTCUT_SIZE.height, SCREEN_HEIGHT]),
    borderRadius: interpolate(agentProgress.value, [0, 1], [SHORTCUT_SIZE.height / 2, 0]),
    borderWidth: interpolate(agentProgress.value, [0, 1], [1, 2]),
    transform: [{ translateX: interpolate(agentProgress.value, [0, 1], [SCREEN_WIDTH - SHORTCUT_SIZE.width - 20, 0]) }]
  }));
  
  const animatedBlurOverlayStyle = useAnimatedStyle(() => ({
    opacity: agentProgress.value,
  }));

  const promptContainerStyle = useAnimatedStyle(() => {
    const isExpanded = isPromptExpanded;
    const collapsedY = interpolate(agentProgress.value, [0, 0.5, 1], [200, 200, 0]);
    const collapsedKeyboardLift = (keyboard.height.value > 0 && !isExpanded)
        ? -keyboard.height.value + PROMPT_CONTAINER_COLLAPSED_BOTTOM - KEYBOARD_OFFSET_PX
        : 0;
    const chatLift = isExpanded ? -keyboard.height.value : 0;
    return {
      height: withTiming(isExpanded ? SCREEN_HEIGHT : 60),
      width: withTiming(isExpanded ? SCREEN_WIDTH : SCREEN_WIDTH * 0.9),
      borderRadius: withTiming(isExpanded ? 0 : 30),
      bottom: withTiming(isExpanded ? 0 : PROMPT_CONTAINER_COLLAPSED_BOTTOM),
      opacity: isExpanded ? 1 : agentProgress.value,
      transform: [{ translateY: isExpanded ? chatLift : collapsedY + collapsedKeyboardLift }],
    };
  });

  const closeButtonStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isPromptExpanded || agentProgress.value > 0 ? 1 : 0),
    transform: [{ scale: withTiming(isPromptExpanded || agentProgress.value > 0 ? 1 : 0.8) }]
  }));

  const shortcutStyle = useAnimatedStyle(() => ({
    opacity: 1 - agentProgress.value,
  }));

// --- JSX Rendering ---
  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show authentication screens if not authenticated
    if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        {showRegister ? (
          <RegisterScreen
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </View>
    );
  }

  // Main app content
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
          scrollEnabled={isPagerEnabled}
        >
          {screens.map((screen) => (
            <View key={screen.key} style={{ paddingTop: insets.top, flex: 1 }}>
              <screen.component setPagerEnabled={setIsPagerEnabled} />
            </View>
          ))}
        </PagerView>
      </ViewShot>

      <Animated.View style={[styles.blurOverlay, animatedBlurOverlayStyle]} pointerEvents="none">
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>
      
      {/* --- MODIFIED TAB BAR SECTION --- */}
      <View>
        <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}> 
          {/* Home */}
          <Pressable style={styles.tabItem} onPress={() => pagerRef.current?.setPage(0)}>
            <FontAwesome5 name="home" size={22} color={activeIndex === 0 ? '#FFFFFF' : '#8A8A8E'} />
          </Pressable>
          {/* Feed */}
          <Pressable style={styles.tabItem} onPress={() => pagerRef.current?.setPage(1)}>
            <FontAwesome5 name="stream" size={22} color={activeIndex === 1 ? '#FFFFFF' : '#8A8A8E'} />
          </Pressable>
          {/* Plus (Create) - flush in bar */}
          <Pressable style={styles.tabItem} onPress={() => setCreateModalVisible(true)}>
            <LinearGradient colors={['#0A84FF', '#2A65FF']} style={styles.createButtonTab}>
              <Ionicons name="add" size={28} color="white" />
            </LinearGradient>
          </Pressable>
          {/* Profile */}
          <Pressable style={styles.tabItem} onPress={() => pagerRef.current?.setPage(2)}>
            <FontAwesome5 name="user-alt" size={22} color={activeIndex === 2 ? '#FFFFFF' : '#8A8A8E'} />
          </Pressable>
        </View>
      </View>

      {/* --- AI AGENT UI --- */}
      {!isPromptExpanded && (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.shortcut, shortcutStyle]}>
            <Ionicons name="sparkles-outline" size={24} color="white" />
          </Animated.View>
        </GestureDetector>
      )}

      <Animated.View style={[styles.agentContainer, agentContainerStyle]} pointerEvents="none">
        {stars.map((i) => <Star key={i} index={i} />)}
      </Animated.View>

      <Animated.View style={[styles.promptContainer, promptContainerStyle]}>
        {isPromptExpanded ? (
          <View style={styles.resultsContainer}>
            <ScrollView ref={scrollViewRef} contentContainerStyle={styles.chatScrollContent}>
                {chatHistory.map((message, index) => (
                    <View key={index} style={[styles.messageBubble, message.role === 'user' ? styles.userBubble : styles.modelBubble]}>
                        <Text style={styles.messageText}>{message.role === 'user' ? 'You: ' : 'Gemini: '}{message.text}</Text>
                    </View>
                ))}
                {isChatLoading && (<View style={styles.chatLoadingContainer}><ActivityIndicator size="small" color="#FFF" /><Text style={styles.chatLoadingText}>Thinking...</Text></View>)}
            </ScrollView>
            <View style={styles.chatInputContainer}>
                <TextInput style={styles.chatInput} placeholder="Ask a follow-up question..." placeholderTextColor="#888" value={userInput} onChangeText={setUserInput} onSubmitEditing={handlePromptSubmit} editable={!isChatLoading} />
                <Pressable onPress={handlePromptSubmit} style={styles.sendButton} disabled={isChatLoading || !userInput.trim()}><Ionicons name="send" size={24} color={isChatLoading || !userInput.trim() ? '#666' : '#FFF'} /></Pressable>
            </View>
          </View>
        ) : (
          <AnimatedTextInput style={styles.input} placeholder="Ask about the screen..." placeholderTextColor="#888" value={userInput} onChangeText={setUserInput} onSubmitEditing={handlePromptSubmit} animatedProps={animatedTextInputProps} />
        )}
      </Animated.View>
      
      <Animated.View style={[styles.closeButtonContainer, closeButtonStyle]} pointerEvents={isPromptExpanded || agentProgress.value > 0 ? 'auto' : 'none'}>
        <Pressable onPress={handleClose} hitSlop={20}><Ionicons name="close" size={32} color="white" /></Pressable>
      </Animated.View>

      {/* --- MODALS --- */}
      <Modal visible={isCreateModalVisible} animationType="slide" onRequestClose={() => setCreateModalVisible(false)}>
          <CreatePostScreen navigation={{ goBack: () => setCreateModalVisible(false) }} />
      </Modal>
    </View>
  );
}

// --- Combined StyleSheet (FINAL) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0D0D' },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#EAEAEA', fontSize: 18, marginTop: 16 },
    pagerView: { flex: 1 },
    tabBar: { flexDirection: 'row', backgroundColor: '#1C1C1E', borderTopColor: '#2D2D2F', borderTopWidth: StyleSheet.hairlineWidth, height: 60 },
    tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  createButtonTab: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginVertical: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 3 },
    placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' },
    placeholderText: { color: '#EAEAEA', fontSize: 24, fontWeight: 'bold' },
    shortcut: { position: 'absolute', top: '50%', right: -15, width: SHORTCUT_SIZE.width, height: SHORTCUT_SIZE.height, backgroundColor: '#1C1C1E', borderTopLeftRadius: SHORTCUT_SIZE.height / 2, borderBottomLeftRadius: SHORTCUT_SIZE.height / 2, justifyContent: 'center', alignItems: 'center', paddingLeft: 5, borderWidth: 1, borderColor: '#333', zIndex: 10 },
    agentContainer: { position: 'absolute', top: 0, left: 0, backgroundColor: 'transparent', borderColor: 'white', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', zIndex: 2 },
    star: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'white' },
    blurOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
    promptContainer: { position: 'absolute', alignSelf: 'center', backgroundColor: '#1E1E1E', overflow: 'hidden', zIndex: 5 },
    input: { flex: 1, color: 'white', fontSize: 16, paddingHorizontal: 25 },
    resultsContainer: { flex: 1, paddingTop: 80, paddingHorizontal: 0 },
    chatScrollView: { flex: 1, paddingHorizontal: 15 },
    chatScrollContent: { paddingBottom: 20 },
    messageBubble: { padding: 12, borderRadius: 15, marginVertical: 6, maxWidth: '80%' },
    userBubble: { alignSelf: 'flex-end', backgroundColor: '#0A84FF', borderBottomRightRadius: 2 },
    modelBubble: { alignSelf: 'flex-start', backgroundColor: '#3A3A3C', borderBottomLeftRadius: 2 },
    messageText: { color: 'white', fontSize: 16, lineHeight: 24 },
    chatLoadingContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, alignSelf: 'flex-start' },
    chatLoadingText: { color: '#AAA', marginLeft: 8 },
    chatInputContainer: { flexDirection: 'row', padding: 10, borderTopColor: '#333', borderTopWidth: StyleSheet.hairlineWidth, backgroundColor: '#1E1E1E' },
    chatInput: { flex: 1, backgroundColor: '#2C2C2E', borderRadius: 25, color: 'white', paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, marginRight: 10 },
    sendButton: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
    closeButtonContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, zIndex: 20 },
});