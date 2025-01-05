import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, Animated } from 'react-native';

const windowWidth = Dimensions.get('window').width;

const EmojiTile = ({ emoji, isVisible, isSelected, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [isSelected]);

  React.useEffect(() => {
    if (!isVisible) {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <Animated.View 
        style={[
          styles.tile,
          { opacity: opacityAnim }
        ]} 
      />
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.tile,
          isSelected && styles.selectedTile,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: windowWidth / 8,
    height: windowWidth / 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedTile: {
    backgroundColor: '#e0e0e0',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  emoji: {
    fontSize: 24,
  },
});

export default EmojiTile; 