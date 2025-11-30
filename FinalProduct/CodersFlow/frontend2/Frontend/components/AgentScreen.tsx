import React, { useRef, useState } from 'react';
import { Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, withRepeat, Easing } from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import ViewShot from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import * as FileSystem from 'expo-file-system';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHORTCUT_SIZE = { width: 120, height: 50 };
const STARS_COUNT = 50;

// --- Star Component (Tiny Specks) ---
const Star = ({ index }: { index: number }) => {
  const progress = useSharedValue(0);
  React.useEffect(() => {
    const delay = index * 100;
    setTimeout(() => {
      progress.value = withRepeat(
        withTiming(1, { duration: 10000 + Math.random() * 10000, easing: Easing.linear }),
        -1,
        true
      );
    }, delay);
  }, [index, progress]);
  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [Math.random() * SCREEN_WIDTH - SCREEN_WIDTH / 2, Math.random() * SCREEN_WIDTH - SCREEN_WIDTH / 2]);
    const translateY = interpolate(progress.value, [0, 1], [Math.random() * SCREEN_HEIGHT - SCREEN_HEIGHT / 2, Math.random() * SCREEN_HEIGHT - SCREEN_HEIGHT / 2]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [0.5, 1.2, 0.5]);
    const opacity = interpolate(progress.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    return { opacity, transform: [{ translateX }, { translateY }, { scale }] };
  });
  return <Animated.View style={[styles.star, animatedStyle]} />;
};

