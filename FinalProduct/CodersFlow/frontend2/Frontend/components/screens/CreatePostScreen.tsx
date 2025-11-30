// components/screens/CreatePostScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Image, ScrollView,
  Pressable, KeyboardAvoidingView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { MarkdownToolbar, FormatType } from '../MarkdownToolbar';
import { ApiService } from '../../services/ApiService';
import { postService } from '../../services/PostService';
import { authService } from '../../services/AuthService';
import { API_CONFIG } from '../../config/api';

const colors = {
    bg: '#0D0D0D', primaryText: '#EAEAEA', secondaryText: '#8A8A8E',
    cardBg: '#1C1C1E', cardBorder: '#2D2D2F', accent: '#0A84FF', white: '#FFFFFF',
};

export default function CreatePostScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [bodyText, setBodyText] = useState('');
    const [media, setMedia] = useState<any>(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Test API connection on component mount
    React.useEffect(() => {
        const testConnection = async () => {
            const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
            try {
                console.log('Testing API connection to:', baseUrl);
                
                // Test with a timeout
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Connection timeout')), 5000);
                });
                
                const fetchPromise = fetch(baseUrl);
                const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const text = await response.text();
                console.log('Server response:', text);
                
                if (text.includes('Luniva Backend API Running')) {
                    console.log('API Connection successful');
                } else {
                    throw new Error('Unexpected server response');
                }
            } catch (err) {
                const error = err as Error;
                console.error('API Connection Test Failed:', error);
                if (error.message === 'Connection timeout') {
                    alert('Cannot connect to server:\n1. Check if you are on the same WiFi network\n2. Make sure your server IP (10.41.182.148) is correct\n3. Verify the server is running on port 5000');
                } else {
                    alert(`Server connection error: ${error.message}\nMake sure:\n1. Backend server is running\n2. You are on the same WiFi network\n3. Server URL (${baseUrl}) is correct`);
                }
            }
        };
        testConnection();
    }, []);

    const pickMedia = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return alert('Permission to access photos is required.');
        
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 0.8,
        });

        if (!result.canceled) setMedia(result.assets[0]);
    };

    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
        if (!result.canceled) setMedia(result.assets[0]);
    };

    const removeMedia = () => setMedia(null);

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const uploadFile = async (file: any) => {
        try {
            const formData = new FormData();
            // Get the file extension from the URI and ensure it's lowercase
            const fileExt = file.uri.split('.').pop().toLowerCase();
            const fileName = `upload-${Date.now()}.${fileExt}`;
            
            // Determine the correct mime type
            let mimeType = file.mimeType;
            if (!mimeType) {
                const imageTypes: { [key: string]: string } = {
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'png': 'image/png',
                    'gif': 'image/gif',
                };
                mimeType = imageTypes[fileExt] || 'application/octet-stream';
            }
            
            // Create the file object with the correct URI format
            const fileObj = {
                uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
                type: mimeType,
                name: fileName,
            };
            
            formData.append('file', fileObj as any);

            console.log('Uploading file:', fileObj);
            console.log('File type:', mimeType);

            const response = await postService.uploadFile(formData);
            if (!response || !response.file || !response.file.url) {
                throw new Error('Invalid upload response');
            }
            return response.file.url;
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload media. Please try again.');
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }

        // Allow posts that have either body text or a media attachment.
        // If both are empty but title exists, allow a title-only post as well.

        setIsLoading(true);
        try {
            let mediaUrl = null;
            
            // Upload media if present
            if (media) {
                try {
                    mediaUrl = await uploadFile(media);
                } catch (uploadError) {
                    setIsLoading(false);
                    console.error('Media upload failed:', uploadError);
                    alert('Failed to upload media. Please try again.');
                    return;
                }
            }

            // Create post
            const postData = {
                title: title.trim(),
                summary: bodyText.trim(),
                tags: tags,
                media_url: mediaUrl,
            };

            await postService.createPost(postData);
            
            // Navigate back
            navigation.goBack();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormatText = (type: FormatType) => {
        const { start, end } = selection;
        const selectedText = bodyText.substring(start, end);
        let markdown = '';
        let cursorOffset = 0;

        switch (type) {
            case 'bold': markdown = `**${selectedText}**`; cursorOffset = 2; break;
            case 'italic': markdown = `*${selectedText}*`; cursorOffset = 1; break;
            case 'code': markdown = `\`${selectedText}\``; cursorOffset = 1; break;
            case 'link': markdown = `[${selectedText}](url)`; cursorOffset = 1; break;
            case 'quote': markdown = `\n> `; cursorOffset = 3; break;
            case 'list': markdown = `\n- `; cursorOffset = 3; break;
        }

        const newText = `${bodyText.substring(0, start)}${markdown}${bodyText.substring(end)}`;
        setBodyText(newText);
        // Note: For a more advanced implementation, you'd manage the cursor position after insertion.
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.screenHeader}>
                <Pressable onPress={() => navigation.goBack()}><Ionicons name="close" size={28} color={colors.primaryText} /></Pressable>
                <Text style={styles.headerTitle}>Create Post</Text>
                <Pressable
                  style={[styles.publishButton, isLoading && styles.publishButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                    <Text style={styles.publishButtonText}>
                        {isLoading ? 'Publishing...' : 'Publish'}
                    </Text>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* --- HEADER PART: Title & Media --- */}
                <View style={styles.postHeader}>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Post Title..."
                        placeholderTextColor="#555"
                        value={title}
                        onChangeText={setTitle}
                    />
                    
                    {media ? (
                        <View style={styles.mediaPreviewContainer}>
                            {media.mimeType?.startsWith('image') || media.type === 'image' ? (
                                <>
                                    <Image 
                                        source={{ uri: media.uri }} 
                                        style={styles.imagePreview}
                                        onError={(error) => {
                                            console.error('Image loading error:', error.nativeEvent.error);
                                            console.log('Failed URI:', media.uri);
                                        }}
                                        onLoad={() => console.log('Image loaded successfully:', media.uri)}
                                    />
                                    <View style={styles.imageOverlay}>
                                        <Text style={styles.imageText}>{media.fileName || 'Image'}</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.docPreview}>
                                    <Ionicons name="document-text-outline" size={24} color={colors.primaryText} />
                                    <Text style={styles.docName} numberOfLines={1}>
                                        {media.name || 'Document'}
                                    </Text>
                                </View>
                            )}
                            <Pressable style={styles.removeMediaButton} onPress={removeMedia}>
                                <Ionicons name="close-circle" size={28} color={colors.white} />
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.mediaActions}>
                            <Pressable style={styles.actionButton} onPress={pickMedia}><Ionicons name="image-outline" size={22} color={colors.secondaryText} /><Text style={styles.actionText}>Image/Video</Text></Pressable>
                            <Pressable style={styles.actionButton} onPress={pickDocument}><Ionicons name="document-attach-outline" size={22} color={colors.secondaryText} /><Text style={styles.actionText}>Document</Text></Pressable>
                        </View>
                    )}
                </View>

                {/* --- TAGS SECTION --- */}
                <View style={styles.tagsSection}>
                    <Text style={styles.sectionTitle}>Tags</Text>
                    <View style={styles.tagInputContainer}>
                        <TextInput
                            style={styles.tagInput}
                            placeholder="Add a tag..."
                            placeholderTextColor="#555"
                            value={tagInput}
                            onChangeText={setTagInput}
                            onSubmitEditing={addTag}
                        />
                        <Pressable style={styles.addTagButton} onPress={addTag}>
                            <Ionicons name="add" size={20} color={colors.white} />
                        </Pressable>
                    </View>
                    {tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {tags.map((tag, index) => (
                                <View key={index} style={styles.tagChip}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                    <Pressable onPress={() => removeTag(tag)}>
                                        <Ionicons name="close" size={16} color={colors.secondaryText} />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* --- BODY PART: Markdown Editor --- */}
                <View style={styles.postBody}>
                    <MarkdownToolbar onFormatPress={handleFormatText} />
                    <TextInput
                        style={styles.bodyInput}
                        placeholder="Your content here... (Markdown is supported)"
                        placeholderTextColor="#555"
                        multiline
                        value={bodyText}
                        onChangeText={setBodyText}
                        onSelectionChange={e => setSelection(e.nativeEvent.selection)}
                        textAlignVertical="top"
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    screenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder, paddingTop: Platform.OS === 'ios' ? 50 : 12 },
    headerTitle: { color: colors.primaryText, fontSize: 18, fontWeight: '600' },
    publishButton: { backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    publishButtonDisabled: { opacity: 0.6 },
    publishButtonText: { color: colors.white, fontWeight: 'bold' },
    scrollContent: { paddingBottom: 50 },
    postHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
    titleInput: { color: colors.primaryText, fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    mediaActions: { flexDirection: 'row', gap: 12 },
    actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, gap: 8 },
    actionText: { color: colors.secondaryText, fontSize: 14, fontWeight: '500' },
    mediaPreviewContainer: { 
        marginTop: 10, 
        borderRadius: 12, 
        overflow: 'hidden',
        backgroundColor: colors.cardBg,
    },
    imagePreview: { 
        width: '100%', 
        height: 200, 
        resizeMode: 'cover',
        backgroundColor: colors.cardBg,
    },
    docPreview: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: colors.cardBg, 
        padding: 16, 
        borderRadius: 8 
    },
    docName: { color: colors.primaryText, marginLeft: 12, flex: 1, fontSize: 16 },
    removeMediaButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 14 },
    tagsSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
    sectionTitle: { color: colors.primaryText, fontSize: 18, fontWeight: '600', marginBottom: 12 },
    tagInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    tagInput: { flex: 1, backgroundColor: colors.cardBg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: colors.primaryText, marginRight: 8 },
    addTagButton: { backgroundColor: colors.accent, borderRadius: 8, padding: 10 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tagChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
    tagText: { color: colors.accent, fontSize: 14, fontWeight: '500' },
    postBody: {},
    bodyInput: {
        color: colors.primaryText,
        fontSize: 17,
        lineHeight: 26,
        padding: 16,
        minHeight: 300,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 8,
    },
    imageText: {
        color: colors.white,
        fontSize: 14,
    },
});