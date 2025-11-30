import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

// Create an animated version of the icon component for performance
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

// Define the component's props for strong typing
interface AnimatedIconButtonProps {
  initialIcon: keyof typeof Ionicons.glyphMap;
  filledIcon: keyof typeof Ionicons.glyphMap;
  initialColor: string;
  filledColor: string;
  onPress?: () => void; // Optional callback for logging or other actions
}

const AnimatedIconButton = ({
  initialIcon,
  filledIcon,
  initialColor,
  filledColor,
  onPress,
}: AnimatedIconButtonProps) => {
  const [isActive, setIsActive] = useState(false);

  // Shared value for the state transition (color/icon change)
  const progress = useSharedValue(0);
  
  // Shared value for the interaction bounce effect
  const scale = useSharedValue(1);

  // Animated style that reacts to changes in both shared values
  const animatedStyle = useAnimatedStyle(() => {
    // Smoothly interpolate the color based on the active state
    const color = interpolateColor(
      progress.value,
      [0, 1],
      [initialColor, filledColor]
    );

    return {
      transform: [{ scale: scale.value }], // Apply the bounce effect
      color: color, // Apply the color transition
    };
  });

  const handlePress = () => {
    // 1. Execute the callback function passed from the parent (for logging, etc.)
    if (onPress) {
      onPress();
    }

    // 2. Toggle the component's internal active state
    const newState = !isActive;
    setIsActive(newState);

    // 3. Animate the state change (color) with a spring for a natural feel
    progress.value = withSpring(newState ? 1 : 0);

    // 4. Trigger the bouncy "pop" animation on every single press
    scale.value = withSequence(
      withTiming(1.3, { duration: 100 }), // Pop out quickly
      withSpring(1) // Spring back to normal size
    );
  };

  return (
    <Pressable onPress={handlePress}>
      <AnimatedIcon
        name={isActive ? filledIcon : initialIcon}
        size={30}
        style={animatedStyle}
      />
    </Pressable>
  );
};

export default AnimatedIconButton;