import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';

// --- COLOR PALETTE ---
const colors = {
  primaryText: '#EAEAEA',
  secondaryText: '#8A8A8E',
  cardBg: '#1C1C1E',
  cardBorder: '#2D2D2F',
  red: '#FF3B30',
};

// --- PROPS INTERFACE ---
interface OptionsMenuProps {
    visible: boolean;
    onClose: () => void;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const menuItems = ['Interested','Not interested', 'Mute User', 'Report', 'Details', 'Share','Unfollow'];

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        <Animated.View style={[styles.menuContainer, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.handleBar} />
            {menuItems.map((item) => (
            <Pressable
                key={item}
                style={({ pressed }) => [styles.menuItem, { backgroundColor: pressed ? colors.cardBorder : 'transparent' }]}
                onPress={() => {
                    console.log(`Pressed: ${item}`);
                    onClose();
                }}
            >
                <Text style={styles.menuItemText}>{item}</Text>
            </Pressable>
            ))}
            <Pressable
                style={({ pressed }) => [styles.menuItem, styles.cancelMenuItem, { backgroundColor: pressed ? colors.cardBorder : 'transparent' }]}
                onPress={onClose}
            >
                <Text style={[styles.menuItemText, { color: colors.red, fontWeight: '600' }]}>Cancel</Text>
            </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default OptionsMenu;

// --- STYLESHEET ---
const styles = StyleSheet.create({
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
      },
      menuContainer: {
        backgroundColor: colors.cardBg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40, // Safe area for home indicator
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 20,
      },
      handleBar: {
          width: 40,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: colors.cardBorder,
          marginVertical: 10,
      },
      menuItem: {
        paddingVertical: 16,
        width: '100%',
        alignItems: 'center',
      },
      cancelMenuItem: {
          borderTopWidth: 1,
          borderTopColor: colors.cardBorder,
          marginTop: 8,
      },
      menuItemText: {
        color: colors.primaryText,
        fontSize: 18,
      },
});