// --- Main Agent Screen Component ---
export default function AgentScreen() {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  const agentProgress = useSharedValue(0);
  const stars = React.useMemo(() => Array.from({ length: STARS_COUNT }, (_, i) => i), []);

  // --- Core Logic ---
  const handlePromptSubmit = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) throw new Error('Failed to capture screen.');
      const base64ImageData = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

      setIsPromptExpanded(true);
      agentProgress.value = withTiming(0, { duration: 300 });

      // Send prompt and captured image to backend; backend will call Gemini with server-side key
      const apiUrl = `${API_CONFIG.BASE_URL}/agent/ask`;
      const payload = { prompt: userInput, base64ImageData };

      // Preflight: try a simple GET to the posts feed to verify connectivity from the device
      try {
        console.log('[Agent] Preflight GET to', `${API_CONFIG.BASE_URL}/posts/feed`);
        const pre = await fetch(`${API_CONFIG.BASE_URL}/posts/feed`);
        console.log('[Agent] Preflight status', pre.status);
      } catch (preErr) {
        console.warn('[Agent] Preflight fetch failed:', typeof preErr === 'string' ? preErr : JSON.stringify(preErr));
      }

      console.log('[Agent] POST to', apiUrl, 'payload size bytes', base64ImageData?.length || 0);
      const response = await axios.post(apiUrl, payload, { timeout: 15000 });
      const aiText = response.data.reply;
      setAiResponse(aiText || "Sorry, I couldn't process that.");
    } catch (error: any) {
      console.error('[Agent] Failed to process request:', error);
      // Network Error has no response; log request/stack
      if (!error.response) {
        console.warn('[Agent] Axios network error. Message:', error.message, 'code:', error.code);
        // Quick demo fallback: show a canned reply so the screen remains functional for a presentation
        setAiResponse("Demo reply: (fallback) I couldn't reach the AI backend, so here's a sample response for your presentation. Try again later for a live AI response.");
      } else {
        const detail = error?.response?.data?.detail || error?.response?.data?.message || error?.message;
        setAiResponse(detail || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsPromptExpanded(false);
    agentProgress.value = withTiming(0, { duration: 500 });
    setTimeout(() => {
      setUserInput('');
      setAiResponse('');
    }, 500);
  };

  // --- Gesture & Animation Setup ---
  const gestureHandler = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.translationX < -40) {
      agentProgress.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.exp) });
    }
  };

  const agentContainerStyle = useAnimatedStyle(() => ({
    opacity: agentProgress.value,
    width: interpolate(agentProgress.value, [0, 1], [SHORTCUT_SIZE.width, SCREEN_WIDTH]),
    height: interpolate(agentProgress.value, [0, 1], [SHORTCUT_SIZE.height, SCREEN_HEIGHT]),
    borderRadius: interpolate(agentProgress.value, [0, 1], [SHORTCUT_SIZE.height / 2, 0]),
    borderWidth: interpolate(agentProgress.value, [0, 1], [1, 2]),
    transform: [{ translateX: interpolate(agentProgress.value, [0, 1], [SCREEN_WIDTH / 2 - SHORTCUT_SIZE.width, 0]) }]
  }));

  const promptContainerStyle = useAnimatedStyle(() => {
    const isExpanded = isPromptExpanded;
    return {
      height: withTiming(isExpanded ? SCREEN_HEIGHT : 60),
      width: withTiming(isExpanded ? SCREEN_WIDTH : SCREEN_WIDTH * 0.9),
      borderRadius: withTiming(isExpanded ? 0 : 30),
      bottom: withTiming(isExpanded ? 0 : 40),
      opacity: isExpanded ? 1 : agentProgress.value,
      transform: [{ translateY: interpolate(agentProgress.value, [0, 0.5, 1], [200, 200, 0]) }],
    };
  });

  const closeButtonStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isPromptExpanded || agentProgress.value > 0.5 ? 1 : 0),
    transform: [{ scale: withTiming(isPromptExpanded || agentProgress.value > 0.5 ? 1 : 0.8) }]
  }));

  // **FIX:** Define the shortcut's animated style correctly here
  const shortcutStyle = useAnimatedStyle(() => ({
    opacity: 1 - agentProgress.value,
  }));

  // --- JSX Rendering ---
  return (
    <SafeAreaView style={styles.container}>
      <ViewShot ref={viewShotRef} style={styles.viewShot}>
        <View style={styles.appContent}>
          <Text style={styles.title}>Your App Content</Text>
          <Text style={styles.subtitle}>The AI will analyze what's on this screen.</Text>
        </View>
      </ViewShot>

      {!isPromptExpanded && (
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.shortcut, shortcutStyle]}>
            <View style={styles.shortcutDot} /><View style={styles.shortcutDot} /><View style={styles.shortcutDot} />
          </Animated.View>
        </PanGestureHandler>
      )}

      <Animated.View style={[styles.agentContainer, agentContainerStyle]} pointerEvents="none">
        {stars.map((i) => <Star key={i} index={i} />)}
      </Animated.View>

      {/* Overlay: blur/darken and block touches when AI frame is open */}
      {isPromptExpanded && (
        <Pressable style={styles.overlay} pointerEvents="auto" onPress={() => {}}>
          <BlurView intensity={30} tint="dark" style={styles.overlayBlur} />
        </Pressable>
      )}

      <Animated.View style={[styles.promptContainer, promptContainerStyle]} pointerEvents={isPromptExpanded ? 'auto' : 'none'}>
        {isPromptExpanded ? (
          <View style={styles.resultsContainer}>
            {isLoading ? <ActivityIndicator size="large" color="#FFF" /> : <Text style={styles.responseText}>{aiResponse}</Text>}
          </View>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Ask about the screen..."
            placeholderTextColor="#888"
            value={userInput}
            onChangeText={setUserInput}
            onSubmitEditing={handlePromptSubmit}
            editable={agentProgress.value === 1}
          />
        )}
      </Animated.View>

      <Animated.View style={[styles.closeButtonContainer, closeButtonStyle]} pointerEvents={isPromptExpanded || agentProgress.value > 0.5 ? 'auto' : 'none'}>
        <Pressable onPress={handleClose} hitSlop={20}>
            <Ionicons name="close" size={32} color="white" />
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

// --- StyleSheet ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  viewShot: { flex: 1 },
  appContent: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  subtitle: { fontSize: 16, color: '#555', marginTop: 8 },
  shortcut: { position: 'absolute', top: '50%', right: -20, width: SHORTCUT_SIZE.width, height: SHORTCUT_SIZE.height, backgroundColor: '#1C1C1E', borderRadius: SHORTCUT_SIZE.height / 2, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 6, borderWidth: 1, borderColor: '#333', zIndex: 10 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 15, justifyContent: 'center', alignItems: 'center' },
  overlayBlur: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  shortcutDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'white' },
  agentContainer: { position: 'absolute', top: 0, left: 0, backgroundColor: 'transparent', borderColor: 'white', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', zIndex: 1 },
  star: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'white' },
  promptContainer: { position: 'absolute', alignSelf: 'center', backgroundColor: '#1E1E1E', overflow: 'hidden', zIndex: 5 },
  input: { flex: 1, color: 'white', fontSize: 16, paddingHorizontal: 25 },
  resultsContainer: { flex: 1, paddingTop: 80, paddingHorizontal: 20 },
  responseText: { color: 'white', fontSize: 18, lineHeight: 28 },
  closeButtonContainer: { position: 'absolute', top: 60, left: 20, zIndex: 20 },
});