// Create a new file, e.g., components/TagFilterModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Use the same color palette
const colors = {
    bg: '#0D0D0D', primaryText: '#EAEAEA', secondaryText: '#8A8A8E',
    cardBg: '#1C1C1E', cardBorder: '#2D2D2F', bubbleBg: '#2C2C2E', accent: '#0A84FF',
};

// Mock list of all available tags
const ALL_TAGS = ['Python', 'CPP', 'Java', 'JavaScript', 'TypeScript', 'AI', 'ML', 'Data Science', 'Web Dev', 'Mobile Dev', 'UI-UX', 'Design', 'DevOps', 'Rust', 'Go'];

export default function TagFilterModal({ visible, onClose, selectedTags, onApply }) {
  const [localSelectedTags, setLocalSelectedTags] = useState(new Set(selectedTags));
  const [searchQuery, setSearchQuery] = useState('');

  const handleTagPress = (tag) => {
    const newSelection = new Set(localSelectedTags);
    if (newSelection.has(tag)) {
      newSelection.delete(tag);
    } else {
      newSelection.add(tag);
    }
    setLocalSelectedTags(newSelection);
  };

  const filteredTags = ALL_TAGS.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter by Tags</Text>
            <Pressable onPress={onClose}><Ionicons name="close" size={28} color={colors.primaryText} /></Pressable>
        </View>
        <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.secondaryText} />
            <TextInput 
                style={styles.searchInput}
                placeholder="Search tags..."
                placeholderTextColor={colors.secondaryText}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
        <ScrollView contentContainerStyle={styles.tagList}>
            {filteredTags.map(tag => {
                const isSelected = localSelectedTags.has(tag);
                return (
                    <Pressable key={tag} style={styles.tagItem} onPress={() => handleTagPress(tag)}>
                        <Ionicons name={isSelected ? "checkbox" : "square-outline"} size={24} color={isSelected ? colors.accent : colors.secondaryText} />
                        <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{tag}</Text>
                    </Pressable>
                )
            })}
        </ScrollView>
        <Pressable style={styles.applyButton} onPress={() => onApply(Array.from(localSelectedTags))}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

// Add styles for the modal...
const styles = StyleSheet.create({
    modalContainer: { flex: 1, backgroundColor: colors.bg, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
    headerTitle: { color: colors.primaryText, fontSize: 20, fontWeight: 'bold' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 12, padding: 12, margin: 16 },
    searchInput: { color: colors.primaryText, marginLeft: 10, flex: 1, fontSize: 16 },
    tagList: { paddingHorizontal: 16 },
    tagItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    tagText: { color: colors.secondaryText, fontSize: 18, marginLeft: 16 },
    tagTextSelected: { color: colors.accent, fontWeight: '600' },
    applyButton: { backgroundColor: colors.accent, padding: 16, margin: 16, borderRadius: 12, alignItems: 'center' },
    applyButtonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});