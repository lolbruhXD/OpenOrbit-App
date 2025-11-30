// components/MarkdownToolbar.tsx
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
    cardBg: '#1C1C1E',
    secondaryText: '#8A8A8E',
    cardBorder: '#2D2D2F',
};

export type FormatType = 'bold' | 'italic' | 'code' | 'link' | 'list' | 'quote';

const toolbarButtons: { format: FormatType; icon: keyof typeof Ionicons.glyphMap }[] = [
    { format: 'bold', icon: 'text' },
    { format: 'italic', icon: 'text-outline' },
    { format: 'code', icon: 'code-slash' },
    { format: 'link', icon: 'link' },
    { format: 'list', icon: 'list' },
    { format: 'quote', icon: 'chatbox-ellipses-outline' },
];

export const MarkdownToolbar = ({ onFormatPress }: { onFormatPress: (type: FormatType) => void }) => {
    return (
        <View style={styles.toolbar}>
            {toolbarButtons.map(({ format, icon }) => (
                <Pressable key={format} onPress={() => onFormatPress(format)} style={styles.button}>
                    <Ionicons name={icon} size={22} color={colors.secondaryText} />
                </Pressable>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    toolbar: {
        flexDirection: 'row',
        backgroundColor: colors.cardBg,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.cardBorder,
    },
    button: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
});